/**
 * Hero: red de partículas en <canvas> que reacciona al puntero,
 * y parallax de la marca de agua "AXKA" (variable CSS --py).
 */
(() => {
  const canvas = document.getElementById("hero-network");
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.parentNode;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pointer = { x: -999, y: -999 };

  const MAX_PARTICLES = 70;
  const LINK_DISTANCE = 150;
  const PUSH_RADIUS = 120;

  let width, height;
  let particles = [];
  let running = true;

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(Math.min(MAX_PARTICLES, (width * height) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];

      // Movimiento y rebote en los bordes
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > width) a.vx *= -1;
      if (a.y < 0 || a.y > height) a.vy *= -1;

      // Se apartan del puntero
      const dx = a.x - pointer.x;
      const dy = a.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < PUSH_RADIUS) {
        a.x += (dx / dist) * 0.6;
        a.y += (dy / dist) * 0.6;
      }

      // Punto
      ctx.fillStyle = "rgba(157,184,255,.55)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Líneas hacia vecinos cercanos
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const l = Math.hypot(a.x - b.x, a.y - b.y);
        if (l < LINK_DISTANCE) {
          ctx.strokeStyle = `rgba(157,184,255,${0.22 * (1 - l / LINK_DISTANCE)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = -999;
  });

  // Pausa la animación cuando el hero no está visible
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      requestAnimationFrame(frame);
    } else if (!entry.isIntersecting) {
      running = false;
    }
  }).observe(hero);

  // Parallax de la marca de agua
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < hero.offsetHeight) {
        hero.style.setProperty("--py", window.scrollY * 0.18);
      }
    },
    { passive: true }
  );

  frame();
})();
