import { getCachedJobs, cacheJobs } from './redisService.js';

// Adzuna API configuration (Primary for India jobs)
const ADZUNA_API_BASE = 'https://api.adzuna.com/v1/api/jobs/in/search';
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

// JSearch API configuration (Secondary fallback)
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';
const JSEARCH_API_KEY = process.env.RAPIDAPI_KEY;

// Mock jobs data for development/demo - India locations
const MOCK_JOBS = [
    {
        id: 'job-1',
        title: 'Senior React Developer',
        company: 'TechCorp India',
        location: 'Bangalore, Karnataka',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'We are looking for a Senior React Developer with 5+ years of experience. You will be working on our flagship product using React, TypeScript, Redux, and Node.js. Experience with AWS and CI/CD pipelines is a plus.',
        skills: ['React', 'TypeScript', 'Redux', 'Node.js', 'AWS'],
        salary: '₹25,00,000 - ₹35,00,000',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Senior%20React%20Developer',
        companyLogo: 'https://ui-avatars.com/api/?name=TC&background=6366f1&color=fff'
    },
    {
        id: 'job-2',
        title: 'Full Stack Engineer',
        company: 'StartupHub',
        location: 'Hyderabad, Telangana',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        description: 'Join our fast-growing startup as a Full Stack Engineer. We use Python, Django, React, and PostgreSQL. You\'ll work on building new features and scaling our platform. Experience with Docker and Kubernetes preferred.',
        skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
        salary: '₹18,00,000 - ₹28,00,000',
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.naukri.com/jobs?q=Full+Stack+Engineer',
        companyLogo: 'https://ui-avatars.com/api/?name=SH&background=10b981&color=fff'
    },
    {
        id: 'job-3',
        title: 'Frontend Developer',
        company: 'DesignStudio India',
        location: 'Mumbai, Maharashtra',
        workMode: 'On-site',
        jobType: 'Full-time',
        description: 'Creative agency seeking a Frontend Developer with strong CSS skills. Must have experience with Vue.js or React, animations, and responsive design. Figma experience required.',
        skills: ['React', 'Vue.js', 'CSS', 'Figma', 'JavaScript'],
        salary: '₹12,00,000 - ₹18,00,000',
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Frontend+Developer',
        companyLogo: 'https://ui-avatars.com/api/?name=DS&background=f59e0b&color=fff'
    },
    {
        id: 'job-4',
        title: 'Backend Developer - Node.js',
        company: 'CloudServices India',
        location: 'Pune, Maharashtra',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'Looking for a Backend Developer proficient in Node.js and microservices architecture. Experience with MongoDB, Redis, and message queues (RabbitMQ/Kafka) required. AWS experience is a must.',
        skills: ['Node.js', 'MongoDB', 'Redis', 'AWS', 'Microservices'],
        salary: '₹20,00,000 - ₹30,00,000',
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.naukri.com/jobs?q=Backend+Developer+Node.js',
        companyLogo: 'https://ui-avatars.com/api/?name=CS&background=8b5cf6&color=fff'
    },
    {
        id: 'job-5',
        title: 'Junior Python Developer',
        company: 'DataTech Solutions',
        location: 'Chennai, Tamil Nadu',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        description: 'Entry-level position for Python developers. Will work on data pipelines and automation scripts. Knowledge of pandas, numpy, and SQL is beneficial. Great opportunity to learn machine learning.',
        skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Git'],
        salary: '₹6,00,000 - ₹10,00,000',
        postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.naukri.com/jobs?q=Junior+Python+Developer',
        companyLogo: 'https://ui-avatars.com/api/?name=DT&background=ec4899&color=fff'
    },
    {
        id: 'job-6',
        title: 'DevOps Engineer',
        company: 'InfraCloud Systems',
        location: 'Bangalore, Karnataka',
        workMode: 'Remote',
        jobType: 'Contract',
        description: 'DevOps Engineer needed for cloud infrastructure management. Must have strong experience with Terraform, Kubernetes, and CI/CD pipelines. AWS or GCP certification preferred.',
        skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'Jenkins'],
        salary: '₹22,00,000 - ₹32,00,000',
        postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=DevOps+Engineer',
        companyLogo: 'https://ui-avatars.com/api/?name=IC&background=14b8a6&color=fff'
    },
    {
        id: 'job-7',
        title: 'UX Designer',
        company: 'ProductFirst Design',
        location: 'Gurgaon, Haryana',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        description: 'UX Designer with strong Figma skills needed. Create user flows, wireframes, and prototypes. Experience with design systems and user research required. Work closely with developers.',
        skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research', 'Design Systems'],
        salary: '₹15,00,000 - ₹22,00,000',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=UX+Designer',
        companyLogo: 'https://ui-avatars.com/api/?name=PF&background=f43f5e&color=fff'
    },
    {
        id: 'job-8',
        title: 'Machine Learning Engineer',
        company: 'AI Innovations India',
        location: 'Hyderabad, Telangana',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'ML Engineer to develop and deploy machine learning models. Strong Python, TensorFlow/PyTorch experience required. Experience with NLP and computer vision is a plus.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP'],
        salary: '₹28,00,000 - ₹40,00,000',
        postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.naukri.com/jobs?q=Machine+Learning+Engineer',
        companyLogo: 'https://ui-avatars.com/api/?name=AI&background=3b82f6&color=fff'
    },
    {
        id: 'job-9',
        title: 'React Native Developer',
        company: 'MobileFirst Apps',
        location: 'Noida, Uttar Pradesh',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'Build cross-platform mobile apps using React Native. Experience with Redux, TypeScript, and native module development. iOS and Android publishing experience required.',
        skills: ['React Native', 'TypeScript', 'Redux', 'iOS', 'Android'],
        salary: '₹16,00,000 - ₹24,00,000',
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.naukri.com/jobs?q=React+Native+Developer',
        companyLogo: 'https://ui-avatars.com/api/?name=MF&background=84cc16&color=fff'
    },
    {
        id: 'job-10',
        title: 'Data Engineer',
        company: 'BigData Corp',
        location: 'Kolkata, West Bengal',
        workMode: 'On-site',
        jobType: 'Full-time',
        description: 'Data Engineer to build and maintain data pipelines. Experience with Spark, Airflow, and cloud data warehouses (Snowflake/BigQuery) required. SQL expertise is a must.',
        skills: ['Python', 'Spark', 'Airflow', 'SQL', 'Snowflake'],
        salary: '₹18,00,000 - ₹26,00,000',
        postedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Data+Engineer',
        companyLogo: 'https://ui-avatars.com/api/?name=BD&background=0891b2&color=fff'
    },
    {
        id: 'job-11',
        title: 'Software Engineering Intern',
        company: 'TechStart',
        location: 'Pune, Maharashtra',
        workMode: 'Hybrid',
        jobType: 'Internship',
        description: 'Summer internship for CS students. Work on real projects with React and Node.js. Mentorship provided. Great learning opportunity for aspiring developers.',
        skills: ['JavaScript', 'React', 'Node.js', 'Git', 'Problem Solving'],
        salary: '₹25,000/month',
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.internshala.com/jobs?q=Software+Engineering+Intern',
        companyLogo: 'https://ui-avatars.com/api/?name=TS&background=7c3aed&color=fff'
    },
    {
        id: 'job-12',
        title: 'Senior Backend Developer - Java',
        company: 'Enterprise Solutions',
        location: 'Ahmedabad, Gujarat',
        workMode: 'On-site',
        jobType: 'Full-time',
        description: 'Senior Java developer for enterprise applications. Experience with Spring Boot, microservices, and Oracle/PostgreSQL databases required. Leadership experience preferred.',
        skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Oracle'],
        salary: '₹22,00,000 - ₹32,00,000',
        postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.naukri.com/jobs?q=Senior+Backend+Developer+Java',
        companyLogo: 'https://ui-avatars.com/api/?name=ES&background=059669&color=fff'
    },
    {
        id: 'job-13',
        title: 'Part-time Web Developer',
        company: 'LocalBusiness India',
        location: 'Jaipur, Rajasthan',
        workMode: 'Remote',
        jobType: 'Part-time',
        description: 'Part-time web developer to maintain and update company websites. WordPress and basic HTML/CSS/JS skills needed. Flexible hours, 20 hours per week.',
        skills: ['WordPress', 'HTML', 'CSS', 'JavaScript', 'PHP'],
        salary: '₹500/hour',
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.naukri.com/jobs?q=Part+Time+Web+Developer',
        companyLogo: 'https://ui-avatars.com/api/?name=LB&background=d946ef&color=fff'
    },
    {
        id: 'job-14',
        title: 'Golang Developer',
        company: 'HighPerformance Tech',
        location: 'Bangalore, Karnataka',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'Backend developer specializing in Go. Build high-performance APIs and microservices. Experience with gRPC, Kubernetes, and distributed systems required.',
        skills: ['Go', 'gRPC', 'Kubernetes', 'Docker', 'PostgreSQL'],
        salary: '₹20,00,000 - ₹28,00,000',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Golang+Developer',
        companyLogo: 'https://ui-avatars.com/api/?name=HP&background=06b6d4&color=fff'
    },
    {
        id: 'job-15',
        title: 'Technical Lead - Frontend',
        company: 'ScaleUp Technologies',
        location: 'Delhi NCR, Delhi',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        description: 'Technical Lead for frontend team. Lead a team of 5 developers building React applications. Architecture decisions, code reviews, and mentoring. 8+ years experience required.',
        skills: ['React', 'TypeScript', 'Leadership', 'Architecture', 'Mentoring'],
        salary: '₹30,00,000 - ₹45,00,000',
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://www.naukri.com/jobs?q=Technical+Lead+Frontend',
        companyLogo: 'https://ui-avatars.com/api/?name=SU&background=ea580c&color=fff'
    }
];

// Fetch jobs from Adzuna API
async function fetchFromAdzuna(filters) {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
        console.log('No Adzuna credentials, trying alternative sources');
        return null;
    }

    try {
        const page = 1;
        const params = new URLSearchParams({
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY,
            results_per_page: '50', // Exactly 50 jobs
            sort_by: 'date' // Newest first
        });

        // Default tech-focused search query for Bangalore
        let searchQuery = filters.query || 'software engineer developer';

        // Add tech keywords if no specific query
        if (!filters.query) {
            searchQuery = 'software engineer developer full stack frontend backend react python java';
        }

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

        console.log(`🔍 Fetching from Adzuna: ${location} tech jobs (max 50)`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Adzuna API error: ${response.status}`);
        }

        const data = await response.json();

        const jobs = data.results?.map(transformAdzunaJob) || [];
        console.log(`✅ Fetched ${jobs.length} jobs from Adzuna`);

        // Sort by date to ensure newest first
        jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

        return jobs;
    } catch (error) {
        console.error('Adzuna API error:', error);
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
        skills: extractSkillsFromDescription(job.description || ''),
        salary: salary,
        postedDate: postedDate,
        applyUrl: job.redirect_url || '#',
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=random`
    };
}

// Fetch jobs from JSearch API
async function fetchFromJSearch(filters) {
    if (!JSEARCH_API_KEY) {
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
                'X-RapidAPI-Key': JSEARCH_API_KEY,
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
        skills: extractSkillsFromDescription(job.job_description),
        salary: job.job_min_salary && job.job_max_salary
            ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
            : 'Not specified',
        postedDate: job.job_posted_at_datetime_utc,
        applyUrl: job.job_apply_link,
        companyLogo: job.employer_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.employer_name)}&background=random`
    };
}

function extractSkillsFromDescription(description) {
    const skillKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#',
        'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
        'Spring Boot', 'Ruby on Rails', 'PHP', 'Laravel',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
        'GraphQL', 'REST', 'gRPC', 'Microservices',
        'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
        'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP',
        'Figma', 'UI/UX', 'CSS', 'HTML', 'Sass',
        'Agile', 'Scrum', 'Leadership'
    ];

    const found = [];
    const lowerDesc = description.toLowerCase();

    for (const skill of skillKeywords) {
        if (lowerDesc.includes(skill.toLowerCase())) {
            found.push(skill);
        }
    }

    return found.slice(0, 8); // Limit to 8 skills
}

// Apply filters to jobs
function applyFilters(jobs, filters) {
    return jobs.filter(job => {
        // Title/query filter
        if (filters.query) {
            const query = filters.query.toLowerCase();
            if (!job.title.toLowerCase().includes(query) &&
                !job.description.toLowerCase().includes(query) &&
                !job.company.toLowerCase().includes(query)) {
                return false;
            }
        }

        // Skills filter
        if (filters.skills && filters.skills.length > 0) {
            const jobSkills = job.skills.map(s => s.toLowerCase());
            const hasSkill = filters.skills.some(s =>
                jobSkills.some(js => js.includes(s.toLowerCase()))
            );
            if (!hasSkill) return false;
        }

        // Date posted filter
        if (filters.datePosted && filters.datePosted !== 'all') {
            const jobDate = new Date(job.postedDate);
            const now = new Date();
            const daysDiff = (now - jobDate) / (1000 * 60 * 60 * 24);

            if (filters.datePosted === 'day' && daysDiff > 1) return false;
            if (filters.datePosted === 'week' && daysDiff > 7) return false;
            if (filters.datePosted === 'month' && daysDiff > 30) return false;
        }

        // Job type filter
        if (filters.jobType && filters.jobType !== 'all') {
            if (job.jobType.toLowerCase() !== filters.jobType.toLowerCase()) {
                return false;
            }
        }

        // Work mode filter
        if (filters.workMode && filters.workMode !== 'all') {
            if (job.workMode.toLowerCase() !== filters.workMode.toLowerCase()) {
                return false;
            }
        }

        // Location filter
        if (filters.location) {
            if (!job.location.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }
        }

        return true;
    });
}

export async function fetchJobs(filters = {}) {
    // Create a more structured cache key
    // Use 'jobs:all' as base key, append filter hash only if filters are applied
    const hasFilters = filters.query || filters.location ||
        (filters.skills && filters.skills.length > 0) ||
        (filters.datePosted && filters.datePosted !== 'all') ||
        (filters.jobType && filters.jobType !== 'all') ||
        (filters.workMode && filters.workMode !== 'all');

    const cacheKey = hasFilters
        ? `all:${JSON.stringify(filters)}`
        : 'all';

    // Check cache first (1 hour TTL to reduce API calls)
    const cached = await getCachedJobs(cacheKey);
    if (cached) {
        console.log(`✅ Cache HIT for jobs:${cacheKey.substring(0, 50)}...`);
        return cached;
    }

    console.log(`❌ Cache MISS for jobs:${cacheKey.substring(0, 50)}... - Fetching fresh data`);

    let jobs = null;

    // Priority 1: Try Adzuna API (Primary for India jobs)
    jobs = await fetchFromAdzuna(filters);

    // Priority 2: Try JSearch API (Secondary fallback)
    if (!jobs || jobs.length === 0) {
        jobs = await fetchFromJSearch(filters);
    }

    // Priority 3: Fallback to mock data
    if (!jobs || jobs.length === 0) {
        console.log('Using mock data as fallback');
        jobs = applyFilters(MOCK_JOBS, filters);
    }

    // Cache results (1 hour = 3600 seconds)
    // This dramatically reduces API calls and improves performance
    await cacheJobs(cacheKey, jobs, 3600);
    console.log(`📦 Cached ${jobs.length} jobs for 1 hour`);

    return jobs;
}


export function getMockJobs() {
    return MOCK_JOBS;
}

export { applyFilters };
