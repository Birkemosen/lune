import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID
from esphome.components import sensor

CODEOWNERS = ["@birkemosen"]
DEPENDENCIES = ["nimble_hub", "lv6_zone_controller"]

CONF_HUB_ID = "hub_id"
CONF_ZONE_CONTROLLER_ID = "zone_controller_id"
CONF_ZONE_TEMP_SENSORS = "zone_temp_sensors"

lv6_ns = cg.esphome_ns.namespace("lv6")
nimble_hub_ns = cg.esphome_ns.namespace("nimble_hub")
Lv6BthomeBridge = lv6_ns.class_("Lv6BthomeBridge", cg.Component)
Lv6ZoneController = lv6_ns.class_("Lv6ZoneController", cg.Component)
NimbleHub = nimble_hub_ns.class_("NimbleHub", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Lv6BthomeBridge),
        cv.Required(CONF_HUB_ID): cv.use_id(NimbleHub),
        cv.Required(CONF_ZONE_CONTROLLER_ID): cv.use_id(Lv6ZoneController),
        cv.Required(CONF_ZONE_TEMP_SENSORS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(min=6, max=6)
        ),
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    hub = await cg.get_variable(config[CONF_HUB_ID])
    cg.add(var.set_hub(hub))

    zones = await cg.get_variable(config[CONF_ZONE_CONTROLLER_ID])
    cg.add(var.set_zone_controller(zones))

    for i, sensor_id in enumerate(config[CONF_ZONE_TEMP_SENSORS]):
        sens = await cg.get_variable(sensor_id)
        cg.add(var.set_zone_temp_sensor(i, sens))
