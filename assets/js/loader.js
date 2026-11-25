/**
 * Pantalla de carga: el logo se dibuja y se rellena mientras la página carga.
 *
 * Ciclo (ms):
 *   0 → ~1300     cada contorno se dibuja (stroke-dashoffset de su largo a 0)
 *                 en 1100 ms, escalonado con su data-delay
 *   1320 → 1700   fundido: el relleno sube 0→1 y el contorno baja 1→0
 *   1700 → 1850   el logo completo se sostiene
 *
 * Al final del ciclo:
 *   · si la página ya cargó → salida de 450 ms (logo y cubierta se
 *     desvanecen, aparece el sitio) y el loader se elimina.
 *   · si aún no carga → el logo se desvanece y se vuelve a dibujar.
 *
 * "Cargada" = evento load + fuentes listas (con tope de MAX_WAIT).
 * Curva: ease(v) = 0.5 − 0.5·cos(π·clamp(v))
 * Un solo reloj con requestAnimationFrame que avanza por deltas: si la
 * pestaña se oculta, el tiempo se detiene en lugar de saltar.
 * Con "reducir movimiento" el loader nunca se activa (ver <head>).
 */
(() => {
  const root = document.documentElement;
  const loader = document.getElementById("loader");
  if (!loader) return;

  if (!root.classList.contains("has-loader")) {
    loader.remove();
    return;
  }

  // ---------- Tiempos (edítalos aquí) ----------
  const DRAW = 1100;        // duración del trazo de cada contorno
  const FILL_START = 1320;  // inicia el fundido contorno → relleno
  const FILL = 380;         // duración del fundido
  const HOLD_END = 1850;    // fin del ciclo (logo completo)
  const LOOP_FADE = 350;    // si sigue cargando: desvanecer y redibujar
  const EXIT = 450;         // salida: logo + cubierta → sitio
  const MAX_WAIT = 12000;   // tope: nunca esperar más que esto
  const MAX_STEP = 64;      // tope por frame para que no haya saltos

  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const ease = (v) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(v));
  const circOut = (u) => Math.sqrt(1 - (u - 1) ** 2);

  const group = loader.querySelector(".loader-logo-group");
  const outline = loader.querySelector(".loader-outline");
  const filled = loader.querySelector(".loader-fill");
  const site = document.querySelectorAll("body > header, body > main, body > footer");

  // Mide cada contorno y lo deja "sin dibujar"
  const strokes = Array.from(outline.querySelectorAll("path"), (path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    return { path, length, delay: Number(path.dataset.delay) || 0 };
  });

  // Evita que el teclado llegue al contenido que está detrás de la cubierta
  const setInert = (value) => site.forEach((el) => { el.inert = value; });
  setInert(true);

  // ---------- ¿Ya cargó la página? ----------
  let ready = false;
  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });
  const fontsLoaded = document.fonts ? document.fonts.ready : Promise.resolve();
  const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT));
  Promise.race([Promise.all([pageLoaded, fontsLoaded]), timeout])
    .catch(() => {})
    .then(() => { ready = true; });

  // ---------- Render ----------
  function renderCycle(t) {
    for (const s of strokes) {
      s.path.style.strokeDashoffset = String(s.length * (1 - ease((t - s.delay) / DRAW)));
    }
    const f = ease((t - FILL_START) / FILL);
    filled.setAttribute("opacity", String(f));
    outline.setAttribute("opacity", String(1 - f));
  }

  function renderExit(e) {
    group.setAttribute("opacity", String(1 - ease(e)));
    loader.style.opacity = String(1 - e);
    root.style.setProperty("--site-o", String(circOut(e)));
  }

  // ---------- Reloj ----------
  let t = 0;          // tiempo dentro del ciclo
  let exitT = -1;     // tiempo dentro de la salida (-1 = aún no sale)
  let looping = false; // true mientras se desvanece para redibujar
  let last = null;
  let done = false;

  function startExit() {
    exitT = 0;
    // Arrancan las animaciones del hero y se libera el scroll
    root.classList.remove("is-loading");
    setInert(false);
  }

  function finish() {
    done = true;
    root.classList.remove("is-loading", "has-loader");
    root.style.removeProperty("--site-o");
    setInert(false);
    document.removeEventListener("visibilitychange", onVisibility);
    loader.remove();
  }

  function tick(now) {
    if (done) return;
    const dt = last === null ? 0 : Math.min(now - last, MAX_STEP);
    last = now;

    if (exitT >= 0) {
      exitT += dt;
      renderExit(clamp01(exitT / EXIT));
      if (exitT >= EXIT) return finish();
    } else {
      t += dt;
      renderCycle(t);

      if (t >= HOLD_END) {
        if (ready && !looping) {
          startExit();
        } else {
          // Sigue cargando: desvanecer el logo y volver a dibujar
          looping = true;
          const fade = (t - HOLD_END) / LOOP_FADE;
          group.setAttribute("opacity", String(1 - ease(fade)));
          if (fade >= 1) {
            looping = false;
            t = 0;
            renderCycle(0);
            group.setAttribute("opacity", "1");
          }
        }
      }
    }
    requestAnimationFrame(tick);
  }

  function onVisibility() {
    // Al volver a la pestaña no se suma el tiempo que estuvo oculta
    if (!document.hidden) last = null;
  }
  document.addEventListener("visibilitychange", onVisibility);

  renderCycle(0);
  requestAnimationFrame(tick);
})();
