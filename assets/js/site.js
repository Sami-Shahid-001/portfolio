/* Shared behaviour for every page: smooth scroll, header, menu, reveals. */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (!hasGsap) {
    // Libraries failed to load: show everything, keep native scrolling.
    root.classList.replace('js', 'no-js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------------- smooth scroll ---------------- */
  // Pages can register guards that see every wheel/touch event first; a guard
  // returning false keeps Lenis from scrolling (the guard handles the event itself).
  const inputGuards = [];
  const state = { programmatic: false };
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      virtualScroll: (data) => inputGuards.every((guard) => guard(data) !== false),
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const vh = () => window.innerHeight;
  const scrollY = () => (lenis ? lenis.scroll : window.scrollY);
  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  const anchorY = (el) => {
    const off = parseFloat(el.dataset.anchorOffset || '0');
    return Math.max(0, docTop(el) + (off / 100) * vh());
  };

  const scrollToY = (y, immediate = false) => {
    if (lenis) {
      const dist = Math.abs(y - lenis.scroll);
      // nav jumps pass straight through the stepped scenes without being caught by them
      state.programmatic = !immediate;
      lenis.scrollTo(y, {
        immediate,
        duration: Math.min(2.4, 0.9 + dist / 5000),
        easing: (t) => 1 - Math.pow(1 - t, 4),
        onComplete: () => (state.programmatic = false),
      });
    } else {
      window.scrollTo({ top: y, behavior: immediate || reduceMotion ? 'auto' : 'smooth' });
    }
  };

  /* ---------------- header ---------------- */
  const header = document.querySelector('.site-header');
  const progress = header ? header.querySelector('.nav-progress span') : null;
  const navLinks = [...document.querySelectorAll('.nav-link[data-section]')];
  const navDot = document.querySelector('.nav-dot');
  let toneRegions = [];
  let anchors = [];

  const measure = () => {
    toneRegions = [...document.querySelectorAll('[data-tone]:not(.site-header)')].map((el) => {
      const top = docTop(el);
      return { top, bottom: top + el.offsetHeight, tone: el.dataset.tone === 'night' ? 'night' : 'day' };
    });
    anchors = navLinks
      .map((a) => {
        const el = document.getElementById(a.dataset.section);
        return el ? { link: a, y: anchorY(el) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.y - b.y);
  };

  let lastY = 0;
  let currentLink = null;
  const placeDot = (link) => {
    if (!navDot || !link) return;
    const ul = link.closest('.nav-links');
    if (!ul) return;
    const x = link.offsetLeft + link.offsetWidth / 2 - 2.5;
    navDot.style.transform = `translateX(${x}px)`;
  };

  const onScroll = () => {
    const y = scrollY();
    if (!header) return;
    const menuOpen = root.classList.contains('menu-open');
    header.classList.toggle('is-compact', y > 40);
    if (!menuOpen) {
      if (y > lastY + 4 && y > 160) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y <= 160) header.classList.remove('is-hidden');
    }
    lastY = y;

    const probe = y + 44;
    const region = toneRegions.find((r) => probe >= r.top && probe < r.bottom);
    const tone = region ? region.tone : 'day';
    if (header.dataset.tone !== tone) header.dataset.tone = tone;

    if (progress) {
      const max = document.documentElement.scrollHeight - vh();
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    }

    if (anchors.length) {
      const line = y + vh() * 0.35;
      let active = anchors[0];
      for (const a of anchors) if (a.y <= line) active = a;
      if (active.link !== currentLink) {
        navLinks.forEach((l) => l.classList.toggle('is-active', l === active.link));
        currentLink = active.link;
        placeDot(currentLink);
      }
    }
  };

  if (lenis) lenis.on('scroll', onScroll);
  else window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- in-page links ---------------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToY(id === 'home' ? 0 : anchorY(target));
    history.replaceState(null, '', `#${id}`);
  });

  /* ---------------- email links ----------------
     A bare mailto: does nothing when no mail app is set up, so every email link opens a
     Gmail compose window (keeping any subject/body) and copies the address as a fallback. */
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let toastTimer = 0;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3200);
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="mailto:"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const url = new URL(a.getAttribute('href'));
    const to = decodeURIComponent(url.pathname);
    const params = new URLSearchParams({ view: 'cm', fs: '1', to });
    if (url.searchParams.get('subject')) params.set('su', url.searchParams.get('subject'));
    if (url.searchParams.get('body')) params.set('body', url.searchParams.get('body'));
    const win = window.open(`https://mail.google.com/mail/?${params}`, '_blank', 'noopener');
    const copied = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(to).then(() => true, () => false) : Promise.resolve(false);
    copied.then((ok) => {
      if (!win) window.location.href = a.getAttribute('href'); // pop-up blocked: fall back to the mail app
      showToast(ok ? `${to} copied to clipboard` : to);
    });
  });

  /* ---------------- mobile menu ---------------- */
  const menuBtn = document.querySelector('.menu-btn');
  const menuPanel = document.getElementById('site-menu');
  function openMenu() {
    root.classList.add('menu-open');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'true');
    menuPanel && menuPanel.setAttribute('aria-hidden', 'false');
    header && header.classList.remove('is-hidden');
    lenis && lenis.stop();
  }
  function closeMenu() {
    if (!root.classList.contains('menu-open')) return;
    root.classList.remove('menu-open');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
    menuPanel && menuPanel.setAttribute('aria-hidden', 'true');
    lenis && lenis.start();
  }
  menuBtn && menuBtn.addEventListener('click', () => (root.classList.contains('menu-open') ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
  window.addEventListener('resize', () => window.innerWidth >= 1024 && closeMenu());

  /* ---------------- reveals ---------------- */
  const setupReveals = () => {
    if (reduceMotion) {
      gsap.set('.reveal-up', { opacity: 1, y: 0 });
      gsap.set('.reveal-row .eyebrow', { opacity: 1 });
      gsap.set('.reveal-row .chapter-line', { scaleX: 1 });
      return;
    }
    ScrollTrigger.batch('.reveal-up', {
      start: 'top 90%',
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, overwrite: true }),
    });
    document.querySelectorAll('.reveal-row').forEach((row) => {
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%', once: true } })
        .to(row.querySelectorAll('.eyebrow'), { opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.08 }, 0)
        .to(row.querySelectorAll('.chapter-line'), { scaleX: 1, duration: 1.3, ease: 'expo.out' }, 0.1);
    });
  };

  /* ---------------- year ---------------- */
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------------- refresh plumbing ---------------- */
  const refresh = () => {
    measure();
    onScroll();
    // pages without in-page sections keep whichever link is marked active in the markup
    if (!anchors.length) currentLink = document.querySelector('.nav-link.is-active');
    placeDot(currentLink);
  };
  ScrollTrigger.addEventListener('refresh', refresh);

  const addInputGuard = (fn) => inputGuards.push(fn);

  window.Site = { lenis, reduceMotion, scrollToY, anchorY, refresh, setupReveals, vh, state, addInputGuard };

  // Pages register their own timelines, then call Site.ready().
  window.Site.ready = () => {
    setupReveals();
    const finish = () => {
      ScrollTrigger.refresh();
      refresh();
      if (location.hash) {
        const t = document.getElementById(location.hash.slice(1));
        if (t) scrollToY(location.hash === '#home' ? 0 : anchorY(t), true);
      }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(finish);
    else finish();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  };
})();
