# Webinar API

API REST para la recuperación y gestión de sesiones de webinar mediante autenticación y autorización por API Keys con alcances `standard` y `admin`.

## Configuración de `.env`

Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
PORT=3005
DB_URL=mongodb://localhost:27017/webinar_db
ADMIN_API_KEY=<clave-inicial-de-administrador>
```

- `PORT`: Puerto en el que se ejecuta el servidor HTTP (por defecto `3005`).
- `DB_URL`: Cadena de conexión a MongoDB.
- `ADMIN_API_KEY`: Clave inicial con alcance `admin` utilizada para inicializar el acceso administrativo.

## Cómo levantar MongoDB mediante Docker

Iniciar el contenedor de MongoDB definido en `docker-compose.yml`:

```bash
docker compose up -d
```

Para detener el contenedor:

```bash
docker compose down
```

## Cómo instalar las dependencias y ejecutar la aplicación

1. Instalar las dependencias del proyecto:

```bash
npm install
```

2. Compilar el código TypeScript:

```bash
npm run build
```

3. Iniciar la aplicación en modo producción:

```bash
npm start
```

Para ejecutar en modo desarrollo con recarga automática:

```bash
npm run dev
```

## Cómo ejecutar las pruebas automatizadas

Asegurarse de que el contenedor de MongoDB esté activo y ejecutar:

```bash
npm test
```

Para verificar calidad de código y formato:

```bash
npm run lint
npm run format:check
```

## Ejemplos de petición para los endpoints implementados

La base de las rutas es `/webinar`.

### 1. Estado de la API (Sin autenticación)

- **GET `/webinar/health`**

```bash
curl -X GET http://localhost:3005/webinar/health
```

Respuesta (200 OK):
```json
{
  "status": "ok"
}
```

### 2. Recuperación de una sesión (Alcance `standard` o `admin`)

- **GET `/webinar/sessions?accessToken=<string>`**

```bash
curl -X GET "http://localhost:3005/webinar/sessions?accessToken=webinar-intro-2026" \
  -H "api-key: <standard-o-admin-api-key>"
```

Respuesta (200 OK):
```json
{
  "sessionId": "session-101",
  "accessCode": "webinar-intro-2026",
  "description": "Introducción a la Arquitectura en Capas",
  "url": "https://example.com/webinar/intro"
}
```

### 3. Listado de sesiones (Exclusivo para alcance `admin`)

- **GET `/webinar/sessions`**

```bash
curl -X GET http://localhost:3005/webinar/sessions \
  -H "api-key: <admin-api-key>"
```

Respuesta (200 OK):
```json
[
  {
    "sessionId": "session-101",
    "accessCode": "webinar-intro-2026",
    "description": "Introducción a la Arquitectura en Capas",
    "url": "https://example.com/webinar/intro"
  }
]
```

### 4. Creación de una sesión (Exclusivo para alcance `admin`)

- **POST `/webinar/sessions`**

```bash
curl -X POST http://localhost:3005/webinar/sessions \
  -H "Content-Type: application/json" \
  -H "api-key: <admin-api-key>" \
  -d '{
    "sessionId": "session-102",
    "accessCode": "advanced-patterns-2026",
    "description": "Patrones Avanzados de Diseño",
    "url": "https://example.com/webinar/patterns"
  }'
```

Respuesta (201 Created):
```json
{
  "sessionId": "session-102",
  "accessCode": "advanced-patterns-2026",
  "description": "Patrones Avanzados de Diseño",
  "url": "https://example.com/webinar/patterns"
}
```

### 5. Eliminación de una sesión (Exclusivo para alcance `admin`)

- **DELETE `/webinar/sessions/:sessionId`**

```bash
curl -X DELETE http://localhost:3005/webinar/sessions/session-102 \
  -H "api-key: <admin-api-key>"
```

Respuesta (200 OK):
```json
{
  "message": "Session deleted successfully"
}
```

### 6. Creación de API Keys (Exclusivo para alcance `admin`)

- **POST `/webinar/apikeys`**

Creación de clave con alcance `standard`:
```bash
curl -X POST http://localhost:3005/webinar/apikeys \
  -H "Content-Type: application/json" \
  -H "api-key: <admin-api-key>" \
  -d '{
    "apiKey": "key-client-standard-01",
    "scope": "standard"
  }'
```

Respuesta (201 Created):
```json
{
  "apiKey": "key-client-standard-01",
  "scope": "standard"
}
```

Creación de clave con alcance `admin`:
```bash
curl -X POST http://localhost:3005/webinar/apikeys \
  -H "Content-Type: application/json" \
  -H "api-key: <admin-api-key>" \
  -d '{
    "apiKey": "key-new-admin-01",
    "scope": "admin"
  }'
```

Respuesta (201 Created):
```json
{
  "apiKey": "key-new-admin-01",
  "scope": "admin"
}
```
