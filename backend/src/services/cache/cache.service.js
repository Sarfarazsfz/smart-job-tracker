import { Redis } from '@upstash/redis';
import { config } from '../../config/index.js';

let redis = null;

// In-memory fallback when Redis is not available
const memoryStore = {
    data: new Map(),
    get: async (key) => memoryStore.data.get(key) || null,
    set: async (key, value, options) => {
        memoryStore.data.set(key, value);
        if (options?.ex) {
            setTimeout(() => memoryStore.data.delete(key), options.ex * 1000).unref();
        }
        return 'OK';
    },
    del: async (key) => {
        memoryStore.data.delete(key);
        return 1;
    },
    keys: async (pattern) => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return Array.from(memoryStore.data.keys()).filter(k => regex.test(k));
    },
    hset: async (key, field, value) => {
        const hash = memoryStore.data.get(key) || {};
        hash[field] = value;
        memoryStore.data.set(key, hash);
        return 1;
    },
    hget: async (key, field) => {
        const hash = memoryStore.data.get(key);
        return hash ? hash[field] : null;
    },
    hgetall: async (key) => memoryStore.data.get(key) || null,
    hdel: async (key, field) => {
        const hash = memoryStore.data.get(key);
        if (hash) {
            delete hash[field];
            memoryStore.data.set(key, hash);
        }
        return 1;
    }
};

export async function initRedis() {
    if (config.redis.url && config.redis.token) {
        try {
            redis = new Redis({
                url: config.redis.url,
                token: config.redis.token,
            });
            await redis.ping();
            console.log('Connected to Upstash Redis');
        } catch (error) {
            console.warn('Failed to connect to Redis, using in-memory store:', error.message);
            redis = memoryStore;
        }
    } else {
        console.log('No Redis credentials, using in-memory store');
        redis = memoryStore;
    }
}

export function getRedis() {
    return redis || memoryStore;
}
