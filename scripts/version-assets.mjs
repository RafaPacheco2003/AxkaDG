#!/usr/bin/env node
/**
 * Versionado de archivos ("cache busting")
 * ----------------------------------------
 * Ejecuta ANTES de subir cambios a Hostinger:
 *
 *     node scripts/version-assets.mjs
 *
 * Qué hace:
 *   1. Calcula una huella (hash) del contenido de cada archivo local que
 *      usan las páginas: CSS, JS, imágenes y el manifiesto.
 *   2. Reescribe las referencias como  archivo.css?v=<huella>.
 *      · Si el archivo cambió → cambia la huella → el navegador y el CDN
 *        lo descargan de nuevo.
 *      · Si no cambió → misma huella → se sigue usando el caché (rápido).
 *   3. Actualiza <lastmod> del sitemap.xml con la fecha de hoy si cambió algo.
 *
 * No necesita instalar nada (solo Node.js). Es seguro ejecutarlo varias veces.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Páginas y archivos cuyas referencias se versionan
const PAGES = ["index.html", "404.html"];
const MANIFEST = "site.webmanifest";
const SITEMAP = "sitemap.xml";

// Coincide con href="…", src="…" o content="https://dominio/…" que apunten a
// archivos locales (assets/… o site.webmanifest), con o sin ?v= previo.
const REF = /((?:href|src|content)=")((?:https?:\/\/[^/"]+)?\/?)((?:assets\/[^"?#]+)|site\.webmanifest)(\?v=[a-z0-9]+)?(")/g;
const MANIFEST_REF = /("src":\s*")(\/?)(assets\/[^"?#]+)(\?v=[a-z0-9]+)?(")/g;

const hashCache = new Map();
function hashOf(file) {
  if (!hashCache.has(file)) {
    const path = join(ROOT, file);
    if (!existsSync(path)) {
      console.warn(`  ⚠ No existe: ${file} (se deja sin versión)`);
      hashCache.set(file, null);
    } else {
      const h = createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 10);
      hashCache.set(file, h);
    }
  }
  return hashCache.get(file);
}

function versionFile(file, pattern) {
  const path = join(ROOT, file);
  if (!existsSync(path)) return { file, changed: 0 };

  const before = readFileSync(path, "utf8");
  let changed = 0;
  let count = 0;

  const after = before.replace(pattern, (match, pre, base, asset, oldV, post) => {
    const h = hashOf(asset);
    if (!h) return match;
    count++;
    const next = `${pre}${base}${asset}?v=${h}${post}`;
    if (next !== match) changed++;
    return next;
  });

  if (after !== before) writeFileSync(path, after);
  console.log(`  ${file}: ${count} referencias, ${changed} actualizadas`);
  return { file, changed };
}

console.log("Versionando archivos…");

// El manifiesto primero: su propia huella depende de las versiones de sus íconos
const results = [versionFile(MANIFEST, MANIFEST_REF)];
hashCache.delete(MANIFEST);
for (const page of PAGES) results.push(versionFile(page, REF));

const total = results.reduce((n, r) => n + r.changed, 0);

// Sitemap: fecha de última modificación
if (total > 0 && existsSync(join(ROOT, SITEMAP))) {
  const today = new Date().toISOString().slice(0, 10);
  const xml = readFileSync(join(ROOT, SITEMAP), "utf8");
  const updated = xml.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
  if (updated !== xml) {
    writeFileSync(join(ROOT, SITEMAP), updated);
    console.log(`  ${SITEMAP}: lastmod → ${today}`);
  }
}

console.log(
  total > 0
    ? `\n✔ Listo: ${total} referencias actualizadas. Ya puedes subir los cambios.`
    : "\n✔ Todo estaba al día: ningún archivo cambió desde la última vez."
);
console.log(`  (carpeta: ${relative(process.cwd(), ROOT) || "."})`);
