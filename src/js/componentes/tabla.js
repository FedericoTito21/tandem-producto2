// js/componentes/tabla.js
// Tabla de consulta y borrado reutilizable (Intercambios, Usuarios...).
import { celda } from "../utils/dom.js";

// Pinta las filas en el tbody; si no hay datos, una fila con el mensaje que ocupa todas las columnas.
export function pintarTabla({
  tbody,
  datos,
  crearFila,
  mensajeVacio = "No hay datos.",
  contador = null,
}) {
  if (contador) contador.textContent = datos.length;

  if (datos.length === 0) {
    const fila = document.createElement("tr");
    const td = celda(mensajeVacio);
    td.colSpan = tbody
      .closest("table")
      ?.querySelectorAll("thead th".length || 1);
    td.className = "text-center text-muted";
    fila.appendChild(td);
    tbody.replaceChildren(fila);
    return;
  }

  tbody.replaceChildren(...datos.map(crearFila));
}

// Celda <td> con el botón "Borrar". "datos" se guarda en data-* para recuperarlo al hacer clic.
export function crearBotonBorrar(datos, etiqueta = "Borrar") {
  const td = document.createElement("td");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-sm btn-outline-danger";
  btn.textContent = "Borrar";
  btn.dataset.borrar = "";
  for (const [clave, valor] of Object.entries(datos))
    btn.dataset[clave] = valor;
  btn.setAttribute("aria-label", etiqueta);
  td.appendChild(btn);
  return td;
}

// Un solo listener para todos los botones (delegación de eventos).
// El manejador recibe los data-* del botón y devuelve false si se cancela o falla.
export function alBorrar(tbody, manejador) {
  tbody.addEventListener("click", async (evento) => {
    const btn = evento.target.closest("button[data-borrar]");
    if (!btn) return;

    const { borrar, ...datos } = btn.dataset;
    btn.disabled = true;
    try {
        if ((await manejador(datos)) === false) btn.disabled = false;
    } catch (error) {
        console.error(error);
        btn.disabled = false;
    }
  });
}
