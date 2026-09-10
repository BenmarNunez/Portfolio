// Cursor-reactive 3D tilt for the hero avatar — a plain CSS 3D transform
// driven directly by pointer position. No rAF loop: a single transform
// write per mousemove is cheap for one element (unlike Neon Border's many
// simultaneous instances, which needed a shared driver). The CSS transition
// on .hero-avatar-inner smooths the motion between writes. Skips setup
// entirely under prefers-reduced-motion or if the markup isn't present, so
// the idle float (CSS-only) is all that shows in either case.
(function initAvatarTilt() {
  try {
    const wrap = document.getElementById('hero-avatar');
    const inner = wrap && wrap.querySelector('.hero-avatar-inner');
    const hero = document.getElementById('hero');
    if (!wrap || !inner || !hero) return;

    const prefersReducedMotion = Boolean(
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    if (prefersReducedMotion) return;

    const MAX_TILT_DEG = 18;

    function onMove(e) {
      const rect = hero.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      const clampedX = Math.max(-1, Math.min(1, dx));
      const clampedY = Math.max(-1, Math.min(1, dy));
      const rotY = clampedX * MAX_TILT_DEG;
      const rotX = clampedY * -MAX_TILT_DEG;
      inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    function onLeave() {
      inner.style.transform = '';
    }

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
  } catch (err) {
    console.warn('AvatarTilt disabled:', err.message);
  }
})();
