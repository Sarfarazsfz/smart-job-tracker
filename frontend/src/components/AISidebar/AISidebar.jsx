import { useState, useRef, useEffect } from 'react'
import './AISidebar.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function AISidebar({ onClose, onJobSelect }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I\'m your AI job assistant. Ask me to find jobs, or ask questions about the platform.',
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
        <div className="sidebar-overlay" onClick={onClose}>
            <div className="sidebar ai-sidebar" onClick={e => e.stopPropagation()}>
                <div className="sidebar-header">
                    <div className="sidebar-title">
                        <div className="ai-avatar">🤖</div>
                        <div>
                            <h3>AI Assistant</h3>
                            <span className="status-indicator">
                                <span className="status-dot" />
                                Online
                            </span>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="sidebar-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            {msg.role === 'assistant' && (
                                <div className="message-avatar">🤖</div>
                            )}
                            <div className="message-content">
                                <div className="message-text">{msg.content}</div>

                                {msg.jobs && msg.jobs.length > 0 && (
                                    <div className="message-jobs">
                                        {msg.jobs.map(job => (
                                            <div key={job.id} className="inline-job-card">
                                                <div className="inline-job-header">
                                                    <img
                                                        src={job.companyLogo}
                                                        alt={job.company}
                                                        className="inline-job-logo"
                                                        onError={(e) => {
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=6366f1&color=fff`
                                                        }}
                                                    />
                                                    <div className="inline-job-info">
                                                        <div className="inline-job-title">{job.title}</div>
                                                        <div className="inline-job-company">{job.company}</div>
                                                    </div>
                                                    {job.matchScore !== undefined && (
                                                        <div className={`inline-match-badge match-${job.matchScore >= 70 ? 'high' : job.matchScore >= 40 ? 'medium' : 'low'}`}>
                                                            {job.matchScore}%
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="inline-job-meta">
                                                    <span>{job.location}</span>
                                                    <span>•</span>
                                                    <span>{job.workMode}</span>
                                                </div>
                                                <a
                                                    href={job.applyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    View Job
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="message-time">{formatTime(msg.timestamp)}</div>
                            </div>
                            {msg.role === 'user' && (
                                <div className="message-avatar user">👤</div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="message assistant">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && suggestions.length > 0 && (
                    <div className="suggestions">
                        <div className="suggestions-label">Try asking:</div>
                        <div className="suggestions-grid">
                            {suggestions.slice(0, 4).map((sug, index) => (
                                <button
                                    key={index}
                                    className="suggestion-chip"
                                    onClick={() => sendMessage(sug.text)}
                                >
                                    {sug.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="sidebar-input">
                    <textarea
                        className="chat-input"
                        placeholder="Ask me anything about jobs..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        className="send-btn"
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
    )
}
