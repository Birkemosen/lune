import esphome.codegen as cg
from esphome import automation
import esphome.config_validation as cv
from esphome.components.esp32 import (
    add_idf_sdkconfig_option,
    request_bluetooth,
    request_software_coexistence,
)
from esphome.const import (
    CONF_ACTIVE,
    CONF_CONTINUOUS,
    CONF_ENABLE_ON_BOOT,
    CONF_ID,
    CONF_INTERVAL,
)
from esphome.core import CORE

CODEOWNERS = ["@birkemosen"]
DEPENDENCIES = ["esp32"]
CONF_WINDOW = "window"

nimble_hub_ns = cg.esphome_ns.namespace("nimble_hub")
NimbleHub = nimble_hub_ns.class_("NimbleHub", cg.Component)
EnableAction = nimble_hub_ns.class_("EnableAction", automation.Action)
DisableAction = nimble_hub_ns.class_("DisableAction", automation.Action)
StartScanAction = nimble_hub_ns.class_("StartScanAction", automation.Action)
StopScanAction = nimble_hub_ns.class_("StopScanAction", automation.Action)

CONFIG_SCHEMA = cv.All(
    cv.only_on_esp32,
    cv.Schema(
        {
            cv.GenerateID(): cv.declare_id(NimbleHub),
            cv.Optional(CONF_ENABLE_ON_BOOT, default=False): cv.boolean,
            # Quieter 50% duty than 320/160: longer quiet gaps for WiFi coexistence.
            cv.Optional(CONF_INTERVAL, default="640ms"): cv.positive_time_period_milliseconds,
            cv.Optional(CONF_WINDOW, default="320ms"): cv.positive_time_period_milliseconds,
            cv.Optional(CONF_ACTIVE, default=False): cv.boolean,
        }
    ).extend(cv.COMPONENT_SCHEMA),
)


def _apply_nimble_sdkconfig() -> None:
    """Select ESP-IDF NimBLE host: Observer + Broadcaster, no GATT."""
    request_bluetooth()
    request_software_coexistence()

    add_idf_sdkconfig_option("CONFIG_BT_ENABLED", True)
    # Choice BT_HOST — selecting NimBLE disables Bluedroid.
    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_ENABLED", True)

    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_ROLE_OBSERVER", True)
    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_ROLE_BROADCASTER", True)
    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_ROLE_CENTRAL", False)
    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_ROLE_PERIPHERAL", False)

    # Kconfig range is 1..N; keep the floor even with connections unused.
    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_MAX_CONNECTIONS", 1)
    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_MEM_ALLOC_MODE_EXTERNAL", True)
    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_SECURITY_ENABLE", False)
    add_idf_sdkconfig_option("CONFIG_BT_NIMBLE_HOST_TASK_STACK_SIZE", 8192)


async def to_code(config):
    if not CORE.is_esp32:
        raise cv.Invalid("nimble_hub requires ESP32 with ESP-IDF")

    _apply_nimble_sdkconfig()
    cg.add_define("USE_NIMBLE_HUB")

    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)
    cg.add(var.set_enable_on_boot(config[CONF_ENABLE_ON_BOOT]))
    cg.add(
        var.set_default_scan(
            config[CONF_INTERVAL],
            config[CONF_WINDOW],
            config[CONF_ACTIVE],
        )
    )


@automation.register_action(
    "nimble_hub.enable",
    EnableAction,
    cv.Schema({cv.GenerateID(): cv.use_id(NimbleHub)}),
    synchronous=True,
)
async def nimble_hub_enable_to_code(config, action_id, template_arg, args):
    parent = await cg.get_variable(config[CONF_ID])
    return cg.new_Pvariable(action_id, template_arg, parent)


@automation.register_action(
    "nimble_hub.disable",
    DisableAction,
    cv.Schema({cv.GenerateID(): cv.use_id(NimbleHub)}),
    synchronous=True,
)
async def nimble_hub_disable_to_code(config, action_id, template_arg, args):
    parent = await cg.get_variable(config[CONF_ID])
    return cg.new_Pvariable(action_id, template_arg, parent)


@automation.register_action(
    "nimble_hub.start_scan",
    StartScanAction,
    cv.Schema(
        {
            cv.GenerateID(): cv.use_id(NimbleHub),
            cv.Optional(CONF_CONTINUOUS, default=True): cv.boolean,
        }
    ),
    synchronous=True,
)
async def nimble_hub_start_scan_to_code(config, action_id, template_arg, args):
    parent = await cg.get_variable(config[CONF_ID])
    var = cg.new_Pvariable(action_id, template_arg, parent)
    cg.add(var.set_continuous(config[CONF_CONTINUOUS]))
    return var


@automation.register_action(
    "nimble_hub.stop_scan",
    StopScanAction,
    cv.Schema({cv.GenerateID(): cv.use_id(NimbleHub)}),
    synchronous=True,
)
async def nimble_hub_stop_scan_to_code(config, action_id, template_arg, args):
    parent = await cg.get_variable(config[CONF_ID])
    return cg.new_Pvariable(action_id, template_arg, parent)
