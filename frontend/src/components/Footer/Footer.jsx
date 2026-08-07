export default function Footer() {
    return (
        <footer className="bg-white dark:bg-[#1D1F23] border-t border-gray-200 dark:border-[rgba(255,255,255,0.06)] py-12 mt-auto">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
                    
                    {/* Left: Brand & Description */}
                    <div className="flex flex-col items-center md:items-start space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-[#E4E6EB]">
                            JobMatch AI
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-[#8A8D91] max-w-xs text-center md:text-left">
                            AI-powered job discovery and resume matching.
                        </p>
                    </div>

                    {/* Right: Links & Copyright */}
                    <div className="flex flex-col items-center md:items-end space-y-4">
                        <div className="flex items-center gap-6">
                            <a
                                href="https://github.com/Sarfarazsfz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-[#8A8D91] dark:hover:text-indigo-400 transition-colors"
                            >
                                GitHub
                            </a>
                            <a
                                href="https://www.linkedin.com/in/faraz4237/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-[#8A8D91] dark:hover:text-indigo-400 transition-colors"
                            >
                                LinkedIn
                            </a>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-[#6E7074]">
                            © {new Date().getFullYear()} Md Sarfaraz Alam
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    )
}
