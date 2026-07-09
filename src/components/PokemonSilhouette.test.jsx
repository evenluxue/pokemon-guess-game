import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import PokemonSilhouette from './PokemonSilhouette'

afterEach(cleanup)

describe('PokemonSilhouette', () => {
  it('shows a mystery black silhouette before the answer', () => {
    render(<PokemonSilhouette src="/x.png" revealed={false} alt="Pikachu" />)
    const img = screen.getByAltText('Mystery Pokémon')
    expect(img).toBeTruthy()
    expect(img.className).toContain('silhouette')
    expect(img.className).not.toContain('revealed')
  })

  it('reveals the named color sprite once answered', async () => {
    render(<PokemonSilhouette src="/x.png" revealed alt="Pikachu" />)
    const img = await screen.findByAltText('Pikachu')
    expect(img.className).toContain('revealed')
  })

  it('renders the correct stamp when correct', () => {
    render(<PokemonSilhouette src="/x.png" revealed correct alt="Pikachu" />)
    expect(screen.getByText('Correct!')).toBeTruthy()
  })

  it('renders the oops stamp when wrong', () => {
    render(<PokemonSilhouette src="/x.png" revealed wrong alt="Pikachu" />)
    expect(screen.getByText('Oops!')).toBeTruthy()
  })
})

describe('image load failures', () => {
  it('retries the same URL before giving up', async () => {
    vi.useFakeTimers()
    try {
      render(<PokemonSilhouette src="/bad.png" revealed={false} alt="Pikachu" />)
      const firstSrc = screen.getByAltText('Mystery Pokémon').src

      fireEvent.error(screen.getByAltText('Mystery Pokémon'))
      await act(() => vi.advanceTimersByTimeAsync(1000))

      // still a real <img> silhouette (not the error placeholder) retrying
      // the actual sprite URL, not a swap to some unrelated placeholder image
      const retried = screen.getByAltText('Mystery Pokémon')
      expect(retried.className).toContain('silhouette')
      expect(retried.src).toContain('/bad.png')
      expect(retried.src).not.toBe(firstSrc)
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows a distinct, non-silhouette placeholder once retries are exhausted', async () => {
    vi.useFakeTimers()
    try {
      render(<PokemonSilhouette src="/bad.png" revealed={false} alt="Pikachu" />)

      fireEvent.error(screen.getByAltText('Mystery Pokémon'))
      await act(() => vi.advanceTimersByTimeAsync(1000))
      fireEvent.error(screen.getByAltText('Mystery Pokémon'))
      await act(() => vi.advanceTimersByTimeAsync(1000))
      fireEvent.error(screen.getByAltText('Mystery Pokémon'))

      const placeholder = screen.getByLabelText('Image unavailable')
      // must NOT carry the exact 'silhouette' class — that's the one with
      // filter: brightness(0), which is what turned this into a black square
      expect(placeholder.className.split(' ')).not.toContain('silhouette')
    } finally {
      vi.useRealTimers()
    }
  })
})
