# 宝可梦宣讲会幻灯片 (Lesson Slideshow) — Design

**Date:** 2026-07-09
**Status:** Approved (pending final spec review)

## 目标 / Goal

把一份面向 5–10 岁小朋友的宝可梦宣讲会流程，做成 app 里的一个**全屏翻页幻灯片**，供讲师现场投屏、一页页讲课。内容涵盖:宝可梦的起源、小智与皮卡丘、训练师成长之旅、小智历代大赛队伍、进化与属性克制，最后过渡到已有的「Who's That Pokémon」猜谜游戏。

## 决策摘要 / Key Decisions

| 项目 | 决定 |
|------|------|
| 呈现形式 | 翻页幻灯片(一屏一环节，上/下页按钮 + 键盘方向键 + 进度点) |
| 入口 | `BeginningScreen` 新增第三个 tab「📣 Lesson / 宣讲会」 |
| 视频 | 页内嵌入 YouTube iframe(`youtube-nocookie.com`) |
| 互动问答 | 点击揭晓答案(先显示选项，点击后高亮/显示正确答案) |
| 大赛队伍 | 显示宝可梦官方立绘(走现有 `spriteUrl(id)`)，8 支队伍合成 3 张幻灯片 |
| 语言 | 中英双语，风格与现有 `WorldIntroScreen` 一致 |

## 架构 / Architecture

遵循现有代码风格:函数式组件、数据驱动的数组、中英双语文本、图片走 `pokeapi.spriteUrl(id)`(纯 URL，无需 API 调用)。

### 组件与文件

- **`src/components/BeginningScreen.jsx`**(改造)— 增加第三个 tab 按钮「📣 Lesson」，`tab === 'lesson'` 时渲染 `<LessonScreen onStartGame={...} />`。`onStartGame` 把 tab 切回 `'play'`，让最后一张幻灯片能无缝进入游戏。
- **`src/components/LessonScreen.jsx`**(新)— 幻灯片容器。持有 `current` 页码 state，渲染导航条(‹ 上一页 / 下一页 ›)、进度点，监听键盘 ← → 翻页。根据当前 slide 的 `type` 分发到对应的渲染函数/子组件。
- **`src/lessonSlides.js`**(新)— 幻灯片数据数组。每个 slide 是 `{ type, ...content }`。集中存放文案、视频 ID、路线图步骤、进化链、属性克制数据。
- **`src/tournamentTeams.js`**(新)— 8 支大赛队伍数据:每只宝可梦 `{ id, nameEn, nameZh }`，每支队伍 `{ regionEn, regionZh, resultEn, resultZh, members[] }`。图片由 `spriteUrl(id)` 生成。
- **样式** 加到 `src/App.css`(与现有 `.world-*` 等类同风格)。

### Slide 类型(在 `LessonScreen` 内按 `type` 分发)

- `quiz` — 问题 + 选项列表 + 正确答案。点击后揭晓(内部 `revealed` state；换页时重置)。
- `video` — 标题 + 说明 + 嵌入 YouTube iframe。
- `info` — 标题 + 双语正文 +(可选)角色/图片。
- `journey` — 训练师成长之旅:编号步骤路线图。
- `team` — 一张里含 1–3 支队伍，每支队伍一排 6 只立绘 + 战绩标签。
- `evolution` — 进化链(御三家 + 伊布家族)，用箭头连接立绘。
- `transition` — 「游戏时间」大按钮，调用 `onStartGame`。

## 幻灯片清单 / Slide List(共 13 张)

1. **开场问答** — 「你们知道宝可梦最早是从哪里来的吗?」选项 A.动画片 B.游戏 C.毛绒玩具 D.现实世界 → 点击揭晓 **B. 游戏(1996 Game Boy)**。
2. **视频** — Game Boy 原版开场(`C19O5xm51dk`)。看看最早的像素宝可梦。
3. **图文** — 动画的诞生 + 永远 10 岁的小智 & 不肯进精灵球的皮卡丘登场。
4. **视频** — 小智第一次遇见皮卡丘(`xfnYDn4zrYk`)。
5. **训练师成长之旅**(journey)— 让小朋友跟着走的 6 步路线:① 拿到图鉴 → ② 用精灵球收集宝可梦 → ③ 带喜欢的宝可梦对战野生宝可梦/其他训练师，升级变强 → ④ 挑战各地道馆收集徽章 → ⑤ 打进大师赛 → ⑥ 赢了就成为最终的宝可梦大师! 🏆
6. **互动问答** — 「小智一共挑战了多少次地区联盟大赛才成为世界冠军?」→ 点击揭晓 **8 次**(前 6 次都失败但从未放弃 → 教育点:永不放弃)。
7. **队伍 1** — 关都(16 强) / 城都(8 强) / 丰缘(8 强)。
8. **队伍 2** — 神奥(4 强) / 合众(8 强) / 卡洛斯(亚军，差一点点!)。
9. **队伍 3** — 阿罗拉(🏆 初代冠军) / 世界锦标赛·八大师赛(🏆 世界第一)。
10. **视频** — 巅峰对决:旅行 25 年后迎战不败冠军丹帝，皮卡丘一锤定音(`sR1hzqn8k5w`)。
11. **进化链**(evolution)— 御三家:小火龙→火恐龙→喷火龙(会变大变强);伊布家族:1 只伊布可进化成 8 种不同属性形态。
12. **属性克制问答** — 石头剪刀布:水克火 / 火克草 / 草克水。点击揭晓「小火龙 vs 杰尼龟，谁会赢?」→ 杰尼龟(水克火)。
13. **游戏时间**(transition)— 大按钮「开始猜猜看 →」,切到 Play tab 进入「Who's That Pokémon」。

## 数据 / Data

### 大赛队伍(全国图鉴编号已核对)

**关都联盟 (Kanto, 16 强):** 皮卡丘 Pikachu 25 · 妙蛙种子 Bulbasaur 1 · 喷火龙 Charizard 6 · 杰尼龟 Squirtle 7 · 巨钳蟹 Kingler 99 · 臭臭泥 Muk 89

**城都联盟 (Johto, 8 强):** 皮卡丘 25 · 赫拉克罗斯 Heracross 214 · 月桂叶 Bayleef 153 · 火球鼠 Cyndaquil 155 · 小锯鳄 Totodile 158 · 猫头夜鹰 Noctowl 164

**丰缘联盟 (Hoenn, 8 强):** 皮卡丘 25 · 蜥蜴王 Sceptile 254 · 大王燕 Swellow 277 · 龙虾小兵 Corphish 341 · 煤炭龟 Torkoal 324 · 冰鬼护 Glalie 362

**神奥联盟 (Sinnoh, 4 强):** 皮卡丘 25 · 烈焰猴 Infernape 392 · 土台龟 Torterra 389 · 姆克鹰 Staraptor 398 · 泳圈鼬 Buizel 418 · 圆陆鲨 Gible 443

**合众联盟 (Unova, 8 强):** 皮卡丘 25 · 流氓鳄 Krookodile 553 · 炒炒猪 Pignite 499 · 藤藤蛇 Snivy 495 · 水水獭 Oshawott 501 · 轰隆雉 Unfezant 521

**卡洛斯联盟 (Kalos, 亚军):** 皮卡丘 25 · 甲贺忍蛙 Greninja 658 · 烈箭鹰 Talonflame 663 · 摔角鹰人 Hawlucha 701 · 黏美龙 Goodra 706 · 音波龙 Noivern 715

**阿罗拉联盟 (Alola, 🏆 冠军):** 皮卡丘 25 · 炽焰咆哮虎 Incineroar 727 · 鬃岩狼人 Lycanroc 745 · 木木枭 Rowlet 722 · 美录梅塔 Melmetal 809 · 四颚针龙 Naganadel 804

**世界锦标赛 (Masters Eight, 🏆 世界第一):** 皮卡丘 25 · 快龙 Dragonite 149 · 耿鬼 Gengar 94 · 路卡利欧 Lucario 448 · 葱游兵 Sirfetch'd 865 · 鳃鱼龙 Dracovish 882

### 伊布家族 (Eevee family)

伊布 Eevee 133 → 水伊布 Vaporeon 134(水) · 雷伊布 Jolteon 135(电) · 火伊布 Flareon 136(火) · 太阳伊布 Espeon 196(超能力) · 月亮伊布 Umbreon 197(恶) · 叶伊布 Leafeon 470(草) · 冰伊布 Glaceon 471(冰) · 仙子伊布 Sylveon 700(妖精)

### 御三家进化 (Starter evolution)

小火龙 Charmander 4 → 火恐龙 Charmeleon 5 → 喷火龙 Charizard 6

### 视频 (YouTube IDs)

- Game Boy 原版开场:`C19O5xm51dk`
- 小智遇见皮卡丘:`xfnYDn4zrYk`
- 最终决战:`sR1hzqn8k5w`

## 交互细节 / Interaction

- **翻页**:底部「‹ 上一页 / 下一页 ›」按钮;键盘 ← → ;进度点显示当前位置。首页禁用「上一页」，末页「下一页」隐藏或禁用。
- **问答揭晓**:`quiz` slide 内部 `revealed` state，初始只显示选项;点「揭晓答案」按钮或点选项后高亮正确项并显示说明文字。翻页时 `revealed` 重置(用 slide index 作 `key` 强制重挂载)。
- **视频**:iframe `loading="lazy"`;每个视频下方保留一个「在 YouTube 打开」文字链接作为兜底(以防现场嵌入被限制)。
- **过渡**:末页按钮调用 `onStartGame()`，`BeginningScreen` 把 `tab` 设为 `'play'`。

## 边界 / Error Handling & Constraints

- 立绘图片走已有 `spriteUrl(id)`(GitHub 官方 artwork)，与游戏其余部分一致;失败时浏览器显示 alt 文本，不阻塞讲课。
- 视频需要现场联网;无网时用兜底链接。
- 幻灯片为纯展示，无持久化 state;离开 tab 再回来从第 1 页开始(可接受)。

## 测试 / Testing

沿用现有 Vitest + React Testing Library 模式:

- `LessonScreen.test.jsx` — 渲染第 1 页;点「下一页」前进、「上一页」后退;键盘 ← → 翻页;进度与页数一致;末页调用 `onStartGame`。
- `quiz` 揭晓:点击前不显示答案，点击后显示正确答案。
- `BeginningScreen.test.jsx`(补充)— 点「📣 Lesson」tab 渲染 `LessonScreen`。
- 数据完整性:`tournamentTeams` 每支队伍恰好 6 只，每只有 `id/nameEn/nameZh`。

## 非目标 / Out of Scope

- 不改动现有「Play」和「Pokémon World」两个 tab 的内容。
- 不做幻灯片编辑/后台;内容写死在数据文件里。
- 不做演讲者备注视图(用户已选纯幻灯片)。
