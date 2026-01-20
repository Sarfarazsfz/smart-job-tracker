import './JobCard.css'

export default function JobCard({ job, compact, index, onApply, applied }) {
    const getMatchClass = (score) => {
        if (score >= 70) return 'high'
        if (score >= 40) return 'medium'
        return 'low'
    }

    const getWorkModeIcon = (mode) => {
        switch (mode?.toLowerCase()) {
            case 'remote': return '🏠'
            case 'hybrid': return '🔄'
            case 'on-site': return '🏢'
            default: return '📍'
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return `${Math.floor(diffDays / 30)} months ago`
    }

    const truncateDescription = (desc, maxLength = 150) => {
        if (desc.length <= maxLength) return desc
        return desc.substring(0, maxLength).trim() + '...'
    }

    return (
        <article
            className={`job-card ${compact ? 'compact' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="job-card-header">
                <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="company-logo"
                    onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6366f1&color=fff`
                    }}
                />
                <div className="job-title-section">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="company-name">{job.company}</div>
                </div>
                {job.matchScore !== undefined && (
                    <div className={`match-badge match-${getMatchClass(job.matchScore)}`} title={job.matchExplanation}>
                        <span className="match-score">{job.matchScore}%</span>
                        <span className="match-label">match</span>
                    </div>
                )}
            </div>

            <div className="job-meta">
                <span className="meta-item location">
                    {getWorkModeIcon(job.workMode)} {job.location}
                </span>
                <span className="meta-item type">{job.jobType}</span>
                <span className="meta-item mode">{job.workMode}</span>
                <span className="meta-item date">{formatDate(job.postedDate)}</span>
            </div>

            {!compact && (
                <p className="job-description">
                    {truncateDescription(job.description)}
                </p>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
                <div className="job-skills">
                    {job.skills.slice(0, compact ? 3 : 6).map(skill => (
                        <span
                            key={skill}
                            className={`skill-tag ${job.matchedSkills?.includes(skill) ? 'matched' : ''}`}
                        >
                            {skill}
                        </span>
                    ))}
                    {job.skills.length > (compact ? 3 : 6) && (
                        <span className="skill-tag more">+{job.skills.length - (compact ? 3 : 6)}</span>
                    )}
                </div>
            )}

            {/* Match explanation */}
            {!compact && job.matchExplanation && (
                <div className="match-explanation">
                    <span className="explanation-label">Why we matched:</span>
                    <span className="explanation-text">{job.matchExplanation}</span>
                </div>
            )}

            {/* Footer */}
            <div className="job-card-footer">
                {job.salary && <span className="salary">{job.salary}</span>}
                <div className="job-actions">
                    {applied ? (
                        <span className="applied-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20,6 9,17 4,12" />
                            </svg>
                            Applied
                        </span>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => onApply(job)}
                        >
                            Apply Now
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12,5 19,12 12,19" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </article>
    )
}
