// Difficulty & daily challenge data
const DIFFICULTY_MODES = {
  normal: { id: 'normal', name: '🌿 일반', color: '#44DD44', colorHex: 0x44DD44, warn: '',
    enemyHP: 1.0, enemyDmg: 1.0, spawnRate: 1.0, coldDmg: 1.0, xpMul: 1.0, dropMul: 1.0, clearBonus: 10 },
  hard: { id: 'hard', name: '🔥 하드', color: '#FF8800', colorHex: 0xFF8800, warn: '적이 강해집니다',
    enemyHP: 1.5, enemyDmg: 1.5, spawnRate: 1.3, coldDmg: 1.5, xpMul: 1.2, dropMul: 1.2, clearBonus: 25 },
  hell: { id: 'hell', name: '💀 지옥', color: '#FF2222', colorHex: 0xFF2222, warn: '💀 살아남을 수 있을까?',
    enemyHP: 2.5, enemyDmg: 2.5, spawnRate: 2.0, coldDmg: 2.0, xpMul: 1.5, dropMul: 1.5, clearBonus: 50 },
};

// ═══ 데일리 챌린지 시스템 ═══
const DAILY_CHALLENGES = [
  { id: 'no_equipment', name: '맨손 도전', desc: '장비 드롭 없음. 스킬만으로 생존!', modifier: { noEquipDrop: true } },
  { id: 'speed_run', name: '스피드런', desc: '30분 안에 레벨 20 달성 시 클리어!', modifier: { winCondition: 'level20in30' } },
  { id: 'one_upgrade', name: '단일 빌드', desc: '업그레이드를 1종류만 선택 가능', modifier: { singleUpgrade: true } },
  { id: 'blizzard_always', name: '영구 한파', desc: '항상 한파 활성화', modifier: { alwaysBlizzard: true } },
  { id: 'glass_cannon', name: '유리 대포', desc: 'HP 30, 공격력 3배', modifier: { hp: 30, damageMult: 3.0 } },
  { id: 'pacifist', name: '평화주의', desc: '30분 생존 시 클리어 (공격 불가!)', modifier: { noAttack: true, winCondition: 'survive30' } },
  { id: 'boss_rush', name: '보스 러시', desc: '보스가 10분마다 등장', modifier: { bossInterval: 600 } },
];

function getTodayChallenge() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return DAILY_CHALLENGES[seed % DAILY_CHALLENGES.length];
}

function getDailyChallengeKey() {
  const today = new Date();
  return `daily_${today.getFullYear()}_${today.getMonth()+1}_${today.getDate()}`;
}

// ═══ 경험치(XP) 시스템 ═══
