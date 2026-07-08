# -----------------------------------------------------------------------------
# Birkemosen product workspace
# -----------------------------------------------------------------------------
LUNE_V6_DIR ?= devices/lune-v6
LUNE_TOUCH_DIR ?= devices/lune-touch

.PHONY: help \
        config build build-verify deploy ota logs discover monitor erase erase-nvs clean \
        dashboard dashboard-tooling dashboard-build dashboard-watch \
        help-v6 config-v6 build-v6 build-verify-v6 deploy-v6 ota-v6 logs-v6 discover-v6 monitor-v6 erase-v6 erase-nvs-v6 clean-v6 dashboard-v6 dashboard-tooling-v6 dashboard-build-v6 dashboard-watch-v6 test-v6 \
        help-touch config-touch build-touch build-verify-touch deploy-touch ota-touch monitor-touch dashboard-touch dashboard-tooling-touch dashboard-build-touch dashboard-watch-touch test-touch test-forecast test-coordinator \
        config-mini build-mini build-verify-mini deploy-mini ota-mini monitor-mini dashboard-build-mini \
        test test-ripple test-balance

help:
	@echo "Birkemosen product workspace"
	@echo ""
	@echo "Default shortcuts target V6"
	@echo "  make config              Validate Lune V6 ESPHome YAML"
	@echo "  make build               Build Lune V6 firmware"
	@echo "  make deploy              Build + deploy Lune V6 (USB, HOST OTA, or discover)"
	@echo "  make ota HOST=192.168.x.x"
	@echo "  make logs                Stream Lune V6 logs"
	@echo "  make dashboard-build     Build Lune V6 dashboard bundle"
	@echo ""
	@echo "V6"
	@echo "  make config-v6           Validate V6 ESPHome YAML"
	@echo "  make build-v6            Build V6 firmware"
	@echo "  make deploy-v6           Build + deploy V6 (USB, HOST OTA, or discover)"
	@echo "  make ota-v6 HOST=192.168.x.x"
	@echo "  make logs-v6             Stream V6 logs"
	@echo "  make monitor-v6          Open V6 serial monitor"
	@echo "  make dashboard-build-v6  Build V6 dashboard bundle"
	@echo "  make test-v6             Run V6 host tests"
	@echo ""
	@echo "Touch"
	@echo "  make config-touch        Validate Touch ESPHome YAML"
	@echo "  make build-touch         Build Touch firmware"
	@echo "  make deploy-touch        Build + upload Touch (USB or HOST OTA)"
	@echo "  make ota-touch HOST=192.168.x.x"
	@echo "  make monitor-touch       Open Touch serial monitor"
	@echo "  make dashboard-build-touch"
	@echo "  make test-touch          Run Touch host tests"
	@echo ""
	@echo "Mini"
	@echo "  make config-mini         Validate Mini ESPHome YAML"
	@echo "  make build-mini          Build Mini firmware"
	@echo "  make deploy-mini         Build + upload Mini (USB or HOST OTA)"
	@echo "  make ota-mini HOST=192.168.x.x"
	@echo ""
	@echo "Tests"
	@echo "  make test                Run all host tests across devices"
	@echo "  make test-forecast       Run Touch forecast-model tests"
	@echo "  make test-coordinator    Run Touch coordinator-model tests"
	@echo "  make test-ripple         Run V6 ripple-counter tests"
	@echo "  make test-balance        Run V6 adaptive-balancing tests"
	@echo ""
	@echo "Device-local help"
	@echo "  make help-v6"
	@echo "  make help-touch"

config build build-verify deploy ota logs discover monitor erase erase-nvs clean dashboard dashboard-tooling dashboard-build dashboard-watch:
	$(MAKE) -C $(LUNE_V6_DIR) $@

test-ripple test-balance:
	$(MAKE) -C $(LUNE_V6_DIR) $@

test-forecast:
	$(MAKE) -C $(LUNE_TOUCH_DIR) test-forecast

test-coordinator:
	$(MAKE) -C $(LUNE_TOUCH_DIR) test-coordinator

help-v6:
	$(MAKE) -C $(LUNE_V6_DIR) help

config-v6 build-v6 build-verify-v6 deploy-v6 ota-v6 logs-v6 discover-v6 monitor-v6 erase-v6 erase-nvs-v6 clean-v6 dashboard-v6 dashboard-tooling-v6 dashboard-build-v6 dashboard-watch-v6:
	$(MAKE) -C $(LUNE_V6_DIR) $(patsubst %-v6,%,$@)

test-v6:
	$(MAKE) -C $(LUNE_V6_DIR) test

help-touch:
	$(MAKE) -C $(LUNE_TOUCH_DIR) help

config-touch build-touch build-verify-touch deploy-touch ota-touch monitor-touch dashboard-touch dashboard-tooling-touch dashboard-build-touch dashboard-watch-touch:
	$(MAKE) -C $(LUNE_TOUCH_DIR) $(patsubst %-touch,%,$@)

test-touch:
	$(MAKE) -C $(LUNE_TOUCH_DIR) test

config-mini:
	$(MAKE) -C $(LUNE_TOUCH_DIR) config-mini

build-mini:
	$(MAKE) -C $(LUNE_TOUCH_DIR) build-mini

build-verify-mini:
	$(MAKE) -C $(LUNE_TOUCH_DIR) CONFIG=configurations/lune-mini.yaml BUILD_NAME=lune-mini build-verify

deploy-mini:
	$(MAKE) -C $(LUNE_TOUCH_DIR) deploy-mini

ota-mini:
	$(MAKE) -C $(LUNE_TOUCH_DIR) ota-mini

monitor-mini:
	$(MAKE) -C $(LUNE_TOUCH_DIR) monitor

dashboard-build-mini:
	$(MAKE) -C $(LUNE_TOUCH_DIR) dashboard-build

test: test-v6 test-touch
