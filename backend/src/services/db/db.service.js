import pg from 'pg';
import { config } from '../../config/index.js';

const { Pool } = pg;

let pool = null;

// Mock DB for tests
const mockDbStore = {
    applications: [],
    resumes: []
};

const mockPool = {
    query: async (query, values) => {
        if (query.includes('INSERT INTO applications')) {
            mockDbStore.applications.push({
                id: values[0],
                user_id: values[1],
                job_id: values[2],
                job_title: values[3],
                company: values[4],
                apply_url: values[5],
                status: values[6],
                applied_at: values[7],
                updated_at: values[8],
                timeline: values[9]
            });
            return { rows: [] };
        }
        if (query.includes('SELECT') && query.includes('FROM applications')) {
            const userId = values[0];
            const rows = mockDbStore.applications.filter(a => a.user_id === userId).map(a => ({
                id: a.id,
                jobId: a.job_id,
                jobTitle: a.job_title,
                company: a.company,
                applyUrl: a.apply_url,
                status: a.status,
                appliedAt: a.applied_at,
                updatedAt: a.updated_at,
                timeline: typeof a.timeline === 'string' ? JSON.parse(a.timeline) : a.timeline
            }));
            return { rows };
        }
        if (query.includes('INSERT INTO resumes')) {
            const userId = values[0];
            const existingIndex = mockDbStore.resumes.findIndex(r => r.user_id === userId);
            const resume = {
                user_id: userId,
                filename: values[1],
                mimetype: values[2],
                text_content: values[3],
                uploaded_at: values[4]
            };
            if (existingIndex !== -1) mockDbStore.resumes[existingIndex] = resume;
            else mockDbStore.resumes.push(resume);
            return { rows: [] };
        }
        if (query.includes('SELECT') && query.includes('FROM resumes')) {
            const userId = values[0];
            const resume = mockDbStore.resumes.find(r => r.user_id === userId);
            if (!resume) return { rows: [] };
            return { rows: [{
                filename: resume.filename,
                mimetype: resume.mimetype,
                text: resume.text_content,
                uploadedAt: resume.uploaded_at
            }] };
        }
        return { rows: [] };
    }
};

export async function initDb() {
    if (pool) return;
    
    if (!config.db.url) {
        if (process.env.NODE_ENV === 'test') {
            return; // tests will mock it
        }
        throw new Error('DATABASE_URL environment variable is missing.');
    }

    pool = new Pool({
        connectionString: config.db.url,
        ssl: config.db.ssl,
        max: 20, // connection pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    try {
        const client = await pool.connect();
        client.release();
        console.log('✅ Connected to PostgreSQL');
    } catch (err) {
        console.error('❌ PostgreSQL connection error', err.stack);
    }
}

export function getDb() {
    if (process.env.NODE_ENV === 'test') {
        return mockPool;
    }
    if (!pool) {
        throw new Error('Database pool not initialized. Call initDb() first.');
    }
    return pool;
}

export async function closeDb() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('PostgreSQL connection closed.');
    }
}
