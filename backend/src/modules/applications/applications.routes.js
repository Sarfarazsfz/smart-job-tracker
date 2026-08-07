import * as controller from './applications.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export default async function applicationRoutes(fastify) {
    // Register middleware for all routes in this plugin
    fastify.addHook('preHandler', requireAuth);

    fastify.post('/', controller.createApplication);
    fastify.get('/', controller.getApplications);
    fastify.patch('/:id', controller.updateApplication);
    fastify.delete('/:id', controller.deleteApplication);
    fastify.get('/check/:jobId', controller.checkApplication);
}
