import app from '../server';
import { initMongoDB } from '../src/db/mongodb';

let isMongoInitialized = false;

export default async function handler(req: any, res: any) {
  if (!isMongoInitialized) {
    isMongoInitialized = true;
    try {
      await initMongoDB();
    } catch (err: any) {
      console.warn('[Vercel Serverless] MongoDB init note:', err?.message || err);
    }
  }

  return app(req, res);
}
