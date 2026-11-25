/**
 * Proceso: la etapa activa cambia según el avance del scroll
 * dentro de la sección (escenario sticky). Los botones del
 * indicador llevan a cada etapa.
 */
(() => {
  const track = document.getElementById("track");
  if (!track || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  track.classList.add("live");
  const phases = track.querySelectorAll(".ph");
  const buttons = track.querySelectorAll(".rail button");
  const stage = track.querySelector(".stage");
  let current = -2;

  const scrollRange = () => track.offsetHeight - stage.offsetHeight;

  function update() {
    const top = track.getBoundingClientRect().top;
    let index = -1;

    if (top < window.innerHeight * 0.4) {
      const progress = Math.min(Math.max(-top / scrollRange(), 0), 0.9999);
      index = Math.floor(progress * phases.length);
    }

    if (index === current) return;
    current = index;

    phases.forEach((ph, k) => ph.classList.toggle("on", k === index));
    buttons.forEach((btn, k) => {
      btn.className = k < index ? "done" : k === index ? "on" : "";
    });
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  buttons.forEach((btn, k) => {
    btn.addEventListener("click", () => {
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: trackTop + ((k + 0.5) / phases.length) * scrollRange() });
    });
  });
})();
