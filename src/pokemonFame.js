// Fame-tier curation for difficulty selection. There's no popularity data in
// PokeAPI, so these lists are a hand-picked, best-effort judgment call — not a
// verified ranking. Feel free to add/remove IDs; see docs/superpowers/specs/
// 2026-07-08-fame-based-difficulty-design.md for the intent behind each tier.
// IDs are National Dex numbers. Master Trainer = everything not listed here.

export const TOTAL_POKEMON = 1025

// ~40-60: unmistakable household names — Gen 1 starter lines, Pikachu, Eevee
// and its evolutions, mascot legendaries, and a few modern icons.
export const BEGINNER_IDS = [
  // Bulbasaur line, Charmander line, Squirtle line
  1, 2, 3, 4, 5, 6, 7, 8, 9,
  // Pikachu, Raichu
  25, 26,
  // Jigglypuff, Meowth, Psyduck, Gengar
  39, 52, 54, 94,
  // Gyarados, Lapras, Ditto
  130, 131, 132,
  // Eevee, Vaporeon, Jolteon, Flareon
  133, 134, 135, 136,
  // Snorlax, legendary birds
  143, 144, 145, 146,
  // Dragonite, Mewtwo, Mew
  149, 150, 151,
  // Espeon, Umbreon
  196, 197,
  // Legendary beasts
  243, 244, 245,
  // Lugia, Ho-Oh
  249, 250,
  // Weather trio (Kyogre, Groudon, Rayquaza)
  382, 383, 384,
  // Lucario
  448,
  // Leafeon, Glaceon
  470, 471,
  // Greninja, Sylveon, Mimikyu
  658, 700, 778,
  // Zacian, Zamazenta
  888, 889,
]

// ~150-250: solidly recognizable but not mascot-level — other starter lines,
// popular non-starter evolutions, notable legendaries, gym-leader signature
// Pokémon, spread across all 9 generations.
export const ADVANCED_IDS = [
  // Gen 1
  12, 16, 18, 20, 35, 37, 38, 41, 58, 59, 65, 68, 74, 76, 79, 80, 88, 89, 92,
  93, 95, 97, 100, 108, 113, 115, 122, 123, 127, 128, 137, 142, 147, 148,
  // Gen 2
  152, 153, 154, 155, 156, 157, 158, 159, 160, 175, 176, 179, 181, 184, 198,
  201, 202, 208, 212, 214, 216, 217, 227, 229, 230, 232, 242, 246, 247, 248,
  251,
  // Gen 3
  252, 253, 254, 255, 256, 257, 258, 259, 260, 280, 281, 282, 302, 303, 306,
  310, 319, 321, 323, 334, 350, 356, 359, 365, 373, 376, 380, 381, 385, 386,
  // Gen 4
  387, 389, 390, 392, 393, 395, 428, 429, 442, 445, 447, 450, 454, 460, 461,
  466, 467, 468, 475, 479, 483, 484, 485, 487, 491, 493,
  // Gen 5
  495, 497, 498, 500, 501, 503, 570, 571, 609, 621, 628, 635, 637, 643, 644,
  646, 647, 649,
  // Gen 6
  650, 652, 653, 655, 656, 663, 668, 671, 678, 681, 706, 719, 720, 721,
  // Gen 7
  722, 724, 725, 727, 728, 730, 745, 763, 773, 784, 785, 786, 787, 788, 791,
  792, 800, 802, 807, 809,
  // Gen 8
  810, 812, 813, 815, 816, 818, 843, 858, 861, 884, 890, 891, 894, 897, 898,
  // Gen 9
  906, 908, 909, 911, 912, 914, 937, 961, 970, 1000, 1007, 1008, 1017,
]

// Exactly 120: the roster *preview* page caps Master Trainer's list to this
// curated set (the most recognizable Pokémon among the ~777 not already in
// BEGINNER_IDS/ADVANCED_IDS), so the page isn't rendering 700+ sprites at
// once. Actual Master-difficulty gameplay is unaffected — it still draws
// from the full remaining pool (see poolForDifficulty in gameLogic.js).
export const MASTER_PREVIEW_IDS = [
  // Gen 1
  19, 21, 27, 29, 32, 43, 46, 48, 50, 56, 60, 69, 72, 81, 84, 85,
  // Gen 2
  162, 168, 169, 170, 172, 178, 183, 185, 188, 189, 190, 194, 195, 200,
  // Gen 3
  261, 264, 267, 269, 278, 284, 288, 290, 291, 293, 296, 309, 313, 320,
  // Gen 4
  396, 399, 401, 403, 415, 417, 422, 425, 427, 431, 434, 438, 441, 449,
  // Gen 5
  504, 506, 511, 519, 529, 535, 546, 550, 559, 568, 572, 587, 602,
  // Gen 6
  659, 661, 667, 679, 682, 686, 693, 696, 698, 704, 710, 716, 717,
  // Gen 7
  731, 734, 737, 740, 742, 746, 751, 755, 758, 761, 769, 774, 777,
  // Gen 8
  819, 822, 827, 835, 840, 842, 848, 854, 859, 863, 870, 877, 885,
  // Gen 9
  915, 918, 921, 925, 931, 956, 959, 978, 982, 984,
]
