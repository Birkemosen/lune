# -----------------------------------------------------------------------------
# Guldborg & Birkemose product workspace
# -----------------------------------------------------------------------------
LUNE_V6_DIR ?= devices/lune-v6
LUNE_TOUCH_DIR ?= devices/lune-touch

.PHONY: help config build build-verify deploy ota logs discover monitor erase erase-nvs clean \
        dashboard dashboard-tooling dashboard-build dashboard-watch \
        test test-lune-v6 test-lune-touch test-ripple test-balance test-forecast \
        config-lune-touch build-lune-touch dashboard-build-lune-touch \
        lune-v6-help lune-touch-help

help:
	@echo "Guldborg & Birkemose product workspace"
	@echo ""
	@echo "Default hardware target: Lune V6"
	@echo "  make config              Validate Lune V6 ESPHome YAML"
	@echo "  make build               Build Lune V6 firmware"
	@echo "  make dashboard-build     Build Lune V6 dashboard bundle"
	@echo "  make deploy              Build + deploy Lune V6"
	@echo "  make logs                Stream Lune V6 logs"
	@echo ""
	@echo "Tests"
	@echo "  make test                Run all host tests across devices"
	@echo "  make test-lune-v6        Run Lune V6 host tests"
	@echo "  make test-lune-touch     Run Lune Touch host tests"
	@echo "  make test-forecast       Run Lune Touch forecast-model tests"
	@echo ""
	@echo "Lune Touch firmware"
	@echo "  make config-lune-touch   Validate Lune Touch ESPHome YAML"
	@echo "  make build-lune-touch    Compile Lune Touch firmware"
	@echo "  make dashboard-build-lune-touch"
	@echo ""
	@echo "Device-specific command namespaces"
	@echo "  make lune-v6-help"
	@echo "  make lune-touch-help"

config build build-verify deploy ota logs discover monitor erase erase-nvs clean dashboard dashboard-tooling dashboard-build dashboard-watch:
	$(MAKE) -C $(LUNE_V6_DIR) $@

test-ripple test-balance:
	$(MAKE) -C $(LUNE_V6_DIR) $@

test-forecast:
	$(MAKE) -C $(LUNE_TOUCH_DIR) test-forecast

test-lune-v6:
	$(MAKE) -C $(LUNE_V6_DIR) test

test-lune-touch:
	$(MAKE) -C $(LUNE_TOUCH_DIR) test

config-lune-touch:
	$(MAKE) -C $(LUNE_TOUCH_DIR) config

build-lune-touch:
	$(MAKE) -C $(LUNE_TOUCH_DIR) build

dashboard-build-lune-touch:
	$(MAKE) -C $(LUNE_TOUCH_DIR) dashboard-build

test: test-lune-v6 test-lune-touch

lune-v6-help:
	$(MAKE) -C $(LUNE_V6_DIR) help

lune-touch-help:
	$(MAKE) -C $(LUNE_TOUCH_DIR) help
