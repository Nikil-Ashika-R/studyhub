/* Developed by Nikil Ashika R, B.E. CSE 2nd Year */

/**
 * StudyHub - Task Planner Module
 * - Add, edit, complete, delete academic tasks
 * - Attributes: title, subject, priority (High/Med/Low), due date
 * - Filter by status (All / Active / Done)
 * - Sorting: due date, priority, title
 * - Overdue calculation with visual pulsing alert
 * - Dynamic progress bar calculation
 * - Safe XSS rendering & LocalStorage persistence
 * - Syncs completed count to global stats
 */

(function (App) {
  'use strict';

  function initTodo() {
    const defaultTasks = [
      {
        id: 'task-1',
        title: 'Complete DBMS Lab Exercise 4 on Joins & Views',
        subject: 'Database Systems',
        priority: 'high',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18 hrs
        completed: false
      },
      {
        id: 'task-2',
        title: 'Revise Unit 2: Context-Free Grammars & Pushdown Automata',
        subject: 'Theory of Computation',
        priority: 'high',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days
        completed: true
      },
      {
        id: 'task-3',
        title: 'Draft Project Presentation for AI/ML mini-project',
        subject: 'Machine Learning',
        priority: 'medium',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // 3 days
        completed: false
      },
      {
        id: 'task-4',
        title: 'Read Anna University placement guidelines update',
        subject: 'Career & Placement',
        priority: 'low',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
        completed: true
      }
    ];

    let tasks = App.storage.get('tasks', defaultTasks);
    let activeFilter = 'all'; // 'all', 'active', 'done'
    let currentSort = 'dueDate'; // 'dueDate', 'priority', 'title'

    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInputTitle = document.getElementById('task-input-title');
    const taskInputSubject = document.getElementById('task-input-subject');
    const taskInputPriority = document.getElementById('task-input-priority');
    const taskInputDueDate = document.getElementById('task-input-due');
    const taskListContainer = document.getElementById('task-items-list');
    const taskProgressFill = document.getElementById('task-progress-fill');
    const taskProgressText = document.getElementById('task-progress-text');
    const taskSortSelect = document.getElementById('task-sort-select');
    const filterButtons = document.querySelectorAll('.task-filters .filter-btn');

    if (!taskListContainer) return;

    function saveTasks() {
      App.storage.set('tasks', tasks);
      updateTaskStats();
      renderTasks();
    }

    function updateTaskStats() {
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

      if (taskProgressFill) {
        taskProgressFill.style.width = `${percentage}%`;
      }
      if (taskProgressText) {
        taskProgressText.textContent = `${completed} of ${total} completed (${percentage}%)`;
      }

      // Sync with global stats tracker
      if (App.syncTasksCompleted) {
        App.syncTasksCompleted(completed);
      }
    }

    function isOverdue(dueDateStr) {
      if (!dueDateStr) return false;
      return new Date(dueDateStr) < new Date();
    }

    function formatDueDate(dueDateStr) {
      if (!dueDateStr) return 'No deadline';
      const d = new Date(dueDateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function getPriorityWeight(p) {
      if (p === 'high') return 3;
      if (p === 'medium') return 2;
      return 1;
    }

    function renderTasks() {
      // 1. Filter
      let filtered = tasks.filter(task => {
        if (activeFilter === 'active') return !task.completed;
        if (activeFilter === 'done') return task.completed;
        return true;
      });

      // 2. Sort
      filtered.sort((a, b) => {
        if (currentSort === 'dueDate') {
          return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        } else if (currentSort === 'priority') {
          return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        } else if (currentSort === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });

      taskListContainer.innerHTML = '';

      if (filtered.length === 0) {
        taskListContainer.innerHTML = `
          <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <i class="fa-solid fa-clipboard-check" style="font-size: 2.2rem; margin-bottom: 0.8rem; color: var(--accent-violet);"></i>
            <p>No tasks found for the current filter. Great job staying organized!</p>
          </div>
        `;
        return;
      }

      filtered.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.setAttribute('data-id', task.id);

        const overdue = !task.completed && isOverdue(task.dueDate);

        item.innerHTML = `
          <div class="task-left">
            <div class="custom-checkbox" role="checkbox" aria-checked="${task.completed}" tabindex="0" title="Toggle completion">
              ${task.completed ? '<i class="fa-solid fa-check" style="font-size: 0.75rem;"></i>' : ''}
            </div>
            <div class="task-details">
              <span class="task-text-title">${App.escapeHTML(task.title)}</span>
              <div class="task-meta-pills">
                <span><i class="fa-solid fa-book" style="color: var(--accent-violet); font-size: 0.7rem;"></i> ${App.escapeHTML(task.subject || 'General')}</span>
                <span class="badge badge-${task.priority}">${task.priority.toUpperCase()}</span>
                <span><i class="fa-regular fa-clock" style="font-size: 0.75rem;"></i> ${formatDueDate(task.dueDate)}</span>
                ${overdue ? '<span class="badge badge-overdue"><i class="fa-solid fa-triangle-exclamation"></i> OVERDUE</span>' : ''}
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="task-action-btn edit" title="Edit Task" aria-label="Edit Task">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="task-action-btn delete" title="Delete Task" aria-label="Delete Task">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;

        // Checkbox Click
        const checkbox = item.querySelector('.custom-checkbox');
        checkbox.addEventListener('click', () => {
          task.completed = !task.completed;
          saveTasks();
          App.showToast(task.completed ? 'Task completed! 🎯' : 'Task marked active', 'success');
        });

        // Edit Button Click
        const editBtn = item.querySelector('.task-action-btn.edit');
        editBtn.addEventListener('click', () => {
          const newTitle = prompt('Edit task title:', task.title);
          if (newTitle !== null && newTitle.trim() !== '') {
            task.title = newTitle.trim();
            saveTasks();
            App.showToast('Task updated', 'info');
          }
        });

        // Delete Button Click
        const deleteBtn = item.querySelector('.task-action-btn.delete');
        deleteBtn.addEventListener('click', () => {
          tasks = tasks.filter(t => t.id !== task.id);
          saveTasks();
          App.showToast('Task deleted', 'info');
        });

        taskListContainer.appendChild(item);
      });
    }

    // Form Submit
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskInputTitle.value.trim();
        const subject = taskInputSubject.value.trim();
        const priority = taskInputPriority.value;
        const dueDate = taskInputDueDate.value;

        if (!title) {
          App.showToast('Please enter a task title', 'warning');
          return;
        }

        const newTask = {
          id: 'task-' + Date.now(),
          title: title,
          subject: subject || 'General',
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          completed: false
        };

        tasks.unshift(newTask);
        saveTasks();
        taskForm.reset();
        App.showToast('New study task added!', 'success');
      });
    }

    // Filter Controls
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderTasks();
      });
    });

    // Sorting Dropdown
    if (taskSortSelect) {
      taskSortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
      });
    }

    // Initial render
    updateTaskStats();
    renderTasks();
  }

  document.addEventListener('DOMContentLoaded', initTodo);
})(window.StudyHub);

