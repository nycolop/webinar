import { app } from './app';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { ApiKeyRepository } from './repositories/apiKey.repository';

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    console.log('Connected to MongoDB successfully');

    if (config.adminApiKey) {
      const apiKeyRepository = new ApiKeyRepository();
      await apiKeyRepository.ensureAdminKey(config.adminApiKey);
      console.log('Initial admin API key verified');
    }

    const server = app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });

    const shutdown = async (): Promise<void> => {
      console.log('Shutting down server...');
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
