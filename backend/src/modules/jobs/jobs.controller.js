import * as service from './jobs.service.js';

export async function getJobs(request, reply) {
    try {
        const {
            query,
            skills,
            datePosted,
            jobType,
            workMode,
            location,
            minScore,
            page,
            limit
        } = request.query;
        const userId = request.userContext;

        const skillsArray = skills ? skills.split(',').map(s => s.trim()) : [];

        const filters = {
            query,
            skills: skillsArray,
            datePosted,
            jobType,
            workMode,
            location
        };

        const result = await service.getJobsFilteredAndPaginated(filters, userId, page, limit, minScore);

        return result;
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to fetch jobs' });
    }
}

export async function getJobById(request, reply) {
    try {
        const { id } = request.params;
        const userId = request.userContext;

        const job = await service.getSingleJob(id, userId);

        if (!job) {
            return reply.status(404).send({ error: 'Job not found' });
        }

        return job;
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to fetch job' });
    }
}

export async function getBestMatches(request, reply) {
    try {
        const { limit = 8 } = request.query;
        const userId = request.userContext;

        const result = await service.getBestMatches(userId, limit);
        return result;
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to get best matches' });
    }
}

export async function clearCache(request, reply) {
    try {
        await service.clearCache();
        return { success: true, message: 'Job cache cleared successfully' };
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to clear cache' });
    }
}
