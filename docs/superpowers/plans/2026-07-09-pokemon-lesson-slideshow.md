# 宝可梦宣讲会幻灯片 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 app 首页新增第三个「📣 Lesson / 宣讲会」tab，一个全屏翻页幻灯片，按预定流程给 5–10 岁小朋友讲宝可梦，最后过渡到已有的猜谜游戏。

**Architecture:** 数据驱动:两个纯数据模块(`tournamentTeams.js` 队伍名单、`lessonSlides.js` 幻灯片定义)+ 一个按 `slide.type` 分发的展示组件(`LessonSlide.jsx`)+ 一个管理翻页/键盘/进度的容器(`LessonScreen.jsx`),接进现有 `BeginningScreen` 的 tab 结构。宝可梦立绘复用现有 `pokeapi.spriteUrl(id)`,无新增网络依赖。

**Tech Stack:** React 18 (函数式组件 + hooks)、Vite、Vitest + @testing-library/react。中英双语文本,风格对齐现有 `WorldIntroScreen`/`App.css`。

## Global Constraints

- 所有面向孩子的文本必须**中英双语**(中文为主排版,英文为辅),与现有 `.world-text-zh`/`.world-text-en` 风格一致。
- 宝可梦图片一律用 `import { spriteUrl } from '../pokeapi'`,不引入新的图片来源或 API 调用。
- 组件为函数式 + hooks;测试用 Vitest + `@testing-library/react`,`afterEach(cleanup)`,断言风格 `expect(...).toBeTruthy()`(对齐现有测试)。
- 不改动 `Play` 与 `Pokémon World` 两个 tab 的现有内容。
- 视频嵌入用 `youtube-nocookie.com/embed/<id>`,并附「在 YouTube 打开」兜底链接。
- 每个宝可梦对象形状统一为 `{ id, nameEn, nameZh }`。

---

### Task 1: 大赛队伍数据 `tournamentTeams.js`

**Files:**
- Create: `src/tournamentTeams.js`
- Test: `src/tournamentTeams.test.js`

**Interfaces:**
- Produces: `export const TOURNAMENT_TEAMS` — 长度 8 的数组,每项形状:
  `{ key: string, regionEn: string, regionZh: string, resultEn: string, resultZh: string, championship: boolean, members: Array<{ id: number, nameEn: string, nameZh: string }> }`,`members` 长度恒为 6。

- [ ] **Step 1: Write the failing test**

```js
// src/tournamentTeams.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tournamentTeams.test.js`
Expected: FAIL — cannot resolve `./tournamentTeams`.

- [ ] **Step 3: Write the data module**

```js
// src/tournamentTeams.js
// 小智历代地区联盟大赛队伍。id 为全国图鉴编号，立绘走 pokeapi.spriteUrl(id)。
const PIKACHU = { id: 25, nameEn: 'Pikachu', nameZh: '皮卡丘' }

export const TOURNAMENT_TEAMS = [
  {
    key: 'kanto',
    regionEn: 'Kanto League',
    regionZh: '关都联盟',
    resultEn: 'Top 16',
    resultZh: '16 强',
    championship: false,
    members: [
      PIKACHU,
      { id: 1, nameEn: 'Bulbasaur', nameZh: '妙蛙种子' },
      { id: 6, nameEn: 'Charizard', nameZh: '喷火龙' },
      { id: 7, nameEn: 'Squirtle', nameZh: '杰尼龟' },
      { id: 99, nameEn: 'Kingler', nameZh: '巨钳蟹' },
      { id: 89, nameEn: 'Muk', nameZh: '臭臭泥' },
    ],
  },
  {
    key: 'johto',
    regionEn: 'Johto League',
    regionZh: '城都联盟',
    resultEn: 'Top 8',
    resultZh: '8 强',
    championship: false,
    members: [
      PIKACHU,
      { id: 214, nameEn: 'Heracross', nameZh: '赫拉克罗斯' },
      { id: 153, nameEn: 'Bayleef', nameZh: '月桂叶' },
      { id: 155, nameEn: 'Cyndaquil', nameZh: '火球鼠' },
      { id: 158, nameEn: 'Totodile', nameZh: '小锯鳄' },
      { id: 164, nameEn: 'Noctowl', nameZh: '猫头夜鹰' },
    ],
  },
  {
    key: 'hoenn',
    regionEn: 'Hoenn League',
    regionZh: '丰缘联盟',
    resultEn: 'Top 8',
    resultZh: '8 强',
    championship: false,
    members: [
      PIKACHU,
      { id: 254, nameEn: 'Sceptile', nameZh: '蜥蜴王' },
      { id: 277, nameEn: 'Swellow', nameZh: '大王燕' },
      { id: 341, nameEn: 'Corphish', nameZh: '龙虾小兵' },
      { id: 324, nameEn: 'Torkoal', nameZh: '煤炭龟' },
      { id: 362, nameEn: 'Glalie', nameZh: '冰鬼护' },
    ],
  },
  {
    key: 'sinnoh',
    regionEn: 'Sinnoh League',
    regionZh: '神奥联盟',
    resultEn: 'Top 4',
    resultZh: '4 强',
    championship: false,
    members: [
      PIKACHU,
      { id: 392, nameEn: 'Infernape', nameZh: '烈焰猴' },
      { id: 389, nameEn: 'Torterra', nameZh: '土台龟' },
      { id: 398, nameEn: 'Staraptor', nameZh: '姆克鹰' },
      { id: 418, nameEn: 'Buizel', nameZh: '泳圈鼬' },
      { id: 443, nameEn: 'Gible', nameZh: '圆陆鲨' },
    ],
  },
  {
    key: 'unova',
    regionEn: 'Unova League',
    regionZh: '合众联盟',
    resultEn: 'Top 8',
    resultZh: '8 强',
    championship: false,
    members: [
      PIKACHU,
      { id: 553, nameEn: 'Krookodile', nameZh: '流氓鳄' },
      { id: 499, nameEn: 'Pignite', nameZh: '炒炒猪' },
      { id: 495, nameEn: 'Snivy', nameZh: '藤藤蛇' },
      { id: 501, nameEn: 'Oshawott', nameZh: '水水獭' },
      { id: 521, nameEn: 'Unfezant', nameZh: '轰隆雉' },
    ],
  },
  {
    key: 'kalos',
    regionEn: 'Kalos League',
    regionZh: '卡洛斯联盟',
    resultEn: 'Runner-up',
    resultZh: '亚军 · 差一点点!',
    championship: false,
    members: [
      PIKACHU,
      { id: 658, nameEn: 'Greninja', nameZh: '甲贺忍蛙' },
      { id: 663, nameEn: 'Talonflame', nameZh: '烈箭鹰' },
      { id: 701, nameEn: 'Hawlucha', nameZh: '摔角鹰人' },
      { id: 706, nameEn: 'Goodra', nameZh: '黏美龙' },
      { id: 715, nameEn: 'Noivern', nameZh: '音波龙' },
    ],
  },
  {
    key: 'alola',
    regionEn: 'Alola League',
    regionZh: '阿罗拉联盟',
    resultEn: '🏆 Champion',
    resultZh: '🏆 初代冠军',
    championship: true,
    members: [
      PIKACHU,
      { id: 727, nameEn: 'Incineroar', nameZh: '炽焰咆哮虎' },
      { id: 745, nameEn: 'Lycanroc', nameZh: '鬃岩狼人' },
      { id: 722, nameEn: 'Rowlet', nameZh: '木木枭' },
      { id: 809, nameEn: 'Melmetal', nameZh: '美录梅塔' },
      { id: 804, nameEn: 'Naganadel', nameZh: '四颚针龙' },
    ],
  },
  {
    key: 'masters',
    regionEn: 'World Coronation Series',
    regionZh: '世界锦标赛',
    resultEn: '🏆 World Champion',
    resultZh: '🏆 八大师赛 · 世界第一',
    championship: true,
    members: [
      PIKACHU,
      { id: 149, nameEn: 'Dragonite', nameZh: '快龙' },
      { id: 94, nameEn: 'Gengar', nameZh: '耿鬼' },
      { id: 448, nameEn: 'Lucario', nameZh: '路卡利欧' },
      { id: 865, nameEn: "Sirfetch'd", nameZh: '葱游兵' },
      { id: 882, nameEn: 'Dracovish', nameZh: '鳃鱼龙' },
    ],
  },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tournamentTeams.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/tournamentTeams.js src/tournamentTeams.test.js
git commit -m "feat: add tournament teams data for lesson slideshow"
```

---

### Task 2: 幻灯片数据 `lessonSlides.js`

**Files:**
- Create: `src/lessonSlides.js`
- Test: `src/lessonSlides.test.js`

**Interfaces:**
- Consumes: `TOURNAMENT_TEAMS` from `./tournamentTeams`.
- Produces: `export const LESSON_SLIDES` — 有序数组,每项一个 slide 对象。各 `type` 的形状:
  - `quiz`: `{ type:'quiz', qZh, qEn, options:[{key,textZh,textEn}], answerKey, revealZh, revealEn }`
  - `video`: `{ type:'video', titleZh, titleEn, descZh, descEn, youtubeId }`
  - `info`: `{ type:'info', titleZh, titleEn, bodyZh, bodyEn }`
  - `journey`: `{ type:'journey', titleZh, titleEn, steps:[{icon,zh,en}] }`
  - `teams`: `{ type:'teams', titleZh, titleEn, teams: TOURNAMENT_TEAMS 的子集 }`
  - `evolution`: `{ type:'evolution', titleZh, titleEn, groups:[{titleZh,titleEn,arrow:boolean,members:[{id,nameEn,nameZh}]}] }`
  - `image`: `{ type:'image', titleZh, titleEn, src, captionZh, captionEn }`
  - `transition`: `{ type:'transition', titleZh, titleEn, bodyZh, bodyEn, buttonZh, buttonEn }`

- [ ] **Step 1: Write the failing test**

```js
// src/lessonSlides.test.js
import { describe, it, expect } from 'vitest'
import { LESSON_SLIDES } from './lessonSlides'

describe('LESSON_SLIDES', () => {
  it('has 14 slides in the planned order', () => {
    expect(LESSON_SLIDES).toHaveLength(14)
    expect(LESSON_SLIDES[0].type).toBe('quiz')
    expect(LESSON_SLIDES[13].type).toBe('transition')
  })

  it('every slide declares a known type', () => {
    const known = new Set(['quiz', 'video', 'info', 'journey', 'teams', 'evolution', 'image', 'transition'])
    for (const slide of LESSON_SLIDES) {
      expect(known.has(slide.type)).toBe(true)
    }
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lessonSlides.test.js`
Expected: FAIL — cannot resolve `./lessonSlides`.

- [ ] **Step 3: Write the data module**

```js
// src/lessonSlides.js
import { TOURNAMENT_TEAMS } from './tournamentTeams'

const teamBy = (key) => TOURNAMENT_TEAMS.find((t) => t.key === key)

export const LESSON_SLIDES = [
  {
    type: 'quiz',
    qZh: '你们知道宝可梦最早是从哪里来的吗?',
    qEn: 'Where did Pokémon come from first?',
    options: [
      { key: 'A', textZh: '动画片', textEn: 'The cartoon' },
      { key: 'B', textZh: '游戏', textEn: 'The games' },
      { key: 'C', textZh: '毛绒玩具', textEn: 'Plush toys' },
      { key: 'D', textZh: '现实世界', textEn: 'The real world' },
    ],
    answerKey: 'B',
    revealZh: '答案是 B —— 游戏! 1996 年的 Game Boy 上诞生了第一只宝可梦。',
    revealEn: 'It was B — the games! The very first Pokémon appeared on the Game Boy in 1996.',
  },
  {
    type: 'video',
    titleZh: 'Game Boy 原版开场',
    titleEn: 'The Original Game Boy Intro',
    descZh: '来看看最早的像素宝可梦长什么样子!',
    descEn: "Let's see what the very first pixel Pokémon looked like!",
    youtubeId: 'C19O5xm51dk',
  },
  {
    type: 'info',
    titleZh: '动画的诞生:小智与皮卡丘',
    titleEn: 'The Anime Is Born: Ash & Pikachu',
    bodyZh: '真正让宝可梦风靡全球的是动画片! 主角是永远 10 岁的少年「小智」，还有那只不肯进精灵球、总待在他肩膀上的皮卡丘。',
    bodyEn: "The anime made Pokémon a worldwide hit! Meet Ash — forever 10 years old — and his Pikachu, who refuses to stay in its Poké Ball and rides on his shoulder instead.",
  },
  {
    type: 'video',
    titleZh: '小智第一次遇见皮卡丘',
    titleEn: 'How Ash and Pikachu Meet',
    descZh: '他们的友情是怎么开始的?',
    descEn: 'How did their friendship begin?',
    youtubeId: 'xfnYDn4zrYk',
  },
  {
    type: 'journey',
    titleZh: '训练师的成长之旅',
    titleEn: "A Trainer's Journey",
    steps: [
      { icon: '📕', zh: '拿到宝可梦图鉴', en: 'Get your Pokédex' },
      { icon: 'pokeball', zh: '用精灵球收集宝可梦', en: 'Catch Pokémon with Poké Balls' },
      { icon: '⚔️', zh: '带喜欢的宝可梦跟野生宝可梦和训练师对战，升级变强', en: 'Battle wild Pokémon & trainers to level up' },
      { icon: '🏅', zh: '挑战各地道馆，收集徽章', en: 'Challenge Gyms and earn Badges' },
      { icon: '🏟️', zh: '打进大师赛', en: 'Reach the big tournament' },
      { icon: '👑', zh: '赢了就成为最终的宝可梦大师!', en: 'Win to become the ultimate Pokémon Master!' },
    ],
  },
  {
    type: 'quiz',
    qZh: '小智一共挑战了多少次地区联盟大赛，才最终成为世界冠军?',
    qEn: 'How many league tournaments did Ash enter before becoming World Champion?',
    options: [
      { key: 'A', textZh: '3 次', textEn: '3 times' },
      { key: 'B', textZh: '5 次', textEn: '5 times' },
      { key: 'C', textZh: '8 次', textEn: '8 times' },
      { key: 'D', textZh: '20 次', textEn: '20 times' },
    ],
    answerKey: 'C',
    revealZh: '一共 8 次! 前 6 次都失败了，但他从来没有放弃 —— 这就是最厉害的地方!',
    revealEn: 'Eight times! He lost the first six, but he never gave up — that is what makes him a champion.',
  },
  {
    type: 'teams',
    titleZh: '小智的大赛队伍 (一)',
    titleEn: "Ash's Tournament Teams (1)",
    teams: [teamBy('kanto'), teamBy('johto'), teamBy('hoenn')],
  },
  {
    type: 'teams',
    titleZh: '小智的大赛队伍 (二)',
    titleEn: "Ash's Tournament Teams (2)",
    teams: [teamBy('sinnoh'), teamBy('unova'), teamBy('kalos')],
  },
  {
    type: 'teams',
    titleZh: '小智的大赛队伍 (三) —— 夺冠!',
    titleEn: "Ash's Tournament Teams (3) — Champion!",
    teams: [teamBy('alola'), teamBy('masters')],
  },
  {
    type: 'video',
    titleZh: '巅峰对决:夺得世界冠军!',
    titleEn: 'The Final Battle: World Champion!',
    descZh: '旅行了 25 年后，小智带着最强队伍迎战不败冠军丹帝，皮卡丘一锤定音!',
    descEn: 'After 25 years, Ash and his strongest team face the undefeated Champion Leon — and Pikachu seals the win!',
    youtubeId: 'sR1hzqn8k5w',
  },
  {
    type: 'evolution',
    titleZh: '进化:宝可梦会变大变强',
    titleEn: 'Evolution: Pokémon Grow Stronger',
    groups: [
      {
        titleZh: '御三家:小火龙的成长',
        titleEn: 'Starter: Charmander grows up',
        arrow: true,
        members: [
          { id: 4, nameEn: 'Charmander', nameZh: '小火龙' },
          { id: 5, nameEn: 'Charmeleon', nameZh: '火恐龙' },
          { id: 6, nameEn: 'Charizard', nameZh: '喷火龙' },
        ],
      },
      {
        titleZh: '伊布家族:1 只伊布，8 种进化!',
        titleEn: 'Eevee: one Pokémon, eight evolutions!',
        arrow: false,
        members: [
          { id: 133, nameEn: 'Eevee', nameZh: '伊布' },
          { id: 134, nameEn: 'Vaporeon', nameZh: '水伊布' },
          { id: 135, nameEn: 'Jolteon', nameZh: '雷伊布' },
          { id: 136, nameEn: 'Flareon', nameZh: '火伊布' },
          { id: 196, nameEn: 'Espeon', nameZh: '太阳伊布' },
          { id: 197, nameEn: 'Umbreon', nameZh: '月亮伊布' },
          { id: 470, nameEn: 'Leafeon', nameZh: '叶伊布' },
          { id: 471, nameEn: 'Glaceon', nameZh: '冰伊布' },
          { id: 700, nameEn: 'Sylveon', nameZh: '仙子伊布' },
        ],
      },
    ],
  },
  {
    type: 'image',
    titleZh: '更强大的形态:Mega 与超极巨化',
    titleEn: 'Even Stronger: Mega & Gigantamax',
    src: '/lesson/starters-mega-gigantamax.jpg',
    captionZh: '进化之后还能变得更强! 御三家可以「超级进化」(Mega)，也能「超极巨化」变得超级大。',
    captionEn: 'Beyond evolution! The Kanto starters can Mega Evolve and even Gigantamax into giant forms.',
  },
  {
    type: 'quiz',
    qZh: '属性克制就像石头剪刀布:💧水克火🔥、🔥火克草🌿、🌿草克水💧。那么小火龙(火)遇到杰尼龟(水)，谁会赢?',
    qEn: 'Types work like rock-paper-scissors: Water beats Fire, Fire beats Grass, Grass beats Water. So if Charmander (Fire) meets Squirtle (Water), who wins?',
    options: [
      { key: 'A', textZh: '小火龙 (火)', textEn: 'Charmander (Fire)' },
      { key: 'B', textZh: '杰尼龟 (水)', textEn: 'Squirtle (Water)' },
    ],
    answerKey: 'B',
    revealZh: '杰尼龟赢! 水能灭火，所以水克火。💧 > 🔥',
    revealEn: 'Squirtle wins! Water puts out fire, so Water beats Fire. 💧 > 🔥',
  },
  {
    type: 'transition',
    titleZh: '游戏时间!',
    titleEn: 'Game Time!',
    bodyZh: '现在你已经认识了进化、属性和小智的故事 —— 来玩「猜猜这是谁?」吧!',
    bodyEn: "Now you know evolution, types, and Ash's story — let's play Who's That Pokémon!",
    buttonZh: '开始猜猜看',
    buttonEn: "Play Who's That Pokémon",
  },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lessonSlides.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lessonSlides.js src/lessonSlides.test.js
git commit -m "feat: add lesson slide deck data"
```

---

### Task 3: 幻灯片展示组件 `LessonSlide.jsx`

**Files:**
- Create: `src/components/LessonSlide.jsx`
- Test: `src/components/LessonSlide.test.jsx`
- Modify: `src/App.css`(在文件末尾追加 `/* Lesson slideshow */` 区块)

**Interfaces:**
- Consumes: `spriteUrl` from `../pokeapi`;slide 对象形状见 Task 2。
- Produces: `export default function LessonSlide({ slide, onStartGame })` — 按 `slide.type` 渲染对应内容;`transition` 类型的按钮 `onClick` 调用 `onStartGame`。

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/LessonSlide.test.jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/LessonSlide.test.jsx`
Expected: FAIL — cannot resolve `./LessonSlide`.

- [ ] **Step 3: Write the component**

```jsx
// src/components/LessonSlide.jsx
import { useState } from 'react'
import { spriteUrl } from '../pokeapi'

function Sprite({ mon }) {
  return (
    <div className="lesson-sprite">
      <img className="lesson-sprite-img" src={spriteUrl(mon.id)} alt={mon.nameEn} loading="lazy" />
      <span className="lesson-sprite-en">{mon.nameEn}</span>
      <span className="lesson-sprite-zh">{mon.nameZh}</span>
    </div>
  )
}

function StepIcon({ icon }) {
  if (icon === 'pokeball') return <span className="pokeball-icon" aria-hidden="true" />
  return <span className="lesson-step-emoji" aria-hidden="true">{icon}</span>
}

function QuizSlide({ slide }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="lesson-slide lesson-quiz">
      <h2 className="lesson-title-zh">{slide.qZh}</h2>
      <p className="lesson-title-en">{slide.qEn}</p>
      <ul className="quiz-options">
        {slide.options.map((opt) => (
          <li
            key={opt.key}
            className={revealed && opt.key === slide.answerKey ? 'quiz-option correct' : 'quiz-option'}
          >
            <span className="quiz-key">{opt.key}</span>
            <span className="quiz-text-zh">{opt.textZh}</span>
            <span className="quiz-text-en">{opt.textEn}</span>
          </li>
        ))}
      </ul>
      {revealed ? (
        <div className="quiz-reveal">
          <p className="quiz-reveal-zh">{slide.revealZh}</p>
          <p className="quiz-reveal-en">{slide.revealEn}</p>
        </div>
      ) : (
        <button className="quiz-reveal-btn" onClick={() => setRevealed(true)}>
          揭晓答案 / Reveal
        </button>
      )}
    </div>
  )
}

function VideoSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-video">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      {slide.descZh && <p className="lesson-body-zh">{slide.descZh}</p>}
      {slide.descEn && <p className="lesson-body-en">{slide.descEn}</p>}
      <div className="lesson-video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${slide.youtubeId}`}
          title={slide.titleEn}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <a
        className="lesson-video-link"
        href={`https://www.youtube.com/watch?v=${slide.youtubeId}`}
        target="_blank"
        rel="noreferrer"
      >
        ▶ 在 YouTube 打开 / Open on YouTube
      </a>
    </div>
  )
}

function InfoSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-info">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      <p className="lesson-body-zh">{slide.bodyZh}</p>
      <p className="lesson-body-en">{slide.bodyEn}</p>
    </div>
  )
}

function JourneySlide({ slide }) {
  return (
    <div className="lesson-slide lesson-journey">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      <ol className="journey-steps">
        {slide.steps.map((step, i) => (
          <li className="journey-step" key={i}>
            <span className="journey-num">{i + 1}</span>
            <StepIcon icon={step.icon} />
            <span className="journey-step-zh">{step.zh}</span>
            <span className="journey-step-en">{step.en}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function TeamsSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-teams">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      {slide.teams.map((team) => (
        <div className={team.championship ? 'lesson-team champ' : 'lesson-team'} key={team.key}>
          <div className="lesson-team-head">
            <span className="lesson-team-region-zh">{team.regionZh}</span>
            <span className="lesson-team-region-en">{team.regionEn}</span>
            <span className="lesson-team-result">{team.resultZh}</span>
          </div>
          <div className="lesson-team-row">
            {team.members.map((mon) => (
              <Sprite mon={mon} key={mon.id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EvolutionSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-evolution">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      {slide.groups.map((group, gi) => (
        <div className="lesson-evo-group" key={gi}>
          <p className="lesson-evo-label-zh">{group.titleZh}</p>
          <p className="lesson-evo-label-en">{group.titleEn}</p>
          <div className={group.arrow ? 'lesson-evo-row chain' : 'lesson-evo-row grid'}>
            {group.members.map((mon, i) => (
              <div className="lesson-evo-item" key={mon.id}>
                {group.arrow && i > 0 && <span className="lesson-evo-arrow">→</span>}
                <Sprite mon={mon} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ImageSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-image">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      <img className="lesson-image-img" src={slide.src} alt={slide.titleEn} />
      <p className="lesson-body-zh">{slide.captionZh}</p>
      <p className="lesson-body-en">{slide.captionEn}</p>
    </div>
  )
}

function TransitionSlide({ slide, onStartGame }) {
  return (
    <div className="lesson-slide lesson-transition">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      <p className="lesson-body-zh">{slide.bodyZh}</p>
      <p className="lesson-body-en">{slide.bodyEn}</p>
      <button className="lesson-play-btn" onClick={onStartGame}>
        {slide.buttonZh} · {slide.buttonEn} →
      </button>
    </div>
  )
}

export default function LessonSlide({ slide, onStartGame }) {
  switch (slide.type) {
    case 'quiz':
      return <QuizSlide slide={slide} />
    case 'video':
      return <VideoSlide slide={slide} />
    case 'info':
      return <InfoSlide slide={slide} />
    case 'journey':
      return <JourneySlide slide={slide} />
    case 'teams':
      return <TeamsSlide slide={slide} />
    case 'evolution':
      return <EvolutionSlide slide={slide} />
    case 'image':
      return <ImageSlide slide={slide} />
    case 'transition':
      return <TransitionSlide slide={slide} onStartGame={onStartGame} />
    default:
      return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/LessonSlide.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Add styles to `src/App.css`**

在 `src/App.css` 末尾追加(与现有 `.world-*` 风格协调;数值可微调):

```css
/* Lesson slideshow */
.lesson-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  padding: 1rem 0.5rem 2rem;
}
.lesson-title-zh { font-size: 1.6rem; font-weight: 700; margin: 0; }
.lesson-title-en { font-size: 1rem; color: #6b7280; margin: 0; font-style: italic; }
.lesson-body-zh { font-size: 1.1rem; max-width: 46rem; margin: 0.2rem 0 0; }
.lesson-body-en { font-size: 0.9rem; color: #6b7280; max-width: 46rem; margin: 0; }

.quiz-options { list-style: none; padding: 0; margin: 0.5rem 0; display: grid; gap: 0.5rem; width: min(32rem, 90%); }
.quiz-option { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; }
.quiz-option.correct { border-color: #22c55e; background: #dcfce7; }
.quiz-key { font-weight: 700; }
.quiz-text-zh { font-size: 1.05rem; }
.quiz-text-en { font-size: 0.85rem; color: #6b7280; margin-left: auto; }
.quiz-reveal-btn, .lesson-play-btn { margin-top: 0.6rem; padding: 0.7rem 1.4rem; font-size: 1.05rem; font-weight: 700; border: none; border-radius: 999px; background: #f59e0b; color: #fff; cursor: pointer; }
.lesson-play-btn { background: #ef4444; font-size: 1.2rem; }
.quiz-reveal { background: #dcfce7; border-radius: 0.75rem; padding: 0.8rem 1rem; max-width: 40rem; }
.quiz-reveal-zh { font-weight: 700; margin: 0 0 0.2rem; }
.quiz-reveal-en { color: #4b5563; margin: 0; font-size: 0.9rem; }

.lesson-video-frame { width: min(48rem, 92%); aspect-ratio: 16 / 9; margin: 0.4rem 0; }
.lesson-video-frame iframe { width: 100%; height: 100%; border: 0; border-radius: 0.75rem; }
.lesson-video-link { font-size: 0.9rem; color: #2563eb; }

.journey-steps { list-style: none; padding: 0; margin: 0.5rem 0; display: grid; gap: 0.5rem; width: min(40rem, 92%); }
.journey-step { display: flex; align-items: center; gap: 0.7rem; padding: 0.5rem 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; text-align: left; }
.journey-num { font-weight: 800; color: #f59e0b; min-width: 1.4rem; }
.lesson-step-emoji { font-size: 1.4rem; }
.journey-step-zh { font-size: 1.05rem; }
.journey-step-en { font-size: 0.8rem; color: #6b7280; margin-left: auto; }

.lesson-team { width: 100%; margin-bottom: 0.8rem; }
.lesson-team.champ { background: #fffbeb; border-radius: 0.75rem; padding: 0.5rem; }
.lesson-team-head { display: flex; align-items: baseline; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }
.lesson-team-region-zh { font-weight: 700; font-size: 1.1rem; }
.lesson-team-region-en { color: #6b7280; font-size: 0.85rem; }
.lesson-team-result { font-weight: 700; color: #b45309; }
.lesson-team-row, .lesson-evo-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 0.3rem; }
.lesson-evo-row.grid { max-width: 46rem; }
.lesson-sprite { display: flex; flex-direction: column; align-items: center; width: 5rem; }
.lesson-sprite-img { width: 4.5rem; height: 4.5rem; object-fit: contain; }
.lesson-sprite-en { font-size: 0.75rem; }
.lesson-sprite-zh { font-size: 0.8rem; font-weight: 600; }

.lesson-evo-group { margin-bottom: 1rem; }
.lesson-evo-label-zh { font-weight: 700; margin: 0; }
.lesson-evo-label-en { color: #6b7280; font-size: 0.85rem; margin: 0 0 0.3rem; }
.lesson-evo-item { display: flex; align-items: center; gap: 0.3rem; }
.lesson-evo-arrow { font-size: 1.4rem; color: #9ca3af; }

.lesson-image-img { max-height: 60vh; max-width: 92%; object-fit: contain; border-radius: 0.5rem; }
```

- [ ] **Step 6: Re-run test to confirm still green, then commit**

Run: `npx vitest run src/components/LessonSlide.test.jsx`
Expected: PASS.

```bash
git add src/components/LessonSlide.jsx src/components/LessonSlide.test.jsx src/App.css
git commit -m "feat: add LessonSlide renderer and styles"
```

---

### Task 4: 幻灯片容器 `LessonScreen.jsx`

**Files:**
- Create: `src/components/LessonScreen.jsx`
- Test: `src/components/LessonScreen.test.jsx`
- Modify: `src/App.css`(追加导航样式)

**Interfaces:**
- Consumes: `LESSON_SLIDES` from `../lessonSlides`;`LessonSlide` from `./LessonSlide`.
- Produces: `export default function LessonScreen({ onStartGame })` — 翻页容器;渲染 `<LessonSlide key={current} slide={...} onStartGame={onStartGame} />`,`key={current}` 使换页时重置每页内部 state(如 quiz 揭晓)。上一页/下一页按钮 + 键盘 ← →;首页禁用「上一页」,末页禁用「下一页」。

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/LessonScreen.test.jsx
import { describe, it, expect, vi, afterEach } from 'vitest'
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/LessonScreen.test.jsx`
Expected: FAIL — cannot resolve `./LessonScreen`.

- [ ] **Step 3: Write the component**

```jsx
// src/components/LessonScreen.jsx
import { useState, useEffect, useCallback } from 'react'
import { LESSON_SLIDES } from '../lessonSlides'
import LessonSlide from './LessonSlide'

export default function LessonScreen({ onStartGame }) {
  const [current, setCurrent] = useState(0)
  const total = LESSON_SLIDES.length

  const goPrev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), [])
  const goNext = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  return (
    <div className="screen lesson-screen">
      <div className="lesson-stage">
        <LessonSlide key={current} slide={LESSON_SLIDES[current]} onStartGame={onStartGame} />
      </div>
      <div className="lesson-nav">
        <button className="lesson-nav-btn" onClick={goPrev} disabled={current === 0}>
          ‹ 上一页
        </button>
        <div className="lesson-progress" aria-hidden="true">
          {LESSON_SLIDES.map((_, i) => (
            <span key={i} className={i === current ? 'lesson-dot active' : 'lesson-dot'} />
          ))}
        </div>
        <button className="lesson-nav-btn" onClick={goNext} disabled={current === total - 1}>
          下一页 ›
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/LessonScreen.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Add nav styles to `src/App.css`**

在 `src/App.css` 末尾 `/* Lesson slideshow */` 区块内继续追加:

```css
.lesson-nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; }
.lesson-nav-btn { padding: 0.6rem 1.1rem; font-size: 1rem; font-weight: 700; border: none; border-radius: 999px; background: #3b82f6; color: #fff; cursor: pointer; }
.lesson-nav-btn:disabled { background: #cbd5e1; cursor: default; }
.lesson-progress { display: flex; gap: 0.35rem; flex-wrap: wrap; justify-content: center; }
.lesson-dot { width: 0.55rem; height: 0.55rem; border-radius: 999px; background: #d1d5db; }
.lesson-dot.active { background: #f59e0b; }
```

- [ ] **Step 6: Re-run test to confirm still green, then commit**

Run: `npx vitest run src/components/LessonScreen.test.jsx`
Expected: PASS.

```bash
git add src/components/LessonScreen.jsx src/components/LessonScreen.test.jsx src/App.css
git commit -m "feat: add LessonScreen slideshow container with navigation"
```

---

### Task 5: 接进第三个 tab `BeginningScreen.jsx`

**Files:**
- Modify: `src/components/BeginningScreen.jsx`
- Test: `src/components/BeginningScreen.test.jsx`(追加用例)

**Interfaces:**
- Consumes: `LessonScreen` from `./LessonScreen`。
- Produces: `BeginningScreen` 新增 `tab === 'lesson'` 分支;点击「📣 Lesson」显示 `LessonScreen`;lesson 里的 `onStartGame` 把 tab 切回 `'play'`。

- [ ] **Step 1: Write the failing test (append to existing describe block)**

在 `src/components/BeginningScreen.test.jsx` 的 `describe` 内追加:

```jsx
  it('switches to the Lesson tab and shows the opening quiz', () => {
    render(<BeginningScreen onSelect={() => {}} onPreview={() => {}} />)
    fireEvent.click(screen.getByText('📣 Lesson'))
    expect(screen.getByText('你们知道宝可梦最早是从哪里来的吗?')).toBeTruthy()
  })

  it('lesson Game Time button returns to the Play tab', () => {
    render(<BeginningScreen onSelect={() => {}} onPreview={() => {}} />)
    fireEvent.click(screen.getByText('📣 Lesson'))
    // advance to the final transition slide (14 slides -> 13 next clicks)
    for (let i = 0; i < 13; i++) {
      fireEvent.click(screen.getByRole('button', { name: /下一页/ }))
    }
    fireEvent.click(screen.getByRole('button', { name: /开始猜猜看|Play Who/ }))
    expect(screen.getByText('Choose your trainer level.')).toBeTruthy()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/BeginningScreen.test.jsx`
Expected: FAIL — no `📣 Lesson` element.

- [ ] **Step 3: Modify BeginningScreen**

```jsx
// src/components/BeginningScreen.jsx
import { useState } from 'react'
import DifficultyScreen from './DifficultyScreen'
import WorldIntroScreen from './WorldIntroScreen'
import LessonScreen from './LessonScreen'

export default function BeginningScreen({ onSelect, onPreview }) {
  const [tab, setTab] = useState('play')
  return (
    <div className="beginning-wrap">
      <div className="tab-bar">
        <button
          className={tab === 'play' ? 'tab-btn selected' : 'tab-btn'}
          onClick={() => setTab('play')}
        >
          🎮 Play
        </button>
        <button
          className={tab === 'world' ? 'tab-btn selected' : 'tab-btn'}
          onClick={() => setTab('world')}
        >
          📖 Pokémon World
        </button>
        <button
          className={tab === 'lesson' ? 'tab-btn selected' : 'tab-btn'}
          onClick={() => setTab('lesson')}
        >
          📣 Lesson
        </button>
      </div>
      {tab === 'play' && <DifficultyScreen onSelect={onSelect} onPreview={onPreview} />}
      {tab === 'world' && <WorldIntroScreen />}
      {tab === 'lesson' && <LessonScreen onStartGame={() => setTab('play')} />}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/BeginningScreen.test.jsx`
Expected: PASS (all existing + 2 new).

- [ ] **Step 5: Run the full test suite**

Run: `npx vitest run`
Expected: PASS across all files.

- [ ] **Step 6: Commit**

```bash
git add src/components/BeginningScreen.jsx src/components/BeginningScreen.test.jsx
git commit -m "feat: add Lesson tab wiring the slideshow into BeginningScreen"
```

---

### Task 6: 手动验收(投屏走查)

**Files:** none(仅运行与目视)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
打开浏览器到 Vite 提示的地址。

- [ ] **Step 2: Walk the deck**

点「📣 Lesson」tab,用「下一页 / 上一页」和键盘 ← → 走完 14 张幻灯片,确认:
- 两个问答点「揭晓答案」后才显示答案;换页再回来答案已重置。
- 3 个视频能加载(需联网),下方有「在 YouTube 打开」链接。
- 三张队伍页立绘正常显示,阿罗拉/大师赛两支有夺冠高亮。
- 进化页:御三家带箭头,伊布家族 9 只成网格。
- Mega/超极巨化图片显示正常。
- 末页「开始猜猜看」跳回 Play tab。

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors from the added files.

---

## Self-Review

- **Spec coverage:** 开场问答✓(Task2 slide0/Task3 quiz)、GB 视频✓、小智&皮卡丘✓、遇见视频✓、成长之旅✓、次数问答✓、8 队伍 3 页✓(Task1+2)、决战视频✓、进化✓、Mega/超极巨化✓、属性问答✓、游戏过渡✓(Task5 onStartGame)、第三 tab✓、中英双语✓、键盘/进度/翻页✓、测试✓。
- **Placeholder scan:** 无 TBD/TODO;每个代码步骤含完整代码。
- **Type consistency:** slide 形状在 Task2 定义,Task3 消费一致(`qZh/qEn/options/answerKey/revealZh`、`youtubeId`、`teams[].members[].{id,nameEn,nameZh}`、`groups[].{arrow,members}`、`src/captionZh`、`buttonZh`)。`LESSON_SLIDES`/`TOURNAMENT_TEAMS`/`LessonSlide`/`LessonScreen` 命名跨任务统一。`onStartGame` 贯穿 Task3→4→5。
