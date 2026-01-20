import './FilterPanel.css'

const SKILLS = [
    'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript',
    'Node.js', 'Python', 'Java', 'Go', 'Ruby',
    'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
    'GraphQL', 'REST', 'Machine Learning', 'Figma', 'UI/UX'
]

const DATE_OPTIONS = [
    { value: 'all', label: 'Any time' },
    { value: 'day', label: 'Last 24 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' }
]

const JOB_TYPES = [
    { value: 'all', label: 'All types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
]

const WORK_MODES = [
    { value: 'all', label: 'All modes' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'on-site', label: 'On-site' }
]

export default function FilterPanel({ filters, onFilterChange, hasResume }) {
    const handleSkillToggle = (skill) => {
        const newSkills = filters.skills.includes(skill)
            ? filters.skills.filter(s => s !== skill)
            : [...filters.skills, skill]
        onFilterChange({ ...filters, skills: newSkills })
    }

    const clearFilters = () => {
        onFilterChange({
            query: '',
            skills: [],
            datePosted: 'all',
            jobType: 'all',
            workMode: 'all',
            location: '',
            minScore: 0
        })
    }

    const hasActiveFilters = filters.query || filters.skills.length > 0 ||
        filters.datePosted !== 'all' || filters.jobType !== 'all' ||
        filters.workMode !== 'all' || filters.location || filters.minScore > 0

    return (
        <aside className="filter-panel">
            <div className="filter-header">
                <h2>Filters</h2>
                {hasActiveFilters && (
                    <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                        Clear all
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="filter-section">
                <label className="filter-label">Role / Title</label>
                <input
                    type="text"
                    className="input"
                    placeholder="Search jobs..."
                    value={filters.query}
                    onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
                />
            </div>

            {/* Skills */}
            <div className="filter-section">
                <label className="filter-label">Skills</label>
                <div className="skills-grid">
                    {SKILLS.map(skill => (
                        <button
                            key={skill}
                            className={`skill-chip ${filters.skills.includes(skill) ? 'active' : ''}`}
                            onClick={() => handleSkillToggle(skill)}
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Posted */}
            <div className="filter-section">
                <label className="filter-label">Date Posted</label>
                <select
                    className="input"
                    value={filters.datePosted}
                    onChange={(e) => onFilterChange({ ...filters, datePosted: e.target.value })}
                >
                    {DATE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Job Type */}
            <div className="filter-section">
                <label className="filter-label">Job Type</label>
                <div className="radio-group">
                    {JOB_TYPES.map(opt => (
                        <label key={opt.value} className="radio-item">
                            <input
                                type="radio"
                                name="jobType"
                                value={opt.value}
                                checked={filters.jobType === opt.value}
                                onChange={(e) => onFilterChange({ ...filters, jobType: e.target.value })}
                            />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Work Mode */}
            <div className="filter-section">
                <label className="filter-label">Work Mode</label>
                <div className="radio-group">
                    {WORK_MODES.map(opt => (
                        <label key={opt.value} className="radio-item">
                            <input
                                type="radio"
                                name="workMode"
                                value={opt.value}
                                checked={filters.workMode === opt.value}
                                onChange={(e) => onFilterChange({ ...filters, workMode: e.target.value })}
                            />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div className="filter-section">
                <label className="filter-label">Location</label>
                <input
                    type="text"
                    className="input"
                    placeholder="City or region..."
                    value={filters.location}
                    onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
                />
            </div>

            {/* Match Score */}
            {hasResume && (
                <div className="filter-section">
                    <label className="filter-label">
                        Match Score
                        <span className="filter-value">{filters.minScore > 0 ? `>${filters.minScore}%` : 'All'}</span>
                    </label>
                    <input
                        type="range"
                        className="range-input"
                        min="0"
                        max="100"
                        step="10"
                        value={filters.minScore}
                        onChange={(e) => onFilterChange({ ...filters, minScore: parseInt(e.target.value) })}
                    />
                    <div className="range-labels">
                        <span>All</span>
                        <span className="match-indicator low">Low</span>
                        <span className="match-indicator medium">Medium</span>
                        <span className="match-indicator high">High</span>
                    </div>
                </div>
            )}
        </aside>
    )
}
