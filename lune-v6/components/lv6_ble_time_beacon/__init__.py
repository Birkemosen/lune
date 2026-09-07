import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID
from esphome.components import time, esp32_ble_tracker

CONF_TIME_ID = "time_id"

CODEOWNERS = ["@birkemosen"]
DEPENDENCIES = ["esp32_ble_tracker", "time", "lv6_config_store"]
AUTO_LOAD = ["esp32_ble"]

CONF_CONFIG_STORE_ID = "config_store_id"
CONF_BLE_TRACKER_ID = "ble_tracker_id"

lv6_ns = cg.esphome_ns.namespace("lv6")
Lv6BleTimeBeacon = lv6_ns.class_("Lv6BleTimeBeacon", cg.Component)
Lv6ConfigStore = lv6_ns.class_("Lv6ConfigStore", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Lv6BleTimeBeacon),
        cv.Required(CONF_TIME_ID): cv.use_id(time.RealTimeClock),
        cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Lv6ConfigStore),
        cv.Required(CONF_BLE_TRACKER_ID): cv.use_id(esp32_ble_tracker.ESP32BLETracker),
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    clock = await cg.get_variable(config[CONF_TIME_ID])
    cg.add(var.set_time(clock))

    store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
    cg.add(var.set_config_store(store))

    tracker = await cg.get_variable(config[CONF_BLE_TRACKER_ID])
    cg.add(var.set_ble_tracker(tracker))
