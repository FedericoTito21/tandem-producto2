// js/componentes/tarjeta.js
// Tarjeta arrastrable (API Drag and Drop de HTML5) que representa un intercambio en el Dashboard.
import { escaparHtml } from "../utils/dom.js";
import { formatearFecha } from "../utils/formato.js";

// Construye UNA tarejta. "seleccionada" edcide el texto del botón alternativo (móvil y teclado)
export function crearTarjeta(intercambio, seleccionada) {
    const i = intercambio;
    const esOferta = i.tipo === "Ofrezco idioma";

    const tarjeta = document.createElement("div");
    tarjeta.className = "card tarjeta-intercambio mb-2" + (esOferta ? "" : " peticion");
    tarjeta.draggable = true;
    tarjeta.dataset.id = i.id;
    tarjeta.innerHTML = `
        <div class="card-body py-2">
            <span class="badge ${esOferta ? "bg-success" : "bg-warning text-dark" } mb-1">${escaparHtml(i.tipo)}</span>
            <h3 class="h6 card-title mb-1">${escaparHtml(i.titulo)}</h3>
            <p class="card-text small text-muted mb-1">${escaparHtml(i.email)} · ${escaparHtml(formatearFecha(i.fecha))}</p>
            <p class="card-text small mb-2">${escaparHtml(i.descripcion)}</p>
            <button type="button" class="btn btn-sm btn-outline-primary" data-mover="${i.id}">
                ${seleccionada ? "Quitar de la selección" : "Seleccionar" }
            </button>
        </div>`;

    tarjeta.addEventListener("dragstart", (evento) => {
        evento.dataTransfer.setData("text/plain", String(i.id));
        evento.dataTransfer.effectAllowed = "move";
        tarjeta.classList.add("arrastrando");
    });

    tarjeta.addEventListener("dragend", () => tarjeta.classList.remove("arrastrando"));

    return tarjeta;
}

// Mensaje que aparece cuando una zona está vacía
export function textoVacio(texto) {
    const p = document.createElement("p");
    p.className = "text-muted small text-center my-3 vacio";
    p.textContent = texto;
    return p;
}