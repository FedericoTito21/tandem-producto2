// js/utils.js
// Funciones pequeñas que usan varias páginas.

// Convierte un texto en "texto seguro": si alguien escribe <b> o <script>,
// se verá como letras normales y no se ejecutará como código.
export function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Muestra un mensaje de color (verde, rojo...) dentro de un contenedor.
export function mostrarAviso(contenedor, texto, tipo = "success") {
  contenedor.innerHTML =
    `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">` +
    `${escaparHtml(texto)}` +
    `<button type="button" class="btn-close" data-bs-dismiss="alert"` +
    ` aria-label="Cerrar"></button></div>`;
}

// Convierte "2026-11-03" en "03/11/2026" sin usar Date (así no hay desfases de zona horaria).
export function formatearFecha(texto) {
  const partes = String(texto).split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : texto;
}
