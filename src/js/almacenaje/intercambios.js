// js/almacenaje/intercambios.js
// Intercambios y selección del Dashboard gaurdados en IndexedDB.
// Todas las funciones devuelven promesas (se usan con await).
import { operar } from "./bd.js";

/** ------------- INTERCAMBIOS ------------- */

// Guarda un intercambio y devuelve (en una promesa) el id que se le ha asignado.
export function altaIntercambio(intercambio) {
    return operar("intercambios", "readwrite", (almacen) => almacen.add(intercambio));
}

// Devuelve todos los intercambios guardados.
export function obtenerIntercambios() {
    return operar("intercambios", "readonly", (almacen) => almacen.getAll());
}

// Borra un intercambio y, si estaba seleccionado en el Dashboard, también lo quita de la selección.
export async function borrarIntercambio(id) {
    await operar("intercambios", "readwrite", (almacen) => almacen.delete(id));
    await deseleccionarIntercambio(id);
}

/** ------------- SELECCIÓN DEL DASHBOARD ------------- */

// Marca un intercambio como seleccionado. put() no falla si ya lo estaba
export function seleccionarIntercambio(id) {
    return operar("seleccionados", "readwrite", (almacen) => almacen.put({ id }));
}

// Quita la marca de selección. delete() no falla si no existía
export function deseleccionarIntercambio(id) {
    return operar("seleccionados", "readwrite", (almacen) => almacen.delete(id));
}

// Devuelve los intercambios COMPLETOS que están seleccionados
export async function obtenerSeleccionados() {
    const marcas = await operar("seleccionados", "readonly", (almacen) => almacen.getAll());
    const ids = marcas.map((marca) => marca.id);
    const todos = await obtenerIntercambios();
    return todos.filter((intercambio) => ids.includes(intercambio.id));
}