import './Header.css'

export default function Header({ activeTab, onTabChange, onResumeClick, onAIClick, hasResume }) {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div className="logo">
                        <span className="logo-icon">🎯</span>
                        <span className="logo-text">JobMatch<span className="logo-ai">AI</span></span>
                    </div>

                    <nav className="nav-tabs">
                        <button
                            className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
                            onClick={() => onTabChange('jobs')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            </svg>
                            Jobs
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'applications' ? 'active' : ''}`}
                            onClick={() => onTabChange('applications')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                            Applications
                        </button>
                    </nav>
                </div>

                <div className="header-right">
                    <button
                        className="header-btn ai-btn"
                        onClick={onAIClick}
                        title="AI Assistant"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                            <circle cx="7.5" cy="14.5" r="1.5" />
                            <circle cx="16.5" cy="14.5" r="1.5" />
                        </svg>
                        <span className="hide-mobile">AI Assistant</span>
                    </button>

                    <button
                        className={`header-btn resume-btn ${hasResume ? 'has-resume' : ''}`}
                        onClick={onResumeClick}
                        title={hasResume ? 'Update Resume' : 'Upload Resume'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10,9 9,9 8,9" />
                        </svg>
                        <span className="hide-mobile">{hasResume ? 'Resume ✓' : 'Upload Resume'}</span>
                        {!hasResume && <span className="pulse-dot" />}
                    </button>
                </div>
            </div>
        </header>
    )
}
