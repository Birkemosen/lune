#include "lune_touch_dashboard.h"

#include "esphome/core/hal.h"
#include "esphome/core/log.h"
#include <ArduinoJson.h>
#include <algorithm>
#include <cstdlib>
#include <cstring>

namespace esphome {
namespace lune_touch_dashboard {

static const char *const TAG = "lune_touch_dashboard";
static constexpr const char API_PREFIX[] = "/api/lune-touch/v1";
static constexpr size_t API_PREFIX_LEN = sizeof(API_PREFIX) - 1;

namespace {

bool parse_float_arg(AsyncWebServerRequest *request, const char *name, float *out) {
  const std::string value = request->arg(name);
  if (value.empty())
    return false;
  char *end = nullptr;
  const float parsed = strtof(value.c_str(), &end);
  if (end == value.c_str() || *end != '\0')
    return false;
  *out = parsed;
  return true;
}

bool json_get_str(const char *body, const char *field, char *out, size_t out_len) {
  if (body == nullptr || field == nullptr || out == nullptr || out_len == 0)
    return false;
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err)
    return false;
  JsonVariant value = doc[field];
  if (!value.is<const char *>())
    return false;
  strncpy(out, value.as<const char *>(), out_len - 1);
  out[out_len - 1] = '\0';
  return true;
}

bool json_get_float(const char *body, const char *field, float *out) {
  if (body == nullptr || field == nullptr || out == nullptr)
    return false;
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err)
    return false;
  JsonVariant value = doc[field];
  if (!value.is<float>() && !value.is<int>() && !value.is<unsigned>())
    return false;
  *out = value.as<float>();
  return true;
}

bool parse_float_param(AsyncWebServerRequest *request, const char *body, const char *name, float *out) {
  if (parse_float_arg(request, name, out))
    return true;
  return json_get_float(body, name, out);
}

bool parse_uint_arg(AsyncWebServerRequest *request, const char *name, uint32_t *out) {
  const std::string value = request->arg(name);
  if (value.empty())
    return false;
  char *end = nullptr;
  const unsigned long parsed = strtoul(value.c_str(), &end, 10);
  if (end == value.c_str() || *end != '\0')
    return false;
  *out = static_cast<uint32_t>(parsed);
  return true;
}

bool parse_uint_param(AsyncWebServerRequest *request, const char *body, const char *name, uint32_t *out) {
  if (parse_uint_arg(request, name, out))
    return true;
  float parsed = 0.0f;
  if (!json_get_float(body, name, &parsed) || parsed < 0.0f)
    return false;
  *out = static_cast<uint32_t>(parsed);
  return true;
}

bool parse_size_param(AsyncWebServerRequest *request, const char *body, const char *name, size_t *out) {
  uint32_t value = 0;
  if (!parse_uint_param(request, body, name, &value))
    return false;
  *out = static_cast<size_t>(value);
  return true;
}

void parse_text_param(AsyncWebServerRequest *request, const char *body, const char *name,
                      char *out, size_t out_len) {
  if (out_len == 0)
    return;
  const std::string arg = request->arg(name);
  if (!arg.empty()) {
    strncpy(out, arg.c_str(), out_len - 1);
    out[out_len - 1] = '\0';
    return;
  }
  if (json_get_str(body, name, out, out_len))
    return;
  out[0] = '\0';
}

bool parse_node_trust_param(AsyncWebServerRequest *request, const char *body,
                            ::lune_touch::NodeTrust *out) {
  char trust[20];
  parse_text_param(request, body, "trust", trust, sizeof(trust));
  if (strcmp(trust, "trusted") == 0 || strcmp(trust, "2") == 0) {
    *out = ::lune_touch::NodeTrust::TRUSTED;
    return true;
  }
  if (strcmp(trust, "paired") == 0 || strcmp(trust, "1") == 0) {
    *out = ::lune_touch::NodeTrust::PAIRED;
    return true;
  }
  return false;
}

bool extract_middle_segment(const char *path, const char *prefix, const char *suffix,
                            char *out, size_t out_len) {
  if (path == nullptr || prefix == nullptr || suffix == nullptr || out_len == 0)
    return false;
  const size_t prefix_len = strlen(prefix);
  const size_t suffix_len = strlen(suffix);
  const size_t path_len = strlen(path);
  if (strncmp(path, prefix, prefix_len) != 0 || path_len < prefix_len + suffix_len)
    return false;
  if (strcmp(path + path_len - suffix_len, suffix) != 0)
    return false;
  const size_t segment_len = path_len - prefix_len - suffix_len;
  if (segment_len == 0 || segment_len >= out_len)
    return false;
  memcpy(out, path + prefix_len, segment_len);
  out[segment_len] = '\0';
  return true;
}

}  // namespace

static const char DASHBOARD_HTML[] =
    "<!doctype html><html><head>"
    "<meta charset=\"utf-8\">"
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
    "<title>Lune Touch</title>"
    "</head><body>"
    "<div id=\"app\">Loading Lune Touch...</div>"
    "<script src=\"/dashboard.js\"></script>"
    "</body></html>";

void LuneTouchDashboard::setup() {
  if (base_ == nullptr) {
    ESP_LOGE(TAG, "web_server_base is null; dashboard handler not registered");
    return;
  }
  base_->init();
  base_->add_handler(this);
  ESP_LOGI(TAG, "Dashboard endpoints registered: /, /dashboard.js, /api/lune-touch/v1/*");
}

bool LuneTouchDashboard::canHandle(AsyncWebServerRequest *request) const {
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  auto url = request->url_to(url_buf);
  if (url == "/" || url == "/dashboard" || url == "/dashboard/" || url == "/dashboard.js")
    return true;
  return strncmp(url.c_str(), API_PREFIX, API_PREFIX_LEN) == 0 &&
         (url.c_str()[API_PREFIX_LEN] == '/' || url.c_str()[API_PREFIX_LEN] == '\0');
}

void LuneTouchDashboard::handleRequest(AsyncWebServerRequest *request) {
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  auto url = request->url_to(url_buf);
  if (url == "/" || url == "/dashboard" || url == "/dashboard/") {
    handle_root_(request);
    return;
  }
  if (url == "/dashboard.js") {
    handle_js_(request);
    return;
  }
  if (strncmp(url.c_str(), API_PREFIX, API_PREFIX_LEN) == 0) {
    const char *path = url.c_str() + API_PREFIX_LEN;
    handle_v1_(request, *path ? path : "/");
    return;
  }
  request->send(404, "text/plain", "Not found");
}

void LuneTouchDashboard::handle_root_(AsyncWebServerRequest *request) {
  request->send(200, "text/html; charset=utf-8", DASHBOARD_HTML);
}

void LuneTouchDashboard::handle_js_(AsyncWebServerRequest *request) {
#ifdef LUNE_TOUCH_HAS_DASHBOARD_JS
  AsyncWebServerResponse *response = request->beginResponse(
      200, "application/javascript; charset=utf-8",
      (const uint8_t *) LUNE_TOUCH_DASHBOARD_JS_DATA, LUNE_TOUCH_DASHBOARD_JS_SIZE);
  response->addHeader("Content-Encoding", "gzip");
  response->addHeader("Cache-Control", "max-age=60");
  request->send(response);
#else
  request->send(404, "text/plain", "dashboard.js not configured");
#endif
}

void LuneTouchDashboard::send_json_(AsyncWebServerRequest *request, const char *body) {
  AsyncWebServerResponse *response = request->beginResponse(200, "application/json", body);
  response->addHeader("Cache-Control", "no-cache");
  response->addHeader("Access-Control-Allow-Origin", "*");
  request->send(response);
}

void LuneTouchDashboard::send_ok_(AsyncWebServerRequest *request, const char *data) {
  const unsigned long ts_ms = static_cast<unsigned long>(esphome::millis());
  const int written = snprintf(response_buf_, sizeof(response_buf_),
                               "{\"ok\":true,\"version\":\"v1\",\"ts_ms\":%lu,\"data\":%s}",
                               ts_ms, data);
  if (written < 0 || static_cast<size_t>(written) >= sizeof(response_buf_)) {
    send_error_(request, 507, "response_too_large", "Dashboard response too large");
    return;
  }
  send_json_(request, response_buf_);
}

void LuneTouchDashboard::send_error_(AsyncWebServerRequest *request, int code, const char *err_code, const char *message) {
  const unsigned long ts_ms = static_cast<unsigned long>(esphome::millis());
  snprintf(response_buf_, sizeof(response_buf_),
           "{\"ok\":false,\"version\":\"v1\",\"ts_ms\":%lu,\"error\":{\"code\":\"%s\",\"message\":\"%s\"}}",
           ts_ms, err_code, message);
  request->send(code, "application/json", response_buf_);
}

void LuneTouchDashboard::send_write_result_(AsyncWebServerRequest *request, bool accepted, int failure_code) {
  if (accepted) {
    send_ok_(request, data_buf_);
    return;
  }
  char err_code[64];
  if (!json_get_str(data_buf_, "error", err_code, sizeof(err_code)))
    strncpy(err_code, "rejected", sizeof(err_code) - 1);
  err_code[sizeof(err_code) - 1] = '\0';
  send_error_(request, failure_code, err_code, err_code);
}

void LuneTouchDashboard::handle_v1_(AsyncWebServerRequest *request, const char *path) {
  if (request->method() == HTTP_OPTIONS) {
    request->send(204, "text/plain", "");
    return;
  }

  if (request->method() == HTTP_GET) {
    if (strcmp(path, "/overview") == 0 || strcmp(path, "/") == 0) {
      if (coordinator_)
        coordinator_->write_overview_json(data_buf_, sizeof(data_buf_));
      else
        snprintf(data_buf_, sizeof(data_buf_), "{}");
      send_ok_(request, data_buf_);
      return;
    }
    if (strcmp(path, "/nodes") == 0) {
      if (coordinator_)
        coordinator_->write_nodes_json(data_buf_, sizeof(data_buf_));
      else
        snprintf(data_buf_, sizeof(data_buf_), "{\"nodes\":[]}");
      send_ok_(request, data_buf_);
      return;
    }
    if (strcmp(path, "/zones") == 0) {
      if (coordinator_)
        coordinator_->write_zones_json(data_buf_, sizeof(data_buf_));
      else
        snprintf(data_buf_, sizeof(data_buf_), "{\"count\":0,\"zones\":[]}");
      send_ok_(request, data_buf_);
      return;
    }
    if (strcmp(path, "/strategy") == 0) {
      if (coordinator_)
        coordinator_->write_strategy_json(data_buf_, sizeof(data_buf_));
      else
        snprintf(data_buf_, sizeof(data_buf_), "{}");
      send_ok_(request, data_buf_);
      return;
    }
    if (strcmp(path, "/forecast") == 0) {
      if (coordinator_)
        coordinator_->write_forecast_json(data_buf_, sizeof(data_buf_));
      else
        snprintf(data_buf_, sizeof(data_buf_), "{}");
      send_ok_(request, data_buf_);
      return;
    }
    if (strcmp(path, "/commands") == 0) {
      if (coordinator_)
        coordinator_->write_commands_json(data_buf_, sizeof(data_buf_));
      else
        snprintf(data_buf_, sizeof(data_buf_), "{\"commands\":[]}");
      send_ok_(request, data_buf_);
      return;
    }
    if (strcmp(path, "/diagnostics") == 0) {
      if (coordinator_)
        coordinator_->write_diagnostics_json(data_buf_, sizeof(data_buf_));
      else
        snprintf(data_buf_, sizeof(data_buf_), "{}");
      send_ok_(request, data_buf_);
      return;
    }
    send_error_(request, 404, "unknown_route", "Unknown route");
    return;
  }

  if (request->method() != HTTP_POST) {
    send_error_(request, 405, "method_not_allowed", "Use GET or POST");
    return;
  }

  if (coordinator_ == nullptr) {
    send_error_(request, 503, "coordinator_unavailable", "Coordinator unavailable");
    return;
  }

  const std::string body_str = request->arg("plain");
  const char *body = body_str.c_str();

  if (strcmp(path, "/nodes/scan") == 0) {
    char hostname[80];
    char ip[24];
    parse_text_param(request, body, "hostname", hostname, sizeof(hostname));
    parse_text_param(request, body, "ip", ip, sizeof(ip));
    if (hostname[0] != '\0' || ip[0] != '\0')
      coordinator_->scan_node_candidate(hostname, ip, data_buf_, sizeof(data_buf_));
    else
      coordinator_->write_node_scan_json(data_buf_, sizeof(data_buf_));
    send_ok_(request, data_buf_);
  } else if (strcmp(path, "/nodes") == 0) {
    char node_id[32];
    char hostname[80];
    char ip[24];
    char pairing_fingerprint[32];
    parse_text_param(request, body, "node_id", node_id, sizeof(node_id));
    parse_text_param(request, body, "hostname", hostname, sizeof(hostname));
    parse_text_param(request, body, "ip", ip, sizeof(ip));
    parse_text_param(request, body, "pairing_fingerprint", pairing_fingerprint, sizeof(pairing_fingerprint));
    const bool accepted = coordinator_->add_node(node_id, hostname, ip, pairing_fingerprint,
                                                 data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 400);
  } else if (strstr(path, "/trust") != nullptr) {
    char node_id[32]{};
    if (!extract_middle_segment(path, "/nodes/", "/trust", node_id, sizeof(node_id))) {
      send_error_(request, 404, "unknown_route", "Unknown node trust route");
      return;
    }
    ::lune_touch::NodeTrust trust = ::lune_touch::NodeTrust::PAIRED;
    if (!parse_node_trust_param(request, body, &trust)) {
      send_error_(request, 400, "missing_param", "trust must be paired or trusted");
      return;
    }
    const bool accepted = coordinator_->set_node_trust(node_id, trust, data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 404);
  } else if (strstr(path, "/remove") != nullptr) {
    char node_id[32]{};
    if (!extract_middle_segment(path, "/nodes/", "/remove", node_id, sizeof(node_id))) {
      send_error_(request, 404, "unknown_route", "Unknown node remove route");
      return;
    }
    const bool accepted = coordinator_->remove_node(node_id, data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 404);
  } else if (strstr(path, "/setpoint-command") != nullptr) {
    char room_id[40]{};
    if (!extract_middle_segment(path, "/zones/", "/setpoint-command", room_id, sizeof(room_id))) {
      send_error_(request, 404, "unknown_route", "Unknown zone command route");
      return;
    }
    float offset = 0.0f;
    if (!parse_float_param(request, body, "offset_c", &offset) &&
        !parse_float_param(request, body, "requested_offset_c", &offset)) {
      send_error_(request, 400, "missing_param", "offset_c is required");
      return;
    }
    uint32_t ttl_s = 2700;
    parse_uint_param(request, body, "ttl_s", &ttl_s);
    char reason[80];
    parse_text_param(request, body, "reason", reason, sizeof(reason));
    const bool accepted = coordinator_->queue_setpoint_command(room_id, offset, ttl_s, reason, data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 400);
  } else if (strstr(path, "/schedule") != nullptr) {
    char room_id[40]{};
    if (!extract_middle_segment(path, "/zones/", "/schedule", room_id, sizeof(room_id))) {
      send_error_(request, 404, "unknown_route", "Unknown zone schedule route");
      return;
    }
    uint32_t enabled = 0;
    uint32_t day_mask = 0x7F;
    uint32_t start_min = 360;
    uint32_t end_min = 1320;
    float setpoint = 21.0f;
    parse_uint_param(request, body, "enabled", &enabled);
    parse_uint_param(request, body, "day_mask", &day_mask);
    parse_uint_param(request, body, "start_min", &start_min);
    parse_uint_param(request, body, "end_min", &end_min);
    if (!parse_float_param(request, body, "setpoint_c", &setpoint) &&
        !parse_float_param(request, body, "comfort_setpoint_c", &setpoint)) {
      send_error_(request, 400, "missing_param", "setpoint_c is required");
      return;
    }
    const bool accepted = coordinator_->set_zone_schedule(room_id, enabled != 0,
                                                          static_cast<uint8_t>(day_mask),
                                                          static_cast<uint16_t>(start_min),
                                                          static_cast<uint16_t>(end_min),
                                                          setpoint, data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 400);
  } else if (strstr(path, "/comfort") != nullptr) {
    char room_id[40]{};
    if (!extract_middle_segment(path, "/zones/", "/comfort", room_id, sizeof(room_id))) {
      send_error_(request, 404, "unknown_route", "Unknown zone comfort route");
      return;
    }
    float comfort = 0.0f;
    if (!parse_float_param(request, body, "comfort_setpoint_c", &comfort) &&
        !parse_float_param(request, body, "setpoint_c", &comfort)) {
      send_error_(request, 400, "missing_param", "comfort_setpoint_c is required");
      return;
    }
    uint32_t priority = 1;
    parse_uint_param(request, body, "priority", &priority);
    float bias = 0.0f;
    if (!parse_float_param(request, body, "comfort_bias_c", &bias))
      parse_float_param(request, body, "bias_c", &bias);
    const bool accepted = coordinator_->set_zone_comfort(room_id, comfort, static_cast<uint8_t>(priority),
                                                         bias, data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 400);
  } else if (strcmp(path, "/forecast/settings") == 0) {
    float latitude = 0.0f;
    float longitude = 0.0f;
    if (!parse_float_param(request, body, "latitude", &latitude) ||
        !parse_float_param(request, body, "longitude", &longitude)) {
      send_error_(request, 400, "missing_param", "latitude and longitude are required");
      return;
    }
    char source[24];
    parse_text_param(request, body, "source", source, sizeof(source));
    const bool accepted = coordinator_->set_forecast_location(latitude, longitude, source, data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 400);
  } else if (strcmp(path, "/forecast/fetch") == 0) {
    const bool accepted = coordinator_->request_forecast_fetch(data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 400);
  } else if (strcmp(path, "/recovery/reset-registry") == 0) {
    char confirm[32];
    parse_text_param(request, body, "confirm", confirm, sizeof(confirm));
    const bool accepted = coordinator_->reset_registry(confirm, data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 400);
  } else if (strncmp(path, "/zones/", 7) == 0) {
    const char *room_id = path + 7;
    if (room_id[0] == '\0' || strchr(room_id, '/') != nullptr) {
      send_error_(request, 404, "unknown_route", "Unknown zone route");
      return;
    }
    size_t node_index = 0;
    size_t zone_index = 0;
    if (!parse_size_param(request, body, "node_index", &node_index) ||
        !parse_size_param(request, body, "zone_index", &zone_index)) {
      send_error_(request, 400, "missing_param", "node_index and zone_index are required");
      return;
    }
    char name[64];
    parse_text_param(request, body, "name", name, sizeof(name));
    const bool accepted = coordinator_->bind_room(room_id, name, node_index, zone_index, data_buf_, sizeof(data_buf_));
    send_write_result_(request, accepted, 400);
  } else {
    send_error_(request, 404, "unknown_route", "Unknown route");
  }
}

}  // namespace lune_touch_dashboard
}  // namespace esphome
