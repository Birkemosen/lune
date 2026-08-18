import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { approveTouchProposal, revokeTouchConnection } from '../../core/api.js';
import { es, ev, isEntityOn } from '../../core/store.js';
import { gkey } from '../../utils/keys.js';

const css = `
.settings-touch-card .touch-status{display:flex;align-items:flex-start;gap:10px;padding:10px 0 16px;color:var(--text-secondary);font-size:.9rem;line-height:1.45}
.settings-touch-card .touch-status-dot{flex:0 0 auto;width:8px;height:8px;margin-top:6px;border-radius:50%;background:var(--state-disabled)}
.settings-touch-card .touch-status.connected .touch-status-dot{background:var(--state-ok)}
.settings-touch-card .touch-status.pending .touch-status-dot{background:var(--accent)}
.settings-touch-card .touch-status strong{display:block;color:var(--text-strong);font-size:.95rem}
.settings-touch-card .touch-identity{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:0;border-top:1px solid var(--separator);border-bottom:1px solid var(--separator)}
.settings-touch-card .touch-identity[hidden]{display:none!important}
.settings-touch-card .touch-identity>div{min-width:0;padding:14px 0}
.settings-touch-card .touch-identity>div:nth-child(even){padding-left:18px;border-left:1px solid var(--separator)}
.settings-touch-card .touch-identity dt{color:var(--text-faint);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}
.settings-touch-card .touch-identity dd{margin:5px 0 0;color:var(--text-strong);font-weight:650;overflow-wrap:anywhere}
.settings-touch-card .touch-note{margin:14px 0 0;color:var(--text-faint);font-size:.82rem;line-height:1.5}
.settings-touch-card .touch-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
.settings-touch-card .touch-approve{border-color:var(--accent);background:var(--accent);color:var(--text-on-accent)}
.settings-touch-card .touch-disconnect{border-color:var(--danger-border);color:var(--danger-text)}
.settings-touch-card .touch-error{min-height:1.1em;margin:10px 0 0;color:var(--state-danger);font-size:.82rem}
@media(max-width:620px){.settings-touch-card .touch-identity{grid-template-columns:1fr}.settings-touch-card .touch-identity>div:nth-child(even){padding-left:0;border-left:0}}
`;

injectStyle('settings-touch-card', css);

const template = () => `
  <div class="ui-card settings-touch-card">
    <div class="ui-card-title"><span class="ui-title-text">Lune Touch connection</span></div>
    <div class="touch-status" role="status" aria-live="polite"><span class="touch-status-dot" aria-hidden="true"></span><span class="touch-status-copy"></span></div>
    <dl class="touch-identity" hidden>
      <div><dt>Touch</dt><dd class="touch-name">Lune Touch</dd></div>
      <div><dt>Site</dt><dd class="touch-site">—</dd></div>
      <div><dt>Installation</dt><dd class="touch-installation-value">—</dd></div>
      <div><dt>Coordinator</dt><dd class="touch-coordinator-value">—</dd></div>
    </dl>
    <p class="touch-note"></p>
    <p class="touch-error" role="alert"></p>
    <div class="touch-actions"><button class="ui-btn touch-disconnect" type="button">Disconnect Touch</button><button class="ui-btn touch-approve" type="button">Approve Lune Touch</button></div>
  </div>`;

export default component({
  tag: 'settings-touch-card',
  render: template,
  onMount(ctx, el) {
    const status = el.querySelector('.touch-status');
    const statusCopy = el.querySelector('.touch-status-copy');
    const identity = el.querySelector('.touch-identity');
    const note = el.querySelector('.touch-note');
    const error = el.querySelector('.touch-error');
    const approve = el.querySelector('.touch-approve');
    const disconnect = el.querySelector('.touch-disconnect');

    function refresh() {
      const configured = isEntityOn(gkey.authorityConfigured);
      const pending = isEntityOn(gkey.authorityProposalPending);
      const state = es(gkey.authorityState) || 'unconfigured';
      const installId = pending ? es(gkey.authorityProposalInstallationId) : es(gkey.authorityInstallationId);
      const coordinatorId = pending ? es(gkey.authorityProposalCoordinatorId) : es(gkey.authorityCoordinatorId);
      const proposalName = es(gkey.authorityProposalName) || 'Lune Touch';
      const proposalSite = es(gkey.authorityProposalSite) || 'House';
      status.classList.toggle('connected', configured && !pending);
      status.classList.toggle('pending', pending);
      statusCopy.innerHTML = pending
        ? `<strong>${proposalName} is ready to connect</strong>${configured ? 'Approve it to replace the current Touch connection.' : 'Review the discovered coordinator, then approve it on this V6.'}`
        : configured
          ? `<strong>Control approved</strong>${state.replace(/_/g, ' ')}${Number(ev(gkey.authorityLeaseRemainingS)) > 0 ? ` · ${Math.round(Number(ev(gkey.authorityLeaseRemainingS)))} s lease` : ''}`
          : '<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.';
      identity.hidden = !configured && !pending;
      el.querySelector('.touch-name').textContent = pending ? proposalName : 'Lune Touch';
      el.querySelector('.touch-site').textContent = pending ? proposalSite : 'Approved coordinator';
      el.querySelector('.touch-installation-value').textContent = installId || '—';
      el.querySelector('.touch-coordinator-value').textContent = coordinatorId || '—';
      note.textContent = pending
        ? 'Approval is local to this manifold. Discovery alone never grants control.'
        : configured
          ? 'V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.'
          : 'Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.';
      approve.hidden = !pending;
      disconnect.hidden = !configured || pending;
    }

    approve.addEventListener('click', async () => {
      error.textContent = '';
      approve.disabled = true;
      approve.textContent = 'Approving…';
      try {
        await approveTouchProposal();
      } catch (cause) {
        error.textContent = cause?.message || 'Unable to approve Lune Touch.';
      } finally {
        approve.disabled = false;
        approve.textContent = 'Approve Lune Touch';
      }
    });

    disconnect.addEventListener('click', async () => {
      error.textContent = '';
      if (!window.confirm('Disconnect Lune Touch? Touch commands will be rejected until it is approved again.')) return;
      disconnect.disabled = true;
      try {
        await revokeTouchConnection();
      } catch (cause) {
        error.textContent = cause?.message || 'Unable to disconnect Lune Touch.';
      } finally {
        disconnect.disabled = false;
      }
    });

    [gkey.authorityConfigured, gkey.authorityInstallationId, gkey.authorityCoordinatorId,
      gkey.authorityState, gkey.authorityLeaseRemainingS, gkey.authorityProposalPending,
      gkey.authorityProposalInstallationId, gkey.authorityProposalCoordinatorId,
      gkey.authorityProposalName, gkey.authorityProposalSite].forEach((id) => subscribe(id, refresh));
    refresh();
  },
});
