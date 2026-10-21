// =============================================================================
// Problem texts — titles and messages for Home Assistant notifications
// =============================================================================
// Pure (host-tested with the tracker). Every text the event carries comes from
// these tables; raw firmware state strings (fault enum names etc.) are never
// sent. The wording follows the V6 web i18n catalogue (web/i18n/{da,en}.json,
// `fault.*`).
//
// TODO(i18n): V6 firmware has no device language yet (the web UI picks one per
// browser), so lv6_problems sends Danish. When a device language setting
// exists, pass it as `Lang` instead of Lang::DA.
// =============================================================================

#pragma once

#include <cstddef>
#include <cstdint>
#include <cstdio>

#include "../lv6_config_store/lv6_types.h"
#include "problem_tracker.h"

namespace lv6 {
namespace problems {

enum class Lang : uint8_t { DA = 0, EN = 1 };

enum class Kind : uint8_t {
  VALVE_FAULT = 0,        ///< variant = FaultCode
  VALVE_STALL = 1,        ///< variant = FaultCode (STALL / BLOCKED)
  VALVE_CALIBRATION = 2,  ///< calibration failed after all retries
  SENSOR_ROOM = 3,        ///< variant = TempSource
  SENSOR_FLOW = 4,
  SENSOR_RETURN = 5,
  BATTERY = 6,            ///< value = battery %
  HUMIDITY = 7,           ///< variant 1 = high, 0 = low; value = RH %
};

static constexpr uint8_t HUMIDITY_HIGH = 1;
static constexpr uint8_t HUMIDITY_LOW = 0;

/// Contract category.
inline const char *category(Kind k) {
  switch (k) {
    case Kind::VALVE_FAULT:
    case Kind::VALVE_STALL:
    case Kind::VALVE_CALIBRATION:
      return "valve";
    case Kind::SENSOR_ROOM:
    case Kind::SENSOR_FLOW:
    case Kind::SENSOR_RETURN:
      return "sensor";
    case Kind::BATTERY:
      return "sensor_battery";
    case Kind::HUMIDITY:
      return "humidity";
  }
  return "sensor";
}

/// First part of the stable problem id (`<kind>:<instance>`).
inline const char *id_kind(Kind k) {
  switch (k) {
    case Kind::VALVE_FAULT: return "valve.fault";
    case Kind::VALVE_STALL: return "valve.stall";
    case Kind::VALVE_CALIBRATION: return "valve.calibration";
    case Kind::SENSOR_ROOM: return "sensor.room";
    case Kind::SENSOR_FLOW: return "sensor.flow";
    case Kind::SENSOR_RETURN: return "sensor.return";
    case Kind::BATTERY: return "sensor_battery.low";
    case Kind::HUMIDITY: return "humidity.out_of_range";
  }
  return "problem";
}

inline const char *severity_name(Severity s) { return s == Severity::ERROR ? "error" : "warning"; }

/// The zone's own name, or «Zone N» when it has none.
inline void zone_label(Lang, uint8_t zone, const char *name, char *out, size_t cap) {
  if (name != nullptr && name[0] != '\0')
    snprintf(out, cap, "%s", name);
  else
    snprintf(out, cap, "Zone %u", static_cast<unsigned>(zone) + 1u);
}

/// What the motor reported, as a sentence (web i18n `fault.*`).
inline const char *fault_text(Lang lang, uint8_t code) {
  const bool da = lang == Lang::DA;
  switch (static_cast<FaultCode>(code)) {
    case FaultCode::OPEN_CIRCUIT:
      return da ? "Ingen forbindelse til motoren" : "No connection to the motor";
    case FaultCode::BLOCKED:
    case FaultCode::STALL:
      return da ? "Motoren gik i stå" : "The motor stalled";
    case FaultCode::TIMEOUT:
      return da ? "Motoren nåede ikke endestop i tide" : "The motor did not reach its end stop in time";
    case FaultCode::OVERCURRENT:
      return da ? "For høj strøm i motoren" : "Too much current in the motor";
    case FaultCode::THERMAL:
      return da ? "Motordriveren blev for varm" : "The motor driver overheated";
    case FaultCode::MECHANICAL_OVERRUN:
      return da ? "Motoren fandt ikke endestop" : "The motor did not find its end stop";
    default:
      return da ? "Fejlsignal fra motordriveren" : "Fault signal from the motor driver";
  }
}

inline void title(Lang lang, Kind k, uint8_t variant, const char *room, char *out, size_t cap) {
  const bool da = lang == Lang::DA;
  switch (k) {
    case Kind::VALVE_FAULT:
      snprintf(out, cap, da ? "%s: motorfejl" : "%s: motor fault", room);
      return;
    case Kind::VALVE_STALL:
      snprintf(out, cap, da ? "%s: motoren gik i stå" : "%s: motor stalled", room);
      return;
    case Kind::VALVE_CALIBRATION:
      snprintf(out, cap, da ? "%s: ventilen kunne ikke indlæres" : "%s: valve learning failed", room);
      return;
    case Kind::SENSOR_ROOM:
      snprintf(out, cap, da ? "%s: ingen rumtemperatur" : "%s: no room temperature", room);
      return;
    case Kind::SENSOR_FLOW:
      snprintf(out, cap, "%s", da ? "Ingen fremløbstemperatur" : "No flow temperature");
      return;
    case Kind::SENSOR_RETURN:
      snprintf(out, cap, "%s", da ? "Ingen returtemperatur" : "No return temperature");
      return;
    case Kind::BATTERY:
      snprintf(out, cap, da ? "%s: lavt batteri i føleren" : "%s: sensor battery low", room);
      return;
    case Kind::HUMIDITY:
      if (variant == HUMIDITY_HIGH)
        snprintf(out, cap, da ? "%s: høj luftfugtighed" : "%s: high humidity", room);
      else
        snprintf(out, cap, da ? "%s: lav luftfugtighed" : "%s: low humidity", room);
      return;
  }
  if (cap > 0)
    out[0] = '\0';
}

inline void message(Lang lang, Kind k, Severity sev, uint8_t variant, uint8_t value, char *out, size_t cap) {
  const bool da = lang == Lang::DA;
  const unsigned v = value;
  switch (k) {
    case Kind::VALVE_FAULT:
      snprintf(out, cap,
               da ? "%s. Tjek aktuatoren og kablet, og nulstil så fejlen på Lune V6."
                  : "%s. Check the actuator and its cable, then reset the fault on Lune V6.",
               fault_text(lang, variant));
      return;
    case Kind::VALVE_STALL:
      snprintf(out, cap, "%s",
               da ? "Motoren stoppede, før den nåede endestop. Tjek, at ventilstiften kan bevæge sig frit, "
                    "og nulstil så fejlen på Lune V6."
                  : "The motor stopped before reaching its end stop. Check that the valve pin moves freely, "
                    "then reset the fault on Lune V6.");
      return;
    case Kind::VALVE_CALIBRATION:
      snprintf(out, cap, "%s",
               da ? "Motoren kunne ikke lære ventilens vandring. Tjek, at aktuatoren sidder helt nede på "
                    "ventilen, og start indlæringen igen."
                  : "The motor could not learn the valve's travel. Check that the actuator sits fully down on "
                    "the valve, then start learning again.");
      return;
    case Kind::SENSOR_ROOM: {
      const char *hint;
      switch (static_cast<TempSource>(variant)) {
        case TempSource::BLE_SENSOR:
          hint = da ? "Tjek føleren og dens batteri." : "Check the sensor and its battery.";
          break;
        case TempSource::EXTERNAL:
          hint = da ? "Tjek den enhed, der sender temperaturen." : "Check the device that sends the temperature.";
          break;
        default:
          hint = da ? "Tjek føleren og kablet." : "Check the probe and its cable.";
          break;
      }
      snprintf(out, cap,
               da ? "Lune V6 har ikke fået en rumtemperatur i 30 min. %s"
                  : "Lune V6 has had no room temperature for 30 min. %s",
               hint);
      return;
    }
    case Kind::SENSOR_FLOW:
      snprintf(out, cap, "%s",
               da ? "Fremløbsføleren på fordeleren har ikke givet en måling i 30 min. Tjek føleren og kablet."
                  : "The manifold's flow probe has given no reading for 30 min. Check the probe and its cable.");
      return;
    case Kind::SENSOR_RETURN:
      snprintf(out, cap, "%s",
               da ? "Returføleren på fordeleren har ikke givet en måling i 30 min. Tjek føleren og kablet."
                  : "The manifold's return probe has given no reading for 30 min. Check the probe and its cable.");
      return;
    case Kind::BATTERY:
      if (sev == Severity::ERROR)
        snprintf(out, cap,
                 da ? "Batteriet i rumføleren er næsten tomt (%u %%). Skift det nu."
                    : "The room sensor's battery is almost empty (%u %%). Replace it now.",
                 v);
      else
        snprintf(out, cap,
                 da ? "Batteriet i rumføleren er på %u %%. Skift det snart."
                    : "The room sensor's battery is at %u %%. Replace it soon.",
                 v);
      return;
    case Kind::HUMIDITY:
      if (variant == HUMIDITY_HIGH)
        snprintf(out, cap,
                 da ? "Luftfugtigheden har været over 60 %% i en time (nu %u %%). Luft ud."
                    : "Humidity has been above 60 %% for an hour (now %u %%). Air the room.",
                 v);
      else
        snprintf(out, cap,
                 da ? "Luftfugtigheden har været under 40 %% i en time (nu %u %%)."
                    : "Humidity has been below 40 %% for an hour (now %u %%).",
                 v);
      return;
  }
  if (cap > 0)
    out[0] = '\0';
}

inline const char *cleared_message(Lang lang) {
  return lang == Lang::DA ? "Problemet er løst." : "The problem is resolved.";
}

// ---- Conditions (hysteresis per contract) -----------------------------------

static constexpr uint32_t SENSOR_HOLD_MS = 30u * 60u * 1000u;   ///< «missing for 30 min»
static constexpr uint32_t HUMIDITY_HOLD_MS = 60u * 60u * 1000u; ///< «for 1 h»

/// Battery: ≤ 15 % warning, ≤ 5 % error, clears at ≥ 25 %. `pct` < 0 = unknown.
inline Input battery_input(int pct, Severity *sev) {
  if (pct < 0)
    return Input::UNKNOWN;
  if (pct <= 5) {
    *sev = Severity::ERROR;
    return Input::RAISE;
  }
  if (pct <= 15) {
    *sev = Severity::WARNING;
    return Input::RAISE;
  }
  return pct >= 25 ? Input::CLEAR : Input::NEUTRAL;
}

/// Humidity: > 60 % or < 40 % raises; the raised side clears at ≤ 58 % / ≥ 42 %.
/// `active_variant` is the side currently raised (ignored when `active` is false).
inline Input humidity_input(float rh, bool active, uint8_t active_variant, uint8_t *variant) {
  if (!(rh == rh))  // NAN
    return Input::UNKNOWN;
  if (active) {
    *variant = active_variant;
    if (active_variant == HUMIDITY_HIGH)
      return rh <= 58.0f ? Input::CLEAR : Input::NEUTRAL;
    return rh >= 42.0f ? Input::CLEAR : Input::NEUTRAL;
  }
  if (rh > 60.0f) {
    *variant = HUMIDITY_HIGH;
    return Input::RAISE;
  }
  if (rh < 40.0f) {
    *variant = HUMIDITY_LOW;
    return Input::RAISE;
  }
  return Input::NEUTRAL;
}

}  // namespace problems
}  // namespace lv6
