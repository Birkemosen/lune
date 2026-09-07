import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { helpBadgeI18n } from '../../core/ui-kit.js';
import { E, es, getDashboardValue, setDashboardValue, subscribeDashboard } from '../../core/store.js';
import { fetchLatestRelease, firmwareCheck, firmwareInstall, firmwarePrepare, ReleaseCheckError, releaseAssetFor, uploadFirmware } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// GitHub is polite-rate territory: check when Settings is opened and when the
// button is pressed, never on the 3 s device poll.
const CHECK_MIN_INTERVAL_MS = 10 * 60 * 1000;
const NOTES_MAX_CHARS = 600;

const css = `
.settings-firmware-card .sfw-version { font-family: var(--mono); font-size: .95rem; font-weight: 700; color: var(--text-strong); }
.settings-firmware-card .sfw-status { min-height: 1.1em; color: var(--text-muted); font-size: .82rem; font-weight: 600; }
.settings-firmware-card .sfw-status.ok { color: var(--state-ok); }
.settings-firmware-card .sfw-status.err { color: var(--state-danger); }
.settings-firmware-card .sfw-banner { margin: 12px 0 2px; padding: 14px 16px; border: 1px solid var(--accent-border); border-radius: 10px; background: var(--accent-bg-soft); }
.settings-firmware-card .sfw-banner[hidden] { display: none; }
.settings-firmware-card .sfw-banner-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.settings-firmware-card .sfw-banner-head strong { color: var(--text-strong); font-size: .92rem; font-weight: 650; }
.settings-firmware-card .sfw-jump { border: 0; padding: 0; background: none; color: var(--accent); font: inherit; font-size: .82rem; font-weight: 650; text-decoration: underline; cursor: pointer; }
.settings-firmware-card .sfw-hop { margin-top: 6px; font-family: var(--mono); font-size: 1.02rem; font-weight: 700; color: var(--text-strong); }
.settings-firmware-card .sfw-hop span { color: var(--text-faint); font-weight: 600; }
.settings-firmware-card .sfw-notes { margin-top: 10px; max-height: 190px; overflow-y: auto; color: var(--text-muted); font-size: .84rem; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.settings-firmware-card .sfw-notes-label { margin-top: 12px; color: var(--text-faint); font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.settings-firmware-card .sfw-banner-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.settings-firmware-card .sfw-asset { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; min-width: 150px; padding: 9px 14px; border: 1px solid var(--control-border); border-radius: 8px; color: var(--text-strong); font-size: .875rem; font-weight: 700; text-decoration: none; }
.settings-firmware-card .sfw-asset:hover { border-color: var(--control-border-hover); background: var(--control-bg-hover); }
.settings-firmware-card .sfw-install { min-width: 150px; border-color: var(--accent); background: var(--accent); color: var(--text-on-accent); }
.settings-firmware-card .sfw-upload-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.settings-firmware-card .sfw-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.settings-firmware-card .sfw-filename { color: var(--text-muted); font-size: .82rem; font-family: var(--mono); overflow-wrap: anywhere; }
.settings-firmware-card .sfw-progress { height: 4px; margin-top: 10px; border-radius: 3px; background: var(--control-bg-hover); overflow: hidden; }
.settings-firmware-card .sfw-progress[hidden] { display: none; }
.settings-firmware-card .sfw-progress > i { display: block; height: 100%; width: 0%; background: var(--accent); transition: width .25s ease; }
@media (max-width: 520px) {
  .settings-firmware-card .sfw-install, .settings-firmware-card .sfw-asset { flex: 1; }
}
`;

injectStyle('settings-firmware-card', css);

const template = () => `
  <div class="ui-card settings-firmware-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.firmware.title">Firmware</span>${helpBadgeI18n('settings.firmware.help')}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.firmware.installed">Installed version</span> <span class="ui-sublabel sfw-status" role="status">—</span></span>
      <span class="ui-field"><span class="sfw-version">—</span><button type="button" class="ui-btn sfw-check" data-i18n="settings.firmware.check">Check for update</button></span>
    </div>
    <div class="sfw-banner" hidden>
      <div class="sfw-banner-head">
        <strong data-i18n="settings.firmware.available">Update available</strong>
        <button type="button" class="sfw-jump" data-i18n="settings.firmware.backupFirst">Save a settings backup first</button>
      </div>
      <div class="sfw-hop"></div>
      <div class="sfw-notes-label" data-i18n="settings.firmware.releaseNotes">Release notes</div>
      <div class="sfw-notes"></div>
      <div class="sfw-banner-btns">
        <button type="button" class="ui-btn sfw-install" data-i18n="settings.firmware.install">Install now</button>
        <a class="sfw-asset" href="#" download data-i18n="settings.firmware.download">Download .ota.bin</a>
      </div>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.firmware.manual">Manual upload</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.firmware.manualLabel">Firmware image</span> <span class="ui-sublabel" data-i18n="settings.firmware.manualSub">Push a .bin you built locally. The controller reboots when flashing finishes.</span></span>
      <span class="ui-field sfw-upload-row">
        <input type="file" class="sfw-file" accept=".bin" data-i18n-label="settings.firmware.choose" aria-label="Choose firmware image">
        <button type="button" class="ui-btn sfw-choose" data-i18n="settings.firmware.choose">Choose .bin…</button>
        <button type="button" class="ui-btn sfw-upload" data-i18n="settings.firmware.upload" disabled>Upload and install</button>
      </span>
    </div>
    <div class="sfw-filename" data-i18n="settings.firmware.noFile">No file selected</div>
    <div class="sfw-progress" hidden><i></i></div>
    <div class="ui-note sfw-upload-status" role="status"></div>
  </div>
`;

// Compare the release triple only: development builds carry a -N suffix
// (v1.0.0-42) that must not read as newer than the v1.0.0 release itself.
export function parseVersion(raw) {
  const match = String(raw || '').trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function isNewerVersion(latest, current) {
  const next = parseVersion(latest);
  if (!next) return false;
  const now = parseVersion(current);
  if (!now) return true;
  for (let i = 0; i < 3; i++) {
    if (next[i] !== now[i]) return next[i] > now[i];
  }
  return false;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function truncateNotes(body) {
  const text = String(body || '').trim();
  if (text.length <= NOTES_MAX_CHARS) return text;
  return text.slice(0, NOTES_MAX_CHARS).replace(/\s+\S*$/, '') + '…';
}

// Open the sibling backup disclosure so a backup can be taken before flashing.
function revealBackupCard() {
  const card = document.querySelector('.settings-backup-card');
  if (!card) return;
  const disclosure = card.closest('details');
  if (disclosure) disclosure.open = true;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const button = card.querySelector('.sbk-save');
  if (button) button.focus({ preventScroll: true });
}

export default component({
  tag: 'settings-firmware-card',
  render: template,
  onMount(ctx, el) {
    const versionEl = el.querySelector('.sfw-version');
    const statusEl = el.querySelector('.sfw-status');
    const checkBtn = el.querySelector('.sfw-check');
    const banner = el.querySelector('.sfw-banner');
    const hopEl = el.querySelector('.sfw-hop');
    const notesEl = el.querySelector('.sfw-notes');
    const installBtn = el.querySelector('.sfw-install');
    const assetLink = el.querySelector('.sfw-asset');
    const jumpBtn = el.querySelector('.sfw-jump');
    const fileInput = el.querySelector('.sfw-file');
    const chooseBtn = el.querySelector('.sfw-choose');
    const uploadBtn = el.querySelector('.sfw-upload');
    const filenameEl = el.querySelector('.sfw-filename');
    const progressEl = el.querySelector('.sfw-progress');
    const progressBar = progressEl.querySelector('i');
    const uploadStatusEl = el.querySelector('.sfw-upload-status');

    let release = null;
    let checking = false;
    let lastCheckAt = 0;
    let uploading = false;

    const installedVersion = () => es(gkey.firmware) || getDashboardValue('firmwareVersion') || '';

    const setStatus = (message, kind) => {
      statusEl.textContent = message || '';
      statusEl.className = 'ui-sublabel sfw-status' + (kind ? ' ' + kind : '');
    };

    // The firmware's own update platform reports what it found in the release
    // manifest. Use it when this browser cannot reach GitHub itself.
    const deviceRelease = () => {
      const entry = E['firmware_update'];
      if (!entry || entry.available !== true) return null;
      const tag = String(entry.latest || '').trim();
      return tag ? { tag, notes: t('settings.firmware.deviceReported'), asset: releaseAssetFor(tag) } : null;
    };

    // Whichever source reports the newer tag wins, so a stale browser result
    // never hides an update the controller already knows about.
    const currentRelease = () => {
      const device = deviceRelease();
      if (!release) return device;
      return device && isNewerVersion(device.tag, release.tag) ? device : release;
    };

    const paintVersion = () => {
      versionEl.textContent = installedVersion() || t('settings.firmware.unknownVersion');
    };

    const paintBanner = () => {
      const latest = currentRelease();
      const available = !!latest && isNewerVersion(latest.tag, installedVersion());
      banner.hidden = !available;
      if (!available) {
        setDashboardValue('firmwareUpdateAvailable', null);
        return;
      }
      hopEl.innerHTML = escapeHtml(installedVersion() || t('settings.firmware.unknownVersion')) +
        ' <span>→</span> ' + escapeHtml(latest.tag);
      notesEl.textContent = truncateNotes(latest.notes) || t('common.noData');
      assetLink.href = latest.asset.url;
      assetLink.setAttribute('download', latest.asset.name);
      assetLink.title = latest.asset.name;
      setDashboardValue('firmwareUpdateAvailable', {
        current: installedVersion(),
        latest: latest.tag,
        url: latest.asset.url,
      });
    };

    const check = (manual) => {
      if (checking) return;
      if (!manual && lastCheckAt && Date.now() - lastCheckAt < CHECK_MIN_INTERVAL_MS) return;
      checking = true;
      lastCheckAt = Date.now();
      checkBtn.disabled = true;
      setStatus(t('settings.firmware.checking'));
      // Ask the device to refresh its http_request update entity in parallel —
      // useful when the browser cannot see GitHub but the controller can, or
      // when no browser-visible release exists yet.
      Promise.resolve(firmwareCheck()).catch(() => {});
      fetchLatestRelease()
        .then((latest) => {
          release = latest;
          paintBanner();
          const newer = isNewerVersion(latest.tag, installedVersion());
          setStatus(
            newer ? t('settings.firmware.availableStatus', { version: latest.tag }) : t('settings.firmware.upToDate'),
            newer ? null : 'ok'
          );
        })
        .catch((err) => {
          release = null;
          paintBanner();
          const device = deviceRelease();
          if (device) {
            setStatus(
              isNewerVersion(device.tag, installedVersion())
                ? t('settings.firmware.availableStatus', { version: device.tag })
                : t('settings.firmware.upToDate'),
              isNewerVersion(device.tag, installedVersion()) ? null : 'ok'
            );
            return;
          }
          const code = err instanceof ReleaseCheckError ? err.code : 'network';
          if (code === 'no_releases') {
            setStatus(t('settings.firmware.noReleases'), 'ok');
            return;
          }
          setStatus(t('settings.firmware.checkFailed'), 'err');
        })
        .finally(() => {
          checking = false;
          checkBtn.disabled = false;
        });
    };

    checkBtn.addEventListener('click', () => check(true));
    jumpBtn.addEventListener('click', revealBackupCard);

    installBtn.addEventListener('click', () => {
      const latest = currentRelease();
      if (!latest) return;
      if (!window.confirm(t('settings.firmware.confirmInstall', { version: latest.tag }))) return;
      installBtn.disabled = true;
      installBtn.textContent = t('settings.firmware.installing');
      Promise.resolve(firmwareInstall())
        .then(() => setStatus(t('settings.firmware.installStarted')))
        .catch(() => {
          setStatus(t('settings.firmware.installFailed'), 'err');
          installBtn.disabled = false;
          installBtn.textContent = t('settings.firmware.install');
        });
    });

    chooseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      filenameEl.textContent = file ? file.name : t('settings.firmware.noFile');
      uploadBtn.disabled = !file || uploading;
      uploadStatusEl.textContent = '';
      uploadStatusEl.className = 'ui-note sfw-upload-status';
    });

    uploadBtn.addEventListener('click', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file || uploading) return;
      if (!window.confirm(t('settings.firmware.confirmUpload', { file: file.name }))) return;

      uploading = true;
      uploadBtn.disabled = true;
      chooseBtn.disabled = true;
      progressEl.hidden = false;
      progressBar.style.width = '0%';
      uploadStatusEl.className = 'ui-note sfw-upload-status';
      uploadStatusEl.textContent = t('settings.firmware.uploading', { value: 0 });

      // Quiesce valves and free RAM first; a device that rejects the command
      // still accepts the image, so a failed prepare must not block the upload.
      Promise.resolve(firmwarePrepare())
        .catch((err) => console.warn('[Firmware] prepare rejected, continuing with upload:', err))
        .then(() => uploadFirmware(file, (pct) => {
          progressBar.style.width = pct + '%';
          uploadStatusEl.textContent = t('settings.firmware.uploading', { value: pct });
        }))
        .then(() => {
          progressBar.style.width = '100%';
          uploadStatusEl.className = 'ui-note sfw-upload-status';
          uploadStatusEl.textContent = t('settings.firmware.uploadDone');
        })
        .catch((err) => {
          console.error('[Firmware] upload failed:', err);
          progressEl.hidden = true;
          uploadStatusEl.textContent = t('settings.firmware.uploadFailed');
        })
        .finally(() => {
          uploading = false;
          chooseBtn.disabled = false;
          uploadBtn.disabled = false;
        });
    });

    // Check once the operator actually opens Settings, then only on request.
    subscribeDashboard('section', () => {
      if (getDashboardValue('section') === 'settings') check(false);
    });
    subscribe(gkey.firmware, () => {
      paintVersion();
      paintBanner();
    });
    subscribe('firmware_update', paintBanner);
    subscribeLanguage(() => {
      localize(el);
      paintVersion();
      paintBanner();
    });
    localize(el);
    paintVersion();
    if (getDashboardValue('section') === 'settings') check(false);
  }
});
