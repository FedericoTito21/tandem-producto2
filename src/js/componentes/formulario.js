// js/componentes/formulario.js
// Formulario validación Bootstrap reutilizable (Intercambios, Usuarios...).
// - true -> campo válido (verde)
// - false -> no válido; se muestra el .invalid-feedback escrito en el HTML
// - texto -> no válido; ese texto sustityte al del .invalid-feedback
import { marcar } from "../utils/validacion.js";

export function crearFormulario(formulario, reglas) {
    const campos = {};
    for (const id of Object.keys(reglas)) {
        const campo = formulario.elements[id];
        if (!campo) throw new Error(`El formulario #${formulario.id} no tiene el campo «${id}»`);
        campos[id] = campo;
    }

    function feedbackDe(campo) {
        return (campo.closest(".mb-3") ?? campo.parentElement).querySelector(".invalid-feedback");
    }

    // Marca un campo en rojo (y camboa su mensaje si se indica). Útil para errores del almacenaje.
    function invalidar(id, mensaje = null) {
        const feedback = feedbackDe(campos[id]);
        if (mensaje && feedback) feedback.textContent = mensaje;
        return marcar(campos[id], false);
    }

    function validarCampo(id) {
        const resultado = reglas[id](campos[id], true);
        return invalidar(id, typeof resultado === "string" ? resultado  : null);
    }

    // map y no every: así se marcan TODOS los campos, no solo el primero erróneo
    function validar() {
        return Object.keys(campos).map(validarCampo).every(Boolean);
    }

    // Valores del formulario (recortados, salvo las contraseñas)
    function valores() {
        const datos = {};
        for (const [id, campo] of Object.entries(campos)) {
            datos[id] = campo.type === "password" ? campo.value : campo.value.trim();
        }
        return datos;
    }

    // Vacía el formulario y quita las marcas; "conservar" mantiene el valor de esos campos.
    function limpiar(conservar = []) {
        const guardados = conservar.map((id) => [id, campos[id].value]);
        formulario.reset();
        Object.values(campos).forEach((c) => c.classList.remove("is-valid", "is-invalid"));
        guardados.forEach(([id, valor]) => { campos[id].value = valor; });
    }

    // Envío: evita la recarga, valida y desativa el botón mientras se guarda.
    function alEnviar(manejador, alFallar) {
        const boton = formulario.querySelector('[type="submit"]');
        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            if (!validar()) {
                if (alFallar) alFallar();
                return;
            }

            if (boton) boton.disabled = true;
            try {
                await manejador(valores());
            } finally {
                if (boton) boton.disabled = false;
            }
        });
    }

    for (const [id, campo] of Object.entries(campos)) {
        const tipoEvento = campo.tagName === "SELECT" ? "change" : "input";
        campo.addEventListener(tipoEvento, () => {
            if (campo.classList.contains("is-valid") || campo.classList.contains("is-invalid")) validarCampo(id);
        });

        campo.addEventListener("blur",  () => {
            if (campo.value !== "") validarCampo(id);
        });
    }

    return {
        campos,
        validar,
        valores,
        limpiar,
        invalidar,
        alEnviar
    };
}