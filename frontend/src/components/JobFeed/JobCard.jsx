export default function JobCard({ job, compact, index, onApply, applied, onJobClick }) {
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

    // Get match badge colors - soft, not flashy
    const getMatchColors = (type) => {
        switch (type) {
            case 'high':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
            case 'medium':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
            default:
                return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
        }
    }

    const maxSkills = compact ? 3 : 4
    const visibleSkills = job.skills?.slice(0, maxSkills) || []
    const remainingSkillsCount = (job.skills?.length || 0) - maxSkills

    return (
        <article
            className={`
                bg-white dark:bg-[#1D1F23]
                border border-slate-200 dark:border-[rgba(255,255,255,0.06)]
                rounded-2xl
                ${compact ? 'p-4' : 'p-5 md:p-6'}
                transition-all duration-300 ease-out
                hover:border-indigo-300 dark:hover:border-[rgba(255,255,255,0.12)]
                hover:bg-slate-50 dark:hover:bg-[#252729]
                hover:shadow-lg hover:shadow-indigo-500/5
                hover:-translate-y-1
                flex flex-col gap-3 md:gap-4
                ${index !== undefined ? 'animate-fade-in' : ''}
                cursor-pointer
            `}
            style={index !== undefined ? { animationDelay: `${index * 30}ms` } : {}}
            onClick={() => onJobClick?.(job)}
        >
            {/* Header: Logo, Title, Company, Match Badge */}
            <div className="flex items-start gap-4">
                <img
                    src={job.companyLogo}
                    alt={job.company}
                    className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg object-cover flex-shrink-0 bg-slate-100 dark:bg-slate-700 transition-transform duration-300 hover:scale-110`}
                    onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6366f1&color=fff`
                    }}
                />
                <div className="flex-1 min-w-0">
                    <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-slate-900 dark:text-[#E4E6EB] leading-snug mb-1`}>
                        {job.title}
                    </h3>
                    <div className="text-sm text-slate-700 dark:text-[#B0B3B8] leading-relaxed font-medium">
                        {job.company}
                    </div>
                </div>
                {job.matchScore !== undefined && (
                    <div
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border ${getMatchColors(getMatchClass(job.matchScore))} flex-shrink-0`}
                        title={job.matchExplanation}
                    >
                        <span className="text-lg font-bold leading-none">{job.matchScore}%</span>
                        <span className="text-xs opacity-80 leading-none mt-0.5">match</span>
                    </div>
                )}
            </div>

            {/* Meta: Location, Type, Mode, Date */}
            <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-200 dark:bg-[#252729] text-slate-800 dark:text-[#B0B3B8] rounded-lg font-medium">
                    {getWorkModeIcon(job.workMode)} {job.location}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 text-xs bg-slate-200 dark:bg-[#252729] text-slate-800 dark:text-[#B0B3B8] rounded-lg font-medium">
                    {job.jobType}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 text-xs bg-slate-200 dark:bg-[#252729] text-slate-800 dark:text-[#B0B3B8] rounded-lg font-medium">
                    {job.workMode}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 text-xs bg-slate-200 dark:bg-[#252729] text-slate-700 dark:text-[#8A8D91] rounded-lg font-medium">
                    {formatDate(job.postedDate)}
                </span>
            </div>

            {/* Description - Max 2 lines */}
            {!compact && (
                <p className="text-sm text-slate-700 dark:text-[#B0B3B8] leading-relaxed line-clamp-2 font-normal">
                    {truncateDescription(job.description)}
                </p>
            )}

            {/* Skills - Soft pills, limit to 3-4 */}
            {visibleSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {visibleSkills.map(skill => (
                        <span
                            key={skill}
                            className={`
                                inline-flex items-center px-2.5 py-1 text-xs rounded-md font-medium
                                transition-colors duration-150
                                ${job.matchedSkills?.includes(skill)
                                    ? 'bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white border border-indigo-500'
                                    : 'bg-slate-200 dark:bg-slate-700/40 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-transparent'
                                }
                            `}
                        >
                            {skill}
                        </span>
                    ))}
                    {remainingSkillsCount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs bg-slate-200 dark:bg-slate-700/40 text-slate-700 dark:text-slate-400 rounded-md font-medium">
                            +{remainingSkillsCount} more
                        </span>
                    )}
                </div>
            )}

            {/* Match explanation - compact view */}
            {!compact && job.matchExplanation && (
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-700/30 rounded-lg text-xs">
                    <span className="text-slate-600 dark:text-slate-400 mr-1.5 font-medium">Why we matched:</span>
                    <span className="text-slate-700 dark:text-slate-300">{job.matchExplanation}</span>
                </div>
            )}

            {/* Footer: Salary and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
                {job.salary && (
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {job.salary}
                    </span>
                )}
                <div className="flex gap-2 ml-auto">
                    {applied ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-lg text-sm font-medium">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20,6 9,17 4,12" />
                            </svg>
                            Applied
                        </span>
                    ) : (
                        <button
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-[#4E8EDC] dark:hover:bg-[#5BA3E8] text-white dark:text-[#121212] rounded-lg text-sm font-medium transition-colors duration-150 shadow-sm hover:shadow"
                            onClick={(e) => { e.stopPropagation(); onApply(job); }}
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
