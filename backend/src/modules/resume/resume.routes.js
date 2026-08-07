import * as controller from './resume.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export default async function resumeRoutes(fastify) {
    // Register middleware for all routes in this plugin
    fastify.addHook('preHandler', requireAuth);

    fastify.post('/upload', controller.uploadResume);
    fastify.get('/', controller.getResume);
    fastify.delete('/', controller.deleteResume);
    fastify.post('/text', controller.saveTextResume);
}
