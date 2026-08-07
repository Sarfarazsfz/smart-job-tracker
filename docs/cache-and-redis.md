# Redis and Cache Flow

## Redis Initialization (`src/services/cache/cache.service.js`)

```
initRedis()
   ├── if UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN:
   │     new Redis({ url, token })
   │     await redis.ping()
   │     ✅ Connected to Upstash Redis
   │     (if ping fails → falls back to memoryStore)
   └── else:
         console.log('No Redis credentials, using in-memory store')
         redis = memoryStore
```

## In-Memory Fallback (memoryStore)

A `Map`-based object with the same interface as Upstash Redis:
- `get(key)`, `set(key, value, { ex })`, `del(key)`, `keys(pattern)`, `hset`, `hget`, `hgetall`, `hdel`
- The `ex` (expiry) option is implemented via `setTimeout(() => map.delete(key), ex * 1000)`
- **Limitation**: Process-local only. Lost on server restart. No persistence.

## What IS Cached in Redis

| Key Pattern | Content | TTL |
|---|---|---|
| `jobs:all` | Full array of 15 mock jobs (or Adzuna/JSearch results) | 3600s |
| `jobs:all:{JSON}` | Filtered job results (when `hasFilters` is true) | 3600s |
| `resume:{userId}` | Object: `{ filename, mimetype, text, uploadedAt }` | **No TTL** |
| `applications:{userId}` | Array of application objects | **No TTL** |

## What is NOT Cached

- **AI match scores** — recalculated on every request when a resume exists
- Per-user job scores — ephemeral, not stored
- The `matchscores:{userId}` key is `del()`-ed on resume upload but never written to

## Cache Hit Flow

```
GET /api/jobs
   ↓
fetchJobs({})
   ↓
getCachedJobsData('all')
   ↓
Redis GET 'jobs:all'
   ↓
HIT → JSON.parse(data) → return jobs[]
```

## Cache Miss Flow

```
Redis GET 'jobs:all' → null
   ↓
fetchFromAdzuna({})
   → null (no credentials)
   ↓
fetchFromJSearch({})
   → null (no credentials)
   ↓
MOCK_JOBS (15 static jobs)
   ↓
cacheJobsData('all', MOCK_JOBS, 3600)
   → Redis SET 'jobs:all' JSON.stringify(jobs) EX 3600
   ↓
return jobs[]
```

## Refresh Jobs Cache Behavior

```
User clicks Refresh
   ↓
Frontend: fetchJobs(forceRefresh=true)
   → skips localStorage cache
   → calls GET /api/jobs
   ↓
Backend: getCachedJobsData('all')
   → HIT (backend cache still valid for ~1 hour)
   → returns SAME mock array
```

**Problem**: Refresh only bypasses the frontend localStorage. The backend Redis/memory cache is untouched. Users see the same jobs even after "refreshing". To truly refresh, `POST /api/jobs/clear-cache` must be called first.

## Fix: Refresh Must Clear Backend Cache Too

The Refresh button should call `POST /api/jobs/clear-cache` then `GET /api/jobs` to guarantee fresh provider data.

## Double Cache Layer Summary

```
User opens app (no localStorage cache)
   ↓
Frontend: fetch /api/jobs
   ↓
Backend: miss → fetch from providers → cache in Redis 1hr → return
Frontend: store in localStorage 1hr
   ↓ (within 1 hour)
Page reload
   ↓
Frontend: serves from localStorage, NEVER calls API
   ↓ (1 hour later)
Frontend cache expires → calls API
   ↓
Backend: Redis still valid → returns same cached data
   ↓ (another 1 hour)
Backend cache expires → fetches fresh from providers
```

Total staleness window can be up to 2 hours.
