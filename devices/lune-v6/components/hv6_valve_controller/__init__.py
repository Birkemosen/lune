# =============================================================================
# HV6 Valve Controller — ESPHome External Component
# =============================================================================
# 6x DRV8215 I2C motor drivers with current-sense endstop detection.
# Ported from lib/valve_controller/ for ESPHome Component lifecycle.
# =============================================================================

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID
from esphome.components import i2c, sensor
from esphome.components.esp32 import include_builtin_idf_component

CODEOWNERS = ["@birkemosen"]
DEPENDENCIES = ["i2c"]
AUTO_LOAD = ["hv6_config_store"]

CONF_CONFIG_STORE_ID = "config_store_id"
CONF_I2C_ID = "i2c_id"
CONF_NSLEEP_PIN = "nsleep_pin"
CONF_NFAULT_PIN = "nfault_pin"
CONF_IPROPI_PIN = "ipropi_pin"
CONF_CURRENT_SENSE = "current_sense"
CONF_MOTOR_ADDRESSES = "motor_addresses"
CONF_HARDWARE_BACKEND = "hardware_backend"
CONF_ADC_BEMF_PIN = "adc_bemf_pin"
CONF_ADDRESS0_PIN = "address0_pin"
CONF_ADDRESS1_PIN = "address1_pin"
CONF_ADDRESS2_PIN = "address2_pin"
CONF_DIRECTION_PIN = "direction_pin"
CONF_LATCH_ARM_PIN = "latch_arm_pin"
CONF_BEMF_THRESHOLD_RAW = "bemf_threshold_raw"
CONF_AUTO_START_CALIBRATION = "auto_start_calibration"

hv6_ns = cg.esphome_ns.namespace("hv6")
Hv6ValveController = hv6_ns.class_("Hv6ValveController", cg.Component)
Hv6ConfigStore = hv6_ns.class_("Hv6ConfigStore", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Hv6ValveController),
        cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Hv6ConfigStore),
        cv.Required(CONF_I2C_ID): cv.use_id(i2c.I2CBus),
        cv.Required(CONF_NSLEEP_PIN): cv.int_,
        cv.Required(CONF_NFAULT_PIN): cv.int_,
        cv.Required(CONF_IPROPI_PIN): cv.int_,
        cv.Optional(CONF_CURRENT_SENSE): cv.use_id(sensor.Sensor),
        cv.Required(CONF_MOTOR_ADDRESSES): cv.All(
            cv.ensure_list(cv.hex_uint8_t), cv.Length(min=6, max=6)
        ),
        cv.Optional(CONF_HARDWARE_BACKEND, default="drv8215_i2c"): cv.one_of(
            "drv8215_i2c", "rev31_gpio", lower=True
        ),
        cv.Optional(CONF_ADC_BEMF_PIN, default=5): cv.int_range(min=0, max=48),
        cv.Optional(CONF_ADDRESS0_PIN, default=10): cv.int_range(min=0, max=48),
        cv.Optional(CONF_ADDRESS1_PIN, default=11): cv.int_range(min=0, max=48),
        cv.Optional(CONF_ADDRESS2_PIN, default=12): cv.int_range(min=0, max=48),
        cv.Optional(CONF_DIRECTION_PIN, default=14): cv.int_range(min=0, max=48),
        cv.Optional(CONF_LATCH_ARM_PIN, default=16): cv.int_range(min=0, max=48),
        cv.Optional(CONF_BEMF_THRESHOLD_RAW, default=40): cv.int_range(min=1, max=2048),
        cv.Optional(CONF_AUTO_START_CALIBRATION, default=True): cv.boolean,
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    include_builtin_idf_component("esp_adc")
    include_builtin_idf_component("driver")

    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    config_store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
    cg.add(var.set_config_store(config_store))

    i2c_bus = await cg.get_variable(config[CONF_I2C_ID])
    cg.add(var.set_i2c_bus(i2c_bus))

    cg.add(var.set_nsleep_pin(config[CONF_NSLEEP_PIN]))
    cg.add(var.set_nfault_pin(config[CONF_NFAULT_PIN]))
    cg.add(var.set_ipropi_pin(config[CONF_IPROPI_PIN]))
    cg.add(var.set_rev31_backend(config[CONF_HARDWARE_BACKEND] == "rev31_gpio"))
    cg.add(var.set_adc_bemf_pin(config[CONF_ADC_BEMF_PIN]))
    cg.add(var.set_address0_pin(config[CONF_ADDRESS0_PIN]))
    cg.add(var.set_address1_pin(config[CONF_ADDRESS1_PIN]))
    cg.add(var.set_address2_pin(config[CONF_ADDRESS2_PIN]))
    cg.add(var.set_direction_pin(config[CONF_DIRECTION_PIN]))
    cg.add(var.set_latch_arm_pin(config[CONF_LATCH_ARM_PIN]))
    cg.add(var.set_bemf_threshold_raw(config[CONF_BEMF_THRESHOLD_RAW]))
    cg.add(var.set_auto_start_calibration(config[CONF_AUTO_START_CALIBRATION]))

    if CONF_CURRENT_SENSE in config:
        current_sensor = await cg.get_variable(config[CONF_CURRENT_SENSE])
        cg.add(var.set_current_sensor(current_sensor))

    for i, addr in enumerate(config[CONF_MOTOR_ADDRESSES]):
        cg.add(var.set_motor_address(i, addr))
