// Player skins & achievement rewards
const PLAYER_SKINS = [
  { id: 'default',       name: '기본',         color: 0xFFFFFF, outline: 0x888888, unlockCondition: 'always' },
  { id: 'warrior_red',   name: '전사의 붉음',  color: 0xFF4444, outline: 0xCC0000, unlockCondition: 'class_warrior_win' },
  { id: 'mage_blue',     name: '마법사의 푸름', color: 0x44AAFF, outline: 0x0066CC, unlockCondition: 'class_mage_win' },
  { id: 'survivor_green',name: '생존가의 초록', color: 0x44FF88, outline: 0x00AA44, unlockCondition: 'class_survivor_win' },
  { id: 'golden',        name: '황금 영웅',    color: 0xFFD700, outline: 0xB8860B, unlockCondition: 'win_once' },
  { id: 'shadow',        name: '어둠의 전사',  color: 0x444444, outline: 0x222222, unlockCondition: 'kills_100_total' },
  { id: 'icy',           name: '얼음 군주',    color: 0xAAEEFF, outline: 0x66CCEE, unlockCondition: 'achievements_5' },
  { id: 'legendary',     name: '전설의 자',    color: 0xFF8C00, outline: 0xFF4500, unlockCondition: 'endless_60min' },
  { id: 'shaman_purple', name: '무당의 영혼',  color: 0x9B59B6, outline: 0x6C3483, unlockCondition: 'class_shaman_win' },
  { id: 'hunter_brown',  name: '설원의 사냥꾼', color: 0x8B4513, outline: 0x6B3A2A, unlockCondition: 'class_hunter_win' },
];

const ACHIEVEMENT_REWARDS = {
  first_blood:    { type: 'meta_points', amount: 2 },
  survivor_5:     { type: 'meta_points', amount: 5 },
  combo_10:       { type: 'meta_points', amount: 10 },
  level_10:       { type: 'meta_points', amount: 8 },
  equipment_rare: { type: 'skin_unlock', skinId: 'default' },
  equipment_epic: { type: 'meta_points', amount: 15 },
  boss_kill:      { type: 'meta_points', amount: 20 },
  craft_1:        { type: 'meta_points', amount: 5 },
  survivor_30:    { type: 'meta_points', amount: 30 },
  kills_100:      { type: 'skin_unlock', skinId: 'shadow' },
  // 클래스 마스터리
  class_warrior:   { type: 'meta_points', amount: 15 },
  class_mage:      { type: 'meta_points', amount: 15 },
  class_survivor:  { type: 'meta_points', amount: 15 },
  class_shaman:    { type: 'meta_points', amount: 15 },
  class_hunter:    { type: 'meta_points', amount: 15 },
  // 도전 모드
  boss_rush_clear: { type: 'meta_points', amount: 25 },
  ng_plus_clear:   { type: 'meta_points', amount: 30 },
  endless_30:      { type: 'meta_points', amount: 30 },
  hard_clear:      { type: 'meta_points', amount: 20 },
  // 수집/탐험
  all_equipment:   { type: 'meta_points', amount: 20 },
  all_zones:       { type: 'meta_points', amount: 15 },
  all_synergies:   { type: 'meta_points', amount: 25 },
};

