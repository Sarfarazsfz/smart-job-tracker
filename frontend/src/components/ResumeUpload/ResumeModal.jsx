import { useState, useRef } from 'react'
import './ResumeModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function ResumeModal({ onClose, onUpload, hasExisting }) {
    const [file, setFile] = useState(null)
    const [text, setText] = useState('')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [mode, setMode] = useState('upload') // 'upload' or 'paste'
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (selectedFile) => {
        setError('')

        const allowedTypes = ['application/pdf', 'text/plain']
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Please upload a PDF or TXT file')
            return
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB')
            return
        }

        setFile(selectedFile)
    }

    const handleUpload = async () => {
        setError('')
        setUploading(true)

        try {
            if (mode === 'upload' && file) {
                const formData = new FormData()
                formData.append('file', file)

                const res = await fetch(`${API_URL}/resume/upload`, {
                    method: 'POST',
                    body: formData
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || 'Upload failed')
                }

                onUpload()
            } else if (mode === 'paste' && text.trim()) {
                const res = await fetch(`${API_URL}/resume/text`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || 'Save failed')
                }

                onUpload()
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    const isValid = (mode === 'upload' && file) || (mode === 'paste' && text.trim().length >= 50)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal resume-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="modal-header">
                    <div className="modal-icon">📄</div>
                    <h2>{hasExisting ? 'Update Your Resume' : 'Upload Your Resume'}</h2>
                    <p>Help us find the best job matches for you</p>
                </div>

                <div className="mode-tabs">
                    <button
                        className={`mode-tab ${mode === 'upload' ? 'active' : ''}`}
                        onClick={() => setMode('upload')}
                    >
                        Upload File
                    </button>
                    <button
                        className={`mode-tab ${mode === 'paste' ? 'active' : ''}`}
                        onClick={() => setMode('paste')}
                    >
                        Paste Text
                    </button>
                </div>

                {mode === 'upload' ? (
                    <div
                        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.txt"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            hidden
                        />

                        {file ? (
                            <div className="file-preview">
                                <div className="file-icon">
                                    {file.type === 'application/pdf' ? '📕' : '📝'}
                                </div>
                                <div className="file-info">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                                <button
                                    className="remove-file"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="upload-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17,8 12,3 7,8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <p className="upload-text">
                                    <strong>Click to upload</strong> or drag and drop
                                </p>
                                <p className="upload-hint">PDF or TXT (max 10MB)</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="paste-zone">
                        <textarea
                            className="paste-textarea"
                            placeholder="Paste your resume text here...&#10;&#10;Include your skills, experience, education, and any other relevant information."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="char-count">
                            {text.length} characters {text.length < 50 && '(minimum 50)'}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        {hasExisting ? 'Cancel' : 'Skip for now'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={!isValid || uploading}
                    >
                        {uploading ? (
                            <>
                                <div className="spinner" />
                                Processing...
                            </>
                        ) : (
                            hasExisting ? 'Update Resume' : 'Upload Resume'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
