/**
 * Page enhancements that used to be inline in index.html (moved here so the
 * page itself carries no script, LDS budget DESIGN.md 9): +/− steppers, close
 * the device menu, place help popovers next to their "?" and show the chosen
 * file name. Everything works without it except the conveniences.
 */
let helpBtn = null;

function placeHelp(pop, btn) {
  if (!pop || !btn || window.matchMedia('(max-width:599.98px)').matches) return;
  const r = btn.getBoundingClientRect();
  const gap = 8;
  Object.assign(pop.style, {
    position: 'fixed', inset: 'unset', right: 'auto', bottom: 'auto', margin: '0', top: '0px', left: '0px',
  });
  const w = pop.offsetWidth || 280;
  const h = pop.offsetHeight || 120;
  const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - w - 8));
  let top = r.bottom + gap;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - gap);
  pop.style.top = `${top}px`;
  pop.style.left = `${left}px`;
}

function helpTrigger(pop) {
  const id = pop.id;
  if (helpBtn && helpBtn.getAttribute('popovertarget') === id) return helpBtn;
  const ae = document.activeElement;
  if (ae && ae.getAttribute && ae.getAttribute('popovertarget') === id) return ae;
  return document.querySelector(`[popovertarget="${id}"]`);
}

document.addEventListener('pointerdown', (e) => {
  const h = e.target.closest && e.target.closest('.help-btn');
  if (h) helpBtn = h;
}, true);

for (const type of ['beforetoggle', 'toggle']) {
  document.addEventListener(type, (e) => {
    const pop = e.target;
    if (e.newState !== 'open' || !pop.classList || !pop.classList.contains('help-pop')) return;
    const btn = helpTrigger(pop);
    if (btn) { helpBtn = btn; placeHelp(pop, btn); }
  }, true);
}

document.addEventListener('click', (e) => {
  const h = e.target.closest && e.target.closest('.help-btn');
  if (h) {
    helpBtn = h;
    const pop = document.getElementById(h.getAttribute('popovertarget') || '');
    if (pop) requestAnimationFrame(() => { if (pop.matches(':popover-open')) placeHelp(pop, h); });
  }
  const b = e.target.closest && e.target.closest('[data-step]');
  if (b && !b.disabled) {
    const input = b.parentNode.querySelector('input');
    if (b.dataset.step > 0) input.stepUp(); else input.stepDown();
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const d = document.querySelector('.device[open]');
  if (d && !d.contains(e.target)) d.open = false;
});

document.addEventListener('change', (e) => {
  const input = e.target;
  if (!input || input.type !== 'file') return;
  const label = input.closest('label.file');
  const name = label && label.querySelector('.file-name');
  if (name) name.textContent = (input.files && input.files[0]) ? input.files[0].name : (name.dataset.empty || '');
});
