/**
 * Header: barra de progreso de lectura, sombra al hacer scroll
 * y marca en el menú la sección que se está viendo.
 */
(() => {
  const header = document.querySelector("header");
  if (!header) return;

  const root = document.documentElement;
  let queued = false;

  function update() {
    queued = false;
    const max = root.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    header.style.setProperty("--progress", progress.toFixed(4));
    header.classList.toggle("scrolled", window.scrollY > 8);
  }

  function onScroll() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  // ---------- Sección activa en el menú ----------
  if (!("IntersectionObserver" in window)) return;

  const links = new Map();
  header.querySelectorAll('nav a:not(.btn)[href^="#"]').forEach((a) => {
    const section = document.querySelector(a.getAttribute("href"));
    if (section) links.set(section, a);
  });

  // Una sección cuenta como activa cuando cruza la franja central de la pantalla
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = links.get(entry.target);
        link.classList.toggle("on", entry.isIntersecting);
        if (entry.isIntersecting) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  links.forEach((_, section) => observer.observe(section));
})();
