/* Case-study pages: title reveal, covers timeline, table-of-contents scroll-spy. */
(() => {
  if (!window.Site || typeof gsap === 'undefined') return;
  const { reduceMotion } = window.Site;
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  if (reduceMotion) {
    gsap.set('.case-title .line-inner', { yPercent: 0, y: 0 });
    gsap.set('.case-intro, .site-header .intro-fade', { opacity: 1, y: 0 });
    document.querySelector('.covers') && document.querySelector('.covers').classList.add('is-in');
  } else {
    gsap.set('.case-title .line-inner', { yPercent: 106, y: 0 });
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to('.site-header .intro-fade', { opacity: 1, duration: 1, stagger: 0.04 }, 0.1)
      .to('.case-title .line-inner', { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.15)
      .to('.case-intro', { opacity: 1, y: 0, duration: 1.1, stagger: 0.06 }, 0.35);

    const covers = document.querySelector('.covers');
    if (covers) {
      const dots = $$('li i', covers);
      gsap.fromTo('.covers-line', { scaleX: 0 }, {
        scaleX: 1, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: covers, start: 'top 90%', once: true },
        onStart: () => dots.forEach((d, i) => gsap.delayedCall(0.12 + i * 0.1, () => (d.style.transform = 'scale(1)'))),
      });
    }
  }

  // which section is being read
  const links = $$('.case-toc a');
  $$('.case-sec').forEach((sec) => {
    const link = links.find((a) => a.getAttribute('href') === `#${sec.id}`);
    if (!link) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => self.isActive && links.forEach((a) => a.classList.toggle('is-active', a === link)),
    });
  });

  window.Site.ready();
})();
