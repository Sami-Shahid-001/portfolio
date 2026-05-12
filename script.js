// ===== CUSTOM CURSOR =====
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
function animateCursor() {
  cursorDot.style.left = mouseX - 4 + 'px'; cursorDot.style.top = mouseY - 4 + 'px';
  ringX += (mouseX - ringX) * 0.15; ringY += (mouseY - ringY) * 0.15;
  cursorRing.style.left = ringX + 'px'; cursorRing.style.top = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();
document.querySelectorAll('a, button, .skill-pill, .project-card, .cert-card, .stat-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
});

// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
const backToTop = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  backToTop.classList.toggle('visible', window.scrollY > 500);
});

// ===== MOBILE MENU =====
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileOverlay = document.querySelector('.mobile-overlay');
function toggleMobile() {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  mobileOverlay.classList.toggle('active');
}
hamburger.addEventListener('click', toggleMobile);
mobileOverlay.addEventListener('click', toggleMobile);
document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', toggleMobile));

// ===== TYPING EFFECT =====
const typingEl = document.getElementById('typingText');
const phrases = ['Machine Learning Engineer', 'AI Automation Builder', 'Full-Stack Developer', "FAST-NUCES '28"];
let phraseIndex = 0, charIndex = 0, isDeleting = false;
function typeEffect() {
  const current = phrases[phraseIndex];
  typingEl.textContent = isDeleting ? current.substring(0, charIndex--) : current.substring(0, charIndex++);
  let delay = isDeleting ? 40 : 80;
  if (!isDeleting && charIndex > current.length) { delay = 2000; isDeleting = true; }
  else if (isDeleting && charIndex < 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 500; }
  setTimeout(typeEffect, delay);
}
typeEffect();

// ===== CANVAS PARTICLES =====
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.size = Math.random() * 2 + 0.5;
    this.speedY = -(Math.random() * 0.8 + 0.2);
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.6 + 0.1;
  }
  update() {
    this.y += this.speedY; this.x += this.speedX;
    if (this.y < -10) this.reset();
  }
  draw() {
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 245, 212, ${this.opacity})`; ctx.fill();
  }
}

const particleCount = Math.min(120, Math.floor(window.innerWidth / 12));
for (let i = 0; i < particleCount; i++) {
  const p = new Particle();
  p.y = Math.random() * canvas.height;
  particles.push(p);
}

function drawConstellations() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 245, 212, ${0.06 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConstellations();
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      if (entry.target.classList.contains('stat-card')) animateCounter(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCounter(card) {
  const numEl = card.querySelector('.stat-number');
  if (!numEl || numEl.dataset.animated) return;
  numEl.dataset.animated = 'true';
  const target = numEl.dataset.target;
  const isFloat = target.includes('.');
  const end = parseFloat(target);
  const duration = 1500;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * end;
    numEl.textContent = isFloat ? current.toFixed(1) : Math.floor(current) + (target.includes('+') ? '+' : '');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ===== BACK TO TOP =====
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });
sections.forEach(s => navObserver.observe(s));

// ===== STAGGER PROJECT CARDS =====
document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});
document.querySelectorAll('.cert-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});

// ===== DISABLE CUSTOM CURSOR ON TOUCH =====
if ('ontouchstart' in window) {
  document.body.style.cursor = 'auto';
  cursorDot.style.display = 'none';
  cursorRing.style.display = 'none';
}
