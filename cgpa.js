/* Developed by Nikil Ashika R, B.E. CSE 2nd Year */

/**
 * StudyHub - Anna University CGPA & GPA Calculator Module
 * - Anna University Grading Scale:
 *   O = 10, A+ = 9, A = 8, B+ = 7, B = 6, C = 5, RA / U = 0
 * - Dynamic course rows (add / remove / credit weight)
 * - Animated GPA result display with classification badge
 * - Cumulative CGPA engine combining previous semester credits
 * - Target CGPA solver (determines GPA required next semester)
 * - Official Anna University percentage converter
 * - LocalStorage persistence of courses and entries
 */

(function (App) {
  'use strict';

  // Anna University Grade Points mapping
  const GRADE_POINTS = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'RA': 0,
    'U': 0
  };

  const DEFAULT_COURSES = [
    { name: 'Theory of Computation', credits: 4, grade: 'A+' },
    { name: 'Database Management Systems', credits: 3, grade: 'O' },
    { name: 'Artificial Intelligence & ML', credits: 4, grade: 'A' },
    { name: 'DBMS Laboratory', credits: 2, grade: 'O' },
    { name: 'Environmental Science & Sustainability', credits: 2, grade: 'A+' },
    { name: 'Design and Analysis of Algorithms', credits: 4, grade: 'A+' }
  ];

  function initCGPA() {
    let courses = App.storage.get('cgpa_courses', DEFAULT_COURSES);

    // DOM Elements
    const coursesContainer = document.getElementById('course-rows-container');
    const addCourseBtn = document.getElementById('add-course-btn');
    const resetCoursesBtn = document.getElementById('reset-courses-btn');
    const displayGPA = document.getElementById('cgpa-display-gpa');
    const displayCredits = document.getElementById('cgpa-total-credits');
    const displayPercentage = document.getElementById('cgpa-percentage-val');
    const displayStatus = document.getElementById('cgpa-classification');

    // Cumulative & Target Helper DOM Elements
    const prevCreditsInput = document.getElementById('prev-credits-input');
    const prevCGPAInput = document.getElementById('prev-cgpa-input');
    const targetCGPAInput = document.getElementById('target-cgpa-input');
    const nextCreditsInput = document.getElementById('next-credits-input');
    const targetHelperResult = document.getElementById('target-helper-result');
    const cumulativeCGPADisplay = document.getElementById('cumulative-cgpa-display');

    if (!coursesContainer) return;

    function saveCourses() {
      App.storage.set('cgpa_courses', courses);
    }

    function calculateSemesterGPA() {
      let totalCredits = 0;
      let totalGradePoints = 0;
      let hasRA = false;

      courses.forEach(c => {
        const credit = parseFloat(c.credits) || 0;
        const gp = GRADE_POINTS[c.grade] !== undefined ? GRADE_POINTS[c.grade] : 0;
        if (c.grade === 'RA' || c.grade === 'U') hasRA = true;

        totalCredits += credit;
        totalGradePoints += credit * gp;
      });

      const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0.0;
      const roundedGPA = Math.round(gpa * 100) / 100;
      const percentage = Math.round(roundedGPA * 10 * 10) / 10; // Anna Univ standard: CGPA * 10

      // Performance Classification
      let classification = 'Satisfactory';
      if (hasRA) {
        classification = 'Reappearance Needed (RA)';
      } else if (roundedGPA >= 8.5) {
        classification = 'First Class with Distinction ⭐';
      } else if (roundedGPA >= 6.5) {
        classification = 'First Class';
      } else if (roundedGPA >= 5.0) {
        classification = 'Second Class';
      }

      // Update UI
      if (displayGPA) displayGPA.textContent = roundedGPA.toFixed(2);
      if (displayCredits) displayCredits.textContent = totalCredits;
      if (displayPercentage) displayPercentage.textContent = percentage.toFixed(1) + '%';
      if (displayStatus) {
        displayStatus.textContent = classification;
        displayStatus.style.borderColor = roundedGPA >= 8.5 ? 'var(--accent-emerald)' : 'var(--accent-violet)';
        displayStatus.style.color = roundedGPA >= 8.5 ? 'var(--accent-emerald)' : 'var(--accent-violet)';
      }

      updateCumulativeAndTarget(roundedGPA, totalCredits);
      return { gpa: roundedGPA, totalCredits };
    }

    function updateCumulativeAndTarget(currentSemGPA, currentSemCredits) {
      const prevCredits = parseFloat(prevCreditsInput ? prevCreditsInput.value : 0) || 0;
      const prevCGPA = parseFloat(prevCGPAInput ? prevCGPAInput.value : 0) || 0;
      const targetCGPA = parseFloat(targetCGPAInput ? targetCGPAInput.value : 0) || 0;
      const nextCredits = parseFloat(nextCreditsInput ? nextCreditsInput.value : 20) || 20;

      // Cumulative Calculation
      const combinedCredits = prevCredits + currentSemCredits;
      let combinedCGPA = currentSemGPA;

      if (combinedCredits > 0) {
        combinedCGPA = ((prevCredits * prevCGPA) + (currentSemCredits * currentSemGPA)) / combinedCredits;
      }

      const roundedCumulative = Math.round(combinedCGPA * 100) / 100;
      if (cumulativeCGPADisplay) {
        cumulativeCGPADisplay.textContent = roundedCumulative.toFixed(2);
      }

      // Target CGPA Solver
      if (targetHelperResult) {
        if (targetCGPA <= 0) {
          targetHelperResult.innerHTML = `Enter your target CGPA above to see the GPA needed in future semesters.`;
        } else {
          // Formula: Target GPA required in next semester =
          // (TargetCGPA * (TotalCreditsSoFar + NextCredits) - (CurrentCumulative * TotalCreditsSoFar)) / NextCredits
          const totalCreditsSoFar = combinedCredits;
          const currentTotalCGPA = roundedCumulative;

          const requiredGPA = (
            (targetCGPA * (totalCreditsSoFar + nextCredits)) - (currentTotalCGPA * totalCreditsSoFar)
          ) / nextCredits;

          const roundedRequired = Math.round(requiredGPA * 100) / 100;

          if (roundedRequired > 10.0) {
            targetHelperResult.innerHTML = `
              <span style="color: var(--accent-rose); font-weight: 600;">
                <i class="fa-solid fa-triangle-exclamation"></i> Required GPA: ${roundedRequired.toFixed(2)}
              </span><br>
              A target CGPA of <strong>${targetCGPA}</strong> is mathematically out of reach in just 1 semester (${nextCredits} credits). Consider spreading your goal across multiple semesters.
            `;
          } else if (roundedRequired <= 0) {
            targetHelperResult.innerHTML = `
              <span style="color: var(--accent-emerald); font-weight: 600;">
                <i class="fa-solid fa-circle-check"></i> Target already secured!
              </span><br>
              Your cumulative CGPA of <strong>${currentTotalCGPA.toFixed(2)}</strong> already meets or exceeds your goal of ${targetCGPA}.
            `;
          } else {
            targetHelperResult.innerHTML = `
              To achieve an overall CGPA of <strong>${targetCGPA.toFixed(2)}</strong> next semester (${nextCredits} credits), you need a minimum GPA of 
              <span style="color: var(--accent-cyan); font-weight: 700; font-size: 1.05rem;">${roundedRequired.toFixed(2)}</span>.
            `;
          }
        }
      }
    }

    function renderCourseRows() {
      coursesContainer.innerHTML = '';

      courses.forEach((course, index) => {
        const row = document.createElement('div');
        row.className = 'course-row';

        row.innerHTML = `
          <input type="text" class="form-input course-name-input" value="${App.escapeHTML(course.name)}" placeholder="Subject Name">
          <input type="number" class="form-input course-credits-input" value="${course.credits}" min="1" max="12" step="0.5">
          <select class="form-select course-grade-select">
            ${Object.keys(GRADE_POINTS).map(g => `
              <option value="${g}" ${course.grade === g ? 'selected' : ''}>${g} (${GRADE_POINTS[g]} pts)</option>
            `).join('')}
          </select>
          <button class="course-row-remove" title="Remove Course" aria-label="Remove Course">
            <i class="fa-solid fa-xmark"></i>
          </button>
        `;

        // Event listeners
        const nameInput = row.querySelector('.course-name-input');
        const creditsInput = row.querySelector('.course-credits-input');
        const gradeSelect = row.querySelector('.course-grade-select');
        const removeBtn = row.querySelector('.course-row-remove');

        nameInput.addEventListener('input', (e) => {
          courses[index].name = e.target.value;
          saveCourses();
        });

        creditsInput.addEventListener('input', (e) => {
          courses[index].credits = parseFloat(e.target.value) || 0;
          saveCourses();
          calculateSemesterGPA();
        });

        gradeSelect.addEventListener('change', (e) => {
          courses[index].grade = e.target.value;
          saveCourses();
          calculateSemesterGPA();
        });

        removeBtn.addEventListener('click', () => {
          if (courses.length <= 1) {
            App.showToast('You must have at least one course row', 'warning');
            return;
          }
          courses.splice(index, 1);
          saveCourses();
          renderCourseRows();
          calculateSemesterGPA();
          App.showToast('Course row removed', 'info');
        });

        coursesContainer.appendChild(row);
      });

      calculateSemesterGPA();
    }

    // Add Course Row
    if (addCourseBtn) {
      addCourseBtn.addEventListener('click', () => {
        courses.push({
          name: `Elective / Subject ${courses.length + 1}`,
          credits: 3,
          grade: 'A+'
        });
        saveCourses();
        renderCourseRows();
        App.showToast('New course added', 'success');
      });
    }

    // Reset Courses
    if (resetCoursesBtn) {
      resetCoursesBtn.addEventListener('click', () => {
        if (confirm('Reset semester courses to default Anna University subjects?')) {
          courses = JSON.parse(JSON.stringify(DEFAULT_COURSES));
          saveCourses();
          renderCourseRows();
          App.showToast('Course list reset to default', 'info');
        }
      });
    }

    // Helper inputs event listeners
    [prevCreditsInput, prevCGPAInput, targetCGPAInput, nextCreditsInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', calculateSemesterGPA);
      }
    });

    // Initial render
    renderCourseRows();
  }

  document.addEventListener('DOMContentLoaded', initCGPA);
})(window.StudyHub);

