/**
 * Compromiso: cada fila de la tabla se anima al entrar en pantalla
 * (la columna "con AXKA" se descubre y los íconos se dibujan).
 */
(() => {
  const table = document.getElementById("cmp");
  if (
    !table ||
    !("IntersectionObserver" in window) ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) return;

  table.classList.add("live");

  // Normaliza la longitud de los trazos para animar stroke-dashoffset de 1 a 0
  table.querySelectorAll(".cr svg *").forEach((el) => el.setAttribute("pathLength", "1"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  table.querySelectorAll(".cr:not(.hd)").forEach((row) => observer.observe(row));
})();
