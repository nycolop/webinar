import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apiKey.service';

export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  createApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createdKey = await this.apiKeyService.createApiKey(req.body);
      res.status(201).json(createdKey);
    } catch (err) {
      next(err);
    }
  };
}
