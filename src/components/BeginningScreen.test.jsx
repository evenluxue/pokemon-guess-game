import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import BeginningScreen from './BeginningScreen'

afterEach(cleanup)

describe('BeginningScreen', () => {
  it('defaults to the Play tab, showing the difficulty cards', () => {
    render(<BeginningScreen onSelect={() => {}} onPreview={() => {}} />)
    expect(screen.getByText('Choose your trainer level.')).toBeTruthy()
  })

  it('switches to the Pokémon World tab and shows its content', () => {
    render(<BeginningScreen onSelect={() => {}} onPreview={() => {}} />)
    fireEvent.click(screen.getByText('📖 Pokémon World'))
    expect(screen.getByText('The World of Pokémon')).toBeTruthy()
    expect(screen.queryByText('Choose your trainer level.')).toBeNull()
  })

  it('switches back to the Play tab', () => {
    render(<BeginningScreen onSelect={() => {}} onPreview={() => {}} />)
    fireEvent.click(screen.getByText('📖 Pokémon World'))
    fireEvent.click(screen.getByText('🎮 Play'))
    expect(screen.getByText('Choose your trainer level.')).toBeTruthy()
  })

  it('still forwards onSelect and onPreview to the difficulty picker', () => {
    const onSelect = vi.fn()
    const onPreview = vi.fn()
    render(<BeginningScreen onSelect={onSelect} onPreview={onPreview} />)
    fireEvent.click(screen.getByText('Beginner Trainer'))
    expect(onSelect).toHaveBeenCalledWith('beginner')
    fireEvent.click(screen.getAllByText('👀 See all Pokémon in this level')[0])
    expect(onPreview).toHaveBeenCalledWith('beginner')
  })

  it('switches to the Lesson tab and shows the opening quiz', () => {
    render(<BeginningScreen onSelect={() => {}} onPreview={() => {}} />)
    fireEvent.click(screen.getByText('📣 Lesson'))
    expect(screen.getByText('你们知道宝可梦最早是从哪里来的吗?')).toBeTruthy()
  })

  it('lesson Game Time button returns to the Play tab', () => {
    render(<BeginningScreen onSelect={() => {}} onPreview={() => {}} />)
    fireEvent.click(screen.getByText('📣 Lesson'))
    // advance to the final transition slide (16 slides -> 15 next clicks)
    for (let i = 0; i < 15; i++) {
      fireEvent.click(screen.getByRole('button', { name: /下一页/ }))
    }
    fireEvent.click(screen.getByRole('button', { name: /开始猜猜看|Play Who/ }))
    expect(screen.getByText('Choose your trainer level.')).toBeTruthy()
  })
})
