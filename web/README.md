# Lune V6 ESP Dashboard

A lightweight, modular, framework-free dashboard for the Lune V6 ESPHome
firmware. The implementation still uses the internal `hv6` namespace while
public UI text moves to the Lune product structure.

## Features
- Ultra-lightweight runtime
- Modular component system
- SSE real-time updates
- Offline mock mode
- SVG flow diagram with motor animation

## Structure
web/
  dashboard.js
  dashboard-src/
    core/
    utils/
    components/
    app/

## Usage
Include dashboard.js and mount to #app.

## Build
Use esbuild to bundle into a single file.
