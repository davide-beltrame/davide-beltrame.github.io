// ===== THEME MANAGEMENT =====
const body = document.body;

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);

// Theme toggle — works for both desktop and mobile toggles
function initThemeToggles() {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const current = body.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            body.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    });
}

// ===== LANGUAGE MANAGEMENT =====
let contentData = null;
let currentLanguage = 'en';

function initLanguageToggles() {
    document.querySelectorAll('.lang-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const newLang = currentLanguage === 'en' ? 'it' : 'en';
            switchLanguage(newLang);
            // Update all lang buttons
            document.querySelectorAll('.lang-text').forEach(el => {
                el.textContent = newLang.toUpperCase();
            });
        });
    });
}

function switchLanguage(lang) {
    if (contentData && contentData.meta.supported_languages.includes(lang)) {
        currentLanguage = lang;
        updatePageContent();
        if (projectsLoaded) {
            projectsLoaded = false;
            loadProjects();
        }
        localStorage.setItem('preferred_language', lang);
    }
}

// ===== HAMBURGER MENU =====
function initHamburger() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('open');
        menu.classList.toggle('open');
    });

    // Close menu when clicking a nav link
    menu.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('open');
            menu.classList.remove('open');
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            btn.classList.remove('open');
            menu.classList.remove('open');
        }
    });
}

// ===== NAVIGATION =====
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href) {
            const section = href.replace('/', '');
            if (currentPath.includes(section)) {
                item.classList.add('active');
            }
        }
    });
}

// ===== CONTENT LOADING =====
function getText(path, lang = currentLanguage) {
    if (!contentData) return '';
    const keys = path.split('.');
    let current = contentData;
    for (const key of keys) {
        if (current && current[key] !== undefined) {
            current = current[key];
        } else {
            return '';
        }
    }
    if (current && typeof current === 'object' && current[lang]) {
        return current[lang];
    } else if (current && typeof current === 'object' && current['en']) {
        return current['en'];
    }
    return current || '';
}

async function loadContent() {
    try {
        const path = window.location.pathname;
        const contentPath = (path.includes('/home') || path.includes('/projects') || path.includes('/story') || path.includes('/other'))
            ? '/content.json'
            : './content.json';
        const response = await fetch(contentPath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        contentData = await response.json();
        currentLanguage = contentData.meta.default_language || 'en';
        updatePageContent();
        setActiveNavigation();
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// ===== UPDATE PAGE CONTENT =====
function updatePageContent() {
    if (!contentData) return;

    // Update meta description
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
        meta.setAttribute('content', `${contentData.personal.name} — ${getText('personal.title')}`);
    }

    // Update navigation text
    document.querySelectorAll('.nav-item').forEach(item => {
        const section = item.getAttribute('data-section');
        if (section && contentData.navigation && contentData.navigation[section]) {
            item.textContent = getText(`navigation.${section}`);
        }
    });

    // Update page-specific content
    updateHomeSection();
    renderPublications();
    updateOtherSection();
    updateStorySection();
}

// ===== HOME SECTION =====
function updateHomeSection() {
    if (!contentData) return;

    const heroName = document.getElementById('heroName');
    const heroTitle = document.getElementById('heroTitle');
    const heroBio = document.getElementById('heroBio');

    if (heroName) {
        const greeting = currentLanguage === 'it' ? 'Ciao, sono Davide!' : 'Hi, I\'m Davide!';
        heroName.textContent = greeting;
    }
    if (heroTitle) heroTitle.textContent = getText('personal.title');
    if (heroBio) heroBio.innerHTML = getText('personal.about');

    // Update contact links
    const contact = contentData.personal && contentData.personal.contact;
    if (!contact) return;

    const emailLink = document.getElementById('contactEmail');
    const githubLink = document.getElementById('contactGithub');
    const linkedinLink = document.getElementById('contactLinkedin');
    const cvLink = document.getElementById('contactCV');

    if (emailLink) emailLink.href = `mailto:${contact.email}`;
    if (githubLink) githubLink.href = contact.github;
    if (linkedinLink) linkedinLink.href = contact.linkedin;
    if (cvLink) cvLink.href = contact.cv;

    // Update contact header
    const contactHeader = document.querySelector('.contact-header');
    if (contactHeader) contactHeader.textContent = getText('sections.get_in_touch');
}

// ===== OTHER SECTION (Publications + Duolingo) =====
// ===== PUBLICATIONS RENDERING (on projects page) =====
function renderPublications() {
    if (!contentData) return;

    const researchTitle = document.getElementById('researchTitle');
    if (researchTitle) researchTitle.textContent = getText('sections.publications') || 'Research';

    const pubContainer = document.getElementById('publicationsContainer');
    if (pubContainer && contentData.publications) {
        // Sort publications by date (most recent first), fallback to year
        const sortedPubs = [...contentData.publications].sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(a.year || '1970');
            const dateB = b.date ? new Date(b.date) : new Date(b.year || '1970');
            return dateB - dateA;
        });
        pubContainer.innerHTML = sortedPubs.map((pub, i) => {
            const title = pub.title && typeof pub.title === 'object'
                ? (pub.title[currentLanguage] || pub.title['en'])
                : pub.title;
            const status = pub.status && typeof pub.status === 'object'
                ? (pub.status[currentLanguage] || pub.status['en'])
                : pub.status;
            const abstract = pub.abstract && typeof pub.abstract === 'object'
                ? (pub.abstract[currentLanguage] || pub.abstract['en'])
                : pub.abstract;
            const hasLink = pub.link && pub.link.trim();
            const hasAbstract = abstract && abstract.trim() && abstract.trim() !== 'TODO';
            const authors = pub.authors || '';

            return `
                <div class="pub-card">
                    <div class="pub-header">
                        <span class="pub-title">
                            ${hasLink
                    ? `<a href="${pub.link}" target="_blank" rel="noopener noreferrer">${title} <i class="fas fa-external-link-alt" style="font-size:11px;opacity:0.5"></i></a>`
                    : title}
                        </span>
                        <span class="pub-year-badge">${pub.year || ''}</span>
                    </div>
                    ${authors ? `<div class="pub-authors">${authors}</div>` : ''}
                    <div class="pub-meta">
                        ${pub.venue ? `<span class="pub-venue">${pub.venue}</span>` : ''}
                        ${status ? `<span class="pub-status">${status}</span>` : ''}
                    </div>
                    ${hasAbstract ? `
                        <button class="pub-abstract-toggle" data-target="abstract-${i}">
                            Show abstract <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="pub-abstract" id="abstract-${i}">
                            <p>${abstract}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        initAbstractToggles();
    }
}

// ===== OTHER SECTION (Duolingo only) =====
function updateOtherSection() {
    if (!contentData) return;

    // Duolingo
    const duoTitle = document.getElementById('duolingoTitle');
    if (duoTitle) duoTitle.textContent = getText('sections.duolingo') || 'Language Learning';

    const duoContainer = document.getElementById('duolingoContainer');
    if (duoContainer && contentData.duolingo) {
        const duo = contentData.duolingo;

        // Calculate current streak
        const startDate = new Date(duo.streak_start_date);
        const today = new Date();
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const currentStreak = duo.current_streak + daysDiff;
        const longestStreak = Math.max(duo.longest_streak, currentStreak);

        // Top 5 languages by XP
        const topLangs = [...duo.languages].sort((a, b) => b.xp - a.xp).slice(0, 5);
        const remainingLangs = [...duo.languages].sort((a, b) => b.xp - a.xp).slice(5);

        const lastUpdated = new Date(duo.data_last_updated).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        duoContainer.innerHTML = `
            <div class="duolingo-highlight">
                <div class="streak-display">
                    <span class="streak-fire">🔥</span>
                    <div>
                        <span class="streak-number">${currentStreak}</span>
                        <span class="streak-label">${getText('ui.duolingo.current_streak') || 'day streak'}</span>
                    </div>
                </div>
            </div>

            <div class="duolingo-stat-row">
                <div class="duo-stat-chip">
                    <span class="duo-stat-value">${longestStreak}</span>
                    <span class="duo-stat-label">${getText('ui.duolingo.longest_streak') || 'Longest Streak'}</span>
                </div>
                <div class="duo-stat-chip">
                    <span class="duo-stat-value">${duo.total_xp.toLocaleString()}</span>
                    <span class="duo-stat-label">${getText('ui.duolingo.total_xp') || 'Total XP'}</span>
                </div>
                <div class="duo-stat-chip">
                    <span class="duo-stat-value">${duo.languages.length}</span>
                    <span class="duo-stat-label">${getText('ui.duolingo.languages') || 'Languages'}</span>
                </div>
            </div>

            <div class="duolingo-top-languages" id="duoTopLangs">
                ${topLangs.map(lang => `
                    <div class="lang-card">
                        <span class="lang-flag">${lang.flag || '🌐'}</span>
                        <div>
                            <div class="lang-name">${lang.name}</div>
                            <div class="lang-xp">${lang.xp.toLocaleString()} XP</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${remainingLangs.length > 0 ? `
                <div class="collapsible-section">
                    <div class="collapsible-header" id="showAllLangsBtn">
                        <h4>${getText('ui.duolingo.languages') || 'All languages'} (${remainingLangs.length} more)</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="collapsible-content">
                        <div class="duolingo-top-languages">
                            ${remainingLangs.map(lang => `
                                <div class="lang-card">
                                    <span class="lang-flag">${lang.flag || '🌐'}</span>
                                    <div>
                                        <div class="lang-name">${lang.name}</div>
                                        <div class="lang-xp">${lang.xp.toLocaleString()} XP</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}

            <div class="duolingo-notice">
                <small>${getText('ui.duolingo.data_notice') || '* XP and language data last updated:'} ${lastUpdated}</small>
            </div>
        `;

        initializeCollapsibleSections();
    }
}

// ===== STORY SECTION =====
function updateStorySection() {
    if (!contentData || !contentData.timeline) return;
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    // Group timeline events by year
    const events = [...contentData.timeline].reverse();
    const grouped = {};
    events.forEach(event => {
        // Extract year from date like "DD/MM/YYYY" or "MM/YYYY"
        const parts = event.date ? event.date.split('/') : [];
        let year;
        if (parts.length === 3) year = parts[2];
        else if (parts.length === 2) year = parts[1];
        else if (parts.length === 1) year = parts[0];
        else year = 'Other';

        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(event);
    });

    // Sort years descending (most recent -> least recent)
    const sortedYears = Object.keys(grouped).sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return Number(b) - Number(a);
    });

    let html = '';
    for (const year of sortedYears) {
        html += `<div class="timeline-year-group">`;
        html += `<div class="timeline-year-label"><span>${year}</span></div>`;
        html += `<div class="timeline-year-events">`;
        grouped[year].forEach(event => {
            const title = event.title && typeof event.title === 'object'
                ? (event.title[currentLanguage] || event.title['en'])
                : event.title;
            const description = event.description && typeof event.description === 'object'
                ? (event.description[currentLanguage] || event.description['en'])
                : event.description;

            // Format the date based on language
            const formattedDate = formatTimelineDate(event.date, currentLanguage);

            html += `
                <div class="timeline-event">
                    ${formattedDate ? `<div class="timeline-date">${formattedDate}</div>` : ''}
                    <div class="timeline-title">${title}</div>
                    ${description ? `<div class="timeline-description">${description}</div>` : ''}
                </div>
            `;
        });
        html += `</div></div>`;
    }
    container.innerHTML = html;

    // Scroll-based reveal animation
    initTimelineObserver();
}

// ===== DATE FORMATTING =====
function formatTimelineDate(dateStr, lang) {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 1) return ''; // Only year, hide the date line

    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthsIt = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

    let monthIdx, dayNum;
    if (parts.length === 3) { // DD/MM/YYYY
        dayNum = parseInt(parts[0], 10);
        monthIdx = parseInt(parts[1], 10) - 1;
    } else if (parts.length === 2) { // MM/YYYY
        monthIdx = parseInt(parts[0], 10) - 1;
    }

    if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return dateStr;

    const monthName = lang === 'it' ? monthsIt[monthIdx] : monthsEn[monthIdx];

    if (dayNum) {
        if (lang === 'it') {
            return `${dayNum} ${monthName.toLowerCase()}`;
        } else {
            const j = dayNum % 10, k = dayNum % 100;
            let suffix = "th";
            if (j == 1 && k != 11) suffix = "st";
            if (j == 2 && k != 12) suffix = "nd";
            if (j == 3 && k != 13) suffix = "rd";
            return `${monthName} ${dayNum}${suffix}`;
        }
    } else {
        return monthName;
    }
}

// ===== TIMELINE SCROLL ANIMATION =====
function initTimelineObserver() {
    const events = document.querySelectorAll('.timeline-event');
    if (!events.length) return;

    // Start all events hidden
    events.forEach(el => el.classList.add('timeline-hidden'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('timeline-visible');
                entry.target.classList.remove('timeline-hidden');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    events.forEach(el => observer.observe(el));
}

// ===== ABSTRACT TOGGLES =====
function initAbstractToggles() {
    document.querySelectorAll('.pub-abstract-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (target) {
                target.classList.toggle('expanded');
                btn.classList.toggle('expanded');

                // Prefer a dedicated label element inside the button
                const labelEl = btn.querySelector('span');

                if (btn.classList.contains('expanded')) {
                    if (labelEl) {
                        labelEl.textContent = 'Hide abstract ';
                    } else if (btn.firstChild && btn.firstChild.nodeType === Node.TEXT_NODE) {
                        btn.firstChild.textContent = 'Hide abstract ';
                    }
                } else {
                    if (labelEl) {
                        labelEl.textContent = 'Show abstract ';
                    } else if (btn.firstChild && btn.firstChild.nodeType === Node.TEXT_NODE) {
                        btn.firstChild.textContent = 'Show abstract ';
                    }
                }
            }
        });
    });
}

// ===== COLLAPSIBLE SECTIONS =====
function initializeCollapsibleSections() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
        // Only add listener if not already initialized
        if (header.dataset.initialized) return;
        header.dataset.initialized = 'true';
        header.addEventListener('click', () => {
            header.closest('.collapsible-section').classList.toggle('expanded');
        });
    });
}

// ===== PROJECTS =====
let projectsLoaded = false;

async function loadProjectsFromJSON() {
    if (!contentData) await loadContent();
    if (!contentData || !contentData.projects) return '<p class="loading">No projects data available.</p>';

    const featured = contentData.projects.filter(p => p.featured);
    if (featured.length === 0) return '<p class="loading">No featured projects found.</p>';

    return featured.map(project => {
        const desc = project.description && typeof project.description === 'object'
            ? (project.description[currentLanguage] || project.description['en'])
            : project.description;

        // Map project data to the pub-card structure
        return `
            <div class="pub-card">
                <div class="pub-header">
                    <span class="pub-title">
                        <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title} <i class="fas fa-external-link-alt" style="font-size:11px;opacity:0.5"></i></a>
                    </span>
                    ${project.collaborative ? '<span class="pub-year-badge">Collaborative</span>' : ''}
                </div>
                <div class="pub-authors">${desc}</div>
                <div class="project-tech">
                    ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}

async function loadProjects() {
    if (projectsLoaded) return;
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    try {
        const html = await loadProjectsFromJSON();
        if (html && html.trim()) {
            container.innerHTML = html;
            projectsLoaded = true;
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    initThemeToggles();
    initLanguageToggles();
    initHamburger();

    try {
        await loadContent();
    } catch (error) {
        console.error('Error in loadContent():', error);
    }

    // Restore language preference
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && contentData && contentData.meta.supported_languages.includes(savedLang)) {
        currentLanguage = savedLang;
        updatePageContent();
    }

    // Update language button text
    document.querySelectorAll('.lang-text').forEach(el => {
        el.textContent = currentLanguage.toUpperCase();
    });

    // Auto-load page-specific content
    const currentPath = window.location.pathname;
    if (currentPath.includes('/projects')) {
        if (contentData) { renderPublications(); loadProjects(); }
        else setTimeout(() => { renderPublications(); loadProjects(); }, 200);
    }
    if (currentPath.includes('/other')) {
        if (contentData) updateOtherSection();
        else setTimeout(() => updateOtherSection(), 200);
    }
});
