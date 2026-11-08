// int_3_intercambios.js
// Página de Intercambios: alta, consulta, borrado (IndexedDB vía almacenaje.js) y gráfico canvas nativo.
import "./componentes/layout.js";
import * as almacenaje from "./almacenaje.js";
import { dibujarGrafico } from "./componentes/grafico.js";
import { crearFormulario } from "./componentes/formulario.js";
import {
  pintarTabla,
  crearBotonBorrar,
  alBorrar,
} from "./componentes/tabla.js";
import { mostrarAviso, celda } from "./utils/dom.js";
import { formatearFecha } from "./utils/formato.js";
import { esEmail, esFecha, longitudEntre } from "./utils/validacion.js";
import { TIPOS } from "./utils/constantes.js";

let intercambiosActuales = [];

// Elementos de la página
const tbody = document.getElementById("tablaIntercambios");
const total = document.getElementById("totalIntercambios");
const canvas = document.getElementById("graficoIntercambios");
const contenedorMensajes = document.getElementById("mensajes");

// MENSAJES
function mostrarMensaje(texto, tipo = "success") {
  mostrarAviso(contenedorMensajes, texto, tipo, 4000);
}

// FORMULARIO (componente): los mensajes de error son los del HTML
const formulario = crearFormulario(
  document.getElementById("formIntercambios"),
  {
    titulo: (v) => longitudEntre(v, 3, 100),
    email: (v) => esEmail(v),
    fecha: (v) => esFecha(v),
    descripcion: (v) => longitudEntre(v, 1, 500),
    tipo: (v) => TIPOS.includes(v),
  },
);

// USUARIO ACTIVO: precarga su email en el formulario
function precargarEmail() {
  const usuario = almacenaje.obtenerUsuarioActivo();
  if (usuario) formulario.campos.email.value = usuario.email;
}

// ALTA
formulario.alEnviar(
  async (datos) => {
    const intercambio = { ...datos, email: datos.email.toLowerCase() };
    try {
      await almacenaje.altaIntercambio(intercambio);
      formulario.limpiar(["email"]); // el email se conserva para la siguiente alta
      await refrescar();
      mostrarMensaje(`Intercambio «${intercambio.titulo}» dado de alta.`);
    } catch (error) {
      console.error(error);
      mostrarMensaje("No se ha podido guardar el intercambio.", "danger");
    }
  },
  () => mostrarMensaje("Revisa los campos marcados.", "warning"),
);

// CONSULTA
function crearFila(i) {
  const fila = document.createElement("tr");

  const tdTipo = document.createElement("td");
  const badge = document.createElement("span");

  badge.className = `badge ${i.tipo === "Ofrezco idioma" ? "text-bg-primary" : "text-bg-success"}`;
  badge.textContent = i.tipo;
  tdTipo.appendChild(badge);

  fila.append(
    celda(i.titulo),
    celda(i.email),
    celda(formatearFecha(i.fecha)),
    celda(i.descripcion),
    tdTipo,
    crearBotonBorrar({ id: i.id, titulo: i.titulo }, `Borrar ${i.titulo}`),
  );

  return fila;
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

  pintarTabla({
    tbody,
    datos: intercambiosActuales,
    contador: total,
    mensajeVacio: "No hay intercambios registrados.",
    crearFila,
  });

  dibujarGrafico(canvas, intercambiosActuales);
}

// BORRADO
alBorrar(tbody, async ({ id, titulo }) => {
  if (!confirm(`¿Borrar el intercambio «${titulo}»?`)) return false;

  try {
    await almacenaje.borrarIntercambio(Number(id));
    await refrescar();
    mostrarMensaje("Intercambio borrado.");
    return true;
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se ha podido borrar el intercambio.", "danger");
    return false;
  }
});

// INICIO
document.addEventListener("DOMContentLoaded", async () => {
  await almacenaje.iniciarDatosDemo();
  precargarEmail();

  let temporizador;
  window.addEventListener("resize", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(
      () => dibujarGrafico(canvas, intercambiosActuales),
      150,
    );
  });

  await refrescar();
});
