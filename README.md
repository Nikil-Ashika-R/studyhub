<!-- Developed by Nikil Ashika R, B.E. CSE 2nd Year -->

# 🎓 StudyHub — Production Academic Workstation for College Students

> **Designed & Developed by:** Nikil Ashika R  
> **Affiliation:** B.E. Computer Science and Engineering, 2nd Year  
> **Institution:** College of Engineering, Guindy, Anna University (CEG)  
> **Tech Stack:** HTML5, CSS3 Glassmorphism, Vanilla ES6+ JavaScript, Web Audio API, Canvas API, LocalStorage  
> **Architecture:** 100% Client-Side Static (Zero frameworks, zero backend, zero build steps required)

---

## 🌟 Overview

**StudyHub** is an all-in-one productivity suite and academic workstation specifically engineered for university students. Featuring a modern, high-performance glassmorphism interface with deep violet-cyan-pink gradients, a 60 FPS multi-layer dynamic moving background, and complete offline persistence.

### Key Capabilities
- 🌌 **Hypnotic Multi-Layer Moving Background:**
  - Layer 1: Ambient mesh gradient with slow harmonic color morphing.
  - Layer 2: Drifting blurred color blobs.
  - Layer 3: Interactive `<canvas>` constellation network with mouse repulsion/attraction, DPR scaling, mobile particle count throttling, and auto-pause on tab switch (`visibilitychange`).
  - Layer 4: Floating academic icons (books, pencils, atoms, graduation caps).
  - Layer 5: Smooth cursor spotlight trailing the pointer on desktop.
- ⏱️ **Focus Timer (Pomodoro):**
  - Circular SVG progress ring with smooth dashoffset transitions.
  - Configurable Focus (25m), Short Break (5m), and Long Break (15m) durations.
  - Pure Web Audio API synthesized harmonic chime (no external MP3/WAV files required).
  - Browser tab title synchronization showing remaining time (e.g., `(24:59) Focus | StudyHub`).
- 📋 **Task Planner:**
  - Create and manage tasks with title, course subject, priority (High / Medium / Low), and deadline.
  - Filter by All, Active, or Done; sort by Due Date, Priority, or Title.
  - Real-time overdue detection with pulsing warning badges.
  - Visual completion progress meter synced with global stats.
- 🎓 **Anna University CGPA & GPA Calculator:**
  - Official Anna University Regulation grade points: $O=10$, $A+=9$, $A=8$, $B+=7$, $B=6$, $C=5$, $RA/U=0$.
  - Dynamic course rows with credit weighting.
  - Live animated semester GPA, credits tally, and percentage equivalence ($\text{Percentage} = \text{CGPA} \times 10$).
  - Cumulative CGPA solver factoring in prior semesters' credits.
  - Target CGPA assistant calculating the exact minimum GPA required next semester to hit target goals.
- 🗂️ **Active Recall Flashcards:**
  - Multi-deck study system preloaded with Computer Science core decks (*Data Structures & Algorithms* and *Operating Systems*).
  - Realistic 3D card flip animation triggered by click or keyboard ([Space] / [Enter]).
  - Next, Previous, and Fisher-Yates random card shuffle.
  - Study feedback tracking ("Mastered" vs "Need Review") with deck mastery meter.
- 📝 **Notes & University Resource Vault:**
  - Study notes categorized by subject tags (`CSE Core`, `Math / Theory`, `Laboratory`, `General`).
  - Real-time search filter across note titles, contents, and categories.
  - Curated academic bookmark repository (Anna University ACOE, NPTEL, LeetCode, GeeksforGeeks) with one-click URL copy.
- ⏳ **Upcoming Exam Countdown:**
  - Live countdown cards ticking days, hours, minutes, and seconds until your scheduled exams.
- 🌗 **Dark / Light Glassmorphism Themes:**
  - Default deep midnight indigo dark theme and polished frosted light theme.
  - Persisted in `localStorage` across browser reloads.
- 👨‍💻 **Developer Showcase:**
  - Dedicated developer card and dynamic footer honoring Nikil Ashika R.

---

## 🚀 How to Run Locally

Because StudyHub is built strictly with vanilla web standards, it requires **no build step, no Node.js runtime, and no external package managers**.

### Option 1: Direct File Opening (Simplest)
1. Double-click `index.html` or drag and drop `index.html` into any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari, Brave).
2. Everything—including canvas particles, audio chimes, local storage, and animations—works immediately!

### Option 2: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension by Ritwick Dey (if not already installed).
3. Right-click `index.html` in the file explorer and select **"Open with Live Server"**.
4. The application will launch at `http://127.0.0.1:5500`.

---

## 🌐 Deployment Guide

### Deploying to GitHub Pages (Free)
1. Initialize a Git repository (if not already initialized) and push your files to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete StudyHub release"
   git push origin main
   ```
2. Navigate to your repository on GitHub.
3. Click **Settings** ➔ **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** ➔ **Source**, select **Deploy from a branch**.
5. Set the branch to `main` (or `master`) and directory to `/ (root)`.
6. Click **Save**. Within 1–2 minutes, your website will be live at `https://<your-username>.github.io/<repo-name>/`.

### Deploying to Netlify (Free)
1. Log in to [Netlify](https://www.netlify.com).
2. Go to **Sites** ➔ **Add new site** ➔ **Deploy manually**.
3. Drag and drop the folder containing `index.html`, `css/`, and `js/` into the upload zone.
4. Netlify will deploy your site in seconds and provide a custom live HTTPS URL.

---

## 📁 File Structure

```
studyhub/
│
├── index.html              # Main semantic HTML5 document and accessible layout
├── README.md               # Documentation and execution instructions
├── css/
│   └── style.css           # Glassmorphism design system, dark/light themes, animations
└── js/
    ├── background.js       # Dynamic canvas particle network, mesh gradient, cursor glow
    ├── app.js              # Theme manager, navigation, hero typewriter, stats, exams, toast
    ├── pomodoro.js         # Circular SVG timer, Web Audio synthesizer chime, tab title sync
    ├── todo.js             # Task planner, filtering, sorting, progress meter & overdue tracking
    ├── cgpa.js             # Anna University GPA/CGPA engine, dynamic courses & target solver
    ├── flashcards.js       # Active recall 3D flip cards, mastery tracker & deck shuffler
    └── notes.js            # Tagged notes manager, search filter & academic bookmarks
```

---

## 🛡️ Security & Performance Standards
- **XSS Protection:** All user inputs (tasks, courses, notes, bookmarks, exams) are sanitized using an `escapeHTML` entity encoder prior to DOM injection.
- **Resilient Offline Architecture:** All data persistence uses wrapped `try...catch` handlers targeting `localStorage` with rich preloaded fallbacks.
- **60 FPS Rendering:** The canvas background and cursor follower utilize `requestAnimationFrame` with automatic pausing when the browser tab is hidden to save battery and GPU cycles.
- **Zero Broken Asset Links:** Sound effects are generated in real-time via the Web Audio API oscillators, eliminating any dependency on external media hosts.

---

## 👤 Developer Information

**Nikil Ashika R**  
*B.E. Computer Science and Engineering, 2nd Year*  
College of Engineering, Guindy, Anna University  
*Chennai, Tamil Nadu, India*
