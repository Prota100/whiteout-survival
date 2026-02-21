// Skill synergy definitions
const UPGRADE_SYNERGY = {
  LOOT_BONUS: '💡 장비 드롭률도 증가!',
  TREASURE_HUNTER: '💡 장비 드롭률도 증가!',
  DAMAGE_UP: '💡 무기 장비와 시너지!',
  ATTACK_SPEED: '💡 무기 장비와 시너지!',
  CRITICAL: '💡 무기 장비와 시너지!',
  MAX_HP: '💡 갑옷 장비와 시너지!',
  ARMOR: '💡 갑옷 장비와 시너지!',
  MOVEMENT: '💡 신발 장비와 시너지!',
  DODGE: '💡 신발 장비와 시너지!',
  CAMPFIRE_BOOST: '💡 캠프파이어 HP 회복 강화!',
};

// ═══ 🔗 SKILL SYNERGY SYSTEM ═══
const SKILL_SYNERGIES = [
  {
    id: 'berserker', name: '🔴 광전사', emoji: '🔴',
    desc: '공격력+공격속도 → 추가 공격력 +20%',
    requires: ['DAMAGE_UP', 'ATTACK_SPEED'],
    bonus: { damageMultiplier: 0.20 }
  },
  {
    id: 'ironwall', name: '🛡️ 철벽', emoji: '🛡️',
    desc: 'HP강화+방어력 → 15% 확률 데미지 무효',
    requires: ['MAX_HP', 'ARMOR'],
    bonus: { blockChance: 0.15 }
  },
  {
    id: 'swift_hunter', name: '🌪️ 신속 사냥꾼', emoji: '🌪️',
    desc: '이동속도+넉백 → 이동속도 추가 +15%',
    requires: ['MOVEMENT', 'KNOCKBACK'],
    bonus: { speedMultiplier: 0.15 }
  },
  {
    id: 'lucky_finder', name: '🍀 행운아', emoji: '🍀',
    desc: '행운+보물사냥 → 장비 드롭률 +5%',
    requires: ['LOOT_BONUS', 'TREASURE_HUNTER'],
    bonus: { extraDropRate: 0.05 }
  },
  {
    id: 'cold_master', name: '❄️ 한파 지배자', emoji: '❄️',
    desc: '한파저항+HP회복 → 5초마다 한파 무효',
    requires: ['FROST_RESISTANCE', 'REGEN'],
    bonus: { coldImmunityPulse: 5 }
  }
];

