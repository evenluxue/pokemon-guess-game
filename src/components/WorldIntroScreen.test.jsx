import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import WorldIntroScreen from './WorldIntroScreen'

afterEach(cleanup)

describe('WorldIntroScreen', () => {
  it('renders all six section titles in English', () => {
    render(<WorldIntroScreen />)
    expect(screen.getByText('Trainers')).toBeTruthy()
    expect(screen.getByText('Poké Balls')).toBeTruthy()
    expect(screen.getByText('Pokémon')).toBeTruthy()
    expect(screen.getByText('Gym Leagues')).toBeTruthy()
    expect(screen.getByText('Battle & Friendship')).toBeTruthy()
    expect(screen.getByText('Level Up & Growth')).toBeTruthy()
  })

  it('renders the Chinese title for each section', () => {
    render(<WorldIntroScreen />)
    expect(screen.getByText('训练师')).toBeTruthy()
    expect(screen.getByText('精灵球')).toBeTruthy()
    expect(screen.getByText('宝可梦')).toBeTruthy()
    expect(screen.getByText('道馆与联盟')).toBeTruthy()
    expect(screen.getByText('对战与友情')).toBeTruthy()
    expect(screen.getByText('升级与成长')).toBeTruthy()
  })

  it('shows the Charmander evolution line with arrows in the growth section', () => {
    render(<WorldIntroScreen />)
    expect(screen.getAllByAltText('Charmander').length).toBeGreaterThan(0)
    expect(screen.getAllByAltText('Charmeleon').length).toBeGreaterThan(0)
    expect(screen.getAllByAltText('Charizard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('→').length).toBeGreaterThan(0)
  })
})
