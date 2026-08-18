# -----------------------------------------------------------------------------
# Lune Touch / Mini coordinator workspace
# -----------------------------------------------------------------------------
CONFIG ?= configurations/lune-touch-7.yaml
BUILD_NAME ?= lune-touch
ROOT_DIR ?= ../..
ROOT_ABS := $(abspath $(ROOT_DIR))
DEVICE_DIR ?= devices/lune-touch
CONFIG_PATH ?= $(ROOT_ABS)/$(DEVICE_DIR)/$(CONFIG)
# Prefer the venv's Python modules over generated console launchers. Those
# launchers embed an absolute interpreter path and can become stale after the
# workspace is moved or cloned elsewhere.
PYTHON ?= $(if $(wildcard $(ROOT_ABS)/.venv313/bin/python),$(ROOT_ABS)/.venv313/bin/python,$(if $(wildcard $(ROOT_ABS)/.venv/bin/python),$(ROOT_ABS)/.venv/bin/python,python3))
ESPHOME ?= $(PYTHON) -m esphome
PIO ?= $(PYTHON) -m platformio
ESPTOOL ?= $(PYTHON) -m esptool
PLATFORMIO_CORE_DIR ?= $(ROOT_ABS)/.cache/platformio
CXX ?= clang++
BUILD_ROOT ?= $(ROOT_ABS)/$(DEVICE_DIR)/configurations/.esphome/build/$(BUILD_NAME)
FIRMWARE_BIN ?= $(BUILD_ROOT)/.pio/build/$(BUILD_NAME)/firmware.bin
PARTITION_BIN ?= $(BUILD_ROOT)/.pio/build/$(BUILD_NAME)/partitions.bin
OTA_SLOT_BYTES ?= 6553600
OTA_WARN_PERCENT ?= 85
HOST ?=
PORT ?=
AUTO_PORT := $(strip $(shell ls /dev/cu.usbmodem* /dev/cu.usbserial* /dev/cu.SLAB_USBtoUART* /dev/cu.wchusbserial* 2>/dev/null | head -n 1))
SERIAL_PORT := $(if $(PORT),$(PORT),$(AUTO_PORT))
SECRETS_LINK ?= configurations/secrets.yaml
SECRETS_TARGET ?= ../../../secrets.yaml
DASHBOARD_SRC_DIR ?= $(ROOT_ABS)/$(DEVICE_DIR)/web/dashboard-src
DASHBOARD_OUT_FILE ?= $(ROOT_ABS)/$(DEVICE_DIR)/web/dashboard.js
DASHBOARD_TOOL ?= $(ROOT_ABS)/.tools/esbuild

FORECAST_COMPONENT_DIR := components/hv6_forecast
FORECAST_TEST_DIR := tests/forecast
FORECAST_SRCS := $(FORECAST_COMPONENT_DIR)/forecast_model.cpp \
                 $(FORECAST_TEST_DIR)/test_forecast_model.cpp
FORECAST_OUT ?= /tmp/test_lune_touch_forecast_model
FORECAST_TIMELINE_OUT ?= /tmp/test_lune_touch_forecast_timeline

COORDINATOR_COMPONENT_DIR := components/lune_touch_coordinator
COORDINATOR_TEST_DIR := tests/coordinator
COORDINATOR_SRCS := $(COORDINATOR_COMPONENT_DIR)/coordinator_model.cpp \
                    $(COORDINATOR_TEST_DIR)/test_coordinator_model.cpp
COORDINATOR_OUT ?= /tmp/test_lune_touch_coordinator_model
ASGARD_URL_OUT ?= /tmp/test_lune_touch_asgard_url
ASGARD_ADAPTER_OUT ?= /tmp/test_lune_touch_asgard_adapter
ODIN_PLAN_OUT ?= /tmp/test_lune_touch_odin_plan
SIMULATION_OUT ?= /tmp/test_lune_touch_end_to_end_simulation

.PHONY: help check ensure-secrets-link config build build-verify ota-size-check ota deploy install-registry-partition monitor \
        config-mini build-mini deploy-mini ota-mini dashboard dashboard-tooling dashboard-build dashboard-watch \
        test test-forecast test-coordinator test-asgard-url test-asgard-adapter test-odin-plan test-simulation test-dashboard test-display clean

help:
	@echo "Lune Touch coordinator tasks"
	@echo "  make config           Validate Lune Touch ESPHome YAML"
	@echo "  make build            Compile Lune Touch firmware"
	@echo "  make config-mini      Validate Lune Mini ESPHome YAML"
	@echo "  make build-mini       Compile Lune Mini headless coordinator firmware"
	@echo "  make deploy-mini HOST=192.168.x.x"
	@echo "  make ota-mini HOST=192.168.x.x"
	@echo "  make ota-size-check   Verify firmware fits the OTA slot"
	@echo "  make ota HOST=192.168.x.x"
	@echo "  make deploy           Build + upload Lune Touch (USB or HOST OTA)"
	@echo "  make deploy PORT=/dev/cu.usbmodemXXXX"
	@echo "  make deploy HOST=192.168.x.x"
	@echo "  make install-registry-partition PORT=/dev/cu.usbmodemXXXX  One-time 64 KiB Touch registry partition install"
	@echo "  make monitor          Open serial monitor on PORT"
	@echo "  make monitor PORT=/dev/cu.usbmodemXXXX"
	@echo "  make dashboard-build  Build Lune Touch dashboard bundle"
	@echo "  make test             Run host tests"
	@echo "  make test-forecast    Run forecast preload-model tests"
	@echo "  make test-coordinator Run coordinator model tests"

ensure-secrets-link:
	@if [ -e "$(ROOT_ABS)/secrets.yaml" ]; then \
		if [ ! -e "$(SECRETS_LINK)" ] || [ -L "$(SECRETS_LINK)" ]; then \
			ln -sfn "$(SECRETS_TARGET)" "$(SECRETS_LINK)"; \
		fi; \
	fi

check: ensure-secrets-link
	@$(ESPHOME) version >/dev/null 2>&1 || { \
		echo "ESPHome CLI not found."; \
		echo "Create root .venv and install: python3 -m venv .venv && ./.venv/bin/pip install esphome"; \
		exit 1; \
	}
	@$(PIO) --version >/dev/null 2>&1 || { \
		echo "PlatformIO CLI not found."; \
		echo "Install in venv: ./.venv313/bin/pip install platformio"; \
		exit 1; \
	}

config: check
	cd $(ROOT_ABS) && $(ESPHOME) config $(CONFIG_PATH)

build: check dashboard-build
	cd $(ROOT_ABS) && $(ESPHOME) compile --only-generate $(CONFIG_PATH)
	perl -0pi -e 's/" ".join\(cmd\)/" ".join(map(str, cmd))/g' $(BUILD_ROOT)/post_build.py
	PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) run -d $(BUILD_ROOT)
	$(MAKE) ota-size-check

build-verify: build

config-mini:
	$(MAKE) CONFIG=configurations/lune-mini.yaml BUILD_NAME=lune-mini config

build-mini:
	$(MAKE) CONFIG=configurations/lune-mini.yaml BUILD_NAME=lune-mini build

deploy-mini:
	$(MAKE) CONFIG=configurations/lune-mini.yaml BUILD_NAME=lune-mini deploy

ota-mini:
	$(MAKE) CONFIG=configurations/lune-mini.yaml BUILD_NAME=lune-mini ota

ota-size-check:
	@if [ ! -f "$(FIRMWARE_BIN)" ]; then \
		echo "Firmware binary not found: $(FIRMWARE_BIN)"; \
		exit 1; \
	fi
	@size=$$(wc -c < "$(FIRMWARE_BIN)"); \
	warn=$$(( $(OTA_SLOT_BYTES) * $(OTA_WARN_PERCENT) / 100 )); \
	pct=$$(awk "BEGIN { printf \"%.1f\", ($$size / $(OTA_SLOT_BYTES)) * 100 }"); \
	echo "$(BUILD_NAME) OTA size: $$size / $(OTA_SLOT_BYTES) bytes ($$pct%)"; \
	if [ $$size -gt $(OTA_SLOT_BYTES) ]; then \
		echo "ERROR: firmware.bin exceeds Lune Touch OTA slot"; \
		exit 1; \
	fi; \
	if [ $$size -gt $$warn ]; then \
		echo "WARNING: firmware.bin exceeds $(OTA_WARN_PERCENT)% of the OTA slot"; \
	fi

ota: build
	@if [ -z "$(HOST)" ]; then \
		echo "No OTA host set. Re-run with HOST=192.168.x.x or HOST=lune-touch.local"; \
		exit 1; \
	fi
	$(ESPHOME) upload $(CONFIG_PATH) --file $(FIRMWARE_BIN) --device $(HOST)

deploy: build
	@if [ -n "$(PORT)" ]; then \
		PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) run -d $(BUILD_ROOT) -t upload --upload-port $(PORT); \
	elif [ -n "$(HOST)" ]; then \
		$(ESPHOME) upload $(CONFIG_PATH) --file $(FIRMWARE_BIN) --device $(HOST); \
	else \
		AUTO_PORT=$$(ls /dev/cu.usbmodem* /dev/cu.wchusbserial* /dev/cu.SLAB_USBtoUART* 2>/dev/null | head -n 1); \
		if [ -z "$$AUTO_PORT" ]; then \
			echo "No serial upload port found. Re-run with PORT=/dev/cu.usbmodemXXXX or HOST=192.168.x.x"; \
			exit 1; \
		fi; \
		echo "Uploading to $$AUTO_PORT"; \
		PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) run -d $(BUILD_ROOT) -t upload --upload-port $$AUTO_PORT; \
	fi

# Writes only the partition table at 0x8000. It preserves the existing WiFi
# NVS and application slots; run it once over USB before flashing firmware
# that uses the dedicated touchreg partition.
install-registry-partition: build
	@if [ -z "$(SERIAL_PORT)" ]; then \
		echo "No serial port detected. Use PORT=/dev/cu.usbmodemXXXX"; \
		exit 1; \
	fi
	$(ESPTOOL) --chip esp32s3 --port $(SERIAL_PORT) write-flash 0x8000 $(PARTITION_BIN)

monitor: check
	@if [ -z "$(SERIAL_PORT)" ]; then \
		echo "No serial port detected. Use PORT=/dev/cu.usbmodemXXXX"; \
		exit 1; \
	fi
	@echo "Using serial port: $(SERIAL_PORT)"
	PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) device monitor --port $(SERIAL_PORT)

test-forecast:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I $(FORECAST_COMPONENT_DIR) $(FORECAST_SRCS) -o $(FORECAST_OUT) -lm
	$(FORECAST_OUT)
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I $(COORDINATOR_COMPONENT_DIR) $(FORECAST_TEST_DIR)/test_forecast_timeline.cpp -o $(FORECAST_TIMELINE_OUT)
	$(FORECAST_TIMELINE_OUT)

test-coordinator:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I $(COORDINATOR_COMPONENT_DIR) $(COORDINATOR_SRCS) -o $(COORDINATOR_OUT)
	$(COORDINATOR_OUT)

test-asgard-url:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I components/lune_touch_coordinator tests/asgard_url/test_asgard_url.cpp -o $(ASGARD_URL_OUT)
	$(ASGARD_URL_OUT)

test-asgard-adapter:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I components/lune_touch_coordinator tests/asgard_adapter/test_asgard_adapter.cpp -o $(ASGARD_ADAPTER_OUT)
	$(ASGARD_ADAPTER_OUT)

test-odin-plan:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I components/lune_touch_coordinator tests/odin_plan/test_odin_plan.cpp -o $(ODIN_PLAN_OUT)
	$(ODIN_PLAN_OUT)

test-simulation:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I components/lune_touch_coordinator -I components/hv6_forecast -I ../lune-v6/components/hv6_dashboard components/lune_touch_coordinator/coordinator_model.cpp components/hv6_forecast/forecast_model.cpp tests/simulation/test_end_to_end_simulation.cpp -o $(SIMULATION_OUT) -lm
	$(SIMULATION_OUT)

test: test-forecast test-coordinator test-asgard-url test-asgard-adapter test-odin-plan test-simulation test-dashboard test-display

test-dashboard:
	sh tests/dashboard/test_phase8_overview.sh

test-display:
	sh tests/display/test_phase8_display.sh

dashboard: dashboard-build

dashboard-tooling:
	mkdir -p $(ROOT_ABS)/.tools
	cd $(ROOT_ABS)/.tools && curl -fsSL https://esbuild.github.io/dl/latest | sh

dashboard-build:
	@command -v $(DASHBOARD_TOOL) >/dev/null 2>&1 || $(MAKE) dashboard-tooling
	$(DASHBOARD_TOOL) $(DASHBOARD_SRC_DIR)/main.js \
	--bundle \
	--minify \
	--tree-shaking=true \
	--format=iife \
	--target=es2018 \
	--platform=browser \
	--define:DEBUG=false \
	--outfile=$(DASHBOARD_OUT_FILE)

dashboard-watch:
	@echo "Watching Lune Touch dashboard source for changes... press ctrl+c to stop"
	@fswatch -r -o $(DASHBOARD_SRC_DIR) | \
    while read; do \
        echo "Rebuilding Lune Touch dashboard..."; \
        if ! $(MAKE) dashboard-build --no-print-directory; then \
            echo "Dashboard build failed!"; \
        fi; \
    done

clean:
	rm -f $(FORECAST_OUT) $(COORDINATOR_OUT)
	rm -rf configurations/.esphome/build
