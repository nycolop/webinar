import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export function createHealthRoutes(): Router {
  const router = Router();
  const controller = new HealthController();

  router.get('/health', (req, res) => controller.getHealth(req, res));

  return router;
}
