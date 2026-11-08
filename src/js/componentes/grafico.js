// js/componentes/grafico.js
// Gráfico de barras de intercambios por mes y tipo, dibujado con la API Canvasde HTML5 (sin librerías)
import { TIPOS, COLORES_TIPO } from "../utils/constantes.js";
import { formatearFecha, formatearMes } from "../utils/formato.js";

const ALTO = 320;
const MARGEN = { top: 40, right: 16, bottom: 36, left: 40 };

// Cuenta los intercambios de cada tipo por mes:
// { "2026-11": { "Ofrezco idioma": 2, "Busco idioma": 1 }, ... }
export function agruparPorMes(intercambios) {
  const grupos = {};

  for (const i of intercambios) {
    const clave = (i.fecha || "").slice(0, 7); // "2026-11-03" -> "2026-11"

    if (!clave) continue;
    grupos[clave] ??= Object.fromEntries(TIPOS.map((t) => [t, 0]));
    if (TIPOS.includes(i.tipo)) grupos[clave][i.tipo]++;
  }
  return grupos;
}

// Ajusta el tamaño interno del canvas a su tamaño en pantalla (nítido en pantallas de alta densidad)
function prepararLienzo(canvas) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const ancho = canvas.clientWidth || 600;
    canvas.style.height = `${ALTO}px`;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(ALTO * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, ancho, ALTO);
    ctx.font = "12px system-ui, sans-serif";
    return { ctx, ancho };
}

// Líneas horizontales de fondo y núemres del eje Y
function dibujarRejilla(ctx, w, tope, paso, yDe) {
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let v = 0; v <= tope; v += paso) {
        const y = yDe(v);
        ctx.strokeStyle = v === 0 ? "#adb5bd" : "#e9ecef";
        ctx.beginPath();
        ctx.moveTo(MARGEN.left, y);
        ctx.lineTo(MARGEN.left + w, y);
        ctx.stroke();
        ctx.fillStyle = "#6c757d";
        ctx.fillText(String(v), MARGEN.left - 6, y);
    }
}

// Dos barras por mes (una por tipo), con su valor encima y el mes debajoç
function dibujarBarras(ctx, grupos, meses, w, h, yDe) {
    const anchoGrupo = w / meses.length;
    const anchoBarra = Math.max(4, Math.min(28, anchoGrupo * 0.35));

    meses.forEach((mes, i) => {
        const cx = MARGEN.left + anchoGrupo * i + anchoGrupo / 2;
        
        TIPOS.forEach((tipo, j) => {
            const valor = grupos[mes][tipo];
            const x = j === 0 ? cx - anchoBarra - 2 : cx + 2;
            const y = yDe(valor);
            ctx.fillStyle = COLORES_TIPO[tipo];
            ctx.fillRect(x, y, anchoBarra, MARGEN.top + h - y);

            if (valor > 0) {
                ctx.fillStyle = "#212529";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(String(valor), x + anchoBarra / 2, y - 2);
            }
        });

        ctx.fillStyle = "#495057";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(formatearMes(mes), cx, MARGEN.top + h + 8);
    });
}

// Leyenda
function dibujarLeyenda(ctx) {
    let x =MARGEN.left;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    TIPOS.forEach((tipo) => {
        ctx.fillStyle = COLORES_TIPO[tipo];
        ctx.fillRect(x, 12, 12, 12);
        ctx.fillStyle = "#212529";
        ctx.fillText(tipo, x + 18, 18);
        x += ctx.measureText(tipo).width + 40;
    });
}

// Función pública: dibuja el gráfico en el canvas indicado (últimos 12 meses con datos)
export function dibujarGrafico(canvas, intercambios) {
    const { ctx, ancho } = prepararLienzo(canvas);

    if (intercambios.length === 0) {
        ctx.fillStyle = "#6c757d";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Sin datos para mostrar", ancho / 2, ALTO / 2);
        return;
    }

    const grupos = agruparPorMes(intercambios);
    const meses = Object.keys(grupos).sort().slice(-12);
    const maximo = Math.max(1, ...meses.flatMap((m) => TIPOS.map((t) => grupos[m][t])));

    const w = ancho - MARGEN.left - MARGEN.right;
    const h = ALTO - MARGEN.top - MARGEN.bottom;
    const paso = Math.max(1, Math.ceil(maximo / 5));
    const tope = paso * Math.ceil(maximo / paso);
    const yDe = (v) => MARGEN.top + h - (v / tope) * h; // convierte un valor en una coordenada Y

    dibujarRejilla(ctx, w, tope, paso, yDe);
    dibujarBarras(ctx, grupos, meses, w, h, yDe);
    dibujarLeyenda(ctx);

}
