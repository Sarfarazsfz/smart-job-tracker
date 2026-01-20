import { useState } from 'react'
import './ApplicationTracker.css'

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Applications', icon: '📋' },
    { value: 'applied', label: 'Applied', icon: '📤' },
    { value: 'interview', label: 'Interview', icon: '💬' },
    { value: 'offer', label: 'Offer', icon: '🎉' },
    { value: 'rejected', label: 'Rejected', icon: '❌' }
]

const STATUS_COLORS = {
    applied: 'var(--color-info)',
    interview: 'var(--color-warning)',
    offer: 'var(--color-success)',
    rejected: 'var(--match-low)'
}

export default function ApplicationTracker({ applications, onStatusChange, onRefresh }) {
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [selectedApp, setSelectedApp] = useState(null)

    const filteredApps = selectedStatus === 'all'
        ? applications
        : applications.filter(app => app.status === selectedStatus)

    const stats = {
        total: applications.length,
        applied: applications.filter(a => a.status === 'applied').length,
        interview: applications.filter(a => a.status === 'interview').length,
        offer: applications.filter(a => a.status === 'offer').length,
        rejected: applications.filter(a => a.status === 'rejected').length
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getNextStatuses = (currentStatus) => {
        switch (currentStatus) {
            case 'applied':
                return ['interview', 'rejected']
            case 'interview':
                return ['offer', 'rejected']
            case 'offer':
                return []
            case 'rejected':
                return []
            default:
                return []
        }
    }

    if (applications.length === 0) {
        return (
            <div className="applications-empty">
                <div className="empty-illustration">📭</div>
                <h2>No Applications Yet</h2>
                <p>Start applying to jobs to track your applications here</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Browse Jobs
                </button>
            </div>
        )
    }

    return (
        <div className="application-tracker">
            {/* Header with stats */}
            <div className="tracker-header">
                <div className="header-title">
                    <h1>Application Tracker</h1>
                    <button className="btn btn-ghost btn-sm" onClick={onRefresh}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        Refresh
                    </button>
                </div>

                <div className="stats-grid">
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            className={`stat-card ${selectedStatus === opt.value ? 'active' : ''}`}
                            onClick={() => setSelectedStatus(opt.value)}
                        >
                            <span className="stat-icon">{opt.icon}</span>
                            <div className="stat-info">
                                <span className="stat-value">
                                    {opt.value === 'all' ? stats.total : stats[opt.value]}
                                </span>
                                <span className="stat-label">{opt.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications list */}
            <div className="applications-content">
                <div className="applications-list">
                    {filteredApps.length === 0 ? (
                        <div className="no-results">
                            <p>No {selectedStatus} applications</p>
                        </div>
                    ) : (
                        filteredApps.map((app, index) => (
                            <div
                                key={app.id}
                                className={`application-card ${selectedApp?.id === app.id ? 'selected' : ''}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => setSelectedApp(app)}
                            >
                                <div className="app-header">
                                    <div className="app-title-section">
                                        <h3 className="app-job-title">{app.jobTitle}</h3>
                                        <span className="app-company">{app.company}</span>
                                    </div>
                                    <span
                                        className="status-badge"
                                        style={{
                                            background: `${STATUS_COLORS[app.status]}20`,
                                            color: STATUS_COLORS[app.status]
                                        }}
                                    >
                                        {app.status}
                                    </span>
                                </div>

                                <div className="app-meta">
                                    <span className="app-date">
                                        Applied: {formatDate(app.appliedAt)}
                                    </span>
                                    <span className="app-updated">
                                        Updated: {formatDate(app.updatedAt)}
                                    </span>
                                </div>

                                {/* Quick actions */}
                                <div className="app-actions">
                                    {getNextStatuses(app.status).map(status => (
                                        <button
                                            key={status}
                                            className="btn btn-sm btn-secondary"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onStatusChange(app.id, status)
                                            }}
                                        >
                                            Mark as {status}
                                        </button>
                                    ))}
                                    {app.applyUrl && (
                                        <a
                                            href={app.applyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-ghost"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View Job
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Timeline sidebar */}
                {selectedApp && (
                    <div className="timeline-sidebar">
                        <div className="timeline-header">
                            <h3>Application Timeline</h3>
                            <button
                                className="btn btn-ghost btn-icon"
                                onClick={() => setSelectedApp(null)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="timeline-job-info">
                            <h4>{selectedApp.jobTitle}</h4>
                            <p>{selectedApp.company}</p>
                        </div>

                        <div className="timeline">
                            {selectedApp.timeline?.map((entry, index) => (
                                <div key={index} className="timeline-item">
                                    <div
                                        className="timeline-dot"
                                        style={{ background: STATUS_COLORS[entry.status] }}
                                    />
                                    <div className="timeline-content">
                                        <div className="timeline-status" style={{ color: STATUS_COLORS[entry.status] }}>
                                            {entry.status.toUpperCase()}
                                        </div>
                                        <div className="timeline-date">{formatDate(entry.date)}</div>
                                        {entry.note && <div className="timeline-note">{entry.note}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Status update section */}
                        <div className="status-update-section">
                            <label>Update Status</label>
                            <div className="status-buttons">
                                {['applied', 'interview', 'offer', 'rejected'].map(status => (
                                    <button
                                        key={status}
                                        className={`status-btn ${selectedApp.status === status ? 'current' : ''}`}
                                        style={{
                                            borderColor: STATUS_COLORS[status],
                                            color: selectedApp.status === status ? 'white' : STATUS_COLORS[status],
                                            background: selectedApp.status === status ? STATUS_COLORS[status] : 'transparent'
                                        }}
                                        onClick={() => {
                                            if (selectedApp.status !== status) {
                                                onStatusChange(selectedApp.id, status)
                                            }
                                        }}
                                        disabled={selectedApp.status === status}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
