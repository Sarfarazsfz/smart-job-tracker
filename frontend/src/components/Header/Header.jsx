import { useState } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Header({
    activeTab,
    onTabChange,
    onResumeClick,
    onAIClick,
    onFilterClick,
    hasResume,
    filters,
    onFilterChange,
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [savedJobsOpen, setSavedJobsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Mock notifications data
    const notifications = [
        { id: 1, text: "New job match: Senior Developer at Google", time: "2h ago", unread: true },
        { id: 2, text: "Application status updated for Meta position", time: "5h ago", unread: true },
        { id: 3, text: "3 new jobs matching your profile", time: "1d ago", unread: false },
    ];

    // Mock saved jobs data
    const savedJobs = [
        { id: 1, title: "Senior React Developer", company: "Google", logo: "https://ui-avatars.com/api/?name=Google&background=4285f4&color=fff" },
        { id: 2, title: "Full Stack Engineer", company: "Meta", logo: "https://ui-avatars.com/api/?name=Meta&background=0668E1&color=fff" },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    const handleTabChange = (tab) => {
        onTabChange(tab);
        setMobileMenuOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // TODO: Connect to job filtering logic
        console.log("Search query:", searchQuery);
    };

    // Tooltip component
    const Tooltip = ({ text, children }) => (
        <div className="relative group">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
        </div>
    );

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#1D1F23] shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-[1200px] mx-auto px-3 sm:px-4 h-[52px] flex items-center justify-between gap-2">

                {/* Logo */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-2xl sm:text-3xl">💼</span>
                    <span className="hidden sm:block text-lg font-semibold text-blue-700 dark:text-blue-400">
                        Job<span className="text-gray-900 dark:text-white">AI</span>
                    </span>
                </div>

                {/* Search Bar - Desktop */}
                <form onSubmit={handleSearch} className="hidden md:block flex-shrink-0">
                    <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search jobs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[200px] lg:w-[280px] h-[34px] pl-9 pr-3 text-sm bg-[#EDF3F8] dark:bg-[#38434F] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                    </div>
                </form>

                {/* Left-Aligned Navigation Icons */}
                <nav className="hidden md:flex items-center flex-1 gap-0.5 ml-2">

                    {/* Jobs Icon */}
                    <Tooltip text="Jobs">
                        <button
                            onClick={() => onTabChange("jobs")}
                            className={`relative flex flex-col items-center justify-center h-[52px] px-3 transition-all duration-150 ${activeTab === "jobs"
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                            </svg>
                            <span className="text-[11px] font-normal mt-0.5 leading-none">Jobs</span>
                            {activeTab === "jobs" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                            )}
                        </button>
                    </Tooltip>

                    {/* Notifications Icon */}
                    <Tooltip text="Notifications">
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative flex flex-col items-center justify-center h-[52px] px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-150"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                                </svg>
                                <span className="text-[11px] font-normal mt-0.5 leading-none">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1D1F23]"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#1D1F23] border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map(notif => (
                                                <div key={notif.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                    <p className="text-sm text-gray-900 dark:text-white mb-1">{notif.text}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">{notif.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Tooltip>

                    {/* Saved Jobs Icon */}
                    <Tooltip text="Saved Jobs">
                        <div className="relative">
                            <button
                                onClick={() => setSavedJobsOpen(!savedJobsOpen)}
                                className="flex flex-col items-center justify-center h-[52px] px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-150"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                                </svg>
                                <span className="text-[11px] font-normal mt-0.5 leading-none">Saved</span>
                            </button>

                            {/* Saved Jobs Dropdown */}
                            {savedJobsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setSavedJobsOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#1D1F23] border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Saved Jobs</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {savedJobs.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-500">
                                                    No saved jobs yet
                                                </div>
                                            ) : (
                                                savedJobs.map(job => (
                                                    <div key={job.id} className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3 cursor-pointer">
                                                        <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-lg" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-500">{job.company}</p>
                                                        </div>
                                                        <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Tooltip>

                    {/* Hire with AI Button */}
                    <Tooltip text="AI Assistant">
                        <button
                            onClick={onAIClick}
                            className="flex flex-col items-center justify-center h-[52px] px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-150"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z" />
                            </svg>
                            <span className="text-[11px] font-normal mt-0.5 leading-none">Hire with AI</span>
                        </button>
                    </Tooltip>

                </nav>

                {/* Right Section - Desktop */}
                <div className="hidden md:flex items-center gap-2 ml-auto">
                    {/* Applications Tab - Desktop Only */}
                    <Tooltip text="Applications">
                        <button
                            onClick={() => onTabChange("applications")}
                            className={`relative flex flex-col items-center justify-center h-[52px] px-3 transition-all duration-150 ${activeTab === "applications"
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                            <span className="text-[11px] font-normal mt-0.5 leading-none">Applications</span>
                            {activeTab === "applications" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                            )}
                        </button>
                    </Tooltip>

                    {/* Theme Toggle */}
                    <div className="ml-2">
                        <ThemeToggle />
                    </div>

                    {/* Resume Button - Styled as profile/avatar */}
                    <button
                        onClick={onResumeClick}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${hasResume
                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800"
                                : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
                            }`}
                    >
                        {hasResume ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Resume
                            </>
                        ) : (
                            "Upload Resume"
                        )}
                    </button>
                </div>

                {/* Mobile Right Section */}
                <div className="flex md:hidden items-center gap-2">
                    {/* Search Icon - Mobile */}
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {/* Mobile Menu Hamburger */}
                    <button
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1D1F23]">
                    <div className="px-3 py-3 space-y-1">
                        {["jobs", "applications"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                onResumeClick();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            {hasResume ? "✓ Resume Uploaded" : "Upload Resume"}
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
