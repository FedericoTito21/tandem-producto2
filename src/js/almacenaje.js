// js/almacenaje.js
// Módulo con TODAS las operaciones CRUD de la aplicación. Las páginas no tocan
// localStorage ni IndexedDB directamente: solo llaman a estas funciones.
//   - Usuarios y sesión  -> localStorage (síncrono)
//   - Intercambios y selección del Dashboard -> IndexedDB (asíncrono, con promesas)
export {
  altaIntercambio,
  obtenerIntercambios,
  borrarIntercambio,
  seleccionarIntercambio,
  deseleccionarIntercambio,
  obtenerSeleccionados,
} from "./almacenaje/intercambios.js";
import { obtenerIntercambios, altaIntercambio  } from "./almacenaje/intercambios.js";

export {
  obtenerUsuarios,
  altaUsuario,
  borrarUsuario,
  loguearUsuario,
  obtenerUsuarioActivo,
  cerrarSesion
} from "./almacenaje/usuarios.js";
import { obtenerUsuarios, altaUsuario } from "./almacenaje/usuarios.js";

const CLAVE_DEMO = "tandem-demo-hecho";

/* ------------------------------------------------------------------ */
/* Datos de ejemplo (solo la primera vez que se abre la aplicación)     */
/* ------------------------------------------------------------------ */

const USUARIOS_DEMO = [
  { nombre: "Laura Puig", email: "laura@tandem.com", password: "1234" },
  { nombre: "John Smith", email: "john@tandem.com", password: "abcd" },
  { nombre: "Aya Tanaka", email: "aya@tandem.com", password: "5678" },
];

const INTERCAMBIOS_DEMO = [
  { titulo: "Conversación en inglés los martes", email: "john@tandem.com", fecha: "2026-11-03",
    descripcion: "Practico inglés una hora por videollamada a cambio de practicar español.", tipo: "Ofrezco idioma" },
  { titulo: "Busco practicar catalán", email: "aya@tandem.com", fecha: "2026-11-05",
    descripcion: "Quedada semanal para hablar catalán en un ambiente relajado.", tipo: "Busco idioma" },
  { titulo: "Intercambio español-inglés en la biblioteca", email: "laura@tandem.com", fecha: "2026-11-07",
    descripcion: "Sesiones de 45 minutos. Se necesita un nivel mínimo B1 de inglés.", tipo: "Ofrezco idioma" },
  { titulo: "Quiero perder el miedo a hablar inglés", email: "laura@tandem.com", fecha: "2026-11-09",
    descripcion: "Busco a alguien paciente para charlar por videollamada dos veces por semana.", tipo: "Busco idioma" },
];

// Carga usuarios e intercambios de ejemplo UNA sola vez, para poder probar la aplicación.
// Si no los quieres, borra la llamada a esta función en las páginas.
export async function iniciarDatosDemo() {
  try {
    if (localStorage.getItem(CLAVE_DEMO)) return;
    localStorage.setItem(CLAVE_DEMO, "1"); // se marca antes para que otra pestaña no los duplique
    if (obtenerUsuarios().length === 0) USUARIOS_DEMO.forEach(altaUsuario);
    if ((await obtenerIntercambios()).length === 0) {
      for (const intercambio of INTERCAMBIOS_DEMO) await altaIntercambio(intercambio);
    }
  } catch (error) {
    console.error("No se pudieron cargar los datos de ejemplo", error);
  }
}
