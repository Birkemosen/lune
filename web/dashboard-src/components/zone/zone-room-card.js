import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { ev, es, getDashboardValue, subscribeDashboard, zoneTag } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { applyZoneName, setZoneNumber, setZoneSelect, setZoneText } from '../../core/api.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `
.zone-room-card { height: 100%; }

.zone-room-card .wall-lbl-hint {
  font-size: .72rem;
  color: var(--text-faint);
  font-style: italic;
  margin: 2px 0 8px;
}

.zone-room-card .wall-btn-group {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.zone-room-card .wall-btn {
  padding: 8px 4px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: .79rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .12s ease, color .12s ease, border-color .12s ease, box-shadow .12s ease;
}

.zone-room-card .wall-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(124,155,208,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
`;

injectStyle('zone-room-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Zone Settings</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Friendly Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.area">Zone Area (m²)</span>
      <span class="ui-field"><input class="ui-input zr-area" type="number" min="1" step="0.1" placeholder="m2"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.spacing">Pipe Spacing C-C (mm)</span>
      <span class="ui-field"><input class="ui-input zr-spacing" type="number" min="50" step="5" placeholder="200"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.pipeType">Pipe Type</span>
      <span class="ui-field"><select class="ui-select zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select></span>
    </div>

    <div class="ui-section" data-i18n="zone.room.exteriorWalls">Exterior Walls</div>
    <div class="wall-lbl-hint" data-i18n="zone.room.selectAll">Select all that apply</div>
    <div class="wall-btn-group">
      <button class="wall-btn" data-wall="None" data-i18n="common.none">None</button>
      <button class="wall-btn" data-wall="N">N</button>
      <button class="wall-btn" data-wall="S">S</button>
      <button class="wall-btn" data-wall="E">E</button>
      <button class="wall-btn" data-wall="W">W</button>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-room-card',
  render: template,
  onMount(ctx, el) {
    const nameEl = el.querySelector('.zr-friendly');
    const areaEl = el.querySelector('.zr-area');
    const spacingEl = el.querySelector('.zr-spacing');
    const pipeEl = el.querySelector('.zr-pipe');
    const wallBtns = el.querySelector('.wall-btn-group').querySelectorAll('.wall-btn');

    function zone() {
      return getDashboardValue('selectedZone');
    }

    const form = cardForm(el);

    form.text(nameEl, { read: () => zoneTag(zone()) || '', commit: (v) => applyZoneName(zone(), v) });
    form.num(areaEl, { read: () => ev(key.area(zone())), commit: (v) => setZoneNumber(zone(), 'zone_area_m2', v) });
    form.num(spacingEl, { read: () => ev(key.spacing(zone())), commit: (v) => setZoneNumber(zone(), 'zone_pipe_spacing_mm', v || 200) });
    form.select(pipeEl, { read: () => es(key.pipeType(zone())) || 'Unknown', commit: (v) => setZoneSelect(zone(), 'zone_pipe_type', v) });

    // Exterior-wall buttons: a custom multi-select staged with the rest of the
    // form. The coordinator can later use this local installation metadata for
    // its weather and thermal model.
    let stagedWalls = [];
    function paintWalls() {
      wallBtns.forEach(btn => {
        const w = btn.dataset.wall;
        btn.classList.toggle('active', w === 'None' ? stagedWalls.length === 0 : stagedWalls.includes(w));
      });
    }
    const wallsField = form.custom({
      sync: () => {
        const raw = es(key.exteriorWalls(zone())) || 'None';
        stagedWalls = raw === 'None' ? [] : raw.split(',').filter(Boolean);
        paintWalls();
      },
      commit: () => setZoneText(zone(), 'zone_exterior_walls', stagedWalls.length ? stagedWalls.join(',') : 'None')
    });
    wallBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.dataset.wall;
        let dirs = stagedWalls.slice();
        if (w === 'None') {
          dirs = [];
        } else {
          const idx = dirs.indexOf(w);
          if (idx >= 0) dirs.splice(idx, 1); else dirs.push(w);
        }
        stagedWalls = ['N', 'S', 'E', 'W'].filter(d => dirs.includes(d));
        paintWalls();
        wallsField.markDirty();
      });
    });

    function refreshIfSelectedZone(id) {
      const z = zone();
      if (
        id === key.area(z) || id === key.spacing(z) || id === key.pipeType(z) ||
        id === key.exteriorWalls(z)
      ) {
        form.refresh();
      }
    }

    // Switching zones abandons any pending edits and loads the new zone.
    subscribeDashboard('selectedZone', form.discard);
    subscribeDashboard('zoneNames', form.refresh);
    for (let z = 1; z <= 6; z++) {
      subscribe(key.area(z), refreshIfSelectedZone);
      subscribe(key.spacing(z), refreshIfSelectedZone);
      subscribe(key.pipeType(z), refreshIfSelectedZone);
      subscribe(key.exteriorWalls(z), refreshIfSelectedZone);
    }
    subscribeLanguage(() => localize(el));
    localize(el);
    form.refresh();
  }
});
