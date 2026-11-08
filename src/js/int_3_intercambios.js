// int_3_intercambios.js
// Página de Intercambios: alta, consulta, borrado (IndexedDB vía almacenaje.js) y gráfico canvas nativo.

import * as almacenaje from "./almacenaje.js";

const TIPOS = ["Ofrezco idioma", "Busco idioma"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLORES = { "Ofrezco idioma": "#0d6efd", "Busco idioma": "#198754" };
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

let intercambiosActuales = [];

// USUARIO ACTIVO
function mostrarUsuarioActivo() {
    const span = document.getElementById("usuarioActivo");
    let usuario = null;
    try {
        usuario = almacenaje.obtenerUsuarioActivo();
    } catch (error) {
        console.error("Error al leer el usuario activo:", error);
    }

    // Admite objeto usuario o string (según implementación de almacenaje.js)
    const nombre = usuario ? (usuario.nombre || usuario.email || usuario) : null;
    span.textContent = nombre || "-no login-";

    // Precarga el email del usuario activo en el formulario
    const email = usuario && typeof usuario === "object" ? usuario.email : null;
    if (email) document.getElementById("email").value = email;
}

// MENSAJES
function mostrarMensaje(texto, tipo = "success") {
    const contenedor = document.getElementById("mensajes");
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute("role", "alert");
    const cerrar = document.createElement("button");
    cerrar.type = "button";
    cerrar.className = "btn-close";
    cerrar.setAttribute("data-bs-dismiss", "alert");
    cerrar.setAttribute("aria-label", "Cerrar");
    alerta.prepend(texto);
    alerta.appendChild(cerrar);
    contenedor.replaceChildren(alerta);
    setTimeout(() => alerta.remove(), 4000);
}

// VALIDACIÓN
function marcar(campo, valido) {
    campo.classList.toggle("is-invalid", !valido);
    campo.classList.toggle("is-valid", valido);
    return valido;
}

function validarFormulario() {
    const titulo = document.getElementById("titulo");
    const email = document.getElementById("email");
    const fecha = document.getElementById("fecha");
    const descripcion = document.getElementById("descripcion");
    const tipo = document.getElementById("tipo");

    const t = titulo.value.trim();
    const d = descripcion.value.trim();
    const f = fecha.value;

    const resultados = [
        marcar(titulo, t.length >= 3 && t.length <= 100),
        marcar(email, EMAIL_RE.test(email.value.trim())),
        marcar(fecha, /^\d{4}-\d{2}-\d{2}$/.test(f) && !Number.isNaN(Date.parse(f))),
        marcar(descripcion, d.length > 0 && d.length <= 500),
        marcar(tipo, TIPOS.includes(tipo.value)),
    ];

    if (resultados.includes(false)) return null;

    return {
        titulo: t,
        email: email.value.trim().toLowerCase(),
        fecha: f,
        descripcion: d,
        tipo: tipo.value,
    };
}

function limpiarFormulario() {
    const form = document.getElementById("formIntercambio");
    const emailPrevio = document.getElementById("email").value;
    form.reset();
    form.querySelectorAll(".is-valid, .is-invalid").forEach((c) => c.classList.remove("is-valid", "is-invalid"));
    document.getElementById("email").value = emailPrevio;
}

// ALTA
async function manejarAlta(evento) {
    evento.preventDefault();
    const intercambio = validarFormulario();
    
    if (!intercambio) {
        mostrarMensaje("Revisa los campos marcados.", "warning");
        return;
    }

    const boton = document.getElementById("btnAlta");
    boton.disabled = true;

    try {
        await almacenaje.altaIntercambio(intercambio);
        limpiarFormulario();
        await refrescar();
        mostrarMensaje(`Intercambio «${intercambio.titulo}» dado de alta.`);
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se ha podido guardar el intercambio.", "danger");
    } finally {
        boton.disabled = false;
    }
}

// CONSULTA
function formatearFecha(iso) {
    const [a, m, d] = (iso || "").split("-");
    return a && m && d ? `${d}/${m}/${a}` : iso || "";
}

function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}

function pintarTabla(intercambios) {
    const tbody = document.getElementById("tablaIntercambios");
    document.getElementById("totalIntercambios").textContent = intercambios.length;

    if (intercambios.length === 0) {
        const fila = document.createElement("tr");
        const td = celda("No hay intercambios registrados.");
        td.colSpan = 6;
        td.className = "text-center text-muted";
        fila.appendChild(td);
        tbody.replaceChildren(fila);
        return;
    }

    const filas = intercambios.map((i) => {
        const fila = document.createElement("tr");
        fila.append(celda(i.titulo), celda(i.email), celda(formatearFecha(i.fecha)), celda(i.descripcion));

        const tdTipo = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `badge ${i.tipo === "Ofrezco idioma" ? "text-bg-primary" : "text-bg-success"}`;
        badge.textContent = i.tipo;
        tdTipo.appendChild(badge);

        const tdAcciones = document.createElement("td");
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-outline-danger";
        btn.textContent = "Borrar";
        btn.dataset.id = i.id;
        btn.dataset.titulo = i.titulo;
        tdAcciones.appendChild(btn);

        fila.append(tdTipo, tdAcciones);
        return fila;
    });

    tbody.replaceChildren(...filas);
}

async function refrescar() {
    try {
        const datos = await almacenaje.obtenerIntercambios();
        intercambiosActuales = [...datos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    } catch (error) {
        console.error(error);
        intercambiosActuales = [];
        mostrarMensaje("No se han podido cargar los intercambios.", "danger");
    }

    pintarTabla(intercambiosActuales);
    dibujarGrafico(intercambiosActuales);
}

// BORRADO
async function manejarBorrado(evento) {
    const btn = evento.target.closest("button[data-id]");
    
    if (!btn) return;
    if (!confirm(`¿Borrar el intercambio «${btn.dataset.titulo}»`)) return;

    btn.disabled = true;

    try {
        await almacenaje.borrarIntercambio(Number(btn.dataset.id));
        await refrescar();
        mostrarMensaje("Intercambio borrado.");
    } catch (error) {
        console.error(error);
        btn.disabled = false;
        mostrarMensaje("No se ha podido borrar el intercambio.", "danger");
    }
}

// GRÁFICO CANVAS (NATIVO)
function agruparPorMes(intercambios) {
    const grupos = {};
    
    for (const i of intercambios) {
        const clave = (i.fecha || "").slice(0, 7);
        
        if (!clave) continue;

        grupos[clave] ??= { "Ofrezco idioma": 0, "Busco idioma": 0};

        if (TIPOS.includes(i.tipo)) grupos[clave][i.tipo]++;
    } 

    return grupos;
}

function dibujarGrafico(intercambios) {
    const canvas = document.getElementById("graficoIntercambios");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const ancho = canvas.clientWidth || 600;
    const alto = 320;

    canvas.style.height = `${alto}px`;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, ancho, alto);
    ctx.font = "12px system-ui, sans-serif";

    if (intercambios.length === 0) {
        ctx.fillStyle = "#6c757d";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Sin datos para mostrar", ancho / 2, alto / 2);
        return;
    }

    const grupos = agruparPorMes(intercambios);
    const meses = Object.keys(grupos).sort().slice(-12);
    const maximo = Math.max(1, ...meses.flatMap((m) => TIPOS.map((t) => grupos[m][t])));

    const margen = { top: 40, right: 16, bottom: 36, left: 40 };
    const w = ancho - margen.left - margen.right;
    const h = alto - margen.top - margen.bottom;
    const paso = Math.max(1, Math.ceil(maximo / 5));
    const tope = paso * Math.ceil(maximo / paso);
    const yDe = (v) => margen.top + h - (v / tope) * h;

    // Rejilla y eje Y
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let v = 0; v <= tope; v += paso) {
        const y = yDe(v);
        ctx.strokeStyle = v === 0 ? "#adb5bd" : "#e9ecef";
        ctx.beginPath();
        ctx.moveTo(margen.left, y);
        ctx.lineTo(margen.left + w, y);
        ctx.stroke();
        ctx.fillStyle = "#6c757d";
        ctx.fillText(String(v), margen.left - 6, y);
    }

    // Barras agrupadas por mes
    const anchoGrupo = w / meses.length;
    const anchoBarra = Math.max(4, Math.min(28, anchoGrupo * 0.35));
    
    meses.forEach((mes, i) => {
        const cx = margen.left + anchoGrupo * i + anchoGrupo / 2;
        
        TIPOS.forEach((tipo, j) => {
            const valor = grupos[mes][tipo];
            const x = j === 0 ? cx - anchoBarra - 2 : cx + 2;
            const y = yDe(valor);
            ctx.fillStyle = COLORES[tipo];
            ctx.fillRect(x, y, anchoBarra, margen.top + h - y);

            if (valor > 0) {
                ctx.fillStyle = "#212529";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(String(valor), x + anchoBarra / 2, y - 2);
            }
        });

        const [a, m] = mes.split("-");
        ctx.fillStyle = "#495057";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(`${MESES[Number(m) - 1]} ${a.slice(2)}`, cx, margen.top + h + 8);
    });

    // Leyenda
    let xLeyenda = margen.left;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    TIPOS.forEach((tipo) => {
        ctx.fillStyle = COLORES[tipo];
        ctx.fillRect(xLeyenda, 12, 12, 12);
        ctx.fillStyle = "#212529";
        ctx.fillText(tipo, xLeyenda + 18, 18);
        xLeyenda += ctx.measureText(tipo).width + 40;
    });
}

// INICIO
document.addEventListener("DOMContentLoaded", async () => {
    mostrarUsuarioActivo();
    document.getElementById("formIntercambio").addEventListener("submit", manejarAlta);
    document.getElementById("tablaIntercambios").addEventListener("click", manejarBorrado);

    let temporizador;
    window.addEventListener("resize", () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => dibujarGrafico(intercambiosActuales), 150);
    });

    await refrescar();
})