// Blizzard schedule & map zones
const BLIZZARD_SCHEDULE = [
  { startMs: 3*60*1000,      duration: 25*1000, tempMult: 1.8, reward: { boxes: 1, gold: 15 } },
  { startMs: 7*60*1000,      duration: 30*1000, tempMult: 2.2, reward: { boxes: 1, gold: 25 } },
  { startMs: 12*60*1000,     duration: 35*1000, tempMult: 2.6, reward: { boxes: 2, gold: 40 } },
  { startMs: 18*60*1000,     duration: 40*1000, tempMult: 3.0, reward: { boxes: 2, gold: 60 } },
  { startMs: 25*60*1000,     duration: 45*1000, tempMult: 3.5, reward: { boxes: 2, gold: 80 } },
  { startMs: 33*60*1000,     duration: 50*1000, tempMult: 4.0, reward: { boxes: 3, gold: 100 } },
  { startMs: 42*60*1000,     duration: 55*1000, tempMult: 4.5, reward: { boxes: 3, gold: 130 } },
  { startMs: 52*60*1000,     duration: 60*1000, tempMult: 5.0, reward: { boxes: 4, gold: 160 } },
];

// ═══ 맵 구역 시스템 ═══
const MAP_CENTER = { x: 1200, y: 1200 };
const ZONE_RADII = { safe: 300, normal: 700, danger: 1000 };
const ZONE_TEMP_DECAY = { safe: 0, normal: -1, danger: -2, extreme: -4 };

