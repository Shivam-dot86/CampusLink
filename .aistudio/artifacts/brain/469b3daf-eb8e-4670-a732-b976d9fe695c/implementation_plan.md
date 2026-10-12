# Implementation Plan - Vercel Production API Route & Serverless Fix

Fix the 404 errors on `/api/db/state` and `/api/users` in Vercel production deployment by isolating backend API routes, decoupling Vite development server imports, and standardizing Vercel path rewrites.

## Problem Diagnosis
1. **URL Path Mismatch on Rewrites**: Vercel's `vercel.json` rewrite (`/api/(.*)` -> `/api`) strips the `/api` prefix or passes subpaths like `/db/state` to the serverless function handler. Express routes explicitly bound to `/api/db/state` fail to match `/db/state` and return 404.
2. **Top-Level Dev Import Overhead**: `server.ts` imports `vite` at the top level, causing Vercel's Node bundler to bundle developer tools into the serverless function, leading to cold start crashes or missing dependency errors in production.
3. **Environment Variable Injection**: Vercel serverless functions require `MONGODB_URI`, `GEMINI_API_KEY`, and `JWT_SECRET` in Vercel Project Settings to maintain database state.

---

## User Review Required

> [!IMPORTANT]
> Make sure to add `MONGODB_URI`, `GEMINI_API_KEY`, and `JWT_SECRET` to your **Vercel Project Settings** (`Settings -> Environment Variables`) so your deployed app can connect to your live MongoDB Atlas cluster.

---

## Proposed Changes

### 1. Decouple Vite Dependencies & Normalize Express Routes (`/server.ts`)
- Change top-level `import { createServer as createViteServer } from 'vite'` to dynamic `await import('vite')` inside dev mode.
- Add an Express path normalization middleware that strips double `/api` or handles both `/api/xyz` and `/xyz` route requests seamlessly on Vercel.
- Register dual route handlers for all endpoints (e.g. `app.use(['/api/db', '/db'], dbRouter)` or matching both `/api/db/state` and `/db/state`).

### 2. Update Vercel Serverless Function Handler (`/api/index.ts`)
- Ensure `api/index.ts` safely initializes MongoDB Atlas connection on cold starts.
- Add catch-all error handling so non-JSON responses are prevented and standard JSON payloads are always returned.

### 3. Refine Vercel Rewrites (`/vercel.json`)
- Update `vercel.json` rewrites to pass path parameters directly to the serverless function handler.

---

## Verification Plan

### Automated Build Verification
1. Run `compile_applet` to ensure TypeScript compilation passes with zero errors.
2. Commit changes to Git (`git add . && git commit`) so they are ready to push to GitHub.

### Manual Verification
- After pushing to GitHub, test endpoints like `https://<your-vercel-app>.vercel.app/api/health` and `https://<your-vercel-app>.vercel.app/api/db/state` in your browser.
