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
// Escape closes the mobile menu and returns focus to its summary.
const menu = document.querySelector('.mobile-navigation');
menu?.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
