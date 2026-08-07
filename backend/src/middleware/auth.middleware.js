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

    const { isAuthenticated, userId } = getAuth(request);
    
    if (!isAuthenticated || !userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
    }
    
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
