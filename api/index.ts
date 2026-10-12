import app from '../server';
import { initMongoDB } from '../src/db/mongodb';

let isMongoInitialized = false;

export default async function handler(req: any, res: any) {
  try {
    if (!isMongoInitialized) {
      isMongoInitialized = true;
      try {
        await initMongoDB();
      } catch (err: any) {
        console.warn('[Vercel Serverless] MongoDB init note:', err?.message || err);
      }
    }

    // Ensure req.url is properly formatted for Express matching
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel Serverless Handler Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error?.message || 'Internal Server Error in Vercel Serverless Function'
      });
    }
  }
}
