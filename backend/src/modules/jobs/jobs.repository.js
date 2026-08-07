import { getRedis } from '../../services/cache/cache.service.js';

export async function cacheJobsData(cacheKey, jobs, ttl = 300) {
    const r = getRedis();
    await r.set(`jobs:${cacheKey}`, JSON.stringify(jobs), { ex: ttl });
}

export async function getCachedJobsData(cacheKey) {
    const r = getRedis();
    const data = await r.get(`jobs:${cacheKey}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
}

export async function clearJobsCacheData(cacheKey = '*') {
    const r = getRedis();
    if (cacheKey === '*') {
        const keys = await r.keys('jobs:*');
        if (keys && keys.length > 0) {
            await Promise.all(keys.map(key => r.del(key)));
        }
    } else {
        await r.del(`jobs:${cacheKey}`);
    }
}
