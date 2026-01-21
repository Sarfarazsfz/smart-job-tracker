import { useState, useEffect } from 'react'

export default function HeroTyping() {
    const line1 = "Upload your resume once,"
    const line2 = "and let AI match you with the right jobs."

    const [displayedLine1, setDisplayedLine1] = useState('')
    const [displayedLine2, setDisplayedLine2] = useState('')
    const [line1Complete, setLine1Complete] = useState(false)
    const [showCursor, setShowCursor] = useState(true)
    const [currentIndex1, setCurrentIndex1] = useState(0)
    const [currentIndex2, setCurrentIndex2] = useState(0)

    // Type line 1
    useEffect(() => {
        if (currentIndex1 < line1.length) {
            const timeout = setTimeout(() => {
                setDisplayedLine1(prev => prev + line1[currentIndex1])
                setCurrentIndex1(prev => prev + 1)
            }, 50)

            return () => clearTimeout(timeout)
        } else if (currentIndex1 === line1.length && !line1Complete) {
            const timeout = setTimeout(() => {
                setLine1Complete(true)
            }, 200)
            return () => clearTimeout(timeout)
        }
    }, [currentIndex1, line1, line1Complete])

    // Type line 2 after line 1 completes
    useEffect(() => {
        if (line1Complete && currentIndex2 < line2.length) {
            const timeout = setTimeout(() => {
                setDisplayedLine2(prev => prev + line2[currentIndex2])
                setCurrentIndex2(prev => prev + 1)
            }, 50)

            return () => clearTimeout(timeout)
        }
    }, [currentIndex2, line2, line1Complete])

    // Blinking cursor
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev)
        }, 530)

        return () => clearInterval(cursorInterval)
    }, [])

    return (
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-[#E4E6EB] leading-tight">
                {displayedLine1}
                {!line1Complete && (
                    <span
                        className={`inline-block w-0.5 h-8 md:h-10 lg:h-12 ml-1 bg-indigo-500 dark:bg-[#4E8EDC] align-middle transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                )}
            </h1>
            {line1Complete && (
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-[#E4E6EB] leading-tight">
                    {displayedLine2}
                    <span
                        className={`inline-block w-0.5 h-8 md:h-10 lg:h-12 ml-1 bg-indigo-500 dark:bg-[#4E8EDC] align-middle transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                </h1>
            )}
        </div>
    )
}
