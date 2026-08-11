import gzip
from pathlib import Path

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.components import web_server_base
from esphome.components.esp32 import add_extra_script
from esphome.const import CONF_ID
from esphome.core import CORE

DEPENDENCIES = ["web_server_base", "network"]
AUTO_LOAD = ["web_server_base"]

CONF_WEB_SERVER_BASE_ID = "web_server_base_id"
CONF_COORDINATOR_ID = "coordinator_id"
CONF_DASHBOARD_JS = "dashboard_js"

lune_touch_dashboard_ns = cg.esphome_ns.namespace("lune_touch_dashboard")
lune_touch_coordinator_ns = cg.esphome_ns.namespace("lune_touch_coordinator")

LuneTouchDashboard = lune_touch_dashboard_ns.class_("LuneTouchDashboard", cg.Component)
LuneTouchCoordinator = lune_touch_coordinator_ns.class_("LuneTouchCoordinator", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(CONF_ID): cv.declare_id(LuneTouchDashboard),
        cv.GenerateID(CONF_WEB_SERVER_BASE_ID): cv.use_id(web_server_base.WebServerBase),
        cv.Required(CONF_COORDINATOR_ID): cv.use_id(LuneTouchCoordinator),
        cv.Optional(CONF_DASHBOARD_JS): cv.file_,
    }
).extend(cv.COMPONENT_SCHEMA)


def _embed_gzip_as_progmem(symbol: str, file_path: str) -> None:
    with open(file_path, encoding="utf-8") as f:
        content = f.read()
    compressed = gzip.compress(content.encode("utf-8"), compresslevel=9)
    bytes_str = ", ".join(str(b) for b in compressed)
    cg.add_global(cg.RawExpression(
        f"const uint8_t {symbol}_DATA[{len(compressed)}] PROGMEM = {{{bytes_str}}};"
    ))
    cg.add_global(cg.RawExpression(f"const size_t {symbol}_SIZE = {len(compressed)};"))


async def to_code(config):
    # Probing and commanding a V6 node perform a bounded outbound HTTP request
    # from the dashboard request handler.  ESP-IDF's default httpd task stack is
    # too small for that path (the request parser, HTTP client and JSON response
    # handling can be active at once), which otherwise manifests as a reboot
    # exactly when commissioning or calling a manifold.  Keep the sizing fix
    # coupled to the dashboard component so every Touch build gets it.
    add_extra_script(
        "pre",
        "lune_touch_patch_httpd_stack.py",
        Path(__file__).parent / "lune_touch_patch_httpd_stack.py",
    )
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    wsb = await cg.get_variable(config[CONF_WEB_SERVER_BASE_ID])
    cg.add(var.set_web_server_base(wsb))

    coordinator = await cg.get_variable(config[CONF_COORDINATOR_ID])
    cg.add(var.set_coordinator(coordinator))

    if CONF_DASHBOARD_JS in config:
        path = CORE.relative_config_path(config[CONF_DASHBOARD_JS])
        _embed_gzip_as_progmem("LUNE_TOUCH_DASHBOARD_JS", path)
        cg.add_define("LUNE_TOUCH_HAS_DASHBOARD_JS")
