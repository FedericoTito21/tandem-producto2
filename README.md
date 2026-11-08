# Tándem · Producto 2 (FP066)

Frontend de la plataforma de intercambio de idiomas con persistencia en el navegador
y APIs de HTML5 (localStorage, IndexedDB, canvas y drag and drop). Vanilla JS con módulos ES y Bootstrap 5.3.3.

## Cómo abrirlo
Los módulos ES no funcionan abriendo el HTML con doble clic. Abre la carpeta en VS Code
y usa **Live Server** (o Live Preview) sobre `src/pages/index.html`.

## Estructura
```
src/
  pages/
    index.html              Dashboard
    login.html              Login
    exchanges.html          Intercambios
    users.html              Usuarios
  css/
    styles.css              estilos propios
  js/
    almacenaje.js           punto de entrada único al CRUD (fachada que reexporta los submódulos)
    almacenaje/
      bd.js                 apertura de IndexedDB y operar() (uso interno)
      usuarios.js           usuarios y sesión (localStorage)
      intercambios.js       intercambios y selección del Dashboard (IndexedDB, promesas)
      demo.js               datos de ejemplo
    componentes/
      layout.js             cabecera y pie comunes, usuario activo, cerrar sesión
      tarjeta.js            tarjeta arrastrable del Dashboard
      grafico.js            gráfico de barras con canvas
    utils/
      constantes.js         TIPOS, COLORES_TIPO
      dom.js                escaparHtml, mostrarAviso, celda
      formato.js            formatearFecha, formatearMes
      validacion.js         esEmail, esFecha, longitudEntre, marcar, limpiarMarcas
    int_1_dashboard.js      script de la página Dashboard
    int_2_login.js          script de la página Login
    int_3_intercambios.js   script de la página Intercambios
    int_4_usuarios.js       script de la página Usuarios
```

Dependencias en un solo sentido:
`int_N_*.js` → `componentes/` y `utils/` → `almacenaje.js` → `almacenaje/*`.

## Reglas del proyecto
1. Las páginas acceden a los datos solo con `import * as almacenaje from "./almacenaje.js"`; nunca usan localStorage ni IndexedDB directamente.
2. Cada script de página importa primero `./componentes/layout.js`, que genera la barra de navegación (con `#usuarioActivo`) y el pie.
3. Cada HTML indica su página en `<body data-pagina="...">` (`dashboard`, `login`, `intercambios`, `usuarios`) e incluye `<header id="layout-header">` y `<footer id="layout-footer">` vacíos.
4. Todos los `import` llevan la extensión `.js` (el navegador no la completa).
5. Los nombres de las APIs del navegador no se traducen (`transaction`, `objectStore`, `getItem`...).

## Plantilla para una página nueva
```html
<body data-pagina="usuarios">
  <!-- Cabecera común: la genera js/componentes/layout.js -->
  <header id="layout-header"></header>
  <main class="container py-4"> ... </main>
  <!-- Pie común: lo genera js/componentes/layout.js -->
  <footer id="layout-footer"></footer>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script type="module" src="../js/int_4_usuarios.js"></script>
</body>
```
```js
// js/int_4_usuarios.js
import "./componentes/layout.js";
import * as almacenaje from "./almacenaje.js";
import { mostrarAviso, celda } from "./utils/dom.js";
import { esEmail, longitudEntre, marcar, limpiarMarcas } from "./utils/validacion.js";
```

## Datos de ejemplo
La primera vez que se abre la aplicación se cargan 3 usuarios y 4 intercambios (p. ej. `laura@tandem.com` / `1234`).
Para quitarlos, borra las llamadas a `iniciarDatosDemo()` en los scripts de página.
En las herramientas de desarrollo (F12) puedes ver los datos en *Application > Local Storage* e *IndexedDB > tandem-bd*.
Para empezar de cero: *Application > Storage > Clear site data*.

## Limitaciones conocidas
1. Las contraseñas se guardan en texto plano en localStorage (no hay backend en este producto).
2. Los datos solo existen en el navegador donde se crean.

## Equipo Node3
Persona 1: Federico Tito · Persona 2: Andrea Ros · Persona 3: Gerard Garro