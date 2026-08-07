import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from '../config/index.js';

export default async function setupPlugins(fastify) {
    await fastify.register(cors, {
        origin: config.frontendUrl,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    });

    await fastify.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit
        }
    });
}
