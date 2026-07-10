import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import ResultsScreen from './ResultsScreen'

afterEach(cleanup)

describe('ResultsScreen', () => {
  it('calls onPlayAgain when "Play Again" is clicked', () => {
    const onPlayAgain = vi.fn()
    render(
      <ResultsScreen
        score={10}
        maxScore={10}
        elapsed="0:05"
        trainerType={null}
        onPlayAgain={onPlayAgain}
        onHome={() => {}}
      />
    )
    fireEvent.click(screen.getByText('Play Again'))
    expect(onPlayAgain).toHaveBeenCalled()
  })

  it('calls onHome when "🏠 Home" is clicked', () => {
    const onHome = vi.fn()
    render(
      <ResultsScreen
        score={10}
        maxScore={10}
        elapsed="0:05"
        trainerType={null}
        onPlayAgain={() => {}}
        onHome={onHome}
      />
    )
    fireEvent.click(screen.getByText('🏠 Home'))
    expect(onHome).toHaveBeenCalled()
  })
})
