import OpenAI from 'openai';

let openai = null;

// Initialize OpenAI client
export function initAI() {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        console.log('OpenAI initialized');
        return true;
    }
    console.log('No OpenAI API key configured, using fallback scoring');
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

    // Generate explanation
    const matchedSkills = jobSkills.filter(s =>
        resumeSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
    );

    const explanation = [];
    if (matchedSkills.length > 0) {
        explanation.push(`Matching skills: ${matchedSkills.join(', ')}`);
    }
    if (experienceScore >= 70) {
        explanation.push('Experience level aligns well');
    }
    if (titleScore >= 60) {
        explanation.push('Job title matches your profile');
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        explanation: explanation.length > 0 ? explanation.join('. ') : 'Based on general keyword matching',
        matchedSkills: matchedSkills,
        resumeSkills: resumeSkills.slice(0, 10)
    };
}

// Score job match using AI
export async function scoreJobMatch(resumeText, job) {
    // Always use fallback for speed in this demo
    // AI can be slow for many jobs
    return fallbackScoring(resumeText, job);

    // AI-powered scoring (can be enabled for more accuracy)
    /*
    if (!openai) {
      return fallbackScoring(resumeText, job);
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a job matching expert. Score how well a resume matches a job posting.
              Return JSON: { "score": 0-100, "explanation": "brief reason", "matchedSkills": ["skill1", "skill2"] }`
          },
          {
            role: 'user',
            content: `Resume:\n${resumeText.substring(0, 2000)}\n\nJob:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description.substring(0, 1000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });
      
      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('AI scoring error:', error);
      return fallbackScoring(resumeText, job);
    }
    */
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
    const lowerMessage = message.toLowerCase();

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
                filteredJobs = filteredJobs.filter(j =>
                    j.skills.some(s => s.toLowerCase().includes(skill)) ||
                    j.description.toLowerCase().includes(skill)
                );
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
