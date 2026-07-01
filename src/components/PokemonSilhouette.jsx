import { useEffect, useReducer, useRef } from 'react'
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

function reducer(state, action) {
  switch (action.type) {
    case 'RESET': return { phase: 'preparing', outline: null }
    case 'FALLBACK': return { phase: 'fallback', outline: null }
    case 'TRACING': return { phase: 'tracing', outline: action.outline }
    case 'SILHOUETTE': return { ...state, phase: 'silhouette' }
    default: return state
  }
}

// phase: preparing | tracing | silhouette | fallback
// revealed prop always wins and is derived at render time
export default function PokemonSilhouette({ src, revealed, correct, wrong, alt }) {
  const [{ phase, outline }, dispatch] = useReducer(reducer, { phase: 'preparing', outline: null })
  const pathRef = useRef(null)

  // Load the sprite CORS-clean and extract its outline whenever src changes.
  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'RESET' })

    if (prefersReducedMotion()) {
      dispatch({ type: 'FALLBACK' })
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        const result = extractOutline(img)
        if (!cancelled) dispatch({ type: 'TRACING', outline: result })
      } catch {
        if (!cancelled) dispatch({ type: 'FALLBACK' })
      }
    }
    img.onerror = () => {
      if (!cancelled) dispatch({ type: 'FALLBACK' })
    }
    img.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  // Kick off the self-drawing animation once the path is mounted.
  useEffect(() => {
    if (phase !== 'tracing' || !pathRef.current) return
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
  }, [phase, outline])

  function handleTraceEnd() {
    dispatch({ type: 'SILHOUETTE' })
  }

  // `revealed` prop always wins — derive the display mode without a separate effect.
  const mode = revealed ? 'revealed' : phase

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
