import * as service from './applications.service.js';

export async function createApplication(request, reply) {
    try {
        const { jobId, jobTitle, company, applyUrl, appliedAt, status } = request.body;
        const userId = request.userContext;

        if (!jobId || !jobTitle || !company) {
            return reply.status(400).send({
                error: 'Missing required fields: jobId, jobTitle, company'
            });
        }

        const application = await service.createApplication(userId, {
            jobId, jobTitle, company, applyUrl, appliedAt, status
        });

        return { success: true, application };
    } catch (error) {
        if (error.code === 'ALREADY_APPLIED') {
            return reply.status(409).send({ error: error.message, existing: error.existing });
        }
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to create application' });
    }
}

export async function getApplications(request, reply) {
    try {
        const { status, sortBy, order } = request.query;
        const userId = request.userContext;

        const result = await service.listApplications(userId, { status, sortBy, order });
        return result; // returns { applications, stats }
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to get applications' });
    }
}

export async function updateApplication(request, reply) {
    try {
        const { id } = request.params;
        const { status, note } = request.body;
        const userId = request.userContext;

        const validStatuses = ['applied', 'interview', 'offer', 'rejected'];
        if (status && !validStatuses.includes(status)) {
            return reply.status(400).send({
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const updated = await service.modifyApplication(userId, id, { status, note });
        return { success: true, application: updated };
    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return reply.status(404).send({ error: error.message });
        }
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to update application' });
    }
}

export async function deleteApplication(request, reply) {
    try {
        const { id } = request.params;
        const userId = request.userContext;

        await service.removeApplication(userId, id);
        return { success: true, message: 'Application deleted' };
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to delete application' });
    }
}

export async function checkApplication(request, reply) {
    try {
        const { jobId } = request.params;
        const userId = request.userContext;

        return await service.checkApplicationStatus(userId, jobId);
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to check application' });
    }
}
