import { getAuth } from '@clerk/fastify';

/**
 * Middleware to ensure the request is authenticated via Clerk.
 * Rejects with 401 if no valid Clerk user is available.
 */
export async function requireAuth(request, reply) {
    // Allow mocked authentication during tests
    if (
        process.env.NODE_ENV === 'test' &&
        request.headers['x-mock-userid']
    ) {
        request.userContext = request.headers['x-mock-userid'];
        return;
    }

    try {
        const auth = getAuth(request);

        const userId = auth?.userId;

        if (!userId) {
            request.log.warn('Unauthorized request: no Clerk userId found');

            return reply.status(401).send({
                error: 'Unauthorized'
            });
        }

        // Store authenticated Clerk user ID for controllers/repositories
        request.userContext = userId;

    } catch (error) {
        request.log.error(error, 'Failed to verify Clerk authentication');

        return reply.status(401).send({
            error: 'Unauthorized'
        });
    }
}

/**
 * Optional authentication.
 * Allows public requests but attaches the Clerk user ID when available.
 */
export async function optionalAuth(request, reply) {
    if (
        process.env.NODE_ENV === 'test' &&
        request.headers['x-mock-userid']
    ) {
        request.userContext = request.headers['x-mock-userid'];
        return;
    }

    try {
        const auth = getAuth(request);

        request.userContext = auth?.userId || null;

    } catch (error) {
        request.userContext = null;
    }
}