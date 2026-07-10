import { useState, useEffect, useCallback } from 'react'
import { LESSON_SLIDES } from '../lessonSlides'
import LessonSlide from './LessonSlide'

export default function LessonScreen({ onStartGame }) {
  const [current, setCurrent] = useState(0)
  const total = LESSON_SLIDES.length

  const goPrev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), [])
  const goNext = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  return (
    <div className="screen lesson-screen">
      <div className="lesson-stage">
        <LessonSlide key={current} slide={LESSON_SLIDES[current]} onStartGame={onStartGame} />
      </div>
      <div className="lesson-nav">
        <button className="lesson-nav-btn" onClick={goPrev} disabled={current === 0}>
          ‹ 上一页
        </button>
        <div className="lesson-progress" aria-hidden="true">
          {LESSON_SLIDES.map((_, i) => (
            <span key={i} className={i === current ? 'lesson-dot active' : 'lesson-dot'} />
          ))}
        </div>
        <button className="lesson-nav-btn" onClick={goNext} disabled={current === total - 1}>
          下一页 ›
        </button>
      </div>
    </div>
  )
}
