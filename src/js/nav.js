// js/nav.js
// Barra de navegación compartida: muestra el usuario activo (guardado en localStorage)
// y convierte el botón en "Cerrar sesión" cuando hay alguien dentro.
import { obtenerUsuarioActivo, cerrarSesion } from "./almacenaje.js";

const etiqueta = document.getElementById("usuarioActivo");
const boton = document.querySelector("nav a.btn");

// Escribe el nombre del usuario activo, o "-no login-" si no hay ninguno.
export function actualizarBarra() {
  const usuario = obtenerUsuarioActivo();
  if (etiqueta) etiqueta.textContent = usuario ? usuario.nombre : "-no login-";
  if (boton) {
    boton.textContent = usuario ? "Cerrar sesión" : "Iniciar sesión";
    boton.setAttribute("href", usuario ? "#" : "login.html");
  }
}

// El botón decide al hacer clic: si hay sesión la cierra, si no, lleva al login.
if (boton) {
  boton.addEventListener("click", (evento) => {
    if (!obtenerUsuarioActivo()) return; // sin sesión: el enlace lleva a login.html
    evento.preventDefault();
    cerrarSesion();
    location.href = "login.html";
  });
}

actualizarBarra();
