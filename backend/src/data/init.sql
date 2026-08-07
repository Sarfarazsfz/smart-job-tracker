-- PostgreSQL Schema Initialization for JobMatch AI

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    job_id VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    apply_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'applied',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    timeline JSONB DEFAULT '[]'::jsonb
);

-- Index for querying applications by user (very common)
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Unique index to prevent duplicate application records for the same job by the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_user_job ON applications(user_id, job_id);

-- Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    user_id VARCHAR(255) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100),
    text_content TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
