/* Developed by Nikil Ashika R, B.E. CSE 2nd Year */

/**
 * StudyHub - Pomodoro Focus Timer Module
 * - Circular SVG progress ring with smooth stroke-dashoffset
 * - Focus (25m), Short Break (5m), Long Break (15m) modes
 * - Custom duration configuration saved in LocalStorage
 * - Start / Pause / Reset / Skip controls
 * - Web Audio API synthesized soft bell / chime (Zero external audio files required)
 * - Browser tab title dynamic sync with countdown
 * - Completed sessions counter and auto-sync with global stats
 */

(function (App) {
  'use strict';

  // Circle geometry: radius = 120, circumference = 2 * PI * 120 ≈ 753.98
  const CIRCLE_RADIUS = 120;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Sound Synthesizer via Web Audio API
  function playCompletionChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Soft harmonic chime notes: E5 -> G#5 -> B5 -> E6
      const notes = [659.25, 830.61, 987.77, 1318.51];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        // Gentle envelope
        gain.gain.setValueAtTime(0, now + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.14 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 1.3);
      });
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }

  function initPomodoro() {
    // Default Durations in minutes
    const settings = App.storage.get('pomodoro_settings', {
      focus: 25,
      shortBreak: 5,
      longBreak: 15
    });

    let currentMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
    let totalSeconds = settings[currentMode] * 60;
    let secondsLeft = totalSeconds;
    let timerId = null;
    let isRunning = false;
    let completedSessions = App.storage.get('pomodoro_sessions', 0);

    // DOM Elements
    const digitsEl = document.getElementById('timer-digits');
    const statusBadgeEl = document.getElementById('timer-status');
    const progressCircle = document.getElementById('timer-progress');
    const startBtn = document.getElementById('timer-start-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const skipBtn = document.getElementById('timer-skip-btn');
    const sessionCountEl = document.getElementById('pomodoro-completed-count');
    const modeTabs = document.querySelectorAll('.pomo-tab');

    // Settings Modal DOM Elements
    const settingsBtn = document.getElementById('timer-settings-btn');
    const settingsModal = document.getElementById('pomo-settings-modal');
    const settingsForm = document.getElementById('pomo-settings-form');
    const closeSettingsBtn = document.getElementById('close-pomo-settings');
    const inputFocus = document.getElementById('pomo-input-focus');
    const inputShort = document.getElementById('pomo-input-short');
    const inputLong = document.getElementById('pomo-input-long');

    if (!digitsEl || !progressCircle) return;

    // Set initial circle stroke properties
    progressCircle.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;
    progressCircle.style.strokeDashoffset = '0';

    function formatTime(secs) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updateDisplay() {
      digitsEl.textContent = formatTime(secondsLeft);

      // Calculate progress fraction
      const progressFraction = (totalSeconds - secondsLeft) / totalSeconds;
      const offset = CIRCLE_CIRCUMFERENCE * (1 - progressFraction);
      progressCircle.style.strokeDashoffset = offset;

      // Update Browser Tab Title
      const modeLabels = { focus: 'Focus', shortBreak: 'Short Break', longBreak: 'Long Break' };
      const modeLabel = modeLabels[currentMode];
      if (isRunning) {
        document.title = `(${formatTime(secondsLeft)}) ${modeLabel} | StudyHub`;
      } else {
        document.title = 'StudyHub | by Nikil Ashika R';
      }

      if (sessionCountEl) {
        sessionCountEl.textContent = completedSessions;
      }
    }

    function switchMode(mode) {
      pauseTimer();
      currentMode = mode;
      totalSeconds = settings[currentMode] * 60;
      secondsLeft = totalSeconds;

      modeTabs.forEach(tab => {
        if (tab.getAttribute('data-mode') === mode) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      const modeLabels = { focus: 'Focus Time', shortBreak: 'Short Break', longBreak: 'Long Break' };
      if (statusBadgeEl) {
        statusBadgeEl.textContent = modeLabels[mode];
      }

      updateDisplay();
    }

    function startTimer() {
      if (isRunning) return;
      isRunning = true;
      startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      startBtn.classList.remove('btn-primary');
      startBtn.classList.add('btn-secondary');

      timerId = setInterval(() => {
        if (secondsLeft > 0) {
          secondsLeft--;
          updateDisplay();
        } else {
          handleTimerComplete();
        }
      }, 1000);
    }

    function pauseTimer() {
      if (!isRunning) return;
      isRunning = false;
      clearInterval(timerId);
      timerId = null;
      startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
      startBtn.classList.remove('btn-secondary');
      startBtn.classList.add('btn-primary');
      updateDisplay();
    }

    function resetTimer() {
      pauseTimer();
      secondsLeft = totalSeconds;
      updateDisplay();
      App.showToast('Timer reset', 'info');
    }

    function handleTimerComplete() {
      pauseTimer();
      playCompletionChime();

      if (currentMode === 'focus') {
        completedSessions++;
        App.storage.set('pomodoro_sessions', completedSessions);
        App.incrementFocusMinutes(settings.focus);
        App.showToast(`🎉 Focus session completed! You earned ${settings.focus} focus minutes.`, 'success');

        // Suggest break
        if (completedSessions % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        App.showToast('🔔 Break is over! Time to get back into flow.', 'info');
        switchMode('focus');
      }
    }

    // Controls listeners
    startBtn.addEventListener('click', () => {
      if (isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });

    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to skip this session?')) {
          handleTimerComplete();
        }
      });
    }

    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode');
        switchMode(mode);
      });
    });

    // Settings Modal
    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', () => {
        if (inputFocus) inputFocus.value = settings.focus;
        if (inputShort) inputShort.value = settings.shortBreak;
        if (inputLong) inputLong.value = settings.longBreak;
        settingsModal.classList.add('active');
      });

      if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
          settingsModal.classList.remove('active');
        });
      }

      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
          settingsModal.classList.remove('active');
        }
      });

      if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const f = parseInt(inputFocus.value, 10);
          const s = parseInt(inputShort.value, 10);
          const l = parseInt(inputLong.value, 10);

          if (f > 0 && s > 0 && l > 0) {
            settings.focus = f;
            settings.shortBreak = s;
            settings.longBreak = l;
            App.storage.set('pomodoro_settings', settings);

            totalSeconds = settings[currentMode] * 60;
            secondsLeft = totalSeconds;
            updateDisplay();

            settingsModal.classList.remove('active');
            App.showToast('Timer settings saved!', 'success');
          } else {
            App.showToast('Please enter valid positive durations', 'warning');
          }
        });
      }
    }

    // Initial render
    updateDisplay();
  }

  document.addEventListener('DOMContentLoaded', initPomodoro);
})(window.StudyHub);

