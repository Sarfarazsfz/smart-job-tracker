import { fetchJobs, getMockJobs, applyFilters } from '../services/jobService.js';
import { getResume } from '../services/redisService.js';
import { scoreJobsInBatch } from '../services/aiService.js';

export default async function jobRoutes(fastify) {
    // Get all jobs with filters
    fastify.get('/', async (request, reply) => {
        try {
            const {
                query,
                skills,
                datePosted,
                jobType,
                workMode,
                location,
                minScore,
                userId = 'default'
            } = request.query;

            // Parse skills if it's a comma-separated string
            const skillsArray = skills ? skills.split(',').map(s => s.trim()) : [];

            const filters = {
                query,
                skills: skillsArray,
                datePosted,
                jobType,
                workMode,
                location
            };

            // Fetch jobs
            let jobs = await fetchJobs(filters);

            // If user has resume, score all jobs
            const resume = await getResume(userId);
            if (resume && resume.text) {
                jobs = await scoreJobsInBatch(resume.text, jobs);

                // Sort by match score
                jobs = jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

                // Filter by minimum score if specified
                if (minScore) {
                    const minScoreNum = parseInt(minScore);
                    jobs = jobs.filter(j => (j.matchScore || 0) >= minScoreNum);
                }
            }

            return {
                jobs,
                total: jobs.length,
                hasResume: !!resume
            };
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch jobs' });
        }
    });

    // Get single job by ID
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { userId = 'default' } = request.query;

            // Get all jobs and find the one we need
            const allJobs = getMockJobs();
            const job = allJobs.find(j => j.id === id);

            if (!job) {
                return reply.status(404).send({ error: 'Job not found' });
            }

            // Score against resume if available
            const resume = await getResume(userId);
            if (resume && resume.text) {
                const scored = await scoreJobsInBatch(resume.text, [job]);
                return scored[0];
            }

            return job;
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch job' });
        }
    });

    // Get best matches
    fastify.get('/best-matches', async (request, reply) => {
        try {
            const { userId = 'default', limit = 8 } = request.query;

            const resume = await getResume(userId);
            if (!resume || !resume.text) {
                return {
                    jobs: [],
                    message: 'Upload a resume to see your best matches'
                };
            }

            let jobs = getMockJobs();
            jobs = await scoreJobsInBatch(resume.text, jobs);

            // Get top matches
            const bestMatches = jobs
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, parseInt(limit));

            return {
                jobs: bestMatches,
                hasResume: true
            };
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ error: 'Failed to get best matches' });
        }
    });
}
