# Apply Flow

## Complete End-to-End Flow

```
1. User clicks job card
   ├── JobCard article onClick → onJobClick(job)  [opens JobDetailModal]
   └── JobCard button onClick → e.stopPropagation(); onApply(job)  [triggers apply]

2. App.jsx handleApply(job)
   ├── setPendingApplication({ ...job, clickedAt: ISO string })
   ├── getJobAction(job) → { label, canOpen, icon }
   ├── canOpen && job.applyUrl  → window.open(job.applyUrl, '_blank')
   └── !canOpen (demo / null)  → setShowDemoMessage(true), 4s auto-dismiss

3. User is now on external site
   (app cannot detect success/failure)

4. User returns to the tab (or opens a new tab)
   → document.addEventListener('visibilitychange')
   → if visible && pendingApplication exists
   → ApplicationPopup appears automatically

5. ApplicationPopup displays:
   ├── job.companyLogo  (from pendingApplication)
   ├── job.title        (from pendingApplication)
   ├── job.company      (from pendingApplication)
   └── Three buttons: "Yes Applied" / "No Just Browsing" / "Applied Earlier"

6. User confirms
   → handleApplicationConfirm(confirmed=true, type='applied')
   → POST /api/applications
     body: {
       jobId:    pendingApplication.id,
       jobTitle: pendingApplication.title,
       company:  pendingApplication.company,
       applyUrl: pendingApplication.applyUrl,
       status:   'applied'
     }
   → fetchApplications() to refresh tracker
   → setPendingApplication(null)

7. Application Tracker
   → GET /api/applications
   → applications.service.listApplications(userId)
   → repository.getApplications(userId) from Redis/memory key applications:default
```

## Job Identity Verification

The exact job object clicked is preserved through the entire flow:

- `handleApply(job)` receives the job object from the card
- `setPendingApplication({ ...job, ... })` spreads the full object
- `ApplicationPopup` receives `job={pendingApplication}` — same object
- `handleApplicationConfirm` reads `pendingApplication.id`, `.title`, `.company` — never re-fetches

✅ Job identity is correctly preserved. No re-lookup by title.

## Why "Did you apply?" Instead of Assuming Success

The application cannot detect whether the user completed the external form:
- External sites are opened in a new tab (window.open)
- The app loses control as soon as the tab opens
- JavaScript cannot observe another tab's navigation
- The user might abandon, the site might error, or the user might apply later

Therefore, the app asks the user explicitly on tab return, instead of optimistically recording a "success" that may not have happened.

## Application Tracker Storage

Applications are stored in Redis with key `applications:{userId}`.
- If Redis is unavailable, stored in the in-memory Map (lost on restart).
- If userId = 'default' (no real auth), ALL users share the same application list.
