// Player class definitions
const PLAYER_CLASSES = {
  warrior: {
    name: '전사', icon: '🪓', color: '#FF4444', colorHex: 0xFF4444,
    desc: '근접 전투 특화. 높은 체력과 공격력.',
    stats: { hp: 120, damageMul: 1.3, speedMul: 0.9, attackSpeedMul: 1.0, attackRangeMul: 1.0, warmthResist: 0 },
    passives: ['킬 시 5% HP+2 회복', 'HP 50% 이하→공격력 1.5x (분노)'],
    startItem: { slot: 'weapon', itemId: 'knife', grade: 'common' },
    ratings: { hp: 4, atk: 4, spd: 3, surv: 5 },
  },
  mage: {
    name: '마법사', icon: '🧊', color: '#4488FF', colorHex: 0x4488FF,
    desc: '범위 공격 특화. 관통+동결 효과.',
    stats: { hp: 80, damageMul: 1.1, speedMul: 1.0, attackSpeedMul: 1.3, attackRangeMul: 1.5, warmthResist: 0 },
    passives: ['공격 관통 (다수 적 히트)', '킬 시 10% 얼음 폭발'],
    startItem: { slot: 'ring', itemId: 'ruby_ring', grade: 'common' },
    ratings: { hp: 3, atk: 3, spd: 4, surv: 2 },
  },
  survivor: {
    name: '생존가', icon: '🏃', color: '#44DD44', colorHex: 0x44DD44,
    desc: '빠른 이동과 한파 저항. 생존 특화.',
    stats: { hp: 90, damageMul: 1.0, speedMul: 1.4, attackSpeedMul: 1.0, attackRangeMul: 1.0, warmthResist: 0.3 },
    passives: ['이동 중 15% 회피', '한파 이속 패널티 없음'],
    startItem: { slot: 'boots', itemId: 'wind_boots', grade: 'common' },
    ratings: { hp: 3.5, atk: 2, spd: 5, surv: 4 },
  },
  shaman: {
    name: '무당', icon: '🔮', color: '#9B59B6', colorHex: 0x9B59B6,
    desc: '자연의 힘을 다루는 지원형. XP 1.5x, 영혼 구슬+정령 소환.',
    stats: { hp: 95, damageMul: 1.0, speedMul: 1.1, attackSpeedMul: 1.0, attackRangeMul: 1.0, warmthResist: 0, xpMul: 1.5 },
    passives: ['처치 시 10% 영혼 구슬 (HP+5)', '캠프파이어 150px내 전 스탯+15%'],
    startItem: { slot: 'ring', itemId: 'legend_ring', grade: 'common' },
    ratings: { hp: 3, atk: 2, spd: 3, surv: 4, special: 5 },
  },
  hunter: {
    name: '사냥꾼', icon: '🏹', color: '#8B4513', colorHex: 0x8B4513,
    desc: '원거리 공격 특화. 멀리서 더 강한 데미지.',
    stats: { hp: 85, damageMul: 1.2, speedMul: 1.2, attackSpeedMul: 1.0, attackRangeMul: 2.0, warmthResist: 0 },
    passives: ['원거리 1.5x / 근접 0.7x (저격수)', '15초마다 함정 설치 (동결+50dmg)'],
    startItem: { slot: 'weapon', itemId: 'spear', grade: 'common' },
    ratings: { hp: 2, atk: 4, spd: 3, surv: 2, special: 4 },
  },
};

// ═══ 난이도 모드 시스템 ═══
