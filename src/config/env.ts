import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  dbUrl: string;
  adminApiKey: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3005', 10),
  dbUrl: process.env.DB_URL || 'mongodb://localhost:27017/webinar_db',
  adminApiKey: process.env.ADMIN_API_KEY || '',
};
