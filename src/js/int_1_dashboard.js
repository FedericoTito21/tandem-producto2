// js/int_1_dashboard.js
// Dashboard: tarjetas de intercambios que se arrastran (API Drag and Drop de HTML5)
// a la zona de seleccionados. La selección se guarda en IndexedDB y se recuerda al recargar.
import * as almacenaje from "./almacenaje.js";
import { escaparHtml, formatearFecha } from "./utils.js";
import "./nav.js"; // muestra el usuario activo en la barra

await almacenaje.iniciarDatosDemo();

// 1. Localizamos los elementos de la página
const zonaOrigen = document.getElementById("zona-origen");
const zonaSeleccion = document.getElementById("zona-seleccion");
const contadorOrigen = document.getElementById("contador-origen");
const contadorSeleccion = document.getElementById("contador-seleccion");
const aviso = document.getElementById("aviso-dashboard");
const botonesFiltro = document.querySelectorAll("[data-filtro]");

let filtro = "todos"; // "todos", "Ofrezco idioma" o "Busco idioma"

// 2. Construye UNA tarjeta. "seleccionada" decide el texto del botón alternativo.
function crearTarjeta(i, seleccionada) {
  const esOferta = i.tipo === "Ofrezco idioma";
  const tarjeta = document.createElement("div");
  tarjeta.className = "card tarjeta-intercambio mb-2" + (esOferta ? "" : " peticion");
  tarjeta.draggable = true;
  tarjeta.dataset.id = i.id;
  tarjeta.innerHTML = `
    <div class="card-body py-2">
      <span class="badge ${esOferta ? "bg-success" : "bg-warning text-dark"} mb-1">${escaparHtml(i.tipo)}</span>
      <h3 class="h6 card-title mb-1">${escaparHtml(i.titulo)}</h3>
      <p class="card-text small text-muted mb-1">${escaparHtml(i.email)} · ${escaparHtml(formatearFecha(i.fecha))}</p>
      <p class="card-text small mb-2">${escaparHtml(i.descripcion)}</p>
      <button type="button" class="btn btn-sm btn-outline-primary" data-mover="${i.id}">
        ${seleccionada ? "Quitar de la selección" : "Seleccionar"}
      </button>
    </div>`;
  // Al empezar a arrastrar guardamos el id de la tarjeta
  tarjeta.addEventListener("dragstart", (evento) => {
    evento.dataTransfer.setData("text/plain", String(i.id));
    evento.dataTransfer.effectAllowed = "move";
    tarjeta.classList.add("arrastrando");
  });
  tarjeta.addEventListener("dragend", () => tarjeta.classList.remove("arrastrando"));
  return tarjeta;
}

// Mensaje que aparece cuando una zona está vacía
function textoVacio(texto) {
  const p = document.createElement("p");
  p.className = "text-muted small text-center my-3 vacio";
  p.textContent = texto;
  return p;
}

// 3. Lee IndexedDB y pinta las tarjetas en su zona
async function pintar() {
  let todos = [];
  let seleccionados = [];
  try {
    todos = await almacenaje.obtenerIntercambios();
    seleccionados = (await almacenaje.obtenerSeleccionados()).map((i) => i.id);
    aviso.innerHTML = "";
  } catch (error) {
    aviso.innerHTML = '<div class="alert alert-danger">No se pudo leer la base de datos del navegador.</div>';
  }
  zonaOrigen.innerHTML = "";
  zonaSeleccion.innerHTML = "";
  let enOrigen = 0;
  let enSeleccion = 0;
  todos
    .filter((i) => filtro === "todos" || i.tipo === filtro)
    .forEach((i) => {
      const estaSeleccionada = seleccionados.includes(i.id);
      (estaSeleccionada ? zonaSeleccion : zonaOrigen).appendChild(crearTarjeta(i, estaSeleccionada));
      if (estaSeleccionada) enSeleccion++; else enOrigen++;
    });
  if (enOrigen === 0) zonaOrigen.appendChild(textoVacio(todos.length === 0 ? "No hay intercambios todavía. Crea uno en la página Intercambios." : "No hay intercambios para mostrar aquí."));
  if (enSeleccion === 0) zonaSeleccion.appendChild(textoVacio("Arrastra aquí los intercambios que te interesen."));
  contadorOrigen.textContent = enOrigen;
  contadorSeleccion.textContent = enSeleccion;
}

// 4. Prepara una zona para recibir tarjetas arrastradas
function prepararZona(zona, accion) {
  // Sin preventDefault en dragover el navegador no permite soltar
  zona.addEventListener("dragover", (evento) => {
    evento.preventDefault();
    zona.classList.add("zona-activa");
  });
  zona.addEventListener("dragleave", (evento) => {
    if (!zona.contains(evento.relatedTarget)) zona.classList.remove("zona-activa");
  });
  zona.addEventListener("drop", async (evento) => {
    evento.preventDefault();
    zona.classList.remove("zona-activa");
    const id = Number(evento.dataTransfer.getData("text/plain")); // el id viaja como texto
    if (Number.isNaN(id)) return;
    await accion(id);
    pintar();
  });
}
prepararZona(zonaSeleccion, almacenaje.seleccionarIntercambio);
prepararZona(zonaOrigen, almacenaje.deseleccionarIntercambio); // arrastrar de vuelta quita la selección

// 5. Botón alternativo (móvil y teclado): mueve la tarjeta sin arrastrar
document.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("[data-mover]");
  if (!boton) return;
  const id = Number(boton.dataset.mover);
  if (boton.closest("#zona-seleccion")) await almacenaje.deseleccionarIntercambio(id);
  else await almacenaje.seleccionarIntercambio(id);
  pintar();
});

// 6. Filtros (opcionales)
botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    filtro = boton.dataset.filtro;
    botonesFiltro.forEach((b) => b.classList.toggle("active", b === boton));
    pintar();
  });
});

pintar();
