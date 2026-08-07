import { getRedis } from '../../services/cache/cache.service.js';

export async function saveResume(userId, resumeData) {
    const r = getRedis();
    await r.set(`resume:${userId}`, JSON.stringify(resumeData));
}

export async function getResume(userId) {
    const r = getRedis();
    const data = await r.get(`resume:${userId}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
}

export async function deleteResume(userId) {
    const r = getRedis();
    await r.del(`resume:${userId}`);
}

export async function clearMatchScores(userId) {
    const r = getRedis();
    await r.del(`matchscores:${userId}`);
}
