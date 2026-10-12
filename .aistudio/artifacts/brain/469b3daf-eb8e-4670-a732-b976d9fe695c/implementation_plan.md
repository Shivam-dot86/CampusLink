# Automatic MongoDB Atlas Auto-Connect & Background Resilient Sync

A comprehensive architectural blueprint to resolve automatic MongoDB Atlas database connectivity on app startup, ensure persistent credential storage in both `.env` and `data/mongodb_config.json`, and provide smooth background fallbacks to local persistent storage when remote MongoDB clusters are unreachable or pending configuration.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions have been confirmed through user clarification:

- **Confirmed Decision 1**: **Auto-Connect on Startup** — The server will automatically initialize and attempt MongoDB Atlas connection as soon as the Node/Express backend boots up.
- **Confirmed Decision 2**: **Dual URI Persistence** — MONGODB_URI strings will be permanently saved to both `.env` and `./data/mongodb_config.json` so connections persist across app restarts and dev server reboots.
- **Confirmed Decision 3**: **Resilient Local Fallback** — If MongoDB Atlas is unreachable or pending a connection string, the app automatically falls back to local JSON persistence (`data/db.json`), retrying the MongoDB Atlas connection in the background without causing white screens or app crashes.

---

## 1. Overview & Core Concept

### What It Does
When the application starts up, `server.ts` automatically triggers `initMongoDB()`, checking for stored connection credentials in `process.env.MONGODB_URI` and `./data/mongodb_config.json`. If a connection string exists, Mongoose opens an active connection to MongoDB Atlas, loads schemas (`User`, `Student`, `Drive`, `Offer`, `Notification`, etc.), and populates initial user accounts into the `users` collection. If the connection fails or is not yet configured, the server switches smoothly to local store mode while maintaining a background retry loop.

### Target Persona
- **TPO Administrators & Recruiter Leads**: Require real-time user authentication and data persistence across student profiles and placement drives without manual database re-connection triggers on every session.
- **Developers & System Admins**: Need clear visual diagnostics, connection status endpoints, and automated recovery if network routes or database clusters fluctuate.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Server Boot & Auto-Connect**: On application launch, backend auto-reads MONGODB_URI from `.env` or `data/mongodb_config.json` and connects to Atlas.
2. **Real-time Status Monitoring**: The database configuration modal in the top bar displays real-time connection telemetry (`Connected`, `Atlas Cluster Host`, `Active Collections`, `Local Fallback`).
3. **Dynamic Re-Configuration**: Users can paste or test new MongoDB Atlas URIs via the Database Settings modal. Saving updates `.env` and `data/mongodb_config.json` instantly and auto-reconnects without requiring a server restart.
4. **Resilient Data Ops**: User registration and logins automatically read and write to the active `users` collection in MongoDB Atlas when connected, or mirror into local store seamlessly.

### Visual Identity & Theme
- **Status Indicator**: Quiet badge in the database modal with standard colors:
  - Green (`#10B981`): Connected to MongoDB Atlas.
  - Amber (`#F59E0B`): Connecting / Retrying in background.
  - Neutral Gray (`#64748B`): Running on Local Store (Ready for URI).
- **Typography**: Mono fonts (`tabular-nums font-mono`) for connection strings, cluster hostnames, and collection document counts.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Automatic Boot Initialization
- **Chosen Approach**: Trigger `initMongoDB()` inside `server.ts` during server startup before listening on port 3000.
- **Why**: Eliminates manual user steps to connect to the database. Users don't need to manually click "Connect" in the UI for data to start saving to MongoDB.
- **Alternatives Considered**: Lazy-loading on first database request (can lead to initial query latency and race conditions during user signup).

### Decision 2: Dual Credential Persistence
- **Chosen Approach**: Write `MONGODB_URI` to both `.env` (environment standard) and `data/mongodb_config.json` (filesystem fallback).
- **Why**: Ensures that environment configuration survives Vite/tsx dev server restarts and local environment reloads without missing connection variables.

### Decision 3: Background Fallback & Retry
- **Chosen Approach**: Use a non-blocking asynchronous connection pattern with local storage mirroring and background retry timers.
- **Why**: Prevents app crashes, white screens, or blocked UI startup if the user's MongoDB Atlas cluster IP whitelist or credentials are invalid.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Frontend UI                               │
│  (TopBar -> DatabaseConfigModal -> Live Status / Connect Form)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Express Server (server.ts)                       │
│  - Boot Hook: Auto-invokes initMongoDB()                               │
│  - /api/health & /api/mongodb/status (Telemetry)                       │
│  - /api/mongodb/connect (Save URI to .env & mongodb_config.json)      │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
            ┌───────┴────────┐              ┌────────┴────────┐
            │ MongoDB Atlas  │              │ Local Storage   │
            │ (Mongoose ODM) │              │ (data/db.json)  │
            └────────────────┘              └─────────────────┘
```

### Component & Data Mapping
1. **`src/db/mongodb.ts`**:
   - `initMongoDB()`: Auto-reads saved URI, establishes Mongoose connection, seeds default data if collections are empty, and handles error states.
   - `saveMongoUri(uri)`: Atomically updates `.env` and `./data/mongodb_config.json`.
   - `getMongoStatus()`: Returns cluster host, active database name, connection state, and loaded models.
2. **`server.ts`**:
   - Invokes `initMongoDB()` on server start.
   - Syncs signup/auth endpoints (`/api/auth/register`, `/api/auth/login`) directly with `UserModel` in MongoDB Atlas when connected.
3. **`src/components/DatabaseConfigModal.tsx`**:
   - Provides status feedback, connection diagnostic output, and one-click test/save URI controls.
