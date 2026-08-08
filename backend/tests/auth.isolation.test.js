import { test } from 'node:test';
import assert from 'node:assert';
import fastify from 'fastify';
import { clerkPlugin } from '@clerk/fastify';
import { initRedis } from '../src/services/cache/cache.service.js';

// Import routes
import applicationRoutes from '../src/modules/applications/applications.routes.js';
import resumeRoutes from '../src/modules/resume/resume.routes.js';
import jobRoutes from '../src/modules/jobs/jobs.routes.js';
import chatRoutes from '../src/modules/chat/chat.routes.js';

async function buildApp() {
    process.env.NODE_ENV = 'test';
    const app = fastify();

    // Mock clerk plugin
    app.decorateRequest('auth', null);
    app.addHook('preHandler', async (request) => {
        request.auth = { userId: null, sessionId: null };
    });

    // Register routes
    app.register(applicationRoutes, { prefix: '/api/applications' });
    app.register(resumeRoutes, { prefix: '/api/resume' });
    app.register(jobRoutes, { prefix: '/api/jobs' });
    app.register(chatRoutes, { prefix: '/api/chat' });

    await initRedis(); // uses in-memory since REDIS vars are unset
    return app;
}

test('Authentication and Data Isolation', async (t) => {
    const app = await buildApp();
    await app.ready();

    t.after(() => app.close());

    await t.test('1. Unauthenticated protected request -> 401', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/applications'
        });
        if (response.statusCode === 500) console.error(response.payload);
        assert.strictEqual(response.statusCode, 401);
        const body = JSON.parse(response.payload);
        assert.strictEqual(body.error, 'Unauthorized');
    });

    const testJobId = 'job_123_new_' + Date.now();

    await t.test('2. User A can create an application', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/applications',
            headers: { 'x-mock-userid': 'user_A' },
            payload: {
                jobId: testJobId,
                jobTitle: 'Software Engineer',
                company: 'Tech Corp',
                status: 'applied'
            }
        });
        assert.strictEqual(response.statusCode, 200);
        const body = JSON.parse(response.payload);
        assert.strictEqual(body.success, true);
        assert.strictEqual(body.application.jobId, testJobId);
    });

    await t.test('3. User A can retrieve their application', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/applications',
            headers: { 'x-mock-userid': 'user_A' }
        });
        assert.strictEqual(response.statusCode, 200);
        const body = JSON.parse(response.payload);
        const hasJob = body.applications.some(a => a.jobId === testJobId);
        assert.ok(hasJob, 'User A applications should contain the created job');
    });

    await t.test('4. User B cannot retrieve User A applications', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/applications',
            headers: { 'x-mock-userid': 'user_B' }
        });
        assert.strictEqual(response.statusCode, 200);
        const body = JSON.parse(response.payload);
        const hasJob = body.applications.some(a => a.jobId === testJobId);
        assert.ok(!hasJob, 'User B should not see User A applications');
    });

    await t.test('5. Jobs feed is publicly accessible (optionalAuth)', async () => {
        // Will use MOCK_JOBS if no Adzuna keys
        const response = await app.inject({
            method: 'GET',
            url: '/api/jobs'
        });
        assert.strictEqual(response.statusCode, 200);
        const body = JSON.parse(response.payload);
        assert.ok(Array.isArray(body.jobs));
    });

    await t.test('6. Chat is publicly accessible', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/chat',
        payload: { message: 'hello' }
    });

    assert.strictEqual(response.statusCode, 200);

    const body = JSON.parse(response.payload);
    assert.strictEqual(body.success, true);
    assert.ok(body.response);
});

    await t.test('7. Resume upload isolated correctly', async () => {
        // We test via text resume for simplicity to avoid multipart mocking
        const uploadA = await app.inject({
            method: 'POST',
            url: '/api/resume/text',
            headers: { 'x-mock-userid': 'user_A', 'Content-Type': 'application/json' },
            payload: { text: 'User A Resume Content. '.repeat(50) }
        });
        assert.strictEqual(uploadA.statusCode, 200);

        const getA = await app.inject({
            method: 'GET',
            url: '/api/resume',
            headers: { 'x-mock-userid': 'user_A' }
        });
        assert.strictEqual(getA.statusCode, 200);
        assert.strictEqual(JSON.parse(getA.payload).hasResume, true);

        const getB = await app.inject({
            method: 'GET',
            url: '/api/resume',
            headers: { 'x-mock-userid': 'user_B' }
        });
        assert.strictEqual(getB.statusCode, 200);
        assert.strictEqual(JSON.parse(getB.payload).hasResume, false);
    });
});
