// Must match `exploration.sections` in _data/ui.yml.
export const SECTIONS = ['research', 'projects', 'story', 'shelf', 'trips'];
export const STORAGE_KEY = 'site-exploration-v1';
export function normalizeVisits(value) {
  return Array.isArray(value) ? SECTIONS.filter(id => value.includes(id)) : [];
}
export function readVisits(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  try { return normalizeVisits(JSON.parse(raw)); } catch { return []; }
}
export function saveVisits(storage, visits) {
  const result = normalizeVisits(visits);
  storage.setItem(STORAGE_KEY, JSON.stringify(result));
  return result;
}
export function unvisited(visits) {
  return SECTIONS.filter(id => !visits.includes(id));
}
export function suggestion(visits, random = Math.random) {
  const remaining = unvisited(visits);
  return remaining.length ? remaining[Math.floor(random() * remaining.length)] : null;
}
export function initExploration(document, window) {
  const container = document.querySelector('.exploration');
  if (!container || typeof window.HTMLDialogElement?.prototype.showModal !== 'function') return;
  const fallback = document.getElementById('exploration-fallback');
  const opener = document.getElementById('exploration-open');
  const content = document.getElementById('exploration-content');
  const dialog = document.createElement('dialog');
  dialog.className = 'exploration-dialog';
  dialog.setAttribute('aria-labelledby', 'map-title');
  dialog.append(content);
  container.append(dialog);
  fallback.hidden = true;
  opener.hidden = false;
  const close = document.getElementById('exploration-close');
  close.hidden = false;
  opener.addEventListener('click', () => dialog.showModal());
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener.focus());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled])')]
      .filter(element => !element.closest('[hidden]'));
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  let storage, visits = [];
  const progress = [...container.querySelectorAll('.exploration-progress')];
  const ring = container.querySelector('.exploration-ring');
  const label = container.querySelector('.map-button-label');
  const complete = document.getElementById('exploration-complete');
  const resetNotice = document.getElementById('exploration-reset-notice');
  const next = document.getElementById('exploration-new');
  function unavailable() {
    storage = null;
    progress.forEach(element => element.hidden = true);
    container.querySelectorAll('.visit-mark').forEach(element => element.hidden = true);
    ring.setAttribute('hidden', '');
    label.hidden = false;
    complete.hidden = true;
    resetNotice.hidden = true;
  }
  function render() {
    progress.forEach(element => element.hidden = false);
    ring.removeAttribute('hidden');
    label.hidden = true;
    container.querySelectorAll('.visited-count').forEach(element => element.textContent = visits.length);
    container.querySelector('.ring-value').setAttribute('stroke-dasharray', `${visits.length} ${SECTIONS.length}`);
    document.getElementById('exploration-meter').value = visits.length;
    container.querySelectorAll('[data-visit]').forEach(link => link.querySelector('.visit-mark').hidden = !visits.includes(link.dataset.visit));
    complete.hidden = unvisited(visits).length !== 0;
    next.disabled = unvisited(visits).length === 0;
  }
  try {
    storage = window.localStorage;
    visits = readVisits(storage);
    const current = container.dataset.section;
    visits = saveVisits(storage, SECTIONS.includes(current) ? [...visits, current] : visits);
    render();
  } catch { unavailable(); }
  document.getElementById('exploration-reset').addEventListener('click', () => {
    try { visits = saveVisits(storage, []); render(); resetNotice.hidden = false; } catch { unavailable(); }
  });
  next.addEventListener('click', () => {
    const id = suggestion(visits);
    const link = [...container.querySelectorAll('[data-visit]')].find(link => link.dataset.visit === id);
    if (link) window.location.assign(link.href);
  });
  window.addEventListener('storage', event => {
    if (storage && (event.key === STORAGE_KEY || event.key === null)) {
      try { visits = readVisits(storage); render(); } catch { unavailable(); }
    }
  });
}
if (typeof document !== 'undefined') initExploration(document, window);
