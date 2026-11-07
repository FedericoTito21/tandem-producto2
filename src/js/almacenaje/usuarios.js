// js/almacenaje/usuarios.js
// Usuarios y sesión guardados en localStorage (operaciones síncronas)

const CLAVE_USUARIOS = "tandem-usuarios";
const CLAVE_SESSION = "tandem-sesion";

/** ------------- FUNCIONES INTERNAS -------------  */
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

/** ------------- USUARIOS -------------  */

// Devuelve siempre un array (vacío si no hay datos o están corruptos)
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

// Borra un usuario. Si era el que tenía la sesión abierta, la cierra.
export function borrarUsuario(email) {
  const correo = email.trim().toLowerCase();
  const restantes = obtenerUsuarios().filter(
    (u) => u.email.toLowerCase() !== correo,
  );

  guardarUsuarios(restantes);

  if (localStorage.getItem(CLAVE_SESION) === correo) cerrarSesion();
}

/** ------------- SESIÓN ------------- */

// Si el correo y la contraseña son corectos, guarda el correo como sesión y devuelve true
export function loguearUsuario(email, password) {
  const correo = email.trim().toLowerCase();
  const usuario = obtenerUsuarios().find(
    (u) => u.email === correo && u.password === password,
  );

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
