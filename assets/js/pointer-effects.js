/**
 * Efectos con el cursor (solo en dispositivos con mouse):
 *  · Botones principales "magnéticos": siguen ligeramente al cursor.
 *  · Panel de servicios: luz que sigue al cursor + inclinación 3D sutil.
 */
(() => {
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const enabled = () => finePointer.matches && !reduceMotion.matches;

  // ---------- Botones magnéticos ----------
  const STRENGTH = 0.28; // qué tanto siguen al cursor (0–1)
  const MAX = 10;        // desplazamiento máximo en px

  document.querySelectorAll(".hero .cta .btn, .cl .btn, .fcta .btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      if (!enabled()) return;
      const r = btn.getBoundingClientRect();
      const x = Math.max(-MAX, Math.min(MAX, (e.clientX - (r.left + r.width / 2)) * STRENGTH));
      const y = Math.max(-MAX, Math.min(MAX, (e.clientY - (r.top + r.height / 2)) * STRENGTH));
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });

  // ---------- Panel de servicios ----------
  const panel = document.querySelector(".sp");
  if (!panel) return;

  const TILT = 4; // grados máximos de inclinación

  panel.addEventListener("pointermove", (e) => {
    if (!enabled()) return;
    const r = panel.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;  // 0 → 1
    const py = (e.clientY - r.top) / r.height;  // 0 → 1
    panel.classList.add("hovering");
    panel.style.setProperty("--mx", `${px * 100}%`);
    panel.style.setProperty("--my", `${py * 100}%`);
    panel.style.setProperty("--ry", `${(px - 0.5) * TILT * 2}deg`);
    panel.style.setProperty("--rx", `${(0.5 - py) * TILT * 2}deg`);
  });

  panel.addEventListener("pointerleave", () => {
    panel.classList.remove("hovering");
    panel.style.setProperty("--rx", "0deg");
    panel.style.setProperty("--ry", "0deg");
  });
})();
