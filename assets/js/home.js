/* Home page scenes. Everything animates transform/opacity only. */
(() => {
  if (!window.Site || typeof gsap === 'undefined') return;
  const { reduceMotion } = window.Site;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const EXPO = 'expo.out';

  /* ---------------- toolkit rows (built from templates) ---------------- */
  $$('.tech-row').forEach((row, i) => {
    const tpl = document.getElementById(`tech-${i}`);
    if (!tpl) return;
    const words = [...tpl.content.querySelectorAll('li')].map((li) => li.textContent);
    const list = () => {
      const ul = document.createElement('ul');
      words.forEach((w) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${w}</span><i aria-hidden="true"></i>`;
        ul.appendChild(li);
      });
      return ul;
    };
    // four copies so a full screen is always covered while wrapping
    for (let k = 0; k < 4; k++) {
      const ul = list();
      if (k) ul.setAttribute('aria-hidden', 'true');
      row.appendChild(ul);
    }
  });

  /* ---------------- reduced motion: show final states, no pinning tricks ---------------- */
  if (reduceMotion) {
    gsap.set('.intro-fade,.intro-up,.intro-rail,.intro-name,.intro-portrait', { opacity: 1 });
    gsap.set('.about-line,.contact-line,.edu-h2-line,.distinction-word>span,.grade-item .grade', { yPercent: 0, y: 0 });
    gsap.set('.about-rule', { scaleX: 1 });
    gsap.set('.about-tail', { opacity: 1, y: 0 });
    gsap.set('.statement-rule', { scaleX: 1 });
    $$('.semester-marker:not(.is-next)').forEach((m) => m.classList.add('is-done'));
    $$('.sem-line').forEach((l) => l.classList.add('is-done'));
  }

  /* ---------------- intro (page load) ---------------- */
  const intro = () => {
    if (reduceMotion) return;
    const tl = gsap.timeline({ defaults: { ease: EXPO } });
    tl.to('.site-header .intro-fade', { opacity: 1, duration: 1, stagger: 0.04 }, 0.15)
      .fromTo('.hero-first.intro-name', { opacity: 0, yPercent: 38 }, { opacity: 1, yPercent: 0, duration: 1.4 }, 0.2)
      .fromTo('.hero-last.intro-name', { opacity: 0, yPercent: 38 }, { opacity: 1, yPercent: 0, duration: 1.4 }, 0.32)
      .fromTo('.intro-portrait', { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1.6 }, 0.35)
      .fromTo('.hero-role.intro-fade', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1 }, 0.5)
      .fromTo('.hero .intro-up', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.65)
      .fromTo('.intro-rail', { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 1, stagger: 0.07 }, 0.75);
  };

  /* ---------------- hero: name splits, portrait lifts, day turns to night ---------------- */
  const hero = () => {
    const rail = $('.hero-social-rail');
    // centring offsets owned by GSAP so they stay responsive while other props animate
    gsap.set(rail, { yPercent: -50, y: 0 });
    gsap.set('.hero-portrait', { xPercent: -50, x: 0 });
    if (reduceMotion) return;
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom bottom', scrub: true },
    })
      .to('.hero-rafay', { xPercent: -9, duration: 0.38 }, 0.12)
      .to('.hero-khattak', { xPercent: 9, duration: 0.38 }, 0.12)
      .to('.hero-portrait-inner', { scale: 1.16, duration: 0.7 }, 0.1)
      .to('.hero-portrait-inner', { yPercent: -18, duration: 0.45 }, 0.35)
      .to(['.hero-top', '.hero-supporting'], { opacity: 0, y: -18, duration: 0.34 }, 0.2)
      .to(rail, { x: 28, opacity: 0, duration: 0.34 }, 0.2)
      .to('.hero-night', { opacity: 1, duration: 0.27 }, 0.35)
      .to('.hero .day-copy', { opacity: 0, duration: 0.27 }, 0.35)
      .to('.hero .night-copy', { opacity: 1, duration: 0.27 }, 0.35)
      .to('.hero-halo', { opacity: 0, duration: 0.3 }, 0.5)
      .to(['.hero-rafay', '.hero-khattak'], { yPercent: -14, opacity: 0, duration: 0.28 }, 0.52)
      .to('.hero-portrait-inner', { opacity: 0, duration: 0.25 }, 0.55)
      .to('.hero-chapter', { opacity: 1, y: 0, duration: 0.3 }, 0.7);
  };

  /* ---------------- about: lines rise, rule draws, bio settles ---------------- */
  const about = () => {
    if (reduceMotion) return;
    gsap.set('.about-line', { yPercent: 106, y: 0 });
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#about', start: 'top -78%', end: 'bottom bottom', scrub: true },
    })
      .to('.about-line', { yPercent: 0, duration: 0.2, stagger: 0.09, ease: 'power3.out' }, 0)
      .to('.about-rule', { scaleX: 1, duration: 0.3, ease: 'power2.inOut' }, 0.42)
      .to('.about-tail', { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 0.52)
      .to({}, { duration: 0.26 });
  };

  /* ---------------- stepped scenes (stats + work) ---------------- */
  const stepper = ({ section, count, onChange, startOffset = '-100%' }) => {
    let index = 0;
    return ScrollTrigger.create({
      trigger: section,
      start: `top ${startOffset}`,
      end: 'bottom bottom',
      onUpdate(self) {
        const next = Math.min(count - 1, Math.floor(self.progress * count * 0.9999));
        if (next !== index) {
          const dir = next > index ? 1 : -1;
          onChange(next, index, dir);
          index = next;
        }
      },
      onLeaveBack() {
        if (index !== 0) {
          onChange(0, index, -1);
          index = 0;
        }
      },
    });
  };

  const stats = () => {
    const section = $('.scene-stats');
    const slides = $$('.stat-slide', section);
    const bar = $('.stat-progress', section);
    const parts = (s) => [$('.stat-value', s), $('.stat-meta', s)];
    slides.forEach((s, i) => gsap.set(parts(s), { yPercent: i ? 118 : 0, y: 0 }));
    if (reduceMotion) {
      slides.forEach((s, i) => i && gsap.set(s, { display: 'none' }));
      return null;
    }
    const st = stepper({
      section,
      count: slides.length,
      onChange(next, prev, dir) {
        gsap.to(parts(slides[prev]), { yPercent: -118 * dir, duration: 0.8, ease: 'power3.inOut', stagger: 0.05, overwrite: true });
        gsap.fromTo(parts(slides[next]), { yPercent: 118 * dir }, { yPercent: 0, duration: 1, ease: EXPO, stagger: 0.07, delay: 0.18, overwrite: true });
        bar.style.transform = `scaleX(${(next + 1) / slides.length})`;
      },
    });
    return { st, count: slides.length };
  };

  const work = () => {
    const section = $('#work');
    const slides = $$('.project-slide', section);
    const atmos = $$('.project-atmosphere', section);
    const bar = $('.work-progress', section);
    const count = $('.work-count', section);
    const lines = (s) => $$('.copy-line, .project-index', s);
    const visual = (s) => $('.project-visual', s);

    slides.forEach((s, i) => {
      s.classList.toggle('is-current', i === 0);
      if (i) {
        gsap.set(lines(s), { yPercent: 115, y: 0 });
        gsap.set(visual(s), { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 });
      } else {
        gsap.set(visual(s), { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
      }
    });
    atmos[0] && atmos[0].classList.add('is-active');

    const show = (next, prev, dir) => {
      const out = slides[prev];
      const inn = slides[next];
      atmos.forEach((a, i) => a.classList.toggle('is-active', i === next));
      bar.style.transform = `scaleX(${(next + 1) / slides.length})`;
      count.textContent = String(next + 1).padStart(2, '0');

      if (reduceMotion) {
        out.classList.remove('is-current');
        inn.classList.add('is-current');
        gsap.set(lines(inn), { yPercent: 0 });
        gsap.set(visual(inn), { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
        return;
      }

      // anything that is neither leaving nor arriving is put away immediately
      slides.forEach((s, i) => {
        if (i !== next && i !== prev) {
          gsap.killTweensOf([...lines(s), visual(s)]);
          s.classList.remove('is-current');
        }
      });
      gsap.killTweensOf([...lines(out), visual(out), ...lines(inn), visual(inn)]);
      gsap.delayedCall(0.85, () => out !== slides[current] && out.classList.remove('is-current'));
      gsap.timeline()
        .to(lines(out), { yPercent: -115 * dir, duration: 0.7, ease: 'power3.in', stagger: 0.025 }, 0)
        .to(visual(out), { clipPath: dir > 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)', scale: 0.96, duration: 0.8, ease: 'power3.inOut' }, 0);

      inn.classList.add('is-current');
      gsap.timeline()
        .fromTo(visual(inn), { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', scale: 1.12 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.15, ease: EXPO }, 0.32)
        .fromTo(lines(inn), { yPercent: 115 * dir }, { yPercent: 0, duration: 1.05, ease: EXPO, stagger: 0.045 }, 0.42);
    };

    let current = 0;
    const st = stepper({
      section,
      count: slides.length,
      onChange(next, prev, dir) {
        current = next;
        show(next, prev, dir);
      },
    });
    return { st, count: slides.length };
  };

  /* ---------------- stepped scenes: one scroll gesture moves exactly one item ----------------
     Inside a scene, a wheel/trackpad gesture, a swipe or a key press advances one item and the
     rest of that gesture (fast spins, trackpad momentum) is absorbed. At the first or last item
     the gesture is released so the page carries on scrolling. A fast scroll arriving from
     outside is caught at the scene's first (or last) item instead of flying through it. */
  const snapScenes = (scenes) => {
    const { lenis } = window.Site;
    if (!lenis || reduceMotion || !scenes.length) return;

    const GAP = 170;        // ms of silence that ends a wheel gesture
    const LOCK = 780;       // ms after a step during which all input is absorbed
    const DURATION = 0.72;  // s for the scroll between two items
    const TOUCH_STEP = 36;  // px of finger travel that counts as a swipe
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    let lockUntil = 0;
    let lastWheel = 0;
    let gesture = 'fresh'; // fresh → used (stepped) | released (left the scene)
    let touchTravel = 0;
    let lastInput = 'wheel';
    let prevY = lenis.scroll;
    const recent = [];

    const geo = (s) => {
      const band = (s.st.end - s.st.start) / s.count;
      return { start: s.st.start, band, last: s.st.start + band * (s.count - 0.5) };
    };
    const indexAt = (s, y) => {
      const g = geo(s);
      return Math.max(0, Math.min(s.count - 1, Math.floor((y - g.start) / g.band)));
    };
    const go = (s, i) => {
      const g = geo(s);
      lockUntil = performance.now() + LOCK;
      gesture = 'used';
      touchTravel = 0;
      lenis.scrollTo(g.start + g.band * (i + 0.5), { duration: DURATION, easing: ease, force: true });
    };
    // where is this movement taking us, relative to the scenes?
    const locate = (y, delta) => {
      for (const s of scenes) {
        const g = geo(s);
        if (y >= g.start - 2 && y <= g.last + 2) return { s, kind: 'inside' };
        if (delta > 0 && y < g.start - 2 && y + delta >= g.start - 2) return { s, kind: 'enter', i: 0 };
        if (delta < 0 && y > g.last + 2 && y + delta <= g.last + 2) return { s, kind: 'enter', i: s.count - 1 };
      }
      return null;
    };
    const position = () => (lenis.isScrolling === 'smooth' ? lenis.targetScroll : window.scrollY);

    // at most one buffered step; it only moves within the scene it was asked in
    let queued = null;
    const queue = (dir, wait) => {
      clearTimeout(queued);
      queued = setTimeout(() => {
        queued = null;
        const y = position();
        const s = scenes.find((sc) => y >= geo(sc).start - 2 && y <= geo(sc).last + 2);
        if (!s) return;
        const next = indexAt(s, y) + dir;
        if (next >= 0 && next < s.count) go(s, next);
      }, wait + 10);
    };

    // a wheel event starts a new gesture after a pause, or when the input clearly speeds up again
    const freshWheel = (now, abs) => {
      if (now - lastWheel > GAP) {
        recent.length = 0;
        recent.push(abs);
        return true;
      }
      recent.push(abs);
      if (recent.length > 8) recent.shift();
      if (now < lockUntil + 120 || recent.length < 8 || abs < 16) return false;
      const late = (recent[5] + recent[6] + recent[7]) / 3;
      const early = (recent[0] + recent[1] + recent[2] + recent[3] + recent[4]) / 5;
      return late > early * 1.5;
    };

    // returns false (and blocks the native scroll) when the event is handled here
    const handle = (delta, event, isWheel) => {
      const block = () => {
        if (event && event.cancelable) event.preventDefault();
        return false;
      };
      const now = performance.now();
      // while a step is animating, nothing may interrupt it — including input from outside the scene.
      // A separate gesture arriving now (a second wheel click, a key press) is kept for when it ends.
      if (now < lockUntil) {
        if (isWheel && gesture === 'fresh') {
          gesture = 'used';
          queue(Math.sign(delta), lockUntil - now);
        }
        return block();
      }
      const y = position();
      const hit = locate(y, delta);
      if (!hit) return true;
      if (hit.kind === 'enter') {
        go(hit.s, hit.i);
        return block();
      }
      if (gesture === 'used') return block();
      if (gesture === 'released') return true;
      if (!isWheel && Math.abs(touchTravel) < TOUCH_STEP) return block(); // hold until it is clearly a swipe
      const next = indexAt(hit.s, y) + Math.sign(delta);
      if (next < 0 || next >= hit.s.count) {
        gesture = 'released';
        return true;
      }
      go(hit.s, next);
      return block();
    };

    window.Site.addInputGuard(({ deltaY, event }) => {
      if (lenis.isStopped || window.Site.state.programmatic || event.ctrlKey) return true;
      const type = event.type;
      // Lenis treats any touch it sees as the user taking over and stops running animations,
      // so touches that belong to a step (or land while one is animating) are kept from it.
      if (type === 'touchstart') {
        lastInput = 'touch';
        touchTravel = 0;
        if (performance.now() < lockUntil) return false;
        gesture = 'fresh';
        return true;
      }
      if (type === 'touchend') return !(gesture === 'used' || performance.now() < lockUntil);
      if (!deltaY) return true;
      if (type === 'wheel') {
        lastInput = 'wheel';
        const now = performance.now();
        if (freshWheel(now, Math.abs(deltaY))) gesture = 'fresh';
        lastWheel = now;
        return handle(deltaY, event, true);
      }
      touchTravel += deltaY;
      return handle(deltaY, event, false);
    });

    // keyboard scrolling follows the same rule
    const KEY_DIR = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1, ' ': 1 };
    window.addEventListener('keydown', (e) => {
      let dir = KEY_DIR[e.key];
      if (!dir || e.altKey || e.ctrlKey || e.metaKey || lenis.isStopped) return;
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === ' ' && e.shiftKey) dir = -1;
      const amount = e.key.startsWith('Arrow') ? 60 : window.innerHeight * 0.85;
      gesture = 'fresh';
      handle(dir * amount, e, true);
    });

    // a native fling (touch) that carries into a scene is caught at its first or last item
    lenis.on('scroll', () => {
      const y = lenis.scroll;
      if (lastInput === 'touch' && !window.Site.state.programmatic && performance.now() >= lockUntil) {
        for (const s of scenes) {
          const g = geo(s);
          if (prevY < g.start - 2 && y >= g.start - 2) { go(s, 0); break; }
          if (prevY > g.last + 2 && y <= g.last + 2) { go(s, s.count - 1); break; }
        }
      }
      prevY = y;
    });
  };

  /* ---------------- statement: words travel sideways ---------------- */
  const statement = () => {
    if (reduceMotion) return;
    const track = $('.statement-track');
    const gutter = () => parseFloat(getComputedStyle($('.statement-label')).paddingLeft) || 24;
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.scene-statement', start: 'top -55%', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
    })
      .fromTo(track, { x: () => gutter() }, { x: () => -(track.scrollWidth - window.innerWidth + gutter()), duration: 1 }, 0)
      .to('.statement-rule', { scaleX: 1, duration: 1 }, 0);
  };

  /* ---------------- experience: the row in focus lights up ---------------- */
  const experience = () => {
    const rows = $$('.xp-row');
    rows.forEach((row, i) => {
      ScrollTrigger.create({
        trigger: row,
        start: 'top 62%',
        // the last row stays lit until it leaves the screen
        end: i === rows.length - 1 ? 'bottom top' : 'bottom 62%',
        onToggle: (self) => row.classList.toggle('is-active', self.isActive),
      });
    });
  };

  /* ---------------- education ---------------- */
  const education = () => {
    if (reduceMotion) return;
    gsap.set('.edu-h2-line', { yPercent: 106, y: 0 });
    gsap.to('.edu-h2-line', {
      yPercent: 0, duration: 1.2, ease: EXPO, stagger: 0.1,
      scrollTrigger: { trigger: '.edu-h2', start: 'top 85%', once: true },
    });

    const markers = $$('.semester-marker:not(.is-next)');
    const segs = $$('.sem-line');
    ScrollTrigger.create({
      trigger: '.semesters',
      start: 'top 82%',
      once: true,
      onEnter: () => {
        markers.forEach((m, i) => {
          gsap.delayedCall(0.15 + i * 0.16, () => m.classList.add('is-done'));
          segs[i] && gsap.delayedCall(0.23 + i * 0.16, () => segs[i].classList.add('is-done'));
        });
      },
    });

    $$('.grades').forEach((g) => {
      gsap.set($$('.grade', g), { yPercent: 100, y: 0 });
      gsap.to($$('.grade', g), {
        yPercent: 0, duration: 1.1, ease: EXPO, stagger: 0.07,
        scrollTrigger: { trigger: g, start: 'top 88%', once: true },
      });
    });

    gsap.set('.distinction-word>span', { yPercent: 105, y: 0 });
    gsap.to('.distinction-word>span', {
      yPercent: 0, duration: 1.3, ease: EXPO, stagger: 0.12,
      scrollTrigger: { trigger: '.achievement-display', start: 'top 85%', once: true },
    });
  };

  /* ---------------- toolkit: two rows drifting in opposite directions ---------------- */
  const toolkit = () => {
    const rows = $$('.tech-row');
    const state = rows.map((row) => ({ row, x: 0, w: 0, dir: parseFloat(row.dataset.dir) || -1 }));
    const measure = () => state.forEach((s) => (s.w = s.row.firstElementChild ? s.row.firstElementChild.offsetWidth : 0));
    measure();
    ScrollTrigger.addEventListener('refresh', measure);
    if (reduceMotion) return;

    let active = false;
    let boost = 0;
    ScrollTrigger.create({
      trigger: '.toolkit',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (active = self.isActive),
      onUpdate: (self) => (boost = Math.min(6, Math.abs(self.getVelocity()) / 400)),
    });
    gsap.ticker.add((time, delta) => {
      if (!active) return;
      const dt = Math.min(delta, 50) / 16.67;
      boost *= 0.92;
      state.forEach((s) => {
        if (!s.w) return;
        s.x += s.dir * (0.55 + boost) * dt;
        if (s.x <= -s.w) s.x += s.w;
        if (s.x > 0) s.x -= s.w;
        s.row.style.transform = `translate3d(${s.x}px,0,0)`;
      });
    });
  };

  /* ---------------- contact + footer ---------------- */
  const contact = () => {
    if (reduceMotion) return;
    gsap.set('.contact-line', { yPercent: 106, y: 0 });
    gsap.to('.contact-line', {
      yPercent: 0, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: '.contact-title', start: 'top 92%', end: 'top 45%', scrub: true },
    });
    gsap.fromTo('.footer-line', { yPercent: 30 }, {
      yPercent: 0, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: '.footer-name', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  };

  hero();
  about();
  const statsScene = stats();
  const workScene = work();
  snapScenes([statsScene, workScene].filter(Boolean));
  statement();
  experience();
  education();
  toolkit();
  contact();
  window.Site.ready();
  intro();
})();
