import { useState } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Header({
    activeTab,
    onTabChange,
    onResumeClick,
    onAIClick,
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
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer">
                        <span className="text-2xl">💼</span>
                        <span className="text-xl md:text-2xl font-bold tracking-tight font-[var(--font-lime)] text-slate-900 dark:text-white">
                            JobMatch
                            <span className="text-indigo-600 dark:text-indigo-400">AI</span>
                        </span>
                    </div>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 font-[var(--font-poppins)]">
                        {[
                            { key: "jobs", label: "Jobs" },
                            { key: "applications", label: "Applications" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key)}
                                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all
                                    ${activeTab === tab.key
                                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }
                                `}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-indigo-500" />
                                )}
                            </button>
                        ))}
                    </nav>
                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:block flex-1 max-w-md">
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search jobs, skills, companies…"
                                value={filters?.query || ""}
                                onChange={(e) =>
                                    onFilterChange?.({ ...filters, query: e.target.value })
                                }
                                className="
                                    w-full pl-10 pr-4 py-2.5 text-sm
                                    bg-white dark:bg-slate-800
                                    border border-slate-300 dark:border-slate-600
                                    rounded-xl
                                    shadow-sm
                                    text-slate-900 dark:text-white
                                    placeholder-slate-400
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                                    transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {/* AI Assistant */}
                        <button
                            onClick={onAIClick}
                            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                bg-slate-100 dark:bg-slate-800
                text-slate-700 dark:text-slate-300
                hover:bg-slate-200 dark:hover:bg-slate-700
                transition"
                        >
                            <div>🤖 AI Assistant</div>
                        </button>
                        {/* Resume Button */}
                        <button
                            onClick={onResumeClick}
                            className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all
                                ${hasResume
                                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                }
                            `}
                        >
                            <span className="hidden sm:inline">{hasResume ? "Resume ✓" : "Upload Resume"}</span>
                            <span className="sm:hidden">{hasResume ? "✓" : "Resume"}</span>
                        </button>

                        {/* Mobile Menu */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            ☰
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 space-y-3 font-[var(--font-poppins)]">
                        <input
                            type="text"
                            placeholder="Search jobs…"
                            value={filters?.query || ""}
                            onChange={(e) =>
                                onFilterChange?.({ ...filters, query: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl text-sm
                bg-white dark:bg-slate-800
                border border-slate-300 dark:border-slate-600
                shadow-sm
                text-slate-900 dark:text-white"
                        />

                        <button
                            onClick={() => handleTabChange("jobs")}
                            className="w-full px-4 py-3 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Browse Jobs
                        </button>

                        <button
                            onClick={() => handleTabChange("applications")}
                            className="w-full px-4 py-3 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            My Applications
                        </button>

                        <button
                            onClick={() => {
                                onAIClick();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800"
                        >
                            AI Job Assistant
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
