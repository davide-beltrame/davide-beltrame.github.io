// Content Management System
class ContentManager {
  constructor() {
    this.content = null;
    this.currentLang = localStorage.getItem("preferredLanguage") || "en";
  }

  async loadContent() {
    try {
      const response = await fetch('./content.json');
      this.content = await response.json();
      this.populateContent();
    } catch (error) {
      console.error('Failed to load content:', error);
      // Fallback to existing static content
    }
  }

  getText(textObj) {
    if (typeof textObj === 'string') return textObj;
    return textObj[this.currentLang] || textObj['en'] || '';
  }

  populateContent() {
    if (!this.content) return;

    // Update personal information
    this.updatePersonalInfo();
    
    // Update sections
    this.updateAboutSection();
    this.updateEducationSection();
    this.updateExperienceSection();
    this.updateSkillsSection();
    this.updatePublicationsSection();
    
    // Update meta information
    this.updateMeta();
  }

  updatePersonalInfo() {
    const personal = this.content.personal;
    
    // Update name
    const nameElements = document.querySelectorAll('h1');
    nameElements.forEach(el => {
      if (el.textContent.includes('Davide Beltrame')) {
        el.textContent = personal.name;
      }
    });

    // Update title/role
    const roleElements = document.querySelectorAll('[data-content="role"]');
    roleElements.forEach(el => {
      el.textContent = this.getText(personal.title);
    });

    // Update status message
    const statusElements = document.querySelectorAll('[data-content="status"]');
    statusElements.forEach(el => {
      el.textContent = this.getText(personal.status);
    });

    // Update social links
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
      link.href = `mailto:${personal.email}`;
    });

    const githubLinks = document.querySelectorAll('a[href*="github.com"]');
    githubLinks.forEach(link => {
      link.href = personal.social.github;
    });

    const linkedinLinks = document.querySelectorAll('a[href*="linkedin.com"]');
    linkedinLinks.forEach(link => {
      link.href = personal.social.linkedin;
    });

    // Update CV links
    const cvLinks = document.querySelectorAll('a[href*="CV"], a[href*="cv"]');
    cvLinks.forEach(link => {
      if (link.href.includes('.pdf')) {
        link.href = personal.cv_file;
      }
    });
  }

  updateAboutSection() {
    const aboutContent = document.querySelector('[data-content="about"]');
    if (aboutContent) {
      aboutContent.innerHTML = this.getText(this.content.personal.about);
    }
  }

  updateEducationSection() {
    const educationList = document.querySelector('[data-content="education-list"]');
    if (!educationList) return;

    const education = this.content.education;
    educationList.innerHTML = education.map(edu => {
      const link = edu.link ? `<a href="${edu.link}">` : '';
      const closeLink = edu.link ? '</a>' : '';
      
      return `
        <li data-education-id="${edu.id}">
          <strong>${link}${edu.institution} (${edu.period}):${closeLink}</strong>
          ${this.getText(edu.degree)}
        </li>
      `;
    }).join('');
  }

  updateExperienceSection() {
    const experienceList = document.querySelector('[data-content="experience-list"]');
    if (!experienceList) return;

    const experience = this.content.experience;
    experienceList.innerHTML = experience.map(exp => {
      const link = exp.link ? `<a href="${exp.link}" target="_blank">` : '';
      const closeLink = exp.link ? '</a>' : '';
      
      return `
        <li data-experience-id="${exp.id}">
          <strong>${link}${exp.company} (${exp.period}):${closeLink}</strong>
          ${this.getText(exp.description)}
        </li>
      `;
    }).join('');
  }

  updateSkillsSection() {
    const skills = this.content.skills;
    
    const languagesContent = document.querySelector('[data-content="skills-languages"]');
    if (languagesContent) {
      languagesContent.textContent = this.getText(skills.languages);
    }

    const programmingContent = document.querySelector('[data-content="skills-programming"]');
    if (programmingContent) {
      programmingContent.textContent = this.getText(skills.programming);
    }

    const toolsContent = document.querySelector('[data-content="skills-tools"]');
    if (toolsContent) {
      toolsContent.textContent = this.getText(skills.tools);
    }
  }

  updatePublicationsSection() {
    const publicationsList = document.querySelector('[data-content="publications-list"]');
    if (!publicationsList || !this.content.publications) return;

    const publications = this.content.publications;
    
    const getStatusBadge = (status) => {
      const badges = {
        'published': { 
          en: 'Published', 
          it: 'Pubblicato',
          class: 'status-published'
        },
        'in_preparation': { 
          en: 'In Preparation', 
          it: 'In Preparazione',
          class: 'status-preparation'
        },
        'submitted': { 
          en: 'Submitted', 
          it: 'Sottomesso',
          class: 'status-submitted'
        },
        'accepted': { 
          en: 'Accepted', 
          it: 'Accettato',
          class: 'status-accepted'
        },
        'draft': { 
          en: 'Draft', 
          it: 'Bozza',
          class: 'status-draft'
        }
      };
      
      const badge = badges[status] || badges['draft'];
      return `<span class="publication-status ${badge.class}">${this.getText(badge)}</span>`;
    };
    
    publicationsList.innerHTML = publications.map(pub => {
      const link = pub.link && pub.link !== '#' ? `<a href="${pub.link}" target="_blank" class="publication-link">` : '';
      const closeLink = pub.link && pub.link !== '#' ? '</a>' : '';
      const note = pub.note ? `<p class="publication-note"><em>${this.getText(pub.note)}</em></p>` : '';
      
      return `
        <div class="publication-card" data-publication-id="${pub.id}">
          <div class="publication-header">
            <h3 class="publication-title">
              ${link}${this.getText(pub.title)}${closeLink}
            </h3>
            ${getStatusBadge(pub.status)}
          </div>
          <div class="publication-meta">
            <span class="publication-authors">${pub.authors.join(', ')}</span>
            <span class="publication-venue">${pub.venue} (${pub.year})</span>
          </div>
          <p class="publication-description">${this.getText(pub.description)}</p>
          ${note}
        </div>
      `;
    }).join('');
  }

  updateMeta() {
    // Update last updated date in footer
    const copyrightElement = document.querySelector('[data-lang-key="copyright"]');
    if (copyrightElement && this.content.meta.last_updated) {
      const date = new Date(this.content.meta.last_updated);
      const monthYear = date.toLocaleDateString(this.currentLang === 'it' ? 'it-IT' : 'en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      copyrightElement.innerHTML = `&copy; ${date.getFullYear()} ${this.content.personal.name} | Last update: ${monthYear}`;
    }
  }

  updateLanguage(newLang) {
    this.currentLang = newLang;
    this.populateContent();
  }

  // Method to add new content (for future use)
  addExperience(newExperience) {
    this.content.experience.unshift(newExperience);
    this.updateExperienceSection();
  }

  addEducation(newEducation) {
    this.content.education.unshift(newEducation);
    this.updateEducationSection();
  }

  addProject(newProject) {
    this.content.projects.unshift(newProject);
    // Update projects if on projects page
  }

  addPublication(newPublication) {
    this.content.publications.unshift(newPublication);
    this.updatePublicationsSection();
  }
}

// Global content manager instance
window.contentManager = new ContentManager();
