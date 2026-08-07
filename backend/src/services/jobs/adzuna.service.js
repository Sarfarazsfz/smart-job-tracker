import { config } from '../../config/index.js';
import { extractSkills } from '../ai/ai.service.js';
import { classifyJobUrl } from '../../utils/url.helper.js';

const ADZUNA_API_BASE = 'https://api.adzuna.com/v1/api/jobs/in/search';

export async function fetchFromAdzuna(filters) {
    if (!config.jobs.adzunaAppId || !config.jobs.adzunaAppKey) {
        console.log('No Adzuna credentials, trying alternative sources');
        return null;
    }

    try {
        const page = 1;
        const params = new URLSearchParams({
            app_id: config.jobs.adzunaAppId,
            app_key: config.jobs.adzunaAppKey,
            results_per_page: '50', // Exactly 50 jobs
            sort_by: 'date' // Newest first
        });

        // NOTE: Adzuna 'what' is an AND filter — long multi-keyword strings return 0 results.
        // Use a short, broad query. Verified: "software engineer developer" → 697 results.
        // Long keyword dumps (>4 words) consistently return 0 results from Adzuna /in/search.
        let searchQuery = filters.query || 'software engineer developer';

        // Do not expand the query when no user filter is active — it breaks AND-matching
        // User-specified queries (filters.query) are passed through as-is

        params.append('what', searchQuery);

        // Default to Bangalore for tech jobs, allow override
        const location = filters.location || 'Bangalore';
        params.append('where', location);

        if (filters.skills && filters.skills.length > 0) {
            const skillsQuery = filters.skills.join(' ');
            const currentWhat = params.get('what') || '';
            params.set('what', `${currentWhat} ${skillsQuery}`);
        }

        // Prioritize recent jobs (last 7 days by default for freshness)
        if (filters.datePosted && filters.datePosted !== 'all') {
            const daysMap = { 'day': '1', 'week': '7', 'month': '30' };
            if (daysMap[filters.datePosted]) {
                params.append('max_days_old', daysMap[filters.datePosted]);
            }
        } else {
            // Default: show jobs from last 30 days to keep feed fresh
            params.append('max_days_old', '30');
        }

        if (filters.jobType && filters.jobType !== 'all') {
            const jobTypeMap = {
                'full-time': 'full_time',
                'part-time': 'part_time',
                'contract': 'contract',
                'internship': 'contract'
            };
            const paramName = jobTypeMap[filters.jobType.toLowerCase()];
            if (paramName) {
                params.append(paramName, '1');
            }
        }

        if (filters.workMode === 'Remote') {
            const currentWhat = params.get('what') || '';
            params.set('what', `${currentWhat} remote`);
        }

        const url = `${ADZUNA_API_BASE}/${page}?${params}`;

        const searchWhat = params.get('what');
        console.log(`[Adzuna] Request started — query: "${searchWhat}", location: "${location}", max_days_old: ${params.get('max_days_old') ?? 'none'}`);

        const response = await fetch(url);

        console.log(`[Adzuna] HTTP status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Adzuna API error: ${response.status} — ${errData.exception || errData.error || response.statusText}`);
        }

        const data = await response.json();

        const jobs = data.results?.map(transformAdzunaJob) || [];

        console.log(`[Adzuna] Total available: ${data.count ?? '?'} | Fetched this page: ${jobs.length}`);

        if (jobs.length === 0) {
            console.warn(`[Adzuna] WARNING: 0 jobs returned. Check if query is too restrictive. count=${data.count ?? '?'}`);
        }

        // Sort by date to ensure newest first
        jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

        return jobs;
    } catch (error) {
        console.error('[Adzuna] Request failed:', error.message);
        return null;
    }
}

function transformAdzunaJob(job) {
    const description = job.description || '';
    const lowerDesc = description.toLowerCase();
    let workMode = 'On-site';

    if (lowerDesc.includes('remote') || lowerDesc.includes('work from home') ||
        lowerDesc.includes('wfh') || lowerDesc.includes('work anywhere')) {
        workMode = 'Remote';
    } else if (lowerDesc.includes('hybrid')) {
        workMode = 'Hybrid';
    }

    const contractTimeMap = {
        'full_time': 'Full-time',
        'part_time': 'Part-time',
        'contract': 'Contract',
        'permanent': 'Full-time'
    };
    const jobType = contractTimeMap[job.contract_time] || 'Full-time';

    // Format salary
    let salary = 'Competitive salary';
    if (job.salary_min && job.salary_max) {
        const formatINR = (amount) => {
            const lakhs = amount / 100000;
            return lakhs >= 1 ? `₹${lakhs.toFixed(2)}L` : `₹${(amount / 1000).toFixed(0)}K`;
        };
        salary = `${formatINR(job.salary_min)} - ${formatINR(job.salary_max)}`;
    } else if (job.salary_min) {
        const lakhs = job.salary_min / 100000;
        salary = lakhs >= 1 ? `₹${lakhs.toFixed(2)}L+` : `₹${(job.salary_min / 1000).toFixed(0)}K+`;
    }

    const location = job.location?.display_name ||
        (job.location?.area ? job.location.area.join(', ') : 'India');
    const company = job.company?.display_name || 'Company';

    // Fix date formatting - calculate proper posted date
    let postedDate = new Date().toISOString();
    if (job.created) {
        try {
            const createdDate = new Date(job.created);
            // If date is in the future or invalid, use current date
            if (createdDate <= new Date()) {
                postedDate = createdDate.toISOString();
            }
        } catch (e) {
            console.warn('Invalid date format:', job.created);
        }
    }
    
    return {
        id: job.id || `adzuna-${Date.now()}-${Math.random()}`,
        title: job.title,
        company: company,
        location: location,
        workMode: workMode,
        jobType: jobType,
        description: job.description || 'No description available',
        skills: extractSkills(job.description || ''),
        salary: salary,
        postedDate: postedDate,
        applyUrl: job.redirect_url || '#',
        source: 'adzuna',
        externalUrlType: classifyJobUrl(job.redirect_url, 'adzuna'),
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=random`
    };
}
