// Upgrade definitions
const UPGRADE_CATEGORIES = {
  combat: { color: '#EF5350', bgColor: 0xC62828, borderColor: '#EF5350', icon: '⚔️', name: '전투' },
  survival: { color: '#42A5F5', bgColor: 0x1565C0, borderColor: '#42A5F5', icon: '🛡️', name: '생존' },
  economy: { color: '#FFD700', bgColor: 0xF9A825, borderColor: '#FFD700', icon: '💰', name: '경제' },
  special: { color: '#CE93D8', bgColor: 0x7B1FA2, borderColor: '#CE93D8', icon: '✨', name: '특수' },
};

const UPGRADES = {
  // 전투 (빨강)
  DAMAGE_UP:    { name: '강력한 일격', desc: '+25% 공격력', icon: '🗡️', category: 'combat', maxLevel: 5, rarity: 'common' },
  ATTACK_SPEED: { name: '빠른 손놀림', desc: '+20% 공격속도', icon: '⚡', category: 'combat', maxLevel: 4, rarity: 'common' },
  CRITICAL:     { name: '치명타', desc: '+10% 크리티컬', icon: '💥', category: 'combat', maxLevel: 3, rarity: 'rare' },
  LIFESTEAL:    { name: '생명 흡수', desc: '공격 시 체력 +1', icon: '🩸', category: 'combat', maxLevel: 3, rarity: 'rare' },
  KNOCKBACK:    { name: '강타', desc: '+넉백 거리', icon: '💨', category: 'combat', maxLevel: 2, rarity: 'epic' },
  // 생존 (파랑)
  MAX_HP:       { name: '튼튼함', desc: '+20 최대 체력', icon: '❤️', category: 'survival', maxLevel: 5, rarity: 'common' },
  WARMTH:       { name: '방한복', desc: '+체온 저항', icon: '🧥', category: 'survival', maxLevel: 4, rarity: 'common' },
  REGEN:        { name: '자연 회복', desc: '+초당 체력 회복', icon: '💚', category: 'survival', maxLevel: 3, rarity: 'rare' },
  MOVEMENT:     { name: '날렵함', desc: '+15% 이동속도', icon: '👟', category: 'survival', maxLevel: 4, rarity: 'common' },
  DODGE:        { name: '회피', desc: '+10% 회피율', icon: '🌀', category: 'survival', maxLevel: 2, rarity: 'epic' },
  // 경제 (노랑)
  LOOT_BONUS:   { name: '행운', desc: '+50% 드롭률', icon: '🍀', category: 'economy', maxLevel: 4, rarity: 'common' },
  WOOD_BONUS:   { name: '벌목꾼', desc: '+나무 획득량', icon: '🪓', category: 'economy', maxLevel: 3, rarity: 'common' },
  STONE_BONUS:  { name: '채굴꾼', desc: '+돌 획득량', icon: '⛏️', category: 'economy', maxLevel: 3, rarity: 'common' },
  STORAGE:      { name: '큰 가방', desc: '+25 보관함', icon: '🎒', category: 'economy', maxLevel: 4, rarity: 'common' },
  SELL_BONUS:   { name: '상술', desc: '+판매 가격', icon: '🏷️', category: 'economy', maxLevel: 3, rarity: 'rare' },
  // 특수 (보라)
  MAGNET:       { name: '자석', desc: '아이템 자동 수집 범위+', icon: '🧲', category: 'special', maxLevel: 2, rarity: 'epic' },
  MULTI_HIT:    { name: '관통', desc: '적 2명까지 공격', icon: '🔱', category: 'special', maxLevel: 2, rarity: 'epic' },
  EXPLOSION:    { name: '폭발', desc: '처치 시 폭발 데미지', icon: '💣', category: 'special', maxLevel: 2, rarity: 'epic' },
  CAMPFIRE_BOOST:{ name: '화덕 마스터', desc: '화덕 효과 +50%', icon: '🔥', category: 'special', maxLevel: 2, rarity: 'rare' },
  TIME_BONUS:   { name: '시간 조작', desc: '쿨다운 -20%', icon: '⏱️', category: 'special', maxLevel: 2, rarity: 'rare' },
  // === 추가 10종 ===
  FROST_RESISTANCE: { name: '동상 저항', desc: '한파 온도 감소 -30%', icon: '🧊', category: 'survival', maxLevel: 3, rarity: 'rare' },
  BERSERKER:        { name: '광전사', desc: 'HP 50% 이하 시 공격력 +50%', icon: '😤', category: 'combat', maxLevel: 2, rarity: 'epic' },
  CHAIN_ATTACK:     { name: '연쇄 공격', desc: '처치 시 인접 적에게 50% 데미지', icon: '⛓️', category: 'combat', maxLevel: 2, rarity: 'epic' },
  TREASURE_HUNTER:  { name: '보물 사냥꾼', desc: '상자 드롭 확률 +40%', icon: '🗺️', category: 'economy', maxLevel: 3, rarity: 'rare' },
  SWIFT_STRIKE:     { name: '연속 일격', desc: '첫 번째 공격 쿨다운 즉시', icon: '🌪️', category: 'combat', maxLevel: 2, rarity: 'rare' },
  FROST_WALKER:     { name: '서리 발걸음', desc: '이동 시 주변 적 슬로우 10%', icon: '❄️', category: 'special', maxLevel: 2, rarity: 'rare' },
  VAMPIRE:          { name: '흡혈귀', desc: '처치 시 체력 +5 회복', icon: '🧛', category: 'combat', maxLevel: 3, rarity: 'rare' },
  ARMOR:            { name: '방어구', desc: '받는 데미지 -20%', icon: '🛡️', category: 'survival', maxLevel: 3, rarity: 'common' },
  WINTER_HEART:     { name: '겨울 심장', desc: '한파 중 공격력 +20%', icon: '💙', category: 'special', maxLevel: 2, rarity: 'epic' },
  SCAVENGER:        { name: '약탈자', desc: '자원 채취 속도 +30%', icon: '🦅', category: 'economy', maxLevel: 3, rarity: 'common' },
  // === 추가 10종 (Phase 2) ===
  CHAIN_LIGHTNING:   { name: '연쇄 번개', desc: '공격이 2마리에게 연쇄 (30% 데미지)', icon: '⚡', category: 'combat', maxLevel: 2, rarity: 'epic' },
  ICE_AURA:          { name: '얼음 오라', desc: '주변 100px 적 이동속도 -30%', icon: '❄️', category: 'special', maxLevel: 2, rarity: 'rare' },
  LIFE_STEAL_PCT:    { name: '생명 흡수%', desc: '데미지의 10%를 HP로 회복', icon: '🩸', category: 'survival', maxLevel: 3, rarity: 'rare' },
  SHIELD_BASH:       { name: '방패 강타', desc: '5초마다 다음 공격이 스턴(0.5초)', icon: '🛡️', category: 'combat', maxLevel: 2, rarity: 'rare' },
  DOUBLE_SHOT:       { name: '더블샷', desc: '30% 확률로 공격 2회 발사', icon: '🎯', category: 'combat', maxLevel: 2, rarity: 'epic' },
  THORNS:            { name: '가시 갑옷', desc: '피격 시 공격자에게 5 반사 데미지', icon: '🌵', category: 'survival', maxLevel: 3, rarity: 'common' },
  TIME_WARP:         { name: '시간 왜곡', desc: '15초마다 주변 적 1초 동결', icon: '⏰', category: 'special', maxLevel: 2, rarity: 'epic' },
  XP_SCAVENGER:      { name: '수집가', desc: 'XP 획득 범위 +50%', icon: '🧲', category: 'economy', maxLevel: 2, rarity: 'common' },
  ADRENALINE:        { name: '아드레날린', desc: 'HP 30% 이하 시 공격속도 +50%', icon: '💉', category: 'combat', maxLevel: 2, rarity: 'rare' },
  BLIZZARD_CLOAK:    { name: '설원 망토', desc: '한파 중 이동속도 패널티 없음', icon: '🧥', category: 'survival', maxLevel: 1, rarity: 'rare' },
  // ═══ 클래스 고유 업그레이드 ═══
  CLASS_WARRIOR_ROAR: { name: '전사의 포효', desc: '주변 100px 적 2초 공포(이동정지)', icon: '🪓', category: 'combat', maxLevel: 1, rarity: 'legendary', classOnly: 'warrior' },
  CLASS_MAGE_BLIZZARD: { name: '얼음 폭풍', desc: '전체 적 1초 동결 (쿨다운 30초)', icon: '🧊', category: 'special', maxLevel: 1, rarity: 'legendary', classOnly: 'mage' },
  CLASS_SURVIVOR_SPRINT: { name: '질주', desc: '3초간 이속 3배+무적 (쿨다운 20초)', icon: '🏃', category: 'survival', maxLevel: 1, rarity: 'legendary', classOnly: 'survivor' },
  CLASS_SHAMAN_SPIRIT: { name: '정령 소환', desc: '정령이 10초간 적에 초당 15 데미지+XP 자동 수집 (쿨다운 30초)', icon: '🔮', category: 'special', maxLevel: 1, rarity: 'legendary', classOnly: 'shaman' },
  CLASS_SHAMAN_STORM: { name: '정령의 폭풍', desc: '정령이 30초간 화면 전체를 돌며 50 데미지 광역 공격 (쿨다운 45초)', icon: '🌀', category: 'special', maxLevel: 1, rarity: 'legendary', classOnly: 'shaman' },
  CLASS_HUNTER_VOLLEY: { name: '집중 사격', desc: '가장 가까운 적 5마리에게 3초간 연속 화살 발사 (쿨다운 25초)', icon: '🏹', category: 'combat', maxLevel: 1, rarity: 'legendary', classOnly: 'hunter' },
  CLASS_HUNTER_POISON: { name: '독화살', desc: '공격이 DoT 독 효과 (초당 10 데미지, 5초, 중첩 가능)', icon: '☠️', category: 'combat', maxLevel: 1, rarity: 'legendary', classOnly: 'hunter' },
  // ═══ 엔드게임 전용 업그레이드 (60분 이후 무한 모드) ═══
  GODLIKE_POWER:     { name: '신의 축복', desc: '모든 스탯 +50%', icon: '👑', category: 'special', maxLevel: 1, rarity: 'unique', endgameOnly: true },
  IMMORTAL_WILL:     { name: '불멸의 의지', desc: 'HP+200, HP회복 +5/s', icon: '💖', category: 'survival', maxLevel: 1, rarity: 'unique', endgameOnly: true },
  TIME_WARP_ULTRA:   { name: '시간 가속', desc: '공격속도 +100%, 쿨다운 -50%', icon: '⏩', category: 'combat', maxLevel: 1, rarity: 'unique', endgameOnly: true },
  FROZEN_WORLD:      { name: '얼어붙은 세계', desc: '모든 적 이동속도 -60%', icon: '🌨️', category: 'special', maxLevel: 1, rarity: 'unique', endgameOnly: true },
  SPIRIT_BOMB:       { name: '정령의 폭탄', desc: '매 10초마다 화면 전체 50 데미지', icon: '💥', category: 'combat', maxLevel: 1, rarity: 'unique', endgameOnly: true },
};

// ═══ 플레이어 클래스 시스템 ═══
