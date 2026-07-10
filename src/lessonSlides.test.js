import { describe, it, expect } from 'vitest'
import { LESSON_SLIDES } from './lessonSlides'

describe('LESSON_SLIDES', () => {
  it('has 16 slides in the planned order', () => {
    expect(LESSON_SLIDES).toHaveLength(16)
    expect(LESSON_SLIDES[0].type).toBe('quiz')
    expect(LESSON_SLIDES[15].type).toBe('transition')
  })

  it('every slide declares a known type', () => {
    const known = new Set(['quiz', 'video', 'info', 'journey', 'teams', 'evolution', 'image', 'transition', 'discuss'])
    for (const slide of LESSON_SLIDES) {
      expect(known.has(slide.type)).toBe(true)
    }
  })

  it('follows the "Ash meets Pikachu" video with a discussion slide', () => {
    const videoIndex = LESSON_SLIDES.findIndex((s) => s.titleZh === '小智第一次遇见皮卡丘')
    expect(videoIndex).toBeGreaterThan(-1)
    const next = LESSON_SLIDES[videoIndex + 1]
    expect(next.type).toBe('discuss')
    expect(next.questions.length).toBeGreaterThanOrEqual(2)
  })

  it('splits the 8 teams across the three team slides', () => {
    const teamSlides = LESSON_SLIDES.filter((s) => s.type === 'teams')
    expect(teamSlides).toHaveLength(3)
    const total = teamSlides.reduce((n, s) => n + s.teams.length, 0)
    expect(total).toBe(8)
  })

  it('opening quiz answer is B (the games)', () => {
    const quiz = LESSON_SLIDES[0]
    expect(quiz.answerKey).toBe('B')
  })

  it('embeds the three lecture videos', () => {
    const ids = LESSON_SLIDES.filter((s) => s.type === 'video').map((s) => s.youtubeId)
    expect(ids).toEqual(['C19O5xm51dk', 'xfnYDn4zrYk', 'sR1hzqn8k5w'])
  })
})
