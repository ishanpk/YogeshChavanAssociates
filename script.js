/**
 * Yogesh Chavan Associates — Main Script
 * Vanilla JS + GSAP ScrollTrigger + Lenis smooth scroll
 * All animations use transform/opacity only for GPU acceleration.
 * Lenis disabled on mobile (<768px) for iOS momentum scroll perf.
 */

(function () {
  'use strict';

  /* --- State --- */
  let projects = [];
  let team = [];
  let featuredProject = null;
  let lenis = null;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let isDesktop = window.innerWidth >= 1024;

  /* --- DOM Refs --- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* =========================================================================
     INIT
     ========================================================================= */
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    $('#year').textContent = new Date().getFullYear();

    await loadData();
    renderFeatured();
    renderPortfolio();
    renderTeam();
    initNav();
    initHero();
    initScrollProgress();
    initCounters();
    initProcessObserver();
    initTestimonials();
    initLightbox();
    initContactForm();
    initThemeToggle();
    initMobileCta();

    if (!reducedMotion) {
      initSmoothScroll();
      initCustomCursor();
      initMagneticButtons();
      if (isDesktop) initFeaturedScrollTrigger();
    }

    window.addEventListener('resize', debounce(onResize, 250));
  }

  /* =========================================================================
     DATA LOADING
     ========================================================================= */
  async function loadData() {
    try {
      const [projRes, teamRes] = await Promise.all([
        fetch('projects.json'),
        fetch('team.json')
      ]);
      projects = await projRes.json();
      team = await teamRes.json();
      featuredProject = projects.find(p => p.featured) || projects[0];
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  /* =========================================================================
     FEATURED PROJECT — Desktop horizontal + Mobile vertical
     ========================================================================= */
  function renderFeatured() {
    if (!featuredProject) return;

    const { title, description, location, category, area, year, status, chapters } = featuredProject;

    $('#featured-title').textContent = title;
    $('#featured-desc').textContent = description;

    const metaEl = $('#featured-meta');
    if (metaEl) {
      metaEl.innerHTML = [location, category, area, year, status]
        .filter(t => t && t !== '—')
        .map(t => `<span class="meta-tag">${t}</span>`)
        .join('');
    }

    /* Chapter progress dots */
    const progressEl = $('#featured-progress');
    if (progressEl && chapters?.length) {
      progressEl.innerHTML = chapters.map((_, i) =>
        `<button class="featured__progress-dot${i === 0 ? ' featured__progress-dot--active' : ''}" data-chapter="${i}" role="tab" aria-label="Chapter ${i + 1} of ${chapters.length}"></button>`
      ).join('');
    }

    /* Desktop chapters */
    const track = $('#featured-track');
    if (track && chapters) {
      track.innerHTML = chapters.map((ch, i) => `
        <div class="featured__chapter" data-chapter="${i}">
          <div class="featured__chapter-img">
            <img src="${ch.image}" alt="${title} — ${ch.title}, ${location}" loading="lazy" width="1600" height="900">
          </div>
          <div class="featured__chapter-text">
            <h3>${ch.title}</h3>
            <p>${ch.text}</p>
          </div>
        </div>
      `).join('');
    }

    /* Mobile chapters */
    const mobile = $('#featured-mobile');
    if (mobile && chapters) {
      mobile.innerHTML = chapters.map((ch, i) => `
        <div class="featured__mobile-chapter" data-chapter="${i}">
          <div class="featured__mobile-img">
            <img src="${ch.image}" alt="${title} — ${ch.title}" loading="lazy" width="800" height="600">
          </div>
          <div class="featured__mobile-text">
            <h3>${ch.title}</h3>
            <p>${ch.text}</p>
          </div>
        </div>
      `).join('');
    }

    /* Gallery CTA */
    const galleryBtn = $('#featured-gallery-btn');
    if (galleryBtn) {
      galleryBtn.addEventListener('click', () => {
        openLightbox(featuredProject.gallery, featuredProject.title, 0, {
          category: featuredProject.category,
          location: featuredProject.location,
          year: featuredProject.year
        });
      });
    }
  }

  /**
   * GSAP ScrollTrigger — pinned horizontal scroll sequence (desktop only)
   * Converts vertical scroll into horizontal pan through project chapters.
   */
  function initFeaturedScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (!featuredProject?.chapters?.length) return;

    gsap.registerPlugin(ScrollTrigger);

    const sequence = $('#featured-sequence');
    const track = $('#featured-track');
    const chapters = $$('.featured__chapter', track);
    if (!sequence || !track || !chapters.length) return;

    const totalWidth = chapters.length * window.innerWidth;

    gsap.to(track, {
      x: () => -(totalWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: sequence,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const activeIdx = Math.min(
            Math.floor(progress * chapters.length),
            chapters.length - 1
          );
          chapters.forEach((ch, i) => {
            ch.classList.toggle('featured__chapter--active', i === activeIdx);
          });
          updateFeaturedProgress(activeIdx);
        }
      }
    });

    /* Parallax on chapter images */
    chapters.forEach(ch => {
      const img = $('img', ch);
      if (!img) return;
      gsap.to(img, {
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: ch,
          containerAnimation: gsap.getById ? undefined : undefined,
          start: 'left right',
          end: 'right left',
          scrub: true
        }
      });
    });

    chapters[0]?.classList.add('featured__chapter--active');
    updateFeaturedProgress(0);
  }

  function updateFeaturedProgress(activeIdx) {
    $$('.featured__progress-dot').forEach((dot, i) => {
      dot.classList.toggle('featured__progress-dot--active', i === activeIdx);
      dot.setAttribute('aria-selected', String(i === activeIdx));
    });
  }

  /* =========================================================================
     PORTFOLIO GRID
     ========================================================================= */
  function renderPortfolio() {
    const grid = $('#work-grid');
    if (!grid) return;

    grid.innerHTML = projects
      .filter(p => !p.featured || true) /* show all including featured */
      .map(p => `
        <article class="project-card" role="listitem" tabindex="0"
          data-category="${p.category}" data-id="${p.id}">
          <div class="project-card__img">
            <img src="${p.thumbnail}" alt="${p.title} — ${p.category} in ${p.location}" loading="lazy" width="800" height="1000">
            <div class="project-card__overlay">
              <h3 class="project-card__title">${p.title}</h3>
              <p class="project-card__meta">${p.category} · ${p.year}</p>
            </div>
          </div>
        </article>
      `).join('');

    /* Filter buttons */
    $$('.work__filter').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.work__filter').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        filterProjects(btn.dataset.filter);
      });
    });

    /* Card interactions */
    $$('.project-card', grid).forEach(card => {
      card.addEventListener('click', () => handleProjectClick(card));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleProjectClick(card);
        }
      });
      /* Mobile tap overlay */
      if (isTouch) {
        card.addEventListener('touchstart', () => {
          $$('.project-card--tapped', grid).forEach(c => c.classList.remove('project-card--tapped'));
          card.classList.add('project-card--tapped');
        }, { passive: true });
      }
    });

    initPortfolioObserver();
  }

  function filterProjects(category) {
    $$('.project-card').forEach(card => {
      const match = category === 'all' || card.dataset.category === category;
      card.style.display = match ? '' : 'none';
      if (match) card.classList.remove('project-card--visible');
    });
    /* Re-trigger observer for newly visible cards */
    initPortfolioObserver();
  }

  function handleProjectClick(card) {
    const id = card.dataset.id;
    const project = projects.find(p => p.id === id);
    if (!project) return;
    openLightbox(project.gallery, project.title, 0, {
      category: project.category,
      location: project.location,
      year: project.year
    });
  }

  /** IntersectionObserver — fade-in project cards on scroll */
  function initPortfolioObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('project-card--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    $$('.project-card').forEach(card => {
      if (card.style.display !== 'none') observer.observe(card);
    });
  }

  /* =========================================================================
     TEAM
     ========================================================================= */
  function renderTeam() {
    const grid = $('#team-grid');
    if (!grid) return;

    grid.innerHTML = team.map(member => `
      <article class="team-card${member.featured ? ' team-card--featured' : ''}"
        role="listitem" tabindex="0" data-id="${member.id}">
        <div class="team-card__photo">
          <img src="${member.photo}" alt="${member.name}, ${member.role}" loading="lazy" width="600" height="750">
        </div>
        <div class="team-card__info">
          <h3 class="team-card__name">${member.name}</h3>
          <p class="team-card__role">${member.role}</p>
          <p class="team-card__bio">${member.bio}</p>
        </div>
        ${member.linkedin ? `<a href="${member.linkedin}" class="team-card__linkedin" target="_blank" rel="noopener" aria-label="${member.name} on LinkedIn" onclick="event.stopPropagation()">
          <img src="assets/icons/linkedin.svg" alt="" width="18" height="18">
        </a>` : ''}
      </article>
    `).join('');

    $$('.team-card', grid).forEach(card => {
      card.addEventListener('click', () => openTeamPanel(card.dataset.id));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter') openTeamPanel(card.dataset.id);
      });
    });
  }

  function openTeamPanel(id) {
    const member = team.find(m => m.id === id);
    if (!member) return;

    const panel = $('#team-panel');
    const { fullBio } = member;

    $('.team-panel__photo', panel).src = member.photo;
    $('.team-panel__photo', panel).alt = member.name;
    $('#team-panel-name').textContent = member.name;
    $('.team-panel__role', panel).textContent = member.role;

    $('.team-panel__details', panel).innerHTML = `
      <p><strong>Education:</strong> ${fullBio.education}</p>
      <p><strong>Specialization:</strong> ${fullBio.specialization}</p>
      <p><strong>Notable Projects:</strong> ${fullBio.notableProjects.join(', ')}</p>
      <blockquote>"${fullBio.quote}"</blockquote>
    `;

    panel.classList.add('team-panel--open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeTeamPanel() {
    const panel = $('#team-panel');
    panel.classList.remove('team-panel--open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  $('.team-panel__close')?.addEventListener('click', closeTeamPanel);
  $('.team-panel__overlay')?.addEventListener('click', closeTeamPanel);

  /* =========================================================================
     NAVIGATION
     ========================================================================= */
  function initNav() {
    const nav = $('#nav');
    const hamburger = $('.nav__hamburger');
    const mobileMenu = $('#mobile-menu');

    /* Scroll: transparent → solid */
    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Hamburger toggle */
    hamburger?.addEventListener('click', () => {
      const open = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!open));
      mobileMenu.classList.toggle('mobile-menu--open', !open);
      mobileMenu.setAttribute('aria-hidden', String(open));
      document.body.style.overflow = open ? '' : 'hidden';
    });

    /* Close mobile menu on link click */
    $$('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('mobile-menu--open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    /* Smooth anchor scroll */
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = $(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        scrollToEl(target);
      });
    });
  }

  function scrollToEl(el) {
    if (lenis) {
      lenis.scrollTo(el, { offset: -parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || 64) });
    } else {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  /* =========================================================================
     HERO — Split text reveal + Ken Burns rotation
     ========================================================================= */
  function initHero() {
    if (reducedMotion) {
      $$('.hero__eyebrow, .hero__tagline, .hero__ctas, .hero__scroll').forEach(el => {
        el.style.opacity = '1';
      });
      return;
    }

    splitTextReveal();
    animateHeroEntrance();

    /* Auto-rotate hero slides every 6s */
    const slides = $$('.hero__slide');
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove('hero__slide--active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('hero__slide--active');
    }, 6000);
  }

  /** Vanilla split-text: wrap each character in a span for staggered reveal */
  function splitTextReveal() {
    const title = $('.hero__title');
    if (!title) return;

    $$('.hero__title-line', title).forEach(line => {
      const text = line.textContent;
      line.textContent = '';
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transitionDelay = `${i * 0.03}s`;
        line.appendChild(span);
      });
    });

    requestAnimationFrame(() => {
      $$('.hero__title .char').forEach(char => {
        char.style.opacity = '1';
        char.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  function animateHeroEntrance() {
    const elements = [
      { el: $('.hero__eyebrow'), delay: 800 },
      { el: $('.hero__tagline'), delay: 1400 },
      { el: $('.hero__ctas'), delay: 1800 },
      { el: $('.hero__scroll'), delay: 2200 }
    ];

    elements.forEach(({ el, delay }) => {
      if (!el) return;
      el.style.transition = `opacity 1s ${delay}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      requestAnimationFrame(() => { el.style.opacity = '1'; });
    });
  }

  /* =========================================================================
     SCROLL PROGRESS BAR
     ========================================================================= */
  function initScrollProgress() {
    const bar = $('.scroll-progress__bar');
    const progress = $('.scroll-progress');
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${pct}%`;
      progress?.setAttribute('aria-valuenow', Math.round(pct));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* =========================================================================
     STATS COUNTERS
     ========================================================================= */
  function initCounters() {
    const stats = $('#stats');
    if (!stats) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('.stats__number', stats).forEach(el => {
          const target = parseInt(el.dataset.count, 10);
          if (isNaN(target)) return;
          animateCounter(el, target);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    observer.observe(stats);
  }

  function animateCounter(el, target) {
    if (reducedMotion) {
      el.textContent = target + '+';
      return;
    }
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + '+';
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* =========================================================================
     PROCESS — Intersection entrance
     ========================================================================= */
  function initProcessObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('process__step--visible'), i * 150);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    $$('.process__step').forEach(step => observer.observe(step));
  }

  /* =========================================================================
     TESTIMONIALS CAROUSEL — Touch swipe + dots
     ========================================================================= */
  function initTestimonials() {
    const carousel = $('#testimonials-carousel');
    const track = $('.testimonials__track', carousel);
    const testimonials = $$('.testimonial', track);
    const dotsContainer = $('.testimonials__dots', carousel);
    if (!track || !testimonials.length) return;

    let current = 0;
    let slidesPerView = 1;

    function getSlidesPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function update() {
      slidesPerView = getSlidesPerView();
      const maxIndex = Math.max(0, testimonials.length - slidesPerView);
      current = Math.min(current, maxIndex);
      const slideWidth = 100 / slidesPerView;
      track.style.transform = `translate3d(-${current * slideWidth}%, 0, 0)`;
      testimonials.forEach(t => { t.style.flex = `0 0 ${slideWidth}%`; });
      renderDots(maxIndex);
    }

    function renderDots(maxIndex) {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.className = `testimonials__dot${i === current ? ' testimonials__dot--active' : ''}`;
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.addEventListener('click', () => { current = i; update(); });
        dotsContainer.appendChild(dot);
      }
    }

    /* Pointer swipe */
    let startX = 0;
    let isDragging = false;

    track.addEventListener('pointerdown', e => {
      startX = e.clientX;
      isDragging = true;
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointerup', e => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.clientX;
      const maxIndex = Math.max(0, testimonials.length - slidesPerView);
      if (diff > 50 && current < maxIndex) current++;
      else if (diff < -50 && current > 0) current--;
      update();
    });

    update();
    window.addEventListener('resize', debounce(update, 200));
  }

  /* =========================================================================
     LIGHTBOX — Swipeable gallery
     ========================================================================= */
  let lightboxImages = [];
  let lightboxIndex = 0;
  let lightboxMeta = {};

  function initLightbox() {
    const lb = $('#lightbox');
    $('.lightbox__close', lb)?.addEventListener('click', closeLightbox);
    $('.lightbox__prev', lb)?.addEventListener('click', () => navigateLightbox(-1));
    $('.lightbox__next', lb)?.addEventListener('click', () => navigateLightbox(1));

    /* ESC key */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeLightbox();
        closeTeamPanel();
        closeMobileMenu();
      }
    });

    /* Swipe */
    let startX = 0;
    lb?.addEventListener('pointerdown', e => { startX = e.clientX; });
    lb?.addEventListener('pointerup', e => {
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 50) navigateLightbox(diff > 0 ? 1 : -1);
    });

    /* Click outside image to close */
    lb?.addEventListener('click', e => {
      if (e.target === lb) closeLightbox();
    });
  }

  function openLightbox(images, title, index, meta = {}) {
    lightboxImages = images;
    lightboxIndex = index;
    lightboxMeta = { ...meta, title };
    updateLightboxImage();

    const lb = $('#lightbox');
    lb.classList.add('lightbox--open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lb = $('#lightbox');
    lb.classList.remove('lightbox--open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const img = $('.lightbox__img');
    if (!img) return;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = lightboxImages[lightboxIndex];
      img.alt = `${lightboxMeta.title || ''} — image ${lightboxIndex + 1}`;
      img.style.opacity = '1';
    }, 150);

    const titleEl = $('.lightbox__title');
    if (titleEl) titleEl.textContent = lightboxMeta.title || '';
    $('.lightbox__meta').textContent = [lightboxMeta.category, lightboxMeta.location, lightboxMeta.year]
      .filter(Boolean).join(' · ');
    $('.lightbox__counter').textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
  }

  /* =========================================================================
     CONTACT FORM
     ========================================================================= */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const status = $('.form-status', form);

      if (!form.checkValidity()) {
        status.textContent = 'Please fill in all required fields.';
        status.className = 'form-status form-status--error';
        return;
      }

      status.textContent = 'Sending…';
      status.className = 'form-status';

      const action = form.action;
      if (action.includes('YOUR_ID')) {
        /* Fallback to mailto when Formspree not configured */
        const data = new FormData(form);
        const body = [...data.entries()].map(([k, v]) => `${k}: ${v}`).join('\n');
        window.location.href = `mailto:info@yogeshchavanassociates.com?subject=Project Inquiry&body=${encodeURIComponent(body)}`;
        status.textContent = 'Opening your email client…';
        status.className = 'form-status form-status--success';
        return;
      }

      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          status.textContent = 'Thank you! We\'ll be in touch shortly.';
          status.className = 'form-status form-status--success';
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        status.textContent = 'Something went wrong. Please call or WhatsApp us directly.';
        status.className = 'form-status form-status--error';
      }
    });
  }

  /* =========================================================================
     SMOOTH SCROLL — Lenis (desktop only)
     ========================================================================= */
  function initSmoothScroll() {
    if (typeof Lenis === 'undefined' || isTouch || window.innerWidth < 768) return;

    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    /* Sync GSAP ScrollTrigger with Lenis */
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* =========================================================================
     CUSTOM CURSOR (desktop, non-touch)
     ========================================================================= */
  function initCustomCursor() {
    if (isTouch) return;
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    if (!cursor) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    $$('a, button, [tabindex]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
    });
  }

  /* =========================================================================
     MAGNETIC BUTTONS (desktop only)
     ========================================================================= */
  function initMagneticButtons() {
    if (isTouch) return;

    $$('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate3d(${x * 0.2}px, ${y * 0.2}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  /* =========================================================================
     THEME TOGGLE
     ========================================================================= */
  function initThemeToggle() {
    const toggle = $('.theme-toggle');
    if (!toggle) return;

    const saved = localStorage.getItem('yca-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      if (next === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('yca-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('yca-theme', 'dark');
      }
    });
  }

  /* =========================================================================
     MOBILE CTA BAR — appears after scrolling past hero
     ========================================================================= */
  function initMobileCta() {
    const bar = $('#mobile-cta');
    const hero = $('#hero');
    if (!bar || !hero) return;

    const observer = new IntersectionObserver(([entry]) => {
      bar.classList.toggle('mobile-cta--visible', !entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(hero);
  }

  /* =========================================================================
     UTILITIES
     ========================================================================= */
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function onResize() {
    const wasDesktop = isDesktop;
    isDesktop = window.innerWidth >= 1024;

    if (wasDesktop !== isDesktop && !reducedMotion) {
      /* Refresh ScrollTrigger on breakpoint change */
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(st => st.kill());
        if (isDesktop) initFeaturedScrollTrigger();
      }
    }
  }

  function closeMobileMenu() {
    const hamburger = $('.nav__hamburger');
    const mobileMenu = $('#mobile-menu');
    if (hamburger?.getAttribute('aria-expanded') === 'true') {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu?.classList.remove('mobile-menu--open');
      mobileMenu?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

})();
