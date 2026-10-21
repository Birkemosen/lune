# =============================================================================
# LV6 Problems — problem notifications through Home Assistant
# =============================================================================
# Fires `esphome.lune_problem` events (raised / cleared) over the native API and
# exposes «Active problems» / «Problems». Contract:
# shared/contracts/lune_notifications_contract_v1.md. Events need
# `api: homeassistant_services: true` (packages/network/api.yaml) and, in Home
# Assistant, «Allow the device to perform Home Assistant actions».
# =============================================================================

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.components import sensor, text_sensor
from esphome.const import CONF_ID, STATE_CLASS_MEASUREMENT

CODEOWNERS = ["@birkemosen"]
DEPENDENCIES = ["lv6_zone_controller", "lv6_valve_controller", "lv6_config_store"]
AUTO_LOAD = ["sensor", "text_sensor"]

CONF_ZONE_CONTROLLER_ID = "zone_controller_id"
CONF_VALVE_CONTROLLER_ID = "valve_controller_id"
CONF_CONFIG_STORE_ID = "config_store_id"
CONF_ACTIVE_PROBLEMS = "active_problems"
CONF_PROBLEMS = "problems"

lv6_ns = cg.esphome_ns.namespace("lv6")
Lv6Problems = lv6_ns.class_("Lv6Problems", cg.PollingComponent)
Lv6ZoneController = lv6_ns.class_("Lv6ZoneController", cg.Component)
Lv6ValveController = lv6_ns.class_("Lv6ValveController", cg.Component)
Lv6ConfigStore = lv6_ns.class_("Lv6ConfigStore", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Lv6Problems),
        cv.Required(CONF_ZONE_CONTROLLER_ID): cv.use_id(Lv6ZoneController),
        cv.Required(CONF_VALVE_CONTROLLER_ID): cv.use_id(Lv6ValveController),
        cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Lv6ConfigStore),
        cv.Optional(CONF_ACTIVE_PROBLEMS): sensor.sensor_schema(
            accuracy_decimals=0,
            state_class=STATE_CLASS_MEASUREMENT,
            icon="mdi:alert-circle-outline",
        ),
        cv.Optional(CONF_PROBLEMS): text_sensor.text_sensor_schema(
            icon="mdi:alert-circle-outline",
        ),
    }
).extend(cv.polling_component_schema("10s"))


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    cg.add(var.set_zone_controller(await cg.get_variable(config[CONF_ZONE_CONTROLLER_ID])))
    cg.add(var.set_valve_controller(await cg.get_variable(config[CONF_VALVE_CONTROLLER_ID])))
    cg.add(var.set_config_store(await cg.get_variable(config[CONF_CONFIG_STORE_ID])))

    if CONF_ACTIVE_PROBLEMS in config:
        sens = await sensor.new_sensor(config[CONF_ACTIVE_PROBLEMS])
        cg.add(var.set_active_sensor(sens))
    if CONF_PROBLEMS in config:
        ts = await text_sensor.new_text_sensor(config[CONF_PROBLEMS])
        cg.add(var.set_problems_text(ts))
