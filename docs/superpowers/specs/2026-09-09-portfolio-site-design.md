# Portfolio Website — Design Spec

Date: 2026-09-09

## Purpose

Freelance-client-facing portfolio for a full-stack dev/designer (both web dev and UI/UX design work). Goal: attract paid freelance work via project showcase + contact form.

## Content Scope

- 4–8 projects shown as cards (placeholder content at launch, swapped in later by the user)
- One page, single scroll, no CMS/backend

## Tech Stack

Static HTML/CSS/JS. No build step, no framework, no package manager.

```
index.html
styles.css
main.js       — nav active-state, scroll-reveal (IntersectionObserver), smooth-scroll, contact form validation
hero3d.js     — Three.js hero scene, isolated module, must fail safely
/assets       — images, favicon
```

Three.js loaded via CDN `<script>` tag (r128+), no bundler.

Deploy target: static host (GitHub Pages or Netlify drag-drop) — decided later, doesn't affect the build.

## Visual Design

**Theme:** dark-tech.

- Background: near-black `#0a0a0f`
- Body text: light gray `#e5e5e5`
- Accent: cyan `#22d3ee` (links, highlights, glows, active nav state)
- Fonts: monospace (e.g. `JetBrains Mono` / `Space Mono`) for labels, tags, code-style accents; sans-serif (e.g. `Inter`) for body copy
- Tech-tag pills on project cards: bordered, cyan text, monospace — terminal-chip look

## Page Structure (single scroll page)

1. **Nav** — sticky top, logo + anchor links to sections, highlights current section on scroll, collapses to hamburger on mobile
2. **Hero** — name + tagline, rotating 3D object as centerpiece (see below)
3. **Projects** — grid of 4–8 cards (2–3 cols desktop, 1 col mobile): title, short description, tech tags, live/repo links
4. **About** — short bio + skills as tag chips (same pill style as project tags), optional avatar placeholder
5. **Contact** — form (name/email/message) + direct email `mailto:` link + social links (user fills in handles later)
6. **Footer**

## Hero 3D Object

- Three.js scene rendered into a `<canvas>` positioned behind/beside hero text
- Single centerpiece geometry (icosahedron or torus knot), wireframe + solid gradient material, cyan point-light glow
- Slow auto-rotation + subtle mouse-parallax tilt
- **Fallback behavior (required):** wrap init in try/catch; on failure or no-WebGL, hide canvas and log a console warning — hero text and rest of page must render normally regardless
- **Mobile:** below ~600px width, either reduce geometry detail/particle count or swap to a static fallback image to protect performance

## Motion & Interaction

- Scroll-reveal fade/slide-in per section via IntersectionObserver (no external lib)
- Smooth-scroll for nav anchor links
- Nav active-section highlighting on scroll

## Contact Form

- Fields: name, email, message
- Client-side validation before submit: required fields + email format check, inline error text (no `alert()`)
- Submission target: Formspree (or equivalent free form backend) — no custom backend
- Inline success/error state after submit, no page reload

## Error Handling

- Form: validate client-side, show inline errors
- Three.js: try/catch around init; any failure degrades silently, never breaks the rest of the page

## Responsive Behavior

- Mobile nav collapses to hamburger
- Project grid collapses to 1 column
- Hero 3D degrades per "Mobile" note above

## Out of Scope (this spec)

- Real project content (placeholders only, user swaps in later)
- CMS/backend/database
- Blog
- Analytics
- Actual deploy/hosting setup (decided later)

## Verification Plan

Run in browser preview:
- Hero 3D renders and rotates
- Mobile viewport: nav collapses, 3D fallback engages
- Contact form: validation errors display correctly
- Scroll-reveal and smooth-scroll work
- Simulated WebGL-unavailable case: page still renders fully, no crash
