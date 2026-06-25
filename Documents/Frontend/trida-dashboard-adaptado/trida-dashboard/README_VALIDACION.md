# Validación de requisitos — TriDa Dashboard

Proyecto adaptado sobre la idea original: **Sistema de Monitoreo de Transacciones con IA para Detección de Fraude**.

## Resultado técnico

- Framework: React + Vite.
- Rutas: `react-router-dom` en `src/App.tsx`.
- Store global: `src/store/Context.jsx`.
- Páginas: `src/pages/`.
- Componentes reutilizables: `src/components/`.
- CRUD genérico con ventanas emergentes: `GenericCrudPage.jsx` + `CrudModal.jsx`.
- API externa y backend: `src/services/api.js`.

## Validación uno a uno

| # | Requisito | Estado | Dónde está |
|---|---|---|---|
| 1 | NO se reciben archivos en HTML | ✅ Cumplido | Las interfaces están en React dentro de `src/pages`. Solo existe `index.html` por ser requerido por Vite como entrada técnica. |
| 2 | No es necesario que esté conectado al backend | ✅ Cumplido | El sistema funciona sin backend usando store local y fallback. |
| 3 | Componentes junto con carpeta componentes | ✅ Cumplido | `src/components`: `Header`, `Footer`, `Navbar`, `CrudModal`, `GenericCrudPage`, `MetricCard`, `IntegrationStatus`, etc. |
| 4 | Comunicación padre a hijo e hijo a padre | ✅ Cumplido | Ver sección específica abajo. |
| 5 | Rutas en `App.tsx` con react-router-dom | ✅ Cumplido | `src/App.tsx` conecta landing, login, registro, dashboards y todas las rutas CRUD. |
| 6 | Store / estado global | ✅ Cumplido | `src/store/Context.jsx` maneja auth, token, roles, tema, transacciones, permisos, bancos y base demo CRUD. |
| 7 | Conexión API externa y backend | ✅ Cumplido | `src/services/api.js`: API externa Coingecko + backend configurable con `VITE_BACKEND_URL`. |
| 8 | Token admin y al menos dos roles más | ✅ Cumplido | `createDemoToken()` en `Context.jsx`; roles: `admin`, `analyst`, `operator`, `client`. |
| 9 | Interfaces en carpeta pages | ✅ Cumplido | Todas las páginas pedidas están en `src/pages`. |

## Comunicación entre componentes

### Padre → hijo

1. `src/components/AppShell.jsx` → `src/components/Header.jsx`
   - Envía: `title`, `subtitle`, `alertCount`, `syncStatus`.
   - Uso: el header muestra el título dinámico según la ruta y el estado de backend.

2. `src/components/GenericCrudPage.jsx` → `src/components/CrudModal.jsx`
   - Envía: `config`, `item`, `mode`, `open`.
   - Uso: el modal sabe si está creando o modificando y qué campos debe pintar.

3. `src/pages/AdminDashboardPage.jsx` → `src/components/MetricCard.jsx`
   - Envía: `label`, `value`, `helper`, `icon`, `color`.
   - Uso: tarjetas reutilizables de métricas del dashboard.

### Hijo → padre

1. `src/components/Header.jsx` → `src/components/AppShell.jsx`
   - Ejecuta `onRefresh()` cuando se presiona el botón de refrescar.
   - Esto actualiza la conexión a API externa desde el padre.

2. `src/components/CrudModal.jsx` → `src/components/GenericCrudPage.jsx`
   - Ejecuta `onSave(form)` para crear/modificar.
   - Ejecuta `onClose()` para cerrar la ventana emergente.

3. Confirmación de eliminación en `GenericCrudPage.jsx`
   - La ventana emergente de confirmación llama a `confirmDelete()` para eliminar del store y disparar DELETE al backend.

## Rutas principales

| Interfaz | Ruta | Archivo |
|---|---|---|
| Landing page | `/` | `src/pages/LandingPage.jsx` |
| Login | `/login` | `src/components/Login.jsx` |
| Registro | `/registro` | `src/pages/RegisterPage.jsx` |
| Dashboard administrador | `/admin` | `src/pages/AdminDashboardPage.jsx` |
| Dashboard cliente / estándar | `/cliente` | `src/pages/ClientDashboardPage.jsx` |

## 8 interfaces CRUD mínimas

Todas muestran datos del store global, tienen **crear**, **modificar** y **eliminar** con ventana emergente.

| # | Interfaz | Ruta | Archivo |
|---|---|---|---|
| 1 | Usuarios | `/admin/usuarios` | `src/pages/UsersCrudPage.jsx` |
| 2 | Transacciones | `/admin/transacciones` | `src/pages/TransactionsCrudPage.jsx` |
| 3 | Alertas | `/admin/alertas` | `src/pages/AlertsCrudPage.jsx` |
| 4 | Bancos | `/admin/bancos` | `src/pages/BanksCrudPage.jsx` |
| 5 | Dispositivos | `/admin/dispositivos` | `src/pages/DevicesCrudPage.jsx` |
| 6 | Reglas antifraude | `/admin/reglas` | `src/pages/RulesCrudPage.jsx` |
| 7 | Modelos IA | `/admin/modelos` | `src/pages/ModelsCrudPage.jsx` |
| 8 | Auditoría | `/admin/auditoria` | `src/pages/AuditLogsCrudPage.jsx` |

## Roles y credenciales demo

| Rol | Correo | Contraseña | Ruta después de login |
|---|---|---|---|
| Administrador | `admin@trida.co` | `admin123` | `/admin` |
| Analista | `analyst@trida.co` | `analyst123` | `/cliente` |
| Operador | `operator@trida.co` | `operator123` | `/cliente` |
| Cliente estándar | `cliente@trida.co` | `cliente123` | `/cliente` |

Cada login genera un token demo tipo JWT en `AuthProvider` y lo guarda en:

- `user.token`
- `localStorage.trida-token`

## API externa y backend

### API externa

Archivo: `src/services/api.js`

Función:

```js
getExternalMarketSignal()
```

Consulta Coingecko para una señal externa BTC/COP. Si no hay red o la API falla, el sistema usa fallback local y sigue funcionando.

### Backend del proyecto

Archivo: `src/services/api.js`

Funciones:

```js
backendList(resource)
backendCreate(resource, item, token)
backendUpdate(resource, id, item, token)
backendDelete(resource, id, token)
```

URL configurable:

```bash
VITE_BACKEND_URL=http://localhost:3001/api
```

Si no existe backend, el CRUD funciona con store local.

## Comandos de prueba

```bash
npm install
npm run lint
npm run build
npm run dev
```

Validado: `npm run lint` y `npm run build` pasan correctamente.
