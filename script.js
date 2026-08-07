(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  /* ================= Preloader ================= */
  const preloader = document.getElementById('preloader');
  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 800);
  }
  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 3500);

  /* ================= Footer year ================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ================= Typing effect ================= */
  const typingTexts = ['Full-Stack Python Engineer', 'Django Developer', 'AI Agent Architect', 'Database Whisperer'];
  const typingElement = document.getElementById('typing-text');
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    if (!typingElement) return;
    const currentText = typingTexts[textIndex];
    charIndex += isDeleting ? -1 : 1;
    typingElement.textContent = currentText.substring(0, charIndex);

    let typeSpeed = isDeleting ? 45 : 85;

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % typingTexts.length;
      typeSpeed = 450;
    }

    setTimeout(typeEffect, typeSpeed);
  }
  typeEffect();

  /* ================= Mobile nav ================= */
  function toggleMobileNav() {
    const nav = document.getElementById('mobileNav');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  }
  window.toggleMobileNav = toggleMobileNav;
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      const nav = document.getElementById('mobileNav');
      nav.style.display = 'none';
    }
  });

  /* ================= Scroll: progress, nav, active link, back-to-top ================= */
  const progressBar = document.getElementById('scrollProgress');
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('backToTop');
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-links a');
  let ticking = false;

  function updateScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;

    if (progressBar) progressBar.style.width = pct + '%';
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 600);
      backToTop.style.setProperty('--p', Math.round(pct));
    }

    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 220) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === '#' + current;
      link.classList.toggle('active', isActive);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ================= Fade-in on scroll (Re-triggers on scroll down) ================= */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in, .fade-left, .fade-right').forEach(el => {
    revealObserver.observe(el);
  });

  /* ================= Animated counters ================= */
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = parseInt(entry.target.dataset.target, 10);
      const suffix = target === 99 ? '%' : '+';
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        entry.target.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          entry.target.textContent = target + suffix;
        }
      }

      window.requestAnimationFrame(tick);
      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));

  /* ================= Particles network ================= */
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    const colors = ['99, 102, 241', '139, 92, 246', '16, 185, 129', '245, 158, 11'];
    const LINK_DIST = 130;
    let width = 0;
    let height = 0;
    let dots = [];
    let raf = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.max(35, Math.floor((width * height) / 16000)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.6,
        c: colors[(Math.random() * colors.length) | 0],
        a: Math.random() * 0.5 + 0.25
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -10) d.x = width + 10;
        if (d.x > width + 10) d.x = -10;
        if (d.y < -10) d.y = height + 10;
        if (d.y > height + 10) d.y = -10;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + d.c + ',' + d.a + ')';
        ctx.fill();
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = 'rgba(0,212,255,' + ((1 - dist / LINK_DIST) * 0.16) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = window.requestAnimationFrame(step);
    }

    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
    }

    function start() {
      if (!raf) raf = window.requestAnimationFrame(step);
    }

    resize();
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
  }
  initParticles();

  /* ================= Custom cursor ================= */
  function initCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring || prefersReducedMotion || isCoarse) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseover', e => {
      const target = e.target;
      const overInput = target.closest('input, textarea, select');
      const interactive = target.closest('a, button, .tilt, .contact-item, .holo-card');
      ring.classList.toggle('cursor-hover', !!interactive);
      ring.classList.toggle('cursor-hidden', !!overInput);
      dot.classList.toggle('cursor-hidden', !!overInput);
    });

    (function follow() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      window.requestAnimationFrame(follow);
    })();
  }
  initCursor();

  /* ================= Hero parallax ================= */
  function initParallax() {
    const hero = document.getElementById('hero');
    const layers = document.querySelectorAll('[data-depth]');
    if (!hero || !layers.length || prefersReducedMotion || isCoarse) return;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.depth) || 10;
        layer.style.transform = 'translate3d(' + (dx * depth).toFixed(1) + 'px,' + (dy * depth).toFixed(1) + 'px,0)';
      });
    });

    hero.addEventListener('mouseleave', () => {
      layers.forEach(layer => { layer.style.transform = ''; });
    });
  }
  initParallax();

  /* ================= 3D tilt ================= */
  function initTilt() {
    if (prefersReducedMotion || isCoarse) return;
    document.querySelectorAll('.tilt').forEach(card => {
      let raf = null;
      card.addEventListener('mousemove', e => {
        if (raf) return;
        raf = window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform =
            'perspective(900px) rotateX(' + (-py * 8).toFixed(2) + 'deg) rotateY(' + (px * 10).toFixed(2) + 'deg) translateY(-6px)';
          raf = null;
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  initTilt();

  /* ================= Contact form ================= */
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message, type) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('error');
    if (type === 'error') toast.classList.add('error');
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const fields = ['name', 'email', 'subject', 'message'].map(id => document.getElementById(id));

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      fields.forEach(field => {
        const value = field.value.trim();
        const isEmpty = value === '';
        const isBadEmail = field.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const invalid = isEmpty || isBadEmail;

        field.classList.toggle('error', invalid);
        if (invalid) {
          valid = false;
          field.classList.add('shake');
          setTimeout(() => field.classList.remove('shake'), 500);
        }
      });

      if (!valid) {
        showToast('Please fill in all fields with valid details.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Send form data directly to sabingautam05@gmail.com via Web3Forms API
      // Get your free access key instantly at https://web3forms.com/
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '47fdd710-5043-488b-aac5-cf75e430c148', // Replace with your free access key from web3forms.com
          subject: `Inquiry: ${fields[2].value.trim()} (${fields[0].value.trim()})`,
          from_name: 'Sabin Gautam Portfolio',
          replyto: fields[1].value.trim(),
          name: fields[0].value.trim(),
          email: fields[1].value.trim(),
          message: fields[3].value.trim()
        })
      })
      .then(async response => {
        const json = await response.json();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        if (response.status === 200) {
          form.reset();
          showToast('Message sent successfully! Check your inbox.', 'success');
        } else {
          showToast(json.message || 'Something went wrong. Please try again.', 'error');
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        showToast('Network error. Please email me directly at sabingautam05@gmail.com', 'error');
      });
    });

    fields.forEach(field => {
      field.addEventListener('input', () => field.classList.remove('error'));
    });
  }

  /* ================= Theme Toggle ================= */
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    htmlEl.classList.add('light-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      htmlEl.classList.toggle('light-mode');
      const isLight = htmlEl.classList.contains('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  /* ================= Three.js 3D Portrait & Hero Animation ================= */
  function initThreeJS() {
    const container = document.getElementById('three-container');
    if (!container || typeof THREE === 'undefined' || prefersReducedMotion) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 3.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 3, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00d4ff, 3, 50);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    let portraitMesh = null;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('image.png', texture => {
      const staticImg = document.querySelector('.avatar-portrait img');
      if (staticImg) staticImg.style.opacity = '0';

      const geometry = new THREE.PlaneGeometry(2.3, 2.3, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      portraitMesh = new THREE.Mesh(geometry, material);
      scene.add(portraitMesh);
    }, undefined, () => {
      const geometry = new THREE.TorusKnotGeometry(1.1, 0.35, 128, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x00d4ff,
        wireframe: true,
        roughness: 0.2,
        metalness: 0.8
      });
      portraitMesh = new THREE.Mesh(geometry, material);
      scene.add(portraitMesh);
    });

    renderer.domElement.addEventListener('mousedown', e => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (portraitMesh) {
        if (!isDragging) {
          targetRotationY += (mouseX * 0.8 - targetRotationY) * 0.05;
          targetRotationX += (mouseY * 0.8 - targetRotationX) * 0.05;
          portraitMesh.rotation.y = time * 0.15 + targetRotationY;
          portraitMesh.rotation.x = targetRotationX;
        } else {
          portraitMesh.rotation.y = targetRotationY;
          portraitMesh.rotation.x = targetRotationX;
        }

        const scale = 1 + Math.sin(time * 1.5) * 0.03;
        portraitMesh.scale.set(scale, scale, scale);
      }

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }
  initThreeJS();
})();
