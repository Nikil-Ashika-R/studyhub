/* Developed by Nikil Ashika R, B.E. CSE 2nd Year */

/**
 * Dynamic Moving Background Engine
 * - Interactive Canvas Particle Constellation with mouse attract/repel
 * - Responsive DPI scaling & mobile throttle
 * - Tab visibility auto-pause
 * - Theme-aware color blending
 * - Floating study icons generator
 * - Smooth cursor follower
 */

(function () {
  'use strict';

  // Background Canvas State
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;
  let animationFrameId = null;
  let isTabVisible = true;

  // Mouse Interaction State
  const mouse = {
    x: -9999,
    y: -9999,
    radius: 140,
    isActive: false
  };

  // Particle configuration
  let particles = [];
  const connectionDistance = 120;

  function getParticleCount() {
    return window.innerWidth < 768 ? 40 : 85;
  }

  function getThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      particle: isLight ? 'rgba(99, 102, 241, 0.75)' : 'rgba(167, 139, 250, 0.8)',
      line: isLight ? 'rgba(14, 165, 233, ' : 'rgba(147, 197, 253, ',
      particleGlow: isLight ? 'rgba(99, 102, 241, 0.4)' : 'rgba(139, 92, 246, 0.5)'
    };
  }

  // Particle Class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 2 + 1.2;
      this.baseRadius = this.radius;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.glow = Math.random() * 0.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around bounds
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse interaction (repel gently)
      if (mouse.isActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const forceDirectionX = dx / dist;
          const forceDirectionY = dy / dist;
          // Soft repel
          this.x -= forceDirectionX * force * 2.5;
          this.y -= forceDirectionY * force * 2.5;
          this.radius = this.baseRadius * (1 + force * 0.8);
        } else {
          this.radius = this.baseRadius;
        }
      }
    }

    draw(colors) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.particle;
      ctx.shadowBlur = 8;
      ctx.shadowColor = colors.particleGlow;
      ctx.fill();
      ctx.restore();
    }
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);

    // Re-populate particles according to screen size
    const targetCount = getParticleCount();
    particles = [];
    for (let i = 0; i < targetCount; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections(colors) {
    const len = particles.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `${colors.line}${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    if (!isTabVisible) return;

    ctx.clearRect(0, 0, width, height);
    const colors = getThemeColors();

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(colors);
    }

    // Connect close particles
    drawConnections(colors);

    animationFrameId = requestAnimationFrame(animate);
  }

  // Handle visibility change (pause when tab hidden to save resources)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      isTabVisible = false;
      cancelAnimationFrame(animationFrameId);
    } else {
      isTabVisible = true;
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  // Track mouse coordinates
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isActive = true;
  });

  window.addEventListener('mouseleave', function () {
    mouse.isActive = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Resize with debounce
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  // Cursor Spotlight Follower
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    let targetX = -500, targetY = -500;
    let currentX = -500, currentY = -500;

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function updateCursor() {
      // Smooth interpolation (lerp)
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;

      requestAnimationFrame(updateCursor);
    }
    updateCursor();
  }

  // Floating Study Icons Generator
  function initFloatingGlyphs() {
    const container = document.getElementById('floating-glyphs-container');
    if (!container) return;

    const icons = [
      'fa-book-open',
      'fa-lightbulb',
      'fa-pencil',
      'fa-atom',
      'fa-graduation-cap',
      'fa-brain',
      'fa-compass-drafting',
      'fa-code'
    ];

    const count = window.innerWidth < 768 ? 6 : 12;

    for (let i = 0; i < count; i++) {
      const glyph = document.createElement('i');
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      glyph.className = `fa-solid ${randomIcon} floating-glyph`;

      // Distribute horizontally
      glyph.style.left = `${Math.random() * 95}%`;
      // Random animation duration between 14s and 26s
      const duration = 14 + Math.random() * 12;
      glyph.style.animationDuration = `${duration}s`;
      // Random delay so they don't start synchronously
      glyph.style.animationDelay = `${Math.random() * 15}s`;
      // Random font size
      const size = 1.2 + Math.random() * 1.4;
      glyph.style.fontSize = `${size}rem`;

      container.appendChild(glyph);
    }
  }

  // Initialize
  resizeCanvas();
  initFloatingGlyphs();
  animate();
})();

