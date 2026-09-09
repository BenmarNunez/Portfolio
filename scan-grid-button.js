// Scan Grid Button — ported from Originkit's React/framer-motion component
// (originkit.dev) to plain JS. The corner-bracket SVG paths are generated
// with the same math as the source (armFor/getCornerPaths), animated via
// requestAnimationFrame instead of framer-motion. The scanline sweep and
// text color-flash are plain CSS (:hover/:focus-visible-driven via a
// toggled class, see styles.css) — framer-motion isn't needed for those,
// CSS keyframes do the same job with less code. glitchIntensity is kept at
// the source's own default (0 — no positional shake, just the red/cyan
// text-shadow flash) rather than adding jitter that wasn't in the spec.
(function initScanGridButtons() {
  const buttons = document.querySelectorAll('.scan-btn');
  if (!buttons.length) return;

  const IDLE_ARM_PCT = 8;
  const HOVER_ARM_PCT = 65;
  const TRANSITION_MS = 250;

  function armFor(pct, w, h) {
    return ((pct / 100) * Math.min(w, h)) / 2;
  }

  function getCornerPaths(w, h, r, arm) {
    const clampedR = Math.min(r, w / 2, h / 2);
    const strokeOffset = 0.75;
    const R = Math.max(0.01, clampedR - strokeOffset);
    const R0 = clampedR;

    const availH = Math.max(0, h / 2 - R0);
    const availW = Math.max(0, w / 2 - R0);
    const armH = Math.min(arm, availH);
    const armW = Math.min(arm, availW);

    return {
      tl: `M ${strokeOffset} ${R0 + armH} L ${strokeOffset} ${R0} A ${R} ${R} 0 0 1 ${R0} ${strokeOffset} L ${R0 + armW} ${strokeOffset}`,
      tr: `M ${w - R0 - armW} ${strokeOffset} L ${w - R0} ${strokeOffset} A ${R} ${R} 0 0 1 ${w - strokeOffset} ${R0} L ${w - strokeOffset} ${R0 + armH}`,
      br: `M ${w - strokeOffset} ${h - R0 - armH} L ${w - strokeOffset} ${h - R0} A ${R} ${R} 0 0 1 ${w - R0} ${h - strokeOffset} L ${w - R0 - armW} ${h - strokeOffset}`,
      bl: `M ${R0 + armW} ${h - strokeOffset} L ${R0} ${h - strokeOffset} A ${R} ${R} 0 0 1 ${strokeOffset} ${h - R0} L ${strokeOffset} ${h - R0 - armH}`,
    };
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function setup(btn) {
    try {
      const label = btn.textContent.trim();
      if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', label);

      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'scan-svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('preserveAspectRatio', 'none');

      const paths = {};
      ['tl', 'tr', 'br', 'bl'].forEach((key) => {
        const p = document.createElementNS(svgNS, 'path');
        p.setAttribute('class', 'scan-bracket');
        svg.appendChild(p);
        paths[key] = p;
      });

      const scanline = document.createElement('span');
      scanline.className = 'scanline';
      scanline.setAttribute('aria-hidden', 'true');
      scanline.innerHTML = '<span class="scan-grad"></span><span class="scan-edge"></span>';

      const textWrap = document.createElement('span');
      textWrap.className = 'scan-text';
      textWrap.setAttribute('aria-hidden', 'true');
      label.split('').forEach((ch, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.style.setProperty('--i', i);
        span.textContent = ch === ' ' ? ' ' : ch;
        textWrap.appendChild(span);
      });

      btn.textContent = '';
      btn.appendChild(svg);
      btn.appendChild(scanline);
      btn.appendChild(textWrap);

      let w = 0, h = 0, radius = 0;
      let currentArmPct = IDLE_ARM_PCT;
      let animFrame = null;
      let animStart = 0;
      let animFrom = IDLE_ARM_PCT;
      let animTo = IDLE_ARM_PCT;

      function measure() {
        w = btn.clientWidth;
        h = btn.clientHeight;
        const cs = getComputedStyle(btn);
        const r = parseFloat(cs.borderTopLeftRadius) || 0;
        radius = r;
        if (w > 0 && h > 0) {
          svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
          applyArm(currentArmPct);
        }
      }

      function applyArm(pct) {
        if (w <= 0 || h <= 0) return;
        const d = getCornerPaths(w, h, radius, armFor(pct, w, h));
        paths.tl.setAttribute('d', d.tl);
        paths.tr.setAttribute('d', d.tr);
        paths.br.setAttribute('d', d.br);
        paths.bl.setAttribute('d', d.bl);
      }

      function step(now) {
        const t = Math.min(1, (now - animStart) / TRANSITION_MS);
        currentArmPct = animFrom + (animTo - animFrom) * easeInOut(t);
        applyArm(currentArmPct);
        if (t < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          animFrame = null;
        }
      }

      const prefersReducedMotion = Boolean(
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );

      function animateTo(targetPct) {
        if (prefersReducedMotion) {
          currentArmPct = targetPct;
          applyArm(currentArmPct);
          return;
        }
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrom = currentArmPct;
        animTo = targetPct;
        animStart = performance.now();
        animFrame = requestAnimationFrame(step);
      }

      if ('ResizeObserver' in window) {
        new ResizeObserver(measure).observe(btn);
      } else {
        window.addEventListener('resize', measure);
      }
      measure();

      const activate = () => {
        if (!prefersReducedMotion) btn.classList.add('scan-active');
        animateTo(HOVER_ARM_PCT);
      };
      const deactivate = () => {
        btn.classList.remove('scan-active');
        animateTo(IDLE_ARM_PCT);
      };

      btn.addEventListener('mouseenter', activate);
      btn.addEventListener('mouseleave', deactivate);
      btn.addEventListener('focus', activate);
      btn.addEventListener('blur', deactivate);
    } catch (err) {
      console.warn('ScanGridButton disabled for one button:', err.message);
    }
  }

  buttons.forEach(setup);
})();
