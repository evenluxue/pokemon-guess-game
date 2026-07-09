import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import DifficultyScreen from './DifficultyScreen'

afterEach(cleanup)

describe('DifficultyScreen', () => {
  it('renders a card for each difficulty level', () => {
    render(<DifficultyScreen onSelect={() => {}} />)
    expect(screen.getByText('Beginner Trainer')).toBeTruthy()
    expect(screen.getByText('Advanced Trainer')).toBeTruthy()
    expect(screen.getByText('Master Trainer')).toBeTruthy()
  })

  it('calls onSelect with the chosen difficulty key', () => {
    const onSelect = vi.fn()
    render(<DifficultyScreen onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Advanced Trainer'))
    expect(onSelect).toHaveBeenCalledWith('advanced')
  })
})
