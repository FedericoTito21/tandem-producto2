// int_3_intercambios.js
// Página de Intercambios: alta, consulta, borrado (IndexedDB vía almacenaje.js) y gráfico canvas nativo.
import "./componentes/layout.js";
import * as almacenaje from "./almacenaje.js";
import { dibujarGrafico } from "./componentes/grafico.js";
import { mostrarAviso, celda } from "./utils/dom.js";
import { formatearFecha } from "./utils/formato.js";
import {
  esEmail,
  esFecha,
  longitudEntre,
  marcar,
  limpiarMarcas,
} from "./utils/validacion.js";
import { TIPOS } from "./utils/constantes.js";

let intercambiosActuales = [];

// Elementos de la páfina
const formulario = document.getElementById("formIntercambio");
const campos = {
  titulo: document.getElementById("titulo"),
  email: document.getElementById("email"),
  fecha: document.getElementById("fecha"),
  descripcion: document.getElementById("descripcion"),
  tipo: document.getElementById("tipo"),
};

const botonAlta = document.getElementById("btnAlta");
const tbody = document.getElementById("tablaIntercambios");
const total = document.getElementById("totalIntercambios");
const canvas = document.getElementById("graficoIntercambios");
const contenedorMensajes = document.getElementById("mensajes");

// MENSAJES
function mostrarMensaje(texto, tipo = "success") {
  mostrarAviso(contenedorMensajes, texto, tipo, 4000);
}

// USUARIO ACTIVO: precarga su email en el formulario
function precargarEmail() {
  const usuario = almacenaje.obtenerUsuarioActivo();
  if (usuario) campos.email.value = usuario.email;
}

// VALIDACIÓN
function validarFormulario() {
  const titulo = campos.titulo.value.trim();
  const email = campos.email.value.trim();
  const fecha = campos.fecha.value;
  const descripcion = campos.descripcion.value.trim();
  const tipo = campos.tipo.value;

  const resultados = [
    marcar(campos.titulo, longitudEntre(titulo, 3, 100)),
    marcar(campos.email, esEmail(email)),
    marcar(campos.fecha, esFecha(fecha)),
    marcar(campos.descripcion, longitudEntre(descripcion, 1, 500)),
    marcar(campos.tipo, TIPOS.includes(tipo)),
  ];

  if (resultados.includes(false)) return null;

  return {
    titulo,
    email: email.toLowerCase(),
    fecha,
    descripcion,
    tipo,
  };
}

function limpiarFormulario() {
  const emailPrevio = campos.email.value;
  formulario.reset();
  limpiarMarcas(formulario);
  campos.email.value = emailPrevio;
}

// ALTA
async function manejarAlta(evento) {
  evento.preventDefault();
  const intercambio = validarFormulario();
  if (!intercambio) {
    mostrarMensaje("Revisa los campos marcados.", "warning");
    return;
  }

  botonAlta.disabled = true;
  try {
    await almacenaje.altaIntercambio(intercambio);
    limpiarFormulario();
    await refrescar();
    mostrarMensaje(`Intercambio «${intercambio.titulo}» dado de alta.`);
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se ha podido guardar el intercambio.", "danger");
  } finally {
    botonAlta.disabled = false;
  }
}

// CONSULTA
function crearFila(i) {
  const fila = document.createElement("tr");
  fila.append(
    celda(i.titulo),
    celda(i.email),
    celda(formatearFecha(i.fecha)),
    celda(i.descripcion),
  );

  const tdTipo = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `badge ${i.tipo === "Ofrezco idioma" ? "text-bg-primary" : "text-bg-success"}`;
  badge.textContent = i.tipo;
  tdTipo.appendChild(badge);

  const tdAcciones = document.createElement("td");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-sm btn-outline-danger";
  btn.textContent = "Borrar";
  btn.dataset.id = i.id;
  btn.dataset.titulo = i.titulo;
  tdAcciones.appendChild(btn);

  fila.append(tdTipo, tdAcciones);
  return fila;
}

function pintarTabla(intercambios) {
  total.textContent = intercambios.length;

  if (intercambios.length === 0) {
    const fila = document.createElement("tr");
    const td = celda("No hay intercambios registrados.");
    td.colSpan = 6;
    td.className = "text-center text-muted";
    fila.appendChild(td);
    tbody.replaceChildren(fila);
    return;
  }

  tbody.replaceChildren(...intercambios.map(crearFila));
}

async function refrescar() {
  try {
    const datos = await almacenaje.obtenerIntercambios();
    // más reciente primero
    intercambiosActuales = [...datos].sort((a, b) =>
      String(b.fecha).localeCompare(String(a.fecha)),
    );
  } catch (error) {
    console.error(error);
    intercambiosActuales = [];
    mostrarMensaje("No se han podido cargar los intercambios.", "danger");
  }

  pintarTabla(intercambiosActuales);
  dibujarGrafico(canvas, intercambiosActuales);
}

// BORRADO
async function manejarBorrado(evento) {
  const btn = evento.target.closest("button[data-id]");
  if (!btn) return;
  if (!confirm(`¿Borrar el intercambio «${btn.dataset.titulo}»`)) return;

  btn.disabled = true;
  try {
    await almacenaje.borrarIntercambio(Number(btn.dataset.id));
    await refrescar();
    mostrarMensaje("Intercambio borrado.");
  } catch (error) {
    console.error(error);
    btn.disabled = false;
    mostrarMensaje("No se ha podido borrar el intercambio.", "danger");
  }
}

// INICIO
document.addEventListener("DOMContentLoaded", async () => {
  await almacenaje.iniciarDatosDemo();
  precargarEmail();
  formulario.addEventListener("submit", manejarAlta);
  tbody.addEventListener("click", manejarBorrado);

  let temporizador;
  window.addEventListener("resize", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => dibujarGrafico(canvas, intercambiosActuales), 150);
  });

  await refrescar();
});
