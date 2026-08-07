# Job Refresh Flow

## User-Triggered Refresh

```
JobFeed renders a Refresh button
   ↓
onClick → onRefresh prop → App.jsx fetchJobs(true)
```

## What fetchJobs(true) Does (Frontend)

```js
if (!forceRefresh) {
    // check localStorage — SKIPPED when forceRefresh=true
}
// Fetch from API
const res = await fetch(`${API_URL}/jobs`)  // no query params
const data = await res.json()
setAllJobs(data.jobs || [])
// Update localStorage
localStorage.setItem('job_tracker_jobs', JSON.stringify(jobs))
localStorage.setItem('job_tracker_timestamp', Date.now())
```

## What the Backend Does on GET /api/jobs

```
getCachedJobsData('all')
   ↓
Redis/memory GET 'jobs:all'
   HIT → return same cached jobs (within 1 hour TTL)
```

**The backend cache is NOT cleared by the Refresh action.**

## Fix Required

The Refresh flow should:
1. Call `POST /api/jobs/clear-cache` first
2. Then call `GET /api/jobs` to get fresh data

OR the backend should accept a `?refresh=true` query param that bypasses the backend cache.

## POST /api/jobs/clear-cache

```
controller.clearCache()
   ↓
service.clearCache()
   ↓
repository.clearJobsCacheData()
   ↓
r.keys('jobs:*')
   → matches: ['jobs:all', 'jobs:all:{...}', ...]
   ↓
r.del(key) for each key
```

This properly removes all job cache entries and forces fresh provider fetches on next GET.

## Resume Upload Refresh

After resume upload, the frontend correctly:
1. Removes localStorage cache (`localStorage.removeItem`)
2. Calls `fetchJobs(true)` to bypass localStorage and hit the API

But the API still serves from backend cache — the 1-hour Redis TTL means jobs are re-served from cache. Match scores ARE recalculated per-request on top of cached raw jobs.

This means match scores reflect the new resume, but the underlying job list is still from the old cache window.
