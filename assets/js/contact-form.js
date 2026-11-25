/**
 * Formulario de contacto: arma el mensaje y abre el cliente
 * de correo del visitante con todo listo para enviar.
 */
(() => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const EMAIL = "contacto@axka.com";
  const SUBJECT = "Consulta desde la página web";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);

    const body = [
      `Interés: ${data.get("interes") || "Sin definir"}`,
      `Nombre: ${data.get("nombre")}`,
      `Contacto: ${data.get("contacto")}`,
      "",
      data.get("mensaje"),
    ].join("\n");

    window.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`;
  });
})();
