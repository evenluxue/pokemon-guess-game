import { spriteUrl } from '../pokeapi'
import { NAMES_ZH } from '../pokemonNamesZh'

// Character art credit: reference descriptions adapted from
// https://www.pokemongjd.com/anime-pokemon-chara.html
const CHARACTERS = [
  {
    key: 'ash',
    img: '/trainers/ash.png',
    nameEn: 'Ash Ketchum',
    nameZh: '小智',
    bioEn:
      "The hero of our story — a boy chasing his dream of becoming the world's greatest Pokémon Master, always by Pikachu's side.",
    bioZh: '故事的主人公！以成为世界第一宝可梦大师为目标的少年，身边永远有皮卡丘相伴。',
  },
  {
    key: 'misty',
    img: '/trainers/misty.png',
    nameEn: 'Misty',
    nameZh: '小霞',
    bioEn: 'A Gym Leader from Cerulean City and a Water-type Pokémon expert.',
    bioZh: '来自华蓝市的道馆馆主，擅长使用水系宝可梦的训练家。',
  },
  {
    key: 'brock',
    img: '/trainers/brock.png',
    nameEn: 'Brock',
    nameZh: '小刚',
    bioEn:
      'Former Leader of Pewter Gym and a Rock-type specialist, who also takes great care of his many little siblings.',
    bioZh: '前尼比道馆馆主，擅长岩石系宝可梦，同时还要照顾家里的一大群弟弟妹妹。',
  },
  {
    key: 'tracey',
    img: '/trainers/tracey.png',
    nameEn: 'Tracey Sketchit',
    nameZh: '小建',
    bioEn:
      "A Pokémon watcher who loves observing and sketching Pokémon, and later becomes Professor Oak's assistant.",
    bioZh: '喜欢观察和描绘宝可梦的宝可梦观察家，后来成为大木博士的助手。',
  },
  {
    key: 'team-rocket',
    img: '/trainers/team-rocket.png',
    nameEn: 'Team Rocket',
    nameZh: '火箭队',
    bioEn:
      'Jessie, James, and Meowth — a trio of mischief-makers always scheming to steal Pikachu (it never works out for them!).',
    bioZh: '由武藏、小次郎和喵喵组成的三人组，总想着偷走皮卡丘——不过从来没有成功过！',
  },
  {
    key: 'professor-oak',
    img: '/trainers/professor-oak.png',
    nameEn: 'Professor Oak',
    nameZh: '大木博士',
    bioEn:
      'A leading Pokémon researcher who gives new Trainers their very first Pokémon and Pokédex.',
    bioZh: '知名的宝可梦研究学者，会将第一只宝可梦和图鉴交给踏上旅程的训练师。',
  },
  {
    key: 'gary',
    img: '/trainers/gary.png',
    nameEn: 'Gary Oak',
    nameZh: '小茂',
    bioEn:
      "Professor Oak's grandson and Ash's childhood rival, always racing to become a better Trainer first.",
    bioZh: '大木博士的孙子，也是小智从小到大的劲敌，总想抢先成为更厉害的训练师。',
  },
  {
    key: 'officer-jenny',
    img: '/trainers/officer-jenny.png',
    nameEn: 'Officer Jenny',
    nameZh: '乔妮警官',
    bioEn:
      "A police officer keeping every Pokémon town safe — you'll meet many Jennys on your journey, they're all related!",
    bioZh: '守护着宝可梦小镇治安的警官。旅途中你会遇到很多位乔妮警官，她们其实都是一家人！',
  },
  {
    key: 'nurse-joy',
    img: '/trainers/nurse-joy.png',
    nameEn: 'Nurse Joy',
    nameZh: '乔伊护士',
    bioEn: 'The kind nurse at the Pokémon Center who heals tired and injured Pokémon back to full health.',
    bioZh: '宝可梦中心里温柔的护士，专门为疲惫或受伤的宝可梦恢复健康。',
  },
]

const SECTIONS = [
  {
    key: 'trainers',
    icon: '🧑',
    titleEn: 'Trainers',
    titleZh: '训练师',
    textEn:
      "Every journey starts with a Trainer and their Pokémon partners, learning and growing together. Here are some familiar faces you'll meet along the way!",
    textZh:
      '每一段旅程都从训练师和他们的宝可梦伙伴开始，一起学习、共同成长。来认识一些你会在旅途中遇到的熟悉面孔吧！',
    characters: CHARACTERS,
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
          {section.characters && (
            <div className="character-grid">
              {section.characters.map((c) => (
                <div className="character-card" key={c.key}>
                  <img className="character-img" src={c.img} alt={c.nameEn} />
                  <div className="character-info">
                    <p className="character-name">
                      {c.nameEn} <span className="character-name-zh">{c.nameZh}</span>
                    </p>
                    <p className="character-bio-en">{c.bioEn}</p>
                    <p className="character-bio-zh">{c.bioZh}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
