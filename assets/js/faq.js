/**
 * FAQ: acordeón exclusivo (al abrir una pregunta se cierran las demás).
 */
(() => {
  const items = document.querySelectorAll(".fq");

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
