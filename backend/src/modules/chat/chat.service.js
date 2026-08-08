import { getResume } from '../resume/resume.repository.js';

import {
    getAIProvider,
    scoreJobsInBatch,
    SKILL_CATEGORIES
} from '../../services/ai/ai.service.js';


/**
 * Process a chat message.
 *
 * The AI assistant is available to both authenticated and guest users.
 * Authenticated users can have their resume used as additional context.
 * Guest users simply receive job/application assistance without resume context.
 */
export async function processUserMessage(userId, message, getJobsCallback) {
    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message is required');
    }

    // Get current jobs
    const jobs = await getJobsCallback();

    // Get resume only when a user is authenticated
    const resume = userId
        ? await getResume(userId)
        : null;

    const resumeText = resume?.text || '';

    return await handleChatLogic(
        message.trim(),
        Array.isArray(jobs) ? jobs : [],
        resumeText
    );
}


/**
 * Main AI processing flow.
 *
 * Priority:
 * 1. Gemini
 * 2. OpenAI
 * 3. Rule-based fallback
 */
async function handleChatLogic(message, jobs, resumeText) {
    const {
        aiProvider,
        model,
        openai
    } = getAIProvider();

    // Gemini
    if (aiProvider === 'gemini' && model) {
        try {
            return await geminiChat(
                message,
                jobs,
                resumeText,
                model
            );
        } catch (error) {
            console.error(
                'Gemini chat error, trying OpenAI:',
                error.message || error
            );

            // Try OpenAI backup
            if (openai) {
                try {
                    return await openaiChat(
                        message,
                        jobs,
                        resumeText,
                        openai
                    );
                } catch (openaiError) {
                    console.error(
                        'OpenAI chat error, using fallback:',
                        openaiError.message || openaiError
                    );

                    return fallbackChat(
                        message,
                        jobs,
                        resumeText
                    );
                }
            }

            return fallbackChat(
                message,
                jobs,
                resumeText
            );
        }
    }

    // OpenAI primary
    if (aiProvider === 'openai' && openai) {
        try {
            return await openaiChat(
                message,
                jobs,
                resumeText,
                openai
            );
        } catch (error) {
            console.error(
                'OpenAI chat error, using fallback:',
                error.message || error
            );

            return fallbackChat(
                message,
                jobs,
                resumeText
            );
        }
    }

    // No AI provider
    return fallbackChat(
        message,
        jobs,
        resumeText
    );
}


/**
 * Gemini chat implementation.
 */
async function geminiChat(
    message,
    jobs,
    resumeText,
    model
) {
    const jobsList = jobs
        .slice(0, 10)
        .map((job) => {
            const remoteText =
                job.workMode === 'Remote'
                    ? ', Remote'
                    : '';

            return `- ${job.title} at ${job.company} (${job.location}${remoteText})`;
        })
        .join('\n');

    const prompt = `
You are Faraz, the AI Job Assistant inside JobMatch AI.

Your job is to help users:
- find jobs
- filter jobs
- understand match scores
- understand JobMatch AI features
- get career/job-search guidance

IMPORTANT RESPONSE RULES:
- Keep every answer SHORT.
- Maximum 2 sentences for normal questions.
- Maximum 3 short bullet points when listing capabilities.
- Never write long explanations unless the user explicitly asks for details.
- Do not repeat the user's question.
- Do not add unnecessary introductions.
- Do not say "I am happy to help", "feel free to ask", or similar filler.
- Be direct and useful.
- Use simple conversational English.
- Use at most 1 emoji when appropriate.

IDENTITY:
- If asked your name, say: "I'm Faraz, your AI job-search assistant."
- Do not claim to be a human.
- If asked what you can do, mention only:
  1. Find/filter jobs
  2. Recommend relevant jobs
  3. Explain match scores and platform features

JOB SEARCH:
- Recommend only jobs from the provided job list.
- Never invent jobs, companies, salaries, locations, or skills.
- If relevant jobs exist, mention the most relevant ones briefly.
- If no matching jobs exist, say so briefly and suggest changing the search criteria.

PLATFORM:
- Answer questions about resume upload, applications, matching scores, filters, and the AI assistant briefly.

GENERAL QUESTIONS:
- Answer naturally but keep it short.
- If the question is unrelated to jobs, answer briefly and do not force the conversation back to jobs.

USER MESSAGE:
"${message}"

AVAILABLE JOBS:
${
    jobs.length > 0
        ? jobs.slice(0, 10).map((job) =>
            `- ${job.title} | ${job.company} | ${job.location} | ${job.workMode || 'Not specified'}`
        ).join('\n')
        : 'No jobs currently available.'
}

RESUME:
${
    resumeText
        ? 'Resume available for matching.'
        : 'No resume uploaded.'
}

Return ONLY the answer to the user's message.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
        type: 'help',
        message: response.text(),
        jobs: []
    };
}


/**
 * OpenAI chat implementation.
 */
async function openaiChat(
    message,
    jobs,
    resumeText,
    openai
) {
    const jobsList = jobs
        .slice(0, 10)
        .map((job) => {
            const remoteText =
                job.workMode === 'Remote'
                    ? ', Remote'
                    : '';

            return `- ${job.title} at ${job.company} (${job.location}${remoteText})`;
        })
        .join('\n');

    const prompt = `
You are Faraz, a friendly AI job search assistant for an AI-powered job tracker.

User's question:
"${message}"

Available jobs:
${
    jobs.length > 0
        ? jobsList
        : 'No jobs are currently available.'
}

Resume context:
${
    resumeText
        ? resumeText.substring(0, 500)
        : 'No resume provided.'
}

Guidelines:
- If asked about your name, introduce yourself as Faraz.
- If asked what you can do, explain your job-search and platform-help capabilities.
- For job-related questions, recommend only jobs from the available list.
- For general questions, answer naturally.
- For platform questions, explain the relevant feature.
- Do not invent job information.
- Keep responses concise and useful.

Be conversational and helpful.
`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 300
    });

    return {
        type: 'help',
        message:
            completion.choices?.[0]?.message?.content ||
            'I could not generate a response right now.',
        jobs: []
    };
}


/**
 * Rule-based fallback.
 *
 * This allows the assistant to continue working even if
 * Gemini/OpenAI is temporarily unavailable.
 */
async function fallbackChat(
    message,
    jobs,
    resumeText
) {
    const lowerMessage = message
        .toLowerCase()
        .trim();


    // --------------------------------------------------
    // Personal / identity questions
    // --------------------------------------------------

    if (
        lowerMessage.includes('your name') ||
        lowerMessage.includes('who are you') ||
        lowerMessage.includes('what are you')
    ) {
        return {
            type: 'help',
            message:
                "Hi! I'm Faraz 👋, your friendly AI job search assistant. I can help you find relevant jobs, understand match scores, search by skills and learn how to use the platform.",
            jobs: []
        };
    }


    // --------------------------------------------------
    // What can you do?
    // --------------------------------------------------

    if (
        lowerMessage.includes('what can you do') ||
        lowerMessage.includes('what do you do') ||
        lowerMessage.includes('how can you help') ||
        lowerMessage.includes('what are your features') ||
        lowerMessage.includes('what can u do') ||
        lowerMessage.includes('how can u help')
    ) {
        return {
            type: 'help',
            message:
                "I can help you search and filter jobs, find roles by skills or work mode, recommend relevant opportunities, explain match scores, and guide you around the JobMatch AI platform. 🤖💼",
            jobs: []
        };
    }


    // --------------------------------------------------
    // Greetings
    // --------------------------------------------------

    if (
        /^(hi|hello|hey|hola|namaste|hii|hiii)\b/.test(
            lowerMessage
        )
    ) {
        return {
            type: 'help',
            message:
                "Hey there! 😊 I'm Faraz, your job search buddy. How can I help you find your dream job today?",
            jobs: []
        };
    }


    // --------------------------------------------------
    // General conversation
    // --------------------------------------------------

    if (
        lowerMessage.includes('how are you') ||
        lowerMessage.includes("what's up") ||
        lowerMessage.includes('whats up')
    ) {
        return {
            type: 'help',
            message:
                "I'm doing great! 🌟 I'm ready to help you find relevant job opportunities. What kind of role are you looking for?",
            jobs: []
        };
    }


    // --------------------------------------------------
    // Product / platform questions
    // --------------------------------------------------

    const productQuestions = [
        {
            patterns: [
                'where',
                'find',
                'see',
                'applications',
                'applied',
                'tracking'
            ],
            answer:
                'You can see your applications in the "Applications" tab at the top of the page. There you can track the jobs you have applied to and their current status.'
        },
        {
            patterns: [
                'upload',
                'resume',
                'cv'
            ],
            answer:
                'To upload or update your resume, click "Upload Resume" in the application. You can upload your resume and use it for job matching.'
        },
        {
            patterns: [
                'how',
                'matching',
                'score',
                'work'
            ],
            answer:
                'The matching system compares your resume with job requirements. It considers skill overlap (45%), experience-level alignment (30%), and job-title relevance (25%).'
        },
        {
            patterns: [
                'filter',
                'search',
                'find jobs'
            ],
            answer:
                'Use the filters on the left side to narrow jobs by title, skills, date posted, job type, work mode and location.'
        }
    ];


    for (const productQuestion of productQuestions) {
        const matches = productQuestion.patterns.filter(
            (pattern) => lowerMessage.includes(pattern)
        );

        if (matches.length >= 2) {
            return {
                type: 'help',
                message: productQuestion.answer,
                jobs: []
            };
        }
    }


    // --------------------------------------------------
    // Job filtering
    // --------------------------------------------------

    let filteredJobs = [...jobs];


    // Remote jobs
    if (lowerMessage.includes('remote')) {
        filteredJobs = filteredJobs.filter(
            (job) =>
                job.workMode?.toLowerCase() === 'remote'
        );
    }


    // Skill filtering
    for (const skills of Object.values(SKILL_CATEGORIES)) {
        let matchedSkill = false;

        for (const skill of skills) {
            if (lowerMessage.includes(skill.toLowerCase())) {
                matchedSkill = true;

                filteredJobs = filteredJobs.filter(
                    (job) => {
                        const jobSkills =
                            Array.isArray(job.skills)
                                ? job.skills
                                : [];

                        const hasSkillInArray =
                            jobSkills.some(
                                (jobSkill) =>
                                    typeof jobSkill === 'string' &&
                                    jobSkill
                                        .toLowerCase()
                                        .includes(skill.toLowerCase())
                            );

                        const hasSkillInDescription =
                            job.description
                                ?.toLowerCase()
                                .includes(
                                    skill.toLowerCase()
                                ) || false;

                        const hasSkillInTitle =
                            job.title
                                ?.toLowerCase()
                                .includes(
                                    skill.toLowerCase()
                                ) || false;

                        return (
                            hasSkillInArray ||
                            hasSkillInDescription ||
                            hasSkillInTitle
                        );
                    }
                );

                break;
            }
        }

        if (matchedSkill) {
            // Continue checking other skill categories.
        }
    }


    // Senior roles
    if (lowerMessage.includes('senior')) {
        filteredJobs = filteredJobs.filter(
            (job) =>
                job.title
                    ?.toLowerCase()
                    .includes('senior')
        );
    }


    // Junior / entry-level roles
    if (
        lowerMessage.includes('junior') ||
        lowerMessage.includes('entry') ||
        lowerMessage.includes('intern')
    ) {
        filteredJobs = filteredJobs.filter(
            (job) => {
                const title =
                    job.title?.toLowerCase() || '';

                return (
                    title.includes('junior') ||
                    title.includes('intern') ||
                    title.includes('entry')
                );
            }
        );
    }


    // Recently posted jobs
    if (
        lowerMessage.includes('this week') ||
        lowerMessage.includes('recent') ||
        lowerMessage.includes('recently')
    ) {
        const weekAgo =
            new Date(
                Date.now() -
                7 * 24 * 60 * 60 * 1000
            );

        filteredJobs = filteredJobs.filter(
            (job) => {
                const postedDate =
                    new Date(job.postedDate);

                return (
                    !Number.isNaN(
                        postedDate.getTime()
                    ) &&
                    postedDate > weekAgo
                );
            }
        );
    }


    // --------------------------------------------------
    // Highest match / best match
    // --------------------------------------------------

    if (
        lowerMessage.includes('best match') ||
        lowerMessage.includes('highest score') ||
        lowerMessage.includes('top match') ||
        lowerMessage.includes('best jobs')
    ) {
        if (resumeText) {
            filteredJobs =
                await scoreJobsInBatch(
                    resumeText,
                    filteredJobs
                );

            filteredJobs =
                filteredJobs
                    .sort(
                        (a, b) =>
                            b.matchScore -
                            a.matchScore
                    )
                    .slice(0, 5);
        } else {
            return {
                type: 'help',
                message:
                    'Upload your resume first and I can help identify the jobs with the strongest match scores. 📄',
                jobs: []
            };
        }
    }


    // --------------------------------------------------
    // Build response
    // --------------------------------------------------

    let responseMessage;


    if (filteredJobs.length === 0) {
        responseMessage =
            "I couldn't find any jobs matching your criteria. Try broadening your search or asking about different skills.";
    } else if (filteredJobs.length === jobs.length) {
        responseMessage =
            'Here are some job recommendations based on your query:';

        filteredJobs =
            filteredJobs.slice(0, 6);
    } else {
        responseMessage =
            `I found ${filteredJobs.length} job${
                filteredJobs.length === 1
                    ? ''
                    : 's'
            } matching your criteria:`;

        filteredJobs =
            filteredJobs.slice(0, 6);
    }


    return {
        type: 'jobs',
        message: responseMessage,
        jobs: filteredJobs
    };
}