import { getDb } from '../../services/db/db.service.js';
import { getRedis } from '../../services/cache/cache.service.js';

export async function saveResume(userId, resumeData) {
    const db = getDb();
    const query = `
        INSERT INTO resumes (user_id, filename, mimetype, text_content, uploaded_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE 
        SET filename = EXCLUDED.filename,
            mimetype = EXCLUDED.mimetype,
            text_content = EXCLUDED.text_content,
            uploaded_at = EXCLUDED.uploaded_at
    `;
    const values = [
        userId,
        resumeData.filename,
        resumeData.mimetype,
        resumeData.text,
        resumeData.uploadedAt
    ];
    await db.query(query, values);
}

export async function getResume(userId) {
    const db = getDb();
    const query = `SELECT filename, mimetype, text_content as text, uploaded_at as "uploadedAt" FROM resumes WHERE user_id = $1`;
    const result = await db.query(query, [userId]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
        ...row,
        uploadedAt: row.uploadedAt ? new Date(row.uploadedAt).toISOString() : null
    };
}

export async function deleteResume(userId) {
    const db = getDb();
    await db.query(`DELETE FROM resumes WHERE user_id = $1`, [userId]);
}

export async function clearMatchScores(userId) {
    const r = getRedis();
    await r.del(`matchscores:${userId}`);
}
