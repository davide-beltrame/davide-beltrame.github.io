// Progressive enhancement only. Every page ships complete in its HTML: nothing
// here makes text appear. Content rendering happens at build time, the language
// switch is a link, and the two disclosures are native <details> elements.
//
// The theme is applied before first paint by the inline script in the document
// head; this file only handles the toggle and follows the system preference
// while no explicit choice has been made.

// ===== THEME =====
const THEME_KEY = 'theme';

function initTheme() {
    const root = document.documentElement;

    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try {
                localStorage.setItem(THEME_KEY, next);
            } catch (e) {
                /* private browsing: the toggle still works for this page view */
            }
        });
    });

    // Follow the system preference until the visitor picks a theme themselves.
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            let stored = null;
            try {
                stored = localStorage.getItem(THEME_KEY);
            } catch (err) {
                /* ignore */
            }
            if (stored !== 'light' && stored !== 'dark') {
                root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }
}

// ===== MOBILE MENU =====
function initHamburger() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    function setState(open) {
        btn.classList.toggle('open', open);
        menu.classList.toggle('open', open);
        // The page behind the menu must not scroll under it.
        document.body.classList.toggle('menu-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        const label = open ? btn.dataset.labelClose : btn.dataset.labelOpen;
        if (label) btn.setAttribute('aria-label', label);
    }

    btn.addEventListener('click', () => setState(!btn.classList.contains('open')));

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setState(false));
    });

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) setState(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && btn.classList.contains('open')) {
            setState(false);
            btn.focus();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHamburger();
});
