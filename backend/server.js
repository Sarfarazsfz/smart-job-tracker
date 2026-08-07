import Fastify from 'fastify';

import { config } from './src/config/index.js';
import setupPlugins from './src/plugins/setup.js';
import { initRedis } from './src/services/cache/cache.service.js';

// Module routes
import jobRoutes from './src/modules/jobs/jobs.routes.js';
import resumeRoutes from './src/modules/resume/resume.routes.js';
import applicationRoutes from './src/modules/applications/applications.routes.js';
import chatRoutes from './src/modules/chat/chat.routes.js';

const fastify = Fastify({
  logger: true
});

// Setup Plugins (CORS, Multipart)
await setupPlugins(fastify);

// Initialize Redis
await initRedis();

// Register routes
fastify.register(jobRoutes, { prefix: '/api/jobs' });
fastify.register(resumeRoutes, { prefix: '/api/resume' });
fastify.register(applicationRoutes, { prefix: '/api/applications' });
fastify.register(chatRoutes, { prefix: '/api/chat' });

// Health check
fastify.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal Server Error'
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
