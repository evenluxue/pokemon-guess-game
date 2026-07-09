import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import DifficultyScreen from './DifficultyScreen'

afterEach(cleanup)

describe('DifficultyScreen', () => {
  it('renders a card for each difficulty level', () => {
    render(<DifficultyScreen onSelect={() => {}} onPreview={() => {}} />)
    expect(screen.getByText('Beginner Trainer')).toBeTruthy()
    expect(screen.getByText('Advanced Trainer')).toBeTruthy()
    expect(screen.getByText('Master Trainer')).toBeTruthy()
  })

  it('calls onSelect with the chosen difficulty key', () => {
    const onSelect = vi.fn()
    render(<DifficultyScreen onSelect={onSelect} onPreview={() => {}} />)
    fireEvent.click(screen.getByText('Advanced Trainer'))
    expect(onSelect).toHaveBeenCalledWith('advanced')
  })

  it('renders a preview roster link for each level', () => {
    render(<DifficultyScreen onSelect={() => {}} onPreview={() => {}} />)
    expect(screen.getAllByText('👀 See all Pokémon in this level')).toHaveLength(3)
  })

  it('calls onPreview (not onSelect) when a preview link is clicked', () => {
    const onSelect = vi.fn()
    const onPreview = vi.fn()
    render(<DifficultyScreen onSelect={onSelect} onPreview={onPreview} />)
    fireEvent.click(screen.getAllByText('👀 See all Pokémon in this level')[1])
    expect(onPreview).toHaveBeenCalledWith('advanced')
    expect(onSelect).not.toHaveBeenCalled()
  })
})
