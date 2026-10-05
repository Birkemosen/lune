import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID

CODEOWNERS = ["@birkemosen"]
DEPENDENCIES = ["nimble_hub", "lv6_config_store", "wifi"]

CONF_HUB_ID = "hub_id"
CONF_CONFIG_STORE_ID = "config_store_id"
CONF_WIFI_SETTLE = "wifi_settle"
CONF_IDLE_GRACE = "idle_grace"

lv6_ns = cg.esphome_ns.namespace("lv6")
nimble_hub_ns = cg.esphome_ns.namespace("nimble_hub")
Lv6BleDemand = lv6_ns.class_("Lv6BleDemand", cg.Component)
Lv6ConfigStore = lv6_ns.class_("Lv6ConfigStore", cg.Component)
NimbleHub = nimble_hub_ns.class_("NimbleHub", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Lv6BleDemand),
        cv.Required(CONF_HUB_ID): cv.use_id(NimbleHub),
        cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Lv6ConfigStore),
        cv.Optional(CONF_WIFI_SETTLE, default="15s"): cv.positive_time_period_milliseconds,
        cv.Optional(CONF_IDLE_GRACE, default="30s"): cv.positive_time_period_milliseconds,
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    hub = await cg.get_variable(config[CONF_HUB_ID])
    cg.add(var.set_hub(hub))

    store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
    cg.add(var.set_config_store(store))

    cg.add(var.set_wifi_settle_ms(config[CONF_WIFI_SETTLE]))
    cg.add(var.set_idle_grace_ms(config[CONF_IDLE_GRACE]))
