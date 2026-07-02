#pragma once

#include "esphome/components/web_server_base/web_server_base.h"
#include "esphome/core/component.h"
#include "esphome/core/progmem.h"
#include "../lune_touch_coordinator/lune_touch_coordinator.h"
#include <esp_http_server.h>

#ifdef LUNE_TOUCH_HAS_DASHBOARD_JS
extern const uint8_t LUNE_TOUCH_DASHBOARD_JS_DATA[] PROGMEM;
extern const size_t LUNE_TOUCH_DASHBOARD_JS_SIZE;
#endif

namespace esphome {
namespace lune_touch_dashboard {

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
  void send_json_(AsyncWebServerRequest *request, const char *body);
  void send_ok_(AsyncWebServerRequest *request, const char *data = "{}");
  void send_error_(AsyncWebServerRequest *request, int code, const char *err_code, const char *message);
  void send_write_result_(AsyncWebServerRequest *request, bool accepted, int failure_code = 400);

  web_server_base::WebServerBase *base_{nullptr};
  lune_touch_coordinator::LuneTouchCoordinator *coordinator_{nullptr};
  char data_buf_[12288]{};
  char response_buf_[13312]{};
};

}  // namespace lune_touch_dashboard
}  // namespace esphome
