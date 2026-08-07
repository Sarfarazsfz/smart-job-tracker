import { ExternalLink, Search, Play, HelpCircle } from 'lucide-react';

export function getJobAction(job) {
    const type = job?.externalUrlType || 'unknown';
    const applyUrl = job?.applyUrl;

    switch (type) {
        case 'direct':
            return {
                label: 'Apply Now',
                canOpen: true,
                icon: ExternalLink
            };
        case 'aggregator':
            return {
                label: 'Apply Now',
                canOpen: true,
                icon: ExternalLink
            };
        case 'search':
            return {
                label: 'Search Similar',
                canOpen: true,
                icon: Search
            };
        case 'demo':
            return {
                label: 'Demo Job',
                canOpen: false,
                icon: Play
            };
        case 'unknown':
        default:
            return {
                label: 'View Source',
                canOpen: Boolean(applyUrl),
                icon: HelpCircle
            };
    }
}
