import { getResume } from '../resume/resume.repository.js';

export async function processUserMessage(userId, message, getJobsCallback) {
    // Get current jobs and resume for context
    const jobs = await getJobsCallback();
    const resume = userId ? await getResume(userId) : null;
    const resumeText = resume?.text || '';

    // Process the chat message (which uses AI)
    // Note: processChat was defined in ai.service.js but in our refactor we need to make sure 
    // we handle the AI processing logic correctly. Wait, I should implement `processChat` in ai.service.js?
    // Let me check if I included it in ai.service.js. I did not! The chat processing logic was in aiService.js!
    // I need to extract chat processing logic here or in ai.service.js. 
    // Actually, chat logic is specific to the Chat domain. It makes more sense in chat.service.js
    // Let's implement it here directly using the ai.service.js helpers.
    
    return await handleChatLogic(message, jobs, resumeText);
}

// Re-implemented chat logic from aiService.js
import { getAIProvider, scoreJobMatch, scoreJobsInBatch } from '../../services/ai/ai.service.js';

async function handleChatLogic(message, jobs, resumeText) {
    const { aiProvider, model, openai } = getAIProvider();

    if (aiProvider === 'gemini' && model) {
        try {
            return await geminiChat(message, jobs, resumeText, model);
        } catch (error) {
            console.error('Gemini chat error, trying OpenAI:', error.message || error);
            if (openai) {
                try {
                    return await openaiChat(message, jobs, resumeText, openai);
                } catch (openaiError) {
                    console.error('OpenAI chat error, using fallback:', openaiError.message);
                    return fallbackChat(message, jobs, resumeText);
                }
            }
            return fallbackChat(message, jobs, resumeText);
        }
    }

    if (aiProvider === 'openai' && openai) {
        try {
            return await openaiChat(message, jobs, resumeText, openai);
        } catch (error) {
            console.error('OpenAI chat error, using fallback:', error.message || error);
            return fallbackChat(message, jobs, resumeText);
        }
    }

    return fallbackChat(message, jobs, resumeText);
}

async function geminiChat(message, jobs, resumeText, model) {
    const jobsList = jobs.slice(0, 10).map(j =>
        `- ${j.title} at ${j.company} (${j.location}${j.workMode === 'Remote' ? ', Remote' : ''})`
    ).join('\n');

    const prompt = `You are Faraz, a friendly and helpful AI job search assistant for an AI-powered job tracker app in India.

Your personality:
- Introduce yourself as "Faraz" when asked about your name
- Be warm, friendly, and conversational
- Use emojis occasionally to be more engaging
- You can chat about general topics, but always try to relate back to jobs/career when relevant
- Keep responses concise (2-3 sentences max)

User's question: "${message}"

${jobs.length > 0 ? `Available jobs (showing ${Math.min(10, jobs.length)} of ${jobs.length}):\n${jobsList}` : 'No jobs currently loaded.'}

${resumeText ? 'The user has uploaded their resume for AI matching.' : 'The user has not uploaded a resume yet.'}

If the user asks:
- About your name: Introduce yourself as Faraz, a friendly AI assistant
- Job-related questions: Recommend relevant jobs from the list
- General questions: Answer briefly and friendly, then suggest how you can help with their job search
- App features: Provide helpful guidance

Be conversational and helpful!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
        type: 'help',
        message: response.text(),
        jobs: []
    };
}

async function openaiChat(message, jobs, resumeText, openai) {
    const jobsList = jobs.slice(0, 10).map(j =>
        `- ${j.title} at ${j.company} (${j.location}${j.workMode === 'Remote' ? ', Remote' : ''})`
    ).join('\n');

    const prompt = `You are Faraz, a friendly AI job search assistant. The user said: "${message}"

Available jobs:
${jobsList}

User's resume summary: ${resumeText ? resumeText.substring(0, 500) : 'Not provided'}

Respond naturally and helpfully. Guidelines:
- About your name: Introduce yourself as Faraz, a friendly AI assistant
- Job-related questions: Recommend relevant jobs from the list
- General questions: Answer briefly and friendly, then suggest how you can help with their job search
- App features: Provide helpful guidance

Be conversational and helpful!`;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300
    });

    return {
        type: 'help',
        message: completion.choices[0].message.content,
        jobs: []
    };
}

async function fallbackChat(message, jobs, resumeText) {
    const lowerMessage = message.toLowerCase();

    // Personal questions - introduce as Faraz
    if (lowerMessage.includes('your name') || lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
        return {
            type: 'help',
            message: "Hi! I'm Faraz 👋, your friendly AI job search assistant. I'm here to help you find the perfect job! Ask me about remote jobs, specific skills, or how to use this platform.",
            jobs: []
        };
    }

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|hola|namaste)/)) {
        return {
            type: 'help',
            message: "Hey there! 😊 I'm Faraz, your job search buddy. How can I help you find your dream job today?",
            jobs: []
        };
    }

    // General conversation
    if (lowerMessage.includes('how are you') || lowerMessage.includes('whats up') || lowerMessage.includes("what's up")) {
        return {
            type: 'help',
            message: "I'm doing great, thanks for asking! 🌟 I'm excited to help you find amazing job opportunities. What kind of role are you looking for?",
            jobs: []
        };
    }

    // Product questions - handled without AI
    const productQuestions = [
        {
            patterns: ['where', 'find', 'see', 'applications', 'applied', 'tracking'],
            answer: 'You can see all your applications in the "Applications" tab at the top of the page. There you\'ll find a timeline of all jobs you\'ve applied to, with their current status.'
        },
        {
            patterns: ['upload', 'resume', 'cv'],
            answer: 'To upload or update your resume, click on the user icon in the top right corner and select "Upload Resume". You can upload PDF or TXT files.'
        },
        {
            patterns: ['how', 'matching', 'score', 'work'],
            answer: 'Our matching algorithm analyzes your resume and compares it with job requirements. We look at: 1) Skill overlap (45% weight), 2) Experience level alignment (30% weight), and 3) Job title relevance (25% weight). Higher scores mean better matches!'
        },
        {
            patterns: ['filter', 'search', 'find jobs'],
            answer: 'Use the filter panel on the left to narrow down jobs. You can filter by job title, skills, date posted, job type (full-time, part-time, etc.), work mode (remote, hybrid, on-site), and location.'
        }
    ];

    for (const pq of productQuestions) {
        const matches = pq.patterns.filter(p => lowerMessage.includes(p));
        if (matches.length >= 2) {
            return {
                type: 'help',
                message: pq.answer,
                jobs: []
            };
        }
    }

    let filteredJobs = [...jobs];

    if (lowerMessage.includes('remote')) {
        filteredJobs = filteredJobs.filter(j => j.workMode === 'Remote');
    }

    const { SKILL_CATEGORIES } = require('../../services/ai/ai.service.js');
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
        for (const skill of skills) {
            if (lowerMessage.includes(skill)) {
                filteredJobs = filteredJobs.filter(j => {
                    const jobSkills = j.skills || [];
                    const hasSkillInArray = jobSkills.some(s => s.toLowerCase().includes(skill));
                    const hasSkillInDesc = j.description?.toLowerCase().includes(skill) || false;
                    const hasSkillInTitle = j.title?.toLowerCase().includes(skill) || false;
                    return hasSkillInArray || hasSkillInDesc || hasSkillInTitle;
                });
                break;
            }
        }
    }

    if (lowerMessage.includes('senior')) {
        filteredJobs = filteredJobs.filter(j => j.title.toLowerCase().includes('senior'));
    }
    if (lowerMessage.includes('junior') || lowerMessage.includes('entry')) {
        filteredJobs = filteredJobs.filter(j =>
            j.title.toLowerCase().includes('junior') || j.title.toLowerCase().includes('intern')
        );
    }

    if (lowerMessage.includes('this week') || lowerMessage.includes('recent')) {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filteredJobs = filteredJobs.filter(j => new Date(j.postedDate) > weekAgo);
    }

    if (lowerMessage.includes('best match') || lowerMessage.includes('highest score') || lowerMessage.includes('top match')) {
        if (resumeText) {
            
            // To prevent circular deps and since we didn't export scoreJobsInBatch, we should probably just export scoreJobsInBatch from jobs module, but it uses AI. Let's make sure scoreJobsInBatch is available. Wait, scoreJobsInBatch was in aiService.js!
            // Let me make sure ai.service.js has scoreJobsInBatch. Ah, I missed adding `scoreJobMatch` and `scoreJobsInBatch` to `ai.service.js` earlier!
            // I need to add those to `ai.service.js`. I will do that via a separate edit.
            
            filteredJobs = await scoreJobsInBatch(resumeText, filteredJobs);
            filteredJobs = filteredJobs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
        }
    }

    let responseMessage;
    if (filteredJobs.length === 0) {
        responseMessage = "I couldn't find any jobs matching your criteria. Try broadening your search or asking about different skills.";
    } else if (filteredJobs.length === jobs.length) {
        responseMessage = "Here are some job recommendations based on your query:";
        filteredJobs = filteredJobs.slice(0, 6);
    } else {
        responseMessage = `I found ${filteredJobs.length} job${filteredJobs.length === 1 ? '' : 's'} matching your criteria:`;
        filteredJobs = filteredJobs.slice(0, 6);
    }

    return {
        type: 'jobs',
        message: responseMessage,
        jobs: filteredJobs
    };
}
