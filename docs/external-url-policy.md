# External URL Policy

## Classification Helper (`src/utils/url.helper.js`)

`classifyJobUrl(url, source)` classifies every job's external URL into one of:

| Type | Meaning |
|---|---|
| `direct` | Canonical ATS job page — Greenhouse, Lever, Workday, Ashby, BambooHR |
| `aggregator` | Middleman redirect — Adzuna, Indeed, Glassdoor, ZipRecruiter, Jooble |
| `search` | Generic search results — LinkedIn `/jobs/search`, Naukri `/jobs?q=` |
| `demo` | Mock/sample job, no real URL |
| `unknown` | Valid URL but unrecognized domain |

## Defensive Handling

The helper safely returns `'unknown'` for:
- `null`
- `undefined`
- Empty string `''`
- Malformed URLs (caught with try/catch around `new URL()`)

## LinkedIn Special Case

```
/jobs/view/12345  → 'direct'   (specific job page)
/jobs/search      → 'search'   (search results page)
```

A LinkedIn view URL is NOT classified as a search URL.

## Provider Defaults

| Provider | Default type | Reason |
|---|---|---|
| Adzuna | `aggregator` | `redirect_url` always goes through Adzuna's own redirector |
| JSearch | `classifyJobUrl(link)` | Links vary: Greenhouse = direct, LinkedIn search = search |
| Mock | `demo` | `source === 'mock'` check in helper |
| Unknown URL | `unknown` | No matching pattern |

## Frontend CTA Labels (`frontend/src/utils/jobActions.js`)

```js
getJobAction(job) → { label, canOpen, icon }

'direct'     → "Apply Now",      canOpen: true,  icon: ExternalLink
'aggregator' → "View Listing",   canOpen: true,  icon: List
'search'     → "Search Similar", canOpen: true,  icon: Search
'demo'       → "Demo Job",       canOpen: false, icon: Play
'unknown'    → "View Source",    canOpen: Boolean(job.applyUrl), icon: HelpCircle
```

## What Used to Go Wrong

Before the URL classification system was added:
- All jobs had `externalUrlType` undefined
- The frontend always showed "Apply Now" regardless of URL type
- A LinkedIn `/jobs/search?q=Senior+React+Developer` URL was opened as if it were a direct job
- LinkedIn re-ran the search and displayed whatever was ranked #1 that day — often a completely different role

## Current Remaining Risk

- Adzuna URLs are always forced to `'aggregator'`, which is correct for Adzuna's redirect_url system
- JSearch links that are `'unknown'` still open (`canOpen: Boolean(applyUrl)`) — user sees "View Source" label, which is honest
- Mock jobs with `applyUrl: null` correctly show "Demo Job" and display a toast instead of opening a tab
