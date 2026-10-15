/* =============================================
   ANANT'S PORTFOLIO — JAVASCRIPT
   ============================================= */

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close menu when link clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ---- ACTIVE NAV LINK ----
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) {
      current = sec.getAttribute('id');
    }
  });
  navLinkEls.forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === current) {
      link.classList.add('active');
    }
  });
});

// ---- TYPEWRITER ----
const typewriterEl = document.getElementById('typewriter');
const phrases = [
  'Full-Stack Developer',
  'CSE Student',
  'Problem Solver',
  'Open Source Enthusiast',
  'UI/UX Craftsman',
];
let pIdx = 0, cIdx = 0, deleting = false;

function typewrite() {
  const current = phrases[pIdx];
  if (!deleting) {
    typewriterEl.textContent = current.slice(0, ++cIdx);
    if (cIdx === current.length) {
      deleting = true;
      setTimeout(typewrite, 1800);
      return;
    }
  } else {
    typewriterEl.textContent = current.slice(0, --cIdx);
    if (cIdx === 0) {
      deleting = false;
      pIdx = (pIdx + 1) % phrases.length;
    }
  }
  setTimeout(typewrite, deleting ? 60 : 100);
}
typewrite();

// ---- HERO CANVAS PARTICLE ANIMATION ----
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PARTICLE_COUNT = 80;
const particles = [];

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 2 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '0,212,255' : '139,92,246';
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `rgba(${this.color},1)`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${this.color},0.8)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

function drawConnections() {
  const DIST = 120;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < DIST) {
        const alpha = (1 - dist / DIST) * 0.15;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(139,92,246,1)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

let mouseX = -9999, mouseY = -9999;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    // Mouse repulsion
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      p.x += (dx / dist) * 1.5;
      p.y += (dy / dist) * 1.5;
    }
    p.update();
    p.draw();
  });
  drawConnections();
  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// ---- COUNTER ANIMATION ----
function animateCounter(el, target, duration = 1600) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

// ---- SCROLL REVEAL + COUNTERS + PROGRESS BARS ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');

      // Progress bars
      if (entry.target.classList.contains('pb-fill')) {
        entry.target.classList.add('animated');
      }

      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

// Observe reveal elements
document.querySelectorAll('.skill-category, .project-card, .timeline-card, .mini-card, .contact-item, .contact-form, .proficiency-bars').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Observe progress bars
document.querySelectorAll('.pb-fill').forEach(el => {
  revealObserver.observe(el);
});

// Counter observer
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-number');
      nums.forEach(num => {
        animateCounter(num, parseInt(num.dataset.target));
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// ---- PROJECT FILTER ----
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.4s ease both';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ---- CONTACT FORM ----
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('send-msg-btn');
  const success = document.getElementById('form-success');

  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Simulate sending
  setTimeout(() => {
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg> Message Sent!`;
    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    success.classList.add('visible');
    e.target.reset();

    setTimeout(() => {
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
      btn.style.background = '';
      btn.disabled = false;
      success.classList.remove('visible');
    }, 4000);
  }, 1200);
}

// ---- SMOOTH SCROLL FOR ALL ANCHOR LINKS ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- PARALLAX HERO ----
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-content');
  const heroVis = document.querySelector('.hero-visual');
  if (hero && window.scrollY < window.innerHeight) {
    const offset = window.scrollY * 0.3;
    hero.style.transform = `translateY(${offset}px)`;
    if (heroVis) heroVis.style.transform = `translateY(${offset * 0.5}px)`;
  }
});

// ---- TILT EFFECT FOR CODE WINDOW ----
const codeWindow = document.querySelector('.code-window');
if (codeWindow) {
  codeWindow.addEventListener('mousemove', (e) => {
    const rect = codeWindow.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    codeWindow.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
  });

  codeWindow.addEventListener('mouseleave', () => {
    codeWindow.style.transform = '';
  });
}
