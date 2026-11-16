# Design and engineering direction — Quiet precision

## Decision

A custom, portrait-led portfolio with a restrained editorial identity: generous space, strong hierarchy, real project imagery, and code-linked case studies.

Warm ivory, dark ink, and a restrained forest-green accent. Large Manrope display text contrasted with genuine italic Newsreader. Real application screenshots take precedence over decorative artwork.

The portfolio should be easy to understand in 30 seconds, with deeper code-linked project notes for someone spending five minutes. This is not a showcase of how many animation libraries can fit on one page.

## Architecture

- Astro static pages + TypeScript: content-focused pages do not need a fully hydrated React application.
- Typed project model in `src/data/portfolio.ts` generates homepage cards, directory entries, individual case-study pages, and sitemap entries.
- Native disclosure for experience detail; small scripts for mobile navigation and project filters.
- No backend, API key, analytics, tracking cookies, remote font calls, account creation, or contact-form provider required.
- All key copy and project links are server-rendered and available without JavaScript. Native navigation and browser scrolling remain intact.
- The hero uses the owner's supplied black-and-white portrait. No stock/generated identity image or placeholder face is used.
- Case studies include limitations and source deep links. No invented engineering decisions, project traction, testimonials, scientific comparisons, or clinical claims.
- LinkedIn, GitHub, LeetCode, and GeeksforGeeks are visible together in the hero, wrapping into a two-column mobile layout. Coding highlights pair the 2,000+ problems claim with the owner-confirmed #2 placement on IIT Mandi's GFG college leaderboard (students and alumni), linked to that leaderboard and dated November 2026. This is a static college ranking, not a global or live-updating rank.

## Interaction

Interaction should reveal useful information, not block navigation. Buttons and disclosure controls are keyboard-operable, have visible focus styles, and expose appropriate state. Project filters announce the visible count. Motion is disabled under reduced-motion preferences. No custom continuous animation/render loop.

### Scroll storytelling

Scroll-linked motion is progressive enhancement. Native document scrolling, navigation, and content remain usable without it.

- **Desktop project story:** at least 1100px wide and 740px tall, the selected-work stage pins while native vertical scrolling scrubs a horizontal sequence of three projects. The heading remains in place, with chapter links, active-chapter styling, and a progress rule. Direct case-study links remain usable.
- **Hero:** subtle scroll-linked movement separates the copy and portrait; no 3D model is loaded.
- **Experience:** desktop section introduction stays sticky alongside the experience entries.
- **Timeline reading indicator:** Experience and Education have a soft green light that follows the viewport's central reading line (50% height), rather than sticking to dates near the top edge. Active entries are chosen by their actual title/body bounds, excluding padding and technology tags. In gaps, the nearest readable content wins, with an 8px hysteresis margin to prevent flicker in either direction. A thin illuminated trail follows the light, and the active milestone dot fades into emphasis. The rail extends through the last entry's readable content so its heading can leave the screen without pulling the pointer out of the focus zone. The employment CURRENT badge stays independent; keyboard focus also highlights its entry.
- **Reveals:** sections move gently into place on first entry. They are never hidden before JavaScript loads, and no reading depends on a completed animation.
- **Reading progress:** a quiet top-edge indicator tracks overall scroll position.
- **Access:** chapter controls can skip directly to a project. Keyboard focus on a clipped project moves its chapter into view. Screen-reader reading order stays the original document order. No wheel interception, smooth-scroll replacement, forced snapping, autoplay, or scroll lock.
- **Fallbacks:** mobile, short viewports, reduced-motion, no-JavaScript, and print use the original vertical grid. Resize and live reduced-motion changes revert inline transforms and remove pin spacers. Print suspends the enhancement and restores it afterward.

Implementation: `src/components/SelectedWork.astro`, `src/scripts/scroll-experience.ts`, and `src/styles/scroll.css`. GSAP/ScrollTrigger are dynamically imported only when reduced motion is not requested. MatchMedia scopes desktop timelines and owns their teardown. Tests cover chapter navigation/reverse movement, keyboard access, viewport changes, live motion preferences, print, and no-JavaScript fallback.

The timeline indicator is a separate, dependency-free enhancement in `src/scripts/timeline-indicator.ts` and `src/styles/timeline.css`. Decorative pseudo-elements preserve valid ordered-list markup. Geometry is recomputed with ResizeObserver when details, fonts, or viewport dimensions change; scroll events schedule at most one frame and read only visible rails. The glow breathes slowly, pauses offscreen, and never flashes. Reduced motion hides the travelling light/trail but retains a static active dot; print hides the decoration. Without JavaScript the original timeline remains visible. Inspiration is the reference portfolio's growing rail and glowing career dot, implemented originally in this site's restrained palette rather than copying its purple flicker effect.

## Pages and assets

Homepage, nine project case studies, filterable directory, work/education timelines, research, personal interests, 404, favicon/OG artwork, and domain-aware robots/sitemap/canonical metadata.

Selected public images and `public/resume.pdf` are committed so a fresh clone works without private originals. `npm run images` is an optional local regeneration tool; original photos and authoring notes are Git-ignored. The downloadable résumé is supplied unchanged; no phone number is extracted into page copy.

## Quality checks

Type-check + production build. Playwright Chromium desktop and mobile profiles: navigation, disclosures, filter behavior, route/link checks, automated axe WCAG A/AA checks, horizontal overflow, reduced motion, no-JavaScript content, and absence of known internal identifiers/credential prefixes in rendered HTML.

Automated accessibility checks do not replace manual assistive-technology testing. Chromium mobile emulation is not a physical iOS Safari test. A production Lighthouse run and real-device review should follow the asset/domain pass.
