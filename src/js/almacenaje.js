// js/almacenaje.js
// Módulo con TODAS las operaciones CRUD de la aplicación. Las páginas no tocan
// localStorage ni IndexedDB directamente: solo llaman a estas funciones.
//   - Usuarios y sesión  -> localStorage (síncrono)
//   - Intercambios y selección del Dashboard -> IndexedDB (asíncrono, con promesas)

const CLAVE_USUARIOS = "tandem-usuarios";
const CLAVE_SESION = "tandem-sesion";
const CLAVE_DEMO = "tandem-demo-hecho";

// Lee y convierte a objeto lo guardado en localStorage. Si falla, devuelve el valor por defecto.
function leer(clave, porDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : porDefecto;
  } catch (error) {
    return porDefecto;
  }
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

/* ------------------------------------------------------------------ */
/* Usuarios y sesión (localStorage)                                    */
/* ------------------------------------------------------------------ */

export function obtenerUsuarios() {
  const usuarios = leer(CLAVE_USUARIOS, []);
  return Array.isArray(usuarios) ? usuarios : [];
}

// Devuelve true si se da de alta y false si el correo ya existe.
export function altaUsuario(usuario) {
  const usuarios = obtenerUsuarios();
  const email = usuario.email.trim().toLowerCase();
  if (usuarios.some((u) => u.email.toLowerCase() === email)) return false;
  usuarios.push({ ...usuario, email });
  guardarUsuarios(usuarios);
  return true;
}

export function borrarUsuario(email) {
  const restantes = obtenerUsuarios().filter((u) => u.email.toLowerCase() !== email.toLowerCase());
  guardarUsuarios(restantes);
  // Si se borra a quien tiene la sesión abierta, la sesión se cierra.
  if (localStorage.getItem(CLAVE_SESION) === email.toLowerCase()) cerrarSesion();
}

// Si el correo y la contraseña son correctos, guarda el correo como sesión y devuelve true.
export function loguearUsuario(email, password) {
  const correo = email.trim().toLowerCase();
  const usuario = obtenerUsuarios().find((u) => u.email === correo && u.password === password);
  if (!usuario) return false;
  localStorage.setItem(CLAVE_SESION, correo);
  return true;
}

// Devuelve el usuario con la sesión abierta o null si no hay nadie.
export function obtenerUsuarioActivo() {
  const email = localStorage.getItem(CLAVE_SESION);
  if (!email) return null;
  return obtenerUsuarios().find((u) => u.email === email) || null;
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}

/* ------------------------------------------------------------------ */
/* Intercambios y selección del Dashboard (IndexedDB)                  */
/* ------------------------------------------------------------------ */

const NOMBRE_BD = "tandem-bd";
const VERSION_BD = 1;

// Abre la base de datos. La primera vez crea los dos almacenes de objetos.
function abrirBD() {
  return new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(NOMBRE_BD, VERSION_BD);
    peticion.onupgradeneeded = () => {
      const bd = peticion.result;
      bd.createObjectStore("intercambios", { keyPath: "id", autoIncrement: true });
      bd.createObjectStore("seleccionados", { keyPath: "id" });
    };
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });
}

// Ejecuta UNA operación sobre un almacén y devuelve una promesa con su resultado.
async function operar(almacen, modo, operacion) {
  const bd = await abrirBD();
  return new Promise((resolver, rechazar) => {
    const transaccion = bd.transaction(almacen, modo);
    const peticion = operacion(transaccion.objectStore(almacen));
    transaccion.oncomplete = () => {
      bd.close();
      resolver(peticion.result);
    };
    transaccion.onerror = () => {
      bd.close();
      rechazar(transaccion.error);
    };
    transaccion.onabort = () => {
      bd.close();
      rechazar(transaccion.error);
    };
  });
}

// Guarda un intercambio y devuelve (en una promesa) el id que se le ha asignado.
export function altaIntercambio(intercambio) {
  return operar("intercambios", "readwrite", (almacen) => almacen.add(intercambio));
}

export function obtenerIntercambios() {
  return operar("intercambios", "readonly", (almacen) => almacen.getAll());
}

export async function borrarIntercambio(id) {
  await operar("intercambios", "readwrite", (almacen) => almacen.delete(id));
  await deseleccionarIntercambio(id); // si estaba seleccionado, deja de estarlo
}

export function seleccionarIntercambio(id) {
  return operar("seleccionados", "readwrite", (almacen) => almacen.put({ id }));
}

export function deseleccionarIntercambio(id) {
  return operar("seleccionados", "readwrite", (almacen) => almacen.delete(id));
}

// Devuelve los intercambios completos que están seleccionados en el Dashboard.
export async function obtenerSeleccionados() {
  const marcas = await operar("seleccionados", "readonly", (almacen) => almacen.getAll());
  const ids = marcas.map((marca) => marca.id);
  const todos = await obtenerIntercambios();
  return todos.filter((intercambio) => ids.includes(intercambio.id));
}

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
