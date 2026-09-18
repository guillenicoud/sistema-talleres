# Sistema Juventud: desarrollo y estabilización

Revisión del 17 de septiembre de 2026. Se conserva Angular 15, Express 4, MySQL y la separación `front` / `back`.

## Arquitectura y flujo existente

- `src/app/app.module.ts`: módulo Angular, formularios, HttpClient y rutas. Entrada en Dashboard; navegación a alumnos, talleristas, talleres y horarios.
- `src/app/components`: presentación y formularios. `services`: llamadas HTTP. `models`: contratos TypeScript. `shared/validation.ts`: validaciones y mensajes de error.
- `../back/index.js`: arranque. `../back/src/app.js`: Express, CORS, JSON, validaciones, rutas y errores. `routes` despacha a `controllers`; estos ejecutan SQL parametrizado con `mysql2/promise`.
- Tablas referidas por el código: `alumnos` (`id_alumno`), `talleristas` (`id_tallerista`), `talleres` (`id_taller`), `dias_semana` (`id_dia`) y `detalle_taller` (`id_detalle`). El detalle relaciona taller, tallerista y día, con inicio, fin y nivel.
- No hay ORM, migraciones, DDL ni esquema SQL versionado que permita recrear la base de manera fiable. Los modelos se dedujeron de las consultas; no se verificaron restricciones del servidor.
- No existen usuarios, sesiones, autenticación, autorización ni roles implementados. El antiguo texto “Admin” del menú no representaba una sesión.
- Inscripciones, asistencia, sala de música, estadísticas, configuración y reportes no tienen implementación completa. Los totales de inscriptos del documento de negocio requieren un modelo y endpoints todavía ausentes.

## Diagnóstico inicial y correcciones

- **Crítico — secretos versionados.** `../back/src/config/dbx.js` contenía una credencial y desactivaba la verificación TLS. Se reemplazó por configuración de entorno con verificación TLS. Se excluyeron del índice Git ambos `.env`, conservando los archivos locales. **Todavía se deben rotar las credenciales en el proveedor; permanecen en el historial Git.**
- **Alto — errores de API sin respuesta.** Controladores de alumnos y talleres registraban errores sin contestar; actualizar tallerista podía rechazar una promesa sin capturarla. Todos delegan ahora al manejador central; no se imprimen cuerpos, SQL ni datos personales. Errores de validación/JSON: 400; inexistentes: 404; duplicados/relaciones: 409; fallo interno: 500; tamaño excesivo: 413.
- **Alto — CRUD defectuoso.** Consulta de alumno usaba `id` en vez de `id_alumno`; taller usaba SQL de inserción y desestructuración incorrectos; faltaba DELETE de horario y faltaba `:id` en DELETE de tallerista. Se corrigieron estas rutas y consultas. Las altas incluyen los identificadores que necesita la interfaz. Se conservaron las respuestas de consulta individual en lista donde ya existían.
- **Alto — endpoints públicos.** El backend escucha en `127.0.0.1` por defecto y limita CORS a los orígenes configurados. Esto reduce exposición accidental, **no reemplaza autenticación**. No publicar el servidor ni cambiar `HOST` sin una política de acceso real.
- **Alto — conexión inconsistente, resuelta.** El código activo es MySQL; el `.env` inicial declaraba puerto 5432 y la implementación anterior lo ignoraba. Al empezar a respetar `DB_PORT` se produjo `ETIMEDOUT`. Se comprobó que el mismo servidor responde en 3306 y se corrigió únicamente ese puerto en el `.env` local, sin cambiar credenciales ni motor. La conexión con la configuración guardada pasó `SELECT 1`; `SHOW TABLES` encontró seis tablas. Se mantienen tiempo máximo de conexión y cola acotada.
- **Medio — UI de horarios desactualizada.** Edición/eliminación modificaban el arreglo principal pero dejaban grupos viejos. Ahora se reconstruyen los grupos y se actualizan día y tallerista; `[ngValue]` conserva IDs numéricos. Los diccionarios no heredan claves como `constructor`.
- **Medio — validaciones y estados.** Validación de nombres, DNI cuando se informa, email, IDs y horarios. Se conserva el DNI opcional del formulario existente. Indicadores de carga, errores visibles, reintento, bloqueo de envíos repetidos y conservación del formulario ante errores.
- **Medio — conexión del frontend.** Las URLs absolutas repetidas se reemplazaron por `/api`. El proxy de desarrollo centraliza destino/puerto; el navegador ya no intenta conectar al localhost de cada visitante en producción.
- **Medio — navegación y presentación.** Los módulos pendientes dejaron de ser enlaces rotos; rutas desconocidas vuelven al Dashboard. La lista de talleres muestra campos que realmente devuelve su endpoint, con enlace a Horarios. Menú adaptable, tablas desplazables, controles con nombres accesibles, navegación activa y fechas españolas.
- **Medio — temporizador.** El reloj del Dashboard se libera al salir y vuelve a consultar talleres cuando cambia el día.
- **Medio — repositorio y dependencias.** Más de 1.300 archivos generados de `back/node_modules` estaban versionados. Se quitaron del índice, conservando la instalación local; las dependencias se reproducen con `npm ci` y los lockfiles. Los retiros del índice quedan preparados, sin commit.
- **Medio — pruebas.** Los tres tests iniciales de Angular fallaban por componentes desconocidos. Se reparó la configuración y se agregaron pruebas de regresión de formularios, horarios, reloj y API. El backend usa el runner nativo de Node; las consultas se simulan para no alterar la base real.

## Ejecutar

En `back`, crear `.env` a partir de `.env.example` solo si no existe y completar una conexión MySQL válida. `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` son variables del servidor. El puerto habitual de MySQL es 3306; confirmar el puerto del proveedor. No sobrescribir un `.env` existente.

```powershell
cd J:\GitHub\sistema-juventud\back
npm ci
npm start
```

`npm run dev` utiliza nodemon. Puerto HTTP por defecto: 3000; `HOST` por defecto: 127.0.0.1. `CORS_ORIGINS` acepta orígenes separados por comas. `dbx.js` es una alternativa PostgreSQL no utilizada por los controladores; usa `POSTGRES_URL` y `POSTGRES_SSL` si se integra expresamente en una futura migración.

En otra terminal:

```powershell
cd J:\GitHub\sistema-juventud\front
npm ci
npm start
```

Abrir http://localhost:4200. `proxy.conf.json` envía `/api` a `http://127.0.0.1:3000`; si cambia el puerto HTTP del backend, ajustar ese único archivo. El frontend no usa dotenv ni necesita su antiguo `.env`.

Para desplegar el build estático, el servidor debe servir `dist/front`, resolver rutas Angular con fallback a `index.html` y reenviar `/api` al backend **antes** de ese fallback. El proxy de Angular solo se aplica al desarrollo. No incluir secretos en el bundle. Este trabajo no incorpora un despliegue ni habilita acceso público.

## Verificaciones reproducibles

Desde `front`:

```powershell
npm run typecheck
npm run build
npm run test:ci
npm --prefix ../back test
npm --prefix ../back run check
```

Chrome debe estar instalado para `test:ci`; puede configurarse `CHROME_BIN`. No hay linter configurado en el proyecto. Typecheck revisa código de aplicación y pruebas; el build revisa templates estrictos. No se agregó una herramienta de lint con reglas nuevas sobre todo el proyecto.

Resultado de la estabilización inicial: 14 pruebas de frontend y 11 pruebas de backend aprobadas; luego el CRUD completo de talleres y la eliminación de talleristas elevaron las suites a 21 pruebas de frontend y 12 de backend. Typecheck, build, chequeo de sintaxis del backend y `git diff --check` aprobados. En navegador se verificaron navegación, errores de API, formulario vacío y diseño a 390 píxeles; no se observaron errores JavaScript en el registro consultado.

Las pruebas de backend simulan `pool.query`; comprueban rutas, parámetros, códigos de estado y errores, pero no garantizan el DDL, las relaciones ni los datos reales. Ejecutar integración sobre una base de prueba una vez disponible. No se probaron altas, modificaciones ni eliminaciones sobre datos reales.

## Dependencias y riesgos pendientes

Se aplicó `npm audit fix --ignore-scripts` sin `--force`, respetando los rangos existentes y actualizando lockfiles. Resultado del registro npm durante esta revisión:

- Backend: 8 vulnerabilidades iniciales, 0 después de los parches.
- Frontend: 76 iniciales, 46 restantes (3 bajas, 20 moderadas, 22 altas, 1 crítica). Incluye dependencias transitivas y herramientas de construcción; los conteos no prueban que todas sean explotables en esta aplicación.
- No aplicar `npm audit fix --force` a ciegas: propone versiones mayores de Angular/CLI. Planificar actualización gradual con pruebas y un runtime soportado.
- Se verificó con Node 22.14.0. Angular 15 está fuera de soporte y su matriz oficial no incluye Node 22: que estas comprobaciones pasen no convierte esa combinación en soportada. Fuente: https://angular.dev/reference/versions.
- El build mantiene una advertencia de presupuesto inicial (571,40 kB frente a 500 kB; transferencia estimada 111,42 kB después de completar el CRUD de talleres). No se elevó el umbral. Bootstrap completo aporta aproximadamente 219 kB. Se desactivó únicamente el inline de CSS crítico incompatible con selectores de Bootstrap en el compilador antiguo; se conserva minificación.
- La vulnerabilidad crítica restante corresponde a `tar`, dependencia transitiva del toolchain. No se reemplazó por otra versión mayor mediante un override sin verificar compatibilidad.

Prioridad siguiente: recuperar un esquema sin datos personales y completar pruebas de integración CRUD; rotar secretos expuestos; definir usuarios/roles y proteger endpoints; actualizar Angular y su toolchain; luego completar inscripciones/asistencia y los indicadores del Dashboard. La conectividad MySQL ya fue comprobada. El sistema queda con correcciones verificadas para continuar el desarrollo, no certificado para producción.
