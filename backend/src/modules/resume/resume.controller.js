import * as service from './resume.service.js';

export async function uploadResume(request, reply) {
    try {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ error: 'No file uploaded' });
        }

        const { filename, mimetype } = data;
        const userId = request.userContext;

        const allowedTypes = ['application/pdf', 'text/plain'];
        if (!allowedTypes.includes(mimetype)) {
            return reply.status(400).send({
                error: 'Invalid file type. Please upload PDF or TXT file.'
            });
        }

        const chunks = [];
        for await (const chunk of data.file) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const result = await service.processResumeUpload(userId, { filename, mimetype, buffer });

        return {
            success: true,
            message: 'Resume uploaded successfully',
            ...result
        };
    } catch (error) {
        if (error.code === 'PARSE_ERROR' || error.code === 'INSUFFICIENT_TEXT') {
            return reply.status(400).send({ error: error.message });
        }
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to upload resume' });
    }
}

export async function getResume(request, reply) {
    try {
        const userId = request.userContext;
        request.log.info(`Checking resume for user: ${userId}`);

        const result = await service.getResumeStatus(userId);
        return result;
    } catch (error) {
        request.log.error('Error checking resume:', error);
        return { hasResume: false };
    }
}

export async function deleteResume(request, reply) {
    try {
        const userId = request.userContext;
        await service.removeResume(userId);
        return { success: true, message: 'Resume deleted' };
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to delete resume' });
    }
}

export async function saveTextResume(request, reply) {
    try {
        const { text } = request.body;
        const userId = request.userContext;

        await service.saveResumeText(userId, text);
        return { success: true, message: 'Resume saved successfully' };
    } catch (error) {
        if (error.code === 'INSUFFICIENT_TEXT') {
            return reply.status(400).send({ error: error.message });
        }
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to save resume' });
    }
}
