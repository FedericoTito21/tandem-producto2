// js/almacenaje.js
// Punto de entrada ÚNICO a todas las operaciones CRUd de la aplicación.
// Las páginas solo importan este archivo: import * as almacenaje from "./almacenaje.js";
// Por dentro, el código está dividido en submódulos de la carpeta almacenaje/:
// - usuarios.js -> usuarios y sesión (localStorage, síncrono)
// - intercambios.js -> intercambios y selección del Dashboard (IndexedDB, promesas)
// - demo.js -> datos de ejemplo la primera vez
// - bd.js -> apertura de IndexedDB (uso interno, no se reexporta)

export {
  obtenerUsuarios,
  altaUsuario,
  borrarUsuario,
  loguearUsuario,
  obtenerUsuarioActivo,
  cerrarSesion
} from "./almacenaje/usuarios.js";

export {
  altaIntercambio,
  obtenerIntercambios,
  borrarIntercambio,
  seleccionarIntercambio,
  deseleccionarIntercambio,
  obtenerSeleccionados,
} from "./almacenaje/intercambios.js";

export { iniciarDatosDemo } from "./almacenaje/demo.js";
