import { Collection } from 'mongodb';
import { getDatabase } from '../config/database';
import { ApiKeyData } from '../models/apiKey.model';

export class ApiKeyRepository {
  private get collection(): Collection<ApiKeyData> {
    return getDatabase().collection<ApiKeyData>('apikeys');
  }

  async findByKey(apiKey: string): Promise<ApiKeyData | null> {
    return this.collection.findOne({ apiKey }, { projection: { _id: 0 } });
  }

  async create(apiKeyData: ApiKeyData): Promise<ApiKeyData> {
    await this.collection.insertOne({ ...apiKeyData });
    return apiKeyData;
  }

  async ensureAdminKey(apiKey: string): Promise<void> {
    if (!apiKey) return;
    const existing = await this.findByKey(apiKey);
    if (!existing) {
      await this.collection.insertOne({
        apiKey,
        scope: 'admin',
      });
    }
  }
}
