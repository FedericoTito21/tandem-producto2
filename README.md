# Tándem · Producto 2 (FP066)

Frontend de la plataforma de intercambio de idiomas con persistencia en el navegador
y APIs de HTML5 (localStorage, IndexedDB, canvas y drag and drop). Vanilla JS con módulos ES y Bootstrap 5.3.3.

## Cómo abrirlo
Los módulos ES no funcionan abriendo el HTML con doble clic. Abre la carpeta en VS Code
y usa **Live Server** (o Live Preview) sobre `src/pages/index.html`.

## Estructura
- `src/pages/` index (Dashboard), login, exchanges (Intercambios) y users (Usuarios).
- `src/js/almacenaje.js` módulo con todas las operaciones CRUD (usuarios y sesión en localStorage; intercambios y selección en IndexedDB).
- `src/js/int_1_dashboard.js`, `int_3_intercambios.js`, `int_4_usuarios.js`, `login.js`, `nav.js`, `utils.js`.
- `src/css/styles.css` estilos propios.

## Datos de ejemplo
La primera vez que se abre la aplicación se cargan 3 usuarios y 4 intercambios (p. ej. `laura@tandem.com` / `1234`).
Para quitarlos, borra las llamadas a `iniciarDatosDemo()` en los scripts.
En las herramientas de desarrollo (F12) puedes ver los datos en *Application > Local Storage* e *IndexedDB > tandem-bd*.

## Equipo Node3
Persona 1: Federico Tito · Persona 2: Andrea Ros · Persona 3: Gerard Garro
