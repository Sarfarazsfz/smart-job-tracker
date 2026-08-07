/**
 * Middleware to extract and verify the user identity.
 * Currently uses a simple query parameter for backward compatibility,
 * but is structured to easily integrate Clerk SDK later.
 */
export async function requireAuth(request, reply) {
    // TODO: Integrate Clerk SDK here
    // Example future implementation:
    // const { userId } = getAuth(request);
    // if (!userId) {
    //     return reply.status(401).send({ error: 'Unauthorized' });
    // }
    
    // For now, fallback to development context from query params
    const userContext = request.query.userId || 'default';
    
    // Attach to request so controllers don't need to read query params directly
    request.userContext = userContext;
}
