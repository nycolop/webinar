import { MongoClient, Db } from 'mongodb';
import { config } from './env';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(uri?: string): Promise<Db> {
  if (db && client) {
    return db;
  }

  const connectionUri = uri || config.dbUrl;
  client = new MongoClient(connectionUri);
  await client.connect();
  db = client.db();

  // Create unique indexes
  await db.collection('sessions').createIndex({ sessionId: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ accessCode: 1 });
  await db.collection('apikeys').createIndex({ apiKey: 1 }, { unique: true });

  return db;
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database is not initialized. Call connectDatabase first.');
  }
  return db;
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
