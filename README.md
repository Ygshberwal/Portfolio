# Yogesh Berwal — Portfolio

An original, light-first editorial portfolio built with Astro and TypeScript. Static pages, local fonts, and small progressive interactions—no API keys or backend needed by the site.

## Local development

Node.js 24 (see `.nvmrc`) and npm. Astro requires Node >=22.23.4.

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro (normally http://127.0.0.1:4321). If a preview server is already running on that port, use `npm run dev -- --port 4323`.

```sh
npm run build
npm run preview
```

Build output is **`dist/` only**. Deploy it to a static host such as Vercel, Netlify, or Cloudflare Pages. No deployment has been performed.

## Verification

```sh
npx playwright install chromium
npm run build
npm test
```

The browser suite starts its own static test server on port 4322. Screenshots are saved under ignored `test-results/`. Automated axe checks cover WCAG A/AA rules supported by axe; they are not a claim of complete accessibility certification.

## Content and design

- `src/data/portfolio.ts` — project copy, source/demo links, experience, research, education, and social profiles.
- `src/data/media.ts` — selected owner photos, genuine screenshots, captions, and responsive variants.
- `src/components/HeroPortrait.astro`, `Experience.astro`, `Education.astro`, `Research.astro`, `BeyondCode.astro` — portrait-led opening, work/academic timelines, papers, and personal activities.
- `src/components/ProjectActions.astro` — consistent source, live demo, backend, certificate, and game links.
- `src/pages/index.astro` — homepage, experience, about, contact.
- `src/pages/work/` — directory and generated case studies.
- `src/styles/global.css` — design tokens, responsive layout, interaction, reduced-motion and print styles.
- `src/scripts/scroll-experience.ts` + `src/styles/scroll.css` — GSAP scroll-linked desktop project story, layered hero movement, section reveals, and progressive fallbacks.
- `docs/DESIGN.md` — architecture, accessibility, and motion behavior.

The optimized images in `public/images/`, sharing artwork, and approved `public/resume.pdf` are committed. A fresh clone can build and test without any private originals, API keys, or environment variables.

### Optional asset regeneration

`npm run images` prepares selected responsive WebP images, strips EXIF/GPS metadata, and copies the approved résumé without altering it. This maintainer command requires the original `photos/` folder and source PDF, which are intentionally Git-ignored. Restore them locally or set `PHOTO_SOURCE_DIR` and `RESUME_SOURCE_PATH`. It is **not** required for a normal build or test run.

Keep the original photographs, personal content briefs, source-PDF duplicate, `.env` files, and local OpenCode/MCP configuration out of commits. The `.gitignore` covers these along with dependencies, build output, test reports, and hosting caches. Never embed a credential in frontend code.

### Scroll experience

On desktop viewports at least 1100 × 740, scroll through Selected Work to move through the three featured projects while the heading stays pinned. Chapter links skip to a project; keyboard focus also brings offscreen links into view. Scrolling remains native—there is no scroll hijacking or forced snapping. Mobile, short viewports, reduced-motion preferences, print, and disabled JavaScript retain the normal vertical layout.

### Before launch

Selected photos/screenshots are integrated. The image preparation script is an explicit allowlist; it never publishes the entire `photos/` directory. Additional photography can be added later. Paper presentation/acceptance details are confirmed; publication remains pending.

1. Review the integrated portrait, hockey/trekking/travel images, and full application screenshots. Add authored photography and cricket photos later if desired.
2. Review the approved résumé before public launch. To update it, replace `public/resume.pdf` with an approved PDF, or update the private source and run `npm run images`.
3. Add formal proceedings/DOI links when the accepted papers are published. Confirm optional career history and recheck live demos before launch.
4. Set **`SITE_URL`** to your real HTTPS origin at build time. Canonical URLs, absolute OG image URL, and sitemap entries are generated only when set—no domain is fabricated.
5. Run build/tests again and review on physical mobile devices. Add production-host security headers using that host's configuration. Demo links are displayed at the owner's request, with availability notes where checks timed out; monitor the linked backends separately.

Example after you own a domain:

```sh
SITE_URL=https://your-approved-domain.example npm run build
```

Do not use the example domain in production. Fontsource packages supply the fonts under their included open font licenses; no proprietary Apple fonts or reference-site assets are bundled.

## GitHub

This folder is an independent Git repository on `main`. After creating an empty GitHub repository, review `git status`, commit, add its URL as `origin`, and push. No repository credentials are needed by the website itself.
