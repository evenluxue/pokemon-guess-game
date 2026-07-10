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

  it('renders starter chains and the Eevee hub for evolution slides', () => {
    const slide = {
      type: 'evolution', titleZh: '进化', titleEn: 'Evo',
      groups: [
        {
          titleZh: '御三家', titleEn: 'Starters', layout: 'chains',
          chains: [
            [{ id: 1, nameEn: 'Bulbasaur', nameZh: '妙蛙种子' }, { id: 2, nameEn: 'Ivysaur', nameZh: '妙蛙草' }],
            [{ id: 4, nameEn: 'Charmander', nameZh: '小火龙' }, { id: 5, nameEn: 'Charmeleon', nameZh: '火恐龙' }],
          ],
        },
        {
          titleZh: '伊布', titleEn: 'Eevee', layout: 'hub',
          center: { id: 133, nameEn: 'Eevee', nameZh: '伊布' },
          members: [
            { id: 134, nameEn: 'Vaporeon', nameZh: '水伊布' },
            { id: 135, nameEn: 'Jolteon', nameZh: '雷伊布' },
          ],
        },
      ],
    }
    const { container } = render(<LessonSlide slide={slide} />)
    expect(screen.getByText('妙蛙种子')).toBeTruthy()
    expect(screen.getByText('小火龙')).toBeTruthy()
    // Eevee sits at the hub center with radiating lines (one per evolution)
    expect(container.querySelector('.eevee-center')).toBeTruthy()
    expect(container.querySelectorAll('.eevee-line')).toHaveLength(2)
    expect(container.querySelectorAll('.eevee-spoke')).toHaveLength(2)
  })

  it('lists open-ended discussion questions for discuss slides', () => {
    const slide = {
      type: 'discuss',
      titleZh: '标题', titleEn: 'Title',
      promptZh: '提示', promptEn: 'Prompt',
      questions: [
        { zh: '问题一', en: 'Question one' },
        { zh: '问题二', en: 'Question two' },
      ],
    }
    render(<LessonSlide slide={slide} />)
    expect(screen.getByText('问题一')).toBeTruthy()
    expect(screen.getByText('Question one')).toBeTruthy()
    expect(screen.getByText('问题二')).toBeTruthy()
    expect(screen.getByText('Question two')).toBeTruthy()
  })

  it('shows an illustrative image on discuss slides when provided', () => {
    const slide = {
      type: 'discuss',
      titleZh: '标题', titleEn: 'Title',
      promptZh: '提示', promptEn: 'Prompt',
      img: '/lesson/ash-pikachu.webp',
      questions: [{ zh: '问题一', en: 'Question one' }],
    }
    const { container } = render(<LessonSlide slide={slide} />)
    const img = container.querySelector('.discuss-img')
    expect(img.getAttribute('src')).toBe('/lesson/ash-pikachu.webp')
  })

  it('fires onStartGame from the transition slide button', () => {
    const onStartGame = vi.fn()
    const slide = { type: 'transition', titleZh: '游戏', titleEn: 'Game', bodyZh: '', bodyEn: '', buttonZh: '开始', buttonEn: 'Play' }
    render(<LessonSlide slide={slide} onStartGame={onStartGame} />)
    fireEvent.click(screen.getByRole('button', { name: /开始|Play/ }))
    expect(onStartGame).toHaveBeenCalled()
  })
})
