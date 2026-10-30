/* Developed by Nikil Ashika R, B.E. CSE 2nd Year */

/**
 * StudyHub - Core Application Controller
 * - Global namespace, storage helpers, XSS sanitization
 * - Dark/Light theme manager with persistence
 * - Mobile navigation drawer and active section scroll spy
 * - Typewriter hero animation & rotating motivational quotes
 * - Global stats tracker with count-up animations (Streak, Minutes, Tasks)
 * - Exam countdown system
 * - Toast notification feedback
 * - Auto-updating dynamic footer year
 */

window.StudyHub = window.StudyHub || {};

(function (App) {
  'use strict';

  // =========================================================================
  // 1. SAFE STORAGE & XSS SANITIZATION UTILITIES
  // =========================================================================

  App.escapeHTML = function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  App.storage = {
    get: function (key, defaultValue) {
      try {
        const item = localStorage.getItem('studyhub_' + key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.warn('Storage read error for key:', key, e);
        return defaultValue;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem('studyhub_' + key, JSON.stringify(value));
      } catch (e) {
        console.warn('Storage write error for key:', key, e);
      }
    }
  };

  // Toast Notification System
  App.showToast = function (message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass}" style="font-size: 1.1rem;"></i>
      <span>${App.escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // Animated Counter Helper
  App.animateCounter = function (element, targetValue, duration = 1000, suffix = '') {
    if (!element) return;
    const startValue = parseInt(element.innerText.replace(/[^0-9]/g, '')) || 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (targetValue - startValue) * easedProgress);

      element.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = targetValue + suffix;
      }
    }
    requestAnimationFrame(updateCounter);
  };

  // =========================================================================
  // 2. THEME MANAGER (DARK / LIGHT)
  // =========================================================================
  function initTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;
    const savedTheme = App.storage.get('theme', 'dark');

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      if (themeIcon) {
        if (theme === 'light') {
          themeIcon.className = 'fa-solid fa-moon';
          themeBtn.setAttribute('aria-label', 'Switch to dark theme');
        } else {
          themeIcon.className = 'fa-solid fa-sun';
          themeBtn.setAttribute('aria-label', 'Switch to light theme');
        }
      }
      App.storage.set('theme', theme);
    }

    applyTheme(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        App.showToast(`Switched to ${nextTheme} mode`, 'info');
      });
    }
  }

  // =========================================================================
  // 3. NAVIGATION & MOBILE HAMBURGER
  // =========================================================================
  function initNavigation() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (hamburgerBtn && navLinks) {
      hamburgerBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('mobile-open');
        hamburgerBtn.innerHTML = isOpen
          ? '<i class="fa-solid fa-xmark"></i>'
          : '<i class="fa-solid fa-bars"></i>';
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
      });

      // Close mobile menu on clicking any link
      navItems.forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('mobile-open');
          hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !hamburgerBtn.contains(e.target) && navLinks.classList.contains('mobile-open')) {
          navLinks.classList.remove('mobile-open');
          hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Scroll spy using IntersectionObserver
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navItems.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
  }

  // =========================================================================
  // 4. HERO TYPEWRITER & ROTATING QUOTES
  // =========================================================================
  function initHeroEffects() {
    // Typewriter
    const typewriterEl = document.getElementById('typewriter-text');
    if (typewriterEl) {
      const phrases = ['Focus better.', 'Plan smarter.', 'Score higher.'];
      let phraseIdx = 0;
      let charIdx = 0;
      let isDeleting = false;
      let typingSpeed = 110;

      function type() {
        const currentPhrase = phrases[phraseIdx];
        if (isDeleting) {
          typewriterEl.textContent = currentPhrase.substring(0, charIdx - 1);
          charIdx--;
          typingSpeed = 50;
        } else {
          typewriterEl.textContent = currentPhrase.substring(0, charIdx + 1);
          charIdx++;
          typingSpeed = 110;
        }

        if (!isDeleting && charIdx === currentPhrase.length) {
          isDeleting = true;
          typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          typingSpeed = 500; // Pause before typing new phrase
        }

        setTimeout(type, typingSpeed);
      }
      type();
    }

    // Motivational Quotes
    const quotes = [
      { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
      { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
      { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
      { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
      { text: "Engineering is the closest thing to magic that exists in the world.", author: "Elon Musk" },
      { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
    ];

    const quoteTextEl = document.getElementById('hero-quote-text');
    const quoteAuthorEl = document.getElementById('hero-quote-author');
    const quoteRefreshBtn = document.getElementById('quote-refresh-btn');

    let currentQuoteIdx = Math.floor(Math.random() * quotes.length);

    function displayQuote(index) {
      if (!quoteTextEl || !quoteAuthorEl) return;
      quoteTextEl.style.opacity = '0';
      quoteAuthorEl.style.opacity = '0';

      setTimeout(() => {
        quoteTextEl.textContent = `"${quotes[index].text}"`;
        quoteAuthorEl.textContent = `— ${quotes[index].author}`;
        quoteTextEl.style.transition = 'opacity 0.4s ease';
        quoteAuthorEl.style.transition = 'opacity 0.4s ease';
        quoteTextEl.style.opacity = '1';
        quoteAuthorEl.style.opacity = '1';
      }, 200);
    }

    displayQuote(currentQuoteIdx);

    if (quoteRefreshBtn) {
      quoteRefreshBtn.addEventListener('click', () => {
        currentQuoteIdx = (currentQuoteIdx + 1) % quotes.length;
        displayQuote(currentQuoteIdx);
      });
    }
  }

  // =========================================================================
  // 5. GLOBAL ACADEMIC STATS TRACKER
  // =========================================================================
  function initStatsTracker() {
    const todayStr = new Date().toISOString().split('T')[0];
    const statsData = App.storage.get('stats', {
      lastVisitDate: todayStr,
      streak: 1,
      focusMinutesToday: 45,
      tasksCompletedCount: 3
    });

    // Check Streak
    if (statsData.lastVisitDate !== todayStr) {
      const lastVisit = new Date(statsData.lastVisitDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today - lastVisit);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        statsData.streak += 1;
      } else if (diffDays > 1) {
        statsData.streak = 1;
      }

      // Reset daily focus minutes on new day
      statsData.focusMinutesToday = 0;
      statsData.lastVisitDate = todayStr;
      App.storage.set('stats', statsData);
    }

    App.updateStatsUI = function () {
      const current = App.storage.get('stats', statsData);
      const streakEl = document.getElementById('stat-streak');
      const focusEl = document.getElementById('stat-focus');
      const tasksEl = document.getElementById('stat-tasks');

      if (streakEl) App.animateCounter(streakEl, current.streak, 800, ' Days');
      if (focusEl) App.animateCounter(focusEl, current.focusMinutesToday, 800, ' min');
      if (tasksEl) App.animateCounter(tasksEl, current.tasksCompletedCount, 800);
    };

    App.incrementFocusMinutes = function (mins) {
      const current = App.storage.get('stats', statsData);
      current.focusMinutesToday = (current.focusMinutesToday || 0) + mins;
      App.storage.set('stats', current);
      App.updateStatsUI();
    };

    App.syncTasksCompleted = function (completedCount) {
      const current = App.storage.get('stats', statsData);
      current.tasksCompletedCount = completedCount;
      App.storage.set('stats', current);
      App.updateStatsUI();
    };

    App.updateStatsUI();
  }

  // =========================================================================
  // 6. EXAM COUNTDOWN ENGINE
  // =========================================================================
  function initExamCountdowns() {
    const defaultExams = [
      {
        id: 'exam-1',
        name: 'Database Management Systems',
        code: 'CS3491',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 60 * 4).toISOString() // 6 days from now
      },
      {
        id: 'exam-2',
        name: 'Theory of Computation',
        code: 'CS3452',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12 + 1000 * 60 * 60 * 9).toISOString() // 12 days from now
      },
      {
        id: 'exam-3',
        name: 'Artificial Intelligence & ML',
        code: 'CS3492',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18 + 1000 * 60 * 60 * 14).toISOString() // 18 days from now
      }
    ];

    let exams = App.storage.get('exams', defaultExams);

    const examContainer = document.getElementById('exams-grid');
    const addExamBtn = document.getElementById('add-exam-btn');
    const examModal = document.getElementById('exam-modal');
    const examForm = document.getElementById('exam-form');
    const closeExamModalBtn = document.getElementById('close-exam-modal');

    function calculateTimeRemaining(targetDateStr) {
      const total = Date.parse(targetDateStr) - Date.parse(new Date());
      if (total <= 0) {
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      return { total, days, hours, minutes, seconds };
    }

    function renderExams() {
      if (!examContainer) return;
      examContainer.innerHTML = '';

      if (exams.length === 0) {
        examContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
            <i class="fa-solid fa-calendar-check" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--accent-violet);"></i>
            <p>No upcoming exams scheduled. Click "Add Exam" to track your semester tests!</p>
          </div>
        `;
        return;
      }

      exams.forEach(exam => {
        const time = calculateTimeRemaining(exam.date);
        const examDateObj = new Date(exam.date);
        const formattedDate = examDateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const card = document.createElement('div');
        card.className = 'glass-panel exam-card glass-card-interactive';
        card.setAttribute('data-exam-id', exam.id);

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <span class="exam-subject-badge">${App.escapeHTML(exam.code || 'EXAM')}</span>
            <button class="delete-exam-btn" data-id="${exam.id}" aria-label="Delete Exam" style="color: var(--text-muted); font-size: 0.9rem;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <h3 class="exam-name">${App.escapeHTML(exam.name)}</h3>
          <p class="exam-date-text">
            <i class="fa-regular fa-clock"></i> ${App.escapeHTML(formattedDate)}
          </p>
          <div class="exam-timer-grid">
            <div class="exam-time-box">
              <div class="exam-time-num days-val">${time.days}</div>
              <div class="exam-time-unit">Days</div>
            </div>
            <div class="exam-time-box">
              <div class="exam-time-num hours-val">${String(time.hours).padStart(2, '0')}</div>
              <div class="exam-time-unit">Hours</div>
            </div>
            <div class="exam-time-box">
              <div class="exam-time-num mins-val">${String(time.minutes).padStart(2, '0')}</div>
              <div class="exam-time-unit">Mins</div>
            </div>
            <div class="exam-time-box">
              <div class="exam-time-num secs-val">${String(time.seconds).padStart(2, '0')}</div>
              <div class="exam-time-unit">Secs</div>
            </div>
          </div>
        `;

        examContainer.appendChild(card);
      });

      // Bind delete events
      document.querySelectorAll('.delete-exam-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          exams = exams.filter(ex => ex.id !== id);
          App.storage.set('exams', exams);
          renderExams();
          App.showToast('Exam removed', 'info');
        });
      });
    }

    // Ticking interval to update live countdown numbers
    setInterval(() => {
      exams.forEach(exam => {
        const card = document.querySelector(`.exam-card[data-exam-id="${exam.id}"]`);
        if (card) {
          const time = calculateTimeRemaining(exam.date);
          const daysEl = card.querySelector('.days-val');
          const hoursEl = card.querySelector('.hours-val');
          const minsEl = card.querySelector('.mins-val');
          const secsEl = card.querySelector('.secs-val');

          if (daysEl) daysEl.textContent = time.days;
          if (hoursEl) hoursEl.textContent = String(time.hours).padStart(2, '0');
          if (minsEl) minsEl.textContent = String(time.minutes).padStart(2, '0');
          if (secsEl) secsEl.textContent = String(time.seconds).padStart(2, '0');
        }
      });
    }, 1000);

    // Modal Events
    if (addExamBtn && examModal) {
      addExamBtn.addEventListener('click', () => {
        examModal.classList.add('active');
      });

      if (closeExamModalBtn) {
        closeExamModalBtn.addEventListener('click', () => {
          examModal.classList.remove('active');
        });
      }

      examModal.addEventListener('click', (e) => {
        if (e.target === examModal) examModal.classList.remove('active');
      });

      if (examForm) {
        examForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameInput = document.getElementById('exam-input-name');
          const codeInput = document.getElementById('exam-input-code');
          const dateInput = document.getElementById('exam-input-date');

          if (!nameInput.value || !dateInput.value) {
            App.showToast('Please fill all required fields', 'warning');
            return;
          }

          const newExam = {
            id: 'exam-' + Date.now(),
            name: nameInput.value.trim(),
            code: codeInput.value.trim().toUpperCase() || 'COURSE',
            date: new Date(dateInput.value).toISOString()
          };

          exams.push(newExam);
          App.storage.set('exams', exams);
          renderExams();
          examModal.classList.remove('active');
          examForm.reset();
          App.showToast('New exam countdown added!', 'success');
        });
      }
    }

    renderExams();
  }

  // =========================================================================
  // 7. SCROLL REVEAL & FOOTER YEAR
  // =========================================================================
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));
  }

  function initFooter() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // =========================================================================
  // DOM READY INITIALIZATION
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavigation();
    initHeroEffects();
    initStatsTracker();
    initExamCountdowns();
    initScrollReveal();
    initFooter();
  });

})(window.StudyHub);

