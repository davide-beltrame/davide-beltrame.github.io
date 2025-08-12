// ===== THEME MANAGEMENT =====
const themeToggle = document.getElementById('themeToggle');
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
    const response = await fetch('./projects.json');
    const data = await response.json();
    
    // Filter featured projects
    const featuredProjects = data.projects.filter(project => project.featured);
    
    // Generate HTML for JSON projects
    return featuredProjects.map(project => `
        <div class="project-item">
            <h3 class="project-title">
                <a href="${project.url}" target="_blank">${project.title}</a>
                ${project.collaborative ? '<span class="collab-badge">Collaborative</span>' : ''}
            </h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
        </div>
    `).join('');
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
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme icon state
    const currentTheme = body.getAttribute('data-theme');
    console.log(`Website loaded with ${currentTheme} theme`);
    
    // Preload projects if user is on mobile (to improve UX)
    if (window.innerWidth <= 768) {
        setTimeout(loadProjects, 1000);
    }
});
