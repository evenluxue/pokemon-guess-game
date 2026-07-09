import { useEffect, useReducer, useRef } from 'react'
import { extractOutline } from '../outline/extractOutline'
import { traceDuration } from '../outline/traceDuration'

const TIP_SIZE = 12 // length of the travelling sparkle dot in viewBox units
const MAX_LOAD_RETRIES = 2
const LOAD_RETRY_DELAY_MS = 800

const INITIAL_STATE = { phase: 'preparing', outline: null, loadAttempt: 0, loadFailed: false }

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET': return INITIAL_STATE
    case 'FALLBACK': return { ...state, phase: 'fallback', outline: null }
    case 'TRACING': return { ...state, phase: 'tracing', outline: action.outline }
    case 'SILHOUETTE': return { ...state, phase: 'silhouette' }
    case 'RETRY': return { ...state, loadAttempt: state.loadAttempt + 1 }
    case 'LOAD_FAILED': return { ...state, loadFailed: true }
    default: return state
  }
}

// phase: preparing | tracing | silhouette | fallback
// revealed prop always wins and is derived at render time
export default function PokemonSilhouette({ src, revealed, correct, wrong, alt }) {
  const [{ phase, outline, loadAttempt, loadFailed }, dispatch] = useReducer(reducer, INITIAL_STATE)
  const pathRef = useRef(null)
  const pathGlowRef = useRef(null)
  const pathTipRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  // A sprite load can fail transiently (flaky CDN); retry a couple of times
  // before giving up, so a momentary network blip doesn't strand the player
  // on a broken image for the rest of the round.
  function handleImageError() {
    clearTimeout(retryTimeoutRef.current)
    if (loadAttempt < MAX_LOAD_RETRIES) {
      retryTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'RETRY' })
      }, LOAD_RETRY_DELAY_MS)
    } else {
      dispatch({ type: 'LOAD_FAILED' })
    }
  }

  const displaySrc = loadAttempt === 0 ? src : `${src}?retry=${loadAttempt}`

  // Load the sprite CORS-clean and extract its outline whenever src changes.
  useEffect(() => {
    let cancelled = false
    clearTimeout(retryTimeoutRef.current)
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
      clearTimeout(retryTimeoutRef.current)
    }
  }, [src])

  // Kick off the self-drawing animation once all three paths are mounted.
  useEffect(() => {
    if (
      phase !== 'tracing' ||
      !pathRef.current ||
      !pathGlowRef.current ||
      !pathTipRef.current
    ) return

    const path = pathRef.current
    const glowPath = pathGlowRef.current
    const tipPath = pathTipRef.current
    const length = path.getTotalLength()
    const duration = traceDuration(length)

    // Initialize without transitions so the starting values take effect instantly.
    path.style.transition = 'none'
    path.style.strokeDasharray = String(length)
    path.style.strokeDashoffset = String(length)

    glowPath.style.transition = 'none'
    glowPath.style.strokeDasharray = String(length)
    glowPath.style.strokeDashoffset = String(length)

    // Tip dot: travels at the leading edge of the trace.
    // dashoffset 0 → TIP_SIZE puts the dot at path position 0.
    // dashoffset (TIP_SIZE - length) puts the dot at the path's end.
    tipPath.style.transition = 'none'
    tipPath.style.strokeDasharray = `${TIP_SIZE} ${length + TIP_SIZE}`
    tipPath.style.strokeDashoffset = '0'

    void path.getBoundingClientRect() // force reflow before starting transitions

    const raf = requestAnimationFrame(() => {
      const t = `stroke-dashoffset ${duration}s linear`

      path.style.transition = t
      path.style.strokeDashoffset = '0'

      glowPath.style.transition = t
      glowPath.style.strokeDashoffset = '0'

      tipPath.style.transition = t
      tipPath.style.strokeDashoffset = `${TIP_SIZE - length}`
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
      : mode === 'tracing' || mode === 'preparing'
        ? 'silhouette tracing'
        : 'silhouette'

  return (
    <div className="silhouette-wrap">
      {loadFailed ? (
        <div className="silhouette-error" role="img" aria-label="Image unavailable">
          ?
        </div>
      ) : (
        <img
          className={imgClass}
          src={displaySrc}
          alt={revealed ? alt : 'Mystery Pokémon'}
          onError={handleImageError}
        />
      )}
      {mode === 'tracing' && outline && (
        <svg
          className="trace-svg"
          viewBox={outline.viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <path ref={pathGlowRef} className="trace-path-glow" d={outline.d} />
          <path
            ref={pathRef}
            className="trace-path"
            d={outline.d}
            onTransitionEnd={handleTraceEnd}
          />
          <path ref={pathTipRef} className="trace-path-tip" d={outline.d} />
        </svg>
      )}
      {correct && <div className="stamp correct-stamp">Correct!</div>}
      {wrong && <div className="stamp wrong-stamp">Oops!</div>}
    </div>
  )
}
