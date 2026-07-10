// Fame-tier curation for difficulty selection. There's no popularity data in
// PokeAPI, so these lists are a hand-picked, best-effort judgment call — not a
// verified ranking. Feel free to add/remove IDs; see docs/superpowers/specs/
// 2026-07-08-fame-based-difficulty-design.md for the intent behind each tier.
// IDs are National Dex numbers. Master Trainer = everything not listed here.

export const TOTAL_POKEMON = 1025

// The most kid-recognizable Pokémon (145 of them): every starter line
// across all 9 generations, the Pikachu and Eevee families, mascot legendaries,
// and the Gen-1 anime icons.
export const BEGINNER_IDS = [
  // Gen 1
  1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 18, 25, 26, 35, 37, 38, 39, 52, 54, 58, 59, 65, 68, 79, 80, 92, 93, 94, 95, 113, 122, 123, 129, 130, 131, 132, 133, 134, 135, 136, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151,
  // Gen 2
  152, 153, 154, 155, 156, 157, 158, 159, 160, 172, 175, 196, 197, 212, 214, 243, 244, 245, 248, 249, 250, 251,
  // Gen 3
  252, 253, 254, 255, 256, 257, 258, 259, 260, 359, 380, 381, 382, 383, 384, 385, 386,
  // Gen 4
  387, 388, 389, 390, 391, 392, 393, 394, 395, 445, 448, 470, 471, 483, 484, 487, 493,
  // Gen 5
  495, 496, 497, 498, 499, 500, 501, 643, 644, 646,
  // Gen 6
  650, 652, 653, 655, 656, 658, 700, 716, 717,
  // Gen 7
  722, 724, 725, 727, 728, 730, 778,
  // Gen 8
  810, 812, 813, 815, 816, 888, 889,
  // Gen 9
  906, 908, 909, 911, 912, 914,
]

// Solidly recognizable but not mascot-level — other evolutions, notable
// legendaries, and gym-leader signature Pokémon across all 9 generations.
export const ADVANCED_IDS = [
  // Gen 1
  16, 20, 41, 74, 76, 88, 89, 97, 100, 108, 115, 127, 128, 137,
  // Gen 2
  176, 179, 181, 184, 198, 201, 202, 208, 216, 217, 227, 229, 230, 232, 242, 246, 247,
  // Gen 3
  280, 281, 282, 302, 303, 306, 310, 319, 321, 323, 334, 350, 356, 365, 373, 376,
  // Gen 4
  428, 429, 442, 447, 450, 454, 460, 461, 466, 467, 468, 475, 479, 485, 491,
  // Gen 5
  503, 570, 571, 609, 621, 628, 635, 637, 647, 649,
  // Gen 6
  663, 668, 671, 678, 681, 706, 719, 720, 721,
  // Gen 7
  745, 763, 773, 784, 785, 786, 787, 788, 791, 792, 800, 802, 807, 809,
  // Gen 8
  818, 843, 858, 861, 884, 890, 891, 894, 897, 898,
  // Gen 9
  937, 961, 970, 1000, 1007, 1008, 1017,
]

// The roster *preview* page caps Master Trainer's list to this curated set (the
// most recognizable Pokémon among those not already in BEGINNER_IDS/ADVANCED_IDS),
// so the page isn't rendering 700+ sprites at once. Actual Master-difficulty
// gameplay is unaffected — it still draws from the full remaining pool (see
// poolForDifficulty in gameLogic.js).
export const MASTER_PREVIEW_IDS = [
  // Gen 1
  19, 21, 27, 29, 32, 43, 46, 48, 50, 56, 60, 69, 72, 81, 84, 85,
  // Gen 2
  162, 168, 169, 170, 178, 183, 185, 188, 189, 190, 194, 195, 200,
  // Gen 3
  261, 264, 267, 269, 278, 284, 288, 290, 291, 293, 296, 309, 313, 320,
  // Gen 4
  396, 399, 401, 403, 415, 417, 422, 425, 427, 431, 434, 438, 441, 449,
  // Gen 5
  504, 506, 511, 519, 529, 535, 546, 550, 559, 568, 572, 587, 602,
  // Gen 6
  659, 661, 667, 679, 682, 686, 693, 696, 698, 704, 710,
  // Gen 7
  731, 734, 737, 740, 742, 746, 751, 755, 758, 761, 769, 774, 777,
  // Gen 8
  819, 822, 827, 835, 840, 842, 848, 854, 859, 863, 870, 877, 885,
  // Gen 9
  915, 918, 921, 925, 931, 956, 959, 978, 982, 984,
]
