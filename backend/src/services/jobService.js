import { getCachedJobs, cacheJobs } from './redisService.js';

// JSearch API configuration
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';
const JSEARCH_API_KEY = process.env.RAPIDAPI_KEY;

// Mock jobs data for development/demo
const MOCK_JOBS = [
    {
        id: 'job-1',
        title: 'Senior React Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'We are looking for a Senior React Developer with 5+ years of experience. You will be working on our flagship product using React, TypeScript, Redux, and Node.js. Experience with AWS and CI/CD pipelines is a plus.',
        skills: ['React', 'TypeScript', 'Redux', 'Node.js', 'AWS'],
        salary: '$150,000 - $180,000',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-1',
        companyLogo: 'https://ui-avatars.com/api/?name=TC&background=6366f1&color=fff'
    },
    {
        id: 'job-2',
        title: 'Full Stack Engineer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        description: 'Join our fast-growing startup as a Full Stack Engineer. We use Python, Django, React, and PostgreSQL. You\'ll work on building new features and scaling our platform. Experience with Docker and Kubernetes preferred.',
        skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
        salary: '$120,000 - $150,000',
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-2',
        companyLogo: 'https://ui-avatars.com/api/?name=SX&background=10b981&color=fff'
    },
    {
        id: 'job-3',
        title: 'Frontend Developer',
        company: 'DesignStudio',
        location: 'Austin, TX',
        workMode: 'On-site',
        jobType: 'Full-time',
        description: 'Creative agency seeking a Frontend Developer with strong CSS skills. Must have experience with Vue.js or React, animations, and responsive design. Figma experience required.',
        skills: ['React', 'Vue.js', 'CSS', 'Figma', 'JavaScript'],
        salary: '$90,000 - $120,000',
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-3',
        companyLogo: 'https://ui-avatars.com/api/?name=DS&background=f59e0b&color=fff'
    },
    {
        id: 'job-4',
        title: 'Backend Developer - Node.js',
        company: 'CloudServices Co',
        location: 'Seattle, WA',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'Looking for a Backend Developer proficient in Node.js and microservices architecture. Experience with MongoDB, Redis, and message queues (RabbitMQ/Kafka) required. AWS experience is a must.',
        skills: ['Node.js', 'MongoDB', 'Redis', 'AWS', 'Microservices'],
        salary: '$130,000 - $160,000',
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-4',
        companyLogo: 'https://ui-avatars.com/api/?name=CS&background=8b5cf6&color=fff'
    },
    {
        id: 'job-5',
        title: 'Junior Python Developer',
        company: 'DataTech Analytics',
        location: 'Chicago, IL',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        description: 'Entry-level position for Python developers. Will work on data pipelines and automation scripts. Knowledge of pandas, numpy, and SQL is beneficial. Great opportunity to learn machine learning.',
        skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Git'],
        salary: '$70,000 - $90,000',
        postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-5',
        companyLogo: 'https://ui-avatars.com/api/?name=DT&background=ec4899&color=fff'
    },
    {
        id: 'job-6',
        title: 'DevOps Engineer',
        company: 'InfraCloud',
        location: 'Denver, CO',
        workMode: 'Remote',
        jobType: 'Contract',
        description: 'DevOps Engineer needed for cloud infrastructure management. Must have strong experience with Terraform, Kubernetes, and CI/CD pipelines. AWS or GCP certification preferred.',
        skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'Jenkins'],
        salary: '$140,000 - $170,000',
        postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-6',
        companyLogo: 'https://ui-avatars.com/api/?name=IC&background=14b8a6&color=fff'
    },
    {
        id: 'job-7',
        title: 'UX Designer',
        company: 'ProductFirst',
        location: 'Los Angeles, CA',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        description: 'UX Designer with strong Figma skills needed. Create user flows, wireframes, and prototypes. Experience with design systems and user research required. Work closely with developers.',
        skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research', 'Design Systems'],
        salary: '$100,000 - $130,000',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-7',
        companyLogo: 'https://ui-avatars.com/api/?name=PF&background=f43f5e&color=fff'
    },
    {
        id: 'job-8',
        title: 'Machine Learning Engineer',
        company: 'AI Innovations',
        location: 'Boston, MA',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'ML Engineer to develop and deploy machine learning models. Strong Python, TensorFlow/PyTorch experience required. Experience with NLP and computer vision is a plus.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP'],
        salary: '$160,000 - $200,000',
        postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-8',
        companyLogo: 'https://ui-avatars.com/api/?name=AI&background=3b82f6&color=fff'
    },
    {
        id: 'job-9',
        title: 'React Native Developer',
        company: 'MobileFirst Apps',
        location: 'Miami, FL',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'Build cross-platform mobile apps using React Native. Experience with Redux, TypeScript, and native module development. iOS and Android publishing experience required.',
        skills: ['React Native', 'TypeScript', 'Redux', 'iOS', 'Android'],
        salary: '$110,000 - $140,000',
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-9',
        companyLogo: 'https://ui-avatars.com/api/?name=MF&background=84cc16&color=fff'
    },
    {
        id: 'job-10',
        title: 'Data Engineer',
        company: 'BigData Corp',
        location: 'Atlanta, GA',
        workMode: 'On-site',
        jobType: 'Full-time',
        description: 'Data Engineer to build and maintain data pipelines. Experience with Spark, Airflow, and cloud data warehouses (Snowflake/BigQuery) required. SQL expertise is a must.',
        skills: ['Python', 'Spark', 'Airflow', 'SQL', 'Snowflake'],
        salary: '$125,000 - $155,000',
        postedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-10',
        companyLogo: 'https://ui-avatars.com/api/?name=BD&background=0891b2&color=fff'
    },
    {
        id: 'job-11',
        title: 'Software Engineering Intern',
        company: 'TechStart',
        location: 'San Jose, CA',
        workMode: 'Hybrid',
        jobType: 'Internship',
        description: 'Summer internship for CS students. Work on real projects with React and Node.js. Mentorship provided. Great learning opportunity for aspiring developers.',
        skills: ['JavaScript', 'React', 'Node.js', 'Git', 'Problem Solving'],
        salary: '$30/hour',
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-11',
        companyLogo: 'https://ui-avatars.com/api/?name=TS&background=7c3aed&color=fff'
    },
    {
        id: 'job-12',
        title: 'Senior Backend Developer - Java',
        company: 'Enterprise Solutions',
        location: 'Dallas, TX',
        workMode: 'On-site',
        jobType: 'Full-time',
        description: 'Senior Java developer for enterprise applications. Experience with Spring Boot, microservices, and Oracle/PostgreSQL databases required. Leadership experience preferred.',
        skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Oracle'],
        salary: '$140,000 - $175,000',
        postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-12',
        companyLogo: 'https://ui-avatars.com/api/?name=ES&background=059669&color=fff'
    },
    {
        id: 'job-13',
        title: 'Part-time Web Developer',
        company: 'LocalBusiness Co',
        location: 'Phoenix, AZ',
        workMode: 'Remote',
        jobType: 'Part-time',
        description: 'Part-time web developer to maintain and update company websites. WordPress and basic HTML/CSS/JS skills needed. Flexible hours, 20 hours per week.',
        skills: ['WordPress', 'HTML', 'CSS', 'JavaScript', 'PHP'],
        salary: '$35/hour',
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-13',
        companyLogo: 'https://ui-avatars.com/api/?name=LB&background=d946ef&color=fff'
    },
    {
        id: 'job-14',
        title: 'Golang Developer',
        company: 'HighPerformance Tech',
        location: 'Portland, OR',
        workMode: 'Remote',
        jobType: 'Full-time',
        description: 'Backend developer specializing in Go. Build high-performance APIs and microservices. Experience with gRPC, Kubernetes, and distributed systems required.',
        skills: ['Go', 'gRPC', 'Kubernetes', 'Docker', 'PostgreSQL'],
        salary: '$135,000 - $165,000',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-14',
        companyLogo: 'https://ui-avatars.com/api/?name=HP&background=06b6d4&color=fff'
    },
    {
        id: 'job-15',
        title: 'Technical Lead - Frontend',
        company: 'ScaleUp Inc',
        location: 'Washington, DC',
        workMode: 'Hybrid',
        jobType: 'Full-time',
        description: 'Technical Lead for frontend team. Lead a team of 5 developers building React applications. Architecture decisions, code reviews, and mentoring. 8+ years experience required.',
        skills: ['React', 'TypeScript', 'Leadership', 'Architecture', 'Mentoring'],
        salary: '$170,000 - $200,000',
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        applyUrl: 'https://example.com/apply/job-15',
        companyLogo: 'https://ui-avatars.com/api/?name=SU&background=ea580c&color=fff'
    }
];

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

        if (filters.location) {
            params.append('location', filters.location);
        }

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
    // Check cache first
    const cacheKey = JSON.stringify(filters);
    const cached = await getCachedJobs(cacheKey);
    if (cached) {
        console.log('Returning cached jobs');
        return cached;
    }

    // Try to fetch from API
    let jobs = await fetchFromJSearch(filters);

    // Fallback to mock data
    if (!jobs || jobs.length === 0) {
        jobs = applyFilters(MOCK_JOBS, filters);
    }

    // Cache results
    await cacheJobs(cacheKey, jobs, 300); // 5 minute cache

    return jobs;
}

export function getMockJobs() {
    return MOCK_JOBS;
}

export { applyFilters };
