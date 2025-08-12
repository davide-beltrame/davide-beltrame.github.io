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

async function loadProjects() {
    if (projectsLoaded) return;
    
    const container = document.getElementById('projectsContainer');
    
    try {
        // GitHub API to fetch repositories
        const response = await fetch('https://api.github.com/users/davide-beltrame/repos?sort=updated&per_page=10');
        const repos = await response.json();
        
        // Filter and format interesting repositories
        const interestingRepos = repos.filter(repo => 
            !repo.fork && 
            repo.description && 
            repo.name !== 'davide-beltrame'
        );
        
        if (interestingRepos.length === 0) {
            container.innerHTML = `
                <p class="loading">No public repositories found. Check back soon!</p>
            `;
            return;
        }
        
        // Generate HTML for projects
        const projectsHTML = interestingRepos.map(repo => {
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
        
        container.innerHTML = projectsHTML;
        projectsLoaded = true;
        
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `
            <div class="project-item">
                <h3 class="project-title">Featured Projects</h3>
                <p class="project-description">Here are some of my notable projects:</p>
                
                <div class="project-item">
                    <h3 class="project-title">
                        <a href="https://github.com/davide-beltrame/medimg-saliency-benchmark" target="_blank">Medical Image Saliency Benchmark</a>
                    </h3>
                    <p class="project-description">Benchmarking explanation methods for CNNs in medical vision.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Jupyter Notebook</span>
                    </div>
                </div>
                
                <div class="project-item">
                    <h3 class="project-title">
                        <a href="https://github.com/davide-beltrame/semantic-similarity" target="_blank">Semantic Similarity</a>
                    </h3>
                    <p class="project-description">Exploring semantic similarity retrieval methods maximizing BLEU score.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Python</span>
                    </div>
                </div>
                
                <div class="project-item">
                    <h3 class="project-title">
                        <a href="https://github.com/davide-beltrame/wordle-solver" target="_blank">Wordle Solver</a>
                    </h3>
                    <p class="project-description">Super efficient guesser for generalized Wordle.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Python</span>
                    </div>
                </div>
                
                <div class="project-item">
                    <h3 class="project-title">
                        <a href="https://github.com/davide-beltrame/davide-beltrame.github.io" target="_blank">Personal Website</a>
                    </h3>
                    <p class="project-description">This website! Built from scratch with clean, minimal design.</p>
                    <div class="project-tech">
                        <span class="tech-tag">JavaScript</span>
                        <span class="tech-tag">HTML</span>
                        <span class="tech-tag">CSS</span>
                    </div>
                </div>
            </div>
        `;
        projectsLoaded = true;
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
