# TriDa API — primera versión

API REST en Node.js/Express para conectar el frontend React de TriDa con PostgreSQL.

## 1. Requisitos

- Node.js 18+
- PostgreSQL
- Base de datos creada con el script principal de TriDa
- Migración `sql/01_bancos_canal_critica.sql` ejecutada

## 2. Instalación

```bash
cd trida-api
npm install
cp .env.example .env
```

Edita `.env` con tus datos reales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trida_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=un_secreto_seguro
FRONTEND_URL=http://localhost:5173
```

## 3. Ejecutar migración adicional

Después de ejecutar tu script principal de base de datos, ejecuta:

```bash
psql -U postgres -d trida_db -f sql/01_bancos_canal_critica.sql
```

## 4. Crear usuarios demo para login

```bash
npm run seed:demo-users
```

Credenciales creadas:

```txt
admin@trida.co / admin123
analyst@trida.co / analyst123
operator@trida.co / operator123
```

## 5. Iniciar API

```bash
npm run dev
```

API disponible en:

```txt
http://localhost:3000
```

## 6. Endpoints principales

### Auth

```http
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Catálogos y datos

```http
GET /api/banks?includeAll=true
GET /api/system-users
GET /api/clients
GET /api/devices
```

### Transacciones

```http
GET /api/transactions?page=1&pageSize=30
GET /api/transactions/:id
GET /api/transactions/map?limit=150
```

Filtros soportados:

```txt
bankId=bancolombia
status=approved|flagged|blocked|pending
alertLevel=low|medium|high|critical
channel=mobile|web|pos|atm|branch
search=texto
sort=timestamp|id|amount|riskScore
dir=asc|desc
from=2026-06-01
to=2026-06-15
```

### Alertas

```http
GET   /api/alerts
GET   /api/alerts/:id
PATCH /api/alerts/:id/status
```

### Dashboard y analíticas

```http
GET /api/dashboard
GET /api/analytics
```

## 7. Conexión desde React

Crea en el frontend un archivo:

```js
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('trida-token');

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la API');
  return data;
}
```

Y en `.env` del frontend:

```env
VITE_API_URL=http://localhost:3000/api
```
