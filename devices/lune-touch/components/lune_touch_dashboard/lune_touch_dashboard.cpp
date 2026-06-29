#include "lune_touch_dashboard.h"

#include "esphome/core/log.h"
#include <ctime>
#include <cstring>

namespace esphome {
namespace lune_touch_dashboard {

static const char *const TAG = "lune_touch_dashboard";
static constexpr const char API_PREFIX[] = "/api/lune-touch/v1";
static constexpr size_t API_PREFIX_LEN = sizeof(API_PREFIX) - 1;

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

  if (strcmp(path, "/nodes/scan") == 0) {
    send_ok_(request, "{\"scan\":\"queued\",\"found\":[]}");
  } else if (strcmp(path, "/nodes") == 0) {
    send_ok_(request, "{\"result\":\"stored\"}");
  } else if (strstr(path, "/remove") != nullptr) {
    send_ok_(request, "{\"result\":\"removed\"}");
  } else if (strstr(path, "/setpoint-command") != nullptr) {
    send_ok_(request, "{\"result\":\"queued\"}");
  } else if (strcmp(path, "/forecast/settings") == 0) {
    send_ok_(request, "{\"result\":\"saved\"}");
  } else if (strcmp(path, "/forecast/fetch") == 0) {
    send_ok_(request, "{\"result\":\"queued\"}");
  } else if (strncmp(path, "/zones/", 7) == 0) {
    send_ok_(request, "{\"result\":\"stored\"}");
  } else {
    send_error_(request, 404, "unknown_route", "Unknown route");
  }
}

}  // namespace lune_touch_dashboard
}  // namespace esphome
