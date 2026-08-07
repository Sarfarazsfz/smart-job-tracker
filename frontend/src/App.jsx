// src/App.jsx
import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header/Header'
import JobFeed from './components/JobFeed/JobFeed'
import FilterPanel from './components/Filters/FilterPanel'
import ApplicationTracker from './components/ApplicationTracker/ApplicationTracker'
import AISidebar from './components/AISidebar/AISidebar'
import StickyAssistant from './components/StickyAssistant/StickyAssistant'
import ResumeModal from './components/ResumeUpload/ResumeModal'
import ApplicationPopup from './components/SmartPopup/ApplicationPopup'
import Footer from './components/Footer/Footer'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { getJobAction } from './utils/jobActions'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const JOBS_PER_PAGE = 12

function App() {
  const [activeTab, setActiveTab] = useState('jobs')
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showAISidebar, setShowAISidebar] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const [showDemoMessage, setShowDemoMessage] = useState(false)
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
  const [lastUpdated, setLastUpdated] = useState(null) // Track last fetch time

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

    // 2. STRICT RANKING: Group jobs by match type, then sort within groups
    result = result.map(job => {
      const jobTitle = (job.title || '').toLowerCase()
      const jobLocation = (job.location || '').toLowerCase()

      const query = (filters.query || '').toLowerCase().trim()
      const filterLocation = (filters.location || '').toLowerCase().trim()

      // Normalize city names for better matching
      const normalizeCity = (city) => {
        const cityMap = {
          'bangalore': 'bengaluru',
          'bengaluru': 'bengaluru',
          'delhi': 'delhi',
          'new delhi': 'delhi',
          'mumbai': 'mumbai',
          'bombay': 'mumbai',
          'hyderabad': 'hyderabad'
        }
        const normalized = cityMap[city.toLowerCase()]
        return normalized || city.toLowerCase()
      }

      // Check location match (case-insensitive, normalized)
      let locationMatch = false
      if (filterLocation) {
        const normalizedFilter = normalizeCity(filterLocation)
        const normalizedJobLocation = normalizeCity(jobLocation)

        // Exact city match or contains as word boundary
        const cityPattern = new RegExp(`\\b${normalizedFilter}\\b`, 'i')
        locationMatch = cityPattern.test(normalizedJobLocation) ||
          normalizedJobLocation.includes(normalizedFilter)
      }

      // Check title match with multiple levels
      let titleMatchLevel = 0 // 0 = no match, 1 = partial, 2 = strong, 3 = exact
      if (query) {
        if (jobTitle === query) {
          titleMatchLevel = 3 // Exact match
        } else if (jobTitle.startsWith(query)) {
          titleMatchLevel = 2 // Starts with
        } else if (new RegExp(`\\b${query}\\b`, 'i').test(jobTitle)) {
          titleMatchLevel = 2 // Whole word match
        } else if (jobTitle.includes(query)) {
          titleMatchLevel = 1 // Partial match
        }
      }

      // Assign ranking group (lower number = higher priority)
      let rankGroup = 4 // Default: no match

      if (filterLocation && query) {
        // Both location and title search active
        if (locationMatch && titleMatchLevel > 0) {
          rankGroup = 1 // HIGHEST: Both match
        } else if (locationMatch) {
          rankGroup = 2 // Location match only
        } else if (titleMatchLevel > 0) {
          rankGroup = 3 // Title match only
        }
      } else if (filterLocation) {
        // Only location search
        if (locationMatch) {
          rankGroup = 1 // Location matches
        }
      } else if (query) {
        // Only title search
        if (titleMatchLevel > 0) {
          rankGroup = 1 // Title matches
        }
      }

      // Tie-breaker scores within the same rank group
      let tieBreaker = 0

      // 1. Recency (0-1000 points)
      if (job.postedDate) {
        const posted = new Date(job.postedDate)
        const now = new Date()
        const hoursDiff = (now - posted) / (1000 * 60 * 60)

        // More recent = higher score
        if (hoursDiff < 24) tieBreaker += 1000
        else if (hoursDiff < 72) tieBreaker += 800
        else if (hoursDiff < 168) tieBreaker += 600 // 1 week
        else if (hoursDiff < 720) tieBreaker += 400 // 1 month
        else tieBreaker += 200
      }

      // 2. Title match quality (0-300 points)
      tieBreaker += titleMatchLevel * 100

      // 3. Match score from resume (0-100 points)
      if (hasResume && job.matchScore) {
        tieBreaker += job.matchScore
      }

      // 4. Skill match (0-50 points)
      const selectedSkills = (filters.skills || []).map(s => s.toLowerCase())
      const jobSkills = (job.skills || []).map(s => s.toLowerCase())

      if (selectedSkills.length > 0) {
        const matchedSkills = jobSkills.filter(jobSkill =>
          selectedSkills.some(filterSkill =>
            jobSkill.includes(filterSkill) || filterSkill.includes(jobSkill)
          )
        )
        const skillMatchRatio = matchedSkills.length / selectedSkills.length
        tieBreaker += Math.floor(skillMatchRatio * 50)
      }

      return {
        ...job,
        rankGroup,           // Primary sort key
        titleMatchLevel,     // For debugging
        locationMatch,       // For debugging
        tieBreaker          // Secondary sort key
      }
    })

    // 3. STRICT SORT: First by rank group, then by tie-breaker
    result.sort((a, b) => {
      // Primary: Rank group (ascending - lower is better)
      if (a.rankGroup !== b.rankGroup) {
        return a.rankGroup - b.rankGroup
      }

      // Secondary: Tie-breaker (descending - higher is better)
      return b.tieBreaker - a.tieBreaker
    })

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
      console.log('[Resume Check] Fetching resume status from backend...')
      const res = await fetch(`${API_URL}/resume`)

      if (!res.ok) {
        console.error('[Resume Check] Backend returned error:', res.status)
        setHasResume(false) // Explicitly set to false on error
        setTimeout(() => setShowResumeModal(true), 1000)
        return
      }

      const data = await res.json()
      console.log('[Resume Check] Backend response:', data)

      // Strict boolean check to ensure we only set true when explicitly true
      const resumeExists = data.hasResume === true
      setHasResume(resumeExists)

      if (!resumeExists) {
        console.log('[Resume Check] No resume found, showing upload modal')
        setTimeout(() => setShowResumeModal(true), 1000)
      } else {
        console.log('[Resume Check] Resume already uploaded')
      }
    } catch (error) {
      console.error('[Resume Check] Error checking resume:', error)
      setHasResume(false) // Explicitly set to false on error
      setTimeout(() => setShowResumeModal(true), 1000)
    }
  }

  const fetchJobs = async (forceRefresh = false) => {
    setLoading(true)
    try {
      // Check localStorage cache first (1 hour TTL)
      const CACHE_KEY = 'job_tracker_jobs'
      const CACHE_TIMESTAMP_KEY = 'job_tracker_timestamp'
      const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

      if (!forceRefresh) {
        const cachedJobs = localStorage.getItem(CACHE_KEY)
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

        if (cachedJobs && cachedTimestamp) {
          const age = Date.now() - parseInt(cachedTimestamp)
          if (age < CACHE_DURATION) {
            console.log('✅ Using cached jobs from localStorage')
            setAllJobs(JSON.parse(cachedJobs))
            setLastUpdated(new Date(parseInt(cachedTimestamp)))
            setLoading(false)
            return
          }
        }
      }

      if (forceRefresh) {
        // Clear frontend localStorage cache
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(CACHE_TIMESTAMP_KEY)
        // Clear backend cache so providers are re-queried (not stale Redis)
        try {
          await fetch(`${API_URL}/jobs/clear-cache`, { method: 'POST' })
          console.log('🗑️ Backend job cache cleared')
        } catch (e) {
          console.warn('Could not clear backend cache:', e.message)
        }
      }

      // Fetch fresh jobs from API
      console.log('🔄 Fetching fresh jobs from API')
      const res = await fetch(`${API_URL}/jobs`)
      const data = await res.json()
      const jobs = data.jobs || []

      // Update state
      setAllJobs(jobs)

      // Cache in localStorage
      const timestamp = Date.now()
      localStorage.setItem(CACHE_KEY, JSON.stringify(jobs))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString())
      setLastUpdated(new Date(timestamp))

      console.log(`📦 Cached ${jobs.length} jobs in localStorage`)
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

    const action = getJobAction(job)
    if (action.canOpen && job.applyUrl) {
      window.open(job.applyUrl, '_blank')
    } else if (job.externalUrlType === 'demo' || !action.canOpen) {
      setShowDemoMessage(true)
      setTimeout(() => setShowDemoMessage(false), 4000)
    }
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

  const handleResumeUpload = async () => {
    setHasResume(true)
    setShowResumeModal(false)

    // Clear localStorage cache to force fresh fetch with match scores
    localStorage.removeItem('job_tracker_jobs')
    localStorage.removeItem('job_tracker_timestamp')

    // Refetch jobs with match scores
    await fetchJobs(true)
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
      <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300 bg-[#F3F2EF] dark:bg-[#121212]">
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
                  lastUpdated={lastUpdated}
                  onRefresh={() => fetchJobs(true)}
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
                  lastUpdated={lastUpdated}
                  onRefresh={() => fetchJobs(true)}
                />
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <>
              <SignedIn>
                <ApplicationTracker
                  applications={applications}
                  onStatusChange={updateApplicationStatus}
                  onRefresh={fetchApplications}
                />
              </SignedIn>
              <SignedOut>
                <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 max-w-2xl mx-auto mt-8 shadow-sm">
                  <div className="text-6xl mb-6 opacity-50">🔒</div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Sign in to track applications</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md leading-relaxed">
                    Create an account or sign in to track your job applications and manage your job search process.
                  </p>
                  <SignInButton mode="modal">
                    <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md">
                      Sign In to Continue
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
            </>
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

        {/* Demo Message Toast */}
        {showDemoMessage && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
            <div className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-sm font-medium">Demo job — external application isn't available for this sample listing.</span>
            </div>
          </div>
        )}

        {/* Sticky Assistant - Desktop Only */}
        <StickyAssistant />
      </div>
    </>
  )
}

export default App
