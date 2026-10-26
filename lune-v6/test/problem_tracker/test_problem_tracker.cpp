#include "problem_texts.h"
#include "problem_tracker.h"

#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>

using namespace lv6;
using namespace lv6::problems;

static void expect(bool cond, const char *msg) {
  if (!cond) {
    std::fprintf(stderr, "FAIL  %s\n", msg);
    std::exit(1);
  }
  std::printf("PASS  %s\n", msg);
}

static constexpr uint32_t MIN_MS = 60u * 1000u;
static constexpr uint32_t HOLD = DEFAULT_HOLD_MS;

static void test_hold() {
  Slot s{};
  uint32_t t = 1000;
  expect(!step(s, Input::RAISE, t, HOLD), "first raise only starts the hold");
  expect(!s.active() && due(s, t) == Event::NONE, "nothing active or due during the hold");
  t += 9 * MIN_MS;
  expect(!step(s, Input::RAISE, t, HOLD), "9 min: still holding");
  step(s, Input::CLEAR, t + 1, HOLD);
  t += 2 * MIN_MS;
  expect(!step(s, Input::RAISE, t, HOLD), "blip: a clear restarts the hold");
  t += 10 * MIN_MS;
  expect(step(s, Input::RAISE, t, HOLD, Severity::ERROR, 3), "10 min held: raised");
  expect(s.active() && s.severity == Severity::ERROR && s.variant == 3, "severity and variant stored");
  expect(due(s, t) == Event::RAISED, "raised event due");
}

static void test_unknown_and_neutral() {
  Slot s{};
  step(s, Input::RAISE, 0, HOLD);
  expect(!step(s, Input::UNKNOWN, 5 * MIN_MS, HOLD), "missing data neither raises nor clears");
  expect(step(s, Input::RAISE, 10 * MIN_MS, HOLD), "hold kept running through missing data");
  expect(!step(s, Input::NEUTRAL, 11 * MIN_MS, HOLD) && s.active(), "hysteresis band keeps an active problem");
  Slot n{};
  step(n, Input::RAISE, 0, HOLD);
  step(n, Input::NEUTRAL, 5 * MIN_MS, HOLD);
  expect(!step(n, Input::RAISE, 11 * MIN_MS, HOLD), "hysteresis band restarts a pending hold");
  Slot u{};
  for (uint32_t t = 0; t < 120 * MIN_MS; t += MIN_MS)
    step(u, Input::UNKNOWN, t, HOLD);
  expect(!u.active(), "missing data alone never raises");
}

static void test_send_and_clear() {
  Slot s{};
  step(s, Input::RAISE, 0, 0);
  expect(s.active() && due(s, 0) == Event::RAISED, "zero hold raises at once");
  sent(s, Event::RAISED, true, 0);
  expect(due(s, 0) == Event::NONE && s.has(Slot::SENT), "delivered raise is recorded");
  expect(step(s, Input::CLEAR, MIN_MS, 0) && !s.active(), "clear deactivates");
  expect(due(s, MIN_MS) == Event::CLEARED, "cleared due after a sent raise");
  sent(s, Event::CLEARED, true, MIN_MS);
  expect(due(s, MIN_MS) == Event::NONE && !s.has(Slot::SENT), "cleared sent once");

  Slot d{};
  step(d, Input::RAISE, 0, 0);
  sent(d, Event::RAISED, false, 0);
  expect(d.active() && due(d, 0) == Event::NONE, "undelivered raise is dropped, not retried");
  step(d, Input::CLEAR, MIN_MS, 0);
  expect(due(d, MIN_MS) == Event::NONE, "no cleared for a raise that was never sent");
}

static void test_once_per_hour() {
  Slot s{};
  uint32_t t = 0xFFFFFFFFu - 5 * MIN_MS;  // across the millis() wrap
  step(s, Input::RAISE, t, 0);
  sent(s, Event::RAISED, true, t);
  step(s, Input::CLEAR, t + 10 * MIN_MS, 0);
  sent(s, Event::CLEARED, true, t + 10 * MIN_MS);
  step(s, Input::RAISE, t + 20 * MIN_MS, 0);
  expect(s.active() && due(s, t + 20 * MIN_MS) == Event::NONE, "re-raise within the hour waits");
  expect(due(s, t + 59 * MIN_MS) == Event::NONE, "59 min: still waiting");
  expect(due(s, t + 60 * MIN_MS) == Event::RAISED, "60 min after the last raise: sent");

  Slot q{};
  step(q, Input::RAISE, 0, 0);
  sent(q, Event::RAISED, true, 0);
  step(q, Input::CLEAR, 5 * MIN_MS, 0);
  sent(q, Event::CLEARED, true, 5 * MIN_MS);
  step(q, Input::RAISE, 10 * MIN_MS, 0);
  step(q, Input::CLEAR, 20 * MIN_MS, 0);
  expect(due(q, 90 * MIN_MS) == Event::NONE, "suppressed raise cleared before the hour: nothing sent");

  Slot p{};
  step(p, Input::RAISE, 0, 0);
  sent(p, Event::RAISED, true, 0);
  step(p, Input::CLEAR, MIN_MS, 0);
  step(p, Input::RAISE, 2 * MIN_MS, 0);
  expect(p.active() && due(p, 2 * MIN_MS) == Event::NONE,
         "back before the cleared went out: HA keeps the first raise, nothing sent");
  step(p, Input::CLEAR, 3 * MIN_MS, 0);
  expect(due(p, 3 * MIN_MS) == Event::CLEARED, "later clear still clears the sent raise");
}

static void test_escalation() {
  Slot s{};
  step(s, Input::RAISE, 0, 0, Severity::WARNING, 0, 14);
  sent(s, Event::RAISED, true, 0);
  expect(!step(s, Input::RAISE, MIN_MS, 0, Severity::WARNING, 0, 13), "same severity: no new raise");
  expect(step(s, Input::RAISE, 2 * MIN_MS, 0, Severity::ERROR, 0, 4), "warning → error escalates");
  expect(s.severity == Severity::ERROR && s.value == 4, "escalated severity and value stored");
  expect(due(s, 2 * MIN_MS) == Event::NONE && due(s, 60 * MIN_MS) == Event::RAISED,
         "escalation is a raise, at most once per hour");
}

static void test_battery() {
  Severity sev = Severity::WARNING;
  expect(battery_input(-1, &sev) == Input::UNKNOWN, "battery unknown");
  expect(battery_input(16, &sev) == Input::NEUTRAL, "16 %: no raise");
  expect(battery_input(15, &sev) == Input::RAISE && sev == Severity::WARNING, "15 %: warning");
  expect(battery_input(5, &sev) == Input::RAISE && sev == Severity::ERROR, "5 %: error");
  expect(battery_input(24, &sev) == Input::NEUTRAL, "24 %: still in the band");
  expect(battery_input(25, &sev) == Input::CLEAR, "25 %: clears");
}

static void test_humidity() {
  uint8_t v = 0xFF;
  expect(humidity_input(NAN, false, 0, &v) == Input::UNKNOWN, "humidity unknown");
  expect(humidity_input(60.0f, false, 0, &v) == Input::NEUTRAL, "60 %: no raise");
  expect(humidity_input(60.5f, false, 0, &v) == Input::RAISE && v == HUMIDITY_HIGH, "> 60 %: high");
  expect(humidity_input(39.5f, false, 0, &v) == Input::RAISE && v == HUMIDITY_LOW, "< 40 %: low");
  expect(humidity_input(59.0f, true, HUMIDITY_HIGH, &v) == Input::NEUTRAL, "high active at 59 %: stays");
  expect(humidity_input(58.0f, true, HUMIDITY_HIGH, &v) == Input::CLEAR, "high clears at 58 %");
  expect(humidity_input(41.0f, true, HUMIDITY_LOW, &v) == Input::NEUTRAL, "low active at 41 %: stays");
  expect(humidity_input(42.0f, true, HUMIDITY_LOW, &v) == Input::CLEAR, "low clears at 42 %");

  Slot s{};
  uint32_t t = 0;
  for (; t <= HUMIDITY_HOLD_MS; t += 10 * 1000u) {
    uint8_t var = 0;
    step(s, humidity_input(65.0f, s.active(), s.variant, &var), t, HUMIDITY_HOLD_MS, Severity::WARNING, var, 65);
  }
  expect(s.active() && s.variant == HUMIDITY_HIGH, "65 % for an hour: high humidity raised");
}

static void test_texts() {
  char room[24], buf[256];
  zone_label(Lang::DA, 2, "", room, sizeof(room));
  expect(std::strcmp(room, "Zone 3") == 0, "unnamed zone: «Zone 3»");
  zone_label(Lang::DA, 0, "Stue", room, sizeof(room));
  title(Lang::DA, Kind::BATTERY, 0, room, buf, sizeof(buf));
  expect(std::strcmp(buf, "Stue: lavt batteri i føleren") == 0, "battery title");
  message(Lang::DA, Kind::BATTERY, Severity::WARNING, 0, 12, buf, sizeof(buf));
  expect(std::strcmp(buf, "Batteriet i rumføleren er på 12 %. Skift det snart.") == 0, "battery message");
  message(Lang::DA, Kind::VALVE_FAULT, Severity::ERROR, static_cast<uint8_t>(FaultCode::OPEN_CIRCUIT), 0, buf,
          sizeof(buf));
  expect(std::strstr(buf, "Ingen forbindelse til motoren.") == buf, "fault message is translated");
  expect(std::strstr(buf, "OPEN_CIRCUIT") == nullptr, "no raw firmware fault name");
  title(Lang::EN, Kind::HUMIDITY, HUMIDITY_LOW, room, buf, sizeof(buf));
  expect(std::strcmp(buf, "Stue: low humidity") == 0, "English title");
  expect(std::strcmp(category(Kind::VALVE_STALL), "valve") == 0 &&
             std::strcmp(category(Kind::SENSOR_FLOW), "sensor") == 0 &&
             std::strcmp(category(Kind::BATTERY), "sensor_battery") == 0 &&
             std::strcmp(category(Kind::HUMIDITY), "humidity") == 0,
         "contract categories");
  // Every kind × language yields a non-empty title and message.
  for (uint8_t k = 0; k <= static_cast<uint8_t>(Kind::DEVICE_RESTART); k++)
    for (uint8_t l = 0; l < 2; l++) {
      title(static_cast<Lang>(l), static_cast<Kind>(k), 0, "Stue", buf, sizeof(buf));
      const bool t_ok = buf[0] != '\0';
      message(static_cast<Lang>(l), static_cast<Kind>(k), Severity::ERROR, 0, 50, buf, sizeof(buf));
      if (!t_ok || buf[0] == '\0' || std::strlen(buf) > 200) {
        std::fprintf(stderr, "FAIL  kind %u lang %u text\n", k, l);
        std::exit(1);
      }
    }
  expect(true, "all kinds have titles and messages ≤ 200 bytes");
  // Restart after a crash: device category, translated reason, no raw reset enum.
  expect(std::strcmp(category(Kind::DEVICE_RESTART), "device") == 0 &&
             std::strcmp(id_kind(Kind::DEVICE_RESTART), "device.restart") == 0,
         "restart: category and id");
  message(Lang::DA, Kind::DEVICE_RESTART, Severity::ERROR, RESTART_WATCHDOG, 0, buf, sizeof(buf));
  expect(std::strstr(buf, "watchdog") != nullptr && std::strstr(buf, "ESP_RST") == nullptr,
         "restart message names the reason in words");
  message(Lang::EN, Kind::DEVICE_RESTART, Severity::ERROR, RESTART_PANIC, 0, buf, sizeof(buf));
  expect(std::strstr(buf, "program error") != nullptr, "restart message (English, panic)");
}

static void test_append_utf8() {
  char out[8];
  size_t off = 0;
  expect(append_utf8(out, sizeof(out), off, "ab"), "ascii fits");
  expect(!append_utf8(out, sizeof(out), off, "cøøø"), "overflow reported");
  expect(std::strcmp(out, "abcøø") == 0, "cut on a character boundary");  // 'abc' + 2×2 bytes = 7
}

int main() {
  test_hold();
  test_unknown_and_neutral();
  test_send_and_clear();
  test_once_per_hour();
  test_escalation();
  test_battery();
  test_humidity();
  test_texts();
  test_append_utf8();
  std::printf("All problem tracker tests passed.\n");
  return 0;
}
