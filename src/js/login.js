// js/login.js
// Página de inicio de sesión: valida el formulario y autentica con almacenaje.js.
import * as almacenaje from "./almacenaje.js";
import { actualizarBarra } from "./nav.js";

// Muestra el nombre del usuario activo, o -no login- si no hay ninguno.
function mostrarUsuarioActivo() {
  actualizarBarra();
}

// Intenta iniciar sesión y avisa del resultado con una alerta.
function loguearUsuario(email, password) {
  if (almacenaje.loguearUsuario(email, password)) {
    mostrarUsuarioActivo();
    alert(`Inicio de sesión correcto. Bienvenido/a, ${almacenaje.obtenerUsuarioActivo().nombre}`);
    return true;
  }
  alert("Correo o contraseña incorrectos");
  return false;
}

document.addEventListener("DOMContentLoaded", async () => {
  await almacenaje.iniciarDatosDemo(); // usuarios de ejemplo la primera vez
  mostrarUsuarioActivo();

  const formulario = document.getElementById("form-login");
  const loginButton = document.getElementById("loginButton");

  loginButton.addEventListener("click", (evento) => {
    evento.preventDefault(); // evita que el formulario recargue la página

    // Validación: campos obligatorios y formato de correo (lo comprueba el propio HTML)
    if (!formulario.checkValidity()) {
      formulario.classList.add("was-validated"); // activa los avisos rojos de Bootstrap
      return;
    }
    const email = formulario.elements.email.value;
    const password = formulario.elements.password.value;
    if (loguearUsuario(email, password)) {
      formulario.reset();
      formulario.classList.remove("was-validated");
    }
  });
});
