/**
 * Servicios: pestañas que cambian el panel ilustrado.
 * Click en cualquier dispositivo; hover solo donde hay mouse.
 */
(() => {
  const root = document.getElementById("svc");
  if (!root) return;

  root.classList.add("live");
  const tabs = root.querySelectorAll(".tab");
  const panels = root.querySelectorAll(".pn");
  const canHover = matchMedia("(hover: hover)");

  function select(index) {
    tabs.forEach((tab, k) => {
      tab.classList.toggle("on", k === index);
      tab.setAttribute("aria-selected", String(k === index));
    });
    panels.forEach((panel, k) => panel.classList.toggle("on", k === index));
  }

  tabs.forEach((tab, k) => {
    tab.addEventListener("click", () => select(k));
    tab.addEventListener("mouseenter", () => {
      if (canHover.matches) select(k);
    });
  });

  select(0);
})();
