// js/utils/formato.js
// Funciones de formato de datos

export const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Convierte "2026-11-03" en "03/11/2026" sin usar Date (así no hay desfases de zona horaria).
export function formatearFecha(texto) {
    const partes = String(texto ?? "").split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : texto || "";
}

// Convierte "2026-11" en "nov 26" (etiquetas del eje X del gráfico).
export function formatearMes(clave) {
    const [anyo, mes] = clave.split("-");
    return `${MESES[Number(mes) - 1]} ${anyo.slice(2)}`
}