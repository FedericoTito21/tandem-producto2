// js/almacenaje/bd.js
// Acceso de baho nivel a IndexedDB. Solo lo usan los submódulos de almacenaje/.

const NOMBRE_BD = "tandem-bd";
const VERSION_DB = 1;

// Abre la base de datos. La primera vez crea los dos almacenes de objetos.
function abrirBD() {
    return new Promise((resolver, rechazar) => {
        const peticion = indexedDB.open(NOMBRE_BD, VERSION_DB);

        peticion.onupgradeneeded = () => {
            const bd = peticion.result;
            bd.createObjectStore("intercambios", { keyPath: "id", autoIncrement: true });
            bd.createObjectStore("seleccionados", { keyPath: "id" });
        };

        peticion.onsuccess = () => {
            const bd = peticion.result;
            // Si otra pestaña abre una versión nueva, se cierra esta conexión para no bloquearla
            bd.onversionchange = () => bd.close();
            resolver(bd);
        };
        peticion.onerror = () => rechazar(peticion.error);
        peticion.onblocked = () => console.warn("IndexedDB bloqueada: cierra las otras pestañas de la aplicación.");
    });
}

// Ejecuta UNA operación sobre un almacén y devuelve una promesa con su resultado.
// almacen: "intercambios" o "seleccionados"
// modo: "readonly" o "readwrite"
// operacion: función que recibe el almacén y devuelve una petición (add, getAll, delete...)
export async function operar(almacen, modo, operacion) {
    const bd = await abrirBD();

    return new Promise((resolver, rechazar) => {
        try {
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
        } catch (error) {
            // p. ej. DataError en add() o un almacén inexistente: se lanza al momento, no por evento
            bd.close();
            rechazar(error);
        }
    });
}