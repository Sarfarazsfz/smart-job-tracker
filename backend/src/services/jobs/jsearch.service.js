import { config } from '../../config/index.js';
import { extractSkills } from '../ai/ai.service.js';
import { classifyJobUrl } from '../../utils/url.helper.js';

const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';

export async function fetchFromJSearch(filters) {
    if (!config.jobs.rapidApiKey) {
        console.log('No RapidAPI key, using mock data');
        return null;
    }

    try {
        const params = new URLSearchParams({
            query: filters.query || 'software developer',
            page: '1',
            num_pages: '1',
            date_posted: filters.datePosted || 'all'
        });

        // Default to India, but allow override with specific location filter
        const locationQuery = filters.location || 'India';
        params.append('location', locationQuery);

        if (filters.workMode === 'Remote') {
            params.append('remote_jobs_only', 'true');
        }

        const response = await fetch(`https://${JSEARCH_API_HOST}/search?${params}`, {
            headers: {
                'X-RapidAPI-Key': config.jobs.rapidApiKey,
                'X-RapidAPI-Host': JSEARCH_API_HOST
            }
        });

        if (!response.ok) {
            throw new Error(`JSearch API error: ${response.status}`);
        }

        const data = await response.json();
        return data.data?.map(transformJSearchJob) || [];
    } catch (error) {
        console.error('JSearch API error:', error);
        return null;
    }
}

function transformJSearchJob(job) {
    return {
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: job.job_city ? `${job.job_city}, ${job.job_state}` : job.job_country,
        workMode: job.job_is_remote ? 'Remote' : 'On-site',
        jobType: job.job_employment_type || 'Full-time',
        description: job.job_description,
        skills: extractSkills(job.job_description),
        salary: job.job_min_salary && job.job_max_salary
            ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
            : 'Not specified',
        postedDate: job.job_posted_at_datetime_utc,
        applyUrl: job.job_apply_link,
        source: 'jsearch',
        externalUrlType: classifyJobUrl(job.job_apply_link, 'jsearch'),
        companyLogo: job.employer_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.employer_name)}&background=random`
    };
}
