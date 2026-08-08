import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../../config/index.js';

let genAI = null;
let model = null;
let openai = null;
let aiProvider = null; // 'gemini', 'openai', or null

// Initialize AI providers (Gemini primary, OpenAI backup)
export function initAI() {
    // Try Gemini first
    if (config.ai.geminiKey) {
        try {
            genAI = new GoogleGenerativeAI(config.ai.geminiKey);
            model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
            aiProvider = 'gemini';
            console.log('Google Gemini AI initialized (gemini-3.6-flash)');

            // Also initialize OpenAI as backup if available
            if (config.ai.openAiKey) {
                openai = new OpenAI({ apiKey: config.ai.openAiKey });
                console.log('OpenAI initialized as backup (gpt-3.5-turbo)');
            }
            return true;
        } catch (error) {
            console.error('Gemini initialization failed:', error.message);
        }
    }

    // Fallback to OpenAI if Gemini not available
    if (config.ai.openAiKey) {
        try {
            openai = new OpenAI({ apiKey: config.ai.openAiKey });
            aiProvider = 'openai';
            console.log('OpenAI initialized as primary (gpt-3.5-turbo)');
            return true;
        } catch (error) {
            console.error('OpenAI initialization failed:', error.message);
        }
    }

    console.log('No AI providers configured, using rule-based fallback');
    return false;
}

export function getAIProvider() {
    return { aiProvider, model, openai };
}

// Common tech skills for matching
export const SKILL_CATEGORIES = {
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

// Initialize on load
initAI();

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

// Score job match using AI (Gemini → OpenAI → Rule-based fallback)
export async function scoreJobMatch(resumeText, job) {
    // Try Gemini AI first
    if (aiProvider === 'gemini' && model) {
        try {
            return await geminiScoring(resumeText, job);
        } catch (error) {
            console.error('Gemini AI error, trying OpenAI:', error.message || error);
            // Try OpenAI as backup
            if (openai) {
                try {
                    return await openaiScoring(resumeText, job);
                } catch (openaiError) {
                    console.error('OpenAI error, using fallback:', openaiError.message);
                    return fallbackScoring(resumeText, job);
                }
            }
            return fallbackScoring(resumeText, job);
        }
    }

    // Try OpenAI if it's the primary provider
    if (aiProvider === 'openai' && openai) {
        try {
            return await openaiScoring(resumeText, job);
        } catch (error) {
            console.error('OpenAI error, using fallback:', error.message || error);
            return fallbackScoring(resumeText, job);
        }
    }

    // No AI providers available, use rule-based
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

// OpenAI-powered job scoring
async function openaiScoring(resumeText, job) {
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

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200
    });

    const text = completion.choices[0].message.content;

    // Parse JSON from response
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
    console.warn('Failed to parse OpenAI response, using fallback');
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
