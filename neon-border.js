// Neon Border — ported from Originkit's React component (originkit.dev) to
// plain JS. The perimeter/arc math (perimeterPoint, cornerLap, buildArc, the
// step/glide easing) is copied verbatim; only the React lifecycle (props,
// refs, useEffect) was replaced with a shared requestAnimationFrame driver
// across all instances instead of one rAF loop per component, plus an
// IntersectionObserver so off-screen cards stop computing arcs entirely.
//
// Two deliberate departures from the source's defaults, both because this
// runs on a dense grid of cards rather than one hero-sized element:
// - The glow reach/blur constants are scaled way down (the source's glow
//   bleeds up to ~160px outside the element, which would have neighboring
//   cards' glows colliding through the grid gap).
// - "rounded" is computed per-card from a fixed target pixel radius (10px,
//   matching .project-card/.skill-card's own border-radius) rather than a
//   flat percentage, since cards vary in size.
(function initNeonBorders() {
  const targets = document.querySelectorAll('.project-card, .skill-card');
  if (!targets.length) return;

  const maskSupported = Boolean(
    window.CSS &&
    (CSS.supports('mask-composite', 'exclude') || CSS.supports('-webkit-mask-composite', 'xor'))
  );
  if (!maskSupported) return;

  try {
    const rootStyle = getComputedStyle(document.documentElement);
    const ACCENT = (rootStyle.getPropertyValue('--accent') || '#ff3b3b').trim();

    const CONFIG = {
      color: ACCENT,
      thickness: 2,
      borderSizePct: 30,
      glowPct: 55,
      speed: 9,
      movement: 'continuous',
      targetRadiusPx: 10,
    };

    const EDGE_COPIES = 2;
    const GLOW_LAYERS = [
      { blur: 3, opacity: 0.5, reach: 0.3 },
      { blur: 6, opacity: 0.3, reach: 0.6 },
      { blur: 16, opacity: 0.18, reach: 1 },
    ];
    const MAX_GLOW_BLUR = 16;
    const MAX_GLOW_REACH = 14;
    const GLOW_OUTER = 6 + MAX_GLOW_REACH + MAX_GLOW_BLUR * 2;

    const ARC_SAMPLES = 24;
    const MIN_ARC = 0.015;

    const SLOWEST_CYCLE = 30, FASTEST_CYCLE = 4, SLOWEST_STEP = 3, FASTEST_STEP = 0.35;
    const STEP_EASE = [0.72, 0.16, 0.18, 1.05];
    const GLIDE_EASE = [0.65, 0, 0.35, 1];

    function withAlpha(input, alpha) {
      const a = Math.max(0, Math.min(1, alpha));
      if (typeof input !== 'string') return `rgba(0,0,0,${a})`;
      const s = input.trim();
      const hex = s.match(/^#([0-9a-f]{3,8})$/i);
      if (hex) {
        let h = hex[1];
        if (h.length === 3 || h.length === 4) {
          h = h.split('').map((c) => c + c).join('');
        }
        if (h.length >= 6) {
          const n = parseInt(h.slice(0, 6), 16);
          if (!Number.isNaN(n)) return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
        }
        return `rgba(0,0,0,${a})`;
      }
      const rgb = s.match(/^rgba?\(([^)]+)\)/i);
      if (rgb) {
        const parts = rgb[1].split(',').map((v) => parseFloat(v));
        if (parts.length >= 3 && parts.slice(0, 3).every((n) => !Number.isNaN(n))) {
          return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
        }
      }
      return `rgba(0,0,0,${a})`;
    }

    function perimeterPoint(u, w, h) {
      const d = (((u % 1) + 1) % 1) * 2 * (w + h);
      if (d < w) return [d, 0];
      if (d < w + h) return [w, d - w];
      if (d < w * 2 + h) return [w - (d - w - h), h];
      return [0, h - (d - w * 2 - h)];
    }

    function cornerLap(k, w, h) {
      const p = 2 * (w + h);
      const at = [0, w / p, (w + h) / p, (w * 2 + h) / p];
      return Math.floor(k / 4) + at[((k % 4) + 4) % 4];
    }

    function perimeterAngle(u, w, h) {
      const [x, y] = perimeterPoint(u, w, h);
      return (Math.atan2(x - w / 2, h / 2 - y) * 180) / Math.PI;
    }

    function buildArc(lap, lengthPct, w, h, color) {
      const fw = w > 0 ? w : 100;
      const fh = h > 0 ? h : 100;
      const len = Math.max(0, Math.min(100, lengthPct));
      const span = Math.max(MIN_ARC, (len / 100) * 0.5);
      const solidT = len / 100;

      const stops = [];
      let base = 0, prev = 0, acc = 0;

      for (let i = 0; i <= ARC_SAMPLES; i++) {
        const f = i / ARC_SAMPLES;
        const angle = perimeterAngle(lap + (f - 0.5) * span, fw, fh);
        if (i === 0) {
          base = angle;
        } else {
          let d = angle - prev;
          while (d > 180) d -= 360;
          while (d < -180) d += 360;
          acc += d;
        }
        prev = angle;

        const t = Math.abs(f - 0.5) * 2;
        const k = solidT >= 1 ? 1 : t <= solidT ? 1 : 1 - (t - solidT) / (1 - solidT);
        stops.push(`${withAlpha(color, k * k * (3 - 2 * k))} ${acc.toFixed(2)}deg`);
      }

      stops.push(`${withAlpha(color, 0)} ${acc.toFixed(2)}deg`);
      stops.push(`${withAlpha(color, 0)} 360deg`);

      return `conic-gradient(from ${base.toFixed(2)}deg at 50% 50%, ${stops.join(', ')})`;
    }

    function makeEaseFn(pts) {
      const [x1, y1, x2, y2] = pts;
      const bez = (a, b, t) => {
        const u = 1 - t;
        return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
      };
      return (t) => {
        const x = Math.max(0, Math.min(1, t));
        let s = x;
        for (let i = 0; i < 8; i++) {
          const cx = bez(x1, x2, s) - x;
          const u = 1 - s;
          const dx = 3 * u * u * x1 + 6 * u * s * (x2 - x1) + 3 * s * s * (1 - x2);
          if (Math.abs(dx) < 1e-6) break;
          s -= cx / dx;
          s = Math.max(0, Math.min(1, s));
        }
        return bez(y1, y2, s);
      };
    }
    const stepEase = makeEaseFn(STEP_EASE);
    const glideEase = makeEaseFn(GLIDE_EASE);

    function applyMask(el) {
      el.style.webkitMaskImage = 'linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)';
      el.style.webkitMaskClip = 'content-box, border-box';
      el.style.webkitMaskComposite = 'xor';
      el.style.maskImage = 'linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)';
      el.style.maskClip = 'content-box, border-box';
      el.style.maskComposite = 'exclude';
    }

    function makeBand(radiusPx, r, offset) {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.inset = (offset - r) + 'px';
      div.style.boxSizing = 'border-box';
      div.style.padding = r + 'px';
      div.style.borderRadius = radiusPx > 0 ? (radiusPx + r) + 'px' : '0';
      div.style.background = 'var(--arc)';
      applyMask(div);
      return div;
    }

    function makeGlowLayer(radiusPx, r, blurPx, opacity) {
      const outer = document.createElement('div');
      outer.style.position = 'absolute';
      outer.style.inset = (-GLOW_OUTER) + 'px';
      outer.style.boxSizing = 'border-box';
      outer.style.padding = GLOW_OUTER + 'px';
      outer.style.borderRadius = radiusPx > 0 ? (radiusPx + GLOW_OUTER) + 'px' : '0';
      outer.style.opacity = String(opacity);
      outer.style.mixBlendMode = 'plus-lighter';
      outer.style.filter = blurPx ? `blur(${blurPx}px)` : 'none';
      applyMask(outer);
      outer.appendChild(makeBand(radiusPx, r, GLOW_OUTER));
      return outer;
    }

    function makeEdgeBand(radiusPx, thick) {
      const wrap = document.createElement('div');
      wrap.style.position = 'absolute';
      wrap.style.inset = '0';
      wrap.style.mixBlendMode = 'plus-lighter';
      wrap.appendChild(makeBand(radiusPx, thick, 0));
      return wrap;
    }

    function rebuildGroup(groupEl, w, h) {
      groupEl.textContent = '';
      const radiusPx = (Math.max(0, Math.min(100, roundedPctFor(w, h))) / 100) * (Math.min(w, h) / 2);
      const amount = CONFIG.glowPct / 100;
      const thick = Math.max(1, Math.min(10, CONFIG.thickness));

      if (amount > 0) {
        GLOW_LAYERS.forEach((l) => {
          const r = thick + amount * MAX_GLOW_REACH * l.reach;
          groupEl.appendChild(makeGlowLayer(radiusPx, r, l.blur, l.opacity));
        });
      }
      for (let i = 0; i < EDGE_COPIES; i++) {
        groupEl.appendChild(makeEdgeBand(radiusPx, thick));
      }
    }

    function roundedPctFor(w, h) {
      const half = Math.min(w, h) / 2;
      if (half <= 0) return 0;
      return (CONFIG.targetRadiusPx / half) * 100;
    }

    const prefersReducedMotion = Boolean(
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    function setupInstance(host) {
      const overlay = document.createElement('div');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '2';

      const groupA = document.createElement('div');
      const groupB = document.createElement('div');
      [groupA, groupB].forEach((g) => {
        g.style.position = 'absolute';
        g.style.inset = '0';
        g.style.overflow = 'visible';
      });
      overlay.appendChild(groupA);
      overlay.appendChild(groupB);
      host.appendChild(overlay);

      let w = 0, h = 0;
      function measure() {
        const r = host.getBoundingClientRect();
        if (r.width === w && r.height === h) return;
        w = r.width;
        h = r.height;
        if (w > 0 && h > 0) {
          rebuildGroup(groupA, w, h);
          rebuildGroup(groupB, w, h);
        }
      }
      if ('ResizeObserver' in window) {
        new ResizeObserver(measure).observe(host);
      } else {
        window.addEventListener('resize', measure);
      }
      measure();

      let visible = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((e) => { visible = e.isIntersecting; });
        }, { threshold: 0.01 }).observe(host);
      }

      let corner = 0, stepT = 0, lap = 0;

      function paintArc() {
        if (w <= 0 || h <= 0) return;
        groupA.style.setProperty('--arc', buildArc(lap, CONFIG.borderSizePct, w, h, CONFIG.color));
        groupB.style.setProperty('--arc', buildArc(lap + 0.5, CONFIG.borderSizePct, w, h, CONFIG.color));
      }

      if (prefersReducedMotion) {
        paintArc();
        return { tick() {} };
      }

      return {
        tick(dt) {
          if (!visible) return;
          const step = CONFIG.movement === 'step';
          const s = Math.max(1, Math.min(20, CONFIG.speed));
          const beat = step
            ? SLOWEST_STEP + ((FASTEST_STEP - SLOWEST_STEP) * (s - 1)) / 19
            : (SLOWEST_CYCLE + ((FASTEST_CYCLE - SLOWEST_CYCLE) * (s - 1)) / 19) / 4;
          stepT += dt / beat;
          while (stepT >= 1) {
            stepT -= 1;
            corner += 1;
          }
          const eased = step ? stepEase(Math.min(1, stepT * 2)) : glideEase(stepT);
          const from = cornerLap(corner, w || 100, h || 100);
          const to = cornerLap(corner + 1, w || 100, h || 100);
          lap = from + (to - from) * eased;
          paintArc();
        },
      };
    }

    const instances = [];
    targets.forEach((host) => {
      try {
        instances.push(setupInstance(host));
      } catch (err) {
        console.warn('NeonBorder disabled for one card:', err.message);
      }
    });

    if (!prefersReducedMotion && instances.length) {
      let last = performance.now();
      let raf;
      function loop(now) {
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        try {
          instances.forEach((inst) => inst.tick(dt));
        } catch (err) {
          console.warn('NeonBorder animation loop disabled:', err.message);
          cancelAnimationFrame(raf);
          return;
        }
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
    }
  } catch (err) {
    console.warn('NeonBorder disabled:', err.message);
  }
})();
