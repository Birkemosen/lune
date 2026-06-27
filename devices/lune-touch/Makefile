# -----------------------------------------------------------------------------
# Lune Touch / Mini coordinator workspace
# -----------------------------------------------------------------------------
ROOT_DIR ?= ../..
CXX ?= clang++
FORECAST_COMPONENT_DIR := components/hv6_forecast
FORECAST_TEST_DIR := tests/forecast
FORECAST_SRCS := $(FORECAST_COMPONENT_DIR)/forecast_model.cpp \
                 $(FORECAST_TEST_DIR)/test_forecast_model.cpp
FORECAST_OUT ?= /tmp/test_lune_touch_forecast_model

.PHONY: help test test-forecast clean

help:
	@echo "Lune Touch coordinator tasks"
	@echo "  make test          Run host tests"
	@echo "  make test-forecast Run forecast preload-model tests"

test-forecast:
	$(CXX) -std=c++17 -O2 -Wall -Wextra -I $(FORECAST_COMPONENT_DIR) $(FORECAST_SRCS) -o $(FORECAST_OUT) -lm
	$(FORECAST_OUT)

test: test-forecast

clean:
	rm -f $(FORECAST_OUT)
