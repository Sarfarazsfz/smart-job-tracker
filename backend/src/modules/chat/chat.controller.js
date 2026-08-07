import * as service from './chat.service.js';
// We inject the job fetching dependency to avoid direct coupling across modules if possible, 
// but for simplicity we can just import the job service.
import { fetchJobs } from '../jobs/jobs.service.js';

export async function handleChatMessage(request, reply) {
    try {
        const { message } = request.body;
        const userId = request.userContext;

        if (!message || message.trim().length === 0) {
            return reply.status(400).send({ error: 'Message is required' });
        }

        const response = await service.processUserMessage(userId, message, async () => {
            return await fetchJobs({}); // fetch all jobs unpaginated
        });

        return {
            success: true,
            response
        };
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to process message' });
    }
}

export async function getChatSuggestions(request, reply) {
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
}
