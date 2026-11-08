// js/componentes/layout.js
// Cabecera (barra de navegación) y pie COMUNES a todas las páginas.
// Cada págona solo necesita:
// - <body data-pagina="dashboard|login|intercambios|usuarios">
// - <header id="layout-header"></header> ... <footer id="layout-footer"></footer> y que su script de página importe este módulo en primer lugar.
import { obtenerUsuarioActivo, cerrarSesion } from "../almacenaje.js";

// Enlaces de la barra: siempre los cuatro que pide el enunciado
const ENLACES = [
    { pagina: "dashboard", texto: "Dashboard", href: "index.html" },
    { pagina: "login", texto: "Login", href: "login.html" },
    { pagina: "intercambios", texto: "Intercambios", href: "exchanges.html" },
    { pagina: "usuarios", texto: "Usuarios", href: "users.html" },
];

// Título de la pestaña del navegador según la página.
function tituloDe(pagina) {
    switch (pagina) {
        case "dashboard":
            return "Dashboard";
        case "login":
            return "Iniciar sesión";
        case "intercambios":
            return "Intercambios";
        case "usuarios":
            return "Usuarios";
        default:
            return "";
    }
}

function crearCabecera(paginaActual) {
    const enlaces = ENLACES.map(({ pagina, texto, href }) => {
        const activo = pagina === paginaActual;
        return `<li class="nav-item">
            <a class="nav-link${activo ? " active" : ""}" href="${href}"${activo ? ' aria-current="page"' : ""}>${texto}</a>
        </li>`;
    }).join("");

    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
                <a class="navbar-brand fw-semibold" href="index.html">Tándem</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu" aria-controls="menu" aria-expanded="false" aria-label="Abrir menú">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="menu">
                    <ul class="navbar-nav me-auto">${enlaces}</ul>
                    <span class="navbar-text me-3">Usuario: <strong id="usuarioActivo">-no login-</strong></span>
                    <button type="button" class="btn btn-light btn-sm d-none" id="botonSesion">Cerrar sesión</button>
                </div>
            </div>
        </nav>
    `;
}

function crearPie() {
    return `
        <div class="text-center text-muted py-3 small">Tándem · Proyecto FP.066 · Producto 2</div>
    `;
}

// Escribe el nombre del usuario activo (o -no login-) y muestra u oculta "Cerrar sesión"
export function actualizarBarra() {
    const usuario = obtenerUsuarioActivo();
    const etiqueta = document.getElementById("usuarioActivo");
    const boton = document.getElementById("botonSesion");

    if (etiqueta) etiqueta.textContent = usuario ? usuario.nombre : "-no login-";
    if (boton) boton.classList.toggle("d-none", !usuario);
}

// Inserta cabecera y pie en la página actual
export function pintarLayout(paginaActual = document.body.dataset.pagina) {
    const cabecera = document.getElementById("layout-header");
    const pie = document.getElementById("layout-footer");

    if (cabecera) cabecera.innerHTML = crearCabecera(paginaActual);
    if (pie) pie.innerHTML = crearPie();

    const titulo = tituloDe(paginaActual);
    document.title = titulo ? `Tándem - ${titulo}` : "Tándem";

    const boton = document.getElementById("botonSesion");
    if (boton) {
        boton.addEventListener("click", () => {
            cerrarSesion();
            location.href = "login.html";
        });
    }

    actualizarBarra();
}

// Se pinta automáticamente al importar el módulo
pintarLayout();