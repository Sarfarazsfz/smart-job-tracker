export default function JobDetailModal({ job, onClose }) {
    if (!job) return null

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

    const getWorkModeIcon = (mode) => {
        switch (mode?.toLowerCase()) {
            case 'remote': return '🏠'
            case 'hybrid': return '🔄'
            case 'on-site': return '🏢'
            default: return '📍'
        }
    }

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-3xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50 p-6 z-10">
                    <button
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        onClick={onClose}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <div className="flex items-start gap-4 pr-12">
                        <img
                            src={job.companyLogo}
                            alt={job.company}
                            className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-700"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6366f1&color=fff`
                            }}
                        />
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                {job.category || 'Job Opportunity'}
                            </div>
                            <h2 className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                                {job.title}
                            </h2>
                            <div className="text-base text-slate-700 dark:text-slate-300 font-medium">
                                {job.company}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Key Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Experience */}
                        {job.experience && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                        <span className="text-xl">💼</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Experience</div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{job.experience}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Work Mode */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">{getWorkModeIcon(job.workMode)}</span>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Work Mode</div>
                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{job.workMode}</div>
                                </div>
                            </div>
                        </div>

                        {/* Duration */}
                        {job.duration && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                        <span className="text-xl">📅</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Duration</div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{job.duration}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Salary/Stipend */}
                        {job.salary && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                        <span className="text-xl">💰</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Salary</div>
                                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{job.salary}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Performance Bonus */}
                    {job.bonus && (
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🎯</span>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-1">
                                        Performance Based Bonus
                                    </div>
                                    <div className="text-sm text-orange-800 dark:text-orange-400">
                                        {job.bonus}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Location & Job Type */}
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-slate-700">
                            📍 {job.location}
                        </span>
                        <span className="inline-flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-slate-700">
                            {job.jobType}
                        </span>
                        <span className="inline-flex items-center px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 rounded-lg font-medium border border-slate-200 dark:border-slate-700">
                            Posted {formatDate(job.postedDate)}
                        </span>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">
                            About the Role
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {job.description}
                        </p>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">
                                What You'll Work With
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map(skill => (
                                    <span
                                        key={skill}
                                        className={`
                                            inline-flex items-center px-3 py-1.5 text-sm rounded-lg font-medium
                                            ${job.matchedSkills?.includes(skill)
                                                ? 'bg-indigo-500 text-white border border-indigo-500'
                                                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                            }
                                        `}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Match Explanation */}
                    {job.matchExplanation && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">✨</span>
                                <div>
                                    <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                                        Why we matched you
                                    </div>
                                    <div className="text-sm text-indigo-800 dark:text-indigo-400">
                                        {job.matchExplanation}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Apply Link */}
                    {job.applyUrl && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">
                                Apply Now
                            </h3>
                            <a
                                href={job.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium break-all"
                            >
                                {job.applyUrl}
                            </a>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow"
                            onClick={() => window.open(job.applyUrl, '_blank')}
                        >
                            Apply Now
                        </button>
                        <button
                            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-colors"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
