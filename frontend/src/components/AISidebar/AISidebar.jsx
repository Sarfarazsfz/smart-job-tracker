import { useState, useRef, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function AISidebar({ onClose, onJobSelect }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I\'m your AI job assistant.  Ask me to find jobs, or ask questions about the platform.',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const messagesEndRef = useRef(null)

    useEffect(() => {
        fetchSuggestions()
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchSuggestions = async () => {
        try {
            const res = await fetch(`${API_URL}/chat/suggestions`)
            const data = await res.json()
            setSuggestions(data.suggestions || [])
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        }
    }

    const sendMessage = async (messageText) => {
        const text = messageText || input.trim()
        if (!text) return

        const userMessage = {
            role: 'user',
            content: text,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            })

            const data = await res.json()
            const response = data.response

            const assistantMessage = {
                role: 'assistant',
                content: response.message,
                jobs: response.jobs || [],
                type: response.type,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Error sending message:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    return (
        <div className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/50 backdrop-blur-sm z-50" onClick={onClose}>
            <div
                className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-[#1D1F23] border-l border-slate-200 dark:border-[rgba(255,255,255,0.06)] shadow-2xl flex flex-col animate-slide-in-right"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">🤖</div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-[#E4E6EB]">AI Assistant</h3>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Online
                            </div>
                        </div>
                    </div>
                    <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        onClick={onClose}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 text-base sm:text-lg">
                                    🤖
                                </div>
                            )}
                            <div className={`flex-1 max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                <div className={`p-2.5 sm:p-3 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-100 dark:bg-[#252729] text-slate-900 dark:text-[#E4E6EB]'
                                    }`}>
                                    <p className="text-[13px] sm:text-sm leading-relaxed break-words">{msg.content}</p>
                                </div>

                                {/* Job Cards */}
                                {msg.jobs && msg.jobs.length > 0 && (
                                    <div className="mt-2 sm:mt-3 space-y-2">
                                        {msg.jobs.map(job => (
                                            <div key={job.id} className="bg-white dark:bg-[#252729] border border-slate-200 dark:border-[rgba(255,255,255,0.06)] rounded-xl p-2.5 sm:p-3 space-y-2">
                                                <div className="flex items-start gap-3">
                                                    <img
                                                        src={job.companyLogo}
                                                        alt={job.company}
                                                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-700"
                                                        onError={(e) => {
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6366f1&color=fff`
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-slate-900 dark:text-[#E4E6EB]">{job.title}</div>
                                                        <div className="text-xs text-slate-600 dark:text-[#8A8D91]">{job.company}</div>
                                                    </div>
                                                    {job.matchScore !== undefined && (
                                                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                                                            {job.matchScore}%
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#8A8D91]">
                                                    <span>{job.location}</span>
                                                    <span>•</span>
                                                    <span>{job.workMode}</span>
                                                </div>
                                                <a
                                                    href={job.applyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full text-center px-3 py-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-[#4E8EDC] dark:hover:bg-[#5BA3E8] text-white dark:text-[#121212] rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    View Job
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-slate-500 dark:text-slate-500' : 'text-slate-500 dark:text-slate-500'}`}>
                                    {formatTime(msg.timestamp)}
                                </div>
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                                    👤
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {loading && (
                        <div className="flex gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 text-base sm:text-lg">
                                🤖
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-2xl">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && suggestions.length > 0 && (
                    <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 space-y-2">
                        <div className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">Try asking:</div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {suggestions.slice(0, 4).map((sug, index) => (
                                <button
                                    key={index}
                                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[11px] sm:text-xs transition-colors border border-slate-200 dark:border-slate-700"
                                    onClick={() => sendMessage(sug.text)}
                                >
                                    {sug.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-3 sm:p-4 md:p-6 border-t border-slate-200 dark:border-[rgba(255,255,255,0.06)] safe-area-inset-bottom">
                    <div className="flex gap-2">
                        <textarea
                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                            placeholder="Ask me anything about jobs..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 min-w-[44px] sm:min-w-0"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
