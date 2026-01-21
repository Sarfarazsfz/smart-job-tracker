import { useState, useRef, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function StickyAssistant() {
    const [isExpanded, setIsExpanded] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I\'m your AI job assistant. Ask me to find jobs, or ask questions about the platform.',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (isExpanded) {
            scrollToBottom()
        }
    }, [messages, isExpanded])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const sendMessage = async () => {
        const text = input.trim()
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
        <>
            {/* Sticky Bottom Panel - Desktop Only */}
            <div className="hidden lg:block fixed bottom-0 right-6 z-40">
                {isExpanded ? (
                    /* Expanded Chat Panel */
                    <div className="bg-white dark:bg-[#1D1F23] border border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-2xl w-[360px] h-[500px] flex flex-col mb-0 animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center text-lg">
                                    🤖
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-500">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        Online
                                    </div>
                                </div>
                            </div>
                            <button
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={() => setIsExpanded(false)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="19 12 5 12"></polyline>
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                                            🤖
                                        </div>
                                    )}
                                    <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                        <div className={`p-2.5 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-slate-900 dark:text-white'
                                            }`}>
                                            <p className="text-xs leading-relaxed break-words">{msg.content}</p>
                                        </div>
                                        <div className="text-[9px] mt-1 text-slate-500 dark:text-slate-500">
                                            {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                                            👤
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {loading && (
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                                        🤖
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-2xl">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="Ask me anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                />
                                <button
                                    className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Collapsed Bar */
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="bg-white dark:bg-[#1D1F23] border border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-lg hover:shadow-xl transition-all px-4 py-3 flex items-center gap-3 mb-0 group"
                    >
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            🤖
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">Assistant</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-500">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Online
                            </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </button>
                )}
            </div>
        </>
    )
}
