# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, dark-tech themed, static portfolio site with a rotating Three.js 3D hero object, project showcase grid, about section, and validated contact form.

**Architecture:** Plain static HTML/CSS/JS, no build tools, no package manager, no framework. Four files (`index.html`, `styles.css`, `main.js`, `hero3d.js`) plus an `/assets` folder. Three.js loaded via CDN `<script>` tag.

**Tech Stack:** HTML5, CSS3 (custom properties, Grid/Flexbox), vanilla JS (IntersectionObserver, Fetch API), Three.js r128 (CDN).

**Testing approach (deviation note):** The spec explicitly chose "no build step, no package manager" (see `docs/superpowers/specs/2026-09-09-portfolio-site-design.md`). Introducing Jest/Vitest would violate that constraint and add a build step for no real benefit on a mostly-visual static site. Per the spec's own "Verification Plan" section, every task below is verified with concrete, scripted browser checks (via the Browser preview tools — `read_page`, `read_console_messages`, `resize_window`, `computer` screenshot) instead of an automated unit-test framework. Where real testable logic exists (email validation, form validation), the plan still verifies exact input → output behavior, just via the browser console rather than a test runner.

---

## File Structure

```
index.html      — all markup, section by section
styles.css      — theme variables, layout, responsive rules
main.js         — nav toggle/active-state, scroll-reveal, form validation
hero3d.js       — Three.js hero scene, self-contained, fails safely
assets/
  favicon.svg   — simple placeholder favicon
```

---

### Task 1: Project scaffold

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `main.js`
- Create: `hero3d.js`
- Create: `assets/favicon.svg`

- [ ] **Step 1: Init git repo**

Run: `git init`
Expected: `Initialized empty Git repository in .../New folder/.git/`

- [ ] **Step 2: Create favicon placeholder**

`assets/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0a0a0f"/>
  <polygon points="16,6 26,12 26,22 16,28 6,22 6,12" fill="none" stroke="#22d3ee" stroke-width="2"/>
</svg>
```

- [ ] **Step 3: Create base index.html skeleton**

`index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jane Doe — Developer &amp; Designer</title>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>

<p style="padding:2rem;color:#e5e5e5;background:#0a0a0f;">Scaffold OK</p>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="hero3d.js"></script>
<script src="main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create empty styles.css and JS stubs**

`styles.css`:
```css
:root {
  --bg: #0a0a0f;
  --text: #e5e5e5;
  --text-dim: #9ca3af;
  --accent: #22d3ee;
  --accent-dim: rgba(34, 211, 238, 0.35);
  --card-bg: #111827;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.5;
}
```

`main.js`:
```js
// nav toggle/active-state, scroll-reveal, form validation — added in later tasks
```

`hero3d.js`:
```js
// Three.js hero scene — added in Task 5
```

- [ ] **Step 5: Verify scaffold renders**

Use Browser preview: `preview_start` with `{url: "file:///C:/Users/Public/New folder/index.html"}`, then `read_console_messages`.
Expected: page shows dark background with "Scaffold OK" text in light gray, zero console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css main.js hero3d.js assets/favicon.svg
git commit -m "chore: scaffold static site structure"
```

---

### Task 2: Base theme + fonts

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add typography and section base styles**

Append to `styles.css`:
```css
h1, h2, h3 { font-weight: 700; line-height: 1.2; }

h2 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--accent-dim);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  border-radius: 999px;
}
```

- [ ] **Step 2: Replace scaffold placeholder with real body shell**

`index.html`, replace `<p style="padding:2rem;...">Scaffold OK</p>` with:
```html
<main></main>
```

- [ ] **Step 3: Verify theme applied**

Use Browser preview: reload page, `javascript_tool` to check computed style:
```js
getComputedStyle(document.body).backgroundColor
```
Expected: `"rgb(10, 10, 15)"`.

- [ ] **Step 4: Commit**

```bash
git add styles.css index.html
git commit -m "style: add dark-tech theme base and typography"
```

---

### Task 3: Nav section

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `main.js`

- [ ] **Step 1: Add nav markup**

In `index.html`, inside `<main>`, add as first child:
```html
<nav id="nav">
  <div class="nav-inner">
    <span class="nav-logo">JD</span>
    <button id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
    <div id="nav-menu">
      <a href="#hero" class="nav-link" data-section="hero">Home</a>
      <a href="#projects" class="nav-link" data-section="projects">Projects</a>
      <a href="#about" class="nav-link" data-section="about">About</a>
      <a href="#contact" class="nav-link" data-section="contact">Contact</a>
    </div>
  </div>
</nav>
```

- [ ] **Step 2: Style nav (desktop + mobile)**

Append to `styles.css`:
```css
#nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-family: var(--font-mono);
  color: var(--accent);
  font-weight: 600;
}

#nav-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
}

#nav-menu { display: flex; gap: 1.5rem; }

.nav-link {
  color: var(--text-dim);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  transition: color 0.2s;
}

.nav-link:hover, .nav-link.active { color: var(--accent); }

@media (max-width: 640px) {
  #nav-toggle { display: block; }
  #nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--bg);
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: none;
  }
  #nav-menu.open { display: flex; }
}
```

- [ ] **Step 3: Add hamburger toggle behavior**

In `main.js`, add:
```js
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
```

- [ ] **Step 4: Verify desktop nav**

Use Browser preview: `resize_window` preset `desktop`, reload, `read_page` filter interactive.
Expected: 4 nav links visible (`Home`, `Projects`, `About`, `Contact`), no hamburger button visible.

- [ ] **Step 5: Verify mobile nav toggle**

`resize_window` preset `mobile`, reload, `computer` click on `#nav-toggle` (via `find` for "Toggle menu"), then `read_page`.
Expected: before click `#nav-menu` has no `open` class (menu hidden); after click, `#nav-menu.open` present and links visible.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css main.js
git commit -m "feat: add sticky nav with mobile hamburger toggle"
```

---

### Task 4: Hero section markup + layout

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add hero markup**

In `index.html`, inside `<main>`, after `</nav>`:
```html
<section id="hero" class="reveal">
  <canvas id="hero-canvas"></canvas>
  <div class="hero-text">
    <p class="subtitle">Developer &amp; Designer</p>
    <h1>Jane Doe</h1>
    <p class="hero-tagline">I build fast, well-crafted web products — from interface design to shipped code.</p>
    <a href="#projects" class="btn-primary">View Work</a>
  </div>
</section>
```

- [ ] **Step 2: Style hero layout**

Append to `styles.css`:
```css
#hero {
  position: relative;
  min-height: calc(100vh - 65px);
  display: flex;
  align-items: center;
  padding: 2rem 1.5rem;
  overflow: hidden;
}

#hero-canvas {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  pointer-events: none;
}

.hero-text {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.hero-text h1 {
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  margin: 0.5rem 0 1rem;
}

.hero-tagline {
  color: var(--text-dim);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--accent);
  color: #06222b;
  font-weight: 600;
  text-decoration: none;
  border-radius: 6px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--accent-dim);
}

@media (max-width: 640px) {
  #hero-canvas { width: 100%; opacity: 0.4; }
}
```

- [ ] **Step 3: Verify hero renders**

Use Browser preview: reload, `read_page`.
Expected: `#hero` section present, `h1` text "Jane Doe" visible, "View Work" link present with href `#projects`.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add hero section markup and layout"
```

---

### Task 5: Hero 3D Three.js scene

**Files:**
- Modify: `hero3d.js`

- [ ] **Step 1: Write the Three.js scene with safe fallback wrapper**

`hero3d.js` (full replacement):
```js
(function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  try {
    if (typeof THREE === 'undefined') throw new Error('THREE not loaded');

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    if (!renderer.getContext()) throw new Error('WebGL context unavailable');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 4;

    const isSmall = window.innerWidth < 600;
    const detail = isSmall ? 0 : 1;

    const geometry = new THREE.IcosahedronGeometry(1.3, detail);
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.15,
      roughness: 0.3,
    });
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);
    scene.add(solidMesh);

    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x22d3ee });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    scene.add(wireframe);

    const pointLight = new THREE.PointLight(0x22d3ee, 1.5, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    let targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    });

    function animate() {
      requestAnimationFrame(animate);
      solidMesh.rotation.y += 0.003;
      solidMesh.rotation.x += 0.001;
      wireframe.rotation.copy(solidMesh.rotation);

      solidMesh.rotation.y += (targetX - solidMesh.rotation.y * 0) * 0;
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();
  } catch (err) {
    console.warn('Hero3D disabled:', err.message);
    canvas.style.display = 'none';
  }
})();
```

- [ ] **Step 2: Verify 3D scene renders and rotates**

Use Browser preview: reload, `read_console_messages` (expect no errors), `computer` screenshot of hero area, wait 1s, screenshot again.
Expected: cyan wireframe icosahedron visible over dark background in the right half of hero; the two screenshots show a different rotation angle (proof of animation).

- [ ] **Step 3: Verify safe fallback when WebGL unavailable**

Use Browser preview `javascript_tool`:
```js
HTMLCanvasElement.prototype.getContext = () => null;
location.reload();
```
Wait for reload, then `read_console_messages` and `read_page`.
Expected: console contains a `"Hero3D disabled"` warning, `#hero-canvas` has `display: none` (via computed style check), rest of hero text still renders normally, no thrown/uncaught errors.

Then reset by navigating fresh (new tab or `navigate` reload without the override) before continuing to later tasks.

- [ ] **Step 4: Commit**

```bash
git add hero3d.js
git commit -m "feat: add Three.js rotating hero object with safe fallback"
```

---

### Task 6: Hero 3D mobile behavior

**Files:**
- Modify: `hero3d.js` (already reduces `detail` for width < 600 — verify only)

- [ ] **Step 1: Verify mobile geometry reduction**

Use Browser preview: `resize_window` preset `mobile`, reload page, `javascript_tool`:
```js
window.innerWidth
```
Expected: value `< 600`, confirming the `isSmall` branch in `hero3d.js` Step 1 (Task 5) applies `detail = 0` (fewer polygons) — this was already coded in Task 5; this step is a verification-only checkpoint.

- [ ] **Step 2: Verify canvas still visible and page not broken on mobile**

`read_page` on mobile viewport.
Expected: `#hero-canvas` present, hero text still centered and readable, no horizontal scrollbar (check `document.documentElement.scrollWidth <= window.innerWidth` via `javascript_tool`).

- [ ] **Step 3: Reset viewport**

`resize_window` preset `desktop`.

No commit needed — this task is verification-only, no code changed.

---

### Task 7: Projects section

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add projects section markup with 6 placeholder cards**

In `index.html`, inside `<main>`, after `</section>` (hero close):
```html
<section id="projects" class="section reveal">
  <p class="subtitle">Selected Work</p>
  <h2>Projects</h2>
  <div class="project-grid">

    <article class="project-card">
      <h3>Project One</h3>
      <p>Placeholder description — replace with a real project summary.</p>
      <div class="tags"><span class="tag">React</span><span class="tag">Node</span></div>
      <div class="project-links">
        <a href="#" class="project-link">Live</a>
        <a href="#" class="project-link">Repo</a>
      </div>
    </article>

    <article class="project-card">
      <h3>Project Two</h3>
      <p>Placeholder description — replace with a real project summary.</p>
      <div class="tags"><span class="tag">Figma</span><span class="tag">CSS</span></div>
      <div class="project-links">
        <a href="#" class="project-link">Live</a>
        <a href="#" class="project-link">Repo</a>
      </div>
    </article>

    <article class="project-card">
      <h3>Project Three</h3>
      <p>Placeholder description — replace with a real project summary.</p>
      <div class="tags"><span class="tag">Vue</span><span class="tag">API</span></div>
      <div class="project-links">
        <a href="#" class="project-link">Live</a>
        <a href="#" class="project-link">Repo</a>
      </div>
    </article>

    <article class="project-card">
      <h3>Project Four</h3>
      <p>Placeholder description — replace with a real project summary.</p>
      <div class="tags"><span class="tag">TypeScript</span><span class="tag">UI</span></div>
      <div class="project-links">
        <a href="#" class="project-link">Live</a>
        <a href="#" class="project-link">Repo</a>
      </div>
    </article>

    <article class="project-card">
      <h3>Project Five</h3>
      <p>Placeholder description — replace with a real project summary.</p>
      <div class="tags"><span class="tag">Python</span><span class="tag">Data</span></div>
      <div class="project-links">
        <a href="#" class="project-link">Live</a>
        <a href="#" class="project-link">Repo</a>
      </div>
    </article>

    <article class="project-card">
      <h3>Project Six</h3>
      <p>Placeholder description — replace with a real project summary.</p>
      <div class="tags"><span class="tag">Branding</span><span class="tag">Web</span></div>
      <div class="project-links">
        <a href="#" class="project-link">Live</a>
        <a href="#" class="project-link">Repo</a>
      </div>
    </article>

  </div>
</section>
```

- [ ] **Step 2: Style project grid and cards**

Append to `styles.css`:
```css
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.project-card {
  background: var(--card-bg);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 1.5rem;
  transition: transform 0.2s, border-color 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-dim);
}

.project-card h3 { margin-bottom: 0.5rem; }

.project-card p {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }

.project-links { display: flex; gap: 1rem; }

.project-link {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  text-decoration: none;
}

.project-link:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .project-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .project-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify grid columns at three breakpoints**

Use Browser preview: `resize_window` width 1440 height 900 → `javascript_tool` `getComputedStyle(document.querySelector('.project-grid')).gridTemplateColumns` → expect 3 values.
`resize_window` width 800 height 900 → expect 2 values.
`resize_window` width 375 height 800 → expect 1 value.
Reset with `resize_window` preset `desktop` after.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add projects grid section with placeholder cards"
```

---

### Task 8: About section

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add about markup**

In `index.html`, inside `<main>`, after projects `</section>`:
```html
<section id="about" class="section reveal">
  <p class="subtitle">About</p>
  <h2>Who I Am</h2>
  <div class="about-content">
    <p>I'm a developer and designer who enjoys building products end-to-end — from wireframe to deployed interface. Placeholder bio text, replace with your own background, experience, and what you're looking for.</p>
    <div class="tags skills-tags">
      <span class="tag">JavaScript</span>
      <span class="tag">React</span>
      <span class="tag">Node.js</span>
      <span class="tag">Figma</span>
      <span class="tag">CSS</span>
      <span class="tag">UI/UX</span>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Style about section**

Append to `styles.css`:
```css
.about-content p {
  max-width: 700px;
  color: var(--text-dim);
  margin: 1.5rem 0;
}

.skills-tags { gap: 0.6rem; }
```

- [ ] **Step 3: Verify about section renders**

`read_page`.
Expected: `#about` heading "Who I Am" present, 6 `.tag` spans inside `.skills-tags`.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add about section with bio and skill tags"
```

---

### Task 9: Contact section markup

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add contact markup**

In `index.html`, inside `<main>`, after about `</section>`:
```html
<section id="contact" class="section reveal">
  <p class="subtitle">Get In Touch</p>
  <h2>Contact</h2>
  <div class="contact-layout">
    <form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" novalidate>
      <div class="field">
        <label for="name">Name</label>
        <input type="text" id="name" name="name">
        <span class="field-error" id="name-error"></span>
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input type="text" id="email" name="email">
        <span class="field-error" id="email-error"></span>
      </div>
      <div class="field">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5"></textarea>
        <span class="field-error" id="message-error"></span>
      </div>
      <button type="submit" class="btn-primary">Send Message</button>
      <p id="form-status" role="status"></p>
    </form>
    <div class="contact-direct">
      <a href="mailto:jane@example.com" class="project-link">jane@example.com</a>
      <a href="https://github.com/yourhandle" class="project-link" target="_blank" rel="noopener">GitHub</a>
      <a href="https://linkedin.com/in/yourhandle" class="project-link" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Style contact section**

Append to `styles.css`:
```css
.contact-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  margin-top: 2.5rem;
}

.field { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }

.field label { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim); }

.field input, .field textarea {
  background: var(--card-bg);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  color: var(--text);
  font-family: var(--font-sans);
}

.field input:focus, .field textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.field-error {
  color: #f87171;
  font-size: 0.8rem;
  min-height: 1em;
}

#form-status { margin-top: 1rem; font-size: 0.9rem; }
#form-status.success { color: var(--accent); }
#form-status.error { color: #f87171; }

.contact-direct { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }

@media (max-width: 640px) {
  .contact-layout { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify contact section renders**

`read_page`.
Expected: `#contact-form` present with fields `name`, `email`, `message`, submit button, and 3 direct-contact links below.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add contact section markup with form and direct links"
```

---

### Task 10: Contact form validation logic

**Files:**
- Modify: `main.js`
- Test approach: browser-console behavioral checks (documented in Step 3/4/5 below) — no test framework, per Testing approach note at top of plan.

- [ ] **Step 1: Write validation + submit-handling functions**

Append to `main.js`:
```js
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactForm(form) {
  const errors = {};
  const name = form.elements['name'].value.trim();
  const email = form.elements['email'].value.trim();
  const message = form.elements['message'].value.trim();

  if (!name) errors.name = 'Name is required.';
  if (!email) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!message) errors.message = 'Message is required.';

  return errors;
}

function showFormErrors(errors) {
  ['name', 'email', 'message'].forEach((field) => {
    const el = document.getElementById(`${field}-error`);
    el.textContent = errors[field] || '';
  });
}

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errors = validateContactForm(contactForm);
  showFormErrors(errors);
  if (Object.keys(errors).length > 0) return;

  formStatus.textContent = 'Sending...';
  formStatus.className = '';

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      formStatus.textContent = 'Message sent — thanks! I\'ll get back to you soon.';
      formStatus.className = 'success';
      contactForm.reset();
    } else {
      formStatus.textContent = 'Something went wrong. Please email me directly instead.';
      formStatus.className = 'error';
    }
  } catch (err) {
    formStatus.textContent = 'Network error. Please email me directly instead.';
    formStatus.className = 'error';
  }
});
```

- [ ] **Step 2: Verify empty-submit shows all three errors**

Use Browser preview: reload, `computer` click submit button on empty form, `read_page` restricted to `#contact-form`.
Expected: `#name-error` = "Name is required.", `#email-error` = "Email is required.", `#message-error` = "Message is required."; no network request fired (`read_network_requests` shows none to `formspree.io`).

- [ ] **Step 3: Verify invalid email format is caught**

`form_input` name field = "Jane", email field = "not-an-email", message field = "Hello", click submit, `read_page`.
Expected: `#email-error` = "Enter a valid email address.", `#name-error` and `#message-error` empty.

- [ ] **Step 4: Verify valid submission attempts network request**

Temporarily edit `#contact-form` action for this check only: `javascript_tool`:
```js
document.getElementById('contact-form').action = 'https://httpbin.org/post';
```
Then `form_input` valid name/email/message, click submit, wait 1s, `read_network_requests` filtered to `httpbin.org`.
Expected: one POST request to `httpbin.org/post`, `#form-status` shows the success message with class `success`.

This is a dev-only verification target — do not commit `httpbin.org` as the action; the real `index.html` keeps the `formspree.io/f/YOUR_FORM_ID` placeholder from Task 9, which the site owner replaces with their real Formspree form ID before going live.

- [ ] **Step 5: Commit**

```bash
git add main.js
git commit -m "feat: add contact form client-side validation and submit handling"
```

---

### Task 11: Scroll-reveal + nav active-state

**Files:**
- Modify: `styles.css`
- Modify: `main.js`

- [ ] **Step 1: Add reveal CSS states**

Append to `styles.css`:
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: Add IntersectionObserver logic**

Append to `main.js`:
```js
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });
revealElements.forEach((el) => revealObserver.observe(el));

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main > section[id]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.5 });
sections.forEach((section) => navObserver.observe(section));
```

- [ ] **Step 3: Verify reveal-on-scroll**

Use Browser preview: reload, `javascript_tool`:
```js
document.getElementById('contact').classList.contains('visible')
```
Expected: `false` (not yet scrolled into view). Then `computer` scroll down to bottom, wait 0.5s, re-run the same check.
Expected: `true`.

- [ ] **Step 4: Verify nav active-state updates on scroll**

After scrolling to `#projects` (via `computer scroll_to` using the `#projects` ref from `read_page`), `javascript_tool`:
```js
document.querySelector('.nav-link[data-section="projects"]').classList.contains('active')
```
Expected: `true`.

- [ ] **Step 5: Commit**

```bash
git add styles.css main.js
git commit -m "feat: add scroll-reveal animation and nav active-section highlighting"
```

---

### Task 12: Footer

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Add footer markup**

In `index.html`, inside `<main>`, after contact `</section>`, before `</main>`:
```html
<footer>
  <p>&copy; 2026 Jane Doe. Built with vanilla JS and Three.js.</p>
</footer>
```

- [ ] **Step 2: Style footer**

Append to `styles.css`:
```css
footer {
  text-align: center;
  padding: 2rem 1.5rem;
  color: var(--text-dim);
  font-size: 0.85rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}
```

- [ ] **Step 3: Verify footer renders at page bottom**

`read_page`.
Expected: footer text visible as last element in `<main>`.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add footer"
```

---

### Task 13: Full responsive + cross-check pass

**Files:**
- Modify: `styles.css` (only if issues found)

- [ ] **Step 1: Check for horizontal overflow at 375px, 768px, 1440px**

Use Browser preview: for each width in `[375, 768, 1440]` (height 900): `resize_window`, reload, `javascript_tool`:
```js
document.documentElement.scrollWidth <= window.innerWidth
```
Expected: `true` at every width. If `false` at any width, inspect via `zoom` screenshot on the overflowing region, fix the offending CSS rule in `styles.css`, re-check.

- [ ] **Step 2: Screenshot each breakpoint for visual sign-off**

`computer screenshot` at each of the 3 widths above.
Expected: nav, hero, projects grid, about, contact, footer all render without overlapping or clipped text at each width.

- [ ] **Step 3: Reset viewport**

`resize_window` preset `desktop`.

- [ ] **Step 4: Commit (only if Step 1 required fixes)**

```bash
git add styles.css
git commit -m "fix: resolve responsive overflow issues"
```

If no fixes were needed, skip this commit.

---

### Task 14: Final full-page verification against spec checklist

**Files:** none (verification-only)

- [ ] **Step 1: Hero 3D renders and rotates** — re-run Task 5 Step 2 check.

- [ ] **Step 2: Mobile nav + 3D fallback** — re-run Task 3 Step 5 and Task 6 checks.

- [ ] **Step 3: Contact form validation** — re-run Task 10 Steps 2–4 checks.

- [ ] **Step 4: Scroll-reveal + smooth-scroll** — re-run Task 11 Steps 3–4; additionally `computer` click a nav link (e.g. "Projects") and confirm the page scrolls smoothly to `#projects` (via `html { scroll-behavior: smooth }` from Task 2).

- [ ] **Step 5: Simulated WebGL-unavailable case** — re-run Task 5 Step 3; confirm zero uncaught console errors and full page still renders.

- [ ] **Step 6: Final screenshot for sign-off**

`computer screenshot` of the hero section at desktop width.
Expected: matches the approved "dark-tech + floating 3D hero object" direction from brainstorming.

No commit — this task only re-verifies prior work.
