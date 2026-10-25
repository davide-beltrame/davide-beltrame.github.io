// Progressive enhancement only. Every page ships complete in its HTML: nothing
// here makes text appear. Content rendering happens at build time, the language
// switch is a link, and the mobile menu is a native <details> element.
//
// The theme is applied before first paint by the inline script in the document
// head; this file reveals the toggle, handles it, and follows the system
// preference while no explicit choice has been made.

const root = document.documentElement;
let chosenTheme = null;
// Storage can be blocked; the toggle then works for this page view only.
try { chosenTheme = localStorage.getItem('theme'); } catch {}
function updateThemeControls() {
  document.querySelectorAll('.theme-toggle').forEach(button => {
    button.hidden = false;
    button.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  });
}
updateThemeControls();
document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
  chosenTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = chosenTheme;
  try { localStorage.setItem('theme', chosenTheme); } catch {}
  updateThemeControls();
}));
// Follow the system preference until the visitor picks a theme themselves.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  if (chosenTheme !== 'light' && chosenTheme !== 'dark') {
    root.dataset.theme = event.matches ? 'dark' : 'light';
    updateThemeControls();
  }
});
// Trip photos remain ordinary image links without dialog support or JavaScript.
const photoDialog = document.querySelector('.photo-dialog');
if (photoDialog && typeof photoDialog.showModal === 'function') {
  const fullPhoto = photoDialog.querySelector('img');
  let photoTrigger = null;
  document.querySelectorAll('.photo-expand').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    photoTrigger = link;
    fullPhoto.src = link.href;
    fullPhoto.alt = link.querySelector('img').alt;
    photoDialog.showModal();
  }));
  photoDialog.addEventListener('click', event => {
    if (event.target === photoDialog) photoDialog.close();
  });
  photoDialog.addEventListener('close', () => photoTrigger?.focus({ preventScroll: true }));
}

// Escape closes the mobile menu and returns focus to its summary.
const menu = document.querySelector('.mobile-navigation');
menu?.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
