import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import LessonScreen from './LessonScreen'
import { LESSON_SLIDES } from '../lessonSlides'

afterEach(cleanup)

describe('LessonScreen', () => {
  it('starts on slide 1 with prev disabled', () => {
    render(<LessonScreen onStartGame={() => {}} />)
    expect(screen.getByText(LESSON_SLIDES[0].qZh)).toBeTruthy()
    expect(screen.getByRole('button', { name: /上一页/ }).disabled).toBe(true)
  })

  it('advances with the next button', () => {
    render(<LessonScreen onStartGame={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /下一页/ }))
    expect(screen.getByText(LESSON_SLIDES[1].titleZh)).toBeTruthy()
  })

  it('advances and goes back with arrow keys', () => {
    render(<LessonScreen onStartGame={() => {}} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText(LESSON_SLIDES[1].titleZh)).toBeTruthy()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText(LESSON_SLIDES[0].qZh)).toBeTruthy()
  })

  it('resets a revealed quiz answer after navigating away and back', () => {
    render(<LessonScreen onStartGame={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /揭晓答案|Reveal/ }))
    expect(screen.getByText(LESSON_SLIDES[0].revealZh)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /下一页/ }))
    fireEvent.click(screen.getByRole('button', { name: /上一页/ }))
    expect(screen.queryByText(LESSON_SLIDES[0].revealZh)).toBeNull()
  })
})
