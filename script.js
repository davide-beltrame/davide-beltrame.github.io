// ===== THEME MANAGEMENT =====
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const body = document.body;

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Language toggle functionality
langToggle.addEventListener('click', () => {
    const newLang = currentLanguage === 'en' ? 'it' : 'en';
    switchLanguage(newLang);
    
    // Update button text
    langToggle.querySelector('.lang-text').textContent = newLang.toUpperCase();
});

// ===== NAVIGATION MANAGEMENT =====
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetSection = item.getAttribute('data-section');
        
        // Update navigation
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Update sections
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
        
        // Load projects if projects section is selected
        if (targetSection === 'projects') {
            loadProjects();
        }
    });
});

// ===== CONTENT MANAGEMENT =====
let contentData = null;
let currentLanguage = 'en'; // Default language

// Load content from JSON
async function loadContent() {
    try {
        const response = await fetch('./content.json');
        contentData = await response.json();
        currentLanguage = contentData.meta.default_language || 'en';
        
        // Initialize content on page load
        updatePageContent();
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Get translated text or fallback to English
function getText(path, lang = currentLanguage) {
    if (!contentData) return '';
    
    const keys = path.split('.');
    let current = contentData;
    
    for (const key of keys) {
        if (current && current[key]) {
            current = current[key];
        } else {
            return '';
        }
    }
    
    // If it's a translation object, get the language or fallback to English
    if (current && typeof current === 'object' && current[lang]) {
        return current[lang];
    } else if (current && typeof current === 'object' && current['en']) {
        return current['en'];
    }
    
    return current || '';
}

// Update all page content with current language
function updatePageContent() {
    if (!contentData) return;
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const section = item.getAttribute('data-section');
        if (section && contentData.navigation[section]) {
            item.textContent = getText(`navigation.${section}`);
        }
    });
    
    // Update home section content
    updateHomeSection();
    updateOtherSection();
}

// Update home section with dynamic content
function updateHomeSection() {
    if (!contentData) return;
    
    // Update title and subtitle
    const titleElement = document.querySelector('.title');
    const subtitleElement = document.querySelector('.subtitle');
    const aboutElement = document.querySelector('.about p');
    
    if (titleElement) titleElement.textContent = getText('personal.title');
    if (subtitleElement) subtitleElement.textContent = getText('personal.subtitle');
    if (aboutElement) aboutElement.textContent = getText('personal.about');
    
    // Update contact links
    const emailLink = document.querySelector('a[href^="mailto:"], a[href="#"]');
    const githubLink = document.querySelector('a[href*="github.com"], .contact-links a:nth-child(2)');
    const linkedinLink = document.querySelector('a[href*="linkedin.com"], .contact-links a:nth-child(3)');
    const cvLink = document.querySelector('a[href$="cv.pdf"], .contact-links a:nth-child(4)');
    
    if (emailLink) emailLink.href = `mailto:${contentData.personal.contact.email}`;
    if (githubLink) githubLink.href = contentData.personal.contact.github;
    if (linkedinLink) linkedinLink.href = contentData.personal.contact.linkedin;
    if (cvLink) cvLink.href = contentData.personal.contact.cv;
    
    // Update section headers
    const contactHeader = document.querySelector('.contact h3');
    const experienceHeader = document.querySelector('.experience h3');
    const educationHeader = document.querySelector('.education h3');
    
    if (contactHeader) contactHeader.textContent = getText('sections.get_in_touch');
    if (experienceHeader) experienceHeader.textContent = getText('sections.experience');
    if (educationHeader) educationHeader.textContent = getText('sections.education');
    
    // Update experience items
    const experienceContainer = document.getElementById('experienceContainer');
    if (experienceContainer && contentData.experience) {
        experienceContainer.innerHTML = contentData.experience.map(exp => `
            <div class="exp-item">
                <span class="exp-title">${getText(`experience.${contentData.experience.indexOf(exp)}.title`)}</span>
                <span class="exp-company">${exp.company}</span>
                <span class="exp-period">${exp.period}</span>
            </div>
        `).join('');
    }
    
    // Update education items
    const educationContainer = document.getElementById('educationContainer');
    if (educationContainer && contentData.education) {
        educationContainer.innerHTML = contentData.education.map(edu => `
            <div class="edu-item">
                <span class="edu-degree">${getText(`education.${contentData.education.indexOf(edu)}.degree`)}</span>
                <span class="edu-school">${edu.school}</span>
                <span class="edu-period">${edu.period}</span>
            </div>
        `).join('');
    }
}

// Update other section with dynamic content
function updateOtherSection() {
    if (!contentData) return;
    
    const skillsHeader = document.querySelector('.skills h3');
    const publicationsHeader = document.querySelector('.publications h3');
    
    if (skillsHeader) skillsHeader.textContent = getText('sections.skills');
    if (publicationsHeader) publicationsHeader.textContent = getText('sections.publications');
    
    // Update skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    const skills = ['programming', 'languages', 'tools'];
    
    skillCategories.forEach((category, index) => {
        if (skills[index] && contentData.skills[skills[index]]) {
            const label = category.querySelector('.skill-label');
            const list = category.querySelector('.skill-list');
            
            if (label) label.textContent = getText(`labels.${skills[index]}`);
            if (list) list.textContent = getText(`skills.${skills[index]}`);
        }
    });
    
    // Update publications
    const publicationsContainer = document.getElementById('publicationsContainer');
    if (publicationsContainer && contentData.publications) {
        publicationsContainer.innerHTML = contentData.publications.map(pub => {
            const title = getText(`publications.${contentData.publications.indexOf(pub)}.title`);
            const status = getText(`publications.${contentData.publications.indexOf(pub)}.status`);
            
            return `
                <div class="pub-item">
                    <span class="pub-title">${title}</span>
                    <span class="pub-venue">${pub.venue}</span>
                    <span class="pub-year">${pub.year}</span>
                    <span class="pub-status">${status}</span>
                </div>
            `;
        }).join('');
    }
}

// Language switcher (for future implementation)
function switchLanguage(lang) {
    if (contentData && contentData.meta.supported_languages.includes(lang)) {
        currentLanguage = lang;
        updatePageContent();
        
        // Update projects if they're loaded
        if (projectsLoaded) {
            projectsLoaded = false;
            loadProjects();
        }
        
        localStorage.setItem('preferred_language', lang);
    }
}
let projectsLoaded = false;

// Configuration: Choose data source
const USE_GITHUB_API = false; // Set to false to use projects.json instead

// Repositories to exclude from GitHub API fetch
const EXCLUDED_REPOS = [
    'dsl-web-app',
    'cybercrime-aho',
    'davide-beltrame' // Keep excluding profile repo
];

async function loadProjectsFromGitHub() {
    const response = await fetch('https://api.github.com/users/davide-beltrame/repos?sort=updated');
    const repos = await response.json();
    
    // Filter repositories
    const interestingRepos = repos.filter(repo => 
        !repo.fork && 
        repo.description && 
        !EXCLUDED_REPOS.includes(repo.name)
    );
    
    // Generate HTML for GitHub projects
    return interestingRepos.map(repo => {
        const languages = repo.language ? [repo.language] : [];
        
        return `
            <div class="project-item">
                <h3 class="project-title">
                    <a href="${repo.html_url}" target="_blank">${repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</a>
                </h3>
                <p class="project-description">${repo.description}</p>
                ${languages.length > 0 ? `
                    <div class="project-tech">
                        ${languages.map(lang => `<span class="tech-tag">${lang}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function loadProjectsFromJSON() {
    if (!contentData) {
        await loadContent();
    }
    
    // Filter featured projects
    const featuredProjects = contentData.projects.filter(project => project.featured);
    
    // Generate HTML for JSON projects
    return featuredProjects.map(project => {
        const description = project.description && typeof project.description === 'object' 
            ? (project.description[currentLanguage] || project.description['en'])
            : project.description;
            
        return `
            <div class="project-item">
                <h3 class="project-title">
                    <a href="${project.url}" target="_blank">${project.title}</a>
                    ${project.collaborative ? '<span class="collab-badge">Collaborative</span>' : ''}
                </h3>
                <p class="project-description">${description}</p>
                <div class="project-tech">
                    ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}

async function loadProjects() {
    if (projectsLoaded) return;
    
    const container = document.getElementById('projectsContainer');
    
    try {
        let projectsHTML;
        
        if (USE_GITHUB_API) {
            projectsHTML = await loadProjectsFromGitHub();
            if (!projectsHTML.trim()) {
                container.innerHTML = '<p class="loading">No public repositories found. Check back soon!</p>';
                return;
            }
        } else {
            projectsHTML = await loadProjectsFromJSON();
        }
        
        container.innerHTML = projectsHTML;
        projectsLoaded = true;
        
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `
            <p class="loading">Unable to load projects at the moment. Please try again later.</p>
        `;
    }
}

// ===== ACCESSIBILITY =====
// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-focus');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-focus');
});

// ===== SMOOTH SCROLLING =====
// Smooth scroll to top when changing sections
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

navItems.forEach(item => {
    item.addEventListener('click', scrollToTop);
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    // Load content first
    await loadContent();
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && contentData && contentData.meta.supported_languages.includes(savedLanguage)) {
        currentLanguage = savedLanguage;
        updatePageContent();
    }
    
    // Update language button text
    if (langToggle) {
        langToggle.querySelector('.lang-text').textContent = currentLanguage.toUpperCase();
    }
    
    // Set initial theme icon state
    const currentTheme = body.getAttribute('data-theme');
    console.log(`Website loaded with ${currentTheme} theme`);
    
    // Preload projects if user is on mobile (to improve UX)
    if (window.innerWidth <= 768) {
        setTimeout(loadProjects, 1000);
    }
});
