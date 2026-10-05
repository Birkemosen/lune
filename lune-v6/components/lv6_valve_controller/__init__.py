# =============================================================================
# LV6 Valve Controller — ESPHome External Component
# =============================================================================
# Three motor hardware backends:
#   drv8215_i2c  6x DRV8215 I2C drivers with current-sense endstop detection
#   rev31_gpio   3-bit one-hot decoder + direction pin + BEMF mux (Rev 3.1 Lean)
#   rev33_gpio   4-bit decoder + commutation tacho, firmware-held DRIVER_N_SLEEP
#                and three attributable fault nets (Rev 3.3)
# =============================================================================

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID
from esphome.components import i2c, sensor
from esphome.components.esp32 import include_builtin_idf_component

CODEOWNERS = ["@birkemosen"]
DEPENDENCIES = ["i2c"]
AUTO_LOAD = ["lv6_config_store"]

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
CONF_ADDRESS3_PIN = "address3_pin"
CONF_DIRECTION_PIN = "direction_pin"
CONF_LATCH_ARM_PIN = "latch_arm_pin"
CONF_COMM_TACHO_PIN = "comm_tacho_pin"
CONF_ADC_TACHO_ENABLED = "adc_tacho_enabled"
CONF_RAIL_OVERCURRENT_PIN = "rail_overcurrent_pin"
CONF_DRIVER_NSLEEP_PIN = "driver_nsleep_pin"
CONF_FAULT_USB_PIN = "fault_usb_pin"
CONF_ADC_TACHO_PIN = "adc_tacho_pin"
CONF_TACHO_MIN_PULSE_US = "tacho_min_pulse_us"
CONF_TACHO_MIN_PERIOD_US = "tacho_min_period_us"
CONF_TACHO_MAX_PERIOD_US = "tacho_max_period_us"
CONF_BEMF_THRESHOLD_RAW = "bemf_threshold_raw"
CONF_AUTO_START_CALIBRATION = "auto_start_calibration"

BACKEND_DRV8215_I2C = "drv8215_i2c"
BACKEND_REV31_GPIO = "rev31_gpio"
BACKEND_REV33_GPIO = "rev33_gpio"

# Mirrors MotorBackendKind in lv6_valve_controller.h.
BACKEND_KIND = {
    BACKEND_REV33_GPIO: 3,
    BACKEND_DRV8215_I2C: 0,
    BACKEND_REV31_GPIO: 1,
}

# hardware/lune-v6-rev3.3/design-contract.json: forbidden_motor_control_gpio.
# Strapping pins and the USB-JTAG pair; a motor control line on any of them
# either breaks boot or is driven during reset.
FORBIDDEN_MOTOR_GPIO = {0, 3, 19, 20, 45, 46}

# Only ADC1 is usable while WiFi is active, which is why the contract reserves
# GPIO1-10 for analog.
ADC1_GPIO = range(1, 11)

# Pins the Rev 3.3 backend takes exclusive ownership of, in config-key order.
REV33_PINS = (
    CONF_NSLEEP_PIN,
    CONF_NFAULT_PIN,
    CONF_IPROPI_PIN,
    CONF_ADDRESS0_PIN,
    CONF_ADDRESS1_PIN,
    CONF_ADDRESS2_PIN,
    CONF_ADDRESS3_PIN,
    CONF_COMM_TACHO_PIN,
    CONF_ADC_TACHO_PIN,
    CONF_DRIVER_NSLEEP_PIN,
    CONF_RAIL_OVERCURRENT_PIN,
    CONF_FAULT_USB_PIN,
)

# Rev 3.1-only options.  Accepting them silently under rev33_gpio is how a stale
# entrypoint gets flashed onto Rev 3.3 hardware, where GPIO5 no longer exists as
# a no-connect and ADC_CURRENT has moved off GPIO4.
REV31_ONLY = (CONF_ADC_BEMF_PIN, CONF_DIRECTION_PIN, CONF_BEMF_THRESHOLD_RAW,
              CONF_LATCH_ARM_PIN)

lv6_ns = cg.esphome_ns.namespace("lv6")
Lv6ValveController = lv6_ns.class_("Lv6ValveController", cg.Component)
Lv6ConfigStore = lv6_ns.class_("Lv6ConfigStore", cg.Component)


def _reject_rev31_only(config, board):
    stale = [key for key in REV31_ONLY if key in config]
    if stale:
        raise cv.Invalid(
            f"{', '.join(stale)} belong to the Rev 3.1 backend and have no meaning "
            f"on {board}: the BEMF mux and the fault latch were removed, and "
            f"ADC_BEMF's GPIO is now an amplified analog input. Remove them."
        )


def _validate_motor_pins(config, keys, board):
    seen = {}
    for key in keys:
        gpio = config[key]
        if gpio in FORBIDDEN_MOTOR_GPIO:
            raise cv.Invalid(
                f"{key}: GPIO{gpio} is in forbidden_motor_control_gpio "
                f"(strapping or USB-JTAG). See design-contract.json."
            )
        if gpio in seen:
            raise cv.Invalid(
                f"{key} and {seen[gpio]} are both GPIO{gpio}; every {board} motor "
                f"signal needs its own pin."
            )
        seen[gpio] = key


def _validate_adc_and_tacho(config):
    for key in (CONF_IPROPI_PIN, CONF_ADC_TACHO_PIN):
        if config[key] not in ADC1_GPIO:
            raise cv.Invalid(
                f"{key}: GPIO{config[key]} is not on ADC1 (GPIO1-10). Only ADC1 is "
                f"usable while WiFi is active."
            )
    if config[CONF_TACHO_MIN_PERIOD_US] >= config[CONF_TACHO_MAX_PERIOD_US]:
        raise cv.Invalid(
            f"{CONF_TACHO_MIN_PERIOD_US} must be below {CONF_TACHO_MAX_PERIOD_US}; "
            f"the qualified commutation band is 20-40 Hz."
        )


def _validate_backend(config):
    backend = config[CONF_HARDWARE_BACKEND]
    if backend == BACKEND_REV33_GPIO:
        missing = [k for k in (CONF_DRIVER_NSLEEP_PIN, CONF_RAIL_OVERCURRENT_PIN,
                               CONF_FAULT_USB_PIN) if k not in config]
        if missing:
            raise cv.Invalid(
                f"hardware_backend: rev33_gpio requires {', '.join(missing)}. "
                f"Rev 3.3 has no fault latch, so the drive permit and each "
                f"fault source need their own pin. See design-review R3.3-3."
            )
        _reject_rev31_only(config, "Rev 3.3")
        _validate_motor_pins(config, REV33_PINS, "Rev 3.3")
        _validate_adc_and_tacho(config)
    return config


CONFIG_SCHEMA = cv.All(
    cv.Schema(
        {
            cv.GenerateID(): cv.declare_id(Lv6ValveController),
            cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Lv6ConfigStore),
            cv.Required(CONF_I2C_ID): cv.use_id(i2c.I2CBus),
            # On the discrete backends these three are MOTOR_ENABLE, the fault
            # input (LATCH_STATE on Rev 3.1, FAULT_N_RAW on Rev 3.3) and
            # ADC_CURRENT; the names are inherited from the DRV8215 path.
            cv.Required(CONF_NSLEEP_PIN): cv.int_,
            cv.Required(CONF_NFAULT_PIN): cv.int_,
            cv.Required(CONF_IPROPI_PIN): cv.int_,
            cv.Optional(CONF_CURRENT_SENSE): cv.use_id(sensor.Sensor),
            cv.Required(CONF_MOTOR_ADDRESSES): cv.All(
                cv.ensure_list(cv.hex_uint8_t), cv.Length(min=6, max=6)
            ),
            cv.Optional(
                CONF_HARDWARE_BACKEND, default=BACKEND_DRV8215_I2C
            ): cv.one_of(*BACKEND_KIND, lower=True),
            cv.Optional(CONF_ADC_BEMF_PIN): cv.int_range(min=0, max=48),
            cv.Optional(CONF_ADDRESS0_PIN, default=10): cv.int_range(min=0, max=48),
            cv.Optional(CONF_ADDRESS1_PIN, default=11): cv.int_range(min=0, max=48),
            cv.Optional(CONF_ADDRESS2_PIN, default=12): cv.int_range(min=0, max=48),
            # Rev 3.3 only.  MOTOR_ADDR3 is a plain address bit: it replaced
            # MOTOR_TERM_DIR and no bit encodes direction any more.
            cv.Optional(CONF_ADDRESS3_PIN, default=13): cv.int_range(min=0, max=48),
            cv.Optional(CONF_DIRECTION_PIN): cv.int_range(min=0, max=48),
            # Rev 3.1 only.
            cv.Optional(CONF_LATCH_ARM_PIN): cv.int_range(min=0, max=48),
            cv.Optional(CONF_COMM_TACHO_PIN, default=38): cv.int_range(min=0, max=48),
            # TACHO_REF must be centred for the 6 dB span.
            cv.Optional(CONF_ADC_TACHO_ENABLED, default=False): cv.boolean,
            # Rev 3.3 only: the drive permit and each fault source need their
            # own pin.
            cv.Optional(CONF_RAIL_OVERCURRENT_PIN): cv.int_range(min=0, max=48),
            cv.Optional(CONF_DRIVER_NSLEEP_PIN): cv.int_range(min=0, max=48),
            cv.Optional(CONF_FAULT_USB_PIN): cv.int_range(min=0, max=48),
            cv.Optional(CONF_ADC_TACHO_PIN, default=1): cv.int_range(min=0, max=48),
            # Bring-up values from measured actuator data, not production
            # constants. The 20-40 Hz commutation band leaves 25-50 ms of period
            # in which to reject the driver's 20 us chopper artefacts.
            cv.Optional(CONF_TACHO_MIN_PULSE_US, default=200): cv.int_range(
                min=1, max=20000
            ),
            cv.Optional(CONF_TACHO_MIN_PERIOD_US, default=8000): cv.int_range(
                min=100, max=1000000
            ),
            cv.Optional(CONF_TACHO_MAX_PERIOD_US, default=200000): cv.int_range(
                min=1000, max=5000000
            ),
            cv.Optional(CONF_BEMF_THRESHOLD_RAW): cv.int_range(min=1, max=2048),
            cv.Optional(CONF_AUTO_START_CALIBRATION, default=True): cv.boolean,
        }
    ).extend(cv.COMPONENT_SCHEMA),
    _validate_backend,
)


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
    cg.add(var.set_backend_kind(BACKEND_KIND[config[CONF_HARDWARE_BACKEND]]))
    cg.add(var.set_address0_pin(config[CONF_ADDRESS0_PIN]))
    cg.add(var.set_address1_pin(config[CONF_ADDRESS1_PIN]))
    cg.add(var.set_address2_pin(config[CONF_ADDRESS2_PIN]))
    cg.add(var.set_address3_pin(config[CONF_ADDRESS3_PIN]))
    cg.add(var.set_comm_tacho_pin(config[CONF_COMM_TACHO_PIN]))
    cg.add(var.set_adc_tacho_pin(config[CONF_ADC_TACHO_PIN]))
    cg.add(var.set_adc_tacho_enabled(config[CONF_ADC_TACHO_ENABLED]))
    for key, setter in ((CONF_DRIVER_NSLEEP_PIN, var.set_driver_nsleep_pin),
                        (CONF_RAIL_OVERCURRENT_PIN, var.set_rail_overcurrent_pin),
                        (CONF_FAULT_USB_PIN, var.set_fault_usb_pin)):
        if key in config:
            cg.add(setter(config[key]))
    cg.add(var.set_tacho_min_pulse_us(config[CONF_TACHO_MIN_PULSE_US]))
    cg.add(var.set_tacho_min_period_us(config[CONF_TACHO_MIN_PERIOD_US]))
    cg.add(var.set_tacho_max_period_us(config[CONF_TACHO_MAX_PERIOD_US]))
    cg.add(var.set_auto_start_calibration(config[CONF_AUTO_START_CALIBRATION]))

    if CONF_ADC_BEMF_PIN in config:
        cg.add(var.set_adc_bemf_pin(config[CONF_ADC_BEMF_PIN]))
    if CONF_LATCH_ARM_PIN in config:
        cg.add(var.set_latch_arm_pin(config[CONF_LATCH_ARM_PIN]))
    if CONF_DIRECTION_PIN in config:
        cg.add(var.set_direction_pin(config[CONF_DIRECTION_PIN]))
    if CONF_BEMF_THRESHOLD_RAW in config:
        cg.add(var.set_bemf_threshold_raw(config[CONF_BEMF_THRESHOLD_RAW]))

    if CONF_CURRENT_SENSE in config:
        current_sensor = await cg.get_variable(config[CONF_CURRENT_SENSE])
        cg.add(var.set_current_sensor(current_sensor))

    for i, addr in enumerate(config[CONF_MOTOR_ADDRESSES]):
        cg.add(var.set_motor_address(i, addr))
