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

    const handleTabChange = (tab) => {
        onTabChange(tab);
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#1D1F23] shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-[1128px] mx-auto px-3 sm:px-6 h-[60px] sm:h-[64px] flex items-center justify-between">
                {/* Left Section: Logo + Navigation */}
                <div className="flex items-center gap-2">
                    {/* Mobile Filter Button - Only on Jobs tab */}
                    {activeTab === 'jobs' && (
                        <button
                            onClick={onFilterClick}
                            className="lg:hidden p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                            aria-label="Open Filters"
                        >
                            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </button>
                    )}

                    {/* Logo */}
                    <div className="flex items-center gap-2 mr-2 cursor-pointer">
                        <span className="text-3xl sm:text-3xl">💼</span>
                        <span className="hidden sm:block text-xl font-semibold text-blue-700 dark:text-blue-400">
                            JobMatch<span className="text-gray-900 dark:text-white">AI</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center h-[64px] ml-2 sm:ml-4">
                        {[
                            {
                                key: "jobs",
                                label: "Jobs",
                                icon: (
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                                    </svg>
                                )
                            },
                            {
                                key: "applications",
                                label: "Applications",
                                icon: (
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                    </svg>
                                )
                            },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key)}
                                className={`
                                    relative h-full px-3 sm:px-4 flex flex-col items-center justify-center gap-1
                                    transition-all duration-150 ease-in-out
                                    ${activeTab === tab.key
                                        ? "text-gray-900 dark:text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }
                                    hover:bg-gray-100 dark:hover:bg-gray-800/50
                                `}
                            >
                                <div className="relative">
                                    {tab.icon}
                                </div>
                                <span className="text-[13px] font-normal leading-tight">{tab.label}</span>
                                {activeTab === tab.key && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-t" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>

                    {/* AI Assistant Button */}
                    <button
                        onClick={onAIClick}
                        className="hidden lg:flex flex-col items-center justify-center h-[64px] px-3 sm:px-4
                            text-gray-600 dark:text-gray-400 
                            hover:text-gray-900 dark:hover:text-white
                            hover:bg-gray-100 dark:hover:bg-gray-800/50
                            transition-all duration-150 ease-in-out"
                    >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z" />
                        </svg>
                        <span className="text-[13px] font-normal leading-tight mt-0.5">AI</span>
                    </button>

                    {/* Resume Button */}
                    <button
                        onClick={onResumeClick}
                        className={`
                            hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                            transition-all duration-150 ease-in-out
                            ${hasResume
                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-blue-600"
                            }
                        `}
                    >
                        {hasResume ? (
                            <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Resume
                            </>
                        ) : (
                            "Upload Resume"
                        )}
                    </button>

                    {/* Mobile Menu Hamburger */}
                    <button
                        className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-7 h-7 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1D1F23] shadow-lg">
                    <div className="px-4 py-3 space-y-2">
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search jobs…"
                            value={filters?.query || ""}
                            onChange={(e) =>
                                onFilterChange?.({ ...filters, query: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-md text-sm
                                bg-gray-50 dark:bg-gray-800
                                border border-gray-200 dark:border-gray-700
                                text-gray-900 dark:text-gray-100
                                placeholder-gray-500 dark:placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />

                        {/* Mobile Nav Buttons */}
                        <button
                            onClick={() => handleTabChange("jobs")}
                            className={`w-full px-3 py-2.5 rounded-md text-left flex items-center gap-3 transition-colors duration-150
                                ${activeTab === 'jobs'
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                            </svg>
                            <span className="text-sm font-medium">Browse Jobs</span>
                        </button>

                        <button
                            onClick={() => handleTabChange("applications")}
                            className={`w-full px-3 py-2.5 rounded-md text-left flex items-center gap-3 transition-colors duration-150
                                ${activeTab === 'applications'
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                            <span className="text-sm font-medium">My Applications</span>
                        </button>

                        <button
                            onClick={() => {
                                onAIClick();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full px-3 py-2.5 rounded-md text-left flex items-center gap-3
                                text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
                                transition-colors duration-150"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                            </svg>
                            <span className="text-sm font-medium">AI Assistant</span>
                        </button>

                        {/* Mobile Resume Button */}
                        <button
                            onClick={() => {
                                onResumeClick();
                                setMobileMenuOpen(false);
                            }}
                            className={`sm:hidden w-full px-3 py-2.5 rounded-md text-center text-sm font-semibold
                                transition-colors duration-150
                                ${hasResume
                                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {hasResume ? "✓ Resume Uploaded" : "Upload Resume"}
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
