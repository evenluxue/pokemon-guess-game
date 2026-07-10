import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import LessonSlide from './LessonSlide'

afterEach(cleanup)

describe('LessonSlide', () => {
  it('hides the quiz answer until revealed, then shows it', () => {
    const slide = {
      type: 'quiz', qZh: 'Q', qEn: 'Q',
      options: [{ key: 'A', textZh: '甲', textEn: 'a' }, { key: 'B', textZh: '乙', textEn: 'b' }],
      answerKey: 'B', revealZh: '答案乙', revealEn: 'answer b',
    }
    render(<LessonSlide slide={slide} />)
    expect(screen.queryByText('答案乙')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /揭晓答案|Reveal/ }))
    expect(screen.getByText('答案乙')).toBeTruthy()
  })

  it('embeds a YouTube iframe and a fallback link for video slides', () => {
    const slide = { type: 'video', titleZh: '视频', titleEn: 'Video', descZh: '', descEn: '', youtubeId: 'abc123' }
    const { container } = render(<LessonSlide slide={slide} />)
    const iframe = container.querySelector('iframe')
    expect(iframe.getAttribute('src')).toContain('youtube-nocookie.com/embed/abc123')
    expect(screen.getByRole('link').getAttribute('href')).toContain('watch?v=abc123')
  })

  it('renders team sprites with names for team slides', () => {
    const slide = {
      type: 'teams', titleZh: 'T', titleEn: 'T',
      teams: [{
        key: 'k', regionEn: 'Kanto', regionZh: '关都', resultEn: 'Top 16', resultZh: '16强',
        championship: false, members: [{ id: 25, nameEn: 'Pikachu', nameZh: '皮卡丘' }],
      }],
    }
    const { container } = render(<LessonSlide slide={slide} />)
    expect(screen.getByText('关都')).toBeTruthy()
    expect(screen.getByText('皮卡丘')).toBeTruthy()
    const img = container.querySelector('img')
    expect(img.getAttribute('src')).toContain('/25.png')
  })

  it('fires onStartGame from the transition slide button', () => {
    const onStartGame = vi.fn()
    const slide = { type: 'transition', titleZh: '游戏', titleEn: 'Game', bodyZh: '', bodyEn: '', buttonZh: '开始', buttonEn: 'Play' }
    render(<LessonSlide slide={slide} onStartGame={onStartGame} />)
    fireEvent.click(screen.getByRole('button', { name: /开始|Play/ }))
    expect(onStartGame).toHaveBeenCalled()
  })
})
