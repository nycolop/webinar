import { SessionData } from '../models/session.model';
import { SessionRepository } from '../repositories/session.repository';
import { AppError } from '../middlewares/error.middleware';

export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(data: Partial<SessionData>): Promise<SessionData> {
    if (!data.sessionId || typeof data.sessionId !== 'string' || !data.sessionId.trim()) {
      throw new AppError(400, 'sessionId is required and must be a non-empty string');
    }
    if (!data.accessCode || typeof data.accessCode !== 'string' || !data.accessCode.trim()) {
      throw new AppError(400, 'accessCode is required and must be a non-empty string');
    }
    if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
      throw new AppError(400, 'description is required and must be a non-empty string');
    }
    if (!data.url || typeof data.url !== 'string' || !data.url.trim()) {
      throw new AppError(400, 'url is required and must be a non-empty string');
    }

    const existingSession = await this.sessionRepository.findBySessionId(data.sessionId.trim());
    if (existingSession) {
      throw new AppError(409, `Session with sessionId '${data.sessionId.trim()}' already exists`);
    }

    const session: SessionData = {
      sessionId: data.sessionId.trim(),
      accessCode: data.accessCode.trim(),
      description: data.description.trim(),
      url: data.url.trim(),
    };

    return this.sessionRepository.create(session);
  }

  async getSessionByAccessCode(accessCode: string): Promise<SessionData> {
    if (!accessCode || typeof accessCode !== 'string' || !accessCode.trim()) {
      throw new AppError(400, 'accessToken is required and must be a non-empty string');
    }

    const session = await this.sessionRepository.findByAccessCode(accessCode.trim());
    if (!session) {
      throw new AppError(404, 'Session not found');
    }

    return session;
  }

  async getAllSessions(): Promise<SessionData[]> {
    return this.sessionRepository.findAll();
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
      throw new AppError(400, 'sessionId is required');
    }

    const deleted = await this.sessionRepository.deleteBySessionId(sessionId.trim());
    if (!deleted) {
      throw new AppError(404, 'Session not found');
    }
  }
}
