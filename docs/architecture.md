# JobMatch AI — Architecture Overview

> Source of truth: the code. Not the README.

## High-Level Stack

| Layer | Technology | Host |
|---|---|---|
| Frontend | React 18 + Vite + Vanilla CSS + Tailwind | Vercel |
| Backend | Node.js + Fastify (ESM) | Render |
| Cache | Upstash Redis (REST) / In-memory fallback | Upstash |
| AI | Google Gemini 1.5 Flash / OpenAI GPT-3.5 / Rule-based | External |
| Job Data | Adzuna API / JSearch (RapidAPI) / Mock | External |
| Auth | Clerk (frontend only, backend not verified) | Clerk.com |

## Backend Directory Structure

```
backend/
├── server.js                   # Entry point
└── src/
    ├── config/index.js         # Centralized env config
    ├── plugins/setup.js        # CORS + multipart registration
    ├── middleware/
    │   └── auth.middleware.js  # requireAuth stub (mocked, not verified)
    ├── modules/                # Feature modules
    │   ├── jobs/               # Jobs discovery + matching
    │   ├── resume/             # Resume upload + parsing
    │   ├── applications/       # Application tracking
    │   └── chat/               # AI chat assistant
    ├── services/               # Cross-cutting services
    │   ├── ai/ai.service.js    # Gemini/OpenAI/fallback scoring
    │   ├── cache/cache.service.js # Redis + in-memory fallback
    │   └── jobs/
    │       ├── adzuna.service.js  # Adzuna API client
    │       └── jsearch.service.js # JSearch/RapidAPI client
    ├── data/mockJobs.js        # Fallback static job array (15 jobs)
    └── utils/
        ├── pagination.js       # Array slicing for pagination
        └── url.helper.js       # classifyJobUrl() helper
```

## Request Flow Summary

```
Client Request
   ↓
Fastify (server.js)
   ↓ preHandler hook
requireAuth (mocked, sets request.userContext = 'default')
   ↓
Controller (thin, parses HTTP request)
   ↓
Service (business logic)
   ↓
Repository (data storage via Redis or memory)
   ↓
External Provider (Adzuna / JSearch / Mock)
```

## Current Problems Found (Phase 1)

1. **Repeated React/Frontend jobs**: All 15 mock jobs are India-specific tech roles with React bias. Because Adzuna and JSearch credentials are empty in .env.example, the server ALWAYS falls back to mockJobs.js. The same 15 cards always appear.

2. **CRITICAL route ordering bug**: In `jobs.routes.js`, `GET /:id` is registered BEFORE `GET /best-matches`. Fastify captures `/best-matches` as a dynamic `:id` parameter, calling `getJobById('best-matches')` instead of `getBestMatches()`. The Best Matches feature is silently broken.

3. **`getSingleJob` only searches MOCK_JOBS**: Even when live data is active, `GET /api/jobs/:id` only looks in the static mock array. It can never return a live job.

4. **Double cache layer**: Frontend caches in localStorage (1-hour TTL). Backend caches in Redis/memory (1-hour TTL). Refresh Jobs clears localStorage and re-fetches from the API, but the backend may still serve from its own stale cache unless `POST /api/jobs/clear-cache` is also called. The Refresh button does NOT call clear-cache.

5. **AI not initialized at startup**: `initAI()` is called inside `ai.service.js` at module load (line 79), not in `server.js`. This works but is an implicit side-effect, not an explicit startup step.

6. **Backend auth is a stub**: `requireAuth` uses `request.query.userId || 'default'` — no JWT verification. All users share the same `'default'` user context.

7. **Applications and resumes are in Redis/in-memory without TTL**: No TTL is set on `resume:userId` or `applications:userId` keys, meaning they persist until Redis evicts or server restarts (for in-memory).
