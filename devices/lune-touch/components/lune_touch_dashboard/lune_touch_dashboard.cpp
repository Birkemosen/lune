#include "lune_touch_dashboard.h"

#include "esphome/core/log.h"
#include <ctime>
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

bool parse_size_arg(AsyncWebServerRequest *request, const char *name, size_t *out) {
  uint32_t value = 0;
  if (!parse_uint_arg(request, name, &value))
    return false;
  *out = static_cast<size_t>(value);
  return true;
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
  char buf[768];
  const long long ts_ms = static_cast<long long>(::time(nullptr)) * 1000LL;
  snprintf(buf, sizeof(buf), "{\"ok\":true,\"version\":\"v1\",\"ts_ms\":%lld,\"data\":%s}", ts_ms, data);
  send_json_(request, buf);
}

void LuneTouchDashboard::send_error_(AsyncWebServerRequest *request, int code, const char *err_code, const char *message) {
  char buf[256];
  const long long ts_ms = static_cast<long long>(::time(nullptr)) * 1000LL;
  snprintf(buf, sizeof(buf),
           "{\"ok\":false,\"version\":\"v1\",\"ts_ms\":%lld,\"error\":{\"code\":\"%s\",\"message\":\"%s\"}}",
           ts_ms, err_code, message);
  request->send(code, "application/json", buf);
}

void LuneTouchDashboard::handle_v1_(AsyncWebServerRequest *request, const char *path) {
  if (request->method() == HTTP_OPTIONS) {
    request->send(204, "text/plain", "");
    return;
  }

  if (request->method() == HTTP_GET) {
    if (strcmp(path, "/overview") == 0 || strcmp(path, "/") == 0) {
      char data[768];
      if (coordinator_)
        coordinator_->write_overview_json(data, sizeof(data));
      else
        snprintf(data, sizeof(data), "{}");
      send_ok_(request, data);
      return;
    }
    if (strcmp(path, "/nodes") == 0) {
      char data[768];
      if (coordinator_)
        coordinator_->write_nodes_json(data, sizeof(data));
      else
        snprintf(data, sizeof(data), "{\"nodes\":[]}");
      send_ok_(request, data);
      return;
    }
    if (strcmp(path, "/zones") == 0) {
      char data[2048];
      if (coordinator_)
        coordinator_->write_zones_json(data, sizeof(data));
      else
        snprintf(data, sizeof(data), "{\"count\":0,\"zones\":[]}");
      send_ok_(request, data);
      return;
    }
    if (strcmp(path, "/forecast") == 0) {
      char data[1024];
      if (coordinator_)
        coordinator_->write_forecast_json(data, sizeof(data));
      else
        snprintf(data, sizeof(data), "{}");
      send_ok_(request, data);
      return;
    }
    if (strcmp(path, "/commands") == 0) {
      char data[2048];
      if (coordinator_)
        coordinator_->write_commands_json(data, sizeof(data));
      else
        snprintf(data, sizeof(data), "{\"commands\":[]}");
      send_ok_(request, data);
      return;
    }
    if (strcmp(path, "/diagnostics") == 0) {
      char data[768];
      if (coordinator_)
        coordinator_->write_diagnostics_json(data, sizeof(data));
      else
        snprintf(data, sizeof(data), "{}");
      send_ok_(request, data);
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

  char data[512];
  if (strcmp(path, "/nodes/scan") == 0) {
    send_ok_(request, "{\"scan\":\"queued\",\"found\":[]}");
  } else if (strcmp(path, "/nodes") == 0) {
    coordinator_->add_node(request->arg("node_id").c_str(), request->arg("hostname").c_str(),
                           request->arg("ip").c_str(), data, sizeof(data));
    send_ok_(request, data);
  } else if (strstr(path, "/remove") != nullptr) {
    char node_id[32]{};
    if (!extract_middle_segment(path, "/nodes/", "/remove", node_id, sizeof(node_id))) {
      send_error_(request, 404, "unknown_route", "Unknown node remove route");
      return;
    }
    coordinator_->remove_node(node_id, data, sizeof(data));
    send_ok_(request, data);
  } else if (strstr(path, "/setpoint-command") != nullptr) {
    char room_id[40]{};
    if (!extract_middle_segment(path, "/zones/", "/setpoint-command", room_id, sizeof(room_id))) {
      send_error_(request, 404, "unknown_route", "Unknown zone command route");
      return;
    }
    float offset = 0.0f;
    if (!parse_float_arg(request, "offset_c", &offset) && !parse_float_arg(request, "requested_offset_c", &offset)) {
      send_error_(request, 400, "missing_param", "offset_c is required");
      return;
    }
    uint32_t ttl_s = 2700;
    parse_uint_arg(request, "ttl_s", &ttl_s);
    coordinator_->queue_setpoint_command(room_id, offset, ttl_s, request->arg("reason").c_str(), data, sizeof(data));
    send_ok_(request, data);
  } else if (strcmp(path, "/forecast/settings") == 0) {
    float latitude = 0.0f;
    float longitude = 0.0f;
    if (!parse_float_arg(request, "latitude", &latitude) || !parse_float_arg(request, "longitude", &longitude)) {
      send_error_(request, 400, "missing_param", "latitude and longitude are required");
      return;
    }
    coordinator_->set_forecast_location(latitude, longitude, request->arg("source").c_str(), data, sizeof(data));
    send_ok_(request, data);
  } else if (strcmp(path, "/forecast/fetch") == 0) {
    coordinator_->request_forecast_fetch(data, sizeof(data));
    send_ok_(request, data);
  } else if (strncmp(path, "/zones/", 7) == 0) {
    const char *room_id = path + 7;
    if (room_id[0] == '\0' || strchr(room_id, '/') != nullptr) {
      send_error_(request, 404, "unknown_route", "Unknown zone route");
      return;
    }
    size_t node_index = 0;
    size_t zone_index = 0;
    if (!parse_size_arg(request, "node_index", &node_index) ||
        !parse_size_arg(request, "zone_index", &zone_index)) {
      send_error_(request, 400, "missing_param", "node_index and zone_index are required");
      return;
    }
    coordinator_->bind_room(room_id, request->arg("name").c_str(), node_index, zone_index, data, sizeof(data));
    send_ok_(request, data);
  } else {
    send_error_(request, 404, "unknown_route", "Unknown route");
  }
}

}  // namespace lune_touch_dashboard
}  // namespace esphome
