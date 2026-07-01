// Moore-neighbor offsets in clockwise order starting from West.
const DIRS = [
  [-1, 0], // 0 W
  [-1, -1], // 1 NW
  [0, -1], // 2 N
  [1, -1], // 3 NE
  [1, 0], // 4 E
  [1, 1], // 5 SE
  [0, 1], // 6 S
  [-1, 1], // 7 SW
]

/**
 * Trace the outer boundary of every connected opaque region using
 * Moore-neighbor tracing. Returns an array of ordered, closed contour loops.
 * Loops shorter than 3 points (stray pixels) are dropped.
 */
export function traceContours(alpha, width, height, threshold = 128) {
  const inside = (x, y) =>
    x >= 0 && y >= 0 && x < width && y < height && alpha[y * width + x] >= threshold
  const key = (x, y) => y * width + x

  const traced = new Set()
  const contours = []
  const maxSteps = width * height * 4

  for (let sy = 0; sy < height; sy++) {
    for (let sx = 0; sx < width; sx++) {
      if (!inside(sx, sy)) continue
      if (inside(sx - 1, sy)) continue // not a left-edge boundary pixel
      if (traced.has(key(sx, sy))) continue

      const contour = []
      let cx = sx
      let cy = sy
      let backtrackDir = 0 // came from the West (outside)
      let steps = 0

      do {
        contour.push({ x: cx, y: cy })
        traced.add(key(cx, cy))

        let found = false
        for (let i = 1; i <= 8; i++) {
          const dir = (backtrackDir + i) % 8
          const nx = cx + DIRS[dir][0]
          const ny = cy + DIRS[dir][1]
          if (inside(nx, ny)) {
            backtrackDir = (dir + 4) % 8 // direction from new pixel back to current
            cx = nx
            cy = ny
            found = true
            break
          }
        }
        if (!found) break // isolated pixel
        steps++
      } while ((cx !== sx || cy !== sy) && steps < maxSteps)

      if (contour.length >= 3) contours.push(contour)
    }
  }

  return contours
}
