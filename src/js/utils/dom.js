// js/utils/dom.js
// Utilidades de DOM que usan varias páginas.

// Convierte un texto en "texto seguro": si alguien escribe <b> o <scritp>, se verá como letras normales y no se ejecutará como código.
export function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

// Muestra una alerta de Bootstrap (success, danger, warning...) dentro de un contenedor.
// Si se indica "duracion" (ms), la alerta desaparece sola pasado ese tiempo.
export function mostrarAviso(contenedor, texto, tipo = "success", duracion = 0) {
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = texto;

    const cerrar = document.createElement("button");
    cerrar.type ="button";
    cerrar.className = "btn-close";
    cerrar.setAttribute("data-bs-dismiss", "alert");
    cerrar.setAttribute("aria-label", "Cerrar");
    alerta.appendChild(cerrar);

    contenedor.replaceChildren(alerta);
    if (duracion > 0) setTimeout(() => alerta.remove(), duracion);
}

// Crea una celda <td> con texto plano.
export function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}