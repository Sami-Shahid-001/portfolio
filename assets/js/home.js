/* Home page scenes. Everything animates transform/opacity only. */
(() => {
  if (!window.Site || typeof gsap === 'undefined') return;
  const { reduceMotion, isTouch } = window.Site;
  // wheel input is already smoothed by Lenis; native touch scrolling is not, so tweens trail it slightly
  const SCRUB = isTouch ? 0.6 : true;
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
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom bottom', scrub: SCRUB },
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
      scrollTrigger: { trigger: '#about', start: 'top -78%', end: 'bottom bottom', scrub: SCRUB },
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
    const counter = $('.stat-count', section);
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
        counter.textContent = String(next + 1).padStart(2, '0');
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
    // looked up once: slide changes happen mid-scroll and must stay cheap
    const lineCache = new Map(slides.map((s) => [s, $$('.copy-line, .project-index', s)]));
    const visualCache = new Map(slides.map((s) => [s, $('.project-visual', s)]));
    const lines = (s) => lineCache.get(s);
    const visual = (s) => visualCache.get(s);
    const live = new Set(); // slides that may still have tweens running

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
      live.forEach((s) => {
        if (s !== out && s !== inn) {
          gsap.killTweensOf([...lines(s), visual(s)]);
          s.classList.remove('is-current');
          live.delete(s);
        }
      });
      live.add(out).add(inn);
      gsap.killTweensOf([...lines(out), visual(out), ...lines(inn), visual(inn)]);
      gsap.delayedCall(0.85, () => out !== slides[current] && out.classList.remove('is-current'));
      gsap.timeline()
        .to(lines(out), { yPercent: -115 * dir, duration: 0.7, ease: 'power3.in', stagger: 0.025 }, 0)
        .to(visual(out), { clipPath: dir > 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)', scale: 0.96, duration: 0.8, ease: 'power3.inOut' }, 0);

      // the incoming slide only starts moving after ~0.3s, so it is set up in a later frame
      // than the outgoing one; that keeps the frame the scroll crosses the boundary light
      gsap.delayedCall(0.3, () => {
        if (inn !== slides[current]) return;
        inn.classList.add('is-current');
        gsap.timeline()
          .fromTo(visual(inn), { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', scale: 1.12 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.15, ease: EXPO }, 0.02)
          .fromTo(lines(inn), { yPercent: 115 * dir }, { yPercent: 0, duration: 1.05, ease: EXPO, stagger: 0.045 }, 0.12);
      });
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
    const LOCK = 780;       // ms after a step during which all input is absorbed (wheel)
    const DURATION = 0.72;  // s for the scroll between two items (wheel)
    const TOUCH_LOCK = 520; // phones get a quicker rhythm: people swipe faster than they spin a wheel
    const TOUCH_DURATION = 0.5;
    const TOUCH_STEP = 28;  // px of travel that counts as a swipe while the finger is down
    const FLICK = 8;        // a quick flick may lift off sooner; this much travel still counts
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    let lockUntil = 0;
    let lastWheel = 0;
    let gesture = 'fresh'; // fresh → used (stepped) | released (left the scene)
    let touchTravel = 0;
    let touching = false;
    let held = null; // { s, i } — the item the last step landed on
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
    // Phones keep coasting after the finger lifts, and a snap animated on top of that coast makes
    // the two fight frame by frame (the "shake"). Briefly hiding the page's overflow stops the coast
    // dead on iOS and Android; programmatic scrolling still works while it is hidden.
    let unfreeze = 0;
    const stopCoasting = () => {
      const html = document.documentElement;
      html.style.overflow = 'hidden';
      clearTimeout(unfreeze);
      unfreeze = setTimeout(() => (html.style.overflow = ''), 80);
    };
    let settledAt = 0; // when the current item finished arriving
    const go = (s, i) => {
      const g = geo(s);
      const touch = lastInput === 'touch';
      const target = g.start + g.band * (i + 0.5);
      const now = performance.now();
      gesture = 'used';
      // already gliding to this exact item: restarting the animation would only make it jitter
      if (held && held.s === s && held.i === i && lenis.isScrolling === 'smooth' && now < lockUntil) return;
      if (touch) stopCoasting();
      const duration = touch ? TOUCH_DURATION : DURATION;
      lockUntil = now + (touch ? TOUCH_LOCK : LOCK);
      settledAt = now + duration * 1000;
      held = { s, i };
      lenis.scrollTo(target, { duration, easing: ease, force: true });
    };
    // a burst of quick swipes that reaches the first or last item stays there; leaving the scene
    // takes a fresh swipe once that item has settled
    // "Settled" means this gesture began after a real pause: the item had finished arriving and the
    // previous swipe had ended at least SETTLE ms earlier. A continuous run of fast swipes never is.
    const SETTLE = 380;
    let gestureStart = 0;
    let quietBefore = Infinity;
    let lastTouchEnd = -Infinity;
    const settled = () => gestureStart - Math.max(settledAt, lockUntil) >= SETTLE && quietBefore >= SETTLE;
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

    // Swipes or clicks that arrive while an item is still animating in are buffered (up to three)
    // and played one by one, so quick repeated swipes each move one item instead of being lost.
    // Buffered steps only move within the scene they were asked in.
    let pending = 0;
    let timer = null;
    const flush = () => {
      timer = null;
      if (!pending) return;
      const wait = lockUntil - performance.now();
      if (wait > 0) { timer = setTimeout(flush, wait + 10); return; }
      const dir = Math.sign(pending);
      pending -= dir;
      const y = position();
      const s = scenes.find((sc) => y >= geo(sc).start - 2 && y <= geo(sc).last + 2);
      const next = s ? indexAt(s, y) + dir : -1;
      if (!s || next < 0 || next >= s.count) { pending = 0; return; }
      go(s, next);
      if (pending) timer = setTimeout(flush, (lastInput === 'touch' ? TOUCH_LOCK : LOCK) + 10);
    };
    const queue = (dir) => {
      if (Math.sign(pending) && Math.sign(pending) !== dir) pending = 0; // a change of direction cancels the backlog
      pending = Math.max(-3, Math.min(3, pending + dir));
      if (!timer) timer = setTimeout(flush, Math.max(0, lockUntil - performance.now()) + 10);
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
      // while a step is animating, nothing may interrupt it, including input from outside the scene.
      // A separate gesture arriving now (a second wheel click, a key press) is kept for when it ends.
      if (now < lockUntil) {
        if (gesture === 'fresh' && (isWheel || Math.abs(touchTravel) >= TOUCH_STEP)) {
          gesture = 'used';
          queue(Math.sign(isWheel ? delta : touchTravel));
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
      const dir = Math.sign(isWheel ? delta : touchTravel || delta);
      const next = indexAt(hit.s, y) + dir;
      // heading out past the first or last item: let the page scroll on, unless the item has only
      // just arrived (part of a fast run of swipes), in which case the rest of this gesture is absorbed
      if (next < 0 || next >= hit.s.count) {
        if (!settled()) {
          gesture = 'used';
          return block();
        }
        gesture = 'released';
        return true;
      }
      if (!isWheel && Math.abs(touchTravel) < TOUCH_STEP) return block(); // hold until it is clearly a swipe
      go(hit.s, next);
      return block();
    };

    // a quick flick can lift off before reaching TOUCH_STEP; it still counts as one swipe
    const flickEnd = () => {
      if (gesture !== 'fresh' || Math.abs(touchTravel) < FLICK) return false;
      const dir = Math.sign(touchTravel);
      const now = performance.now();
      if (now < lockUntil) {
        gesture = 'used';
        queue(dir);
        return true;
      }
      const y = position();
      const s = scenes.find((sc) => y >= geo(sc).start - 2 && y <= geo(sc).last + 2);
      if (!s) return false;
      const next = indexAt(s, y) + dir;
      if (next < 0 || next >= s.count) return false;
      go(s, next);
      return true;
    };

    window.Site.addInputGuard(({ deltaY, event }) => {
      if (lenis.isStopped || window.Site.state.programmatic || event.ctrlKey) return true;
      const type = event.type;
      // Lenis treats any touch it sees as the user taking over and stops running animations,
      // so touches that belong to a step (or land while one is animating) are kept from it.
      if (type === 'touchstart') {
        // every new finger is a new swipe, even while the previous item is still arriving
        lastInput = 'touch';
        touching = true;
        touchTravel = 0;
        gesture = 'fresh';
        gestureStart = performance.now();
        quietBefore = gestureStart - lastTouchEnd;
        return performance.now() >= lockUntil;
      }
      if (type === 'touchend') {
        touching = false;
        lastTouchEnd = performance.now();
        flickEnd();
        return !(gesture === 'used' || performance.now() < lockUntil);
      }
      if (!deltaY) return true;
      if (type === 'wheel') {
        lastInput = 'wheel';
        const now = performance.now();
        if (freshWheel(now, Math.abs(deltaY))) {
          gesture = 'fresh';
          gestureStart = now;
          quietBefore = now - lastWheel;
        }
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
      gestureStart = performance.now();
      quietBefore = Infinity;
      handle(dir * amount, e, true);
    });

    // a native fling (touch) that carries into a scene is caught at its first or last item
    let holdTimer = 0;
    lenis.on('scroll', () => {
      const y = lenis.scroll;
      // a jump of a screen or more in one frame is a programmatic jump, not a fling
      if (lastInput === 'touch' && !window.Site.state.programmatic && performance.now() >= lockUntil && Math.abs(y - prevY) < window.innerHeight) {
        let caught = false;
        for (const s of scenes) {
          const g = geo(s);
          if (prevY < g.start - 2 && y >= g.start - 2) { go(s, 0); caught = true; break; }
          if (prevY > g.last + 2 && y <= g.last + 2) { go(s, s.count - 1); caught = true; break; }
        }
        // momentum still coasting after a step landed: stop the coast and settle back on the item once,
        // rather than re-snapping on every scroll event (which is what made it shake)
        if (!caught && !touching && gesture === 'used' && held && lenis.isScrolling === 'native') {
          const g = geo(held.s);
          const target = g.start + g.band * (held.i + 0.5);
          // covers the scene's whole pinned range, so a coast can't carry past the first or last item either
          if (Math.abs(y - target) > 4 && y >= g.start - g.band && y <= held.s.st.end + 2) {
            stopCoasting();
            clearTimeout(holdTimer);
            holdTimer = setTimeout(() => {
              const now = window.scrollY;
              if (!touching && held && Math.abs(now - target) > 4) go(held.s, held.i);
            }, 60);
          }
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
      // a longer runway plus a short trailing follow keeps the words gliding rather than racing
      scrollTrigger: { trigger: '.scene-statement', start: 'top -55%', end: 'bottom bottom', scrub: 1.2, invalidateOnRefresh: true },
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
      scrollTrigger: { trigger: '.contact-title', start: 'top 92%', end: 'top 45%', scrub: SCRUB },
    });
    gsap.fromTo('.footer-line', { yPercent: 30 }, {
      yPercent: 0, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: '.footer-name', start: 'top bottom', end: 'bottom bottom', scrub: SCRUB },
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
