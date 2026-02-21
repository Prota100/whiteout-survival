// World constants, animals, buildings, recipes, quests
const WORLD_W = 2400;
const WORLD_H = 2400;

// ── Animal Definitions (REBALANCED) ──
const ANIMALS = {
  rabbit:  { hp: 10,  speed: 100,  damage: 0, drops: { meat: 1 }, size: 16, behavior: 'flee', name: '🐰 토끼', aggroRange: 80, fleeRange: 60, fleeDistance: 80, color: 0xFFEEDD },
  deer:    { hp: 15,  speed: 80,  damage: 0, drops: { meat: 2, leather: 1 }, size: 18, behavior: 'flee', name: '🦌 사슴', aggroRange: 120, fleeRange: 90, fleeDistance: 100, color: 0xC4A46C },
  penguin: { hp: 8,  speed: 40,  damage: 0, drops: { meat: 1 }, size: 16, behavior: 'wander', name: '🐧 펭귄', aggroRange: 0, fleeRange: 0, fleeDistance: 0, color: 0x222222 },
  seal:    { hp: 12,  speed: 30,  damage: 0, drops: { meat: 2, leather: 2 }, size: 20, behavior: 'wander', name: '🦭 물개', aggroRange: 0, fleeRange: 0, fleeDistance: 0, color: 0x7B8D9E },
  wolf:    { hp: 30,  speed: 110,  damage: 5, drops: { meat: 3, leather: 1 }, size: 18, behavior: 'chase', name: '🐺 늑대', aggroRange: 160, fleeRange: 0, fleeDistance: 0, color: 0x666677 },
  bear:    { hp: 80, speed: 70,  damage: 15, drops: { meat: 6, leather: 3 }, size: 26, behavior: 'chase', name: '🐻 곰', aggroRange: 140, fleeRange: 0, fleeDistance: 0, color: 0xF0EEE8 },
  ice_golem: { hp: 240, speed: 60, damage: 50, drops: { meat: 10, leather: 5, gold: 15 }, size: 24, behavior: 'chase', name: '🧊 얼음골렘', aggroRange: 200, fleeRange: 0, fleeDistance: 0, color: 0x88CCEE },
  snow_leopard: { hp: 45, speed: 220, damage: 20, drops: { meat: 4, leather: 2, gold: 5 }, size: 14, behavior: 'chase', name: '🐆 눈표범', aggroRange: 250, fleeRange: 0, fleeDistance: 0, color: 0xF8F8FF },
  ice_hunter: { hp: 45, speed: 80, damage: 3, drops: { meat: 3, leather: 2, gold: 3 }, size: 20, behavior: 'ranged', name: '🏹 얼음사냥꾼', aggroRange: 280, fleeRange: 0, fleeDistance: 0, color: 0x4488CC },
  splitting_slime: { hp: 64, speed: 45, damage: 8, drops: { meat: 4, gold: 5 }, size: 24, behavior: 'chase', name: '💥 분열슬라임', aggroRange: 160, fleeRange: 0, fleeDistance: 0, color: 0x44CC44 },
  blizzard_shaman: { hp: 25, speed: 70, damage: 2, drops: { meat: 2, gold: 8 }, size: 18, behavior: 'shaman', name: '🔮 눈보라샤먼', aggroRange: 200, fleeRange: 100, fleeDistance: 120, color: 0xAA55FF },
};

// ── Building Definitions (ENHANCED) ──
const BUILDINGS = {
  campfire: {
    name: '화덕', cost: { wood: 5 }, warmth: 8, desc: '강력한 생존 기지', icon: '🔥',
    warmthRadius: 150,
    effects: { healthRegen: 8, goldGeneration: 3, attackSpeedBonus: 1.5, moveSpeedBonus: 1.3, animalRepelRadius: 120 }
  },
  tent:     { name: '텐트', cost: { wood: 10, leather: 3 }, warmth: 5, desc: '수면 회복 + HP회복', icon: '⛺',
    effects: { healthRegen: 3, hungerSlowdown: 0.5 }
  },
  storage:  { name: '창고', cost: { wood: 15, stone: 10 }, storageBonus: 50, desc: '보관량 +50, 자동정리', icon: '📦',
    effects: { autoSort: true }
  },
  workshop: { name: '작업대', cost: { wood: 20, stone: 15 }, desc: '도구 제작 가능', icon: '🔨' },
  wall:     { name: '방벽', cost: { stone: 8 }, desc: '동물 진입 차단', icon: '🧱' },
};

// ── Crafting Recipes ──
const RECIPES = {
  stone_axe:  { name: '돌도끼', cost: { wood: 3, stone: 2 }, effect: 'woodBonus', value: 1, desc: '나무 채집 +1', icon: '🪓' },
  stone_pick: { name: '곡괭이', cost: { wood: 3, stone: 3 }, effect: 'stoneBonus', value: 1, desc: '돌 채집 +1', icon: '⛏️' },
  spear:      { name: '창', cost: { wood: 5, stone: 3 }, effect: 'damage', value: 1, desc: '공격력 +1', icon: '🔱' },
  fur_coat:   { name: '모피 코트', cost: { leather: 8 }, effect: 'warmthResist', value: 0.3, desc: '체온 감소 -30%', icon: '🧥' },
  boots:      { name: '가죽 장화', cost: { leather: 5 }, effect: 'speed', value: 30, desc: '이동속도 +30', icon: '👢' },
};

// ── Act Story Text ──
const ACT_STORY = {
  start: "❄️ 영하 60도의 설원. 살아남아야 한다.",
  act2:  "🐺 짐승들이 움직이기 시작했다. 더 강해져야 한다.",
  act3:  "💀 괴물이 나타났다. 도망칠 곳은 없다.",
  act4:  "🌨️ 눈보라가 거세진다. 희망은 아직 있다.",
  act5:  "👁️ 최강의 존재가 눈을 뜬다. 마지막 결전.",
  win:   "🏔️ 살아남았다. 전설이 되었다."
};

// ── Region Names ──
const REGION_NAMES = {
  safe:    { name: '🏕️ 생존 캠프', color: '#44FF44' },
  normal:  { name: '🌲 침엽수림', color: '#FFDD44' },
  danger:  { name: '🏔️ 빙하 지대', color: '#FF8844' },
  extreme: { name: '💀 죽음의 설원', color: '#FF4444' }
};

// ── NPC Speech Bubbles ──
const NPC_BUBBLES = {
  merchant:  '💬 오늘 운이 좋네요! 좋은 물건 있어요.',
  hunter:    '💬 사냥감이 많군... 같이 가자!',
  gatherer:  '💬 재료만 있으면 뭐든 만들어 드려요.',
  warrior:   '💬 한파가 3분마다 온다네... 조심하게.'
};

// ── NPC Definitions ──
const NPC_DEFS = [
  { type: 'hunter',    name: '사냥꾼', cost: { meat: 12 },  desc: '자동 사냥' },
  { type: 'gatherer',  name: '채집꾼', cost: { meat: 8 },  desc: '자동 채집' },
  { type: 'merchant',  name: '상인',   cost: { meat: 30 }, desc: '고기→금화' },
  { type: 'warrior',   name: '전사',   cost: { meat: 50 }, desc: '강력 전투' },
];

// ── Resource node types ──
const RESOURCE_NODES = {
  tree:  { name: '나무', resource: 'wood',  hp: 3, yield: 2, size: 16, regen: 30 },
  rock:  { name: '바위', resource: 'stone', hp: 4, yield: 2, size: 14, regen: 45 },
};

// ── Quests (20+ redesigned with conditions) ──
const QUESTS = [
  // Act 1: 초반 생존 (0-5분)
  { id: 'q1', name: '첫 사냥', desc: '토끼 5마리 처치', check: s => (s.kills.rabbit||0) >= 5, reward: { meat: 5 } },
  { id: 'q2', name: '고기 납품', desc: '고기 5개 모으기', check: s => (s.meatCollected||0) >= 5, reward: { gold: 30 }, rewardEffect: { tempBonus: 5 } },
  { id: 'q3', name: '나무꾼', desc: '나무 10개 채집', check: s => s.woodGathered >= 10, reward: { stone: 5, meat: 3 } },
  { id: 'q4', name: '화덕 건설', desc: '화덕 1개 건설', check: s => (s.built.campfire||0) >= 1, reward: { leather: 3 } },
  { id: 'q5', name: '체온 유지', desc: '화덕 건설 후 30초 체온 유지', check: (s, scene) => (s.built.campfire||0) >= 1 && scene && scene._warmthNearFireTime >= 30, reward: { gold: 50, meat: 5 } },

  // Act 2: 중반 성장 (5-10분)
  { id: 'q6', name: '도구 제작', desc: '도구 1개 제작', check: s => s.crafted >= 1, reward: { meat: 8 } },
  { id: 'q7', name: '펭귄 사냥꾼', desc: '펭귄 8마리 처치', check: s => (s.kills.penguin||0) >= 8, reward: { leather: 3, gold: 20 } },
  { id: 'q8', name: '사슴 사냥꾼', desc: '사슴 10마리 처치', check: s => (s.kills.deer||0) >= 10, reward: { leather: 5, meat: 8 } },
  { id: 'q9', name: '대량 납품', desc: '고기 15개 모으기', check: s => (s.meatCollected||0) >= 15, reward: { gold: 80 }, rewardEffect: { maxHPBonus: 15 } },
  { id: 'q10', name: '5분 생존', desc: '5분간 생존하기', check: (s, scene) => scene && scene.gameElapsed >= 300, reward: { meat: 10, wood: 10 } },

  // Act 3: 늑대 시대 (10-15분)
  { id: 'q11', name: '늑대 사냥', desc: '늑대 3마리 처치', check: s => (s.kills.wolf||0) >= 3, reward: { leather: 5, gold: 40 } },
  { id: 'q12', name: 'NPC 고용', desc: 'NPC 1명 고용', check: s => s.npcsHired >= 1, reward: { wood: 10, stone: 10 } },
  { id: 'q13', name: '텐트 건설', desc: '텐트 건설하기', check: s => (s.built.tent||0) >= 1, reward: { meat: 12, gold: 30 } },
  { id: 'q14', name: '10분 생존', desc: '10분간 생존하기', check: (s, scene) => scene && scene.gameElapsed >= 600, reward: { gold: 100, leather: 5 }, rewardEffect: { maxHPBonus: 20 } },
  { id: 'q15', name: '연속 처치', desc: '10킬 콤보 달성', check: s => (s.maxCombo||0) >= 10, reward: { gold: 60, meat: 8 } },

  // Act 4: 곰 시대 (15-20분)
  { id: 'q16', name: '곰 사냥', desc: '곰 3마리 처치 후 고기 8개 납품', check: s => (s.kills.bear||0) >= 3 && (s.meatCollected||0) >= 25, reward: { leather: 10, gold: 100 } },
  { id: 'q17', name: '무기 장인', desc: '장비 합성 2회', check: s => s.crafted >= 2, reward: { gold: 80, meat: 10 } },
  { id: 'q18', name: '15분 생존', desc: '15분간 생존하기', check: (s, scene) => scene && scene.gameElapsed >= 900, reward: { gold: 150, leather: 8 }, rewardEffect: { maxHPBonus: 30 } },
  { id: 'q19', name: '늑대 학살', desc: '늑대 10마리 처치', check: s => (s.kills.wolf||0) >= 10, reward: { leather: 8, gold: 60 } },

  // Act 5: 보스 레이드 (20분+)
  { id: 'q20', name: '20분 생존', desc: '20분간 생존하기', check: (s, scene) => scene && scene.gameElapsed >= 1200, reward: { gold: 200, meat: 20 }, rewardEffect: { maxHPBonus: 40 } },
  { id: 'q21', name: '곰 학살', desc: '곰 10마리 처치', check: s => (s.kills.bear||0) >= 10, reward: { leather: 15, gold: 120 } },
  { id: 'q22', name: '보스 처치', desc: '보스 1마리 처치', check: s => (s.bossKills||0) >= 1, reward: { gold: 300, leather: 20 }, rewardEffect: { maxHPBonus: 50 } },
  { id: 'q23', name: '대량 학살', desc: '총 100마리 처치', check: s => { let t=0; for(const k in s.kills) t+=s.kills[k]; return t>=100; }, reward: { gold: 200, meat: 15 } },
  { id: 'q24', name: '30분 생존', desc: '30분간 생존하기', check: (s, scene) => scene && scene.gameElapsed >= 1800, reward: { gold: 500 }, rewardEffect: { maxHPBonus: 60 } },
];

// ═══ 🎬 TITLE SCENE ═══
