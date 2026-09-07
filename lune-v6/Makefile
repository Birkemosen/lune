# -----------------------------------------------------------------------------
# Lune V6 firmware build (BLE BTHome sensors, ESPHome native API)
# -----------------------------------------------------------------------------
CONFIG ?= configurations/lune-v6.yaml
BUILD_NAME ?= lune-v6
ROOT_DIR ?= ..
ROOT_ABS := $(abspath $(ROOT_DIR))
DEVICE_DIR ?= lune-v6
CONFIG_PATH ?= $(ROOT_ABS)/$(DEVICE_DIR)/$(CONFIG)
# Prefer the venv's Python modules over generated console launchers. Those
# launchers embed an absolute interpreter path and can become stale after the
# workspace is moved or cloned elsewhere.
PYTHON ?= $(if $(wildcard $(ROOT_ABS)/.venv313/bin/python),$(ROOT_ABS)/.venv313/bin/python,$(if $(wildcard $(ROOT_ABS)/.venv/bin/python),$(ROOT_ABS)/.venv/bin/python,python3))
ESPHOME ?= $(PYTHON) -m esphome
PIO ?= $(PYTHON) -m platformio
PLATFORMIO_CORE_DIR ?= $(ROOT_ABS)/.cache/platformio
# ESPHome materialises generated sources next to the config file, so the
# build root for the configurations/ entrypoints lives under that directory.
BUILD_ROOT ?= $(ROOT_ABS)/$(DEVICE_DIR)/configurations/.esphome/build/$(BUILD_NAME)
PIO_BUILD_DIR ?= $(BUILD_ROOT)/.pio/build/$(BUILD_NAME)
FIRMWARE_BIN ?= $(PIO_BUILD_DIR)/firmware.bin
HOST ?=
PORT ?=
AUTO_PORT := $(strip $(shell ls /dev/cu.usbmodem* /dev/cu.usbserial* /dev/cu.SLAB_USBtoUART* /dev/cu.wchusbserial* 2>/dev/null | head -n 1))
SERIAL_PORT := $(if $(PORT),$(PORT),$(AUTO_PORT))
DASHBOARD_SRC_DIR ?= $(ROOT_ABS)/$(DEVICE_DIR)/web/dashboard-src
DASHBOARD_OUT_FILE ?= $(ROOT_ABS)/$(DEVICE_DIR)/web/dashboard.js
DASHBOARD_TOOL ?= $(ROOT_ABS)/.tools/esbuild
SECRETS_LINK ?= configurations/secrets.yaml
SECRETS_TARGET ?= ../../secrets.yaml
LANG ?= en
DASHBOARD_COMPILED_LANG := $(if $(filter en da,$(LANG)),$(LANG),en)

.PHONY: help check ensure-secrets-link config compile build build-verify bump-build prepare-release release release-deploy release-firmware release-bundle upload deploy ota logs discover monitor erase erase-nvs clean dashboard dashboard-tooling dashboard-build dashboard-watch test test-dashboard test-ripple test-rev31-logic test-rev32-logic test-balance test-authority-lease test-preheat-policy test-hydraulic-policy test-hydraulic-diagnostics test-commissioning-schema test-request-guard test-ble-time-beacon test-settings-backup

help:
	@echo "Lune V6 ESPHome tasks"
	@echo "  make config        Validate YAML"
	@echo "  make build         Bump build number and compile (v1.0.0-N)"
	@echo "  make build-verify  Compile without touching version.yaml"
	@echo "  make release       Compile a release binary without build suffix (VERSION=v1.2.3 optional)"
	@echo "  make release-firmware  Build the public release bundle in dist/ (no WiFi secrets baked in)"
	@echo "  make deploy        Bump build + compile + upload (USB, OTA, or auto-discover)"
	@echo "  make release-deploy  Release compile + upload"
	@echo "  make ota           Bump build + compile + upload over network"
	@echo "  make logs          Stream logs (auto-discover if HOST unset)"
	@echo "  make discover      Scan network and list found devices"
	@echo "  make monitor       Open serial monitor on PORT"
	@echo "  make erase         Erase flash on PORT"
	@echo "  make erase-nvs     Erase NVS partition only (clears calibration data)"
	@echo "  make test          Run all host unit tests"
	@echo "  make test-ripple   Run ripple-counter unit tests (5 rates × 5 cases)"
	@echo "  make test-rev31-logic  Run Rev 3.1 one-hot and endpoint-evidence tests"
	@echo "  make test-rev32-logic  Run Rev 3.2 decoder-map, latch and tacho tests"
	@echo "  make test-balance  Run adaptive-balancing step-math unit tests"
	@echo ""
	@echo "Examples:"
	@echo "  make build"
	@echo "  make deploy"
	@echo "  make deploy PORT=/dev/cu.usbmodemXXXX"
	@echo "  make deploy HOST=192.168.x.x"
	@echo "  make release"
	@echo "  make release VERSION=v1.1.0"
	@echo "  make release-deploy HOST=192.168.x.x"
	@echo "  make monitor PORT=/dev/cu.usbmodemXXXX"
	@echo "  make erase PORT=/dev/cu.usbmodemXXXX"
	@echo "  make ota HOST=192.168.x.x"
	@echo "  make ota HOST=lune-v6-a1b2c3.local"
	@echo "  make discover"

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

VERSION_YAML := $(ROOT_ABS)/$(DEVICE_DIR)/version.yaml
STAMP_VERSION := $(PYTHON) $(ROOT_ABS)/$(DEVICE_DIR)/stamp_version.py $(VERSION_YAML)

compile: check dashboard-build
	cd $(ROOT_ABS) && $(ESPHOME) compile --only-generate $(CONFIG_PATH)
	perl -0pi -e 's/" ".join\(cmd\)/" ".join(map(str, cmd))/g' $(BUILD_ROOT)/post_build.py
	PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) run -d $(BUILD_ROOT)

build: check
	$(MAKE) bump-build
	$(MAKE) compile

build-verify: check
	$(MAKE) compile

# Development builds append -N (v1.0.0-1, v1.0.0-2, …).
bump-build:
	@$(STAMP_VERSION) bump

prepare-release:
	@$(STAMP_VERSION) release $(VERSION)

release: check
	$(MAKE) prepare-release
	$(MAKE) compile

release-deploy: check
	$(MAKE) prepare-release
	$(MAKE) compile
	$(MAKE) upload

# =============================================================================
# Public release bundle (GitHub Releases + ESP-Web-Tools)
# =============================================================================
# Built from the release entrypoint, which carries no station credentials, so
# the published images never overwrite a user's provisioned WiFi.
RELEASE_CONFIG ?= configurations/lune-v6-release.yaml
DIST_DIR ?= $(ROOT_ABS)/$(DEVICE_DIR)/dist
MANIFEST_SCRIPT := $(ROOT_ABS)/$(DEVICE_DIR)/scripts/generate_manifest.py
# Recursive assignment: version.yaml is read after prepare-release stamps it.
RELEASE_VERSION = $(shell sed -n 's/^[[:space:]]*firmware_version:[[:space:]]*"\([^"]*\)".*/\1/p' $(VERSION_YAML))

release-firmware: check
	$(MAKE) release CONFIG=$(RELEASE_CONFIG) VERSION=$(VERSION)
	$(MAKE) release-bundle CONFIG=$(RELEASE_CONFIG)

release-bundle:
	@mkdir -p $(DIST_DIR)
	cp $(PIO_BUILD_DIR)/firmware.ota.bin $(DIST_DIR)/$(BUILD_NAME)-$(RELEASE_VERSION).ota.bin
	cp $(PIO_BUILD_DIR)/firmware.factory.bin $(DIST_DIR)/$(BUILD_NAME)-$(RELEASE_VERSION).factory.bin
	$(PYTHON) $(MANIFEST_SCRIPT) \
		--version $(RELEASE_VERSION) \
		--ota-bin $(DIST_DIR)/$(BUILD_NAME)-$(RELEASE_VERSION).ota.bin \
		--output $(DIST_DIR)/manifest-$(BUILD_NAME).json
	@echo "Release artifacts in $(DIST_DIR)"

deploy: check
	$(MAKE) build
	$(MAKE) upload

upload:
	@if [ -n "$(PORT)" ]; then \
		echo "Flashing via serial port: $(PORT)"; \
		PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) run -d $(BUILD_ROOT) -t upload --upload-port $(PORT); \
	elif [ -n "$(HOST)" ]; then \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $(HOST); \
	elif [ -n "$(AUTO_PORT)" ]; then \
		echo "Auto-detected serial port: $(AUTO_PORT)"; \
		PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) run -d $(BUILD_ROOT) -t upload --upload-port $(AUTO_PORT); \
	else \
		echo "No serial port detected. Scanning for Lune V6 devices (3s)..."; \
		hosts=$$($(PYTHON) discover_devices.py 2>/dev/null); \
		if [ -z "$$hosts" ]; then echo "No Lune V6 devices found. Use PORT=/dev/cu.usbmodemXXXX or HOST=lune-v6-XXXXXX.local (current internal hostname pattern)"; exit 1; fi; \
		count=$$(echo "$$hosts" | wc -l | tr -d ' '); \
		echo "Found devices:"; \
		i=1; for h in $$hosts; do printf "  %d) %s\n" $$i $$h; i=$$((i+1)); done; \
		printf "Select device [1-$$count]: "; \
		read choice < /dev/tty; \
		selected=$$(echo "$$hosts" | sed -n "$${choice}p"); \
		[ -z "$$selected" ] && { echo "Invalid selection"; exit 1; }; \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $$selected; \
	fi

# =============================================================================
# Host unit tests (no ESP-IDF, runs on macOS/Linux with clang++)
# =============================================================================
RIPPLE_CXX      ?= clang++
RIPPLE_CXXFLAGS  = -std=c++17 -O2 -Wall -Wextra -Wno-unused-parameter \
                   -I components/lv6_valve_controller
RIPPLE_SRCS      = components/lv6_valve_controller/ripple_counter.cpp \
                   test/ripple_counter/test_ripple_counter.cpp
RIPPLE_OUT       = /tmp/test_ripple_counter
REV31_LOGIC_SRCS = test/rev31_logic/test_rev31_logic.cpp
REV31_LOGIC_OUT  = /tmp/test_hv6_rev31_logic
REV32_LOGIC_SRCS = test/rev32_logic/test_rev32_logic.cpp
REV32_LOGIC_OUT  = /tmp/test_hv6_rev32_logic

test-ripple:
	$(RIPPLE_CXX) $(RIPPLE_CXXFLAGS) $(RIPPLE_SRCS) -o $(RIPPLE_OUT) -lm
	$(RIPPLE_OUT)

test-rev31-logic:
	$(RIPPLE_CXX) $(RIPPLE_CXXFLAGS) $(REV31_LOGIC_SRCS) -o $(REV31_LOGIC_OUT)
	$(REV31_LOGIC_OUT)

test-rev32-logic:
	$(RIPPLE_CXX) $(RIPPLE_CXXFLAGS) $(REV32_LOGIC_SRCS) -o $(REV32_LOGIC_OUT)
	$(REV32_LOGIC_OUT)

BALANCE_SRCS = test/adaptive_balance/test_adaptive_balance.cpp
BALANCE_OUT  = /tmp/test_adaptive_balance
AUTHORITY_LEASE_SRCS = test/authority_lease/test_authority_lease.cpp
AUTHORITY_LEASE_OUT  = /tmp/test_hv6_authority_lease
PREHEAT_POLICY_SRCS = test/preheat_policy/test_preheat_policy.cpp
PREHEAT_POLICY_OUT  = /tmp/test_hv6_preheat_policy
HYDRAULIC_POLICY_SRCS = test/hydraulic_policy/test_hydraulic_policy.cpp
HYDRAULIC_POLICY_OUT  = /tmp/test_hv6_hydraulic_policy
HYDRAULIC_DIAGNOSTICS_SRCS = test/hydraulic_diagnostics/test_hydraulic_diagnostics.cpp
HYDRAULIC_DIAGNOSTICS_OUT  = /tmp/test_hv6_hydraulic_diagnostics
REQUEST_GUARD_SRCS = test/request_guard/test_request_guard.cpp
REQUEST_GUARD_OUT  = /tmp/test_hv6_request_guard
BLE_TIME_BEACON_SRCS = test/ble_time_beacon/test_ble_time_beacon.cpp
BLE_TIME_BEACON_OUT  = /tmp/test_hv6_ble_time_beacon
SETTINGS_BACKUP_SRCS = test/settings_backup/test_settings_backup.cpp components/lv6_dashboard/settings_backup.cpp
SETTINGS_BACKUP_OUT  = /tmp/test_hv6_settings_backup

test-balance:
	$(RIPPLE_CXX) -std=c++17 -O2 -Wall -Wextra -I components/lv6_zone_controller $(BALANCE_SRCS) -o $(BALANCE_OUT) -lm
	$(BALANCE_OUT)

test-authority-lease:
	$(RIPPLE_CXX) -std=c++17 -O2 -Wall -Wextra -I components/lv6_dashboard $(AUTHORITY_LEASE_SRCS) -o $(AUTHORITY_LEASE_OUT)
	$(AUTHORITY_LEASE_OUT)

test-preheat-policy:
	$(RIPPLE_CXX) -std=c++17 -O2 -Wall -Wextra -I components/lv6_zone_controller $(PREHEAT_POLICY_SRCS) -o $(PREHEAT_POLICY_OUT)
	$(PREHEAT_POLICY_OUT)

test-hydraulic-policy:
	$(RIPPLE_CXX) -std=c++17 -O2 -Wall -Wextra -I components/lv6_zone_controller $(HYDRAULIC_POLICY_SRCS) -o $(HYDRAULIC_POLICY_OUT)
	$(HYDRAULIC_POLICY_OUT)

test-hydraulic-diagnostics:
	$(RIPPLE_CXX) -std=c++17 -O2 -Wall -Wextra -I components/lv6_zone_controller $(HYDRAULIC_DIAGNOSTICS_SRCS) -o $(HYDRAULIC_DIAGNOSTICS_OUT)
	$(HYDRAULIC_DIAGNOSTICS_OUT)

test-commissioning-schema:
	sh test/commissioning/test_persistence_schema.sh

test-request-guard:
	$(RIPPLE_CXX) -std=c++17 -O2 -Wall -Wextra -I components/lv6_dashboard $(REQUEST_GUARD_SRCS) -o $(REQUEST_GUARD_OUT)
	$(REQUEST_GUARD_OUT)

test-ble-time-beacon:
	$(RIPPLE_CXX) -std=c++17 -O2 -Wall -Wextra -I components/lv6_ble_time_beacon $(BLE_TIME_BEACON_SRCS) -o $(BLE_TIME_BEACON_OUT)
	$(BLE_TIME_BEACON_OUT)

test-settings-backup:
	$(RIPPLE_CXX) -std=c++17 -O2 -Wall -Wextra -I components/lv6_dashboard -I components/lv6_config_store $(SETTINGS_BACKUP_SRCS) -o $(SETTINGS_BACKUP_OUT) -lm
	$(SETTINGS_BACKUP_OUT)

test-dashboard:
	sh test/dashboard/test_dashboard.sh

test: test-dashboard test-ripple test-rev31-logic test-rev32-logic test-balance test-authority-lease test-preheat-policy test-hydraulic-policy test-hydraulic-diagnostics test-commissioning-schema test-request-guard test-ble-time-beacon test-settings-backup

ota: check
	$(MAKE) build
	@if [ -z "$(HOST)" ]; then \
		echo "Scanning for Lune V6 devices (3s)..."; \
		hosts=$$($(PYTHON) discover_devices.py 2>/dev/null); \
		if [ -z "$$hosts" ]; then echo "No Lune V6 devices found. Use: make ota HOST=lune-v6-XXXXXX.local (current internal hostname pattern)"; exit 1; fi; \
		count=$$(echo "$$hosts" | wc -l | tr -d ' '); \
		echo "Found devices:"; \
		i=1; for h in $$hosts; do printf "  %d) %s\n" $$i $$h; i=$$((i+1)); done; \
		printf "Select device [1-$$count]: "; \
		read choice < /dev/tty; \
		selected=$$(echo "$$hosts" | sed -n "$${choice}p"); \
		[ -z "$$selected" ] && { echo "Invalid selection"; exit 1; }; \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $$selected; \
	else \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $(HOST); \
	fi

logs: check
	@if [ -z "$(HOST)" ]; then \
		echo "Scanning for Lune V6 devices (3s)..."; \
		hosts=$$($(PYTHON) discover_devices.py 2>/dev/null); \
		if [ -z "$$hosts" ]; then echo "No Lune V6 devices found. Use: make logs HOST=lune-v6-XXXXXX.local (current internal hostname pattern)"; exit 1; fi; \
		count=$$(echo "$$hosts" | wc -l | tr -d ' '); \
		echo "Found devices:"; \
		i=1; for h in $$hosts; do printf "  %d) %s\n" $$i $$h; i=$$((i+1)); done; \
		printf "Select device [1-$$count]: "; \
		read choice < /dev/tty; \
		selected=$$(echo "$$hosts" | sed -n "$${choice}p"); \
		[ -z "$$selected" ] && { echo "Invalid selection"; exit 1; }; \
		$(ESPHOME) logs $(CONFIG) --device $$selected; \
	else \
		$(ESPHOME) logs $(CONFIG) --device $(HOST); \
	fi

discover: check
	@echo "Scanning for Lune V6 devices (5s)..."
	@$(PYTHON) discover_devices.py 2>/dev/null || echo "(no devices found)"

monitor: check
	@if [ -z "$(SERIAL_PORT)" ]; then \
		echo "No serial port detected. Use PORT=/dev/cu.usbmodemXXXX"; \
		exit 1; \
	fi
	@echo "Using serial port: $(SERIAL_PORT)"
	PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) device monitor --port $(SERIAL_PORT)

erase: check
	@if [ -z "$(SERIAL_PORT)" ]; then \
		echo "No serial port detected. Use PORT=/dev/cu.usbmodemXXXX"; \
		exit 1; \
	fi
	@echo "Using serial port: $(SERIAL_PORT)"
	PLATFORMIO_CORE_DIR=$(PLATFORMIO_CORE_DIR) $(PIO) run -d $(BUILD_ROOT) -t erase --upload-port $(SERIAL_PORT)

erase-nvs: check
	@if [ -z "$(SERIAL_PORT)" ]; then \
		echo "No serial port detected. Use PORT=/dev/cu.usbmodemXXXX"; \
		exit 1; \
	fi
	@# ESPHome 8MB dual-OTA layout (see packages/board/esp32-s3.yaml flash_size):
	@# otadata@0x9000, app0@0x10000 (0x3C0000), app1@0x3D0000 (0x3C0000),
	@# nvs@0x790000 (0x70000). The old 0x9000/0x6000 erase hit otadata, not NVS.
	@echo "Erasing hv6 NVS partition on $(SERIAL_PORT) at 0x790000 (size 0x70000)..."
	$(PYTHON) -m esptool --port $(SERIAL_PORT) erase_region 0x790000 0x70000
	@echo "NVS erased. Zone settings and calibration cleared — device will use defaults."

clean:
	rm -rf configurations/.esphome/build
	rm -rf $(DIST_DIR)

# Dashboard build tasks
dashboard: check
	# Check if esbuild is available, if not, download it (silent unless error)
	@command -v $(DASHBOARD_TOOL) >/dev/null 2>&1 || $(MAKE) dashboard-tooling
	$(MAKE) dashboard-build

dashboard-tooling:
	# Download esbuild if not present into root .tools/esbuild
	mkdir -p $(ROOT_DIR)/.tools
	cd $(ROOT_DIR)/.tools && curl -fsSL https://esbuild.github.io/dl/latest | sh

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
	--define:LV6_DASHBOARD_LANG=\"$(DASHBOARD_COMPILED_LANG)\" \
	--outfile=$(DASHBOARD_OUT_FILE)

dashboard-watch:
	@echo "Watching dashboard source for changes... press (ctrl+c to stop)"
	@fswatch -r -o $(DASHBOARD_SRC_DIR) | \
    while read; do \
        echo "Rebuilding dashboard..."; \
        if ! $(MAKE) dashboard --no-print-directory; then \
            echo "Dashboard build failed!"; \
        fi; \
    done
