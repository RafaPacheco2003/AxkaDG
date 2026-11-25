/**
 * Reveal: los elementos aparecen al entrar en pantalla.
 * Agrega .rv (estado oculto) + un retraso escalonado (--delay)
 * y luego .in cuando el elemento es visible. Estilos en reveal.css.
 */
(() => {
  if (
    !("IntersectionObserver" in window) ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  function reveal(elements, getDelay) {
    elements.forEach((el, i) => {
      el.classList.add("rv");
      el.style.setProperty("--delay", `${getDelay(el, i)}s`);
      observer.observe(el);
    });
  }

  // Los títulos <h2> tienen su propio efecto (split-headings.js)

  // Servicios
  reveal(
    document.querySelectorAll("#servicios .head p, .svc .tabs, .svc .sp"),
    (_, i) => 0.1 + i * 0.12
  );

  // Compromiso + FAQ (las preguntas se escalonan entre sí)
  let faqIndex = 0;
  reveal(
    document.querySelectorAll(".com .top p, .cr.hd, .cl, .faq .side > :not(h2), .fq"),
    (el, i) => (el.classList.contains("fq") ? faqIndex++ * 0.1 : (i % 4) * 0.1)
  );

  // Contacto
  const contact = document.getElementById("contacto");
  if (contact) {
    reveal(
      contact.querySelectorAll(".lead2, .tel, .wl > *, .next > div, .fcard"),
      (_, i) => (i % 5) * 0.09
    );
  }

  // Footer
  reveal(document.querySelectorAll(".fg > div"), (_, i) => i * 0.08);
})();
