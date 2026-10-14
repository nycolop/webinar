import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { createAuthMiddleware } from '../middlewares/auth.middleware';

export function createSessionRoutes(
  sessionController: SessionController,
  authMiddleware: ReturnType<typeof createAuthMiddleware>,
): Router {
  const router = Router();

  // GET /sessions (retrieval with accessToken query for standard/admin, or full list for admin)
  router.get('/sessions', authMiddleware.authenticate, sessionController.getSessions);

  // POST /sessions (admin only)
  router.post(
    '/sessions',
    authMiddleware.authenticate,
    authMiddleware.authorize(['admin']),
    sessionController.createSession,
  );

  // DELETE /sessions/:sessionId (admin only)
  router.delete(
    '/sessions/:sessionId',
    authMiddleware.authenticate,
    authMiddleware.authorize(['admin']),
    sessionController.deleteSession,
  );

  return router;
}
