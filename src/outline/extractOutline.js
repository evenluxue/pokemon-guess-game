import { traceContours } from './contourTrace'

function contourToPath(points) {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  const move = `M ${first.x} ${first.y}`
  const lines = rest.map((p) => `L ${p.x} ${p.y}`).join(' ')
  return `${move} ${lines} Z`
}

/**
 * Rasterize a loaded sprite to a downscaled canvas, read its alpha channel, and
 * build an SVG path string for the silhouette outline.
 *
 * @param {HTMLImageElement} img  a fully loaded, CORS-clean image
 * @returns {{ d: string, viewBox: string, width: number, height: number }}
 * @throws if the image is not loaded, the canvas is tainted, or no contour is found
 */
export function extractOutline(img, { maxSize = 160, threshold = 128 } = {}) {
  const natW = img.naturalWidth || img.width
  const natH = img.naturalHeight || img.height
  if (!natW || !natH) throw new Error('image not loaded')

  const scale = Math.min(1, maxSize / Math.max(natW, natH))
  const w = Math.max(1, Math.round(natW * scale))
  const h = Math.max(1, Math.round(natH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)

  let data
  try {
    data = ctx.getImageData(0, 0, w, h).data
  } catch {
    throw new Error('canvas tainted (CORS)')
  }

  const alpha = new Uint8ClampedArray(w * h)
  for (let i = 0; i < w * h; i++) alpha[i] = data[i * 4 + 3]

  const contours = traceContours(alpha, w, h, threshold)
  const significant = contours
    .filter((c) => c.length >= 8)
    .sort((a, b) => b.length - a.length)
  // Use only the longest contour (the outer boundary) so inner sub-paths don't
  // appear early — SVG applies stroke-dashoffset per sub-path, not globally.
  const outer = significant[0] ?? contours.sort((a, b) => b.length - a.length)[0]
  if (!outer) throw new Error('no contour found')

  const d = contourToPath(outer)
  return { d, viewBox: `0 0 ${w} ${h}`, width: w, height: h }
}
