import { useEffect, useRef, useState } from 'react'
import { extractOutline } from '../outline/extractOutline'
import { traceDuration } from '../outline/traceDuration'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ccc"/></svg>'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// mode: preparing | tracing | silhouette | revealed | fallback
export default function PokemonSilhouette({ src, revealed, correct, wrong, alt }) {
  const [mode, setMode] = useState('preparing')
  const [outline, setOutline] = useState(null) // { d, viewBox }
  const pathRef = useRef(null)

  // Load the sprite CORS-clean and extract its outline whenever src changes.
  useEffect(() => {
    let cancelled = false
    setMode('preparing')
    setOutline(null)

    if (prefersReducedMotion()) {
      setMode('fallback')
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        const result = extractOutline(img)
        if (cancelled) return
        setOutline(result)
        setMode('tracing')
      } catch {
        if (!cancelled) setMode('fallback')
      }
    }
    img.onerror = () => {
      if (!cancelled) setMode('fallback')
    }
    img.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  // Answering always wins — jump straight to the color reveal.
  useEffect(() => {
    if (revealed) setMode('revealed')
  }, [revealed])

  // Kick off the self-drawing animation once the path is mounted.
  useEffect(() => {
    if (mode !== 'tracing' || !pathRef.current) return
    const path = pathRef.current
    const length = path.getTotalLength()
    const duration = traceDuration(length)

    path.style.transition = 'none'
    path.style.strokeDasharray = String(length)
    path.style.strokeDashoffset = String(length)
    void path.getBoundingClientRect() // force reflow so the start offset registers

    const raf = requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${duration}s linear`
      path.style.strokeDashoffset = '0'
    })
    return () => cancelAnimationFrame(raf)
  }, [mode, outline])

  function handleTraceEnd() {
    setMode((m) => (m === 'tracing' ? 'silhouette' : m))
  }

  const imgClass =
    mode === 'revealed'
      ? 'silhouette revealed'
      : mode === 'tracing'
        ? 'silhouette tracing'
        : 'silhouette'

  return (
    <div className="silhouette-wrap">
      <img
        className={imgClass}
        src={src}
        alt={revealed ? alt : 'Mystery Pokémon'}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER
        }}
      />
      {mode === 'tracing' && outline && (
        <svg
          className="trace-svg"
          viewBox={outline.viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={pathRef}
            className="trace-path"
            d={outline.d}
            onTransitionEnd={handleTraceEnd}
          />
        </svg>
      )}
      {correct && <div className="stamp correct-stamp">Correct!</div>}
      {wrong && <div className="stamp wrong-stamp">Oops!</div>}
    </div>
  )
}
