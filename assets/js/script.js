document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const langToggle = document.getElementById("lang-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const header = document.querySelector("header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  
  // Identify which page we're on (via data-page in <html>)
  const currentPage = document.documentElement.getAttribute("data-page") || "home";

  // Language state
  let currentLang = localStorage.getItem("preferredLanguage") || "en";
  
  // Theme state
  let currentTheme = localStorage.getItem("preferredTheme") || "dark";
  if (currentTheme === "light") {
    document.body.classList.add("light-theme");
  }
  
  // Translations dictionary (expanded with additional text for subpages)
  const translations = {
    en: {
      // Navigation
      "about-link": "About",
      "education-link": "Education",
      "experience-link": "Experience",
      "skills-link": "Skills",
      "cv-link": "CV",
      
      // Headers
      "about-header": "About",
      "education-header": "Education",
      "experience-header": "Experience",
      "skills-header": "Skills",
      
      // Content
      "website-message": "Website currently in development!",
      "role-description": "AI Researcher, Author & Developer",
      "full-experience-link": "View full experience details",
      
      // Skills
      "languages-label": "Languages:",
      "coding-label": "Coding:",
      "tools-label": "Tools:",
      "languages-content": "Italian (native), English (fluent), French (basic-intermediate), Spanish (basic).",
      "coding-content": "Python, C, HTML, CSS, JavaScript, SQL, MATLAB.",
      "tools-content": "Git, GitHub, Google Workspace, Microsoft Office, KNIME, Google Analytics.",
      
      // About content
      "about-content": "I'm a student in the MSc in <a href=\"https://www.unibocconi.it/en/programs/master-science/artificial-intelligence\" target=\"_blank\">Artificial Intelligence</a> at Bocconi University. I write for <a href=\"https://www.consensusrivista.com\" target=\"_blank\">Consensus Rivista</a> as Editor-in-Chief delegate to AI and New Technologies. I recently started an internship as an AI Researcher at <a href=\"https://commerceclarity.com\" target=\"_blank\">Commerce Clarity</a>, a Milan-based startup focused on machine learning solutions for e-commerce.",
      
      // Education items
      "bocconi-education": "<strong><a href=\"education/msc.html\">Bocconi University (2024-2026):</a></strong> MSc in Artificial Intelligence (LM-18: Computer Science)",
      "luiss-education": "<strong><a href=\"education/bsc.html\">LUISS Guido Carli (2021-2024):</a></strong> BSc in Management and Computer Science, graduated with honours.",
      "kozminski-education": "<strong>Kozminski University (2023):</strong> NLP for Business Intensive Program (EU-funded).",
      "highschool-education": "<strong><a href=\"education/highschool.html\">Liceo Scientifico Augusto Righi (2016-2021):</a></strong> Scientific diploma with honours.",
      
      // Experience items
      "consensus-experience": "<strong><a href=\"https://www.consensusrivista.com\">Consensus Rivista (2024–present):</a></strong> Author and Caporedattore specializing in science and technology.",
      "commerce-clarity-experience": "<strong><a href=\"https://commerceclarity.com\" target=\"_blank\">Commerce Clarity (2025–present):</a></strong> AI Researcher at a Milan-based startup focused on machine learning solutions for e-commerce.",
      "jelu-experience": "<strong>JELU Consulting (2023–2024):</strong> Audit Associate at a student-run consulting firm.",
      "starting-finance-experience": "<strong>Starting Finance Club Guido Carli (2022–2024):</strong> Held leadership roles including President, Vice President, and Head of HR & IT.",
      "luiss-tutor-experience": "<strong>LUISS Training Course for Italian Informatics Olympics (2022–2023):</strong> Tutor and problem designer in Python and C++.",
      
      // Footer
      "copyright": "© 2025 Davide Beltrame",
      
      // Subpage titles
      "experience-page-title": "Experience - Professional Journey",
      "bsc-page-title": "BSc - LUISS Guido Carli",
      "msc-page-title": "MSc - Bocconi University",
      "highschool-page-title": "High School - Liceo Scientifico Augusto Righi",
      
      // Subpage content
      "professional-experience": "Professional Experience",
      "back-to-home": "Back to Home",
      
      "bsc-content": "BSc in Management and Computer Science, achieved with honours and a final GPA of 29.8/30. Emphasis on Data Science, Business Analytics, and Machine Learning.",
      "msc-content": "Pursuing an MSc in Artificial Intelligence (LM-18 Computer Science). The program covers subjects such as Software Engineering, Algorithms for Optimisation and Inference, Deep Learning, Computer Vision, Complex Systems, Cryptography, and Advanced Mathematics.",
      "highschool-content": "High school diploma in scientific studies, graduated with honours. Recognized for achieving the highest final GPA in 2019.",

      "projects-link": "Projects",
      "projects-header": "Projects",
      "projects-page-title": "Projects - GitHub Portfolio",
      "projects-intro": "Here are some of my GitHub projects. These represent my interests in AI, data science, and web development. Click on any project to visit its GitHub repository.",
      "more-projects": "More projects are coming soon! Check my <a href=\"https://github.com/davide-beltrame\" target=\"_blank\">GitHub profile</a> for the latest updates.",
      "home-link": "Home"
    },
    it: {
      // Navigation
      "about-link": "Chi Sono",
      "education-link": "Istruzione",
      "experience-link": "Esperienza",
      "skills-link": "Competenze",
      "cv-link": "CV",
      
      // Headers
      "about-header": "Chi Sono",
      "education-header": "Istruzione",
      "experience-header": "Esperienza",
      "skills-header": "Competenze",
      
      // Content
      "website-message": "Sito attualmente in sviluppo!",
      "role-description": "Ricercatore AI, Autore e Sviluppatore",
      "full-experience-link": "Vedi dettagli completi sull'esperienza",
      
      // Skills
      "languages-label": "Lingue:",
      "coding-label": "Programmazione:",
      "tools-label": "Strumenti:",
      "languages-content": "Italiano (madrelingua), Inglese (fluente), Francese (base-intermedio), Spagnolo (base).",
      "coding-content": "Python, C, HTML, CSS, JavaScript, SQL, MATLAB.",
      "tools-content": "Git, GitHub, Google Workspace, Microsoft Office, KNIME, Google Analytics.",
      
      // About content
      "about-content": "Sono uno studente del Master in <a href=\"https://www.unibocconi.it/en/programs/master-science/artificial-intelligence\" target=\"_blank\">Intelligenza Artificiale</a> presso l'Università Bocconi. Scrivo per <a href=\"https://www.consensusrivista.com\" target=\"_blank\">Consensus Rivista</a> come Caporedattore delegato all'AI e alle Nuove Tecnologie. Recentemente ho iniziato uno stage come Ricercatore AI presso <a href=\"https://commerceclarity.com\" target=\"_blank\">Commerce Clarity</a>, una startup milanese specializzata in soluzioni di machine learning per e-commerce.",
      
      // Education items
      "bocconi-education": "<strong><a href=\"education/msc.html\">Università Bocconi (2024-2026):</a></strong> MSc in Intelligenza Artificiale (LM-18: Informatica)",
      "luiss-education": "<strong><a href=\"education/bsc.html\">LUISS Guido Carli (2021-2024):</a></strong> Laurea in Management and Computer Science, conseguita con lode.",
      "kozminski-education": "<strong>Kozminski University (2023):</strong> Programma Intensivo di NLP for Business (finanziato dall'UE).",
      "highschool-education": "<strong><a href=\"education/highschool.html\">Liceo Scientifico Augusto Righi (2016-2021):</a></strong> Diploma scientifico con lode.",
      
      // Experience items
      "consensus-experience": "<strong><a href=\"https://www.consensusrivista.com\">Consensus Rivista (2024–presente):</a></strong> Autore e Caporedattore specializzato in scienza e tecnologia.",
      "commerce-clarity-experience": "<strong><a href=\"https://commerceclarity.com\" target=\"_blank\">Commerce Clarity (2025–presente):</a></strong> Ricercatore di AI presso una startup milanese specializzata in soluzioni di machine learning per e-commerce.",
      "jelu-experience": "<strong>JELU Consulting (2023–2024):</strong> Audit Associate presso una società di consulenza gestita da studenti.",
      "starting-finance-experience": "<strong>Starting Finance Club Guido Carli (2022–2024):</strong> Ruoli di leadership tra cui Presidente, Vice Presidente e Responsabile HR e IT.",
      "luiss-tutor-experience": "<strong>Corso di Formazione LUISS per le Olimpiadi Italiane di Informatica (2022–2023):</strong> Tutor e designer di problemi in Python e C++.",
      
      // Footer
      "copyright": "© 2025 Davide Beltrame",
      
      // Subpage titles
      "experience-page-title": "Esperienza - Percorso Professionale",
      "bsc-page-title": "Laurea Triennale - LUISS Guido Carli",
      "msc-page-title": "Master - Università Bocconi",
      "highschool-page-title": "Liceo Scientifico Augusto Righi",
      
      // Subpage content
      "professional-experience": "Esperienza Professionale",
      "back-to-home": "Torna alla Home",
      
      "bsc-content": "Laurea in Management and Computer Science, conseguita con lode e media finale di 29.8/30. Focus su Data Science, Business Analytics e Machine Learning.",
      "msc-content": "Master in Intelligenza Artificiale (LM-18 Informatica). Il programma copre materie come Ingegneria del Software, Algoritmi per l'Ottimizzazione e l'Inferenza, Deep Learning, Computer Vision, Sistemi Complessi, Crittografia e Matematica Avanzata.",
      "highschool-content": "Diploma scientifico, conseguito con lode. Riconosciuto per aver raggiunto la media finale più alta nel 2019.",

      "projects-link": "Progetti",
      "projects-header": "Progetti",
      "projects-page-title": "Progetti - Portfolio GitHub",
      "projects-intro": "Ecco alcuni dei miei progetti su GitHub. Rappresentano i miei interessi nell'AI, data science e sviluppo web. Clicca su qualsiasi progetto per visitare il suo repository GitHub.",
      "more-projects": "Altri progetti in arrivo presto! Controlla il mio <a href=\"https://github.com/davide-beltrame\" target=\"_blank\">profilo GitHub</a> per gli ultimi aggiornamenti.",
      "home-link": "Home"
    }
  };
  
  // Apply the translations based on data-lang-key attributes
  function applyTranslations(lang) {
    const elements = document.querySelectorAll("[data-lang-key]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-lang-key");
      if (translations[lang][key]) {
        // For elements that might contain links or HTML, set innerHTML
        element.innerHTML = translations[lang][key];
      }
    });
  }

  // Adjust the page title if we are on a subpage
  function applyPageTitle(lang) {
    const titleKey = `${currentPage}-page-title`; // e.g. "experience-page-title"
    if (translations[lang][titleKey]) {
      document.title = translations[lang][titleKey];
    }
  }

  // Update the language button text
  function updateLanguageButton() {
    const inactive = currentLang === "en" ? "IT" : "EN";
    const active = currentLang === "en" ? "EN" : "IT";
    langToggle.innerHTML = `<span class="active-lang">${active}</span> / <span class="inactive-lang">${inactive}</span>`;
  }
  
  // Switch language function
  function switchLanguage() {
    currentLang = currentLang === "en" ? "it" : "en";
    localStorage.setItem("preferredLanguage", currentLang);
    
    applyTranslations(currentLang);
    applyPageTitle(currentLang);
    updateLanguageButton();
  }
  
  // Switch theme function
  function switchTheme() {
    if (currentTheme === "dark") {
      document.body.classList.add("light-theme");
      currentTheme = "light";
    } else {
      document.body.classList.remove("light-theme");
      currentTheme = "dark";
    }
    localStorage.setItem("preferredTheme", currentTheme);
  }
  
  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenu.classList.toggle("active");
    // If the header is sticky, adjust body padding
    if (header.classList.contains("sticky")) {
      const headerHeight = header.offsetHeight;
      if (mobileMenu.classList.contains("active")) {
        // Menu opened
        const menuHeight = mobileMenu.scrollHeight;
        document.body.style.paddingTop = `${headerHeight + menuHeight}px`;
      } else {
        // Menu closed
        document.body.style.paddingTop = `${headerHeight}px`;
      }
    }
  }

  // Sticky header
  function setupStickyHeader() {
    const headerHeight = header.offsetHeight;
    let isSticky = false;
    
    window.addEventListener("scroll", () => {
      if (window.scrollY > 150 && !isSticky) {
        header.classList.add("sticky");
        setTimeout(() => {
          document.body.style.paddingTop = `${headerHeight}px`;
        }, 10);
        isSticky = true;
      } else if (window.scrollY <= 150 && isSticky) {
        document.body.style.paddingTop = "0";
        setTimeout(() => {
          header.classList.remove("sticky");
        }, 10);
        isSticky = false;
      }
    });
  }

  // Close mobile menu when clicking any link in it
  function setupMobileMenuLinks() {
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
      });
    });
  }
  
  // Initialization
  function init() {
    applyTranslations(currentLang);
    applyPageTitle(currentLang);
    updateLanguageButton();
    setupStickyHeader();
    setupMobileMenuLinks();
    
    // Event listeners
    langToggle.addEventListener("click", switchLanguage);
    themeToggle.addEventListener("click", switchTheme);
    menuToggle.addEventListener("click", toggleMobileMenu);
  }
  
  init();
});
