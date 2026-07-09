import { spriteUrl } from '../pokeapi'
import { NAMES_ZH } from '../pokemonNamesZh'

const SECTIONS = [
  {
    key: 'trainers',
    icon: '🧑',
    titleEn: 'Trainers',
    titleZh: '训练师',
    textEn:
      "A Trainer travels the world with their Pokémon partners — battling, learning, and growing together. Ash Ketchum is the most famous Trainer of all, always at Pikachu's side.",
    textZh:
      '训练师带着自己的宝可梦伙伴环游世界——一起战斗、学习、共同成长。小智是最有名的训练师，身边总有皮卡丘的陪伴。',
    sprites: [{ id: 25, name: 'Pikachu' }],
  },
  {
    key: 'pokeballs',
    icon: 'pokeball',
    titleEn: 'Poké Balls',
    titleZh: '精灵球',
    textEn:
      'A Poké Ball is a special device Trainers use to catch and carry Pokémon. Toss one at a wild Pokémon, and if you succeed, it becomes your partner!',
    textZh:
      '精灵球是训练师用来捕捉和携带宝可梦的特殊道具。向野生宝可梦投出精灵球，如果成功，它就会成为你的伙伴！',
  },
  {
    key: 'pokemon',
    icon: '✨',
    titleEn: 'Pokémon',
    titleZh: '宝可梦',
    textEn:
      'Pokémon are amazing creatures with special powers and Types — Fire, Water, Grass, Electric, and many more. Each one is unique, and there are over a thousand to discover!',
    textZh:
      '宝可梦是拥有特殊能力和属性的神奇生物——火、水、草、电等等。每一只都独一无二，等你去发现，如今已经超过一千种！',
    sprites: [
      { id: 1, name: 'Bulbasaur' },
      { id: 4, name: 'Charmander' },
      { id: 7, name: 'Squirtle' },
      { id: 25, name: 'Pikachu' },
    ],
  },
  {
    key: 'gyms',
    icon: '🏅',
    titleEn: 'Gym Leagues',
    titleZh: '道馆与联盟',
    textEn:
      'Every region has Gyms led by powerful Gym Leaders. Win a Gym battle and you earn a Badge. Collect enough Badges, and you can enter the Pokémon League to compete for the title of Champion!',
    textZh:
      '每个地区都有由道馆馆主坐镇的道馆。赢得道馆对战就能获得徽章。收集到足够的徽章后，就可以挑战宝可梦联盟，争夺冠军的荣誉！',
  },
  {
    key: 'friendship',
    icon: '🤝',
    titleEn: 'Battle & Friendship',
    titleZh: '对战与友情',
    textEn:
      "Battling isn't just about winning — it's how Trainers and Pokémon learn to trust each other. The strongest teams are built on friendship, not just strength.",
    textZh:
      '对战不仅仅是为了获胜——这是训练师和宝可梦建立信任的方式。最强大的队伍，靠的不只是实力，更是彼此的友情。',
  },
  {
    key: 'growth',
    icon: '⬆️',
    titleEn: 'Level Up & Growth',
    titleZh: '升级与成长',
    textEn:
      'Every battle helps a Pokémon gain experience. As they grow stronger, they level up — and some Pokémon even evolve into a whole new form, like Charmander growing into Charizard!',
    textZh:
      '每一次战斗都能让宝可梦获得经验值。它们变得更强的同时也会升级——有些宝可梦甚至会进化成全新的形态，就像小火龙成长为喷火龙一样！',
    sprites: [
      { id: 4, name: 'Charmander' },
      { id: 5, name: 'Charmeleon' },
      { id: 6, name: 'Charizard' },
    ],
    evolutionChain: true,
  },
]

function SectionIcon({ icon }) {
  if (icon === 'pokeball') return <span className="pokeball-icon" aria-hidden="true" />
  return (
    <span className="world-icon" aria-hidden="true">
      {icon}
    </span>
  )
}

export default function WorldIntroScreen() {
  return (
    <div className="screen world-screen">
      <h1>The World of Pokémon</h1>
      <p className="world-subtitle">宝可梦的世界</p>
      {SECTIONS.map((section) => (
        <div className="world-section" key={section.key}>
          <h2 className="world-section-title">
            <SectionIcon icon={section.icon} />
            {section.titleEn}
            <span className="world-title-zh">{section.titleZh}</span>
          </h2>
          <p className="world-text-en">{section.textEn}</p>
          <p className="world-text-zh">{section.textZh}</p>
          {section.sprites && (
            <div className="world-sprite-row">
              {section.sprites.map((mon, i) => (
                <div className="world-sprite-item-wrap" key={mon.id}>
                  {section.evolutionChain && i > 0 && <span className="world-arrow">→</span>}
                  <div className="world-sprite-item">
                    <img className="world-sprite-img" src={spriteUrl(mon.id)} alt={mon.name} />
                    <span className="world-sprite-name">{mon.name}</span>
                    {NAMES_ZH[mon.name] && (
                      <span className="world-sprite-zh">{NAMES_ZH[mon.name]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
