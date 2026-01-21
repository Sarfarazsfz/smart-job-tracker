import { useState, useEffect, useRef } from 'react'
import JobCard from './JobCard'
import JobDetailModal from '../JobDetail/JobDetailModal'
import HeroTyping from '../HeroTyping/HeroTyping'
import Pagination from '../Pagination/Pagination'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function JobFeed({
    jobs,
    totalJobs = jobs.length, // ✅ SAFE DEFAULT (VERY IMPORTANT)
    loading,
    hasResume,
    onApply,
    applications,
    currentPage,
    totalPages,
    onPageChange
}) {
    const [bestMatches, setBestMatches] = useState([])
    const [loadingBest, setLoadingBest] = useState(false)
    const [selectedJob, setSelectedJob] = useState(null)
    const jobFeedRef = useRef(null)

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

    const isApplied = (jobId) =>
        applications?.some(app => app.jobId === jobId)

    const handleJobClick = (job) => {
        setSelectedJob(job)
    }

    // Scroll to top on page change
    useEffect(() => {
        if (jobFeedRef.current) {
            setTimeout(() => {
                jobFeedRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 80)
        }
    }, [currentPage, jobs.length])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-[3px] border-slate-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Fetching latest opportunities...
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-12" ref={jobFeedRef}>
                {/* Hero */}
                <div className="mb-8 md:mb-12">
                    <HeroTyping />
                </div>

                {/* Best Matches (correctly hidden on filters / page > 1) */}
                {hasResume &&
                    bestMatches.length > 0 &&
                    totalJobs > 0 &&
                    currentPage === 1 &&
                    !jobs.length === false &&
                    (
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-[#E4E6EB]">
                                    Best Matches For You
                                </h2>
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-3 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                    TAILORED
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bestMatches.slice(0, 4).map((job, index) => (
                                    <JobCard
                                        key={job.id || `${job.company}-${index}`}
                                        job={job}
                                        index={index}
                                        onApply={onApply}
                                        applied={isApplied(job.id)}
                                        onJobClick={handleJobClick}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                {/* All Jobs */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-[#E4E6EB]">
                            All Jobs
                        </h2>
                        <div className="px-4 py-1.5 bg-slate-100 dark:bg-[#252729] border border-slate-200 dark:border-[rgba(255,255,255,0.06)] rounded-xl text-xs font-semibold text-slate-600 dark:text-[#8A8D91]">
                            {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'} found
                        </div>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-16 md:p-20 text-center">
                            <div className="text-3xl mb-4">🔍</div>
                            <h3 className="text-lg font-semibold">No matching jobs</h3>
                            <p className="text-sm opacity-70">
                                Try adjusting your filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {jobs.map((job, index) => (
                                    <JobCard
                                        key={job.id || `${job.company}-${index}`}
                                        job={job}
                                        index={index}
                                        onApply={onApply}
                                        applied={isApplied(job.id)}
                                        onJobClick={handleJobClick}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center mt-6">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={onPageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}
        </>
    )
}
