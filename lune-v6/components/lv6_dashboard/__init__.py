import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.components.esp32 import add_extra_script
from esphome.components import web_server_base, sensor, text_sensor, update
from esphome.const import CONF_ID
import gzip
import hashlib
from pathlib import Path
from esphome.core import CORE

DEPENDENCIES = ["web_server_base", "network", "logger"]
AUTO_LOAD = ["web_server_base"]

CONF_WEB_SERVER_BASE_ID = "web_server_base_id"
CONF_DASHBOARD_JS = "dashboard_js"
CONF_ZONE_CONTROLLER_ID = "zone_controller_id"
CONF_WIFI_SIGNAL_ID = "wifi_signal_id"
CONF_FIRMWARE_VERSION_ID = "firmware_version_id"
CONF_IP_ADDRESS_ID = "ip_address_id"
CONF_CONNECTED_SSID_ID = "connected_ssid_id"
CONF_MAC_ADDRESS_ID = "mac_address_id"
CONF_VALVE_CONTROLLER_ID = "valve_controller_id"
CONF_CONFIG_STORE_ID = "config_store_id"
CONF_BLE_TIME_BEACON_ID = "ble_time_beacon_id"
CONF_NIMBLE_HUB_ID = "nimble_hub_id"
CONF_MANIFOLD_FLOW_ID = "manifold_flow_id"
CONF_MANIFOLD_RETURN_ID = "manifold_return_id"
CONF_ZONE_TEMP_IDS = "zone_temp_ids"
CONF_ZONE_VALVE_IDS = "zone_valve_ids"
CONF_ZONE_PREHEAT_IDS = "zone_preheat_ids"
CONF_MOTOR_OPEN_RIPPLE_IDS = "motor_open_ripple_ids"
CONF_MOTOR_CLOSE_RIPPLE_IDS = "motor_close_ripple_ids"
CONF_MOTOR_OPEN_FACTOR_IDS = "motor_open_factor_ids"
CONF_MOTOR_CLOSE_FACTOR_IDS = "motor_close_factor_ids"
CONF_PROBE_TEMP_IDS = "probe_temp_ids"
CONF_ZONE_STATE_IDS = "zone_state_ids"
CONF_MOTOR_FAULT_IDS = "motor_fault_ids"
CONF_FIRMWARE_UPDATE_ID = "firmware_update_id"
CONF_RESET_REASON_ID = "reset_reason_id"

lv6_dashboard_ns = cg.esphome_ns.namespace("lv6_dashboard")
lv6_ns = cg.esphome_ns.namespace("lv6")
LV6Dashboard = lv6_dashboard_ns.class_("LV6Dashboard", cg.Component)
Lv6ZoneController = lv6_ns.class_("Lv6ZoneController", cg.Component)
Lv6ValveController = lv6_ns.class_("Lv6ValveController", cg.Component)
Lv6ConfigStore = lv6_ns.class_("Lv6ConfigStore", cg.Component)
Lv6BleTimeBeacon = lv6_ns.class_("Lv6BleTimeBeacon", cg.Component)
nimble_hub_ns = cg.esphome_ns.namespace("nimble_hub")
NimbleHub = nimble_hub_ns.class_("NimbleHub", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(CONF_ID): cv.declare_id(LV6Dashboard),
        cv.GenerateID(CONF_WEB_SERVER_BASE_ID): cv.use_id(web_server_base.WebServerBase),
        cv.Required(CONF_ZONE_CONTROLLER_ID): cv.use_id(Lv6ZoneController),
        cv.Optional(CONF_VALVE_CONTROLLER_ID): cv.use_id(Lv6ValveController),
        cv.Optional(CONF_CONFIG_STORE_ID): cv.use_id(Lv6ConfigStore),
        cv.Optional(CONF_BLE_TIME_BEACON_ID): cv.use_id(Lv6BleTimeBeacon),
        cv.Optional(CONF_NIMBLE_HUB_ID): cv.use_id(NimbleHub),
        cv.Optional(CONF_WIFI_SIGNAL_ID): cv.use_id(sensor.Sensor),
        cv.Optional(CONF_MANIFOLD_FLOW_ID): cv.use_id(sensor.Sensor),
        cv.Optional(CONF_MANIFOLD_RETURN_ID): cv.use_id(sensor.Sensor),
        cv.Optional(CONF_ZONE_TEMP_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_ZONE_VALVE_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_ZONE_PREHEAT_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_OPEN_RIPPLE_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_CLOSE_RIPPLE_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_OPEN_FACTOR_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_CLOSE_FACTOR_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_PROBE_TEMP_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=8)
        ),
        cv.Optional(CONF_FIRMWARE_VERSION_ID): cv.use_id(text_sensor.TextSensor),
        cv.Optional(CONF_IP_ADDRESS_ID): cv.use_id(text_sensor.TextSensor),
        cv.Optional(CONF_CONNECTED_SSID_ID): cv.use_id(text_sensor.TextSensor),
        cv.Optional(CONF_MAC_ADDRESS_ID): cv.use_id(text_sensor.TextSensor),
        cv.Optional(CONF_ZONE_STATE_IDS): cv.All(
            cv.ensure_list(cv.use_id(text_sensor.TextSensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_FAULT_IDS): cv.All(
            cv.ensure_list(cv.use_id(text_sensor.TextSensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_RESET_REASON_ID): cv.use_id(text_sensor.TextSensor),
        # Managed firmware update entity (update: platform http_request). The
        # dashboard drives check/install and parks the motors first. Optional so
        # a build without an `update:` platform still compiles.
        cv.Optional(CONF_FIRMWARE_UPDATE_ID): cv.use_id(update.UpdateEntity),
        cv.Optional(CONF_DASHBOARD_JS): cv.file_,
    }
).extend(cv.COMPONENT_SCHEMA)

def _embed_gzip_as_progmem(symbol: str, file_path: str) -> str:
    with open(file_path, encoding="utf-8") as f:
        content = f.read()
    asset_v = hashlib.sha256(content.encode("utf-8")).hexdigest()[:12]
    compressed = gzip.compress(content.encode("utf-8"), compresslevel=9)
    size = len(compressed)
    bytes_str = ", ".join(str(b) for b in compressed)
    cg.add_global(cg.RawExpression(
        f"const uint8_t {symbol}_DATA[{size}] PROGMEM = {{{bytes_str}}};"
    ))
    cg.add_global(cg.RawExpression(
        f"const size_t {symbol}_SIZE = {size};"
    ))
    return asset_v

async def to_code(config):
    # ESP-IDF's default HTTP server task is too small for the dashboard's
    # response path (notably /api/v1/revision). Keep this fix coupled to
    # the dashboard component so every generated build gets the same safety
    # margin without a fragile path in platformio_options.
    add_extra_script(
        "pre",
        "lv6_patch_httpd_stack.py",
        Path(__file__).parent / "lv6_patch_httpd_stack.py",
    )
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    wsb = await cg.get_variable(config[CONF_WEB_SERVER_BASE_ID])
    cg.add(var.set_web_server_base(wsb))

    zone_ctrl = await cg.get_variable(config[CONF_ZONE_CONTROLLER_ID])
    cg.add(var.set_zone_controller(zone_ctrl))

    if CONF_VALVE_CONTROLLER_ID in config:
        valve_ctrl = await cg.get_variable(config[CONF_VALVE_CONTROLLER_ID])
        cg.add(var.set_valve_controller(valve_ctrl))

    if CONF_CONFIG_STORE_ID in config:
        cfg_store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
        cg.add(var.set_config_store(cfg_store))

    if CONF_BLE_TIME_BEACON_ID in config:
        beacon = await cg.get_variable(config[CONF_BLE_TIME_BEACON_ID])
        cg.add(var.set_ble_time_beacon(beacon))

    if CONF_NIMBLE_HUB_ID in config:
        hub = await cg.get_variable(config[CONF_NIMBLE_HUB_ID])
        cg.add(var.set_nimble_hub(hub))

    if CONF_WIFI_SIGNAL_ID in config:
        wifi_signal = await cg.get_variable(config[CONF_WIFI_SIGNAL_ID])
        cg.add(var.set_wifi_signal_sensor(wifi_signal))

    if CONF_MANIFOLD_FLOW_ID in config:
        flow = await cg.get_variable(config[CONF_MANIFOLD_FLOW_ID])
        cg.add(var.set_manifold_flow_sensor(flow))

    if CONF_MANIFOLD_RETURN_ID in config:
        ret = await cg.get_variable(config[CONF_MANIFOLD_RETURN_ID])
        cg.add(var.set_manifold_return_sensor(ret))

    if CONF_ZONE_TEMP_IDS in config:
        for i, s_id in enumerate(config[CONF_ZONE_TEMP_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_zone_temp_sensor(i, s))

    if CONF_ZONE_VALVE_IDS in config:
        for i, s_id in enumerate(config[CONF_ZONE_VALVE_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_zone_valve_sensor(i, s))

    if CONF_ZONE_PREHEAT_IDS in config:
        for i, s_id in enumerate(config[CONF_ZONE_PREHEAT_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_zone_preheat_sensor(i, s))

    if CONF_MOTOR_OPEN_RIPPLE_IDS in config:
        for i, s_id in enumerate(config[CONF_MOTOR_OPEN_RIPPLE_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_motor_open_ripple_sensor(i, s))

    if CONF_MOTOR_CLOSE_RIPPLE_IDS in config:
        for i, s_id in enumerate(config[CONF_MOTOR_CLOSE_RIPPLE_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_motor_close_ripple_sensor(i, s))

    if CONF_MOTOR_OPEN_FACTOR_IDS in config:
        for i, s_id in enumerate(config[CONF_MOTOR_OPEN_FACTOR_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_motor_open_factor_sensor(i, s))

    if CONF_MOTOR_CLOSE_FACTOR_IDS in config:
        for i, s_id in enumerate(config[CONF_MOTOR_CLOSE_FACTOR_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_motor_close_factor_sensor(i, s))

    if CONF_PROBE_TEMP_IDS in config:
        for i, s_id in enumerate(config[CONF_PROBE_TEMP_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_probe_temp_sensor(i, s))

    if CONF_FIRMWARE_VERSION_ID in config:
        fw_version = await cg.get_variable(config[CONF_FIRMWARE_VERSION_ID])
        cg.add(var.set_firmware_version_text(fw_version))

    if CONF_IP_ADDRESS_ID in config:
        ip = await cg.get_variable(config[CONF_IP_ADDRESS_ID])
        cg.add(var.set_ip_address_text(ip))

    if CONF_CONNECTED_SSID_ID in config:
        ssid = await cg.get_variable(config[CONF_CONNECTED_SSID_ID])
        cg.add(var.set_connected_ssid_text(ssid))

    if CONF_MAC_ADDRESS_ID in config:
        mac = await cg.get_variable(config[CONF_MAC_ADDRESS_ID])
        cg.add(var.set_mac_address_text(mac))

    if CONF_ZONE_STATE_IDS in config:
        for i, ts_id in enumerate(config[CONF_ZONE_STATE_IDS]):
            ts = await cg.get_variable(ts_id)
            cg.add(var.set_zone_state_sensor(i, ts))

    if CONF_MOTOR_FAULT_IDS in config:
        for i, ts_id in enumerate(config[CONF_MOTOR_FAULT_IDS]):
            ts = await cg.get_variable(ts_id)
            cg.add(var.set_motor_fault_sensor(i, ts))

    if CONF_RESET_REASON_ID in config:
        reset_reason = await cg.get_variable(config[CONF_RESET_REASON_ID])
        cg.add(var.set_reset_reason_text(reset_reason))

    if CONF_FIRMWARE_UPDATE_ID in config:
        # Gates the update/ include and the firmware_* commands: ESPHome only
        # copies the update component's headers into the build when a platform
        # is configured, so the C++ side must not reference them otherwise.
        cg.add_define("LV6_HAS_UPDATE")
        firmware_update = await cg.get_variable(config[CONF_FIRMWARE_UPDATE_ID])
        cg.add(var.set_firmware_update(firmware_update))

    if CONF_DASHBOARD_JS in config:
        path = CORE.relative_config_path(config[CONF_DASHBOARD_JS])
        asset_v = _embed_gzip_as_progmem("LV6_DASHBOARD_JS", path)
        cg.add_define("LV6_HAS_DASHBOARD_JS")
        # Content hash of web/dashboard.js so HTML ?v= changes whenever the
        # bundle changes — manual cache-buster strings were easy to forget.
        cg.add_define("LV6_DASHBOARD_ASSET_V", f'"{asset_v}"')
