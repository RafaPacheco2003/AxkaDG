/**
 * Títulos de sección: cada palabra sube desde una máscara al entrar
 * en pantalla (mismo efecto que el título del hero). Estilos en effects.css.
 */
(() => {
  if (
    !("IntersectionObserver" in window) ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) return;

  const headings = document.querySelectorAll(
    "#servicios .head h2, .pl h2, .com .top h2, .faq .side h2, .contact h2, .fcta h2"
  );

  // Envuelve cada palabra: <span class="sw"><span style="--i:n">palabra</span></span>
  headings.forEach((h) => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", words.join(" "));
    h.textContent = "";
    words.forEach((word, i) => {
      const outer = document.createElement("span");
      outer.className = "sw";
      outer.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.style.setProperty("--i", i);
      inner.textContent = word;
      outer.appendChild(inner);
      h.appendChild(outer);
      if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
    });
    h.classList.add("split");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  headings.forEach((h) => observer.observe(h));
})();
