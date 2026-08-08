import * as controller from './chat.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

export default async function chatRoutes(fastify) {
    // Register middleware for all routes in this plugin
    fastify.addHook('preHandler', optionalAuth);

    fastify.post('/', controller.handleChatMessage);
    fastify.get('/suggestions', controller.getChatSuggestions);
}
