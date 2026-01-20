import { useState } from 'react'
import './ApplicationPopup.css'

export default function ApplicationPopup({ job, onConfirm }) {
    const [choice, setChoice] = useState(null)

    const handleChoice = (confirmed, type) => {
        setChoice(type)
        setTimeout(() => {
            onConfirm(confirmed, type)
        }, 300)
    }

    return (
        <div className="popup-overlay">
            <div className="popup application-popup">
                <div className="popup-header">
                    <div className="popup-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22,4 12,14.01 9,11.01" />
                        </svg>
                    </div>
                    <h3>Welcome back!</h3>
                </div>

                <div className="popup-content">
                    <p className="popup-question">Did you apply to this job?</p>

                    <div className="job-summary">
                        <img
                            src={job.companyLogo}
                            alt={job.company}
                            className="job-logo"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6366f1&color=fff`
                            }}
                        />
                        <div className="job-details">
                            <span className="job-title">{job.title}</span>
                            <span className="job-company">{job.company}</span>
                        </div>
                    </div>
                </div>

                <div className="popup-actions">
                    <button
                        className={`popup-btn primary ${choice === 'applied' ? 'selected' : ''}`}
                        onClick={() => handleChoice(true, 'applied')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12" />
                        </svg>
                        Yes, Applied
                    </button>

                    <button
                        className={`popup-btn secondary ${choice === 'browsing' ? 'selected' : ''}`}
                        onClick={() => handleChoice(false, 'browsing')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        No, Just Browsing
                    </button>

                    <button
                        className={`popup-btn tertiary ${choice === 'earlier' ? 'selected' : ''}`}
                        onClick={() => handleChoice(true, 'earlier')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                        </svg>
                        Applied Earlier
                    </button>
                </div>
            </div>
        </div>
    )
}
