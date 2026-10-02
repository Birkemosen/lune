#include "lv6_dashboard.h"
#include "../lv6_config_store/group_model.h"
#include "../lv6_zone_controller/thermal_model.h"
#include "esphome/core/log.h"

#include <algorithm>
#include <cstdarg>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <ctime>

namespace esphome {
namespace lv6_dashboard {

namespace {

static const char *const PHYS_TAG = "lv6_physics_api";

bool appendf_phys(char *buffer, size_t capacity, size_t &offset, const char *fmt, ...) {
  if (offset >= capacity)
    return false;
  va_list args;
  va_start(args, fmt);
  const int written = vsnprintf(buffer + offset, capacity - offset, fmt, args);
  va_end(args);
  if (written < 0)
    return false;
  if (static_cast<size_t>(written) >= capacity - offset) {
    offset = capacity;
    return false;
  }
  offset += static_cast<size_t>(written);
  return true;
}

bool parse_expected_revision(const char *body, uint32_t *out) {
  if (out == nullptr)
    return false;
  *out = 0;
  if (body == nullptr)
    return true;
  const char *p = strstr(body, "\"expected_revision\"");
  if (p == nullptr)
    return true;
  p = strchr(p, ':');
  if (p == nullptr)
    return true;
  *out = static_cast<uint32_t>(strtoul(p + 1, nullptr, 10));
  return true;
}

bool parse_float_field(const char *body, const char *key, float *out, bool *present) {
  if (present)
    *present = false;
  if (body == nullptr || key == nullptr || out == nullptr)
    return false;
  char pat[64];
  snprintf(pat, sizeof(pat), "\"%s\"", key);
  const char *p = strstr(body, pat);
  if (p == nullptr)
    return true;
  p = strchr(p, ':');
  if (p == nullptr)
    return false;
  p++;
  while (*p == ' ' || *p == '\t')
    p++;
  if (strncmp(p, "null", 4) == 0) {
    *out = NAN;
    if (present)
      *present = true;
    return true;
  }
  char *end = nullptr;
  float v = strtof(p, &end);
  if (end == p)
    return false;
  *out = v;
  if (present)
    *present = true;
  return true;
}

bool parse_int_field(const char *body, const char *key, long *out, bool *present) {
  if (present)
    *present = false;
  if (body == nullptr || key == nullptr || out == nullptr)
    return false;
  char pat[64];
  snprintf(pat, sizeof(pat), "\"%s\"", key);
  const char *p = strstr(body, pat);
  if (p == nullptr)
    return true;
  p = strchr(p, ':');
  if (p == nullptr)
    return false;
  *out = strtol(p + 1, nullptr, 10);
  if (present)
    *present = true;
  return true;
}

bool parse_string_field(const char *body, const char *key, char *out, size_t out_len, bool *present) {
  if (present)
    *present = false;
  if (out && out_len)
    out[0] = '\0';
  if (body == nullptr || key == nullptr)
    return false;
  char pat[64];
  snprintf(pat, sizeof(pat), "\"%s\"", key);
  const char *p = strstr(body, pat);
  if (p == nullptr)
    return true;
  p = strchr(p, ':');
  if (p == nullptr)
    return false;
  p++;
  while (*p == ' ' || *p == '\t')
    p++;
  if (*p != '"')
    return false;
  p++;
  size_t i = 0;
  while (*p && *p != '"' && i + 1 < out_len) {
    if (*p == '\\' && p[1])
      p++;
    out[i++] = *p++;
  }
  out[i] = '\0';
  if (present)
    *present = true;
  return true;
}

bool parse_bool_field(const char *body, const char *key, bool *out, bool *present) {
  if (present)
    *present = false;
  char pat[64];
  snprintf(pat, sizeof(pat), "\"%s\"", key);
  const char *p = strstr(body, pat);
  if (p == nullptr)
    return true;
  p = strchr(p, ':');
  if (p == nullptr)
    return false;
  p++;
  while (*p == ' ' || *p == '\t')
    p++;
  if (strncmp(p, "true", 4) == 0)
    *out = true;
  else if (strncmp(p, "false", 5) == 0)
    *out = false;
  else
    return false;
  if (present)
    *present = true;
  return true;
}

int loop_index_from_id(const char *id) {
  if (id == nullptr || id[0] != 'z')
    return -1;
  int n = atoi(id + 1);
  if (n < 1 || n > static_cast<int>(lv6::NUM_ZONES))
    return -1;
  return n - 1;
}

}  // namespace

void LV6Dashboard::handle_groups_(AsyncWebServerRequest *request) {
  if (!this->config_store_) {
    this->send_v1_(request, 503, "config_unavailable", "Config store unavailable");
    return;
  }
  const auto groups = this->config_store_->get_groups();
  const auto house = this->config_store_->get_house_physics();
  char *buf = this->json_buf_;
  size_t off = 0;
  appendf_phys(buf, JSON_BUF_SIZE, off, "{\"ok\":true,\"version\":\"v1\",\"data\":{\"groups\":[");
  bool first = true;
  // Explicit multi-member groups
  for (uint8_t gi = 0; gi < lv6::MAX_GROUPS; gi++) {
    const auto &g = groups.groups[gi];
    if (!lv6::group_model::group_active(g))
      continue;
    const uint8_t mask = lv6::group_model::group_loop_mask(g);
    float area = 0.0f, ua = 0.0f, c_slab = 0.0f, c_zone = 0.0f;
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      if ((mask & (1u << i)) == 0)
        continue;
      const auto z = this->config_store_->get_zone_config(i);
      const auto th = lv6::thermal_model::estimate(z, house);
      area += z.area_m2;
      ua += th.ua_effective_w_per_k > 0.0f ? th.ua_effective_w_per_k : 0.0f;
      c_slab += std::isfinite(th.c_slab_kwh_per_k) ? th.c_slab_kwh_per_k : 0.0f;
      c_zone += std::isfinite(th.c_zone_kwh_per_k) ? th.c_zone_kwh_per_k : 0.0f;
    }
    appendf_phys(buf, JSON_BUF_SIZE, off,
            "%s{\"group_id\":\"%s\",\"primary_loop\":\"z%u\",\"loops\":[", first ? "" : ",",
            g.group_id, static_cast<unsigned>(g.primary_loop + 1));
    first = false;
    bool fl = true;
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      if ((mask & (1u << i)) == 0)
        continue;
      appendf_phys(buf, JSON_BUF_SIZE, off, "%s\"z%u\"", fl ? "" : ",", static_cast<unsigned>(i + 1));
      fl = false;
    }
    appendf_phys(buf, JSON_BUF_SIZE, off, "],\"sensor_ids\":[");
    fl = true;
    for (uint8_t s = 0; s < lv6::GROUP_MAX_SENSORS; s++) {
      if (g.sensor_ids[s][0] == '\0')
        continue;
      appendf_phys(buf, JSON_BUF_SIZE, off, "%s\"%s\"", fl ? "" : ",", g.sensor_ids[s]);
      fl = false;
    }
    const auto zprim = this->config_store_->get_zone_config(static_cast<uint8_t>(g.primary_loop));
    appendf_phys(buf, JSON_BUF_SIZE, off,
            "],\"include_in_house_temperature\":%s,\"area_m2\":%.1f,"
            "\"ua_effective_w_per_k\":%.1f,\"c_slab_kwh_per_k\":%.3f,"
            "\"c_zone_kwh_per_k\":%.3f,\"setpoint_c\":%.1f,\"revision\":%lu}",
            g.include_in_house_temperature ? "true" : "false", area, ua, c_slab, c_zone,
            zprim.setpoint_c, static_cast<unsigned long>(g.revision));
  }
  // Implicit singletons
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    if (lv6::group_model::find_group_index(groups, i) >= 0)
      continue;
    const auto z = this->config_store_->get_zone_config(i);
    if (!z.enabled)
      continue;
    const auto th = lv6::thermal_model::estimate(z, house);
    char gid[8];
    lv6::group_model::make_default_group_id(gid, sizeof(gid), i);
    appendf_phys(buf, JSON_BUF_SIZE, off,
            "%s{\"group_id\":\"%s\",\"primary_loop\":\"z%u\",\"loops\":[\"z%u\"],\"sensor_ids\":[],"
            "\"include_in_house_temperature\":true,\"area_m2\":%.1f,\"ua_effective_w_per_k\":%.1f,"
            "\"c_slab_kwh_per_k\":%.3f,\"c_zone_kwh_per_k\":%.3f,\"setpoint_c\":%.1f,\"revision\":0}",
            first ? "" : ",", gid, static_cast<unsigned>(i + 1), static_cast<unsigned>(i + 1),
            z.area_m2, th.ua_effective_w_per_k > 0.0f ? th.ua_effective_w_per_k : 0.0f,
            std::isfinite(th.c_slab_kwh_per_k) ? th.c_slab_kwh_per_k : 0.0f,
            std::isfinite(th.c_zone_kwh_per_k) ? th.c_zone_kwh_per_k : 0.0f, z.setpoint_c);
    first = false;
  }
  appendf_phys(buf, JSON_BUF_SIZE, off, "]}}");
  send_text_(request, 200, "application/json", buf, true, "no-cache");
}

void LV6Dashboard::handle_groups_write_(AsyncWebServerRequest *request, const char *body) {
  if (!this->authorize_write_(request))
    return;
  if (!this->config_store_) {
    this->send_v1_(request, 503, "config_unavailable", "Config store unavailable");
    return;
  }
  uint32_t expected = 0;
  parse_expected_revision(body, &expected);
  const auto guard = this->request_guard_.check(expected, this->data_revision_, nullptr, millis());
  if (guard == request_guard::Decision::STALE) {
    this->send_v1_(request, 409, "stale_revision", "expected_revision mismatch");
    return;
  }

  char primary_id[8]{};
  bool has_primary = false;
  if (!parse_string_field(body, "primary_loop", primary_id, sizeof(primary_id), &has_primary) ||
      !has_primary) {
    this->send_v1_(request, 400, "invalid_primary", "primary_loop required");
    return;
  }
  const int primary = loop_index_from_id(primary_id);
  if (primary < 0) {
    this->send_v1_(request, 400, "invalid_primary", "primary_loop out of range");
    return;
  }

  char group_id[lv6::GROUP_ID_LEN]{};
  bool has_gid = false;
  parse_string_field(body, "group_id", group_id, sizeof(group_id), &has_gid);
  if (!has_gid || group_id[0] == '\0')
    lv6::group_model::make_default_group_id(group_id, sizeof(group_id),
                                            static_cast<uint8_t>(primary));

  uint8_t member_mask = 0;
  const char *members = strstr(body, "\"member_loops\"");
  if (members != nullptr) {
    const char *arr = strchr(members, '[');
    if (arr != nullptr) {
      const char *p = arr + 1;
      while (*p && *p != ']') {
        if (*p == '"') {
          char id[8]{};
          p++;
          size_t i = 0;
          while (*p && *p != '"' && i + 1 < sizeof(id))
            id[i++] = *p++;
          id[i] = '\0';
          const int li = loop_index_from_id(id);
          if (li >= 0 && li != primary)
            member_mask = static_cast<uint8_t>(member_mask | (1u << li));
        }
        if (*p)
          p++;
      }
    }
  }

  bool include = true;
  bool has_include = false;
  parse_bool_field(body, "include_in_house_temperature", &include, &has_include);

  auto next = this->config_store_->get_groups();
  // Remove any existing membership of these loops
  const uint8_t claim = static_cast<uint8_t>(member_mask | (1u << primary));
  for (uint8_t i = 0; i < lv6::MAX_GROUPS; i++) {
    if (!lv6::group_model::group_active(next.groups[i]))
      continue;
    if ((lv6::group_model::group_loop_mask(next.groups[i]) & claim) != 0)
      next.groups[i] = lv6::GroupConfig{};
  }
  // Find empty slot or matching group_id
  int slot = -1;
  for (uint8_t i = 0; i < lv6::MAX_GROUPS; i++) {
    if (strcmp(next.groups[i].group_id, group_id) == 0) {
      slot = i;
      break;
    }
  }
  if (slot < 0) {
    for (uint8_t i = 0; i < lv6::MAX_GROUPS; i++) {
      if (!lv6::group_model::group_active(next.groups[i])) {
        slot = i;
        break;
      }
    }
  }
  if (slot < 0) {
    this->send_v1_(request, 400, "no_group_slot", "Maximum groups reached");
    return;
  }

  lv6::GroupConfig g{};
  std::strncpy(g.group_id, group_id, sizeof(g.group_id) - 1);
  g.primary_loop = static_cast<int8_t>(primary);
  g.member_mask = member_mask;
  g.include_in_house_temperature = has_include ? include : true;
  g.revision = next.groups[slot].revision + 1;

  // Optional sensor_ids
  const char *sensors = strstr(body, "\"sensor_ids\"");
  if (sensors != nullptr) {
    const char *arr = strchr(sensors, '[');
    if (arr != nullptr) {
      const char *p = arr + 1;
      uint8_t si = 0;
      while (*p && *p != ']' && si < lv6::GROUP_MAX_SENSORS) {
        if (*p == '"') {
          p++;
          size_t i = 0;
          while (*p && *p != '"' && i + 1 < lv6::BLE_MAC_LEN)
            g.sensor_ids[si][i++] = *p++;
          g.sensor_ids[si][i] = '\0';
          si++;
        }
        if (*p)
          p++;
      }
    }
  }

  next.groups[slot] = g;
  if (member_mask == 0) {
    // Singleton explicit group not needed — clear slot
    next.groups[slot] = lv6::GroupConfig{};
  }

  bool faults[lv6::NUM_ZONES]{};
  if (this->valve_controller_) {
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      auto telem = this->valve_controller_->get_telemetry(i);
      faults[i] = telem.last_fault_code != lv6::FaultCode::NONE;
    }
  }
  const auto err = lv6::group_model::validate(next, faults);
  if (err != lv6::group_model::ValidateError::OK) {
    this->send_v1_(request, 400, lv6::group_model::validate_error_string(err),
                   "Group validation failed");
    return;
  }
  this->config_store_->update_groups(next);
  if (this->data_revision_ != UINT32_MAX) this->data_revision_++;
  this->send_v1_(request, 200, nullptr, nullptr);
}

void LV6Dashboard::handle_group_remove_(AsyncWebServerRequest *request, const char *group_id,
                                        const char *body) {
  if (!this->authorize_write_(request))
    return;
  if (!this->config_store_ || group_id == nullptr) {
    this->send_v1_(request, 400, "unknown_group", "group_id required");
    return;
  }
  char confirm[lv6::GROUP_ID_LEN]{};
  bool has_confirm = false;
  parse_string_field(body, "confirm", confirm, sizeof(confirm), &has_confirm);
  if (!has_confirm || strcmp(confirm, group_id) != 0) {
    this->send_v1_(request, 400, "confirm_mismatch", "confirm must equal group_id");
    return;
  }
  uint32_t expected = 0;
  parse_expected_revision(body, &expected);
  if (this->request_guard_.check(expected, this->data_revision_, nullptr, millis()) ==
      request_guard::Decision::STALE) {
    this->send_v1_(request, 409, "stale_revision", "expected_revision mismatch");
    return;
  }
  auto next = this->config_store_->get_groups();
  bool found = false;
  for (uint8_t i = 0; i < lv6::MAX_GROUPS; i++) {
    if (strcmp(next.groups[i].group_id, group_id) == 0) {
      next.groups[i] = lv6::GroupConfig{};
      found = true;
    }
  }
  if (!found) {
    this->send_v1_(request, 404, "unknown_group", "Group not found");
    return;
  }
  this->config_store_->update_groups(next);
  if (this->data_revision_ != UINT32_MAX) this->data_revision_++;
  this->send_v1_(request, 200, nullptr, nullptr);
}

void LV6Dashboard::handle_zone_physics_(AsyncWebServerRequest *request, uint8_t zone,
                                        const char *body) {
  if (!this->authorize_write_(request))
    return;
  if (zone < 1 || zone > lv6::NUM_ZONES || !this->config_store_) {
    this->send_v1_(request, 400, "invalid_zone", "Zone must be 1..6");
    return;
  }
  uint32_t expected = 0;
  parse_expected_revision(body, &expected);
  if (this->request_guard_.check(expected, this->data_revision_, nullptr, millis()) ==
      request_guard::Decision::STALE) {
    this->send_v1_(request, 409, "stale_revision", "expected_revision mismatch");
    return;
  }
  const uint8_t zi = static_cast<uint8_t>(zone - 1);
  auto z = this->config_store_->get_zone_config(zi);
  bool present = false;
  float f = 0.0f;
  long n = 0;
  if (parse_float_field(body, "area_m2", &f, &present) && present) {
    if (!(f >= 0.0f && f <= 500.0f)) {
      this->send_v1_(request, 400, "out_of_range", "area_m2");
      return;
    }
    z.area_m2 = f;
  }
  if (parse_int_field(body, "exterior_walls", &n, &present) && present) {
    if (n < 0 || n > 15) {
      this->send_v1_(request, 400, "out_of_range", "exterior_walls");
      return;
    }
    z.exterior_walls = static_cast<uint8_t>(n);
  }
  char enum_buf[32]{};
  if (parse_string_field(body, "slab_type", enum_buf, sizeof(enum_buf), &present) && present) {
    lv6::SlabType st{};
    if (!lv6::slab_type_from_string(enum_buf, &st)) {
      this->send_v1_(request, 400, "invalid_enum", "slab_type");
      return;
    }
    z.slab_type = st;
  }
  if (parse_string_field(body, "covering", enum_buf, sizeof(enum_buf), &present) && present) {
    lv6::CoveringType ct{};
    if (!lv6::covering_type_from_string(enum_buf, &ct)) {
      this->send_v1_(request, 400, "invalid_enum", "covering");
      return;
    }
    z.covering = ct;
  }
  if (parse_float_field(body, "active_thickness_cm", &f, &present) && present) {
    if (std::isfinite(f) && f > 0.0f &&
        !lv6::thermal_model::thickness_allowed(z.slab_type == lv6::SlabType::UNSET
                                                   ? lv6::SlabType::CAST_CONCRETE
                                                   : z.slab_type,
                                               f)) {
      this->send_v1_(request, 400, "out_of_range", "active_thickness_cm");
      return;
    }
    z.active_thickness_cm = std::isfinite(f) ? f : 0.0f;
  }
  if (parse_float_field(body, "r_override_m2k_per_w", &f, &present) && present) {
    if (std::isfinite(f) && (f < 0.0f || f > 0.25f)) {
      this->send_v1_(request, 400, "out_of_range", "r_override_m2k_per_w");
      return;
    }
    z.r_override_m2k_per_w = f;
  }
  if (parse_float_field(body, "ua_weight_override", &f, &present) && present) {
    if (!(f >= 0.25f && f <= 4.0f)) {
      this->send_v1_(request, 400, "out_of_range", "ua_weight_override");
      return;
    }
    z.ua_weight_override = f;
  }
  if (parse_float_field(body, "pipe_spacing_mm", &f, &present) && present) {
    if (!(f >= 50.0f && f <= 500.0f)) {
      this->send_v1_(request, 400, "out_of_range", "pipe_spacing_mm");
      return;
    }
    z.pipe_spacing_mm = f;
  }
  if (parse_string_field(body, "pipe_type", enum_buf, sizeof(enum_buf), &present) && present) {
    if (strcasecmp(enum_buf, "Unknown") != 0 && strcasecmp(enum_buf, "UNKNOWN") != 0) {
      lv6::PipeType pt{};
      bool ok = false;
      struct { const char *s; lv6::PipeType v; } map[] = {
          {"PEX 12mm", lv6::PipeType::PEX_12X2}, {"PEX_12X2", lv6::PipeType::PEX_12X2},
          {"PEX 14mm", lv6::PipeType::PEX_14X2}, {"PEX_14X2", lv6::PipeType::PEX_14X2},
          {"PEX 16mm", lv6::PipeType::PEX_16X2}, {"PEX_16X2", lv6::PipeType::PEX_16X2},
          {"PEX 17mm", lv6::PipeType::PEX_17X2}, {"PEX_17X2", lv6::PipeType::PEX_17X2},
          {"PEX 18mm", lv6::PipeType::PEX_18X2}, {"PEX_18X2", lv6::PipeType::PEX_18X2},
          {"PEX 20mm", lv6::PipeType::PEX_20X2}, {"PEX_20X2", lv6::PipeType::PEX_20X2},
          {"ALUPEX 16mm", lv6::PipeType::ALUPEX_16X2}, {"ALUPEX_16X2", lv6::PipeType::ALUPEX_16X2},
          {"ALUPEX 20mm", lv6::PipeType::ALUPEX_20X2}, {"ALUPEX_20X2", lv6::PipeType::ALUPEX_20X2},
      };
      for (const auto &e : map) {
        if (strcasecmp(enum_buf, e.s) == 0) {
          pt = e.v;
          ok = true;
          break;
        }
      }
      if (!ok) {
        this->send_v1_(request, 400, "invalid_enum", "pipe_type");
        return;
      }
      z.pipe_type = pt;
    }
  }
  this->config_store_->update_zone(zi, z);
  if (this->data_revision_ != UINT32_MAX) this->data_revision_++;
  const auto th = lv6::thermal_model::estimate(z, this->config_store_->get_house_physics());
  char *buf = this->json_buf_;
  size_t off = 0;
  appendf_phys(buf, JSON_BUF_SIZE, off, "{\"ok\":true,\"version\":\"v1\",\"data\":{\"warnings\":[");
  bool fw = true;
  if (th.thickness_ignored) {
    appendf_phys(buf, JSON_BUF_SIZE, off, "%s\"thickness_ignored\"", fw ? "" : ",");
    fw = false;
  }
  if (th.high_floor_resistance) {
    appendf_phys(buf, JSON_BUF_SIZE, off, "%s\"high_floor_resistance\"", fw ? "" : ",");
    fw = false;
  }
  appendf_phys(buf, JSON_BUF_SIZE, off, "]}}");
  send_text_(request, 200, "application/json", buf, true, "no-cache");
}

void LV6Dashboard::handle_zone_ua_learned_(AsyncWebServerRequest *request, uint8_t zone,
                                           const char *body) {
  if (zone < 1 || zone > lv6::NUM_ZONES || !this->config_store_) {
    this->send_v1_(request, 400, "invalid_zone", "Zone must be 1..6");
    return;
  }
  // Trusted coordinator only
  if (!this->config_store_) {
    this->send_v1_(request, 503, "authority_unavailable", "Authority unavailable");
    return;
  }
  const auto auth_cfg = this->config_store_->get_authority_config();
  if (auth_cfg.shared_key[0] == '\0') {
    this->send_v1_(request, 403, "authority_auth_unconfigured", "Authority not provisioned");
    return;
  }
  const auto key_header = request->get_header("X-Lune-Authority-Key");
  const char *provided_key = key_header.has_value() ? key_header.value().c_str() : "";
  time_t now_s = time(nullptr);
  uint32_t auth_timestamp_s = 0;
  char auth_nonce[48]{};
  long ts = 0;
  bool has_ts = false;
  parse_int_field(body, "auth_timestamp_s", &ts, &has_ts);
  auth_timestamp_s = static_cast<uint32_t>(ts);
  parse_string_field(body, "auth_nonce", auth_nonce, sizeof(auth_nonce), nullptr);
  if (!touch_auth::request_is_authenticated(auth_cfg.shared_key, provided_key, now_s,
                                            auth_timestamp_s, auth_nonce)) {
    this->send_v1_(request, 403, "touch_auth_failed", "Authority authentication failed");
    return;
  }

  float ua = NAN, confidence = NAN;
  long days = 0, ts_epoch = 0;
  bool p = false;
  parse_float_field(body, "ua_w_per_k", &ua, &p);
  parse_float_field(body, "confidence", &confidence, &p);
  parse_int_field(body, "observed_days", &days, &p);
  parse_int_field(body, "ts_epoch_s", &ts_epoch, &p);

  const uint8_t zi = static_cast<uint8_t>(zone - 1);
  auto z = this->config_store_->get_zone_config(zi);
  const auto house = this->config_store_->get_house_physics();
  const auto th = lv6::thermal_model::estimate(z, house);
  if (!lv6::thermal_model::learned_ua_in_range(ua, th.ua_prior_w_per_k)) {
    ESP_LOGW(PHYS_TAG, "Rejected ua-learned zone %u: ua=%.2f prior=%.2f (outside 0.2–5×)",
             zone, ua, th.ua_prior_w_per_k);
    this->send_v1_(request, 400, "ua_out_of_range", "Learned UA outside 0.2–5× prior");
    return;
  }
  if (!(confidence >= 0.0f && confidence <= 1.0f)) {
    this->send_v1_(request, 400, "out_of_range", "confidence");
    return;
  }
  z.ua_learned_w_per_k = ua;
  z.ua_learned_confidence = confidence;
  z.ua_learned_observed_days = static_cast<uint16_t>(std::clamp(days, 0L, 3650L));
  z.ua_learned_ts_epoch_s = static_cast<uint32_t>(ts_epoch > 0 ? ts_epoch : now_s);
  this->config_store_->update_zone(zi, z);
  if (this->data_revision_ != UINT32_MAX) this->data_revision_++;
  this->send_v1_(request, 200, nullptr, nullptr);
}

void LV6Dashboard::handle_physics_house_(AsyncWebServerRequest *request, const char *body) {
  if (!this->config_store_) {
    this->send_v1_(request, 503, "config_unavailable", "Config store unavailable");
    return;
  }
  const auto auth_cfg = this->config_store_->get_authority_config();
  if (auth_cfg.shared_key[0] == '\0') {
    this->send_v1_(request, 403, "authority_auth_unconfigured", "Authority not provisioned");
    return;
  }
  const auto key_header = request->get_header("X-Lune-Authority-Key");
  const char *provided_key = key_header.has_value() ? key_header.value().c_str() : "";
  time_t now_s = time(nullptr);
  long ts = 0;
  bool has_ts = false;
  parse_int_field(body, "auth_timestamp_s", &ts, &has_ts);
  char auth_nonce[48]{};
  parse_string_field(body, "auth_nonce", auth_nonce, sizeof(auth_nonce), nullptr);
  if (!touch_auth::request_is_authenticated(auth_cfg.shared_key, provided_key, now_s,
                                            static_cast<uint32_t>(ts), auth_nonce)) {
    this->send_v1_(request, 403, "touch_auth_failed", "Authority authentication failed");
    return;
  }

  lv6::HousePhysicsConfig house = this->config_store_->get_house_physics();
  float f = 0.0f;
  bool present = false;
  if (parse_float_field(body, "u_base", &f, &present) && present)
    house.u_base = f;
  if (parse_float_field(body, "u_wall", &f, &present) && present)
    house.u_wall = f;
  if (parse_float_field(body, "c_struct", &f, &present) && present)
    house.c_struct = f;
  char src[16]{};
  if (parse_string_field(body, "source", src, sizeof(src), &present) && present) {
    house.source = (strcasecmp(src, "calibrated") == 0) ? lv6::PhysicsParamSource::CALIBRATED
                                                        : lv6::PhysicsParamSource::DEFAULT;
  }
  long cal_at = 0;
  if (parse_int_field(body, "calibrated_at_epoch_s", &cal_at, &present) && present)
    house.calibrated_at_epoch_s = static_cast<uint32_t>(cal_at);
  this->config_store_->update_house_physics(house);
  if (this->data_revision_ != UINT32_MAX) this->data_revision_++;
  this->send_v1_(request, 200, nullptr, nullptr);
}

void LV6Dashboard::handle_forecast_profile_(AsyncWebServerRequest *request, uint8_t zone,
                                            const char *body) {
  // Back-compat: accept and store wind/solar but do not use for control.
  // Touch is the truth source for weather exposure (contract §1 / §11).
  if (!this->authorize_write_(request))
    return;
  if (zone < 1 || zone > lv6::NUM_ZONES || !this->config_store_) {
    this->send_v1_(request, 400, "invalid_zone", "Zone must be 1..6");
    return;
  }
  const uint8_t zi = static_cast<uint8_t>(zone - 1);
  auto z = this->config_store_->get_zone_config(zi);
  float f = 0.0f;
  bool present = false;
  long walls = 0;
  if (parse_int_field(body, "exterior_walls", &walls, &present) && present && walls >= 0 &&
      walls <= 15)
    z.exterior_walls = static_cast<uint8_t>(walls);
  if (parse_float_field(body, "wind_exposure", &f, &present) && present)
    z.wind_exposure = std::clamp(f, 0.0f, 2.0f);
  if (parse_float_field(body, "solar_gain", &f, &present) && present)
    z.solar_gain = std::clamp(f, 0.0f, 2.0f);
  this->config_store_->update_zone(zi, z);
  if (this->data_revision_ != UINT32_MAX) this->data_revision_++;
  ESP_LOGI(PHYS_TAG, "forecast-profile stored for zone %u (unused by V6 control; Touch owns weather)",
           zone);
  this->send_v1_(request, 200, nullptr, nullptr);
}

}  // namespace lv6_dashboard
}  // namespace esphome
