# Frontend Flow

## App Startup

```
main.jsx
   ├── Checks VITE_CLERK_PUBLISHABLE_KEY (throws if missing)
   └── renders <ClerkProvider><App /></ClerkProvider>

App.jsx mounts
   ├── useEffect → fetchJobs()   (no forceRefresh)
   └── useEffect → fetchApplications()
```

## fetchJobs(forceRefresh = false)

```
if !forceRefresh:
   ├── check localStorage['job_tracker_jobs'] + ['job_tracker_timestamp']
   └── if cache exists AND age < 1 hour → setAllJobs(cached), return early

else (forceRefresh OR cache expired):
   └── fetch GET /api/jobs (no query params — always fetches ALL jobs)
         → setAllJobs(data.jobs)
         → localStorage.set('job_tracker_jobs', jobs)
         → localStorage.set('job_tracker_timestamp', now)
```

**Important**: The frontend always fetches `GET /api/jobs` with NO query parameters.
All filtering and sorting happens entirely in the frontend `useMemo`.

## Client-Side Filtering and Sorting

```
allJobs (full array from API/localStorage)
   ↓
filteredAndSortedJobs = useMemo([allJobs, filters, hasResume])
   ├── Filter by: query, location, skills, datePosted, jobType, workMode, minScore
   ├── Rank each job:
   │   ├── rankGroup: 1 (both match) | 2 (location) | 3 (title) | 4 (no match)
   │   └── tieBreaker: recency + titleMatchLevel + matchScore + skillRatio
   └── Sort: ascending rankGroup, descending tieBreaker
   ↓
paginatedJobs = useMemo([filteredAndSortedJobs, currentPage])
   └── slice(start, end)  where end - start = JOBS_PER_PAGE (12)
   ↓
totalPages = ceil(filteredAndSortedJobs.length / 12)
```

**Conclusion: Pagination is fully client-side.** The API is always called with no page/limit params. The backend's `paginate()` utility is NOT called from this flow because `page` and `limit` are not passed.

## Refresh Jobs

```
onRefresh={() => fetchJobs(true)}
   ↓
fetchJobs(forceRefresh=true)
   ├── SKIPS localStorage check
   ├── Calls GET /api/jobs
   └── DOES NOT call POST /api/jobs/clear-cache
```

**Problem**: forceRefresh bypasses the frontend localStorage cache.
But if the BACKEND still has the result in its Redis/memory cache (1-hour TTL), Refresh Jobs returns the same stale array from the backend cache. No new live data is fetched from Adzuna/JSearch.

## Apply Flow

```
User clicks "Apply Now" / "View Listing" etc. on JobCard
   ↓
JobCard: onClick → e.stopPropagation(); onApply(job)
   ↓
App.jsx handleApply(job)
   ├── setPendingApplication({ ...job, clickedAt: now })
   ├── getJobAction(job) → { canOpen, label, icon }
   ├── if canOpen && job.applyUrl → window.open(job.applyUrl, '_blank')
   └── else if demo/no canOpen → setShowDemoMessage(true) → auto-dismiss 4s
   ↓
User returns from external site (tab focus / visibilitychange)
   ↓
useEffect([pendingApplication])
   ├── listens for visibilitychange
   └── if visible && pendingApplication → shows ApplicationPopup
   ↓
ApplicationPopup.jsx
   ├── Displays job.title, job.company from pendingApplication object
   └── Buttons: "Yes Applied" / "No Just Browsing" / "Applied Earlier"
   ↓
handleApplicationConfirm(confirmed, type)
   ├── if confirmed → POST /api/applications with pendingApplication.id/.title/.company
   └── setPendingApplication(null)
```

**Job identity is preserved** — the same object from `handleApply` flows to `setPendingApplication` to `ApplicationPopup`. No re-lookup by title. ✅
