import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import StartScreen from './StartScreen'

afterEach(cleanup)

describe('StartScreen', () => {
  it('shows the chosen difficulty label and subtitle', () => {
    render(<StartScreen difficulty="advanced" onChangeDifficulty={() => {}} onStart={() => {}} />)
    expect(screen.getByText('Advanced Trainer')).toBeTruthy()
    expect(screen.getByText(/Gen 1–3/)).toBeTruthy()
  })

  it('calls onChangeDifficulty when "Change level" is clicked', () => {
    const onChangeDifficulty = vi.fn()
    render(<StartScreen difficulty="beginner" onChangeDifficulty={onChangeDifficulty} onStart={() => {}} />)
    fireEvent.click(screen.getByText('‹ Change level'))
    expect(onChangeDifficulty).toHaveBeenCalled()
  })

  it('calls onStart with the selected round count', () => {
    const onStart = vi.fn()
    render(<StartScreen difficulty="beginner" onChangeDifficulty={() => {}} onStart={onStart} />)
    fireEvent.click(screen.getByText('15'))
    fireEvent.click(screen.getByText('Play'))
    expect(onStart).toHaveBeenCalledWith(15)
  })
})
