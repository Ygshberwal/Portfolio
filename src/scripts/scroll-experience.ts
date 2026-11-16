/**
 * Scroll-linked enhancement, never a replacement for native scrolling.
 * The original HTML/grid remains the no-JS, mobile, short-screen and
 * reduced-motion fallback. No wheel/touch interception or smooth-scroll loop.
 */
export function initializeScrollExperience() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let dispose: (() => void) | undefined;
  let generation = 0;
  let printing = false;

  async function configure() {
    const currentGeneration = ++generation;
    dispose?.();
    dispose = undefined;
    if (reducedMotion.matches || printing) return;

    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    if (currentGeneration !== generation || reducedMotion.matches || printing) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const root = document.documentElement;
    root.classList.add('motion-ready');

    const context = gsap.context(() => {
      gsap.to('.reading-progress > span', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: true },
      });
    });

    // Enter animations start only when content is on screen. Nothing is
    // hidden in anticipation: failed scripts never leave unreadable sections.
    const animations = new Set<Animation>();
    const reveals = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const animation = entry.target.animate(
          [{ transform: 'translateY(26px)' }, { transform: 'translateY(0)' }],
          { duration: 650, easing: 'cubic-bezier(.22, 1, .36, 1)' },
        );
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => {});
        reveals.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    document.querySelectorAll(
      '.experience, .about-copy, .skills-heading, .skill-group, .education-list > li, .paper-list > li, .hockey-gallery figure, .outdoor-gallery figure, .contact-section h2',
    ).forEach(element => reveals.observe(element));

    media.add('(min-width: 1100px) and (min-height: 740px)', () => {
      const section = document.querySelector<HTMLElement>('#projects');
      const stage = section?.querySelector<HTMLElement>('.work-stage');
      const track = section?.querySelector<HTMLElement>('.featured-grid');
      const cards = [...(section?.querySelectorAll<HTMLElement>('.featured-project') ?? [])];
      const chapters = [...(section?.querySelectorAll<HTMLAnchorElement>('[data-chapter]') ?? [])];
      if (!section || !stage || !track || cards.length < 2) return;

      ScrollTrigger.saveStyles([
        track, stage,
        ...document.querySelectorAll<HTMLElement>('.hero-copy, .hero-portrait'),
      ]);
      section.classList.add('is-scroll-story');
      const distance = () => track.scrollWidth - track.clientWidth;
      let currentChapter = -1;
      const setChapter = (progress: number) => {
        const index = Math.round(progress * (cards.length - 1));
        if (index === currentChapter) return;
        currentChapter = index;
        section.dataset.activeChapter = String(index);
        chapters.forEach((chapter, i) => {
          if (i === index) chapter.setAttribute('aria-current', 'step');
          else chapter.removeAttribute('aria-current');
        });
      };

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          id: 'featured-work',
          trigger: stage,
          start: 'top 36px',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: trigger => setChapter(trigger.progress),
        },
      });
      const trigger = tween.scrollTrigger!;
      setChapter(trigger.progress);
      gsap.to('.story-progress > span', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: () => trigger.start,
          end: () => trigger.end,
          scrub: true,
        },
      });

      function moveToChapter(index: number, instant = false) {
        const progress = index / (cards.length - 1);
        window.scrollTo({
          top: trigger.start + (trigger.end - trigger.start) * progress,
          behavior: instant ? 'instant' : 'smooth',
        });
        if (instant) {
          ScrollTrigger.update();
          trigger.getTween()?.progress(1);
          tween.progress(progress);
          setChapter(progress);
        }
      }

      const chapterClick = (event: MouseEvent) => {
        // Preserve open-in-new-tab and modified-click browser behavior.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const link = (event.target as Element).closest<HTMLAnchorElement>('[data-chapter]');
        if (!link) return;
        event.preventDefault();
        moveToChapter(Number(link.dataset.chapter));
      };
      const focusCard = (event: FocusEvent) => {
        const card = (event.target as Element).closest<HTMLElement>('.featured-project');
        if (!card) return;
        const bounds = card.getBoundingClientRect();
        // Don't reposition a visible card on pointer focus: moving its target
        // between pointerdown and pointerup would swallow the ensuing click.
        if (bounds.left < 0 || bounds.right > innerWidth) {
          moveToChapter(cards.indexOf(card), true);
        }
      };
      section.querySelector('nav')?.addEventListener('click', chapterClick);
      track.addEventListener('focusin', focusCard);

      const heroTimeline = gsap.timeline({
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.65 },
      });
      heroTimeline
        .to('.hero-copy', { y: -65, ease: 'none' }, 0)
        .to('.hero-portrait', { y: 30, scale: 0.98, ease: 'none' }, 0);

      // A direct chapter hash must land on its actual horizontal position.
      const hashIndex = cards.findIndex(card => `#${card.id}` === location.hash);
      const refreshHash = () => {
        if (hashIndex >= 0) moveToChapter(hashIndex, true);
      };
      if (hashIndex >= 0) {
        requestAnimationFrame(refreshHash);
      }

      return () => {
        section.querySelector('nav')?.removeEventListener('click', chapterClick);
        track.removeEventListener('focusin', focusCard);
        section.classList.remove('is-scroll-story');
        delete section.dataset.activeChapter;
        chapters.forEach(chapter => chapter.removeAttribute('aria-current'));
      };
    });

    // Refresh only after fonts settle; resize handling is owned by ScrollTrigger.
    let active = true;
    document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    dispose = () => {
      active = false;
      reveals.disconnect();
      animations.forEach(animation => animation.cancel());
      media.revert();
      context.revert();
      root.classList.remove('motion-ready');
    };
  }

  // These handlers outlive a motion configuration: afterprint must still be
  // registered after beforeprint has disposed that configuration.
  window.addEventListener('beforeprint', () => {
    printing = true;
    ++generation;
    dispose?.();
    dispose = undefined;
  });
  window.addEventListener('afterprint', () => {
    printing = false;
    void configure();
  });
  reducedMotion.addEventListener('change', () => { void configure(); });
  void configure();
}
