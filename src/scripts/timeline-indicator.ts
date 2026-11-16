interface TimelineState {
  root: HTMLElement;
  entries: HTMLElement[];
  anchors: number[];
  content: { start: number; end: number }[];
  railEnd: number;
  markerY: number;
  active: number;
}

/**
 * A decorative reading-position marker. Native scrolling stays untouched.
 * There is no idle JS animation loop: updates are coalesced into one frame,
 * geometry is cached, and only visible timelines are read on scroll.
 * Reduced-motion users retain the active dot without a moving/pulsing light.
 */
export function initializeTimelineIndicators(): () => void {
  const states: TimelineState[] = [...document.querySelectorAll<HTMLElement>('[data-timeline]')]
    .map(root => ({
      root,
      entries: [...root.querySelectorAll<HTMLElement>(':scope > [data-timeline-entry]')],
      anchors: [],
      content: [],
      railEnd: 0,
      markerY: NaN,
      active: -1,
    }))
    .filter(state => state.entries.length > 0);
  const visible = new Set<HTMLElement>();
  let frame = 0;
  let measureNeeded = true;
  let disposed = false;

  function select(state: TimelineState, index: number, force = false) {
    if (!force && index === state.active) return;
    state.active = index;
    state.root.dataset.timelineIndex = String(index);
    state.entries.forEach((entry, i) => {
      entry.toggleAttribute('data-timeline-active', i === index);
    });
  }

  function moveLight(state: TimelineState, readingY: number) {
    const first = state.anchors[0];
    const y = Math.max(first, Math.min(readingY, state.railEnd));
    if (Math.abs(y - state.markerY) < 0.1) return;
    state.markerY = y;
    const span = state.railEnd - first;
    state.root.style.setProperty('--timeline-marker-y', `${y.toFixed(2)}px`);
    state.root.style.setProperty('--timeline-progress', String(span > 0 ? (y - first) / span : 0));
  }

  function distanceToContent(bounds: { start: number; end: number }, y: number) {
    return Math.max(bounds.start - y, y - bounds.end, 0);
  }

  function measure(state: TimelineState) {
    // Read the real CSS dots rather than duplicating desktop/mobile offsets.
    state.anchors = state.entries.map(entry => {
      const dot = getComputedStyle(entry, '::before');
      return entry.offsetTop + (parseFloat(dot.top) || 0) + (parseFloat(dot.height) || 0) / 2;
    });
    // Follow what the visitor reads, not just the dates at the top of a card.
    // Exclude bottom padding and technology tags from the reading bounds.
    state.content = state.entries.map(entry => {
      const title = entry.querySelector<HTMLElement>(':scope > h3') ?? entry;
      const content = [...entry.querySelectorAll<HTMLElement>(':scope > h3, :scope > p, :scope > details, :scope > .small-copy')];
      const start = entry.offsetTop + (title === entry ? 0 : title.offsetTop);
      const end = entry.offsetTop + Math.max(
        title.offsetTop + title.offsetHeight,
        ...content.map(node => node.offsetTop + node.offsetHeight),
      );
      return { start, end };
    });
    const first = state.anchors[0];
    state.railEnd = Math.max(state.anchors.at(-1)!, state.content.at(-1)!.end);
    state.root.style.setProperty('--timeline-start', `${first}px`);
    state.root.style.setProperty('--timeline-span', `${state.railEnd - first}px`);
    const previousY = Number.isFinite(state.markerY) ? state.markerY : first;
    state.markerY = NaN;
    moveLight(state, previousY);
    select(state, Math.max(0, state.active), true);
    state.root.setAttribute('data-timeline-ready', '');
  }

  function update() {
    frame = 0;
    if (disposed) return;
    if (measureNeeded) {
      states.forEach(measure);
      measureNeeded = false;
    }
    const readingLine = innerHeight * 0.5;
    for (const state of states) {
      if (!visible.has(state.root)) continue;
      const localReadingLine = readingLine - state.root.getBoundingClientRect().top;
      let index = 0;
      let nearest = Infinity;
      for (let i = 0; i < state.content.length; i++) {
        const distance = distanceToContent(state.content[i], localReadingLine);
        if (distance < nearest) {
          nearest = distance;
          index = i;
        }
      }
      // Small hysteresis prevents flicker when the focus line sits in the gap
      // between entries, while remaining symmetric when scrolling backwards.
      if (state.active >= 0 && distanceToContent(state.content[state.active], localReadingLine) <= nearest + 8) {
        index = state.active;
      }
      select(state, index);
      // Continuous positioning keeps the light at the viewport's focus line,
      // rather than leaving it attached to a heading near the top edge.
      moveLight(state, localReadingLine);
    }
  }

  function schedule() {
    if (!disposed && !frame) frame = requestAnimationFrame(update);
  }

  function invalidate() {
    measureNeeded = true;
    schedule();
  }

  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      entry.target.toggleAttribute('data-timeline-visible', entry.isIntersecting);
      if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
      else visible.delete(entry.target as HTMLElement);
    }
    schedule();
  });

  const sizes = new ResizeObserver(invalidate);
  const onScroll = () => { if (visible.size) schedule(); };
  const onFocus = (event: FocusEvent) => {
    const entry = (event.target as Element).closest<HTMLElement>('[data-timeline-entry]');
    if (!entry) return;
    const state = states.find(item => item.entries.includes(entry));
    if (!state) return;
    if (measureNeeded) {
      states.forEach(measure);
      measureNeeded = false;
    }
    select(state, state.entries.indexOf(entry));
    moveLight(state, innerHeight * 0.5 - state.root.getBoundingClientRect().top);
  };

  for (const state of states) {
    visibility.observe(state.root);
    sizes.observe(state.root);
    state.entries.forEach(entry => sizes.observe(entry));
    state.root.addEventListener('focusin', onFocus);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', invalidate, { passive: true });
  document.fonts.ready.then(() => { if (!disposed) invalidate(); });
  schedule();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    visibility.disconnect();
    sizes.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', invalidate);
    for (const state of states) {
      state.root.removeEventListener('focusin', onFocus);
      ['data-timeline-ready', 'data-timeline-index', 'data-timeline-visible'].forEach(name => state.root.removeAttribute(name));
      ['--timeline-marker-y', '--timeline-progress', '--timeline-start', '--timeline-span'].forEach(name => state.root.style.removeProperty(name));
      state.entries.forEach(entry => entry.removeAttribute('data-timeline-active'));
    }
  };
}
