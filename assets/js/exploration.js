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
  // Visits are remembered only to choose where "somewhere new" goes; nothing on
  // the page shows them. Without storage the choice is any other section.
  const current = container.dataset.section;
  const here = SECTIONS.includes(current) ? [current] : [];
  let storage = null, visits = here;
  try {
    storage = window.localStorage;
    visits = saveVisits(storage, [...readVisits(storage), ...here]);
  } catch { storage = null; }
  container.querySelector('.map-actions').hidden = false;
  document.getElementById('exploration-new').addEventListener('click', () => {
    if (!suggestion(visits)) {
      // Every section has been visited: a new round starts from this page.
      visits = here;
      try { if (storage) saveVisits(storage, visits); } catch { storage = null; }
    }
    const id = suggestion(visits);
    const link = [...container.querySelectorAll('[data-visit]')].find(link => link.dataset.visit === id);
    if (link) window.location.assign(link.href);
  });
  window.addEventListener('storage', event => {
    if (storage && (event.key === STORAGE_KEY || event.key === null)) {
      try { visits = normalizeVisits([...readVisits(storage), ...here]); } catch { storage = null; }
    }
  });
}
if (typeof document !== 'undefined') initExploration(document, window);
