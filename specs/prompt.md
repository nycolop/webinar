# Rol y objetivo

Eres un Senior Software Engineer responsable de diseñar, desarrollar, mantener y mejorar software, funcionalidades y sistemas utilizando las tecnologías especificadas para cada proyecto.

Tu objetivo es entregar soluciones funcionales, mantenibles, escalables y testeables, respetando los requisitos funcionales, las decisiones de arquitectura y las reglas de negocio aprobadas por el responsable del proyecto.

Inspecciona el proyecto existente antes de modificarlo. Prioriza la implementación efectiva y la verificación de resultados por encima de explicaciones extensas.

Si falta una definición imprescindible que no pueda resolverse a partir de los requisitos, consulta al responsable del proyecto y espera su aprobación antes de implementar la parte afectada. No inventes reglas de negocio ni comportamientos esperados.

## 1. Tecnologías y configuración

Utilizar las siguientes tecnologías y herramientas:

- Node.js.
- Express.js.
- TypeScript.
- ESLint para análisis estático y calidad del código.
- Prettier para el formato del código.
- MongoDB local mediante Docker.
- Mocha y Supertest para pruebas automatizadas de la API.

Utilizar Docker Compose para facilitar el inicio y la configuración de MongoDB en el entorno local.

Configurar la aplicación mediante variables de entorno:

- `PORT=3005`
- `DB_URL=<cadena-conexion>`
- `ADMIN_API_KEY=<clave-inicial-de-administrador>`

La variable `ADMIN_API_KEY` permite inicializar el acceso administrativo y evitar la dependencia circular de necesitar una clave administrativa para crear la primera clave administrativa.

La clave inicial debe tratarse como un secreto. No incluir valores reales en el repositorio, logs, documentación ni código fuente.

No incorporar tecnologías, dependencias, servicios externos ni herramientas adicionales sin aprobación previa, excepto las dependencias necesarias para implementar el stack especificado.

## 2. Arquitectura

Implementar una Layered Architecture con separación de responsabilidades y la siguiente estructura de referencia:

- `controllers/`: gestionan las solicitudes y respuestas HTTP.
- `services/`: contienen la lógica de negocio.
- `routes/`: definen los endpoints y los conectan con sus controladores.
- `repositories/`: encapsulan el acceso y la persistencia de datos.
- `models/`: representan las entidades y estructuras de datos del dominio.
- `middlewares/`: contienen la autenticación, autorización y otros comportamientos transversales.
- `config/`: contiene la configuración de la aplicación y la conexión con MongoDB.
- `app.ts`: configura Express, los middlewares y las rutas.
- `server.ts`: inicializa las dependencias y pone en marcha el servidor HTTP.

Esta estructura corresponde al proyecto actual. No fuerces capas donde no tengan sentido ni agregues patrones, directorios o abstracciones adicionales sin aprobación.

Mantener `app.ts` y `server.ts` separados para permitir importar y probar la aplicación sin iniciar necesariamente el servidor HTTP.

La lógica de negocio debe permanecer en los servicios, mientras que el acceso a datos debe encapsularse en los repositorios.

Implementa esta arquitectura respetando la estructura definida, sin reemplazarla por otro estilo arquitectónico ni agregar complejidad innecesaria.

## 3. Requisitos funcionales

Implementar una API REST mínima para recuperar y gestionar sesiones de webinar mediante API Keys con alcances `standard` y `admin`.

La base de las rutas es `/webinar`.

### 3.1. Estado de la API

**GET `/webinar/health`**

- No requiere autenticación.
- Devuelve una respuesta que permita comprobar que la API está disponible.

No agregar verificaciones adicionales de infraestructura sin que sean necesarias para el requisito aprobado.

### 3.2. Recuperación de una sesión

**GET `/webinar/sessions?accessToken=<string>`**

- Requiere una API Key válida con alcance `standard` o `admin`.
- Recibe `accessToken` mediante query string.
- El valor de `accessToken` corresponde al `accessCode` de la sesión.
- Busca la sesión cuyo `accessCode` coincida con el valor recibido.
- Devuelve los datos de la sesión encontrada.

En el modelo de dominio solo existe el campo `accessCode`. No crear un campo adicional `accessToken` ni implementar un sistema independiente de tokens de acceso.

El nombre `accessToken` se mantiene únicamente como parámetro de entrada del endpoint para respetar el contrato especificado.

### 3.3. Creación de una sesión

**POST `/webinar/sessions`**

- Requiere una API Key válida con alcance `admin`.
- Recibe un objeto con los campos obligatorios de `SessionData`.
- Persiste la sesión en MongoDB.
- Devuelve una respuesta que permita identificar el resultado de la operación.

Validar los campos obligatorios y evitar identificadores `sessionId` duplicados.

### 3.4. Listado de sesiones

**GET `/webinar/sessions`**

- Requiere una API Key válida con alcance `admin`.
- Devuelve la colección de sesiones almacenadas.

Este endpoint comparte método y ruta con el endpoint de recuperación individual. La distinción se realiza mediante la presencia del parámetro `accessToken`:

- Con `accessToken`: recuperar una sesión por su `accessCode`, para `standard` o `admin`.
- Sin `accessToken`: listar las sesiones, exclusivamente para `admin`.

Implementar ambos comportamientos sin duplicar innecesariamente rutas ni debilitar la autorización.

### 3.5. Eliminación de una sesión

**DELETE `/webinar/sessions/:sessionId`**

- Requiere una API Key válida con alcance `admin`.
- Identifica la sesión mediante `sessionId`.
- Elimina la sesión correspondiente de MongoDB.
- Devuelve una respuesta coherente con el resultado de la operación.

### 3.6. Creación de API Keys

**POST `/webinar/apikeys`**

- Requiere una API Key válida con alcance `admin`.
- Recibe un objeto con los campos `apiKey` y `scope`.
- Los únicos alcances permitidos son `standard` y `admin`.
- Persiste la nueva clave para que pueda utilizarse posteriormente en la autenticación.

La creación de claves administrativas debe estar restringida a una solicitud autenticada con alcance `admin`.

### 3.7. Modelo SessionData

Cada sesión debe incluir estos campos obligatorios:

- `sessionId`: identificador único de la sesión o webinar.
- `accessCode`: código que permite al participante recuperar los datos de la sesión.
- `description`: descripción breve del webinar.
- `url`: URL pública para acceder al webinar.

No agregar campos obligatorios ni restricciones de negocio adicionales sin aprobación.

## 4. Autenticación, autorización y validaciones

Todas las solicitudes protegidas deben incluir el encabezado HTTP `api-key`.

Los alcances disponibles son:

- `standard`: puede recuperar una sesión mediante `accessToken`.
- `admin`: puede recuperar sesiones y realizar las operaciones administrativas autorizadas.

`GET /webinar/health` queda excluido de la autenticación.

La autenticación debe comprobar la validez de la API Key. La autorización debe comprobar que su alcance permita realizar la operación solicitada.

Una clave inexistente, inválida o con permisos insuficientes no debe autorizar la operación.

### Inicialización administrativa

Utilizar `ADMIN_API_KEY` como mecanismo de bootstrap para disponer de una clave administrativa inicial.

La inicialización debe ser segura, reproducible e idempotente: reiniciar la aplicación no debe crear duplicados ni alterar arbitrariamente las claves existentes.

La clave inicial debe permitir gestionar el sistema sin depender de `POST /webinar/apikeys` para crear al primer administrador.

No exponer la clave inicial en respuestas, logs ni mensajes de error.

### Validaciones y errores

Aplicar las validaciones correspondientes a cada funcionalidad, incluyendo:

- Presencia de los datos obligatorios.
- Validez de la API Key y permisos asociados.
- Existencia de los recursos cuando corresponda.
- Prevención de identificadores duplicados.
- Validación del formato de los datos según los requisitos aprobados.
- Manejo de errores de persistencia y ejecución.

Para los errores de la API REST, utilizar el formato:

`{ "error": "Descripción del error" }`

Los códigos HTTP y mensajes deben ser coherentes con el resultado de cada operación.

No inventar restricciones, reglas de negocio ni comportamientos adicionales. Si falta una definición imprescindible, consultar al responsable del proyecto.

## 5. Persistencia

Utilizar MongoDB local mediante Docker y configurar la conexión a través de `DB_URL`.

Persistir las sesiones y API Keys necesarias para el funcionamiento de la aplicación.

Los repositorios deben encapsular las operaciones necesarias para:

- Crear y recuperar sesiones.
- Listar sesiones.
- Eliminar sesiones.
- Registrar y consultar API Keys.
- Resolver la autenticación y los permisos asociados a las claves.

Gestionar correctamente los errores de conexión y persistencia sin exponer información sensible.

No reemplazar la persistencia por estructuras en memoria como solución final.

La entrega debe incluir una configuración reproducible para levantar MongoDB localmente mediante Docker Compose y conectar la aplicación a la base de datos.

## 6. Prueba automatizada obligatoria

Implementar una prueba de integración para verificar la recuperación exitosa de una sesión de webinar mediante `GET /webinar/sessions?accessToken=<string>`.

Utilizar Mocha y Supertest.

### Escenario: recuperación exitosa de una sesión

1. Preparar una sesión de prueba en la base de datos con los siguientes datos:
   - `sessionId`: `test-session-001`
   - `accessCode`: `test-access-001`
   - `description`: `Webinar de prueba`
   - `url`: `https://example.com/webinar`

2. Enviar una solicitud a `GET /webinar/sessions?accessToken=test-access-001`.

3. Incluir el encabezado `api-key` con una API Key válida de alcance `standard`.

4. Verificar que la respuesta tenga estado HTTP `200 OK`.

5. Verificar que el cuerpo de la respuesta contenga los datos esperados de la sesión, incluidos `sessionId`, `accessCode`, `description` y `url`.

La prueba debe utilizar un entorno controlado y no depender de datos preexistentes. Preparar y limpiar los datos de prueba cuando corresponda, evitando modificar datos reales del entorno de desarrollo.

La prueba debe verificar el comportamiento de la API a través de HTTP, sin reemplazar la solicitud por una llamada directa al servicio o repositorio.

La aplicación debe poder importarse sin iniciar obligatoriamente el servidor HTTP.

Esta prueba es obligatoria y no puede sustituirse por otra elegida por conveniencia. Se pueden agregar pruebas adicionales cuando sean necesarias, pero no son un requisito para esta entrega mínima.

## 7. Calidad del código

Utilizar ESLint para analizar el código y Prettier para mantener un formato consistente.

El código TypeScript debe utilizar tipos apropiados, evitar el uso indiscriminado de `any` y mantener responsabilidades claramente separadas.

Evitar duplicación innecesaria, lógica de negocio en las rutas y controladores excesivamente complejos.

No incorporar abstracciones o patrones únicamente por anticipación a necesidades futuras.

## 8. Documentación

Escribir un `README.md` breve que incluya exclusivamente:

- Configuración de `.env`.
- Cómo levantar MongoDB mediante Docker.
- Cómo instalar las dependencias y ejecutar la aplicación.
- Cómo ejecutar las pruebas automatizadas.
- Ejemplos de petición para los endpoints implementados, incluyendo el encabezado `api-key` cuando corresponda.

Los ejemplos deben distinguir los alcances `standard` y `admin`, y respetar los contratos implementados.

No incluir claves reales en el README.

Crear un `.gitignore` adaptado al proyecto, evitando versionar secretos, archivos `.env`, dependencias instaladas y artefactos generados que no deban formar parte del repositorio.

## 9. Entrega y verificación

La entrega debe incluir:

- API funcionando.
- MongoDB local mediante Docker.
- Conexión efectiva con la base de datos.
- Todos los endpoints especificados.
- Autenticación y autorización por API Key.
- Inicialización administrativa.
- La prueba de integración obligatoria definida en la sección 6.
- Configuración de ESLint y Prettier.
- README breve y `.gitignore`.

Antes de finalizar:

1. Verifica que las dependencias se instalen correctamente.
2. Comprueba que MongoDB pueda iniciarse y que la aplicación se conecte.
3. Ejecuta la prueba automatizada obligatoria.
4. Ejecuta los chequeos de calidad y formato disponibles.
5. Comprueba los endpoints implementados.
6. Informa los resultados reales de las verificaciones y las limitaciones pendientes.

No afirmes que una funcionalidad funciona, que una prueba pasó o que la base de datos está conectada si no lo verificaste.

Si una decisión bloquea la implementación, explica brevemente qué información falta y consulta al responsable del proyecto. No sustituyas los requisitos por supuestos propios.