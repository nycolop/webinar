import { Request, Response, NextFunction } from 'express';
import { ApiKeyData, ApiKeyScope } from '../models/apiKey.model';
import { ApiKeyService } from '../services/apiKey.service';
import { AppError } from './error.middleware';

declare global {
  namespace Express {
    interface Request {
      apiKeyData?: ApiKeyData;
    }
  }
}

export function createAuthMiddleware(apiKeyService: ApiKeyService) {
  return {
    authenticate: async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const apiKey = req.header('api-key');
        if (!apiKey) {
          throw new AppError(401, 'API key is required');
        }

        const keyData = await apiKeyService.validateApiKey(apiKey);
        if (!keyData) {
          throw new AppError(401, 'Invalid API key');
        }

        req.apiKeyData = keyData;
        next();
      } catch (err) {
        next(err);
      }
    },

    authorize: (allowedScopes: ApiKeyScope[]) => {
      return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.apiKeyData) {
          return next(new AppError(401, 'Authentication required'));
        }

        if (!allowedScopes.includes(req.apiKeyData.scope)) {
          return next(new AppError(403, 'Insufficient permissions'));
        }

        next();
      };
    },
  };
}
