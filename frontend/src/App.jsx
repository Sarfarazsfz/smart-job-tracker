// src/App.jsx
import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header/Header'
import JobFeed from './components/JobFeed/JobFeed'
import FilterPanel from './components/Filters/FilterPanel'
import ApplicationTracker from './components/ApplicationTracker/ApplicationTracker'
import AISidebar from './components/AISidebar/AISidebar'
import ResumeModal from './components/ResumeUpload/ResumeModal'
import ApplicationPopup from './components/SmartPopup/ApplicationPopup'
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground'
import Footer from './components/Footer/Footer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const JOBS_PER_PAGE = 12

function App() {
  const [activeTab, setActiveTab] = useState('jobs')
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showAISidebar, setShowAISidebar] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const [pendingApplication, setPendingApplication] = useState(null)
  const [filters, setFilters] = useState({
    query: '',
    skills: [],
    datePosted: 'all',
    jobType: 'all',
    workMode: 'all',
    location: '',
    minScore: 0
  })

  // CRITICAL: Store ALL jobs fetched from API (never overwrite on filter)
  const [allJobs, setAllJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Pagination state (moved to App so filtering+sorting happen first)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    checkResume()

    // Check dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Reset page to 1 whenever any filter changes (important so users see top results)
  useEffect(() => {
    setCurrentPage(1)
  }, [
    filters.query,
    filters.location,
    filters.skills,
    filters.datePosted,
    filters.jobType,
    filters.workMode,
    filters.minScore,
    hasResume
  ])

  // CRITICAL: Client-side filtering and sorting (NO API REFETCH)
  const filteredAndSortedJobs = useMemo(() => {
    let result = [...allJobs]

    // 1. Apply filters
    result = result.filter(job => {
      // Search query filter (title, company, description)
      if (filters.query) {
        const query = filters.query.toLowerCase()
        const matchesQuery =
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
        if (!matchesQuery) return false
      }

      // Location filter
      if (filters.location) {
        const location = filters.location.toLowerCase()
        if (!job.location?.toLowerCase().includes(location)) return false
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const jobSkills = (job.skills || []).map(s => s.toLowerCase())
        const hasSkill = filters.skills.some(filterSkill =>
          jobSkills.some(jobSkill =>
            jobSkill.includes(filterSkill.toLowerCase()) ||
            filterSkill.toLowerCase().includes(jobSkill)
          )
        )
        if (!hasSkill) return false
      }

      // Date posted filter
      if (filters.datePosted && filters.datePosted !== 'all') {
        const jobDate = new Date(job.postedDate)
        const now = new Date()
        const daysDiff = (now - jobDate) / (1000 * 60 * 60 * 24)

        if (filters.datePosted === 'day' && daysDiff > 1) return false
        if (filters.datePosted === 'week' && daysDiff > 7) return false
        if (filters.datePosted === 'month' && daysDiff > 30) return false
      }

      // Job type filter
      if (filters.jobType && filters.jobType !== 'all') {
        if (job.jobType?.toLowerCase() !== filters.jobType.toLowerCase()) return false
      }

      // Work mode filter
      if (filters.workMode && filters.workMode !== 'all') {
        if (job.workMode?.toLowerCase() !== filters.workMode.toLowerCase()) return false
      }

      // Match score filter
      if (filters.minScore > 0) {
        if ((job.matchScore || 0) < filters.minScore) return false
      }

      return true
    })

    // 2. Calculate relevance score for sorting
    result = result.map(job => {
      let relevanceScore = 0

      const jobTitle = (job.title || '').toLowerCase()
      const jobCompany = (job.company || '').toLowerCase()
      const jobDescription = (job.description || '').toLowerCase()
      const jobLocation = (job.location || '').toLowerCase()
      const jobSkills = (job.skills || []).map(s => s.toLowerCase())

      const query = (filters.query || '').toLowerCase()
      const filterLocation = (filters.location || '').toLowerCase()
      const selectedSkills = (filters.skills || []).map(s => s.toLowerCase())

      // Exact title match (highest priority) - 100 points
      if (query && jobTitle.includes(query)) {
        relevanceScore += 100
      } else if (query && jobCompany.includes(query)) {
        relevanceScore += 80
      } else if (query && jobDescription.includes(query)) {
        relevanceScore += 40
      }

      // Location match - 80 points
      if (filterLocation && jobLocation.includes(filterLocation)) {
        relevanceScore += 80
      }

      // Skill match - up to 60 points
      if (selectedSkills.length > 0) {
        const matchedSkills = jobSkills.filter(jobSkill =>
          selectedSkills.some(filterSkill =>
            jobSkill.includes(filterSkill) || filterSkill.includes(jobSkill)
          )
        )
        const skillMatchRatio = matchedSkills.length / selectedSkills.length
        relevanceScore += Math.floor(skillMatchRatio * 60)
      }

      // Match score (if resume exists) - up to 50 points
      if (hasResume && job.matchScore) {
        relevanceScore += Math.floor((job.matchScore / 100) * 50)
      }

      // Recency bonus - up to 30 points
      if (job.postedDate) {
        const posted = new Date(job.postedDate)
        const now = new Date()
        const daysDiff = Math.floor((now - posted) / (1000 * 60 * 60 * 24))

        if (daysDiff <= 1) relevanceScore += 30
        else if (daysDiff <= 7) relevanceScore += 20
        else if (daysDiff <= 30) relevanceScore += 10
      }

      return { ...job, relevanceScore }
    })

    // 3. Sort by relevance score (descending)
    result.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

    return result
  }, [allJobs, filters, hasResume])

  // PAGINATION: slice the filtered & sorted array
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE
    const end = start + JOBS_PER_PAGE
    return filteredAndSortedJobs.slice(start, end)
  }, [filteredAndSortedJobs, currentPage])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedJobs.length / JOBS_PER_PAGE))

  useEffect(() => {
    // Fetch jobs + applications once on mount
    fetchJobs()
    fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications()
    }
  }, [activeTab])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pendingApplication) {
        // Trigger popup when user returns after clicking Apply
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [pendingApplication])

  const checkResume = async () => {
    try {
      const res = await fetch(`${API_URL}/resume`)
      const data = await res.json()
      setHasResume(data.hasResume)

      if (!data.hasResume) {
        setTimeout(() => setShowResumeModal(true), 1000)
      }
    } catch (error) {
      console.error('Error checking resume:', error)
    }
  }

  const fetchJobs = async () => {
    setLoading(true)
    try {
      // Fetch ALL jobs once - NO filters passed to API
      const res = await fetch(`${API_URL}/jobs`)
      const data = await res.json()
      setAllJobs(data.jobs || []) // Store in allJobs, never overwrite
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/applications`)
      const data = await res.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const handleApply = (job) => {
    setPendingApplication({
      ...job,
      clickedAt: new Date().toISOString()
    })

    // Open job URL in new tab
    window.open(job.applyUrl, '_blank')
  }

  const handleApplicationConfirm = async (confirmed, type) => {
    if (confirmed && pendingApplication) {
      try {
        await fetch(`${API_URL}/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: pendingApplication.id,
            jobTitle: pendingApplication.title,
            company: pendingApplication.company,
            applyUrl: pendingApplication.applyUrl,
            status: 'applied'
          })
        })
        fetchApplications()
      } catch (error) {
        console.error('Error saving application:', error)
      }
    }
    setPendingApplication(null)
  }

  const handleResumeUpload = () => {
    setHasResume(true)
    setShowResumeModal(false)
    fetchJobs() // Refetch only when resume is uploaded to update match scores
  }

  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      await fetch(`${API_URL}/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchApplications()
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  return (
    <>
      {/* Animated Background - renders behind all content */}
      <AnimatedBackground enabled={true} />

      <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300" style={{ backgroundColor: isDarkMode ? '#121212' : 'transparent' }}>
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onResumeClick={() => setShowResumeModal(true)}
          onAIClick={() => setShowAISidebar(!showAISidebar)}
          onFilterClick={() => setShowMobileFilters(true)}
          hasResume={hasResume}
          filters={filters}
          onFilterChange={setFilters}
        />

        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 max-w-[1600px] mx-auto w-full">
          {activeTab === 'jobs' && (
            <>
              {/* Filter Panel - Desktop Only */}
              <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-6">
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  hasResume={hasResume}
                />
                <JobFeed
                  jobs={paginatedJobs}
                  totalJobs={filteredAndSortedJobs.length}
                  loading={loading}
                  hasResume={hasResume}
                  onApply={handleApply}
                  applications={applications}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>

              {/* Mobile: Filters Drawer + Job Feed */}
              <div className="lg:hidden">
                {/* Mobile Filter Drawer */}
                {showMobileFilters && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}>
                    <div
                      className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#121212] shadow-2xl overflow-y-auto transform transition-transform duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close Button */}
                      <div className="sticky top-0 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-[rgba(255,255,255,0.06)] p-4 flex items-center justify-between z-10">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-[#E4E6EB]">Filters</h2>
                        <button
                          onClick={() => setShowMobileFilters(false)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Filter Panel Content */}
                      <div className="p-4">
                        <FilterPanel
                          filters={filters}
                          onFilterChange={(newFilters) => {
                            setFilters(newFilters);
                          }}
                          hasResume={hasResume}
                          isMobile={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <JobFeed
                  jobs={paginatedJobs}
                  loading={loading}
                  hasResume={hasResume}
                  onApply={handleApply}
                  applications={applications}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <ApplicationTracker
              applications={applications}
              onStatusChange={updateApplicationStatus}
              onRefresh={fetchApplications}
            />
          )}
        </main>

        {/* Footer */}
        <Footer />

        {/* Modals and Sidebars */}
        {showResumeModal && (
          <ResumeModal
            onClose={() => setShowResumeModal(false)}
            onUpload={handleResumeUpload}
            hasExisting={hasResume}
          />
        )}

        {showAISidebar && (
          <AISidebar onClose={() => setShowAISidebar(false)} />
        )}

        {pendingApplication && (
          <ApplicationPopup
            job={pendingApplication}
            onConfirm={handleApplicationConfirm}
          />
        )}
      </div>
    </>
  )
}

export default App
