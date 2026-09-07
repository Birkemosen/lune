#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
app="$root/web/dashboard-src/app/app-root.js"
header="$root/web/dashboard-src/app/header.js"
card="$root/web/dashboard-src/components/zone/zone-card.js"
keys="$root/web/dashboard-src/utils/keys.js"
flow="$root/web/dashboard-src/components/overview/flow-diagram.js"
touch="$root/web/dashboard-src/components/settings/settings-touch-card.js"
dashboard_cpp="$root/components/lv6_dashboard/lv6_dashboard.cpp"
api="$root/web/dashboard-src/core/api.js"
theme="$root/web/dashboard-src/core/theme.js"
i18n="$root/web/dashboard-src/core/i18n.js"
mock="$root/web/dashboard-src/core/mock.js"
sse="$root/web/dashboard-src/core/sse.js"
main="$root/web/dashboard-src/main.js"
firmware_card="$root/web/dashboard-src/components/settings/settings-firmware-card.js"
backup_card="$root/web/dashboard-src/components/settings/settings-backup-card.js"
logs="$root/web/dashboard-src/components/logs/logs-view.js"
system_card="$root/web/dashboard-src/components/diagnostics/diag-system-card.js"

grep -qF '<div class="main-panel"><div class="hdr"></div><main class="view-panel">' "$app" >/dev/null
grep -qF 'overview-status status-summary' "$app" >/dev/null
grep -qF 'Local heating status and current exceptions' "$header" >/dev/null
grep -qF 'position:sticky;top:0;z-index:20' "$app" >/dev/null
grep -qF 'Hydraulic overview' "$app" >/dev/null
grep -qF '24-hour activity' "$app" >/dev/null
grep -qF 'dashboard-connection' "$app" >/dev/null
grep -qF 'flow-diagram-slot' "$app" >/dev/null
grep -qF 'hydraulic-history-slot' "$app" >/dev/null
grep -qF 'Needs attention' "$app" >/dev/null
grep -qF 'aria-current' "$header" >/dev/null
grep -qF 'v6-more-toggle' "$header" >/dev/null
grep -qF '<button type="button" class="zone-card"' "$card" >/dev/null
grep -qF 'subscribeDashboard, zoneLabel, zoneTag' "$card" >/dev/null
grep -qF "setSection('zones')" "$card" >/dev/null
grep -qF '.zone-card.zs-heating .zc-dot{background:var(--accent)}' "$card" >/dev/null
grep -qF '.zone-card.zs-idle .zc-dot,.zone-card.zs-off .zc-dot{background:var(--state-disabled)}' "$card" >/dev/null
! grep -qF '.zone-card.zs-idle .zc-dot{background:var(--state-ok)}' "$card" >/dev/null
grep -qF 'data-open-zones' "$app" >/dev/null
for removed in 'overview-zones' 'zones-master-detail' 'settings-group-head' 'diagnostics-group-head'; do
  if grep -qF "$removed" "$app" >/dev/null; then
    echo "Unexpected legacy dashboard pattern: $removed" >&2
    exit 1
  fi
done
grep -qF 'settings-disclosure touch-settings' "$app" >/dev/null
grep -qF 'Room clocks' "$app" >/dev/null
grep -qF 'ble_clock_sync_now' "$dashboard_cpp" >/dev/null
grep -qF 'Waiting for Lune Touch' "$touch" >/dev/null
grep -qF 'Approve Lune Touch' "$touch" >/dev/null
! grep -qF 'Manual recovery' "$touch" >/dev/null
! grep -qF 'Connection key' "$touch" >/dev/null
! grep -qF 'touch-installation"' "$touch" >/dev/null
grep -qF 'authorityProposalPending' "$keys" >/dev/null
grep -qF 'handle_authority_proposal_' "$dashboard_cpp" >/dev/null
grep -qF 'awaiting_local_approval' "$dashboard_cpp" >/dev/null
grep -qF 'approve-proposal' "$dashboard_cpp" >/dev/null
grep -qF 'authority_pairing_required' "$dashboard_cpp" >/dev/null
grep -qF 'handle_authority_revoke_' "$dashboard_cpp" >/dev/null
! grep -qF 'strcmp(key, "authority_shared_key")' "$dashboard_cpp" >/dev/null
grep -qF "Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'" "$api" >/dev/null
# Settings restore is the only JSON write: a backup envelope is a nested
# document that does not fit the flat form-urlencoded shape. Every other write
# endpoint must keep using form bodies.
grep -qF 'function postJsonV1' "$api" >/dev/null
grep -qF "postJsonV1(" "$api" >/dev/null
grep -qF "'/settings/import'," "$api" >/dev/null
[ "$(grep -cF "'Content-Type': 'application/json'" "$api")" = "1" ]
grep -qF 'Preheat absorption' "$app" >/dev/null
grep -qF 'diagnostics-attention attention' "$app" >/dev/null
grep -qF 'Runtime health' "$app" >/dev/null
grep -qF 'Hardware and connectivity' "$app" >/dev/null
grep -qF 'Manual motor control' "$app" >/dev/null
grep -qF 'Recovery and restart' "$app" >/dev/null
grep -qF "window.confirm('Restart Lune V6 now?" "$root/web/dashboard-src/components/settings/settings-control-card.js" >/dev/null
grep -qF "window.confirm('Reset the 1-Wire probe map" "$root/web/dashboard-src/components/settings/settings-control-card.js" >/dev/null
grep -qF 'zones-index' "$app" >/dev/null
grep -qF 'zones-summary' "$app" >/dev/null
grep -qF 'zone-detail-toolbar' "$app" >/dev/null
grep -qF 'zone-configuration-group' "$app" >/dev/null
grep -qF 'Service and recovery' "$app" >/dev/null
grep -qF 'class="zone-tabstrip" role="tablist"' "$app" >/dev/null
grep -qF 'role="tab"' "$app" >/dev/null
grep -qF 'data-zone-back' "$app" >/dev/null
grep -qF "zoneTabstrip.addEventListener('click'" "$app" >/dev/null
grep -qF "['ArrowLeft','ArrowRight','Home','End']" "$app" >/dev/null
! grep -qF 'class="zone-picker"' "$app" >/dev/null
! grep -rqF 'zone_exterior_walls' "$root/web/dashboard-src" >/dev/null
! grep -qF 'exterior_walls' "$dashboard_cpp" >/dev/null
! grep -rqF 'zone_area_m2' "$root/web/dashboard-src" >/dev/null
! grep -rqF 'zone_pipe_spacing_mm' "$root/web/dashboard-src" >/dev/null
! grep -rqF 'zone_pipe_type' "$root/web/dashboard-src" >/dev/null
! grep -rqF 'Zone Area' "$root/web/dashboard-src" >/dev/null
! grep -rqF 'Pipe Spacing' "$root/web/dashboard-src" >/dev/null
! grep -rqF 'Pipe Type' "$root/web/dashboard-src" >/dev/null
grep -qF 'Zone identity' "$root/web/dashboard-src/components/zone/zone-room-card.js" >/dev/null
! grep -qF "input.addEventListener('dblclick'" "$root/web/dashboard-src/core/ui-kit.js" >/dev/null
grep -qF "new CustomEvent('zone-open'" "$card" >/dev/null
grep -qF 'Advanced motor properties' "$root/web/dashboard-src/components/zone/zone-detail.js" >/dev/null
grep -qF 'badge-heating{background:rgba(var(--accent-rgb),.12);color:var(--accent)}' "$root/web/dashboard-src/components/zone/zone-detail.js" >/dev/null
grep -qF '.status-summary h2.status-ok{color:var(--text-strong)!important}' "$app" >/dev/null
grep -qF 'effectiveSetpoint' "$keys" >/dev/null
grep -qF 'baseSetpoint' "$keys" >/dev/null
grep -qF 'coordinatorOffset' "$keys" >/dev/null
grep -qF 'coordinatorRemaining' "$keys" >/dev/null
grep -qF -- '--flow-track:#596779' "$app" >/dev/null
grep -qF 'class="flow-track"' "$flow" >/dev/null
grep -qF "zoneRefs.track.setAttribute('stroke-dasharray', enabled ? 'none' : '5 7')" "$flow" >/dev/null
grep -qF 'const flowing = enabled && pct != null && pct > 0' "$flow" >/dev/null
! grep -qF 'desktop-boxgrad' "$flow" >/dev/null
grep -qF 'fill="var(--flow-source-bg)" stroke="var(--accent)"' "$flow" >/dev/null
grep -qF 'return pct > 0 ? COLOR_FLOW_ACTIVE : COLOR_FRIENDLY_ON' "$flow" >/dev/null
! grep -qF '#021824' "$flow" >/dev/null
! grep -qF 'stop-color="#7aa7ce"' "$flow" >/dev/null
! grep -rqF 'fonts.googleapis.com' "$root/web/dashboard-src" >/dev/null
! grep -qF 'grid-template-columns: repeat(3' "$app" >/dev/null
! grep -qF 'Target Temperature' "$root/web/dashboard-src/components/zone/zone-detail.js" >/dev/null
grep -qF "const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'" "$theme" >/dev/null
grep -qF 'root.dataset.colorScheme = scheme' "$theme" >/dev/null
grep -qF "colorSchemeMedia.addEventListener('change', update)" "$theme" >/dev/null
grep -qF ':root[data-color-scheme="light"]' "$app" >/dev/null
! grep -qF 'Accent theme' "$header" >/dev/null
! grep -qF 'hdr-theme' "$header" >/dev/null
grep -qF 'Appearance' "$app" >/dev/null
grep -qF "mountComponent('settings-appearance-card')" "$app" >/dev/null
grep -qF "import './components/settings/settings-appearance-card.js'" "$main" >/dev/null
grep -qF 'settings-appearance-card' "$root/web/dashboard-src/components/settings/settings-appearance-card.js" >/dev/null
grep -qF "'settings.appearance.title': 'Appearance'" "$i18n" >/dev/null
! grep -qF '>Appearance<' "$header" >/dev/null
grep -qF 'color-scheme\" content=\"light dark' "$dashboard_cpp" >/dev/null
grep -qF 'reserved_touch_weather_v4' "$root/components/lv6_config_store/lv6_types.h" >/dev/null

grep -qF 'overview.connectivity.version' "$root/web/dashboard-src/core/i18n.js" >/dev/null
grep -qF 'class="cc-ver"' "$root/web/dashboard-src/components/overview/connectivity-card.js" >/dev/null
grep -qF 'gkey.firmware' "$root/web/dashboard-src/components/overview/connectivity-card.js" >/dev/null
grep -qF 'setInterval(paintUptime, 1000)' "$root/web/dashboard-src/components/overview/connectivity-card.js" >/dev/null
grep -qF 'return m + "m"' "$root/web/dashboard-src/utils/format.js" >/dev/null
grep -qF '\"uptime_s\":%lu,\"poll_after_ms\"' "$dashboard_cpp" >/dev/null
grep -qF 'gkey.uptime' "$root/web/dashboard-src/core/sse.js" >/dev/null
grep -qF 'firmware_suffix' "$root/version.yaml" >/dev/null
grep -qF '${firmware_version}${firmware_suffix}' "$root/lune.yaml" >/dev/null
grep -qF 'stamp_version.py' "$root/Makefile" >/dev/null

# ---- firmware update, settings backup, log export, reset reason ----
grep -qF 'firmware-slot' "$app" >/dev/null
grep -qF 'backup-slot' "$app" >/dev/null
grep -qF 'Version, updates and manual upload' "$app" >/dev/null
grep -qF 'Save or reapply local configuration' "$app" >/dev/null
grep -qF "mountComponent('settings-firmware-card')" "$app" >/dev/null
grep -qF "mountComponent('settings-backup-card')" "$app" >/dev/null
grep -qF "import './components/settings/settings-firmware-card.js'" "$main" >/dev/null
grep -qF "import './components/settings/settings-backup-card.js'" "$main" >/dev/null

grep -qF "command('firmware_check')" "$api" >/dev/null
grep -qF "command('firmware_install')" "$api" >/dev/null
grep -qF "command('firmware_prepare')" "$api" >/dev/null
grep -qF 'api.github.com/repos/birkemosen/lune/releases/latest' "$api" >/dev/null
grep -qF 'releases/latest/download/' "$api" >/dev/null
grep -qF "OTA_UPLOAD_PATH = '/update'" "$api" >/dev/null
grep -qF "body.append('update', file, file.name)" "$api" >/dev/null
grep -qF 'request.upload.onprogress' "$api" >/dev/null
grep -qF "'/settings/export'" "$api" >/dev/null
grep -qF "SETTINGS_BACKUP_TYPE = 'lune-v6-settings'" "$api" >/dev/null
grep -qF "BASE + '/logs/download'" "$api" >/dev/null
grep -qF 'export async function downloadDeviceLogs' "$api" >/dev/null
# The GitHub release check must stay off the 3 s device poll.
! grep -qF 'api.github.com' "$sse" >/dev/null

# Endpoints and commands the dashboard depends on must exist in the firmware.
grep -qF '"/settings/export"' "$dashboard_cpp" >/dev/null
grep -qF '"/settings/import"' "$dashboard_cpp" >/dev/null
grep -qF '"/logs/download"' "$dashboard_cpp" >/dev/null
grep -qF '"firmware_check"' "$dashboard_cpp" >/dev/null
grep -qF '"firmware_install"' "$dashboard_cpp" >/dev/null
grep -qF '"firmware_prepare"' "$dashboard_cpp" >/dev/null
grep -qF 'text_sensor-reset_reason' "$dashboard_cpp" >/dev/null
grep -qF 'firmware_update\":{\"current' "$dashboard_cpp" >/dev/null

grep -qF 'CHECK_MIN_INTERVAL_MS' "$firmware_card" >/dev/null
grep -qF "E['firmware_update']" "$firmware_card" >/dev/null
grep -qF 'export function releaseAssetFor' "$api" >/dev/null
grep -qF 'export function isNewerVersion' "$firmware_card" >/dev/null
grep -qF 'settings.firmware.confirmInstall' "$firmware_card" >/dev/null
grep -qF 'settings.firmware.backupFirst' "$firmware_card" >/dev/null
grep -qF 'settings.firmware.confirmUpload' "$firmware_card" >/dev/null
grep -qF "setDashboardValue('firmwareUpdateAvailable'" "$firmware_card" >/dev/null
grep -qF 'accept=".bin"' "$firmware_card" >/dev/null
grep -qF 'sfw-progress' "$firmware_card" >/dev/null

grep -qF 'settings-backup-card' "$backup_card" >/dev/null
grep -qF 'isSettingsBackup' "$backup_card" >/dev/null
grep -qF 'settings.backup.invalidFile' "$backup_card" >/dev/null
grep -qF 'settings.backup.confirmRestore' "$backup_card" >/dev/null
grep -qF 'settings.backup.result' "$backup_card" >/dev/null
grep -qF 'sbk-learned' "$backup_card" >/dev/null

grep -qF 'download-btn' "$logs" >/dev/null
grep -qF 'downloadDeviceLogs' "$logs" >/dev/null

grep -qF "resetReason: 'text_sensor-reset_reason'" "$keys" >/dev/null
grep -qF 'data-k="reset"' "$system_card" >/dev/null
grep -qF 'gkey.resetReason' "$system_card" >/dev/null

grep -qF 'v6-update-badge' "$header" >/dev/null
grep -qF "subscribeDashboard('firmwareUpdateAvailable'" "$header" >/dev/null
grep -qF "setSection('settings')" "$header" >/dev/null

grep -qF 'export function mockLatestRelease' "$mock" >/dev/null
grep -qF 'export function mockSettingsExport' "$mock" >/dev/null
grep -qF 'export function mockSettingsImport' "$mock" >/dev/null
grep -qF "_type: 'lune-v6-settings'" "$mock" >/dev/null
grep -qF "cmd === 'firmware_install'" "$mock" >/dev/null

grep -qF "'settings.firmware.title': 'Firmware'" "$i18n" >/dev/null
grep -qF "'settings.backup.title': 'Backup and restore'" "$i18n" >/dev/null
grep -qF "'settings.backup.title': 'Backup og gendannelse'" "$i18n" >/dev/null
grep -qF "'logs.download': 'Download'" "$i18n" >/dev/null
grep -qF "'diagnostics.system.resetReason': 'Last reset reason'" "$i18n" >/dev/null
grep -qF "'diagnostics.system.resetReason': 'Seneste genstartsårsag'" "$i18n" >/dev/null
grep -qF "'status.updateAvailable'" "$i18n" >/dev/null

tmp=$(mktemp)
cat > "$tmp" <<'EOF'
substitutions:
  firmware_version: "v1.0.0"
  firmware_build: "1"
  firmware_suffix: "-1"
EOF
python3 "$root/stamp_version.py" "$tmp" bump >/dev/null
grep -qF 'firmware_build: "2"' "$tmp" >/dev/null
grep -qF 'firmware_suffix: "-2"' "$tmp" >/dev/null
python3 "$root/stamp_version.py" "$tmp" release v1.2.0 >/dev/null
grep -qF 'firmware_version: "v1.2.0"' "$tmp" >/dev/null
grep -qF 'firmware_suffix: ""' "$tmp" >/dev/null
grep -qF 'firmware_build: "0"' "$tmp" >/dev/null
rm -f "$tmp"

grep -qF "'diagnostics.lab.estop': 'Emergency stop'" "$i18n" >/dev/null
grep -qF "'diagnostics.lab.estop': 'Nødstop'" "$i18n" >/dev/null
grep -qF 'data-section="motorlab"' "$app" >/dev/null
grep -qF 'data-section="motorlab"' "$root/web/dashboard-src/app/header.js" >/dev/null
grep -qF "mountComponent('diag-motor-lab')" "$app" >/dev/null
grep -qF 'isDevBuild' "$app" >/dev/null
grep -qF "setSection('diagnostics')" "$app" >/dev/null
grep -qF "import './components/diagnostics/diag-motor-lab.js'" "$main" >/dev/null
grep -qF 'export function isDevBuild' "$root/web/dashboard-src/utils/dev-build.js" >/dev/null
grep -qF 'export function emergencyStopMotors' "$api" >/dev/null
grep -qF 'export async function fetchMotorTraceCsv' "$api" >/dev/null
grep -qF "BASE + '/motor-trace.csv'" "$api" >/dev/null
grep -qF 'setDriversEnabled(false)' "$api" >/dev/null
grep -qF 'class="lab-estop"' "$root/web/dashboard-src/components/diagnostics/diag-motor-lab.js" >/dev/null
grep -qF 'class="lab-step-chip"' "$root/web/dashboard-src/components/diagnostics/diag-motor-lab.js" >/dev/null
grep -qF 'class="lab-instruments"' "$root/web/dashboard-src/components/diagnostics/diag-motor-lab.js" >/dev/null
grep -qF 'POLL_MS = 250' "$root/web/dashboard-src/components/diagnostics/diag-motor-lab.js" >/dev/null
grep -qF "section') !== 'motorlab'" "$root/web/dashboard-src/components/diagnostics/diag-motor-lab.js" >/dev/null
grep -qF 'renderMotorLabCharts' "$root/web/dashboard-src/components/diagnostics/motor-lab-charts.js" >/dev/null
grep -qF 'diagnostics.lab.steps.setup' "$i18n" >/dev/null
grep -qF 'diagnostics.lab.phase.running' "$i18n" >/dev/null
grep -qF 'diagnostics.lab.cluster.motion' "$i18n" >/dev/null
grep -qF 'diagnostics.lab.res.live' "$i18n" >/dev/null
grep -qF "'diagnostics.lab.res.live': 'Live · ~250 ms poll'" "$i18n" >/dev/null
grep -qF "'diagnostics.lab.res.live': 'Live · ca. 250 ms poll'" "$i18n" >/dev/null
grep -qF "'diagnostics.lab.chart.cadence': 'Commutation cadence'" "$i18n" >/dev/null
grep -qF "'diagnostics.lab.chart.cadence': 'Kommuteringskadence'" "$i18n" >/dev/null
grep -qF 'Instrumented stroke capture and endstop thresholds' "$root/web/dashboard-src/app/header.js" >/dev/null
grep -qF "event.key !== 'Escape'" "$root/web/dashboard-src/components/diagnostics/diag-motor-lab.js" >/dev/null
grep -qF 'analyzeMotorTrace' "$root/web/dashboard-src/utils/motor-trace.js" >/dev/null
grep -qF 'export function motorTraceSeries' "$root/web/dashboard-src/utils/motor-trace.js" >/dev/null
grep -qF 'export function mockMotorTraceCsv' "$mock" >/dev/null
grep -qF 'export function mockDiagnosticsSnapshot' "$mock" >/dev/null
grep -qF 'MOCK_MOVE_MS = 4200' "$mock" >/dev/null
grep -qF 'tacho_period_us' "$mock" >/dev/null
grep -qF 'data-k="pin"' "$root/web/dashboard-src/components/diagnostics/diag-motor-lab.js" >/dev/null
grep -qF 'diagnostics.lab.stroke.contact' "$i18n" >/dev/null
grep -qF 'export function pinContactSample' "$root/web/dashboard-src/utils/motor-trace.js" >/dev/null
node --input-type=module <<EOF
import { isDevBuild } from 'file://$root/web/dashboard-src/utils/dev-build.js';
import { analyzeMotorTrace, motorTraceSeries, parseMotorTraceCsv } from 'file://$root/web/dashboard-src/utils/motor-trace.js';
if (!isDevBuild('v1.0.0-7') || isDevBuild('v1.0.0') || isDevBuild('')) process.exit(1);
const rows = ['t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples'];
for (let t = 0; t <= 4000; t += 20) {
  const running = t < 3200;
  const ma = t < 2200 ? 19.0 : (t < 2800 ? 24.0 : (running ? 22.0 : 19 + (t - 3200) * 0.03));
  const phase = t < 2200 ? 0 : (t < 2800 ? 1 : (running ? 2 : 3));
  const period = running ? 1800 : 0;
  rows.push([t, Math.floor(t / 10), ma.toFixed(1), 0, 1, 0, 1, phase, period, 40, 0, 0, 0, 0, 0, 1, 0].join(','));
}
const samples = parseMotorTraceCsv(rows.join('\\n'));
const analysis = analyzeMotorTrace(samples, 'close');
if (!analysis.ok || analysis.suggested_factor < 1.25 || analysis.peak_ma < analysis.mean_ma) process.exit(1);
if (!analysis.pin_seen || analysis.pin_t_ms < 2100 || analysis.pin_t_ms > 2300) process.exit(1);
if (samples[10].tacho_period_us !== 1800 || samples[10].adc_current_raw !== 0) process.exit(1);
const series = motorTraceSeries(samples);
if (!series.cadence.length || series.cadence[10].rate_hz < 500 || !series.slopes.length) process.exit(1);
EOF

echo 'PASS V6 dashboard HIG source contracts'
