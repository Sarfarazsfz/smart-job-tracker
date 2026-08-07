import * as controller from './jobs.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export default async function jobRoutes(fastify) {
    // Register middleware for all routes in this plugin
    fastify.addHook('preHandler', requireAuth);

    fastify.get('/', controller.getJobs);
    fastify.get('/best-matches', controller.getBestMatches); // MUST be before /:id
    fastify.post('/clear-cache', controller.clearCache);
    fastify.get('/:id', controller.getJobById); // dynamic route LAST
}
