import { getDb } from '../../services/db/db.service.js';

export async function saveApplication(userId, application) {
    const db = getDb();
    const query = `
        INSERT INTO applications (id, user_id, job_id, job_title, company, apply_url, status, applied_at, updated_at, timeline)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [
        application.id,
        userId,
        application.jobId,
        application.jobTitle,
        application.company,
        application.applyUrl,
        application.status,
        application.appliedAt,
        application.updatedAt,
        JSON.stringify(application.timeline || [])
    ];
    await db.query(query, values);
}

export async function getApplications(userId) {
    const db = getDb();
    const query = `
        SELECT id, job_id as "jobId", job_title as "jobTitle", company, apply_url as "applyUrl", status, 
               applied_at as "appliedAt", updated_at as "updatedAt", timeline
        FROM applications
        WHERE user_id = $1
        ORDER BY applied_at DESC
    `;
    const result = await db.query(query, [userId]);
    
    // Map dates back to ISO strings to match existing API contract
    return result.rows.map(row => ({
        ...row,
        appliedAt: row.appliedAt ? new Date(row.appliedAt).toISOString() : null,
        updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null
    }));
}

export async function updateApplication(userId, appId, updates) {
    const db = getDb();
    
    const fields = [];
    const values = [userId, appId];
    let queryIndex = 3;

    if (updates.status !== undefined) {
        fields.push(`status = $${queryIndex++}`);
        values.push(updates.status);
    }
    if (updates.updatedAt !== undefined) {
        fields.push(`updated_at = $${queryIndex++}`);
        values.push(updates.updatedAt);
    }
    if (updates.timeline !== undefined) {
        fields.push(`timeline = $${queryIndex++}`);
        values.push(JSON.stringify(updates.timeline));
    }

    if (fields.length === 0) return null;

    const query = `
        UPDATE applications
        SET ${fields.join(', ')}
        WHERE user_id = $1 AND id = $2
        RETURNING id, job_id as "jobId", job_title as "jobTitle", company, apply_url as "applyUrl", status, 
                  applied_at as "appliedAt", updated_at as "updatedAt", timeline
    `;

    const result = await db.query(query, values);
    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            ...row,
            appliedAt: row.appliedAt ? new Date(row.appliedAt).toISOString() : null,
            updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null
        };
    }
    
    return null;
}

export async function deleteApplication(userId, appId) {
    const db = getDb();
    const query = `DELETE FROM applications WHERE user_id = $1 AND id = $2`;
    await db.query(query, [userId, appId]);
}
