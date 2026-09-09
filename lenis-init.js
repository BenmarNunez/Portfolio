// Lenis smooth scroll — initializes the library (loaded via CDN in
// index.html, no bundler/npm needed for a plain static site) and wires it
// into the existing anchor-link navigation. Falls back to the native
// scroll-behavior:smooth CSS already on <html> if the CDN script fails to
// load or the user prefers reduced motion — this file simply never runs
// its setup in either case, so nothing regresses.
(function initLenis() {
  try {
    if (typeof Lenis === 'undefined') return;

    const prefersReducedMotion = Boolean(
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    if (prefersReducedMotion) return;

    const navHeight = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
    ) || 0;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Route internal anchor links (nav, "View Work", etc.) through Lenis
    // instead of the browser's instant jump, keeping the sticky nav's
    // height as scroll offset so a target section doesn't end up tucked
    // underneath it.
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -navHeight });
      });
    });
  } catch (err) {
    console.warn('Lenis disabled:', err.message);
  }
})();
