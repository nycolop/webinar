import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { AppError } from '../middlewares/error.middleware';

export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = req.query.accessToken;

      if (accessToken !== undefined) {
        // Individual session retrieval by accessCode (standard or admin)
        const session = await this.sessionService.getSessionByAccessCode(accessToken as string);
        res.status(200).json(session);
        return;
      }

      // Listing all sessions (admin only)
      if (req.apiKeyData?.scope !== 'admin') {
        throw new AppError(403, 'Insufficient permissions');
      }

      const sessions = await this.sessionService.getAllSessions();
      res.status(200).json(sessions);
    } catch (err) {
      next(err);
    }
  };

  createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.sessionService.createSession(req.body);
      res.status(201).json(session);
    } catch (err) {
      next(err);
    }
  };

  deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.sessionService.deleteSession(req.params.sessionId);
      res.status(200).json({ message: 'Session deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
