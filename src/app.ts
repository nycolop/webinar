import express, { Application, Request, Response, NextFunction } from 'express';
import { createWebinarRouter } from './routes';
import { errorHandler } from './middlewares/error.middleware';

export function createApp(): Application {
  const app: Application = express();

  // Parse JSON bodies with custom syntax error handler
  app.use(express.json());
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }
    next(err);
  });

  // Mount webinar routes
  app.use('/webinar', createWebinarRouter());

  // Error handling middleware
  app.use(errorHandler);

  return app;
}

export const app: Application = createApp();
