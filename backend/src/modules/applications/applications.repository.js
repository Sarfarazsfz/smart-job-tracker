import { getRedis } from '../../services/cache/cache.service.js';

export async function saveApplication(userId, application) {
    const r = getRedis();
    const key = `applications:${userId}`;
    const apps = await getApplications(userId);
    apps.push(application);
    await r.set(key, JSON.stringify(apps));
}

export async function getApplications(userId) {
    const r = getRedis();
    const data = await r.get(`applications:${userId}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
}

export async function updateApplication(userId, appId, updates) {
    const r = getRedis();
    const apps = await getApplications(userId);
    const index = apps.findIndex(a => a.id === appId);
    if (index !== -1) {
        apps[index] = { ...apps[index], ...updates };
        await r.set(`applications:${userId}`, JSON.stringify(apps));
        return apps[index];
    }
    return null;
}

export async function deleteApplication(userId, appId) {
    const r = getRedis();
    const apps = await getApplications(userId);
    const filtered = apps.filter(a => a.id !== appId);
    await r.set(`applications:${userId}`, JSON.stringify(filtered));
}
