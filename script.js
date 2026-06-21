document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // === Lenis Smooth Scroll ===
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // === Custom Cursor ===
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;
    follower.style.left = cursorX + 'px';
    follower.style.top = cursorY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .btn, .tab-trigger, .nav-link, .hamburger, .quote-card, .bench-card, .tab-card, .price-card, .verdict-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
  });

  // === Magnetic Buttons ===
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const magnet = btn.querySelector('[data-magnet]');
      if (magnet) {
        magnet.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      }
    });
    btn.addEventListener('mouseleave', () => {
      const magnet = btn.querySelector('[data-magnet]');
      if (magnet) magnet.style.transform = 'translate(0, 0)';
    });
  });

  // === Particle Canvas ===
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let pMouse = { x: -1000, y: -1000 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.sx = (Math.random() - 0.5) * 0.4;
      this.sy = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.4 + 0.1;
      this.hue = Math.random() > 0.5 ? 250 : 35;
    }
    update() {
      this.x += this.sx;
      this.y += this.sy;
      const dx = pMouse.x - this.x;
      const dy = pMouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.06;
        this.x -= dx * force;
        this.y -= dy * force;
      }
      if (this.x < 0 || this.x > canvas.width) this.sx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.sy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.alpha})`;
      ctx.fill();
    }
  }

  const pCount = Math.min(60, Math.floor(window.innerWidth * 0.06));
  for (let i = 0; i < pCount; i++) particles.push(new Particle());

  let pMouseTimeout;
  document.addEventListener('mousemove', (e) => {
    pMouse.x = e.clientX;
    pMouse.y = e.clientY;
    clearTimeout(pMouseTimeout);
    pMouseTimeout = setTimeout(() => { pMouse.x = -1000; pMouse.y = -1000; }, 2000);
  });

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `hsla(250, 70%, 60%, ${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // === Scroll Reveal ===
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // === Benchmark Bars ===
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.bench-fill').forEach(bar => {
          bar.classList.add('visible');
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.bench-card').forEach(el => barObserver.observe(el));

  // === Tabs ===
  const triggers = document.querySelectorAll('.tab-trigger');
  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      triggers.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // === Navbar ===
  const navbar = document.querySelector('.navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });

  // === Hamburger ===
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // === Nav link smooth scroll (compatible with Lenis) ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  });

  // === Parallax hero ===
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && sy < window.innerHeight) {
      heroContent.style.transform = `translateY(${sy * 0.12}px)`;
      heroContent.style.opacity = 1 - sy / (window.innerHeight * 0.7);
    }
  });

  console.log('%c OpenCode vs Claude Code ', 'background:#6363f1;color:#fff;padding:8px 16px;border-radius:4px;font-weight:bold;font-size:14px');
  console.log('%c Data synthesized from Matthew Berman, XDA, ComputingForGeeks, ByteIota, Morphllm, Dr. Amit Ray & more', 'color:#a78bfa');
});
