# -----------------------------------------------------------------------------
# Lune Touch / Mini coordinator workspace
# -----------------------------------------------------------------------------
CONFIG ?= configurations/lune-touch-7.yaml
BUILD_NAME ?= lune-touch
ROOT_DIR ?= ../..
ROOT_ABS := $(abspath $(ROOT_DIR))
DEVICE_DIR ?= devices/lune-touch
CONFIG_PATH ?= $(ROOT_ABS)/$(DEVICE_DIR)/$(CONFIG)
ESPHOME ?= $(if $(wildcard $(ROOT_ABS)/.venv313/bin/esphome),$(ROOT_ABS)/.venv313/bin/esphome,$(if $(wildcard $(ROOT_ABS)/.venv/bin/esphome),$(ROOT_ABS)/.venv/bin/esphome,esphome))
PIO ?= $(if $(wildcard $(ROOT_ABS)/.venv313/bin/platformio),$(ROOT_ABS)/.venv313/bin/platformio,$(if $(wildcard $(ROOT_ABS)/.venv/bin/platformio),$(ROOT_ABS)/.venv/bin/platformio,platformio))
PLATFORMIO_CORE_DIR ?= $(ROOT_ABS)/.cache/platformio
CXX ?= clang++
BUILD_ROOT ?= $(ROOT_ABS)/$(DEVICE_DIR)/configurations/.esphome/build/$(BUILD_NAME)
SECRETS_LINK ?= configurations/secrets.yaml
SECRETS_TARGET ?= ../../../secrets.yaml

FORECAST_COMPONENT_DIR := components/hv6_forecast
FORECAST_TEST_DIR := tests/forecast
FORECAST_SRCS := $(FORECAST_COMPONENT_DIR)/forecast_model.cpp \
                 $(FORECAST_TEST_DIR)/test_forecast_model.cpp
FORECAST_OUT ?= /tmp/test_lune_touch_forecast_model

COORDINATOR_COMPONENT_DIR := components/lune_touch_coordinator
COORDINATOR_TEST_DIR := tests/coordinator
COORDINATOR_SRCS := $(COORDINATOR_COMPONENT_DIR)/coordinator_model.cpp \
                    $(COORDINATOR_TEST_DIR)/test_coordinator_model.cpp
COORDINATOR_OUT ?= /tmp/test_lune_touch_coordinator_model

.PHONY: help check ensure-secrets-link config build build-verify test test-forecast test-coordinator clean

help:
	@echo "Lune Touch coordinator tasks"
	@echo "  make config           Validate Lune Touch ESPHome YAML"
	@echo "  make build            Compile Lune Touch firmware"
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
	@command -v $(ESPHOME) >/dev/null 2>&1 || { \
		echo "ESPHome CLI not found."; \
		echo "Create root .venv and install: python3 -m venv .venv && ./.venv/bin/pip install esphome"; \
		exit 1; \
	}
	@command -v $(PIO) >/dev/null 2>&1 || { \
		echo "PlatformIO CLI not found."; \
		echo "Install in venv: ./.venv313/bin/pip install platformio"; \
		exit 1; \
	}

config: check
	cd $(ROOT_ABS) && $(ESPHOME) config $(CONFIG_PATH)

build: check
	cd $(ROOT_ABS) && $(ESPHOME) compile --only-generate $(CONFIG_PATH)
	perl -0pi -e 's/" ".join\(cmd\)/" ".join(map(str, cmd))/g' $(BUILD_ROOT)/post_build.py
	PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) run -d $(BUILD_ROOT)

build-verify: build

test-forecast:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I $(FORECAST_COMPONENT_DIR) $(FORECAST_SRCS) -o $(FORECAST_OUT) -lm
	$(FORECAST_OUT)

test-coordinator:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I $(COORDINATOR_COMPONENT_DIR) $(COORDINATOR_SRCS) -o $(COORDINATOR_OUT)
	$(COORDINATOR_OUT)

test: test-forecast test-coordinator

clean:
	rm -f $(FORECAST_OUT) $(COORDINATOR_OUT)
	rm -rf configurations/.esphome/build
