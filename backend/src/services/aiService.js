import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

// Initialize Google Gemini AI
export function initAI() {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        console.log('Google Gemini AI initialized (gemini-1.5-flash-latest)');
        return true;
    }
    console.log('No Gemini API key configured, using fallback scoring');
    return false;
}

// Common tech skills for matching
const SKILL_CATEGORIES = {
    frontend: ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'tailwind', 'next.js', 'redux', 'webpack'],
    backend: ['node.js', 'python', 'java', 'go', 'rust', 'ruby', 'php', 'c#', 'django', 'flask', 'spring', 'express', 'fastify'],
    database: ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sql', 'nosql', 'dynamodb', 'firebase'],
    devops: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'jenkins', 'github actions'],
    mobile: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'],
    data: ['machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'spark', 'data science', 'nlp'],
    design: ['figma', 'sketch', 'ui/ux', 'adobe xd', 'prototyping', 'user research']
};

// Extract skills from text
export function extractSkills(text) {
    const normalizedText = text.toLowerCase();
    const foundSkills = new Set();

    for (const category of Object.values(SKILL_CATEGORIES)) {
        for (const skill of category) {
            if (normalizedText.includes(skill)) {
                foundSkills.add(skill);
            }
        }
    }

    return Array.from(foundSkills);
}

// Calculate skill overlap between resume and job
function calculateSkillOverlap(resumeSkills, jobSkills) {
    if (jobSkills.length === 0) return 50;

    const resumeSet = new Set(resumeSkills.map(s => s.toLowerCase()));
    const matchCount = jobSkills.filter(s => resumeSet.has(s.toLowerCase())).length;

    return Math.round((matchCount / jobSkills.length) * 100);
}

// Detect experience level from text
function detectExperienceLevel(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('principal') ||
        lowerText.includes('10+ years') || lowerText.includes('8+ years')) {
        return 'senior';
    }
    if (lowerText.includes('junior') || lowerText.includes('entry') || lowerText.includes('intern') ||
        lowerText.includes('0-2 years') || lowerText.includes('1-2 years')) {
        return 'junior';
    }
    if (lowerText.includes('mid') || lowerText.includes('3-5 years') || lowerText.includes('2-4 years')) {
        return 'mid';
    }
    return 'any';
}

// Calculate experience level match
function calculateExperienceMatch(resumeText, jobDescription) {
    const resumeLevel = detectExperienceLevel(resumeText);
    const jobLevel = detectExperienceLevel(jobDescription);

    if (resumeLevel === jobLevel || jobLevel === 'any' || resumeLevel === 'any') {
        return 100;
    }

    // Close matches
    if ((resumeLevel === 'mid' && jobLevel === 'senior') || (resumeLevel === 'senior' && jobLevel === 'mid')) {
        return 70;
    }
    if ((resumeLevel === 'junior' && jobLevel === 'mid') || (resumeLevel === 'mid' && jobLevel === 'junior')) {
        return 60;
    }

    // Far matches
    return 30;
}

// Calculate title relevance
function calculateTitleRelevance(resumeText, jobTitle) {
    const lowerResume = resumeText.toLowerCase();
    const lowerTitle = jobTitle.toLowerCase();

    const titleWords = lowerTitle.split(/\s+/).filter(w => w.length > 2);
    const matchedWords = titleWords.filter(word => lowerResume.includes(word));

    if (titleWords.length === 0) return 50;
    return Math.round((matchedWords.length / titleWords.length) * 100);
}

// Fallback scoring without AI
function fallbackScoring(resumeText, job) {
    const resumeSkills = extractSkills(resumeText);
    const jobSkills = job.skills || extractSkills(job.description);

    const skillScore = calculateSkillOverlap(resumeSkills, jobSkills);
    const experienceScore = calculateExperienceMatch(resumeText, job.description);
    const titleScore = calculateTitleRelevance(resumeText, job.title);

    // Weighted average
    const score = Math.round(
        skillScore * 0.45 +
        experienceScore * 0.30 +
        titleScore * 0.25
    );

    // Generate detailed explanation
    const matchedSkills = jobSkills.filter(s =>
        resumeSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
    );

    const explanation = [];

    // Skills match
    if (matchedSkills.length > 0) {
        const skillsText = matchedSkills.slice(0, 5).join(', ');
        if (matchedSkills.length > 5) {
            explanation.push(`Strong match on ${matchedSkills.length} skills including ${skillsText}, and more`);
        } else if (matchedSkills.length > 2) {
            explanation.push(`Good skill alignment: ${skillsText}`);
        } else {
            explanation.push(`Matches key skills: ${skillsText}`);
        }
    } else if (jobSkills.length > 0) {
        explanation.push(`Limited skill overlap - consider learning ${jobSkills.slice(0, 2).join(', ')}`);
    }

    // Experience match
    if (experienceScore >= 80) {
        explanation.push('Your experience level is an excellent fit');
    } else if (experienceScore >= 60) {
        explanation.push('Experience aligns with requirements');
    } else if (experienceScore >= 40) {
        explanation.push('Some experience gap, but achievable with learning');
    }

    // Title match
    if (titleScore >= 70) {
        explanation.push('Job title closely matches your background');
    } else if (titleScore >= 50) {
        explanation.push('Related role to your experience');
    }

    // Overall score context
    if (score >= 80) {
        explanation.unshift('🎯 Excellent match!');
    } else if (score >= 60) {
        explanation.unshift('✓ Good match');
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        explanation: explanation.length > 0 ? explanation.join('. ') : 'This role could be a fit based on your profile',
        matchedSkills: matchedSkills,
        resumeSkills: resumeSkills.slice(0, 10)
    };
}

// Score job match using AI
export async function scoreJobMatch(resumeText, job) {
    // Try Gemini AI first, fallback to rule-based
    if (model) {
        try {
            return await geminiScoring(resumeText, job);
        } catch (error) {
            console.error('Gemini AI error, using fallback:', error.message || error);
            return fallbackScoring(resumeText, job);
        }
    }
    return fallbackScoring(resumeText, job);
}

// Gemini AI-powered job scoring
async function geminiScoring(resumeText, job) {
    const prompt = `You are a job matching expert. Score how well this resume matches the job posting on a scale of 0-100.

Resume:
${resumeText.substring(0, 2000)}

Job:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description.substring(0, 1000)}
Required Skills: ${job.skills.join(', ')}

Return ONLY a JSON object with this exact format (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "explanation": "<brief 1-sentence reason>",
  "matchedSkills": ["skill1", "skill2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
            score: Math.max(0, Math.min(100, parsed.score || 0)),
            explanation: parsed.explanation || 'AI-based matching',
            matchedSkills: parsed.matchedSkills || [],
            resumeSkills: extractSkills(resumeText).slice(0, 10)
        };
    }

    // Fallback if JSON parsing fails
    console.warn('Failed to parse Gemini response, using fallback');
    return fallbackScoring(resumeText, job);
}

// Score multiple jobs
export async function scoreJobsInBatch(resumeText, jobs) {
    const results = await Promise.all(
        jobs.map(async (job) => {
            const matchData = await scoreJobMatch(resumeText, job);
            return {
                ...job,
                matchScore: matchData.score,
                matchExplanation: matchData.explanation,
                matchedSkills: matchData.matchedSkills
            };
        })
    );

    return results;
}

// Process chat messages
export async function processChat(message, jobs, resumeText) {
    // Try Gemini AI for intelligent responses
    if (model) {
        try {
            return await geminiChat(message, jobs, resumeText);
        } catch (error) {
            console.error('Gemini chat error, using fallback:', error.message || error);
            return fallbackChat(message, jobs, resumeText);
        }
    }
    return fallbackChat(message, jobs, resumeText);
}

// Gemini AI-powered chat
async function geminiChat(message, jobs, resumeText) {
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

// Fallback chat without AI
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

    console.log(`[AI Chat Fallback] Processing message: "${message}"`);
    console.log(`[AI Chat Fallback] Total jobs available: ${jobs?.length || 0}`);

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

    // Job queries - filter jobs based on message
    let filteredJobs = [...jobs];

    // Remote jobs
    if (lowerMessage.includes('remote')) {
        filteredJobs = filteredJobs.filter(j => j.workMode === 'Remote');

    }

    // Skill-based queries
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

    // Senior/Junior roles
    if (lowerMessage.includes('senior')) {
        filteredJobs = filteredJobs.filter(j => j.title.toLowerCase().includes('senior'));
    }
    if (lowerMessage.includes('junior') || lowerMessage.includes('entry')) {
        filteredJobs = filteredJobs.filter(j =>
            j.title.toLowerCase().includes('junior') || j.title.toLowerCase().includes('intern')
        );
    }

    // This week
    if (lowerMessage.includes('this week') || lowerMessage.includes('recent')) {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filteredJobs = filteredJobs.filter(j => new Date(j.postedDate) > weekAgo);
    }

    // Highest match scores
    if (lowerMessage.includes('best match') || lowerMessage.includes('highest score') || lowerMessage.includes('top match')) {
        if (resumeText) {
            filteredJobs = await scoreJobsInBatch(resumeText, filteredJobs);
            filteredJobs = filteredJobs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
        }
    }

    // Generate response
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

initAI();
