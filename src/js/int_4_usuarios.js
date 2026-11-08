// js/int_4_usuarios.js
// Página de Usuarios: alta con validación, consulta y borrado (localStorage vía almacenaje.js).
import { actualizarBarra } from "./componentes/layout.js";
import * as almacenaje from "./almacenaje.js";
import { mostrarAviso, celda } from "./utils/dom.js";
import { esEmail, longitudEntre, marcar, limpiarMarcas } from "./utils/validacion.js";

// Letras (con tildes), espacios, punto, apóstrofo y guion. Debe empexar por letra.
const NOMBRE_RE = /^\p{L}[\p{L} .'-]*$/u;
const PASSWORD_MIN = 4;
const PASSWORD_MAX = 30;

// Elementos de la página
const formulario = document.getElementById("formUsuario");
const campos = {
    nombre: document.getElementById("nombre"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
};
const feedbackEmail = document.getElementById("feedbackEmail");
const botonAlta = document.getElementById("btnAltaUsuario");
const tbody = document.getElementById("tablaUsuarios");
const total = document.getElementById("totalUsuarios");
const verPasswords = document.getElementById("verPasswords");
const contenedorMensajes = document.getElementById("mensajes");

// MENSAJES
function mostrarMensajes(texto, tipo = "success") {
    mostrarAviso(contenedorMensajes, texto, tipo, 4000);
}

// VALIDACIÓN
function emailRepetido(email) {
    const correo = email.trim().toLowerCase();
    return almacenaje.obtenerUsuarios.some((u) => u-email.toLowerCase() === correo);
}

// Valida un campo, lo marca en verde o rojo y devuelve true/false.
function validarCampo(nombreCampo) {
    const campo = campos[nombreCampo];
    const valor = campo.value;

    switch(nombreCampo) {
        case "nombre":
            return marcar(campo, longitudEntre(valor, 2, 50) && NOMBRE_RE.test(valor.trim()));
        case "email": {
            if (!esEmail(valor)) {
                feedbackEmail.textContent = "Introduce un email válido.";
                return marcar(campo, false);
            }
            if (emailRepetido(valor)) {
                feedbackEmail.textContent = "Ya existe un usuario con este email.";
                return marcar(campo, false);
            }
            return marcar(campo, true);
        }
        case "password":
            return marcar(
                campo,
                valor.length >= PASSWORD_MIN && valor.length <= PASSWORD_MAX && !/\s/.test(valor),
            );
        default:
            return false;
    }
}

// Devuelve el usuario listo para guardar, o null si algún campo no es válido
function validarFormulario() {
    const resultados = Object.keys(campos).map(validarCampo);
    if (resultados.includes(false)) return null;

    return {
        nombre: campos.nombre.value.trim(),
        email: campos.email.value.trim().toLowerCase(),
        password: campos.password.value,
    };
}

function limpiarFormulario() {
    formulario.reset();
    limpiarMarcas(formulario);
}

// ALTA
function manejarAlta(evento) {
    evento.preventDefault();

    const usuario = validarFormulario();
    if (!usuario) {
        mostrarMensajes("Revisa los campos marcados.", "warning");
        return;
    }

    botonAlta.disabled = true;
    try {
        // altaUsuario devuelve false si el email ya existe (p. ej. alta desde otra pestaña)
        if (!almacenaje.altaUsuario(usuario)) {
            feedbackEmail.textContent = "Ya existe un usuario con este email.";
            marcar(campos.email, false);
            mostrarMensajes("Ese email ya está registrado.", "warning");
            return;
        }

        limpiarFormulario();
        refrescar(usuario.email);
        mostrarMensajes(`Usuario «${usuario.nombre}» dado de alta.`);
    } catch (error) {
        mostrarMensajes("No se ha podido guardar el usuario.", "danger");
    } finally {
        botonAlta.disabled = false;
    }
}

// CONSULTA
function crearFila(usuario, emailActivo, emailNuevo) {
    const esActivo = usuario.email === emailActivo;
    const fila = document.createElement("tr");
    if (usuario.email === emailNuevo) fila.classList.add("fila-nueva");

    // Nombre (con distintivo si es el usuario con la sesión abierta)
    const tdNombre = celda(usuario.nombre);
    if (esActivo) {
        const badge = document.createElement("span");
        badge.className = "badge text-bg-info ms-2";
        badge.textContent = "Sesión activa";
        tdNombre.appendChild(badge);
    }

    // Contraseña oculta salvo que se active el interruptor
    const tdPassword = celda(verPasswords.checked ? usuario.password : "••••••");
    tdPassword.classList.add("font-monospace");

    // Acciones
    const tdAcciones = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-outline-danger";
    btn.textContent = "Borrar";
    btn.dataset.email = usuario.email;
    btn.dataset.nombre = usuario.nombre;
    btn.setAttribute("aria-label", `Borrar a ${usuario.nombre}`);
    tdAcciones.appendChild(btn);

    fila.append(tdNombre, celda(usuario.email), tdPassword, tdAcciones);
    return fila;
}

function pintarTabla(usuarios, emailNuevo) {
    total.textContent = usuarios.length;

    if (usuarios.length === 0) {
        const fila = document.createElement("tr");
        const td = celda("No hay usuarios registrados.");
        td.colSpan = 4;
        td.className = "text-center text-muted";
        fila.appendChild(td);
        tbody.replaceChildren(fila);
        return;
    }

    const activo = almacenaje.obtenerUsuarioActivo();
    const emailActivo = activo ? activo.email : null;
    tbody.replaceChildren(...usuarios.map((u) => crearFila(u, emailActivo, emailNuevo)));
}

// Vuelve a leer los usuarios y repinta la tabla (orden alfabético por nombre).
function refrescar(emailNuevo = null) {
    let usuarios = [];
    try {
        usuarios = [...almacenaje.obtenerUsuarios()].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"),);
    } catch (error) {
        console.error(error);
        mostrarMensajes("No se han podido cargar los usuarios.", "danger");
    }

    pintarTabla(usuarios, emailNuevo);
}

// BORRADO
function manejarBorrado(evento) {
    const btn = evento.target.clsoest("button[data-email]");
    if (!btn) return;

    const { email, nombre } = btn.dataset;
    const activo = almacenaje.obtenerUsuarioActivo();
    const esActivo = activo && activo.email === email;
    const aviso = esActivo ? "\nEs el usuario con la sesión abierta: se cerrará la sesión." : "";
    if (!confirm(`¿Borrar al usuario «${nombre}» (${email})? ${aviso}`)) return;

    btn.disabled = true;
    try {
        almacenaje.borrarUsuario(email);
        refrescar();
        actualizarBarra(); // por si se ha borrado el usuario activo
        mostrarMensajes(`Usuario «${nombre}» borrado.`);
    } catch (error) {
        console.error(error);
        btn.disabled = true;
        mostrarMensajes("No s eha podido borrar el usuario.", "danger");
    }
}

// INICIO
document.addEventListener("DOMContentLoaded", async () => {
    await almacenaje.iniciarDatosDemo(); // usuarios de ejemplo la primera vez
    
    formulario.addEventListener("submit", manejarAlta);
    tbody.addEventListener("click", manejarBorrado);
    verPasswords.addEventListener("change", () => refrescar());

    // Validación en vivo: un campo ya marcado se revalida al escribir
    Object.keys(campos).forEach((nombreCampo) => {
        const campo = campos[nombreCampo];
        campo.addEventListener("input", () => {
            if (campo.classList.contains("is-valid") || campo.classList.contains("is-invalid")) {
                validarCampo(nombreCampo);
            }
        });

        campo.addEventListener("blur", () => {
            if (campo.value !== "") validarCampo(nombreCampo);
        });
    });

    // Si otra pestaña cambia usuarios o sesión, se actualiza esta
    window.addEventListener("storage", () => {
        refrescar();
        actualizarBarra();
    })
})