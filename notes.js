/* Developed by Nikil Ashika R, B.E. CSE 2nd Year */

/**
 * StudyHub - Academic Notes & Resource Vault Module
 * - Add, edit, delete notes with subject tags (CSE Core, Math, Lab, General)
 * - Live real-time search filtering
 * - Academic Resource Bookmarks (Anna Univ ACOE, NPTEL, LeetCode, GitHub)
 * - Copy-to-clipboard for quick sharing
 * - Safe XSS sanitization & LocalStorage persistence
 */

(function (App) {
  'use strict';

  const DEFAULT_NOTES = [
    {
      id: 'note-1',
      title: 'DBMS Normalization Cheatsheet',
      body: '1NF: Atomic values only.\n2NF: 1NF + No partial dependencies (all non-prime attributes dependent on full candidate key).\n3NF: 2NF + No transitive dependencies.\nBCNF: For every functional dependency X -> Y, X must be a superkey.',
      tag: 'cse',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    {
      id: 'note-2',
      title: 'TOC: Pumping Lemma for Regular Languages',
      body: 'Used to prove a language is NOT regular. Let L be regular with pumping length p. For string w ∈ L with |w| >= p, split into xyz where |y| > 0, |xy| <= p, and xy^i z ∈ L for all i >= 0.',
      tag: 'math',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    {
      id: 'note-3',
      title: 'Git Essential Branching Commands for CEG Lab',
      body: 'git checkout -b feature/model\ngit add . && git commit -m "feat: complete step 3"\ngit rebase main\ngit push origin feature/model',
      tag: 'lab',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  ];

  const DEFAULT_RESOURCES = [
    {
      id: 'res-1',
      name: 'Anna University ACOE Portal',
      category: 'Exam & Results',
      url: 'https://acoe.annauniv.edu',
      icon: 'fa-graduation-cap'
    },
    {
      id: 'res-2',
      name: 'NPTEL SWAYAM Online Courses',
      category: 'Video Lectures',
      url: 'https://nptel.ac.in',
      icon: 'fa-video'
    },
    {
      id: 'res-3',
      name: 'GeeksforGeeks CSE Portal',
      category: 'Syllabus & Tutorials',
      url: 'https://www.geeksforgeeks.org',
      icon: 'fa-laptop-code'
    },
    {
      id: 'res-4',
      name: 'LeetCode Problem Archive',
      category: 'Coding & Placements',
      url: 'https://leetcode.com',
      icon: 'fa-code'
    }
  ];

  function initNotes() {
    let notes = App.storage.get('notes', DEFAULT_NOTES);
    let resources = App.storage.get('resources', DEFAULT_RESOURCES);

    // DOM Elements - Notes
    const notesGrid = document.getElementById('notes-grid');
    const searchInput = document.getElementById('notes-search-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteModal = document.getElementById('note-modal');
    const noteForm = document.getElementById('note-form');
    const closeNoteModal = document.getElementById('close-note-modal');
    const noteTitleInput = document.getElementById('note-input-title');
    const noteBodyInput = document.getElementById('note-input-body');
    const noteTagSelect = document.getElementById('note-input-tag');

    // DOM Elements - Resources
    const resourcesGrid = document.getElementById('resources-grid');
    const addResourceBtn = document.getElementById('add-resource-btn');
    const resModal = document.getElementById('resource-modal');
    const resForm = document.getElementById('resource-form');
    const closeResModal = document.getElementById('close-resource-modal');
    const resNameInput = document.getElementById('res-input-name');
    const resCategoryInput = document.getElementById('res-input-category');
    const resUrlInput = document.getElementById('res-input-url');

    function saveNotes() {
      App.storage.set('notes', notes);
    }

    function saveResources() {
      App.storage.set('resources', resources);
    }

    function getTagClass(tag) {
      if (tag === 'cse') return 'tag-cse';
      if (tag === 'math') return 'tag-math';
      if (tag === 'lab') return 'tag-lab';
      return 'tag-general';
    }

    function getTagLabel(tag) {
      if (tag === 'cse') return 'CSE Core';
      if (tag === 'math') return 'Math / Theory';
      if (tag === 'lab') return 'Laboratory';
      return 'General';
    }

    function renderNotes(filterTerm = '') {
      if (!notesGrid) return;
      const term = filterTerm.toLowerCase().trim();

      const filtered = notes.filter(n => {
        return (
          n.title.toLowerCase().includes(term) ||
          n.body.toLowerCase().includes(term) ||
          getTagLabel(n.tag).toLowerCase().includes(term)
        );
      });

      notesGrid.innerHTML = '';

      if (filtered.length === 0) {
        notesGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
            <i class="fa-regular fa-note-sticky" style="font-size: 2.4rem; margin-bottom: 0.8rem; color: var(--accent-violet);"></i>
            <p>No study notes match your query. Click "+ Add Note" to create one!</p>
          </div>
        `;
        return;
      }

      filtered.forEach(note => {
        const card = document.createElement('div');
        card.className = 'glass-panel note-card glass-card-interactive';

        card.innerHTML = `
          <div>
            <div class="note-header">
              <h3 class="note-title">${App.escapeHTML(note.title)}</h3>
              <div style="display: flex; gap: 0.4rem;">
                <button class="task-action-btn edit-note-btn" title="Edit Note" aria-label="Edit Note">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="task-action-btn delete delete-note-btn" title="Delete Note" aria-label="Delete Note">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
            <div class="note-body">${App.escapeHTML(note.body)}</div>
          </div>
          <div class="note-footer">
            <span class="note-tag-pill ${getTagClass(note.tag)}">${getTagLabel(note.tag)}</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${App.escapeHTML(note.date || 'Recent')}</span>
          </div>
        `;

        // Edit
        const editBtn = card.querySelector('.edit-note-btn');
        editBtn.addEventListener('click', () => {
          const newTitle = prompt('Edit Note Title:', note.title);
          if (newTitle !== null) {
            const newBody = prompt('Edit Note Content:', note.body);
            if (newBody !== null) {
              note.title = newTitle.trim() || note.title;
              note.body = newBody.trim() || note.body;
              saveNotes();
              renderNotes(searchInput ? searchInput.value : '');
              App.showToast('Note updated!', 'info');
            }
          }
        });

        // Delete
        const deleteBtn = card.querySelector('.delete-note-btn');
        deleteBtn.addEventListener('click', () => {
          notes = notes.filter(n => n.id !== note.id);
          saveNotes();
          renderNotes(searchInput ? searchInput.value : '');
          App.showToast('Note deleted', 'info');
        });

        notesGrid.appendChild(card);
      });
    }

    function renderResources() {
      if (!resourcesGrid) return;
      resourcesGrid.innerHTML = '';

      resources.forEach(res => {
        const card = document.createElement('div');
        card.className = 'resource-card';

        card.innerHTML = `
          <div class="resource-info">
            <div class="resource-icon">
              <i class="fa-solid ${res.icon || 'fa-link'}"></i>
            </div>
            <div>
              <div class="resource-name">${App.escapeHTML(res.name)}</div>
              <div class="resource-category">${App.escapeHTML(res.category)}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <button class="task-action-btn copy-link-btn" title="Copy URL" aria-label="Copy URL">
              <i class="fa-regular fa-copy"></i>
            </button>
            <a href="${App.escapeHTML(res.url)}" target="_blank" rel="noopener noreferrer" class="task-action-btn" title="Open Link" aria-label="Open Link">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <button class="task-action-btn delete delete-res-btn" title="Remove" aria-label="Remove">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;

        // Copy button
        const copyBtn = card.querySelector('.copy-link-btn');
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(res.url).then(() => {
            App.showToast('Link copied to clipboard! 📋', 'success');
          }).catch(() => {
            App.showToast('Could not copy link', 'warning');
          });
        });

        // Delete button
        const deleteBtn = card.querySelector('.delete-res-btn');
        deleteBtn.addEventListener('click', () => {
          resources = resources.filter(r => r.id !== res.id);
          saveResources();
          renderResources();
          App.showToast('Resource removed', 'info');
        });

        resourcesGrid.appendChild(card);
      });
    }

    // Search filter input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderNotes(e.target.value);
      });
    }

    // Add Note Modal Handlers
    if (addNoteBtn && noteModal) {
      addNoteBtn.addEventListener('click', () => {
        noteModal.classList.add('active');
      });

      if (closeNoteModal) {
        closeNoteModal.addEventListener('click', () => {
          noteModal.classList.remove('active');
        });
      }

      noteModal.addEventListener('click', (e) => {
        if (e.target === noteModal) noteModal.classList.remove('active');
      });

      if (noteForm) {
        noteForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const title = noteTitleInput.value.trim();
          const body = noteBodyInput.value.trim();
          const tag = noteTagSelect.value;

          if (!title || !body) {
            App.showToast('Please fill all note fields', 'warning');
            return;
          }

          const newNote = {
            id: 'note-' + Date.now(),
            title: title,
            body: body,
            tag: tag || 'cse',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          };

          notes.unshift(newNote);
          saveNotes();
          renderNotes(searchInput ? searchInput.value : '');
          noteModal.classList.remove('active');
          noteForm.reset();
          App.showToast('New study note saved!', 'success');
        });
      }
    }

    // Add Resource Modal Handlers
    if (addResourceBtn && resModal) {
      addResourceBtn.addEventListener('click', () => {
        resModal.classList.add('active');
      });

      if (closeResModal) {
        closeResModal.addEventListener('click', () => {
          resModal.classList.remove('active');
        });
      }

      resModal.addEventListener('click', (e) => {
        if (e.target === resModal) resModal.classList.remove('active');
      });

      if (resForm) {
        resForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = resNameInput.value.trim();
          const cat = resCategoryInput.value.trim();
          let url = resUrlInput.value.trim();

          if (!name || !url) {
            App.showToast('Please provide both name and URL', 'warning');
            return;
          }

          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }

          const newRes = {
            id: 'res-' + Date.now(),
            name: name,
            category: cat || 'Resource',
            url: url,
            icon: 'fa-bookmark'
          };

          resources.push(newRes);
          saveResources();
          renderResources();
          resModal.classList.remove('active');
          resForm.reset();
          App.showToast('New study resource link saved!', 'success');
        });
      }
    }

    // Initial renders
    renderNotes();
    renderResources();
  }

  document.addEventListener('DOMContentLoaded', initNotes);
})(window.StudyHub);

