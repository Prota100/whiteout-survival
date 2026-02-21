// Achievement & random event definitions
const ACHIEVEMENTS = [
  { id: 'first_blood',    name: '첫 사냥',     desc: '첫 적 처치',           icon: '🎯' },
  { id: 'survivor_5',     name: '5분 생존',    desc: '5분 이상 생존',        icon: '⏱️' },
  { id: 'combo_10',       name: '연속 학살',   desc: '10킬 콤보 달성',       icon: '🔥' },
  { id: 'level_10',       name: '숙련자',      desc: '레벨 10 달성',         icon: '⭐' },
  { id: 'equipment_rare', name: '희귀 발견',   desc: '희귀 장비 첫 획득',    icon: '💙' },
  { id: 'equipment_epic', name: '에픽 발견',   desc: '에픽 장비 첫 획득',    icon: '💜' },
  { id: 'boss_kill',      name: '보스 사냥꾼', desc: '보스 처치',            icon: '💀' },
  { id: 'craft_1',        name: '연금술사',    desc: '장비 합성 1회',        icon: '⚗️' },
  { id: 'survivor_30',    name: '강인한 자',   desc: '30분 생존',            icon: '🛡️' },
  { id: 'kills_100',      name: '대학살',      desc: '100마리 처치',         icon: '☠️' },
  { id: 'secret_hidden_boss', name: '비밀 사냥꾼', desc: '숨겨진 보스 처치', icon: '👁️', hidden: true },
  { id: 'secret_konami',      name: '전설의 코드', desc: '???',              icon: '🎮', hidden: true },
  { id: 'secret_survive_zone',name: '극한 탐험가', desc: '극한 구역 5분 생존', icon: '🏔️', hidden: true },
  // 클래스 마스터리 (5종)
  { id: 'class_warrior',   name: '전사 마스터',   desc: '전사로 60분 클리어',     icon: '🪓', category: 'class' },
  { id: 'class_mage',      name: '마법사 마스터',  desc: '마법사로 60분 클리어',    icon: '🧊', category: 'class' },
  { id: 'class_survivor',  name: '생존가 마스터',  desc: '생존가로 60분 클리어',    icon: '🏃', category: 'class' },
  { id: 'class_shaman',    name: '무당 마스터',    desc: '무당으로 60분 클리어',    icon: '🔮', category: 'class' },
  { id: 'class_hunter',    name: '사냥꾼 마스터',  desc: '사냥꾼으로 60분 클리어',  icon: '🏹', category: 'class' },
  // 도전 모드 (4종)
  { id: 'boss_rush_clear', name: '보스 사냥꾼',   desc: '보스 러시 클리어',         icon: '🔴', category: 'challenge' },
  { id: 'ng_plus_clear',   name: '전설을 넘어',   desc: 'NG+ 모드 클리어',          icon: '⭐', category: 'challenge' },
  { id: 'endless_30',      name: '영원한 생존',   desc: '무한 모드 30분 추가 생존', icon: '♾️', category: 'challenge' },
  { id: 'hard_clear',      name: '강철 의지',     desc: '하드 이상 난이도 클리어',  icon: '🔥', category: 'challenge' },
  { id: 'speedrun_clear',  name: '번개처럼',     desc: '스피드런 모드 클리어',     icon: '⚡', category: 'challenge' },
  { id: 'speedrun_sub_20', name: '20분 벽',       desc: '스피드런 20분 내 클리어', icon: '⚡', category: 'challenge' },
  { id: 'handicap_win',    name: '역경 극복',     desc: '핸디캡 모드로 클리어',    icon: '🎯', category: 'challenge' },
  // 수집/탐험 (3종)
  { id: 'all_equipment',   name: '수집가',        desc: '모든 장비 슬롯에 에픽 이상 장착', icon: '💜', category: 'collect' },
  { id: 'all_zones',       name: '탐험가',        desc: '모든 지역 방문',            icon: '🗺️', category: 'collect' },
  { id: 'all_synergies',   name: '시너지 마스터', desc: '5가지 시너지 모두 발동',    icon: '⚡', category: 'collect' },
  // ═══ 신규 콘텐츠 업적 5종 ═══
  { id: 'ice_hunter_slayer',  name: '얼음 사냥꾼의 사냥꾼', desc: '얼음 사냥꾼 50마리 처치',              icon: '🏹', category: 'combat' },
  { id: 'mini_slime_master',  name: '분열의 지배자',       desc: '미니슬라임 100마리 처치',               icon: '💧', category: 'combat' },
  { id: 'shaman_killer',      name: '샤먼 킬러',          desc: '눈보라 샤먼 10마리 처치',               icon: '🧙', category: 'combat' },
  { id: 'bonfire_guardian',    name: '모닥불 수호자',       desc: '모닥불 옆에서 5분 누적 생존',           icon: '🔥', category: 'collect' },
  { id: 'crate_master',       name: '보급 전문가 마스터',   desc: '보급상자 30개 수집',                   icon: '📦', category: 'collect' },
  // ═══ 시크릿 업적 2종 ═══
  { id: 'secret_lightning_hunter', name: '번개 사냥꾼',    desc: '번개 폭풍 이벤트 중 적 100마리 처치',   icon: '⚡', hidden: true },
  { id: 'secret_magic_circle',    name: '마법의 원',       desc: '마법 서클 안에서 10연속 킬',            icon: '🔮', hidden: true },
];

const RANDOM_EVENTS = [
  { id: 'airdrop',       name: '📦 공중 보급',       desc: '보급품이 투하됩니다!',                       action: 'spawn_chest' },
  { id: 'blizzard_rush', name: '🌨️ 맹렬한 눈보라',  desc: '극한의 한파! 30초간 한파 데미지 2배.',       action: 'blizzard_double', duration: 30 },
  { id: 'enemy_rush',    name: '🐺 떼지어 오다',     desc: '적들이 몰려옵니다! 30초간 스폰 3배.',       action: 'spawn_rush',      duration: 30 },
  { id: 'golden_fever',  name: '✨ 황금 시간',       desc: '30초간 장비 드롭률 3배!',                   action: 'drop_fever',      duration: 30 },
  { id: 'healing_spring',name: '🔥 따뜻한 봄',       desc: '30초간 HP 회복 속도 5배!',                  action: 'heal_boost',      duration: 30 },
  { id: 'merchant',      name: '🧑‍🤝‍🧑 행상인 방문',    desc: '행상인이 나타났다! 보급 상자가 출현합니다.',action: 'spawn_chest' },
  { id: 'equipment_bonus', name: '🎁 장비 보급', desc: '30초간 장비 드롭률 5배!', action: 'equip_bonus_5x', duration: 30 },
  { id: 'xp_feast',        name: '📚 지식의 폭발', desc: '30초간 XP 획득 3배!',   action: 'xp_triple', duration: 30 },
  { id: 'shield_wall',     name: '🛡️ 신성한 방어', desc: '30초간 피해 50% 감소',  action: 'damage_reduce', duration: 30 },
  { id: 'mega_combo',      name: '🔥 킬 광란', desc: '다음 10킬은 XP 3배',        action: 'combo_xp', charges: 10 },
  { id: 'class_boost',     name: '✨ 클래스 각성', desc: '30초간 클래스 스킬 쿨다운 0', action: 'class_cd_zero', duration: 30 },
  // ═══ 신규 이벤트 5종 ═══
  { id: 'wolf_pack',       name: '🐺 야생의 부름',   desc: '늑대 무리 10마리가 동시에 출현!',               action: 'wolf_pack', minTime: 600 },
  { id: 'ice_treasure',    name: '💎 얼음 보물',     desc: '15초간 보급상자 3개 동시 스폰!',                action: 'ice_treasure', duration: 15 },
  { id: 'lightning_storm',  name: '⚡ 번개 폭풍',     desc: '30초간 랜덤 위치에 번개가 떨어짐!',             action: 'lightning_storm', duration: 30 },
  { id: 'avalanche_v2',    name: '🌊 눈사태 2',      desc: '상→하 방향으로 눈덩이가 쏟아집니다!',           action: 'avalanche_v2', duration: 20 },
  { id: 'magic_circle',    name: '🔮 마법 서클',     desc: '60초간 마법 서클 안에서 공격속도 +50%!',         action: 'magic_circle', duration: 60 },
];

// ═══════════════════════════════════════════════════════════════════
// 🏅 RecordManager — 개인 기록 관리
// ═══════════════════════════════════════════════════════════════════
