import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { helpBadgeI18n } from '../../core/ui-kit.js';
import { exportSettings, importSettings, isSettingsBackup, saveSettingsBackup } from '../../core/api.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const css = `
.settings-backup-card .sbk-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.settings-backup-card .sbk-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.settings-backup-card .sbk-filename { color: var(--text-muted); font-size: .82rem; font-family: var(--mono); overflow-wrap: anywhere; }
.settings-backup-card .sbk-status { min-height: 1.1em; margin-top: 10px; font-size: .84rem; font-weight: 600; color: var(--text-muted); }
.settings-backup-card .sbk-status.ok { color: var(--state-ok); }
.settings-backup-card .sbk-status.err { color: var(--state-danger); }
.settings-backup-card .sbk-result { margin-top: 4px; color: var(--text-muted); font-family: var(--mono); font-size: .82rem; }
.settings-backup-card .sbk-restore { border-color: var(--danger-border); background: var(--danger-bg-soft); color: var(--danger-text); }
.settings-backup-card .sbk-restore:hover { border-color: var(--danger-border-strong); background: var(--danger-bg); color: var(--danger-text); }
@media (max-width: 520px) {
  .settings-backup-card .sbk-actions > * { flex: 1; }
}
`;

injectStyle('settings-backup-card', css);

const template = () => `
  <div class="ui-card settings-backup-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.backup.title">Backup and restore</span>${helpBadgeI18n('settings.backup.help')}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.save">Settings backup</span> <span class="ui-sublabel" data-i18n="settings.backup.saveSub">Downloads zones, manifold, motor and learned values as a JSON file.</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbk-save" data-i18n="settings.backup.saveBtn">Save backup</button></span>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.backup.restore">Restore from file</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreLearned">Restore learned motor values</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreLearnedSub">Keeps endstop calibration from the backup instead of relearning every valve.</span></span>
      <span class="ui-field"><div class="ui-toggle on sbk-learned" role="switch" aria-checked="true" data-i18n-label="settings.backup.restoreLearned" aria-label="Restore learned motor values"></div></span>
    </div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreFile">Backup file</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreSub">Overwrites the local configuration on this controller.</span></span>
      <span class="ui-field sbk-actions">
        <input type="file" class="sbk-file" accept=".json,application/json" data-i18n-label="settings.backup.choose" aria-label="Choose backup file">
        <button type="button" class="ui-btn sbk-choose" data-i18n="settings.backup.choose">Choose file…</button>
        <button type="button" class="ui-btn sbk-restore" data-i18n="settings.backup.restoreBtn" disabled>Restore</button>
      </span>
    </div>
    <div class="sbk-filename" data-i18n="settings.backup.noFile">No file selected</div>
    <div class="sbk-status" role="status"></div>
    <div class="sbk-result"></div>
  </div>
`;

export default component({
  tag: 'settings-backup-card',
  render: template,
  onMount(ctx, el) {
    const saveBtn = el.querySelector('.sbk-save');
    const learnedToggle = el.querySelector('.sbk-learned');
    const fileInput = el.querySelector('.sbk-file');
    const chooseBtn = el.querySelector('.sbk-choose');
    const restoreBtn = el.querySelector('.sbk-restore');
    const filenameEl = el.querySelector('.sbk-filename');
    const statusEl = el.querySelector('.sbk-status');
    const resultEl = el.querySelector('.sbk-result');

    // Local-only switch: it changes what the next restore sends, so there is
    // nothing to stage or commit to the device.
    let restoreLearned = true;
    let busy = false;

    const setStatus = (message, kind) => {
      statusEl.textContent = message || '';
      statusEl.className = 'sbk-status' + (kind ? ' ' + kind : '');
    };

    learnedToggle.addEventListener('click', () => {
      restoreLearned = !restoreLearned;
      learnedToggle.classList.toggle('on', restoreLearned);
      learnedToggle.setAttribute('aria-checked', restoreLearned ? 'true' : 'false');
    });

    saveBtn.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      saveBtn.disabled = true;
      resultEl.textContent = '';
      setStatus(t('settings.backup.saving'));
      exportSettings(true)
        .then((envelope) => {
          if (!isSettingsBackup(envelope)) throw new Error('unexpected_export_payload');
          setStatus(t('settings.backup.saved', { file: saveSettingsBackup(envelope) }), 'ok');
        })
        .catch((err) => {
          console.error('[Backup] export failed:', err);
          setStatus(t('settings.backup.saveFailed'), 'err');
        })
        .finally(() => {
          busy = false;
          saveBtn.disabled = false;
        });
    });

    chooseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      filenameEl.textContent = file ? file.name : t('settings.backup.noFile');
      restoreBtn.disabled = !file || busy;
      resultEl.textContent = '';
      setStatus('');
    });

    restoreBtn.addEventListener('click', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file || busy) return;

      let text = '';
      try {
        text = await file.text();
      } catch (err) {
        setStatus(t('settings.backup.readFailed'), 'err');
        return;
      }

      // Reject a foreign file here so nothing unexpected reaches the device.
      let envelope = null;
      try {
        envelope = JSON.parse(text);
      } catch (err) {
        setStatus(t('settings.backup.invalidFile'), 'err');
        return;
      }
      if (!isSettingsBackup(envelope)) {
        setStatus(t('settings.backup.invalidFile'), 'err');
        return;
      }

      if (!window.confirm(t('settings.backup.confirmRestore', { file: file.name }))) return;

      busy = true;
      restoreBtn.disabled = true;
      resultEl.textContent = '';
      setStatus(t('settings.backup.restoring'));
      importSettings(envelope, restoreLearned)
        .then((result) => {
          setStatus(t('settings.backup.restored'), 'ok');
          resultEl.textContent = t('settings.backup.result', {
            applied: result.applied,
            skipped: result.skipped,
            ignored: result.ignored,
          });
        })
        .catch((err) => {
          console.error('[Backup] restore failed:', err);
          setStatus(t('settings.backup.restoreFailed'), 'err');
        })
        .finally(() => {
          busy = false;
          restoreBtn.disabled = false;
        });
    });

    subscribeLanguage(() => localize(el));
    localize(el);
  }
});
