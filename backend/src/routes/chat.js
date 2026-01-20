import { processChat } from '../services/aiService.js';
import { getMockJobs } from '../services/jobService.js';
import { getResume } from '../services/redisService.js';

export default async function chatRoutes(fastify) {
    // Process chat message
    fastify.post('/', async (request, reply) => {
        try {
            const { message } = request.body;
            const userId = request.query.userId || 'default';

            if (!message || message.trim().length === 0) {
                return reply.status(400).send({ error: 'Message is required' });
            }

            // Get current jobs and resume for context
            const jobs = getMockJobs();
            const resume = await getResume(userId);
            const resumeText = resume?.text || '';

            // Process the chat message
            const response = await processChat(message, jobs, resumeText);

            return {
                success: true,
                response
            };
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ error: 'Failed to process message' });
        }
    });

    // Get suggested prompts
    fastify.get('/suggestions', async (request, reply) => {
        const suggestions = [
            { text: 'Show me remote React jobs', category: 'search' },
            { text: 'Find senior roles posted this week', category: 'search' },
            { text: 'Which jobs have highest match scores?', category: 'match' },
            { text: 'Give me UX jobs requiring Figma', category: 'search' },
            { text: 'Where do I see my applications?', category: 'help' },
            { text: 'How do I upload my resume?', category: 'help' },
            { text: 'How does matching work?', category: 'help' },
            { text: 'Show me Python backend jobs', category: 'search' }
        ];

        return { suggestions };
    });
}
