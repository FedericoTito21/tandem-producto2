// js/utils/validacion.js
// Validaciones reutilizables para los formularios (intercambios, usuarios, login...).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esEmail(texto) {
    return EMAIL_RE.test(String(texto).trim());
}

// Comprueba una fecha con formato AAAA-MM-DD (el que devuelve <input type="date">).
export function esFecha(texto) {
    return /^\d{4}-\d{2}-\d{2}$/.test(texto) && !Number.isNaN(Date.parse(texto));
}

// true si el texto (sin espacios a los lados) tiene entre min y max caracteres.
export function longitudEntre(texto, min, max) {
    const n = String(texto).trim().length;
    return n >= min && n <= max;
}

// Pinta el campo en verde o rojo (clases de Bootstrap) y devuelve el resultado.
export function marcar(campo, valido) {
    campo.classList.toggle("is-invalid", !valido);
    campo.classList.toggle("is-valid", valido);
    return valido;
}

// Quita las marcas verdes y rojas de todos los campos de un formulario.
export function limpiarMarcas(formulario) {
    formulario
        .querySelectorAll(".is-valid", ".is-invalid")
        .forEach((campo) => campo.classList.remove("is-valid", "is-invalid"));
}