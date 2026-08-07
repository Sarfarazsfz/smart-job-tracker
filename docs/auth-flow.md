# Authentication and Authorization Flow

## Frontend Authentication (Clerk)

**File**: `frontend/src/main.jsx`
```jsx
<ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

Clerk wraps the entire app. If `VITE_CLERK_PUBLISHABLE_KEY` is missing, the app throws immediately at startup (hard fail, intentional).

**Components used in App.jsx**:
```jsx
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
```

- `<SignedIn>` → renders children only when the user is logged in
- `<SignedOut>` → renders children when the user is not logged in
- `<SignInButton mode="modal">` → opens Clerk's login modal

**Protected by SignedIn/SignedOut**:
- The Application Tracker tab (`activeTab === 'applications'`) shows the tracker when signed in, a sign-in prompt when signed out.

**NOT protected**:
- The job feed — fully accessible without login
- Resume upload — accessible without login
- AI sidebar — accessible without login

**UserButton**: Referenced in Header component (not verified in this read, but Clerk's UserButton is typically in the Header).

## Backend Authorization — INCOMPLETE

**File**: `src/middleware/auth.middleware.js`

```js
export async function requireAuth(request, reply) {
    // TODO: Integrate Clerk SDK here
    const userContext = request.query.userId || 'default';
    request.userContext = userContext;
}
```

**What this means**:
- The middleware does NOT verify any JWT or Clerk token
- It reads an optional `?userId=` query parameter
- If no userId is provided (which is always the case — no frontend code sends userId), it defaults to `'default'`
- All users share `userContext = 'default'`
- All resumes, applications, and data belong to the same `'default'` user

**HTTP requests from frontend**: None of them send an Authorization header or userId param:
```js
fetch(`${API_URL}/jobs`)
fetch(`${API_URL}/applications`)
fetch(`${API_URL}/resume`)
```

## Consequence

```
FRONTEND AUTHENTICATION: ✅ Clerk controls UI access
BACKEND AUTHORIZATION:   ❌ Not implemented

Any user who knows the API URL can:
- Read all applications (GET /api/applications)
- Read all resumes (GET /api/resume)
- Post applications (POST /api/applications)
- Delete any application (DELETE /api/applications/:id)
```

## What Full Implementation Would Require

1. Backend: Install `@clerk/clerk-sdk-node`
2. Backend: In `requireAuth`, verify the `Authorization: Bearer <clerk_jwt>` header
3. Backend: Extract the verified `userId` from the Clerk session
4. Frontend: Use Clerk's `useAuth()` hook to get the token
5. Frontend: Attach `Authorization: Bearer ${token}` header to all API requests
6. Backend: Scope all repository lookups by the verified userId
