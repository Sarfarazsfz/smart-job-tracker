import { getAuth } from '@clerk/fastify';

/**
 * Middleware to ensure the request is fully authenticated via Clerk.
 * Rejects with 401 if not authenticated.
 */
export async function requireAuth(request, reply) {
    if (process.env.NODE_ENV === 'test' && request.headers['x-mock-userid']) {
        request.userContext = request.headers['x-mock-userid'];
        return;
    }

    const authData = getAuth(request);
    const { isAuthenticated, userId } = authData;
    
    if (!isAuthenticated || !userId) {
        console.log('[AUTH DEBUG] authorization header present:', !!request.headers.authorization);
        console.log('[AUTH DEBUG] bearer token present:', request.headers.authorization?.startsWith('Bearer ') || false);
        console.log('[AUTH DEBUG] CLERK_SECRET_KEY configured:', !!process.env.CLERK_SECRET_KEY);
        console.log('[AUTH DEBUG] CLERK_PUBLISHABLE_KEY configured:', !!process.env.CLERK_PUBLISHABLE_KEY);
        console.log('[AUTH DEBUG] getAuth result:', {
            ...authData,
            getToken: undefined // do not log token functions
        });
        return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    console.log('[AUTH DEBUG] authentication verification success');
    console.log('[AUTH DEBUG] authenticated userId:', userId);
    
    // Attach to request so controllers don't need to read query params directly
    request.userContext = userId;
}

/**
 * Middleware that extracts user context if present, but allows unauthenticated requests.
 * Used for public routes like the job feed.
 */
export async function optionalAuth(request, reply) {
    if (process.env.NODE_ENV === 'test' && request.headers['x-mock-userid']) {
        request.userContext = request.headers['x-mock-userid'];
        return;
    }

    const { userId } = getAuth(request);
    request.userContext = userId || null;
}
