#pragma once

#include "esphome/components/web_server_base/web_server_base.h"
#include "esphome/core/component.h"
#include "esphome/core/progmem.h"
#include "../lune_touch_coordinator/lune_touch_coordinator.h"
#include <ArduinoJson.h>
#include <esp_http_server.h>
#include <string>

#ifdef LUNE_TOUCH_HAS_DASHBOARD_JS
extern const uint8_t LUNE_TOUCH_DASHBOARD_JS_DATA[] PROGMEM;
extern const size_t LUNE_TOUCH_DASHBOARD_JS_SIZE;
#endif

namespace esphome {
namespace lune_touch_dashboard {

struct ApiRequest {
  AsyncWebServerRequest *async{nullptr};
  httpd_req_t *raw{nullptr};
  const char *query{nullptr};
  const char *form_body{nullptr};
  const JsonDocument *json_body{nullptr};
};

class LuneTouchDashboard : public Component, public AsyncWebHandler {
 public:
  void setup() override;
  float get_setup_priority() const override { return setup_priority::WIFI - 1.0f; }

  void set_web_server_base(web_server_base::WebServerBase *base) { base_ = base; }
  void set_coordinator(lune_touch_coordinator::LuneTouchCoordinator *coordinator) {
    coordinator_ = coordinator;
  }

  bool canHandle(AsyncWebServerRequest *request) const override;
  void handleRequest(AsyncWebServerRequest *request) override;
  bool isRequestHandlerTrivial() const override { return false; }

 protected:
  void handle_root_(AsyncWebServerRequest *request);
  void handle_js_(AsyncWebServerRequest *request);
  void handle_v1_(AsyncWebServerRequest *request, const char *path);
  void send_text_(AsyncWebServerRequest *request, int code, const char *content_type,
                  const char *body, bool cors = false, const char *cache_control = nullptr);
  void send_gzip_chunked_(AsyncWebServerRequest *request, const char *content_type,
                          const uint8_t *data, size_t length, const char *cache_control);
  void send_json_(AsyncWebServerRequest *request, const char *body);
  void send_ok_(AsyncWebServerRequest *request, const char *data = "{}");
  void send_error_(AsyncWebServerRequest *request, int code, const char *err_code, const char *message);
  void send_write_result_(AsyncWebServerRequest *request, bool accepted, int failure_code = 400);
  void handle_v1_post_(ApiRequest &api, const char *path);
  void send_json_(ApiRequest &api, const char *body);
  void send_ok_(ApiRequest &api, const char *data = "{}");
  void send_error_(ApiRequest &api, int code, const char *err_code, const char *message);
  void send_write_result_(ApiRequest &api, bool accepted, int failure_code = 400);
  esp_err_t handle_raw_post_(httpd_req_t *request);
  static esp_err_t raw_post_handler_(httpd_req_t *request);

  web_server_base::WebServerBase *base_{nullptr};
  lune_touch_coordinator::LuneTouchCoordinator *coordinator_{nullptr};
  char data_buf_[16384]{};
  char response_buf_[13312]{};
};

}  // namespace lune_touch_dashboard
}  // namespace esphome
