import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app';
import { connectDatabase, disconnectDatabase, getDatabase } from '../src/config/database';
import { SessionData } from '../src/models/session.model';
import { ApiKeyData } from '../src/models/apiKey.model';

describe('Webinar API Integration Tests', () => {
  const standardApiKey = 'test-standard-key-001';
  const adminApiKey = 'test-admin-key-001';

  before(async () => {
    await connectDatabase();
  });

  after(async () => {
    // Clean test data
    const db = getDatabase();
    await db.collection('sessions').deleteMany({
      sessionId: { $regex: '^test-' },
    });
    await db.collection('apikeys').deleteMany({
      apiKey: { $regex: '^test-' },
    });
    await disconnectDatabase();
  });

  beforeEach(async () => {
    const db = getDatabase();
    // Clean test records before each test
    await db.collection('sessions').deleteMany({
      sessionId: { $regex: '^test-' },
    });
    await db.collection('apikeys').deleteMany({
      apiKey: { $regex: '^test-' },
    });

    // Seed test API keys
    const apikeysCollection = db.collection<ApiKeyData>('apikeys');
    await apikeysCollection.insertOne({ apiKey: standardApiKey, scope: 'standard' });
    await apikeysCollection.insertOne({ apiKey: adminApiKey, scope: 'admin' });
  });

  describe('6. Prueba automatizada obligatoria: Recuperación exitosa de una sesión', () => {
    it('debe recuperar exitosamente una sesión mediante GET /webinar/sessions?accessToken=<string> con API Key standard', async () => {
      // 1. Preparar una sesión de prueba en la base de datos
      const db = getDatabase();
      const sessionsCollection = db.collection<SessionData>('sessions');
      const testSession: SessionData = {
        sessionId: 'test-session-001',
        accessCode: 'test-access-001',
        description: 'Webinar de prueba',
        url: 'https://example.com/webinar',
      };
      await sessionsCollection.insertOne(testSession);

      // 2. Enviar una solicitud a GET /webinar/sessions?accessToken=test-access-001
      // 3. Incluir el encabezado api-key con una API Key válida de alcance standard
      const response = await request(app)
        .get('/webinar/sessions?accessToken=test-access-001')
        .set('api-key', standardApiKey);

      // 4. Verificar que la respuesta tenga estado HTTP 200 OK
      assert.strictEqual(response.status, 200);

      // 5. Verificar que el cuerpo de la respuesta contenga los datos esperados de la sesión
      assert.strictEqual(response.body.sessionId, 'test-session-001');
      assert.strictEqual(response.body.accessCode, 'test-access-001');
      assert.strictEqual(response.body.description, 'Webinar de prueba');
      assert.strictEqual(response.body.url, 'https://example.com/webinar');
    });
  });

  describe('GET /webinar/health', () => {
    it('debe responder 200 OK sin requerir autenticación', async () => {
      const response = await request(app).get('/webinar/health');
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.status, 'ok');
    });
  });

  describe('Autenticación y Autorización', () => {
    it('debe responder 401 si falta el encabezado api-key en endpoint protegido', async () => {
      const response = await request(app).get('/webinar/sessions?accessToken=test-access-001');
      assert.strictEqual(response.status, 401);
      assert.ok(response.body.error);
    });

    it('debe responder 401 si la api-key es inválida', async () => {
      const response = await request(app)
        .get('/webinar/sessions?accessToken=test-access-001')
        .set('api-key', 'non-existent-key');
      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, 'Invalid API key');
    });

    it('debe responder 403 si un usuario con alcance standard intenta listar todas las sesiones', async () => {
      const response = await request(app).get('/webinar/sessions').set('api-key', standardApiKey);
      assert.strictEqual(response.status, 403);
      assert.strictEqual(response.body.error, 'Insufficient permissions');
    });
  });

  describe('GET /webinar/sessions (Listado)', () => {
    it('debe responder 200 con la colección de sesiones para usuario con alcance admin', async () => {
      const db = getDatabase();
      const sessionsCollection = db.collection<SessionData>('sessions');
      await sessionsCollection.insertMany([
        {
          sessionId: 'test-session-001',
          accessCode: 'test-access-001',
          description: 'Webinar 1',
          url: 'https://example.com/1',
        },
        {
          sessionId: 'test-session-002',
          accessCode: 'test-access-002',
          description: 'Webinar 2',
          url: 'https://example.com/2',
        },
      ]);

      const response = await request(app).get('/webinar/sessions').set('api-key', adminApiKey);
      assert.strictEqual(response.status, 200);
      assert.ok(Array.isArray(response.body));
      assert.strictEqual(response.body.length, 2);
    });
  });

  describe('POST /webinar/sessions', () => {
    it('debe crear una nueva sesión para usuario admin', async () => {
      const newSession = {
        sessionId: 'test-session-post-001',
        accessCode: 'test-access-post-001',
        description: 'Nueva sesión de prueba',
        url: 'https://example.com/new',
      };

      const response = await request(app)
        .post('/webinar/sessions')
        .set('api-key', adminApiKey)
        .send(newSession);

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.sessionId, newSession.sessionId);
      assert.strictEqual(response.body.accessCode, newSession.accessCode);

      // Verificar en base de datos
      const db = getDatabase();
      const found = await db.collection('sessions').findOne({ sessionId: newSession.sessionId });
      assert.ok(found);
    });

    it('debe responder 409 si se intenta crear una sesión con sessionId duplicado', async () => {
      const session = {
        sessionId: 'test-session-duplicate',
        accessCode: 'test-access-dup-1',
        description: 'Sesión original',
        url: 'https://example.com/dup1',
      };

      await request(app).post('/webinar/sessions').set('api-key', adminApiKey).send(session);

      const duplicateResponse = await request(app)
        .post('/webinar/sessions')
        .set('api-key', adminApiKey)
        .send({
          ...session,
          accessCode: 'test-access-dup-2',
        });

      assert.strictEqual(duplicateResponse.status, 409);
      assert.ok(duplicateResponse.body.error);
    });

    it('debe responder 400 si faltan campos obligatorios', async () => {
      const response = await request(app)
        .post('/webinar/sessions')
        .set('api-key', adminApiKey)
        .send({ sessionId: 'test-session-incomplete' });

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
    });
  });

  describe('DELETE /webinar/sessions/:sessionId', () => {
    it('debe eliminar la sesión existente para usuario admin', async () => {
      const db = getDatabase();
      await db.collection<SessionData>('sessions').insertOne({
        sessionId: 'test-session-delete',
        accessCode: 'test-access-delete',
        description: 'Para borrar',
        url: 'https://example.com/delete',
      });

      const response = await request(app)
        .delete('/webinar/sessions/test-session-delete')
        .set('api-key', adminApiKey);

      assert.strictEqual(response.status, 200);

      const found = await db.collection('sessions').findOne({ sessionId: 'test-session-delete' });
      assert.strictEqual(found, null);
    });

    it('debe responder 404 si la sesión a eliminar no existe', async () => {
      const response = await request(app)
        .delete('/webinar/sessions/non-existent-session')
        .set('api-key', adminApiKey);

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.error, 'Session not found');
    });
  });

  describe('POST /webinar/apikeys', () => {
    it('debe registrar una nueva API Key para usuario admin', async () => {
      const newKeyData = {
        apiKey: 'test-new-client-key',
        scope: 'standard',
      };

      const response = await request(app)
        .post('/webinar/apikeys')
        .set('api-key', adminApiKey)
        .send(newKeyData);

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.apiKey, newKeyData.apiKey);
      assert.strictEqual(response.body.scope, newKeyData.scope);

      // Verificar que la nueva key puede autenticarse
      const authTest = await request(app)
        .get('/webinar/sessions?accessToken=non-existent')
        .set('api-key', newKeyData.apiKey);
      assert.strictEqual(authTest.status, 404); // Pasó la autenticación, falló porque la sesión no existe
    });

    it('debe responder 400 si el scope no es válido', async () => {
      const response = await request(app)
        .post('/webinar/apikeys')
        .set('api-key', adminApiKey)
        .send({
          apiKey: 'test-invalid-scope-key',
          scope: 'superadmin',
        });

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error);
    });

    it('debe responder 403 si un usuario standard intenta crear una API Key', async () => {
      const response = await request(app)
        .post('/webinar/apikeys')
        .set('api-key', standardApiKey)
        .send({
          apiKey: 'test-unauthorized-key',
          scope: 'standard',
        });

      assert.strictEqual(response.status, 403);
      assert.strictEqual(response.body.error, 'Insufficient permissions');
    });
  });
});
