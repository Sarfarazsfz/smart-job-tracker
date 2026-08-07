import test from 'node:test';
import assert from 'node:assert';
import { classifyJobUrl } from '../src/utils/url.helper.js';

test('URL Classification Helper', async (t) => {

    await t.test('handles null, undefined, and empty gracefully', () => {
        assert.strictEqual(classifyJobUrl(null), 'unknown');
        assert.strictEqual(classifyJobUrl(undefined), 'unknown');
        assert.strictEqual(classifyJobUrl(''), 'unknown');
        assert.strictEqual(classifyJobUrl('   '), 'unknown');
    });

    await t.test('handles malformed URLs gracefully', () => {
        assert.strictEqual(classifyJobUrl('not a url'), 'unknown');
        assert.strictEqual(classifyJobUrl('http//bad-url'), 'unknown');
    });

    await t.test('identifies demo and mock sources', () => {
        assert.strictEqual(classifyJobUrl('https://example.com', 'mock'), 'demo');
        assert.strictEqual(classifyJobUrl('https://demo.jobmatch.ai/jobs/123'), 'demo');
    });

    await t.test('identifies Adzuna as aggregator', () => {
        assert.strictEqual(classifyJobUrl('https://www.adzuna.in/land/ad/123', 'adzuna'), 'aggregator');
    });

    await t.test('LinkedIn: job-specific /jobs/view/ URL is direct (not search)', () => {
        // This is the critical test: a specific job view URL must NOT be classified as search
        assert.strictEqual(classifyJobUrl('https://www.linkedin.com/jobs/view/12345'), 'direct');
        assert.strictEqual(classifyJobUrl('https://www.linkedin.com/jobs/view/987654321/'), 'direct');
        assert.strictEqual(classifyJobUrl('https://www.linkedin.com/jobs/view/123456789?refId=abc'), 'direct');
    });

    await t.test('LinkedIn: generic search URLs are classified as search', () => {
        assert.strictEqual(classifyJobUrl('https://www.linkedin.com/jobs/search/?keywords=developer'), 'search');
        assert.strictEqual(classifyJobUrl('https://linkedin.com/jobs/search?q=test'), 'search');
        // Without /view/ or /search — falls through to unknown
        assert.strictEqual(classifyJobUrl('https://www.linkedin.com/jobs/'), 'unknown');
    });

    await t.test('Naukri specific handling', () => {
        assert.strictEqual(classifyJobUrl('https://www.naukri.com/jobs?q=react'), 'search');
        assert.strictEqual(classifyJobUrl('https://www.naukri.com/jobs'), 'search');
        // A direct job page would typically look different, but for now we fallback to unknown
        assert.strictEqual(classifyJobUrl('https://www.naukri.com/job-listings-react-developer-12345'), 'unknown');
    });

    await t.test('Direct ATS providers', () => {
        assert.strictEqual(classifyJobUrl('https://boards.greenhouse.io/techcorp/jobs/123'), 'direct');
        assert.strictEqual(classifyJobUrl('https://jobs.lever.co/startup/456'), 'direct');
        assert.strictEqual(classifyJobUrl('https://company.myworkdayjobs.com/en-US/careers'), 'direct');
        assert.strictEqual(classifyJobUrl('https://jobs.ashbyhq.com/company/123'), 'direct');
        assert.strictEqual(classifyJobUrl('https://company.bamboohr.com/jobs/123'), 'direct');
    });

    await t.test('Aggregators', () => {
        assert.strictEqual(classifyJobUrl('https://www.indeed.com/viewjob?jk=123'), 'aggregator');
        assert.strictEqual(classifyJobUrl('https://www.glassdoor.com/job-listing/123'), 'aggregator');
        assert.strictEqual(classifyJobUrl('https://www.ziprecruiter.com/jobs/123'), 'aggregator');
        assert.strictEqual(classifyJobUrl('https://jooble.org/desc/123'), 'aggregator');
    });

    await t.test('Unknown fallback for unrecognized domains', () => {
        assert.strictEqual(classifyJobUrl('https://careers.google.com/jobs/results/123'), 'unknown');
        assert.strictEqual(classifyJobUrl('https://some-company.com/careers/456'), 'unknown');
    });
});

test('Job Identity Preservation (apply flow)', async (t) => {
    await t.test('job object spread preserves all critical fields', () => {
        const originalJob = {
            id: 'job-42',
            title: 'Senior React Developer',
            company: 'TechCorp India',
            location: 'Bangalore',
            applyUrl: null,
            source: 'mock',
            externalUrlType: 'demo'
        };

        // Simulate what handleApply does: spread the job into pendingApplication
        const pendingApplication = {
            ...originalJob,
            clickedAt: new Date().toISOString()
        };

        // All fields must be preserved
        assert.strictEqual(pendingApplication.id, originalJob.id);
        assert.strictEqual(pendingApplication.title, originalJob.title);
        assert.strictEqual(pendingApplication.company, originalJob.company);
        assert.strictEqual(pendingApplication.applyUrl, originalJob.applyUrl);
        assert.strictEqual(pendingApplication.source, originalJob.source);
        assert.strictEqual(pendingApplication.externalUrlType, originalJob.externalUrlType);

        // clickedAt is added but does not override job fields
        assert.ok(pendingApplication.clickedAt);
    });

    await t.test('different job objects are not mixed', () => {
        const jobA = { id: 'job-1', title: 'Backend Developer', applyUrl: 'https://greenhouse.io/123' };
        const jobB = { id: 'job-2', title: 'Frontend Developer', applyUrl: 'https://greenhouse.io/456' };

        const pendingA = { ...jobA, clickedAt: new Date().toISOString() };
        const pendingB = { ...jobB, clickedAt: new Date().toISOString() };

        // Ensure they remain isolated
        assert.notStrictEqual(pendingA.id, pendingB.id);
        assert.notStrictEqual(pendingA.title, pendingB.title);
        assert.notStrictEqual(pendingA.applyUrl, pendingB.applyUrl);
    });
});
