import * as repository from './jobs.repository.js';
import { fetchFromAdzuna } from '../../services/jobs/adzuna.service.js';
import { fetchFromJSearch } from '../../services/jobs/jsearch.service.js';
import { MOCK_JOBS } from '../../data/mockJobs.js';
import { scoreJobsInBatch } from '../../services/ai/ai.service.js';
import { getResume } from '../resume/resume.repository.js';
import { paginate } from '../../utils/pagination.js';

export async function fetchJobs(filters = {}) {
    const hasFilters = filters.query || filters.location ||
        (filters.skills && filters.skills.length > 0) ||
        (filters.datePosted && filters.datePosted !== 'all') ||
        (filters.jobType && filters.jobType !== 'all') ||
        (filters.workMode && filters.workMode !== 'all');

    const cacheKey = hasFilters
        ? `all:${JSON.stringify(filters)}`
        : 'all';

    const cached = await repository.getCachedJobsData(cacheKey);
    if (cached) {
        console.log(`✅ Cache HIT for jobs:${cacheKey.substring(0, 50)}...`);
        return cached;
    }

    console.log(`❌ Cache MISS for jobs:${cacheKey.substring(0, 50)}... - Fetching fresh data`);

    let jobs = null;

    if (process.env.NODE_ENV === 'test') {
        jobs = applyFilters(MOCK_JOBS, filters);
    } else {
        jobs = await fetchFromAdzuna(filters);

        if (!jobs || jobs.length === 0) {
            jobs = await fetchFromJSearch(filters);
        }

        if (!jobs || jobs.length === 0) {
            console.log('Using mock data as fallback');
            jobs = applyFilters(MOCK_JOBS, filters);
        }
    }

    await repository.cacheJobsData(cacheKey, jobs, 3600);
    console.log(`📦 Cached ${jobs.length} jobs for 1 hour`);

    return jobs;
}

export function applyFilters(jobs, filters) {
    return jobs.filter(job => {
        if (filters.query) {
            const query = filters.query.toLowerCase();
            if (!job.title.toLowerCase().includes(query) &&
                !job.description.toLowerCase().includes(query) &&
                !job.company.toLowerCase().includes(query)) {
                return false;
            }
        }

        if (filters.skills && filters.skills.length > 0) {
            const jobSkills = job.skills.map(s => s.toLowerCase());
            const hasSkill = filters.skills.some(s =>
                jobSkills.some(js => js.includes(s.toLowerCase()))
            );
            if (!hasSkill) return false;
        }

        if (filters.datePosted && filters.datePosted !== 'all') {
            const jobDate = new Date(job.postedDate);
            const now = new Date();
            const daysDiff = (now - jobDate) / (1000 * 60 * 60 * 24);

            if (filters.datePosted === 'day' && daysDiff > 1) return false;
            if (filters.datePosted === 'week' && daysDiff > 7) return false;
            if (filters.datePosted === 'month' && daysDiff > 30) return false;
        }

        if (filters.jobType && filters.jobType !== 'all') {
            if (job.jobType.toLowerCase() !== filters.jobType.toLowerCase()) {
                return false;
            }
        }

        if (filters.workMode && filters.workMode !== 'all') {
            if (job.workMode.toLowerCase() !== filters.workMode.toLowerCase()) {
                return false;
            }
        }

        if (filters.location) {
            if (!job.location.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }
        }

        return true;
    });
}

export async function getJobsFilteredAndPaginated(filters, userId, page, limit, minScore) {
    let jobs = await fetchJobs({}); // Get all cached jobs

    jobs = applyFilters(jobs, filters);

    const resume = await getResume(userId);
    if (resume && resume.text) {
        jobs = await scoreJobsInBatch(resume.text, jobs);

        jobs = jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

        if (minScore) {
            const minScoreNum = parseInt(minScore);
            jobs = jobs.filter(j => (j.matchScore || 0) >= minScoreNum);
        }
    }

    const { paginatedItems, metadata } = paginate(jobs, page, limit);

    return {
        jobs: paginatedItems,
        total: jobs.length, // total before pagination
        hasResume: !!resume,
        ...(metadata && { pagination: metadata }) // Add pagination object if applied
    };
}

export async function getSingleJob(id, userId) {
    // Search the full job list (from cache/providers), not just mock data
    const allJobs = await fetchJobs({});
    const job = allJobs.find(j => j.id === id);

    if (!job) {
        return null;
    }

    const resume = await getResume(userId);
    if (resume && resume.text) {
        const scored = await scoreJobsInBatch(resume.text, [job]);
        return scored[0];
    }

    return job;
}

export async function getBestMatches(userId, limit = 8) {
    const resume = await getResume(userId);
    if (!resume || !resume.text) {
        return {
            jobs: [],
            message: 'Upload a resume to see your best matches'
        };
    }

    let jobs = await fetchJobs({});
    jobs = await scoreJobsInBatch(resume.text, jobs);

    jobs = jobs.filter(job => (job.matchScore || 0) > 70);

    const bestMatches = jobs
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            const dateA = new Date(a.postedDate);
            const dateB = new Date(b.postedDate);
            return dateB - dateA;
        })
        .slice(0, parseInt(limit));

    return {
        jobs: bestMatches,
        hasResume: true
    };
}

export async function clearCache() {
    await repository.clearJobsCacheData();
}
