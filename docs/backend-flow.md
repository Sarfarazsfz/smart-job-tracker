# Backend Flow

## Server Startup (`server.js`)

```
node server.js
   ↓
import config from src/config/index.js        (reads .env)
import setupPlugins from src/plugins/setup.js
import initRedis from src/services/cache/cache.service.js
import [jobRoutes, resumeRoutes, applicationRoutes, chatRoutes]
   ↓
Fastify({ logger: true })
   ↓
setupPlugins(fastify)
  ├── @fastify/cors  (origin = config.frontendUrl, credentials: true)
  └── @fastify/multipart (10MB limit)
   ↓
initRedis()
  ├── if UPSTASH_REDIS_REST_URL + TOKEN exist → connect Upstash Redis
  │     if ping fails → fall back to memoryStore
  └── else → use memoryStore (Map-based, process-local, volatile)
   ↓
fastify.register(jobRoutes,         prefix: '/api/jobs')
fastify.register(resumeRoutes,      prefix: '/api/resume')
fastify.register(applicationRoutes, prefix: '/api/applications')
fastify.register(chatRoutes,        prefix: '/api/chat')
   ↓
fastify.get('/api/health', ...)     (inline, no prefix)
   ↓
fastify.setErrorHandler(...)        (global error handler)
   ↓
fastify.listen({ port, host: '0.0.0.0' })
```

**Note**: `initAI()` is called via module-level side-effect in `ai.service.js` line 79, not explicitly from `server.js`.

## Route Registration Bug

**File**: `src/modules/jobs/jobs.routes.js`

```js
fastify.get('/',              controller.getJobs);
fastify.get('/:id',           controller.getJobById);   // registered FIRST
fastify.get('/best-matches',  controller.getBestMatches); // NEVER reached
fastify.post('/clear-cache',  controller.clearCache);
```

`/best-matches` is a static segment but `/:id` is registered before it.
Fastify matches `GET /best-matches` as `/:id` with `id = 'best-matches'`, calling `getJobById`.
`getJobById` looks in MOCK_JOBS, finds nothing (no job with id 'best-matches'), returns 404.
**Best Matches is silently broken.**

## `GET /api/jobs` Full Flow

```
1. requireAuth preHandler → request.userContext = query.userId || 'default'
2. jobs.controller.getJobs
   ├── parse query params: query, skills, datePosted, jobType, workMode, location, minScore, page, limit
   └── call service.getJobsFilteredAndPaginated(filters, userId, page, limit, minScore)

3. jobs.service.getJobsFilteredAndPaginated
   ├── fetchJobs({}) → get ALL jobs ignoring filters first
   ├── applyFilters(jobs, filters) → filter the full array in memory
   ├── getResume(userId) → check if user has a resume
   ├── if resume: scoreJobsInBatch(resume.text, jobs) → AI scoring
   ├── sort by matchScore descending
   ├── if minScore: filter out below threshold
   └── paginate(jobs, page, limit) → slice array

4. jobs.service.fetchJobs({})
   ├── cacheKey = 'all' (no filters passed)
   ├── repository.getCachedJobsData('all')
   │     → Redis/memory GET 'jobs:all'
   │     HIT → return cached array
   │     MISS:
   │       ├── fetchFromAdzuna({}) → if no credentials → return null
   │       ├── fetchFromJSearch({}) → if no RapidAPI key → return null
   │       └── MOCK_JOBS (15 static India tech jobs)
   │             → applyFilters(MOCK_JOBS, {})  (no-op, returns all 15)
   └── repository.cacheJobsData('all', jobs, 3600)  (1 hour TTL)
```

## Cache Keys

| Key Pattern | Purpose | TTL |
|---|---|---|
| `jobs:all` | All jobs (no filter query) | 3600s |
| `jobs:all:{JSON filters}` | Filtered job queries | 3600s |
| `resume:{userId}` | User resume data + text | None (no TTL!) |
| `applications:{userId}` | User applications array | None (no TTL!) |
| `matchscores:{userId}` | Cleared on resume upload (never written) | N/A |
