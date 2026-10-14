import { Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { SessionData } from '../models/session.model';

export class SessionRepository {
  private get collection(): Collection<SessionData> {
    return getDatabase().collection<SessionData>('sessions');
  }

  async create(session: SessionData): Promise<SessionData> {
    await this.collection.insertOne({ ...session });
    return session;
  }

  async findBySessionId(sessionId: string): Promise<SessionData | null> {
    return this.collection.findOne({ sessionId }, { projection: { _id: 0 } });
  }

  async findByAccessCode(accessCode: string): Promise<SessionData | null> {
    return this.collection.findOne({ accessCode }, { projection: { _id: 0 } });
  }

  async findAll(): Promise<SessionData[]> {
    return this.collection.find({}, { projection: { _id: 0 } }).toArray();
  }

  async deleteBySessionId(sessionId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ sessionId });
    return result.deletedCount > 0;
  }
}
