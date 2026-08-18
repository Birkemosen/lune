# -----------------------------------------------------------------------------
# Birkemosen product workspace
# -----------------------------------------------------------------------------
LUNE_V6_DIR ?= lune-v6

.PHONY: help \
        config build build-verify deploy ota logs discover monitor erase erase-nvs clean \
        dashboard dashboard-tooling dashboard-build dashboard-watch \
		help-v6 config-v6 build-v6 build-verify-v6 deploy-v6 ota-v6 logs-v6 discover-v6 monitor-v6 erase-v6 erase-nvs-v6 clean-v6 dashboard-v6 dashboard-tooling-v6 dashboard-build-v6 dashboard-watch-v6 test-v6 \
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
	@echo "Tests"
	@echo "  make test                Run all host tests across devices"
	@echo "  make test-ripple         Run V6 ripple-counter tests"
	@echo "  make test-balance        Run V6 adaptive-balancing tests"
	@echo ""
	@echo "Device-local help"
	@echo "  make help-v6"

config build build-verify deploy ota logs discover monitor erase erase-nvs clean dashboard dashboard-tooling dashboard-build dashboard-watch:
	$(MAKE) -C $(LUNE_V6_DIR) $@

test-ripple test-balance:
	$(MAKE) -C $(LUNE_V6_DIR) $@

help-v6:
	$(MAKE) -C $(LUNE_V6_DIR) help

config-v6 build-v6 build-verify-v6 deploy-v6 ota-v6 logs-v6 discover-v6 monitor-v6 erase-v6 erase-nvs-v6 clean-v6 dashboard-v6 dashboard-tooling-v6 dashboard-build-v6 dashboard-watch-v6:
	$(MAKE) -C $(LUNE_V6_DIR) $(patsubst %-v6,%,$@)

test-v6:
	$(MAKE) -C $(LUNE_V6_DIR) test

test: test-v6
