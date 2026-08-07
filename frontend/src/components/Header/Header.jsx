import { useState } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import { BriefcaseBusiness, ClipboardList, Menu, X } from "lucide-react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Header({
    activeTab,
    onTabChange,
    onResumeClick,
    onAIClick,
    hasResume,
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleTabChange = (tab) => {
        onTabChange(tab);
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#1D1F23] shadow-sm border-b border-gray-200 dark:border-[rgba(255,255,255,0.06)]">
            <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
                
                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2 flex-shrink-0 cursor-default">
                        <BriefcaseBusiness className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            JobMatch AI
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <button
                            onClick={() => onTabChange("jobs")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === "jobs"
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            <BriefcaseBusiness className="w-4 h-4" />
                            Jobs
                        </button>
                        <button
                            onClick={() => onTabChange("applications")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === "applications"
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            <ClipboardList className="w-4 h-4" />
                            Applications
                        </button>
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    
                    <button
                        onClick={onResumeClick}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                            hasResume
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                    >
                        {hasResume ? "Resume Active" : "Upload Resume"}
                    </button>

                    <div className="flex items-center pl-3 border-l border-slate-200 dark:border-slate-700">
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-3">
                    <ThemeToggle />
                    <button
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1D1F23]">
                    <div className="p-4 space-y-2">
                        <button
                            onClick={() => handleTabChange("jobs")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                activeTab === "jobs"
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    : "text-slate-600 dark:text-slate-400"
                            }`}
                        >
                            <BriefcaseBusiness className="w-5 h-5" />
                            Jobs
                        </button>
                        <button
                            onClick={() => handleTabChange("applications")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                activeTab === "applications"
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    : "text-slate-600 dark:text-slate-400"
                            }`}
                        >
                            <ClipboardList className="w-5 h-5" />
                            Applications
                        </button>
                        <button
                            onClick={() => {
                                onResumeClick();
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                                hasResume
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                        >
                            {hasResume ? "Resume Active" : "Upload Resume"}
                        </button>
                        
                        <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                            <SignedIn>
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <UserButton />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">My Account</span>
                                </div>
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full text-center px-4 py-3 rounded-xl text-sm font-medium bg-indigo-600 text-white shadow-sm">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
