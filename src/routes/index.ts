import { Router } from 'express';
import { SessionRepository } from '../repositories/session.repository';
import { ApiKeyRepository } from '../repositories/apiKey.repository';
import { SessionService } from '../services/session.service';
import { ApiKeyService } from '../services/apiKey.service';
import { SessionController } from '../controllers/session.controller';
import { ApiKeyController } from '../controllers/apiKey.controller';
import { createAuthMiddleware } from '../middlewares/auth.middleware';
import { createHealthRoutes } from './health.routes';
import { createSessionRoutes } from './session.routes';
import { createApiKeyRoutes } from './apiKey.routes';

export function createWebinarRouter(): Router {
  const router = Router();

  const sessionRepository = new SessionRepository();
  const apiKeyRepository = new ApiKeyRepository();

  const sessionService = new SessionService(sessionRepository);
  const apiKeyService = new ApiKeyService(apiKeyRepository);

  const sessionController = new SessionController(sessionService);
  const apiKeyController = new ApiKeyController(apiKeyService);

  const authMiddleware = createAuthMiddleware(apiKeyService);

  router.use(createHealthRoutes());
  router.use(createSessionRoutes(sessionController, authMiddleware));
  router.use(createApiKeyRoutes(apiKeyController, authMiddleware));

  return router;
}
