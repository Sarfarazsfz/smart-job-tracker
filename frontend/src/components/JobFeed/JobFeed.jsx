import { useState, useEffect } from 'react'
import JobCard from './JobCard'
import './JobFeed.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function JobFeed({ jobs, loading, hasResume, onApply, applications }) {
    const [bestMatches, setBestMatches] = useState([])
    const [loadingBest, setLoadingBest] = useState(false)

    // Fetch best matches if user has resume
    useEffect(() => {
        if (hasResume) {
            fetchBestMatches()
        } else {
            setBestMatches([])
        }
    }, [hasResume])

    const fetchBestMatches = async () => {
        setLoadingBest(true)
        try {
            const res = await fetch(`${API_URL}/jobs/best-matches?limit=8`)
            const data = await res.json()
            setBestMatches(data.jobs || [])
        } catch (error) {
            console.error('Error fetching best matches:', error)
        } finally {
            setLoadingBest(false)
        }
    }

    const isApplied = (jobId) => {
        return applications?.some(app => app.jobId === jobId)
    }

    if (loading) {
        return (
            <div className="job-feed">
                <div className="loading-state">
                    <div className="spinner large" />
                    <p>Loading jobs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="job-feed">
            {/* Best Matches Section */}
            {hasResume && bestMatches.length > 0 && (
                <section className="best-matches-section">
                    <div className="section-header">
                        <div className="section-title">
                            <span className="section-icon">⭐</span>
                            <h2>Best Matches For You</h2>
                        </div>
                        <span className="section-subtitle">Based on your resume</span>
                    </div>

                    {loadingBest ? (
                        <div className="loading-inline">
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div className="best-matches-grid">
                            {bestMatches.slice(0, 8).map((job, index) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    compact
                                    index={index}
                                    onApply={onApply}
                                    applied={isApplied(job.id)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Resume CTA if no resume */}
            {!hasResume && (
                <div className="resume-cta">
                    <div className="cta-icon">📄</div>
                    <div className="cta-content">
                        <h3>Upload your resume to see match scores</h3>
                        <p>Get personalized job recommendations based on your skills and experience</p>
                    </div>
                </div>
            )}

            {/* All Jobs Section */}
            <section className="all-jobs-section">
                <div className="section-header">
                    <h2>All Jobs</h2>
                    <span className="job-count">{jobs.length} jobs found</span>
                </div>

                {jobs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No jobs found</h3>
                        <p>Try adjusting your filters to see more results</p>
                    </div>
                ) : (
                    <div className="jobs-grid">
                        {jobs.map((job, index) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                index={index}
                                onApply={onApply}
                                applied={isApplied(job.id)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
