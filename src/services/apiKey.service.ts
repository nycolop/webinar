import { ApiKeyData, ApiKeyScope } from '../models/apiKey.model';
import { ApiKeyRepository } from '../repositories/apiKey.repository';
import { AppError } from '../middlewares/error.middleware';

export class ApiKeyService {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async createApiKey(data: Partial<ApiKeyData>): Promise<ApiKeyData> {
    if (!data.apiKey || typeof data.apiKey !== 'string' || !data.apiKey.trim()) {
      throw new AppError(400, 'apiKey is required and must be a non-empty string');
    }

    const validScopes: ApiKeyScope[] = ['standard', 'admin'];
    if (!data.scope || !validScopes.includes(data.scope as ApiKeyScope)) {
      throw new AppError(400, "scope is required and must be either 'standard' or 'admin'");
    }

    const trimmedKey = data.apiKey.trim();
    const existing = await this.apiKeyRepository.findByKey(trimmedKey);
    if (existing) {
      throw new AppError(409, 'API key already exists');
    }

    const newKey: ApiKeyData = {
      apiKey: trimmedKey,
      scope: data.scope as ApiKeyScope,
    };

    return this.apiKeyRepository.create(newKey);
  }

  async validateApiKey(apiKey: string): Promise<ApiKeyData | null> {
    if (!apiKey || typeof apiKey !== 'string') {
      return null;
    }
    return this.apiKeyRepository.findByKey(apiKey.trim());
  }

  async bootstrapAdminKey(adminApiKey: string): Promise<void> {
    if (adminApiKey && adminApiKey.trim()) {
      await this.apiKeyRepository.ensureAdminKey(adminApiKey.trim());
    }
  }
}
