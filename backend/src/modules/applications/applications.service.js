import { v4 as uuidv4 } from 'uuid';
import * as repository from './applications.repository.js';

export async function createApplication(userId, data) {
    const { jobId, jobTitle, company, applyUrl, appliedAt, status = 'applied' } = data;
    
    // Check if already applied
    const existing = await repository.getApplications(userId);
    if (existing.some(app => app.jobId === jobId)) {
        const error = new Error('Already applied to this job');
        error.code = 'ALREADY_APPLIED';
        error.existing = existing.find(app => app.jobId === jobId);
        throw error;
    }

    const application = {
        id: uuidv4(),
        jobId,
        jobTitle,
        company,
        applyUrl,
        status,
        appliedAt: appliedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
            {
                status: 'applied',
                date: appliedAt || new Date().toISOString(),
                note: 'Application submitted'
            }
        ]
    };

    await repository.saveApplication(userId, application);
    return application;
}

export async function listApplications(userId, options = {}) {
    const { status, sortBy = 'date', order = 'desc' } = options;
    let applications = await repository.getApplications(userId);

    // Filter by status
    if (status && status !== 'all') {
        applications = applications.filter(app => app.status === status);
    }

    // Sort
    applications.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
            comparison = new Date(b.appliedAt) - new Date(a.appliedAt);
        } else if (sortBy === 'company') {
            comparison = a.company.localeCompare(b.company);
        } else if (sortBy === 'status') {
            comparison = a.status.localeCompare(b.status);
        }
        return order === 'desc' ? comparison : -comparison;
    });

    // Calculate stats
    const stats = {
        total: applications.length,
        applied: applications.filter(a => a.status === 'applied').length,
        interview: applications.filter(a => a.status === 'interview').length,
        offer: applications.filter(a => a.status === 'offer').length,
        rejected: applications.filter(a => a.status === 'rejected').length
    };

    return { applications, stats };
}

export async function modifyApplication(userId, appId, data) {
    const { status, note } = data;

    const applications = await repository.getApplications(userId);
    const app = applications.find(a => a.id === appId);

    if (!app) {
        const error = new Error('Application not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    const timelineEntry = {
        status: status || app.status,
        date: new Date().toISOString(),
        note: note || `Status changed to ${status}`
    };

    const updates = {
        status: status || app.status,
        updatedAt: new Date().toISOString(),
        timeline: [...(app.timeline || []), timelineEntry]
    };

    return await repository.updateApplication(userId, appId, updates);
}

export async function removeApplication(userId, appId) {
    await repository.deleteApplication(userId, appId);
}

export async function checkApplicationStatus(userId, jobId) {
    const applications = await repository.getApplications(userId);
    const existing = applications.find(app => app.jobId === jobId);

    return {
        applied: !!existing,
        application: existing || null
    };
}
