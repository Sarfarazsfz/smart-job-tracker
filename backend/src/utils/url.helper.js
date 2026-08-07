export function classifyJobUrl(url, source) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return 'unknown';
    }

    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname.toLowerCase();
        const pathname = parsedUrl.pathname.toLowerCase();
        const search = parsedUrl.search.toLowerCase();

        // Safe demo mock urls
        if (source === 'mock' || hostname.includes('demo.jobmatch.ai')) {
            return 'demo';
        }

        // Specific provider handling
        if (source === 'adzuna') {
            return 'aggregator';
        }

        // LinkedIn Handling
        if (hostname.includes('linkedin.com')) {
            // Direct job posting view
            if (pathname.includes('/jobs/view/')) {
                return 'direct';
            }
            // Generic search
            if (pathname.includes('/jobs/search')) {
                return 'search';
            }
        }

        // Naukri Handling
        if (hostname.includes('naukri.com')) {
            if (search.includes('?q=') || pathname === '/jobs') {
                return 'search';
            }
        }

        // Known direct ATS providers
        const directATS = [
            'greenhouse.io',
            'lever.co',
            'workday.com',
            'myworkdayjobs.com',
            'ashbyhq.com',
            'bamboohr.com'
        ];

        if (directATS.some(ats => hostname.includes(ats))) {
            return 'direct';
        }

        // Known aggregators / middlemen
        const aggregators = [
            'indeed.com',
            'glassdoor.com',
            'ziprecruiter.com',
            'adzuna.com',
            'jooble.org'
        ];

        if (aggregators.some(agg => hostname.includes(agg))) {
            return 'aggregator';
        }

        // Fallback for unknown valid URLs
        return 'unknown';

    } catch (e) {
        // Malformed URL
        return 'unknown';
    }
}
