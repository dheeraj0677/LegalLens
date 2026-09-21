import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root or current directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  clientUrl: string;
  openRouterApiKey: string | undefined;
  openRouterModel: string;
  maxDocumentLength: number;
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  // Default to fast, reliable model with huge context window for legal texts
  openRouterModel: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
  // 100,000 characters limit as specified in design requirements
  maxDocumentLength: 100000,
};
