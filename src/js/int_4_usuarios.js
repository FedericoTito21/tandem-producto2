// js/int_4_usuarios.js
// Página de Usuarios: alta con validación, consulta y borrado (localStorage vía almacenaje.js).
import { actualizarBarra } from "./componentes/layout.js";
import * as almacenaje from "./almacenaje.js";
import { crearFormulario } from "./componentes/formulario.js";
import {
  pintarTabla,
  crearBotonBorrar,
  alBorrar,
} from "./componentes/tabla.js";
import { mostrarAviso, celda } from "./utils/dom.js";
import { esEmail, longitudEntre } from "./utils/validacion.js";

// Letras (con tildes), espacios, punto, apóstrofo y guion. Debe empexar por letra.
const NOMBRE_RE = /^\p{L}[\p{L} .'-]*$/u;
// const PASSWORD_MIN = 4;
// const PASSWORD_MAX = 30;

// Elementos de la página
const tbody = document.getElementById("tablaUsuarios");
const total = document.getElementById("totalUsuarios");
const verPasswords = document.getElementById("verPasswords");
const contenedorMensajes = document.getElementById("mensajes");

// MENSAJES
function mostrarMensaje(texto, tipo = "success") {
  mostrarAviso(contenedorMensajes, texto, tipo, 4000);
}

// VALIDACIÓN
function emailRepetido(email) {
  const correo = email.trim().toLowerCase();
  return almacenaje.obtenerUsuarios.some(
    (u) => u.email.toLowerCase() === correo,
  );
}

// FORMULARIO (componente): reglas de validación de cada campo.
const formulario = crearFormulario(document.getElementById("formUsuario"), {
  nombre: (v) => longitudEntre(v, 2, 50) && NOMBRE_RE.test(v.trim()),
  email: (v) => {
    if (!esEmail(v)) return "Introduce un email válido.";
    if (emailRepetido(v)) return "Ya existe un usuario con este email.";
    return true;
  },
  password: (v) => v.length >= 4 && v.length <= 30 && !/\s/.test(v),
});

// ALTA
formulario.alEnviar(
  ({ nombre, email, password }) => {
    const usuario = { nombre, email: email.toLowerCase(), password };
    try {
      // altaUsuario devuelve false si el email ya existe (p. ej. alta desde otra pestaña)
      if (!almacenaje.altaUsuario(usuario)) {
        formulario.invalidar("email", "Ya existe un usuario con este email.");
        mostrarMensaje("Ese email ya está registrado.", "warning");
        return;
      }

      formulario.limpiar();
      refrescar(usuario.email);
      mostrarMensaje(`Usuario «${usuario.nombre}» dado de alta.`);
    } catch (error) {
      // localStorage puede fallar si está lleno o bloqueado por el navegador
      console.error(error);
      mostrarMensaje("No se ha podido guardar el usuario.", "danger");
    }
  },
  () => mostrarMensaje("Revisa los campos marcados.", "warning"),
);

// CONSULTA
function crearFila(usuario, emailActivo, emailNuevo) {
  const fila = document.createElement("tr");
  if (usuario.email === emailNuevo) fila.classList.add("fila-nueva");

  // Nombre (con distintivo si es el usuario con la sesión abierta)
  const tdNombre = celda(usuario.nombre);
  if (usuario.email === emailActivo) {
    const badge = document.createElement("span");
    badge.className = "badge text-bg-info ms-2";
    badge.textContent = "Sesión activa";
    tdNombre.appendChild(badge);
  }

  // Contraseña oculta salvo que se active el interruptor
  const tdPassword = celda(verPasswords.checked ? usuario.password : "••••••");
  tdPassword.classList.add("font-monospace");

  fila.append(
    tdNombre,
    celda(usuario.email),
    tdPassword,
    crearBotonBorrar(
      { email: usuario.email, nombre: usuario.nombre },
      `Borrar a ${usuario.nombre}`,
    ),
  );
  return fila;
}

// Vuelve a leer los usuarios y repinta la tabla (orden alfabético por nombre).
function refrescar(emailNuevo = null) {
  let usuarios = [];
  try {
    usuarios = [...almacenaje.obtenerUsuarios()].sort((a, b) =>
      String(a.nombre).localeCompare(String(b.nombre), "es"),
    );
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se han podido cargar los usuarios.", "danger");
  }

  const activo = almacenaje.obtenerUsuarioActivo();
  const emailActivo = activo ? activo.email : null;

  pintarTabla({
    tbody,
    datos: usuarios,
    contador: total,
    mensajeVacio: "No hay usuarios registrados.",
    crearFila: (u) => crearFila(u, emailActivo, emailNuevo),
  });
}

// BORRADO
alBorrar(tbody, ({ email, nombre }) => {
    const activo = almacenaje.obtenerUsuarioActivo();
    const aviso = activo && activo.email === email
        ? "\nEs el usuario con la sesión abierta: se cerrará la sesión."
        : "";

    if (!confirm(`¿Borrar al usuario «${nombre}» (${email})?${aviso}`)) return false;

    try {
        almacenaje.borrarUsuario(email);
        refrescar();
        actualizarBarra(); // por si se ha borrado el usuario activo
        mostrarMensaje(`Usuario «${nombre}» borrado.`);
        return true;
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se ha podido borrar el usuario.", "danger");
        return false;
    }
});

// INICIO
document.addEventListener("DOMContentLoaded", async () => {
  await almacenaje.iniciarDatosDemo(); // usuarios de ejemplo la primera vez

  verPasswords.addEventListener("change", () => refrescar());

  // Si otra pestaña cambia usuarios o sesión, se actualiza esta
  window.addEventListener("storage", () => {
    refrescar();
    actualizarBarra();
  });

  refrescar();
});
