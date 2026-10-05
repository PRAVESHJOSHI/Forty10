/* ============================================================
   FORTY10 — script.js
   Nav · Scroll reveal · Counters · Smooth scroll ·
   Active nav · Form validation · Cursor glow ·
   Back-to-top · Stagger animations
   ============================================================ */

'use strict';

/* ---------- Helpers ---------- */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. NAV — scroll state + mobile toggle
   ============================================================ */
(function initNav() {
  const nav      = qs('#nav');
  const toggle   = qs('#navToggle');
  const links    = qs('#navLinks');
  const navLinks = qsa('.nav__link', links);

  if (!nav) return;

  // Scrolled class
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile open / close
  const openMenu = () => {
    links.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    links.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () =>
    links.classList.contains('open') ? closeMenu() : openMenu()
  );

  // Close on nav link click, outside click, or ESC
  navLinks.forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (links.classList.contains('open') &&
        !links.contains(e.target) &&
        !toggle.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();


/* ============================================================
   2. HERO LINES — entrance animation (runs once on load)
   ============================================================ */
(function initHeroLines() {
  const lines = qsa('.hero__headline .line');
  const badge = qs('.hero__badge');
  const sub   = qs('.hero__sub');
  const acts  = qs('.hero__actions');

  // Set initial hidden state — skip the generic .reveal class for these
  const items = [badge, ...lines, sub, acts].filter(Boolean);
  items.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';
    // Remove .reveal so IntersectionObserver doesn't double-fire
    el.classList.remove('reveal');
  });

  // Trigger staggered entrance after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      items.forEach((el, i) => {
        el.style.transitionDelay = `${0.1 + i * 0.12}s`;
        el.style.opacity         = '1';
        el.style.transform       = 'translateY(0)';
      });
    });
  });
})();


/* ============================================================
   3. SCROLL REVEAL — IntersectionObserver
   ============================================================ */
(function initReveal() {
  const elements = qsa('.reveal');
  if (!elements.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => io.observe(el));
})();


/* ============================================================
   4. SERVICE & PROCESS CARD STAGGER
   ============================================================ */
(function initStagger() {
  // Service cards
  qsa('.service-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.07}s`;
  });
  // Process steps
  qsa('.process-step').forEach((step, i) => {
    step.style.transitionDelay = `${i * 0.12}s`;
  });
  // Work cards
  qsa('.work-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });
  // Testimonial cards
  qsa('.testi-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });
})();


/* ============================================================
   5. STAT COUNTER — animate when section scrolls into view
   ============================================================ */
(function initCounters() {
  const section  = qs('#stats');
  const counters = qsa('.stat-item__num');
  if (!section || !counters.length) return;

  let hasRun = false;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const run = el => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();
    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !hasRun) {
      hasRun = true;
      counters.forEach(run);
      io.disconnect();
    }
  }, { threshold: 0.3 });

  io.observe(section);
})();


/* ============================================================
   6. SMOOTH SCROLL — offset for fixed nav
   ============================================================ */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); e.preventDefault(); return; }
    const target = qs(id);
    if (!target) return;
    e.preventDefault();
    const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    const offset = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
})();


/* ============================================================
   7. ACTIVE NAV LINK — highlight current section
   ============================================================ */
(function initActiveLink() {
  const sections = qsa('section[id]');
  const links    = qsa('.nav__links .nav__link:not(.nav__link--cta)');
  if (!sections.length || !links.length) return;

  const mark = () => {
    const navH = 90;
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - navH - 60) current = sec.id;
    });
    links.forEach(l => {
      const href = l.getAttribute('href').replace('#', '');
      l.classList.toggle('active', href === current);
    });
  };

  window.addEventListener('scroll', mark, { passive: true });
  mark();
})();


/* ============================================================
   8. CONTACT FORM — validation & submit UX
   ============================================================ */
(function initContactForm() {
  const form = qs('#contactForm');
  if (!form) return;

  const showError = (input, msg) => {
    clearError(input);
    input.setAttribute('aria-invalid', 'true');
    const err = document.createElement('span');
    err.className   = 'form-error';
    err.textContent = msg;
    err.setAttribute('role', 'alert');
    err.style.cssText = 'display:block;font-size:0.8rem;color:#ff4757;margin-top:4px;';
    input.parentNode.appendChild(err);
    input.style.borderColor = '#ff4757';
  };

  const clearError = input => {
    input.removeAttribute('aria-invalid');
    input.style.borderColor = '';
    const prev = input.parentNode.querySelector('.form-error');
    if (prev) prev.remove();
  };

  const validate = () => {
    let valid = true;
    const name  = qs('#name',    form);
    const email = qs('#email',   form);
    const msg   = qs('#message', form);

    [name, email, msg].forEach(clearError);

    if (!name.value.trim()) {
      showError(name, 'Please enter your name.'); valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, 'Please enter a valid email address.'); valid = false;
    }
    if (msg.value.trim().length < 10) {
      showError(msg, 'Tell us a bit more (at least 10 characters).'); valid = false;
    }
    return valid;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    const btn = qs('[type="submit"]', form);
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    // Simulate async — replace with real fetch() call
    setTimeout(() => {
      btn.textContent         = '✓ Message sent!';
      btn.style.background    = '#2ecc71';
      btn.style.color         = '#fff';

      setTimeout(() => {
        form.reset();
        btn.textContent      = 'Send message →';
        btn.style.background = '';
        btn.style.color      = '';
        btn.disabled         = false;
      }, 4000);
    }, 1200);
  });

  qsa('input, textarea, select', form).forEach(f => {
    f.addEventListener('input', () => clearError(f));
  });
})();


/* ============================================================
   9. CURSOR GLOW — desktop only
   ============================================================ */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.setAttribute('aria-hidden', 'true');
  glow.style.cssText = [
    'position:fixed',
    'width:400px',
    'height:400px',
    'border-radius:50%',
    'background:radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 70%)',
    'pointer-events:none',
    'transform:translate(-50%,-50%)',
    'z-index:0',
    'opacity:0',
    'transition:opacity 0.5s ease',
    'will-change:left,top',
  ].join(';');
  document.body.appendChild(glow);

  let raf = null;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.left    = cx + 'px';
      glow.style.top     = cy + 'px';
      glow.style.opacity = '1';
      raf = null;
    });
  });

  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
})();


/* ============================================================
   10. WORK CARDS — keyboard accessibility
   ============================================================ */
(function initWorkCards() {
  qsa('.work-card[tabindex]').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
})();


/* ============================================================
   11. BACK TO TOP — show after 400px scroll
   ============================================================ */
(function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
