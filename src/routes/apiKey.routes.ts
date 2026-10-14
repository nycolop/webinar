import { Router } from 'express';
import { ApiKeyController } from '../controllers/apiKey.controller';
import { createAuthMiddleware } from '../middlewares/auth.middleware';

export function createApiKeyRoutes(
  apiKeyController: ApiKeyController,
  authMiddleware: ReturnType<typeof createAuthMiddleware>,
): Router {
  const router = Router();

  // POST /apikeys (admin only)
  router.post(
    '/apikeys',
    authMiddleware.authenticate,
    authMiddleware.authorize(['admin']),
    apiKeyController.createApiKey,
  );

  return router;
}
