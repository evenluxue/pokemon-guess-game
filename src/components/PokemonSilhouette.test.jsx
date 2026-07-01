import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
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
