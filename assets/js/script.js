// ===== THEME MANAGEMENT =====
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const body = document.body;

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);

// Theme toggle functionality
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Language toggle functionality
if (langToggle) {
    langToggle.addEventListener('click', () => {
        const newLang = currentLanguage === 'en' ? 'it' : 'en';
        switchLanguage(newLang);
        
        // Update button text
        langToggle.querySelector('.lang-text').textContent = newLang.toUpperCase();
    });
}

// ===== NAVIGATION MANAGEMENT =====
// Set active navigation based on current page
function setActiveNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;
    
    navItems.forEach(item => {
        item.classList.remove('active');
        
        // Check if this nav item corresponds to the current page
        const href = item.getAttribute('href');
        if (href) {
            if ((currentPath.includes('/home') && href.includes('home')) ||
                (currentPath.includes('/projects') && href.includes('projects')) ||
                (currentPath.includes('/story') && href.includes('story')) ||
                (currentPath.includes('/other') && href.includes('other'))) {
                item.classList.add('active');
            }
        }
    });
}

// ===== CONTENT MANAGEMENT =====
let contentData = null;
let currentLanguage = 'en'; // Default language

// Load content from JSON
async function loadContent() {
    try {
        // Use absolute path for subdirectories, relative for root
        let contentPath;
        const path = window.location.pathname;
        
        if (path.includes('/home') || path.includes('/projects') || path.includes('/story') || path.includes('/other')) {
            contentPath = '/content.json';  // Absolute path from subdirectories
        } else {
            contentPath = './content.json';  // Relative path from root
        }
        
        const response = await fetch(contentPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        contentData = await response.json();
        currentLanguage = contentData.meta.default_language || 'en';
        
        // Initialize content on page load
        updatePageContent();
        setActiveNavigation();
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
    
    // Update page meta
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', `${contentData.personal.name} - ${getText('personal.title')}`);
    }
    
    // Update navigation - with fallbacks
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        const section = item.getAttribute('data-section');
        
        if (section && contentData && contentData.navigation && contentData.navigation[section]) {
            const text = getText(`navigation.${section}`);
            item.textContent = text;
        }
        // Note: We now have fallback text directly in HTML, so no need for JS fallback
    });
    
    // Update development notice
    const developmentNotice = document.getElementById('developmentNotice');
    if (developmentNotice) {
        const title = getText('ui.development_notice.title') || 'Development Notice:';
        const message = getText('ui.development_notice.message') || 'This website is currently under active development. Some features may not work as expected.';
        developmentNotice.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>${title}</strong> ${message}
        `;
    }
    
    // Update home section content
    updateHomeSection();
    
    // Update other section content
    updateOtherSection();
}

// Update home section with dynamic content
function updateHomeSection() {
    if (!contentData) {
        return; // Fallback content is now in HTML
    }
    
    // Update title and remove subtitle
    const titleElement = document.querySelector('.title');
    const subtitleElement = document.querySelector('.subtitle');
    const aboutElement = document.querySelector('.about p');
    
    if (titleElement) {
        const titleText = getText('personal.title');
        if (titleText) titleElement.textContent = titleText;
    }
    if (subtitleElement) subtitleElement.style.display = 'none'; // Hide subtitle
    if (aboutElement) {
        const aboutText = getText('personal.about');
        if (aboutText) aboutElement.textContent = aboutText;
    }
    
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
    const contactHeader = document.querySelector('.contact-header');
    const experienceHeader = document.querySelector('.experience .header-text');
    const educationHeader = document.querySelector('.education .header-text');
    
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
    
    if (skillsHeader) skillsHeader.textContent = getText('sections.skills') || 'Skills';
    if (publicationsHeader) publicationsHeader.textContent = getText('sections.publications') || 'Publications';
    
    // Update skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    const skills = ['programming', 'languages', 'tools'];
    
    skillCategories.forEach((category, index) => {
        if (skills[index] && contentData.skills[skills[index]]) {
            const label = category.querySelector('.skill-label');
            const list = category.querySelector('.skill-list');
            
            if (label) label.textContent = getText(`labels.${skills[index]}`) || `${skills[index].charAt(0).toUpperCase() + skills[index].slice(1)}:`;
            if (list) list.textContent = getText(`skills.${skills[index]}`);
        }
    });
    
    // Update publications
    const publicationsContainer = document.getElementById('publicationsContainer');
    
    if (publicationsContainer && contentData.publications) {
        const publicationsHTML = contentData.publications.map(pub => {
            const title = pub.title && typeof pub.title === 'object' 
                ? (pub.title[currentLanguage] || pub.title['en'])
                : pub.title;
            const status = pub.status && typeof pub.status === 'object' 
                ? (pub.status[currentLanguage] || pub.status['en'])
                : pub.status;
            
            return `
                <div class="pub-item">
                    <span class="pub-title">${title}</span>
                    <span class="pub-venue">${pub.venue}</span>
                    <span class="pub-year">${pub.year}</span>
                    <span class="pub-status">${status}</span>
                </div>
            `;
        }).join('');
        
        publicationsContainer.innerHTML = publicationsHTML;
    }
    
    // Update Duolingo data
    const duolingoHeader = document.querySelector('.duolingo h3');
    const duolingoContainer = document.getElementById('duolingoContainer');
    
    if (duolingoHeader) duolingoHeader.textContent = getText('sections.duolingo') || 'Language Learning';
    
    if (duolingoContainer && contentData.duolingo) {
        const duolingo = contentData.duolingo;
        
        // Calculate current streak based on days since start date
        const startDate = new Date(duolingo.streak_start_date);
        const today = new Date();
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const currentStreak = duolingo.current_streak + daysDiff;
        const longestStreak = Math.max(duolingo.longest_streak, currentStreak);
        
        // Format the last updated date
        const lastUpdated = new Date(duolingo.data_last_updated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
        
        const duolingoHTML = `
            <div class="duolingo-stats">
                <div class="duolingo-stat">
                    <span class="stat-value">${currentStreak}</span>
                    <span class="stat-label">${getText('ui.duolingo.current_streak') || 'Current Streak'}</span>
                </div>
                <div class="duolingo-stat">
                    <span class="stat-value">${longestStreak}</span>
                    <span class="stat-label">${getText('ui.duolingo.longest_streak') || 'Longest Streak'}</span>
                </div>
                <div class="duolingo-stat">
                    <span class="stat-value">${duolingo.total_xp.toLocaleString()}</span>
                    <span class="stat-label">${getText('ui.duolingo.total_xp') || 'Total XP'}</span>
                </div>
            </div>
            <div class="collapsible-section">
                <div class="collapsible-header">
                    <h4>${getText('ui.duolingo.languages') || 'Languages'}</h4>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="collapsible-content">
                    <div class="duolingo-languages">
                        ${duolingo.languages.map(lang => `
                            <div class="language-item">
                                <div class="language-flag">${lang.flag}</div>
                                <div class="language-info">
                                    <div class="language-name">${lang.name}</div>
                                    <div class="language-level">${lang.xp.toLocaleString()} XP</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="duolingo-notice">
                <small>${getText('ui.duolingo.data_notice') || '* XP and language data last updated:'} ${lastUpdated}</small>
            </div>
        `;
        
        duolingoContainer.innerHTML = duolingoHTML;
        
        // Initialize collapsible functionality
        initializeCollapsibleSections();
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

// ===== COLLAPSIBLE SECTIONS =====
function initializeCollapsibleSections() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.collapsible-section');
            
            // Simply toggle the current section without affecting others
            section.classList.toggle('expanded');
        });
    });
}

// ===== PROJECTS LOADING =====
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
    
    if (!contentData || !contentData.projects) {
        return '<p class="loading">No projects data available.</p>';
    }
    
    // Filter featured projects
    const featuredProjects = contentData.projects.filter(project => project.featured);
    
    if (featuredProjects.length === 0) {
        return '<p class="loading">No featured projects found.</p>';
    }
    
    // Generate HTML for JSON projects
    const projectsHTML = featuredProjects.map(project => {
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
    
    return projectsHTML;
}

async function loadProjects() {
    if (projectsLoaded) {
        return;
    }
    
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
        
        if (projectsHTML && projectsHTML.trim()) {
            container.innerHTML = projectsHTML;
            projectsLoaded = true;
        }
        
    } catch (error) {
        console.error('Error loading projects:', error);
        // Don't replace content on error, keep the fallback HTML
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

// Apply smooth scroll to navigation items
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', scrollToTop);
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load content first
        await loadContent();
    } catch (error) {
        console.error('Error in loadContent():', error);
    }
    
    // Initialize collapsible sections
    initializeCollapsibleSections();
    
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
    
    // Mobile contact link functionality
    initializeMobileContactLinks();
    
    // Auto-load content based on current page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/projects')) {
        // Ensure content is loaded, then load projects
        if (contentData) {
            loadProjects();
        } else {
            // Content will load via await in main initialization, then call loadProjects
            setTimeout(() => loadProjects(), 200);
        }
    }
    
    if (currentPath.includes('/other')) {
        // Update other section content when on other page
        if (contentData) {
            updateOtherSection();
        } else {
            setTimeout(() => updateOtherSection(), 200);
        }
    }
});

// ===== MOBILE CONTACT LINKS FUNCTIONALITY =====
function initializeMobileContactLinks() {
    const contactLinks = document.querySelectorAll('.contact-link');
    
    // Only add touch functionality for devices without hover capability
    if (window.matchMedia('(hover: none)').matches) {
        contactLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Don't prevent default if it's a real link and already expanded
                if (this.classList.contains('active') && this.href && this.href !== '#') {
                    return; // Let the link work normally
                }
                
                e.preventDefault();
                
                // Remove active class from all other links
                contactLinks.forEach(otherLink => {
                    if (otherLink !== this) {
                        otherLink.classList.remove('active');
                    }
                });
                
                // Toggle active class on clicked link
                this.classList.toggle('active');
                
                // If this link becomes active and has a real href, 
                // add a secondary tap handler for navigation
                if (this.classList.contains('active') && this.href && this.href !== '#') {
                    setTimeout(() => {
                        // After a short delay, make it navigable with another tap
                        this.setAttribute('data-ready-to-navigate', 'true');
                    }, 300);
                }
            });
            
            // Handle second tap for navigation
            link.addEventListener('click', function(e) {
                if (this.getAttribute('data-ready-to-navigate') === 'true' && 
                    this.classList.contains('active') && 
                    this.href && this.href !== '#') {
                    // Allow the navigation to proceed
                    this.removeAttribute('data-ready-to-navigate');
                    return;
                }
            });
        });
        
        // Close expanded links when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.contact-link')) {
                contactLinks.forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('data-ready-to-navigate');
                });
            }
        });
    }
}
