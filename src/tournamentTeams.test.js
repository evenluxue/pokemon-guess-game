import { describe, it, expect } from 'vitest'
import { TOURNAMENT_TEAMS } from './tournamentTeams'

describe('TOURNAMENT_TEAMS', () => {
  it('has all 8 leagues in order', () => {
    expect(TOURNAMENT_TEAMS).toHaveLength(8)
    expect(TOURNAMENT_TEAMS[0].regionZh).toBe('关都联盟')
    expect(TOURNAMENT_TEAMS[7].regionZh).toBe('世界锦标赛')
  })

  it('gives every team exactly 6 members with id/nameEn/nameZh', () => {
    for (const team of TOURNAMENT_TEAMS) {
      expect(team.members).toHaveLength(6)
      for (const mon of team.members) {
        expect(typeof mon.id).toBe('number')
        expect(mon.nameEn.length).toBeGreaterThan(0)
        expect(mon.nameZh.length).toBeGreaterThan(0)
      }
    }
  })

  it('marks Alola and Masters as championship wins', () => {
    const champs = TOURNAMENT_TEAMS.filter((t) => t.championship).map((t) => t.regionZh)
    expect(champs).toEqual(['阿罗拉联盟', '世界锦标赛'])
  })

  it('every team is led by Pikachu (#25)', () => {
    for (const team of TOURNAMENT_TEAMS) {
      expect(team.members[0]).toMatchObject({ id: 25, nameEn: 'Pikachu' })
    }
  })
})
