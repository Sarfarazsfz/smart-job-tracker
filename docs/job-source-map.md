# Job Source Map

## Provider Priority Order (verified from jobs.service.js)

```
jobs.service.fetchJobs(filters)
   ↓
1. Redis/memory cache (key: jobs:all)
   HIT → return immediately
   ↓ MISS
2. Adzuna API (fetchFromAdzuna)
   → if ADZUNA_APP_ID + ADZUNA_APP_KEY missing → return null
   → if API error → return null
   ↓ null
3. JSearch / RapidAPI (fetchFromJSearch)
   → if RAPIDAPI_KEY missing → return null
   → if API error → return null
   ↓ null
4. MOCK_JOBS (src/data/mockJobs.js)
   → 15 hardcoded India tech jobs
   → Always succeeds
```

## Adzuna Provider (adzuna.service.js)

**Default search query when no user query**:
```js
searchQuery = 'software engineer developer full stack frontend backend react python java'
```
Note: "react" appears in the default query, creating a React bias even in the default feed.

**Default location**: `Bangalore` (when no filter provided)

**Returns per call**: Up to 50 jobs, sorted by date

**Normalization**:
- `id`: job.id or generated fallback
- `source`: `'adzuna'`
- `externalUrlType`: always `'aggregator'` (forced by `classifyJobUrl(url, 'adzuna')`)
- `applyUrl`: `job.redirect_url || '#'`

## JSearch Provider (jsearch.service.js)

**Default query**: `'software developer'` (no React bias, more neutral)

**Default location**: `India`

**Normalization**:
- `id`: `job.job_id`
- `source`: `'jsearch'`
- `externalUrlType`: `classifyJobUrl(job.job_apply_link, 'jsearch')` → typically `'unknown'` or `'direct'`
- `applyUrl`: `job.job_apply_link`

## Mock Jobs (src/data/mockJobs.js)

**15 hardcoded jobs** including:
- Senior React Developer (TechCorp India)
- Full Stack Engineer
- Frontend Developer (DesignStudio India)
- UX Designer
- Junior Python Developer
- DevOps Engineer
- Machine Learning Engineer
- React Native Developer
- Data Engineer
- Software Engineering Intern
- Senior Backend Developer - Java
- Part-time Web Developer
- Golang Developer
- Technical Lead - Frontend

**Why React/Frontend jobs dominate**: 6 of the 15 mock jobs are frontend/React-adjacent roles.

**All mock jobs set**:
```js
source: 'mock'
externalUrlType: 'demo'
applyUrl: null
```

## Current State Without Credentials

Without `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `RAPIDAPI_KEY` set in `.env`:

```
Both providers return null
→ Backend always serves MOCK_JOBS
→ Frontend always shows the same 15 cards
→ Refresh Jobs bypasses localStorage but backend returns same cache
→ Same React/Frontend cards appear every time
```

This is the root cause of repeated job titles.
