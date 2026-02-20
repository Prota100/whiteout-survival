// Whiteout Survival - Final Polished Version
// Enhanced visuals, balanced gameplay, mobile UX

const WORLD_W = 2400;
const WORLD_H = 2400;

// ── Animal Definitions (BALANCED) ──
const ANIMALS = {
  rabbit:  { hp: 1,  speed: 25,  damage: 0, drops: { meat: 1 }, size: 12, behavior: 'flee', name: '토끼', aggroRange: 60, fleeRange: 40, fleeDistance: 60 },
  deer:    { hp: 4,  speed: 35,  damage: 0, drops: { meat: 2, leather: 1 }, size: 14, behavior: 'flee', name: '사슴', aggroRange: 120, fleeRange: 90, fleeDistance: 100 },
  penguin: { hp: 3,  speed: 20,  damage: 0, drops: { meat: 1 }, size: 12, behavior: 'wander', name: '펭귄', aggroRange: 0, fleeRange: 0, fleeDistance: 0 },
  seal:    { hp: 5,  speed: 15,  damage: 0, drops: { meat: 2, leather: 2 }, size: 16, behavior: 'wander', name: '물개', aggroRange: 0, fleeRange: 0, fleeDistance: 0 },
  wolf:    { hp: 6,  speed: 70,  damage: 1, drops: { meat: 3, leather: 1 }, size: 14, behavior: 'chase', name: '늑대', aggroRange: 160, fleeRange: 0, fleeDistance: 0 },
  bear:    { hp: 15, speed: 50,  damage: 3, drops: { meat: 6, leather: 3 }, size: 20, behavior: 'chase', name: '곰', aggroRange: 140, fleeRange: 0, fleeDistance: 0 },
};

// ── Building Definitions ──
const BUILDINGS = {
  campfire: { name: '화덕', cost: { wood: 4 }, warmth: 3, desc: '회복+골드+버프 존', icon: '🔥', campfireLevel: 1 },
  tent:     { name: '텐트', cost: { wood: 10, leather: 3 }, warmth: 5, desc: '체온 회복 +5/s', icon: '⛺' },
  storage:  { name: '창고', cost: { wood: 15, stone: 10 }, storageBonus: 50, desc: '보관량 +50', icon: '📦' },
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

// ── NPC Definitions ──
const NPC_DEFS = [
  { type: 'hunter',    name: '사냥꾼', cost: { meat: 8 },  desc: '자동 사냥' },
  { type: 'gatherer',  name: '채집꾼', cost: { meat: 5 },  desc: '자동 채집' },
  { type: 'merchant',  name: '상인',   cost: { meat: 20 }, desc: '고기→금화' },
  { type: 'warrior',   name: '전사',   cost: { meat: 35 }, desc: '강력 전투' },
];

// ── Resource node types ──
const RESOURCE_NODES = {
  tree:  { name: '나무', resource: 'wood',  hp: 3, yield: 2, size: 16, regen: 30 },
  rock:  { name: '바위', resource: 'stone', hp: 4, yield: 2, size: 14, regen: 45 },
};

// ── Quests ──
const QUESTS = [
  { id: 'q1', name: '첫 사냥', desc: '토끼 3마리 사냥', check: s => s.kills.rabbit >= 3, reward: { meat: 3 } },
  { id: 'q2', name: '나무꾼', desc: '나무 10개 채집', check: s => s.woodGathered >= 10, reward: { stone: 5 } },
  { id: 'q3', name: '화덕 건설', desc: '화덕 1개 건설', check: s => s.built.campfire >= 1, reward: { leather: 3 } },
  { id: 'q4', name: '도구 제작', desc: '도구 1개 제작', check: s => s.crafted >= 1, reward: { meat: 10 } },
  { id: 'q5', name: '용맹한 사냥꾼', desc: '늑대 2마리 사냥', check: s => s.kills.wolf >= 2, reward: { leather: 5 } },
  { id: 'q6', name: '텐트 건설', desc: '텐트 건설하기', check: s => s.built.tent >= 1, reward: { meat: 15 } },
  { id: 'q7', name: '곰 사냥', desc: '곰 1마리 사냥', check: s => s.kills.bear >= 1, reward: { leather: 8, meat: 10 } },
  { id: 'q8', name: 'NPC 고용', desc: 'NPC 1명 고용', check: s => s.npcsHired >= 1, reward: { wood: 10, stone: 10 } },
];

// ── Pixel Art Drawing Helpers ──
function drawPixelRect(g, x, y, w, h, color, alpha) {
  g.fillStyle(color, alpha || 1);
  g.fillRect(x, y, w, h);
}

function drawPixelCharacter(g, w, h, bodyColor, headColor, details) {
  // Clear area
  const cx = w/2, cy = h/2;
  // Body
  g.fillStyle(bodyColor, 1);
  g.fillRect(cx-5, cy-2, 10, 10);
  // Head
  g.fillStyle(headColor, 1);
  g.fillRect(cx-4, cy-8, 8, 7);
  // Eyes
  g.fillStyle(0x000000, 1);
  g.fillRect(cx-3, cy-6, 2, 2);
  g.fillRect(cx+1, cy-6, 2, 2);
  if (details) details(g, cx, cy);
}

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  
  create() {
    // ── Player: Parka character with red hat ──
    this.createPlayerTexture();
    this.createPlayerAttackTexture();
    
    // ── Animals ──
    this.createRabbitTexture();
    this.createDeerTexture();
    this.createPenguinTexture();
    this.createSealTexture();
    this.createWolfTexture();
    this.createBearTexture();
    
    // ── NPCs ──
    this.createNPCTextures();
    
    // ── Resources & Environment ──
    this.createTreeTexture();
    this.createRockTexture();
    
    // ── Drops ──
    this.createDropTextures();
    
    // ── Particles ──
    this.createParticleTextures();
    
    this.scene.start('Game');
  }

  createPlayerTexture() {
    const g = this.add.graphics();
    const s = 32;
    // Red hat/hood
    g.fillStyle(0xCC2222, 1);
    g.fillRect(10, 2, 12, 6);
    g.fillRect(9, 4, 14, 3);
    // Face (skin)
    g.fillStyle(0xFFDDBB, 1);
    g.fillRect(11, 8, 10, 7);
    // Eyes
    g.fillStyle(0x222222, 1);
    g.fillRect(13, 10, 2, 2);
    g.fillRect(17, 10, 2, 2);
    // Mouth
    g.fillStyle(0xDD8866, 1);
    g.fillRect(14, 13, 4, 1);
    // Parka body (blue/teal)
    g.fillStyle(0x3388AA, 1);
    g.fillRect(9, 15, 14, 10);
    // Parka fur trim
    g.fillStyle(0xEEDDCC, 1);
    g.fillRect(9, 15, 14, 2);
    g.fillRect(9, 15, 2, 10);
    g.fillRect(21, 15, 2, 10);
    // Arms
    g.fillStyle(0x3388AA, 1);
    g.fillRect(6, 16, 3, 7);
    g.fillRect(23, 16, 3, 7);
    // Gloves
    g.fillStyle(0x884422, 1);
    g.fillRect(6, 23, 3, 2);
    g.fillRect(23, 23, 3, 2);
    // Pants
    g.fillStyle(0x555566, 1);
    g.fillRect(11, 25, 4, 5);
    g.fillRect(17, 25, 4, 5);
    // Boots
    g.fillStyle(0x664422, 1);
    g.fillRect(10, 29, 5, 3);
    g.fillRect(17, 29, 5, 3);
    
    g.generateTexture('player', s, s);
    g.destroy();
  }

  createPlayerAttackTexture() {
    const g = this.add.graphics();
    const s = 36;
    // Same as player but slightly bigger and with weapon swing
    g.fillStyle(0xCC2222, 1);
    g.fillRect(12, 2, 12, 6);
    g.fillRect(11, 4, 14, 3);
    g.fillStyle(0xFFDDBB, 1);
    g.fillRect(13, 8, 10, 7);
    g.fillStyle(0x222222, 1);
    g.fillRect(15, 10, 2, 2);
    g.fillRect(19, 10, 2, 2);
    g.fillStyle(0xDD8866, 1);
    g.fillRect(16, 13, 4, 1);
    g.fillStyle(0x3388AA, 1);
    g.fillRect(11, 15, 14, 10);
    g.fillStyle(0xEEDDCC, 1);
    g.fillRect(11, 15, 14, 2);
    // Attacking arm extended
    g.fillStyle(0x3388AA, 1);
    g.fillRect(25, 14, 8, 3);
    g.fillRect(8, 16, 3, 7);
    // Weapon
    g.fillStyle(0xAAAAAA, 1);
    g.fillRect(30, 10, 2, 8);
    g.fillStyle(0x884422, 1);
    g.fillRect(29, 17, 4, 2);
    // Pants & boots
    g.fillStyle(0x555566, 1);
    g.fillRect(13, 25, 4, 5);
    g.fillRect(19, 25, 4, 5);
    g.fillStyle(0x664422, 1);
    g.fillRect(12, 29, 5, 3);
    g.fillRect(19, 29, 5, 3);
    
    g.generateTexture('player_attack', s, s);
    g.destroy();
  }

  createRabbitTexture() {
    const g = this.add.graphics();
    // 24x24 rabbit
    // Body (white-ish)
    g.fillStyle(0xEEDDCC, 1);
    g.fillRoundedRect(6, 10, 12, 10, 4);
    // Head
    g.fillStyle(0xEEDDCC, 1);
    g.fillRoundedRect(8, 5, 8, 7, 3);
    // Long ears
    g.fillStyle(0xDDCCBB, 1);
    g.fillRect(9, 0, 2, 7);
    g.fillRect(13, 0, 2, 7);
    // Inner ear (pink)
    g.fillStyle(0xFFAAAA, 1);
    g.fillRect(10, 1, 1, 4);
    g.fillRect(13, 1, 1, 4);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(10, 7, 1, 1);
    g.fillRect(13, 7, 1, 1);
    // Nose
    g.fillStyle(0xFFAAAA, 1);
    g.fillRect(11, 9, 2, 1);
    // Tail
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(6, 16, 2);
    // Feet
    g.fillStyle(0xDDCCBB, 1);
    g.fillRect(7, 19, 3, 2);
    g.fillRect(14, 19, 3, 2);
    
    g.generateTexture('rabbit', 24, 24);
    g.destroy();
  }

  createDeerTexture() {
    const g = this.add.graphics();
    // Brown deer 28x28
    g.fillStyle(0xC4A46C, 1);
    g.fillRoundedRect(7, 12, 14, 10, 3);
    g.fillStyle(0xC4A46C, 1);
    g.fillRoundedRect(9, 5, 10, 8, 3);
    // Antlers
    g.fillStyle(0x8B6914, 1);
    g.fillRect(10, 1, 2, 5);
    g.fillRect(16, 1, 2, 5);
    g.fillRect(8, 2, 2, 2);
    g.fillRect(18, 2, 2, 2);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(11, 7, 2, 2);
    g.fillRect(15, 7, 2, 2);
    // Nose
    g.fillStyle(0x333333, 1);
    g.fillRect(13, 10, 2, 1);
    // White belly
    g.fillStyle(0xE8D8B8, 1);
    g.fillRect(10, 18, 8, 3);
    // Legs
    g.fillStyle(0xA08050, 1);
    g.fillRect(9, 21, 2, 5);
    g.fillRect(17, 21, 2, 5);
    // Hooves
    g.fillStyle(0x444444, 1);
    g.fillRect(9, 25, 2, 2);
    g.fillRect(17, 25, 2, 2);
    
    g.generateTexture('deer', 28, 28);
    g.destroy();
  }

  createPenguinTexture() {
    const g = this.add.graphics();
    // Black and white penguin 24x24
    g.fillStyle(0x222222, 1);
    g.fillRoundedRect(7, 4, 10, 14, 4);
    // White belly
    g.fillStyle(0xFFFFFF, 1);
    g.fillRoundedRect(9, 7, 6, 9, 3);
    // Eyes
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(9, 5, 2, 2);
    g.fillRect(13, 5, 2, 2);
    g.fillStyle(0x000000, 1);
    g.fillRect(10, 5, 1, 1);
    g.fillRect(13, 5, 1, 1);
    // Beak
    g.fillStyle(0xFF8800, 1);
    g.fillRect(11, 7, 2, 2);
    // Feet
    g.fillStyle(0xFF8800, 1);
    g.fillRect(8, 18, 3, 2);
    g.fillRect(13, 18, 3, 2);
    // Wings
    g.fillStyle(0x333333, 1);
    g.fillRect(5, 8, 2, 6);
    g.fillRect(17, 8, 2, 6);
    
    g.generateTexture('penguin', 24, 24);
    g.destroy();
  }

  createSealTexture() {
    const g = this.add.graphics();
    // Gray seal 28x24
    g.fillStyle(0x7B8D9E, 1);
    g.fillEllipse(14, 12, 24, 14);
    // Head
    g.fillStyle(0x8B9DAE, 1);
    g.fillCircle(6, 10, 5);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(4, 9, 1);
    // Nose
    g.fillStyle(0x333333, 1);
    g.fillCircle(2, 11, 1);
    // Whiskers
    g.lineStyle(1, 0x555555, 0.5);
    g.lineBetween(3, 11, 0, 10);
    g.lineBetween(3, 12, 0, 13);
    // Flippers
    g.fillStyle(0x6B7D8E, 1);
    g.fillEllipse(22, 14, 6, 4);
    // Belly highlight
    g.fillStyle(0x9BAABB, 0.5);
    g.fillEllipse(14, 14, 16, 6);
    
    g.generateTexture('seal', 28, 24);
    g.destroy();
  }

  createWolfTexture() {
    const g = this.add.graphics();
    // Gray wolf 28x28
    // Body
    g.fillStyle(0x666677, 1);
    g.fillRoundedRect(6, 10, 16, 10, 3);
    // Head
    g.fillStyle(0x777788, 1);
    g.fillRoundedRect(3, 4, 10, 8, 3);
    // Snout
    g.fillStyle(0x888899, 1);
    g.fillRect(1, 7, 4, 4);
    // Ears (pointed)
    g.fillStyle(0x555566, 1);
    g.fillTriangle(4, 0, 3, 5, 7, 5);
    g.fillTriangle(11, 0, 9, 5, 13, 5);
    // Eyes (fierce red)
    g.fillStyle(0xFF4444, 1);
    g.fillRect(5, 6, 2, 2);
    g.fillRect(9, 6, 2, 2);
    // Teeth
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(2, 10, 1, 2);
    g.fillRect(4, 10, 1, 2);
    // Nose
    g.fillStyle(0x222222, 1);
    g.fillRect(1, 8, 2, 1);
    // Tail
    g.fillStyle(0x555566, 1);
    g.fillRect(22, 8, 4, 3);
    g.fillRect(25, 6, 2, 3);
    // Legs
    g.fillStyle(0x555566, 1);
    g.fillRect(8, 19, 2, 5);
    g.fillRect(12, 19, 2, 5);
    g.fillRect(18, 19, 2, 5);
    // Paws
    g.fillStyle(0x444455, 1);
    g.fillRect(7, 23, 3, 2);
    g.fillRect(11, 23, 3, 2);
    g.fillRect(17, 23, 3, 2);
    // Dark back stripe
    g.fillStyle(0x555566, 0.7);
    g.fillRect(8, 10, 12, 2);
    
    g.generateTexture('wolf', 28, 28);
    g.destroy();
  }

  createBearTexture() {
    const g = this.add.graphics();
    // Polar bear 36x36 (big, white, round)
    // Body (big round)
    g.fillStyle(0xF0EEE8, 1);
    g.fillRoundedRect(6, 12, 24, 16, 8);
    // Head (round)
    g.fillStyle(0xF5F3EE, 1);
    g.fillCircle(18, 10, 9);
    // Ears (round)
    g.fillStyle(0xE0DDD5, 1);
    g.fillCircle(11, 3, 3);
    g.fillCircle(25, 3, 3);
    g.fillStyle(0xDDBBAA, 1);
    g.fillCircle(11, 3, 1.5);
    g.fillCircle(25, 3, 1.5);
    // Eyes (small, dark)
    g.fillStyle(0x222222, 1);
    g.fillCircle(14, 9, 1.5);
    g.fillCircle(22, 9, 1.5);
    // Nose
    g.fillStyle(0x333333, 1);
    g.fillCircle(18, 13, 2);
    // Mouth
    g.lineStyle(1, 0x666666, 0.5);
    g.lineBetween(18, 14, 16, 16);
    g.lineBetween(18, 14, 20, 16);
    // Legs (thick)
    g.fillStyle(0xE8E5DD, 1);
    g.fillRoundedRect(8, 26, 6, 8, 3);
    g.fillRoundedRect(22, 26, 6, 8, 3);
    // Paws
    g.fillStyle(0xDDDAD2, 1);
    g.fillRoundedRect(7, 31, 8, 4, 2);
    g.fillRoundedRect(21, 31, 8, 4, 2);
    // Claws
    g.fillStyle(0x888888, 1);
    for (let i = 0; i < 3; i++) {
      g.fillRect(8 + i*2, 34, 1, 2);
      g.fillRect(22 + i*2, 34, 1, 2);
    }
    
    g.generateTexture('bear', 36, 36);
    g.destroy();
  }

  createNPCTextures() {
    // Hunter: brown clothes, bow
    let g = this.add.graphics();
    g.fillStyle(0x8B6914, 1); g.fillRect(10, 15, 12, 10); // brown body
    g.fillStyle(0xFFDDBB, 1); g.fillRect(12, 6, 8, 8); // face
    g.fillStyle(0x6B4914, 1); g.fillRect(11, 3, 10, 5); // brown hat
    g.fillStyle(0x222222, 1); g.fillRect(14, 9, 1, 1); g.fillRect(17, 9, 1, 1); // eyes
    // Bow
    g.lineStyle(2, 0x884422, 1);
    g.beginPath(); g.arc(25, 15, 8, -1.2, 1.2); g.strokePath();
    g.lineStyle(1, 0xCCCCCC, 1);
    g.lineBetween(25, 7, 25, 23);
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_hunter', 32, 32); g.destroy();

    // Merchant: green hat, apron
    g = this.add.graphics();
    g.fillStyle(0xEEDDCC, 1); g.fillRect(10, 15, 12, 10); // apron body
    g.fillStyle(0xFFDDBB, 1); g.fillRect(12, 6, 8, 8); // face
    g.fillStyle(0x44AA44, 1); g.fillRect(11, 2, 10, 5); // green hat
    g.fillStyle(0xFFFFFF, 1); g.fillRect(10, 15, 12, 2); // apron top
    g.fillStyle(0x222222, 1); g.fillRect(14, 9, 1, 1); g.fillRect(17, 9, 1, 1); // eyes
    g.fillStyle(0xDD8866, 1); g.fillRect(14, 11, 4, 1); // smile
    // Gold coin in hand
    g.fillStyle(0xFFDD00, 1); g.fillCircle(25, 20, 4);
    g.fillStyle(0xFFAA00, 1); g.fillCircle(25, 20, 2);
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_merchant', 32, 32); g.destroy();

    // Gatherer: green outfit
    g = this.add.graphics();
    g.fillStyle(0x66AA44, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0xFFDDBB, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x558833, 1); g.fillRect(11, 3, 10, 5);
    g.fillStyle(0x222222, 1); g.fillRect(14, 9, 1, 1); g.fillRect(17, 9, 1, 1);
    g.fillStyle(0x884422, 1); g.fillRect(5, 12, 2, 14); // stick
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_gatherer', 32, 32); g.destroy();

    // Warrior: blue armor, sword+shield
    g = this.add.graphics();
    g.fillStyle(0x3366AA, 1); g.fillRect(10, 15, 12, 10); // blue armor
    g.fillStyle(0x4477BB, 1); g.fillRect(10, 15, 12, 3); // shoulder guard
    g.fillStyle(0xFFDDBB, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x5588CC, 1); g.fillRect(11, 3, 10, 4); // helmet
    g.fillStyle(0x222222, 1); g.fillRect(14, 9, 1, 1); g.fillRect(17, 9, 1, 1);
    // Sword
    g.fillStyle(0xCCCCCC, 1); g.fillRect(24, 8, 2, 14);
    g.fillStyle(0x884422, 1); g.fillRect(23, 21, 4, 3);
    // Shield
    g.fillStyle(0x3355AA, 1); g.fillRoundedRect(2, 14, 8, 10, 2);
    g.fillStyle(0xFFDD00, 1); g.fillCircle(6, 19, 2);
    g.fillStyle(0x555566, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_warrior', 32, 32); g.destroy();
  }

  createTreeTexture() {
    const g = this.add.graphics();
    // Fir tree 48x64
    // Trunk
    g.fillStyle(0x5D4037, 1);
    g.fillRect(20, 44, 8, 20);
    // Snow on trunk
    g.fillStyle(0xEEEEFF, 0.4);
    g.fillRect(20, 44, 4, 6);
    // Tree layers (dark green fir)
    g.fillStyle(0x1B5E20, 1);
    g.fillTriangle(24, 4, 4, 34, 44, 34);
    g.fillStyle(0x2E7D32, 1);
    g.fillTriangle(24, 14, 8, 40, 40, 40);
    g.fillStyle(0x388E3C, 1);
    g.fillTriangle(24, 24, 10, 48, 38, 48);
    // Snow on branches
    g.fillStyle(0xFFFFFF, 0.6);
    g.fillTriangle(24, 4, 14, 18, 34, 18);
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRect(10, 38, 28, 3);
    
    g.generateTexture('tree_node', 48, 64);
    g.destroy();
  }

  createRockTexture() {
    const g = this.add.graphics();
    // Rock 28x24
    g.fillStyle(0x666666, 1);
    g.fillRoundedRect(2, 6, 24, 16, 6);
    g.fillStyle(0x888888, 1);
    g.fillRoundedRect(4, 4, 14, 10, 5);
    g.fillStyle(0x999999, 0.6);
    g.fillRoundedRect(6, 6, 8, 6, 3);
    // Snow cap
    g.fillStyle(0xFFFFFF, 0.5);
    g.fillRoundedRect(4, 3, 16, 4, 3);
    // Cracks
    g.lineStyle(1, 0x444444, 0.4);
    g.lineBetween(10, 8, 14, 16);
    g.lineBetween(18, 6, 20, 14);
    
    g.generateTexture('rock_node', 28, 24);
    g.destroy();
  }

  createDropTextures() {
    // Meat 🥩 steak shape
    let g = this.add.graphics();
    g.fillStyle(0xCC4422, 1);
    g.fillRoundedRect(3, 3, 18, 14, 5);
    g.fillStyle(0xEE6644, 1);
    g.fillRoundedRect(5, 5, 14, 8, 4);
    g.fillStyle(0xFFAA88, 0.6);
    g.fillRoundedRect(7, 6, 4, 4, 2);
    // Bone
    g.fillStyle(0xEEDDCC, 1);
    g.fillRect(1, 8, 4, 3);
    g.fillCircle(2, 8, 2);
    g.fillCircle(2, 11, 2);
    g.generateTexture('meat_drop', 24, 20);
    g.destroy();

    // Wood
    g = this.add.graphics();
    g.fillStyle(0x8B6914, 1);
    g.fillRect(4, 2, 6, 18);
    g.fillStyle(0xA07B28, 1);
    g.fillRect(5, 3, 4, 16);
    g.fillStyle(0x6B4914, 0.5);
    g.lineBetween(7, 4, 7, 18);
    // Bark rings
    g.fillStyle(0x7B5914, 1);
    g.fillRect(4, 2, 6, 2);
    g.fillRect(4, 18, 6, 2);
    g.generateTexture('wood_drop', 14, 22);
    g.destroy();

    // Stone
    g = this.add.graphics();
    g.fillStyle(0x888888, 1);
    g.fillRoundedRect(2, 4, 14, 10, 4);
    g.fillStyle(0xAAAAAA, 0.6);
    g.fillRoundedRect(4, 5, 6, 5, 3);
    g.generateTexture('stone_drop', 18, 18);
    g.destroy();

    // Leather
    g = this.add.graphics();
    g.fillStyle(0xC4A46C, 1);
    g.fillRoundedRect(2, 2, 14, 14, 3);
    g.fillStyle(0xB09458, 0.6);
    g.fillRect(4, 4, 10, 10);
    g.lineStyle(1, 0x8B6914, 0.4);
    g.lineBetween(4, 8, 14, 8);
    g.generateTexture('leather_drop', 18, 18);
    g.destroy();
  }

  createParticleTextures() {
    // Snowflake (bigger, prettier)
    let g = this.add.graphics();
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillCircle(4, 4, 3);
    g.fillStyle(0xFFFFFF, 0.5);
    g.fillCircle(4, 4, 4);
    g.generateTexture('snowflake', 8, 8);
    g.destroy();

    // Hit particle
    g = this.add.graphics();
    g.fillStyle(0xFF4444, 1);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0xFF8844, 0.7);
    g.fillCircle(4, 4, 2);
    g.generateTexture('hit_particle', 8, 8);
    g.destroy();

    // Gold particle
    g = this.add.graphics();
    g.fillStyle(0xFFDD00, 1);
    g.fillCircle(4, 4, 3);
    g.fillStyle(0xFFFF88, 0.7);
    g.fillCircle(3, 3, 1.5);
    g.generateTexture('gold_particle', 8, 8);
    g.destroy();

    // Slash effect
    g = this.add.graphics();
    g.lineStyle(3, 0xFFFFFF, 0.9);
    g.beginPath();
    g.arc(16, 16, 12, -0.8, 0.8);
    g.strokePath();
    g.generateTexture('slash_fx', 32, 32);
    g.destroy();
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    // ── State ──
    this.res = { meat: 0, wood: 0, stone: 0, leather: 0, gold: 0 };
    this.playerHP = 20; this.playerMaxHP = 20;
    this.playerDamage = 1; this.playerSpeed = 160;
    this.warmthResist = 1;
    this.woodBonus = 0; this.stoneBonus = 0;
    this.temperature = 100; this.maxTemp = 100;
    this.hunger = 100; this.maxHunger = 100;
    this.attackCooldown = 0;
    this.moveDir = { x: 0, y: 0 };
    this.npcsOwned = [];
    this.placedBuildings = [];
    this.gameOver = false;
    this.buildMode = null;
    this.storageCapacity = 50;
    this.isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || ('ontouchstart' in window);
    this.facingRight = true;

    // Safe area insets (cached, updated on resize)
    this.safeBottom = getSafeBottom();
    this.safeTop = getSafeTop();
    this.uiBottomMargin = Math.max(this.safeBottom + 8, 20); // minimum 20px from bottom edge
    this.uiTopMargin = Math.max(this.safeTop + 4, 8);

    this.stats = { kills: {}, woodGathered: 0, built: {}, crafted: 0, npcsHired: 0 };
    this.questIndex = 0;
    this.questCompleted = [];

    // ── World ──
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    // ── Background: Snow terrain ──
    this.drawBackground();

    // ── Player ──
    this.player = this.physics.add.sprite(WORLD_W/2, WORLD_H/2, 'player');
    this.player.setCollideWorldBounds(true).setDepth(10).setDamping(true).setDrag(0.9);
    this.player.body.setSize(16, 20).setOffset(8, 10);

    // ── Groups ──
    this.animals = this.physics.add.group();
    this.drops = this.physics.add.group();
    this.npcSprites = this.physics.add.group();
    this.resourceNodes = [];
    this.buildingSprites = [];

    // ── Camera ──
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    // ── Snow Particles (bigger, slower, atmospheric) ──
    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: WORLD_W }, y: -10,
      lifespan: 12000, speedY: { min: 10, max: 30 }, speedX: { min: -20, max: 10 },
      scale: { min: 0.3, max: 1.5 }, alpha: { start: 0.8, end: 0 },
      frequency: 60, quantity: 1, rotate: { min: 0, max: 360 },
    }).setDepth(50);

    // Foreground snow (closer, bigger)
    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: WORLD_W }, y: -10,
      lifespan: 10000, speedY: { min: 20, max: 50 }, speedX: { min: -10, max: 20 },
      scale: { min: 1, max: 2.5 }, alpha: { start: 0.3, end: 0 },
      frequency: 200, quantity: 1,
    }).setDepth(55);

    // ── Spawn resource nodes ──
    this.spawnResourceNodes();

    // ── Spawn initial animals ──
    this.spawnWave();
    this.animalSpawnTimer = 0;

    // ── Input ──
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-E', () => this.interactNearest());
    this.input.keyboard.on('keydown-B', () => this.toggleBuildMenu());
    this.input.keyboard.on('keydown-C', () => this.toggleCraftMenu());
    this.input.keyboard.on('keydown-SPACE', () => this.performAttackNearest());

    this.input.on('pointerdown', (p) => {
      if (this.gameOver) return;
      if (this.isUIArea(p)) return;
      if (this.isMobile && this.isJoystickArea(p)) return;
      if (this.buildMode) { this.placeBuilding(p); return; }
      this.performAttack(p);
    });

    if (this.isMobile) this.createJoystick();

    // ── UI ──
    this.createUI();

    // ── Overlaps ──
    this.physics.add.overlap(this.player, this.drops, (_, d) => this.collectDrop(d));
  }

  drawBackground() {
    const bg = this.add.graphics();
    // Base snow color
    bg.fillStyle(0xE8ECF2, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);
    
    // Snow texture pattern - subtle drifts
    for (let i = 0; i < 120; i++) {
      const shade = Phaser.Math.Between(0, 2);
      const colors = [0xDDE2EA, 0xD5DAE2, 0xE0E4EC];
      bg.fillStyle(colors[shade], 0.3);
      bg.fillEllipse(
        Phaser.Math.Between(0, WORLD_W),
        Phaser.Math.Between(0, WORLD_H),
        Phaser.Math.Between(40, 200),
        Phaser.Math.Between(20, 60)
      );
    }
    // Snow mounds (white highlights)
    for (let i = 0; i < 60; i++) {
      bg.fillStyle(0xF5F7FA, 0.4);
      bg.fillEllipse(
        Phaser.Math.Between(0, WORLD_W),
        Phaser.Math.Between(0, WORLD_H),
        Phaser.Math.Between(30, 80),
        Phaser.Math.Between(10, 30)
      );
    }
    // Subtle ice patches
    for (let i = 0; i < 20; i++) {
      bg.fillStyle(0xCCDDEE, 0.2);
      bg.fillEllipse(
        Phaser.Math.Between(0, WORLD_W),
        Phaser.Math.Between(0, WORLD_H),
        Phaser.Math.Between(60, 150),
        Phaser.Math.Between(40, 100)
      );
    }
  }

  // ── Resource Nodes ──
  spawnResourceNodes() {
    for (let i = 0; i < 40; i++) {
      this.createResourceNode('tree',
        Phaser.Math.Between(80, WORLD_W - 80),
        Phaser.Math.Between(80, WORLD_H - 80)
      );
    }
    for (let i = 0; i < 25; i++) {
      this.createResourceNode('rock',
        Phaser.Math.Between(80, WORLD_W - 80),
        Phaser.Math.Between(80, WORLD_H - 80)
      );
    }
  }

  createResourceNode(type, x, y) {
    const def = RESOURCE_NODES[type];
    const spr = this.add.sprite(x, y, `${type}_node`).setDepth(3);
    if (type === 'tree') spr.setOrigin(0.5, 0.85); // anchor at base
    spr.nodeType = type;
    spr.nodeDef = def;
    spr.nodeHP = def.hp;
    spr.nodeMaxHP = def.hp;
    spr.depleted = false;
    spr.regenTimer = 0;
    this.resourceNodes.push(spr);
    return spr;
  }

  harvestNode(node) {
    if (node.depleted) return;
    node.nodeHP--;
    // Shake effect with particles
    this.tweens.add({ targets: node, x: node.x + 4, duration: 40, yoyo: true, repeat: 3 });
    
    // Wood/stone chips
    for (let i = 0; i < 3; i++) {
      const p = this.add.image(node.x, node.y, node.nodeType === 'tree' ? 'wood_drop' : 'stone_drop')
        .setDepth(15).setScale(0.5).setAlpha(0.8);
      this.tweens.add({
        targets: p,
        x: node.x + Phaser.Math.Between(-30, 30),
        y: node.y + Phaser.Math.Between(-30, 10),
        alpha: 0, scale: 0.1, duration: 400,
        onComplete: () => p.destroy()
      });
    }

    if (node.nodeHP <= 0) {
      const def = node.nodeDef;
      const amount = def.yield + (def.resource === 'wood' ? this.woodBonus : def.resource === 'stone' ? this.stoneBonus : 0);
      for (let i = 0; i < amount; i++) {
        this.spawnDrop(def.resource, node.x + Phaser.Math.Between(-20, 20), node.y + Phaser.Math.Between(-10, 10));
      }
      if (def.resource === 'wood') this.stats.woodGathered += amount;
      node.depleted = true;
      node.setAlpha(0.15);
      node.regenTimer = def.regen;
    }
  }

  // ── Animal Spawning ──
  spawnWave() {
    const spawnList = [
      { type: 'rabbit', count: 6 },
      { type: 'deer', count: 3 },
      { type: 'penguin', count: 4 },
      { type: 'seal', count: 2 },
      { type: 'wolf', count: 2 },
    ];
    spawnList.forEach(e => { for (let i = 0; i < e.count; i++) this.spawnAnimal(e.type); });
  }

  spawnAnimal(type) {
    const def = ANIMALS[type];
    const m = 60;
    let x = Phaser.Math.Between(m, WORLD_W-m);
    let y = Phaser.Math.Between(m, WORLD_H-m);
    // Don't spawn too close to player
    const pd = Phaser.Math.Distance.Between(x, y, this.player?.x || WORLD_W/2, this.player?.y || WORLD_H/2);
    if (pd < 200) { x = Phaser.Math.Between(m, WORLD_W-m); y = Phaser.Math.Between(m, WORLD_H-m); }
    
    const a = this.physics.add.sprite(x, y, type).setCollideWorldBounds(true).setDepth(5);
    a.animalType = type; a.def = def;
    a.hp = def.hp; a.maxHP = def.hp;
    a.wanderTimer = 0; a.wanderDir = {x:0,y:0};
    a.hitFlash = 0; a.atkCD = 0;
    a.fleeTimer = 0;
    if (def.hp > 2) a.hpBar = this.add.graphics().setDepth(6);
    
    // Name label
    a.nameLabel = this.add.text(x, y - def.size - 10, def.name, {
      fontSize: '10px', fontFamily: 'monospace', color: def.behavior === 'chase' ? '#FF6666' : '#AADDFF',
      stroke: '#000', strokeThickness: 2
    }).setDepth(6).setOrigin(0.5);
    
    this.animals.add(a);
  }

  // ── Combat ──
  performAttack(pointer) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 0.35;
    const wx = pointer.worldX, wy = pointer.worldY;
    const range = 50;
    
    this.player.setTexture('player_attack');
    this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });
    
    let hit = false;
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      if (Phaser.Math.Distance.Between(wx, wy, a.x, a.y) < range) {
        this.damageAnimal(a, this.playerDamage); hit = true;
      }
    });
    this.resourceNodes.forEach(n => {
      if (n.depleted) return;
      if (Phaser.Math.Distance.Between(wx, wy, n.x, n.y) < range) {
        this.harvestNode(n); hit = true;
      }
    });
    this.showAttackFX(wx, wy, hit);
    if (hit) this.cameras.main.shake(60, 0.003);
  }

  performAttackNearest() {
    if (this.attackCooldown > 0) return;
    const range = 50;
    let best = null, bestD = Infinity;
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
      if (d < range && d < bestD) { best = a; bestD = d; }
    });
    let bestNode = null, bestND = Infinity;
    this.resourceNodes.forEach(n => {
      if (n.depleted) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
      if (d < range && d < bestND) { bestNode = n; bestND = d; }
    });

    this.attackCooldown = 0.35;
    this.player.setTexture('player_attack');
    this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });

    if (best && bestD <= bestND) {
      this.damageAnimal(best, this.playerDamage);
      this.showAttackFX(best.x, best.y, true);
      this.cameras.main.shake(60, 0.004);
    } else if (bestNode) {
      this.harvestNode(bestNode);
      this.showAttackFX(bestNode.x, bestNode.y, true);
    } else {
      const dx = this.moveDir.x || (this.facingRight ? 1 : -1);
      const dy = this.moveDir.y || 0;
      this.showAttackFX(this.player.x + dx*40, this.player.y + dy*40, false);
    }
  }

  damageAnimal(a, dmg) {
    a.hp -= dmg; a.hitFlash = 0.2;
    a.setTint(0xFF4444);
    
    // Big bouncy damage number
    const fontSize = dmg >= 3 ? '22px' : dmg >= 2 ? '18px' : '15px';
    const color = dmg >= 3 ? '#FF2222' : '#FF6644';
    const t = this.add.text(a.x + Phaser.Math.Between(-10, 10), a.y - 20, `-${dmg}`, {
      fontSize, fontFamily: 'monospace', color, stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setDepth(15).setOrigin(0.5);
    
    this.tweens.add({
      targets: t, y: t.y - 40, alpha: 0, scale: { from: 1.3, to: 0.8 },
      duration: 600, ease: 'Back.Out',
      onComplete: () => t.destroy()
    });

    // Knockback
    const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, a.x, a.y);
    a.body.setVelocity(Math.cos(ang) * 120, Math.sin(ang) * 120);
    
    // Hit particles
    for (let i = 0; i < 5; i++) {
      const p = this.add.image(a.x, a.y, 'hit_particle').setDepth(15).setScale(Phaser.Math.FloatBetween(0.5, 1.2));
      this.tweens.add({
        targets: p,
        x: a.x + Phaser.Math.Between(-30, 30),
        y: a.y + Phaser.Math.Between(-30, 30),
        alpha: 0, scale: 0, duration: 300,
        onComplete: () => p.destroy()
      });
    }

    if (a.hp <= 0) this.killAnimal(a);
  }

  killAnimal(a) {
    const def = a.def;
    Object.entries(def.drops).forEach(([res, amt]) => {
      for (let i = 0; i < amt; i++) {
        const ang = Phaser.Math.FloatBetween(0, Math.PI*2);
        const dist = Phaser.Math.Between(15, 40);
        this.spawnDrop(res, a.x + Math.cos(ang)*dist, a.y + Math.sin(ang)*dist, a.x, a.y);
      }
    });
    if (!this.stats.kills[a.animalType]) this.stats.kills[a.animalType] = 0;
    this.stats.kills[a.animalType]++;
    
    // Death burst effect
    for (let i = 0; i < 8; i++) {
      const p = this.add.image(a.x, a.y, 'snowflake').setDepth(15).setTint(0xFFDDDD).setScale(1.5);
      this.tweens.add({
        targets: p,
        x: a.x + Phaser.Math.Between(-40, 40),
        y: a.y + Phaser.Math.Between(-40, 40),
        alpha: 0, scale: 0, duration: 400, ease: 'Quad.Out',
        onComplete: () => p.destroy()
      });
    }
    
    // Kill text
    const kt = this.add.text(a.x, a.y - 25, `💀 ${def.name}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#FFDD44', stroke: '#000', strokeThickness: 2
    }).setDepth(15).setOrigin(0.5);
    this.tweens.add({ targets: kt, y: kt.y - 30, alpha: 0, duration: 800, onComplete: () => kt.destroy() });

    if (a.hpBar) a.hpBar.destroy();
    if (a.nameLabel) a.nameLabel.destroy();
    a.destroy();
  }

  spawnDrop(resource, tx, ty, ox, oy) {
    ox = ox || tx; oy = oy || ty;
    const texMap = { meat: 'meat_drop', wood: 'wood_drop', stone: 'stone_drop', leather: 'leather_drop' };
    const d = this.physics.add.sprite(ox, oy, texMap[resource] || 'meat_drop').setDepth(4);
    d.resource = resource; d.value = 1;
    d.body.setAllowGravity(false);
    this.drops.add(d);
    // Pop out animation
    this.tweens.add({ targets: d, x: tx, y: ty, duration: 400, ease: 'Bounce.Out' });
    this.tweens.add({ targets: d, scale: { from: 0.3, to: 1 }, duration: 300, ease: 'Back.Out' });
    // Glow pulse
    this.tweens.add({ targets: d, alpha: { from: 1, to: 0.6 }, yoyo: true, repeat: -1, duration: 800 });
    this.physics.add.overlap(this.player, d, (_, drop) => this.collectDrop(drop));
  }

  collectDrop(drop) {
    if (!drop.active) return;
    const r = drop.resource;
    const total = Object.values(this.res).reduce((a,b)=>a+b, 0);
    if (total >= this.storageCapacity) {
      if (!this._fullMsg || this._fullMsg < this.time.now) {
        this.showFloatingText(this.player.x, this.player.y - 20, '⚠️ 보관함 가득!', '#FF6666');
        this._fullMsg = this.time.now + 1000;
      }
      return;
    }
    this.res[r] = (this.res[r]||0) + drop.value;
    const icons = { meat: '🥩', wood: '🪵', stone: '🪨', leather: '🧶' };
    
    // Collect effect: item flies to UI
    const t = this.add.text(drop.x, drop.y, `+1${icons[r]||''}`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFFFFF', stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setDepth(15).setOrigin(0.5);
    this.tweens.add({
      targets: t, y: t.y - 25, alpha: 0, scale: { from: 1.2, to: 0.8 },
      duration: 500, ease: 'Quad.Out', onComplete: () => t.destroy()
    });
    drop.destroy();
  }

  showAttackFX(x, y, hit) {
    // Slash arc effect
    const slash = this.add.image(x, y, 'slash_fx').setDepth(15).setAlpha(0.8);
    slash.setAngle(Phaser.Math.Between(-30, 30));
    if (hit) slash.setTint(0xFF6644);
    this.tweens.add({
      targets: slash, alpha: 0, scale: { from: 0.8, to: 1.8 },
      duration: 200, onComplete: () => slash.destroy()
    });
    
    // Expanding ring
    const g = this.add.graphics().setDepth(14);
    const c = hit ? 0xFF4444 : 0xFFFFFF;
    let ring = { r: 5, a: 0.8 };
    this.tweens.add({
      targets: ring, r: 35, a: 0, duration: 250,
      onUpdate: () => {
        g.clear(); g.lineStyle(hit ? 3 : 2, c, ring.a); g.strokeCircle(x, y, ring.r);
      },
      onComplete: () => g.destroy()
    });
  }

  // ── Animal AI ──
  updateAnimalAI(dt) {
    const px = this.player.x, py = this.player.y;
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      a.atkCD = Math.max(0, a.atkCD - dt);
      if (a.hitFlash > 0) { a.hitFlash -= dt; if (a.hitFlash <= 0) a.clearTint(); }
      const dist = Phaser.Math.Distance.Between(a.x, a.y, px, py);

      if (a.def.behavior === 'flee') {
        if (dist < a.def.fleeRange) {
          const ang = Phaser.Math.Angle.Between(px, py, a.x, a.y);
          a.body.setVelocity(Math.cos(ang)*a.def.speed, Math.sin(ang)*a.def.speed);
          a.fleeTimer = 2; // flee for 2 seconds then stop
        } else if (a.fleeTimer > 0) {
          a.fleeTimer -= dt;
          // Continue fleeing in same direction but slow down
          const curSpeed = a.def.speed * (a.fleeTimer / 2);
          a.body.velocity.normalize().scale(curSpeed);
        } else {
          this.wander(a, dt, 0.3);
        }
      } else if (a.def.behavior === 'chase') {
        if (dist < a.def.aggroRange) {
          const ang = Phaser.Math.Angle.Between(a.x, a.y, px, py);
          a.body.setVelocity(Math.cos(ang)*a.def.speed, Math.sin(ang)*a.def.speed);
          if (dist < 28 && a.atkCD <= 0) {
            this.playerHP -= a.def.damage;
            a.atkCD = 1.2;
            this.cameras.main.shake(120, 0.012);
            this.player.setTint(0xFF4444);
            this.time.delayedCall(150, ()=>{if(this.player.active)this.player.clearTint();});
            const dt2 = this.add.text(px, py-20, `-${a.def.damage}`, {
              fontSize: '18px', fontFamily: 'monospace', color: '#FF0000', stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
            }).setDepth(15).setOrigin(0.5);
            this.tweens.add({targets:dt2, y:dt2.y-35, alpha:0, scale:{from:1.3,to:0.7}, duration:600, onComplete:()=>dt2.destroy()});
            if (this.playerHP <= 0) this.endGame();
          }
        } else {
          this.wander(a, dt, 0.25);
        }
      } else {
        this.wander(a, dt, 0.3);
      }

      // Flip sprite based on movement
      if (a.body.velocity.x > 5) a.setFlipX(false);
      else if (a.body.velocity.x < -5) a.setFlipX(true);

      // Update name label position
      if (a.nameLabel) {
        a.nameLabel.setPosition(a.x, a.y - a.def.size - 12);
      }

      // HP bar (gradient: green → yellow → red)
      if (a.hpBar) {
        a.hpBar.clear();
        const bw = 30, bx = a.x - bw/2, by = a.y - a.def.size - 6;
        a.hpBar.fillStyle(0x222222, 0.8); a.hpBar.fillRoundedRect(bx-1, by-1, bw+2, 6, 2);
        const r = a.hp / a.maxHP;
        const col = r > 0.6 ? 0x4CAF50 : r > 0.3 ? 0xFFEB3B : 0xF44336;
        a.hpBar.fillStyle(col, 1);
        a.hpBar.fillRoundedRect(bx, by, bw * r, 4, 1);
      }
    });
  }

  wander(a, dt, speedMul) {
    a.wanderTimer -= dt;
    if (a.wanderTimer <= 0) {
      a.wanderTimer = Phaser.Math.FloatBetween(1.5, 4);
      if (Phaser.Math.Between(0, 2) === 0) {
        a.wanderDir = { x: 0, y: 0 }; // pause
      } else {
        const ang = Phaser.Math.FloatBetween(0, Math.PI*2);
        a.wanderDir = { x: Math.cos(ang), y: Math.sin(ang) };
      }
    }
    a.body.setVelocity(a.wanderDir.x*a.def.speed*speedMul, a.wanderDir.y*a.def.speed*speedMul);
  }

  // ── NPC AI ──
  updateNPCs(dt) {
    this.npcsOwned.forEach(npc => {
      if (!npc.active) return;
      npc.actionTimer = Math.max(0, npc.actionTimer - dt);
      const followDist = 100;

      switch(npc.npcType) {
        case 'hunter': case 'warrior': {
          const dmg = npc.npcType === 'warrior' ? 3 : 1;
          const spd = npc.npcType === 'warrior' ? 130 : 100;
          let best = null, bestD = Infinity;
          this.animals.getChildren().forEach(a => {
            if (!a.active) return;
            const d = Phaser.Math.Distance.Between(npc.x, npc.y, a.x, a.y);
            if (d < 300 && d < bestD) { best = a; bestD = d; }
          });
          if (best) {
            const ang = Phaser.Math.Angle.Between(npc.x, npc.y, best.x, best.y);
            npc.body.setVelocity(Math.cos(ang)*spd, Math.sin(ang)*spd);
            if (bestD < 40 && npc.actionTimer <= 0) {
              this.damageAnimal(best, dmg);
              npc.actionTimer = npc.npcType === 'warrior' ? 0.5 : 0.8;
            }
          } else this.followPlayer(npc, followDist);
          break;
        }
        case 'gatherer': {
          let best = null, bestD = Infinity;
          this.resourceNodes.forEach(n => {
            if (n.depleted) return;
            const d = Phaser.Math.Distance.Between(npc.x, npc.y, n.x, n.y);
            if (d < 250 && d < bestD) { best = n; bestD = d; }
          });
          if (best) {
            const ang = Phaser.Math.Angle.Between(npc.x, npc.y, best.x, best.y);
            npc.body.setVelocity(Math.cos(ang)*80, Math.sin(ang)*80);
            if (bestD < 30 && npc.actionTimer <= 0) {
              this.harvestNode(best);
              npc.actionTimer = 1.5;
            }
          } else this.followPlayer(npc, followDist);
          break;
        }
        case 'merchant': {
          this.followPlayer(npc, 60);
          if (npc.actionTimer <= 0 && this.res.meat >= 3) {
            this.res.meat -= 3; this.res.gold += 5;
            npc.actionTimer = 2.5;
            const t = this.add.text(npc.x, npc.y-15, '💰+5', {fontSize:'14px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:3}).setDepth(15).setOrigin(0.5);
            this.tweens.add({targets:t, y:t.y-25, alpha:0, duration:600, onComplete:()=>t.destroy()});
          }
          break;
        }
      }

      // Flip based on movement
      if (npc.body.velocity.x > 5) npc.setFlipX(false);
      else if (npc.body.velocity.x < -5) npc.setFlipX(true);

      // Auto-collect drops
      this.drops.getChildren().forEach(d => {
        if (!d.active) return;
        if (Phaser.Math.Distance.Between(npc.x, npc.y, d.x, d.y) < 25) this.collectDrop(d);
      });
    });
  }

  followPlayer(npc, dist) {
    const d = Phaser.Math.Distance.Between(npc.x, npc.y, this.player.x, this.player.y);
    if (d > dist) {
      const a = Phaser.Math.Angle.Between(npc.x, npc.y, this.player.x, this.player.y);
      npc.body.setVelocity(Math.cos(a)*90, Math.sin(a)*90);
    } else npc.body.setVelocity(0, 0);
  }

  hireNPC(index) {
    if (this.gameOver || index >= NPC_DEFS.length) return;
    const def = NPC_DEFS[index];
    for (const [r, amt] of Object.entries(def.cost)) {
      if ((this.res[r]||0) < amt) return;
    }
    for (const [r, amt] of Object.entries(def.cost)) this.res[r] -= amt;

    const npc = this.physics.add.sprite(
      this.player.x + Phaser.Math.Between(-30,30),
      this.player.y + Phaser.Math.Between(-30,30),
      `npc_${def.type}`
    ).setCollideWorldBounds(true).setDepth(9);
    npc.npcType = def.type; npc.npcDef = def; npc.actionTimer = 0;
    this.npcSprites.add(npc);
    this.npcsOwned.push(npc);
    this.stats.npcsHired++;

    const ht = this.add.text(npc.x, npc.y-20, `✨ ${def.name} 고용!`, {
      fontSize:'16px', fontFamily:'monospace', color:'#FFD700', stroke:'#000', strokeThickness:3
    }).setDepth(20).setOrigin(0.5);
    this.tweens.add({targets:ht, y:ht.y-40, alpha:0, duration:1200, onComplete:()=>ht.destroy()});
    
    for(let i=0;i<8;i++){
      const p = this.add.image(npc.x, npc.y, 'gold_particle').setDepth(15);
      this.tweens.add({
        targets:p,
        x: npc.x + Phaser.Math.Between(-35,35),
        y: npc.y + Phaser.Math.Between(-35,35),
        alpha:0, scale:{from:1.5,to:0}, duration:500,
        onComplete:()=>p.destroy()
      });
    }
  }

  // ── Building ──
  placeBuilding(pointer) {
    if (!this.buildMode) return;
    const def = BUILDINGS[this.buildMode];
    for (const [r, amt] of Object.entries(def.cost)) {
      if ((this.res[r]||0) < amt) { this.showFloatingText(this.player.x, this.player.y-20, '❌ 자원 부족!', '#FF6666'); this.buildMode = null; return; }
    }
    for (const [r, amt] of Object.entries(def.cost)) this.res[r] -= amt;

    const wx = pointer.worldX, wy = pointer.worldY;
    const g = this.add.graphics().setDepth(2);
    
    if (this.buildMode === 'campfire') {
      // Campfire with warm glow
      g.fillStyle(0x884422, 1); g.fillRect(wx-8, wy+4, 16, 4); // logs
      g.fillStyle(0x664411, 1); g.fillRect(wx-6, wy+2, 12, 3);
      g.fillStyle(0xFF6600, 0.9); g.fillCircle(wx, wy, 8);
      g.fillStyle(0xFFAA00, 0.8); g.fillCircle(wx, wy-2, 5);
      g.fillStyle(0xFFDD44, 0.6); g.fillCircle(wx, wy-3, 3);
      // Warm area indicator (150px radius)
      g.lineStyle(1, 0xFF8844, 0.15); g.strokeCircle(wx, wy, 150);
    } else if (this.buildMode === 'tent') {
      // Tent with brown roof
      g.fillStyle(0x8B6914, 0.9); g.fillTriangle(wx, wy-22, wx-20, wy+10, wx+20, wy+10);
      g.fillStyle(0xA07B28, 0.7); g.fillTriangle(wx, wy-18, wx-16, wy+8, wx+16, wy+8);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-4, wy+2, 8, 8); // entrance
      // Chimney smoke effect done in update
    } else if (this.buildMode === 'storage') {
      g.fillStyle(0x795548, 1); g.fillRect(wx-16, wy-14, 32, 28);
      g.fillStyle(0x8D6E63, 1); g.fillTriangle(wx, wy-22, wx-18, wy-12, wx+18, wy-12); // roof
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-4, wy+4, 8, 10); // door
      g.lineStyle(1, 0x4E342E); g.strokeRect(wx-16, wy-14, 32, 28);
    } else if (this.buildMode === 'workshop') {
      g.fillStyle(0x795548, 1); g.fillRect(wx-14, wy-12, 28, 24);
      g.fillStyle(0x8D6E63, 1); g.fillTriangle(wx, wy-20, wx-16, wy-10, wx+16, wy-10);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-4, wy+2, 8, 10);
      // Anvil
      g.fillStyle(0x555555, 1); g.fillRect(wx+8, wy+4, 6, 4);
    } else if (this.buildMode === 'wall') {
      g.fillStyle(0x9E9E9E, 1); g.fillRect(wx-18, wy-8, 36, 16);
      g.fillStyle(0xBBBBBB, 0.5); g.fillRect(wx-16, wy-6, 8, 6);
      g.fillRect(wx-4, wy-6, 8, 6); g.fillRect(wx+8, wy-6, 8, 6);
      g.lineStyle(1, 0x757575); g.strokeRect(wx-18, wy-8, 36, 16);
    }

    const label = this.add.text(wx, wy-28, def.icon, {fontSize:'18px'}).setDepth(3).setOrigin(0.5);
    const bld = { type: this.buildMode, x: wx, y: wy, graphic: g, label, def };
    this.placedBuildings.push(bld);

    if (!this.stats.built[this.buildMode]) this.stats.built[this.buildMode] = 0;
    this.stats.built[this.buildMode]++;
    if (def.storageBonus) this.storageCapacity += def.storageBonus;

    this.showFloatingText(wx, wy - 35, `✅ ${def.name} 건설!`, '#4CAF50');
    
    // Build particles
    for (let i = 0; i < 6; i++) {
      const p = this.add.image(wx, wy, 'snowflake').setDepth(15).setTint(0xFFDD88).setScale(1);
      this.tweens.add({
        targets: p,
        x: wx + Phaser.Math.Between(-30, 30),
        y: wy + Phaser.Math.Between(-30, 30),
        alpha: 0, duration: 400, onComplete: () => p.destroy()
      });
    }
    
    this.buildMode = null;
  }

  // ── Crafting ──
  craftItem(key) {
    const recipe = RECIPES[key];
    for (const [r, amt] of Object.entries(recipe.cost)) {
      if ((this.res[r]||0) < amt) { this.showFloatingText(this.player.x, this.player.y-20, '❌ 재료 부족!', '#FF6666'); return; }
    }
    for (const [r, amt] of Object.entries(recipe.cost)) this.res[r] -= amt;

    switch(recipe.effect) {
      case 'woodBonus': this.woodBonus += recipe.value; break;
      case 'stoneBonus': this.stoneBonus += recipe.value; break;
      case 'damage': this.playerDamage += recipe.value; break;
      case 'warmthResist': this.warmthResist = Math.max(0.1, this.warmthResist - recipe.value); break;
      case 'speed': this.playerSpeed += recipe.value; break;
    }
    this.stats.crafted++;
    this.showFloatingText(this.player.x, this.player.y - 30, `✨ ${recipe.icon} ${recipe.name} 제작!`, '#64B5F6');
  }

  // ── Survival ──
  updateSurvival(dt) {
    const tempLoss = 0.5 * this.warmthResist * dt;
    this.temperature = Math.max(0, this.temperature - tempLoss);

    // Reset campfire buffs each frame
    this._inCampfire = false;

    this.placedBuildings.forEach(b => {
      if (!b.def.warmth) return;
      const isCampfire = b.type === 'campfire';
      const warmthRadius = isCampfire ? 150 : 80;
      const repelRadius = isCampfire ? 100 : 60;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);

      if (d < warmthRadius) {
        this.temperature = Math.min(this.maxTemp, this.temperature + b.def.warmth * dt);
        // Enhanced HP regen for campfire
        const hpRegen = isCampfire ? 5 : 3;
        this.playerHP = Math.min(this.playerMaxHP, this.playerHP + hpRegen * dt);

        if (isCampfire) {
          this._inCampfire = true;
          // Gold auto-generation (+2/s)
          if (!b._goldTimer) b._goldTimer = 0;
          b._goldTimer += dt;
          if (b._goldTimer >= 0.5) {
            b._goldTimer -= 0.5;
            this.res.gold = (this.res.gold || 0) + 1;
            if (Math.random() < 0.3) {
              const gt = this.add.text(b.x + Phaser.Math.Between(-15, 15), b.y - 20, '+1💰', {fontSize:'11px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:2}).setDepth(15).setOrigin(0.5);
              this.tweens.add({targets:gt, y:gt.y-25, alpha:0, duration:600, onComplete:()=>gt.destroy()});
            }
          }
        }
      }

      // Repel animals - hard push away
      this.animals.getChildren().forEach(a => {
        if (!a.active) return;
        const ad = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
        if (ad < repelRadius) {
          const ang = Phaser.Math.Angle.Between(b.x, b.y, a.x, a.y);
          const pushStrength = isCampfire ? 2.0 : 1.5;
          a.body.setVelocity(Math.cos(ang) * a.def.speed * pushStrength, Math.sin(ang) * a.def.speed * pushStrength);
        }
      });

      // Campfire warmth zone visual (3-layer glow)
      if (isCampfire && b.graphic) {
        if (!b._warmGfx) {
          b._warmGfx = this.add.graphics().setDepth(1);
        }
        const wg = b._warmGfx;
        wg.clear();
        if (!this._warmPulse) this._warmPulse = 0;
        this._warmPulse += dt * 1.5;
        const pulse = Math.sin(this._warmPulse) * 0.06 + 1.0;
        const r = warmthRadius * pulse;
        // Outer glow
        wg.fillStyle(0xFF8C00, 0.10); wg.fillCircle(b.x, b.y, r);
        // Middle zone
        wg.fillStyle(0xFF6600, 0.18); wg.fillCircle(b.x, b.y, r * 0.65);
        // Inner core
        wg.fillStyle(0xFF4500, 0.30); wg.fillCircle(b.x, b.y, r * 0.35);
        // Dashed border
        wg.lineStyle(1.5, 0xFF8844, 0.3);
        const segs = 24;
        for (let i = 0; i < segs; i += 2) {
          const a1 = (i / segs) * Math.PI * 2;
          const a2 = ((i + 1) / segs) * Math.PI * 2;
          wg.beginPath(); wg.arc(b.x, b.y, r, a1, a2); wg.strokePath();
        }
        // Fire particles
        if (Math.random() < dt * 6) {
          const px = b.x + Phaser.Math.Between(-8, 8);
          const py = b.y - 5;
          const p = this.add.image(px, py, 'hit_particle').setDepth(4).setTint(
            Phaser.Utils.Array.GetRandom([0xFF4500, 0xFF6600, 0xFFCC00, 0xFFFF00])
          ).setScale(Phaser.Math.FloatBetween(0.5, 1.0)).setAlpha(0.9);
          this.tweens.add({targets:p, y:py-Phaser.Math.Between(25,50), x:px+Phaser.Math.Between(-12,12),
            alpha:0, scale:0.1, duration:Phaser.Math.Between(400,800), onComplete:()=>p.destroy()});
        }
      }
    });

    this.hunger = Math.max(0, this.hunger - 0.3 * dt);

    if (this.temperature <= 0) {
      this.playerHP -= 2 * dt;
      if (this.playerHP <= 0) this.endGame();
    }
    if (this.hunger <= 0) {
      this.playerHP -= 1.5 * dt;
      if (this.playerHP <= 0) this.endGame();
    }

    if (this.hunger < 30 && this.res.meat > 0) {
      this.res.meat--;
      this.hunger = Math.min(this.maxHunger, this.hunger + 25);
      this.showFloatingText(this.player.x, this.player.y - 20, '🥩 자동 섭취', '#FF9800');
    }
  }

  // ── Quests ──
  checkQuests() {
    if (this.questIndex >= QUESTS.length) return;
    const q = QUESTS[this.questIndex];
    if (q.check(this.stats)) {
      Object.entries(q.reward).forEach(([r, amt]) => this.res[r] = (this.res[r]||0) + amt);
      this.questCompleted.push(q.id);
      this.questIndex++;
      
      // Big quest complete notification
      const cam = this.cameras.main;
      const qText = this.add.text(cam.width/2, cam.height * 0.3, `🎉 퀘스트 완료!\n${q.name}`, {
        fontSize: '20px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 4,
        align: 'center', lineSpacing: 4
      }).setScrollFactor(0).setDepth(200).setOrigin(0.5);
      this.tweens.add({
        targets: qText, y: qText.y - 30, alpha: 0,
        duration: 2000, delay: 500, onComplete: () => qText.destroy()
      });
    }
  }

  interactNearest() {
    if (this.res.meat > 0 && this.hunger < 80) {
      this.res.meat--;
      this.hunger = Math.min(this.maxHunger, this.hunger + 25);
      this.playerHP = Math.min(this.playerMaxHP, this.playerHP + 2);
      this.showFloatingText(this.player.x, this.player.y - 20, '🥩 회복!', '#4CAF50');
    }
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontSize: '14px', fontFamily: 'monospace', color: color, stroke: '#000', strokeThickness: 3
    }).setDepth(20).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  // ── Joystick (mobile) ──
  createJoystick() {
    this.joystickBase = this.add.graphics().setScrollFactor(0).setDepth(100).setAlpha(0);
    this.joystickThumb = this.add.graphics().setScrollFactor(0).setDepth(101).setAlpha(0);
    this.joystickActive = false; this.joystickPID = null;

    this.input.on('pointerdown', p => {
      if (this.gameOver || this.isUIArea(p)) return;
      const h = this.cameras.main.height;
      const maxY = h - this.uiBottomMargin - 40; // don't go below buttons
      if (p.x < this.cameras.main.width * 0.45 && p.y > this.cameras.main.height * 0.3 && p.y < maxY) {
        this.joystickActive = true; this.joystickPID = p.id;
        this.joyOrigin = {x:p.x, y:p.y};
        // Draw base
        this.joystickBase.clear().setAlpha(1);
        this.joystickBase.lineStyle(3, 0xFFFFFF, 0.2);
        this.joystickBase.strokeCircle(p.x, p.y, 50);
        this.joystickBase.fillStyle(0xFFFFFF, 0.05);
        this.joystickBase.fillCircle(p.x, p.y, 50);
        // Draw thumb
        this.joystickThumb.clear().setAlpha(1);
        this.joystickThumb.fillStyle(0xFFFFFF, 0.3);
        this.joystickThumb.fillCircle(p.x, p.y, 20);
      }
    });
    this.input.on('pointermove', p => {
      if (!this.joystickActive || p.id !== this.joystickPID) return;
      const dx=p.x-this.joyOrigin.x, dy=p.y-this.joyOrigin.y;
      const dist=Math.sqrt(dx*dx+dy*dy), max=50, clamp=Math.min(dist,max), ang=Math.atan2(dy,dx);
      const tx = this.joyOrigin.x+Math.cos(ang)*clamp;
      const ty = this.joyOrigin.y+Math.sin(ang)*clamp;
      this.joystickThumb.clear();
      this.joystickThumb.fillStyle(0xFFFFFF, 0.4);
      this.joystickThumb.fillCircle(tx, ty, 20);
      if(dist>8){this.moveDir.x=Math.cos(ang);this.moveDir.y=Math.sin(ang);}else{this.moveDir.x=0;this.moveDir.y=0;}
    });
    this.input.on('pointerup', p => {
      if(p.id===this.joystickPID){
        this.joystickActive=false; this.joystickPID=null;
        this.joystickBase.setAlpha(0); this.joystickThumb.setAlpha(0);
        this.moveDir.x=0; this.moveDir.y=0;
      }
    });
  }

  isJoystickArea(p) {
    const h = this.cameras.main.height;
    const maxY = h - this.uiBottomMargin - 40;
    return p.x < this.cameras.main.width * 0.45 && p.y > this.cameras.main.height * 0.3 && p.y < maxY;
  }

  // ── UI ──
  createUI() {
    const s = {fontSize:'13px', fontFamily:'monospace', color:'#fff', stroke:'#000', strokeThickness:3};

    // Resource bar (top) - positions set by positionUI()
    const topY = this.uiTopMargin;
    this.uiResBg = this.add.graphics().setScrollFactor(0).setDepth(99);
    this.uiRes = this.add.text(10, topY, '', s).setScrollFactor(0).setDepth(100);
    
    // Status bars
    this.uiHP = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.uiHPText = this.add.text(10, topY + 20, '', {...s, fontSize:'11px'}).setScrollFactor(0).setDepth(101);
    this.uiTemp = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.uiTempText = this.add.text(10, topY + 36, '', {...s, fontSize:'11px'}).setScrollFactor(0).setDepth(101);
    this.uiHunger = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.uiHungerText = this.add.text(10, topY + 52, '', {...s, fontSize:'11px'}).setScrollFactor(0).setDepth(101);

    // Quest
    this.uiQuest = this.add.text(10, topY + 74, '', {...s, fontSize:'11px', color:'#FFD700', wordWrap:{width:220}}).setScrollFactor(0).setDepth(100);

    // Bottom buttons
    this.uiBtns = [];
    const btnData = [
      { label: '⚔️공격', action: () => this.performAttackNearest() },
      { label: '🔥건설', action: () => this.toggleBuildMenu() },
      { label: '🔨제작', action: () => this.toggleCraftMenu() },
      { label: '👥고용', action: () => this.toggleHireMenu() },
      { label: '🥩먹기', action: () => this.interactNearest() },
    ];

    btnData.forEach((bd) => {
      const btn = this.add.text(0, 0, bd.label, {
        fontSize: '14px', fontFamily: 'monospace', color: '#fff',
        backgroundColor: '#222244cc',
        padding: { x: 8, y: 6 }, stroke: '#000', strokeThickness: 2,
      }).setScrollFactor(0).setDepth(100).setInteractive();
      btn.on('pointerdown', (e) => { e.stopPropagation(); bd.action(); });
      this.uiBtns.push(btn);
    });

    // Panel
    this.panelBg = this.add.graphics().setScrollFactor(0).setDepth(110).setVisible(false);
    this.panelTexts = [];
    this.panelZones = [];
    this.activePanel = null;

    this.npcLabels = [];
    this.positionUI();
    this.scale.on('resize', () => {
      this.positionUI();
      // Close any open panel on resize to avoid layout issues
      if (this.activePanel) { this.clearPanel(); this.activePanel = null; }
    });

    // Also handle orientation change
    window.addEventListener('orientationchange', () => {
      this.time.delayedCall(300, () => this.positionUI());
    });
  }

  positionUI() {
    // Recalculate safe areas on resize
    this.safeBottom = getSafeBottom();
    this.safeTop = getSafeTop();
    this.uiBottomMargin = Math.max(this.safeBottom + 8, 20);
    this.uiTopMargin = Math.max(this.safeTop + 4, 8);

    const w = this.cameras.main.width, h = this.cameras.main.height;
    const btnY = h - this.uiBottomMargin - 34; // buttons above safe area
    const gap = 4;

    // On small screens, use smaller font
    const isSmall = w < 400;
    const fontSize = isSmall ? '12px' : '14px';
    const padX = isSmall ? 5 : 8;
    const padY = isSmall ? 4 : 6;
    this.uiBtns.forEach(btn => {
      btn.setStyle({ fontSize, padding: { x: padX, y: padY }});
    });

    // Calculate button widths and center them
    let totalW = 0;
    this.uiBtns.forEach(btn => { totalW += btn.width + gap; });
    
    // If too wide, wrap or shrink
    if (totalW > w - 20) {
      // Use even smaller font
      this.uiBtns.forEach(btn => {
        btn.setStyle({ fontSize: '11px', padding: { x: 3, y: 3 }});
      });
      totalW = 0;
      this.uiBtns.forEach(btn => { totalW += btn.width + gap; });
    }

    let startX = Math.max(4, (w - totalW) / 2);
    this.uiBtns.forEach((btn) => {
      btn.setPosition(startX, btnY);
      startX += btn.width + gap;
    });

    // Reposition top UI elements with safe top margin
    const topY = this.uiTopMargin;
    this.uiRes.setPosition(10, topY);
    this.uiHPText.setPosition(10, topY + 20);
    this.uiTempText.setPosition(10, topY + 36);
    this.uiHungerText.setPosition(10, topY + 52);
    this.uiQuest.setPosition(10, topY + 74);
  }

  isUIArea(p) {
    const h = this.cameras.main.height, w = this.cameras.main.width;
    const btnZone = this.uiBottomMargin + 44;
    if (p.y > h - btnZone) return true; // bottom buttons + safe area
    if (p.y < this.uiTopMargin + 96 && p.x < 250) return true; // top status area
    if (this.activePanel && p.x > w - 230 && p.y > 60 && p.y < h - 60) return true;
    return false;
  }

  toggleBuildMenu() { this.showPanel('build'); }
  toggleCraftMenu() { this.showPanel('craft'); }
  toggleHireMenu() { this.showPanel('hire'); }

  showPanel(type) {
    this.clearPanel();
    if (this.activePanel === type) { this.activePanel = null; return; }
    this.activePanel = type;

    const w = this.cameras.main.width, h = this.cameras.main.height;
    const px = w - 220, py = 70, pw = 210;

    let items = [];
    if (type === 'build') {
      items = Object.entries(BUILDINGS).map(([k, v]) => ({
        key: k, label: `${v.icon} ${v.name}`,
        sub: Object.entries(v.cost).map(([r,a])=>`${r}:${a}`).join(' '),
        desc: v.desc,
        action: () => { this.buildMode = k; this.clearPanel(); this.activePanel = null;
          this.showFloatingText(this.player.x, this.player.y-20, '👆 터치로 설치', '#AAFFAA'); }
      }));
    } else if (type === 'craft') {
      items = Object.entries(RECIPES).map(([k, v]) => ({
        key: k, label: `${v.icon} ${v.name}`,
        sub: Object.entries(v.cost).map(([r,a])=>`${r}:${a}`).join(' '),
        desc: v.desc,
        action: () => { this.craftItem(k); this.clearPanel(); this.activePanel = null; }
      }));
    } else if (type === 'hire') {
      items = NPC_DEFS.map((d, i) => ({
        key: d.type, label: `${d.name}`,
        sub: Object.entries(d.cost).map(([r,a])=>`${r}:${a}`).join(' '),
        desc: d.desc,
        action: () => { this.hireNPC(i); }
      }));
    }

    const panelH = items.length * 58 + 16;
    this.panelBg.setVisible(true);
    this.panelBg.clear();
    this.panelBg.fillStyle(0x0a0a1e, 0.92);
    this.panelBg.fillRoundedRect(px, py, pw, panelH, 10);
    this.panelBg.lineStyle(2, 0x4466aa, 0.6);
    this.panelBg.strokeRoundedRect(px, py, pw, panelH, 10);

    // Panel title
    const titles = { build: '🔥 건설', craft: '🔨 제작', hire: '👥 고용' };
    const titleText = this.add.text(px + pw/2, py + 2, titles[type], {
      fontSize: '14px', fontFamily: 'monospace', color: '#AACCFF', stroke: '#000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(111).setOrigin(0.5, 0);
    this.panelTexts.push(titleText);

    items.forEach((item, i) => {
      const iy = py + 22 + i * 58;
      
      // Item bg on hover
      const itemBg = this.add.graphics().setScrollFactor(0).setDepth(110.5);
      itemBg.fillStyle(0x223366, 0.3);
      itemBg.fillRoundedRect(px + 4, iy, pw - 8, 52, 6);
      this.panelTexts.push(itemBg);

      const t1 = this.add.text(px+12, iy+4, item.label, {fontSize:'13px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:2}).setScrollFactor(0).setDepth(111);
      const t2 = this.add.text(px+12, iy+20, item.sub, {fontSize:'10px',fontFamily:'monospace',color:'#AABBCC'}).setScrollFactor(0).setDepth(111);
      const t3 = this.add.text(px+12, iy+34, item.desc, {fontSize:'10px',fontFamily:'monospace',color:'#88FF88'}).setScrollFactor(0).setDepth(111);
      this.panelTexts.push(t1, t2, t3);

      const zone = this.add.zone(px + pw/2, iy + 26, pw, 52).setScrollFactor(0).setDepth(112).setInteractive();
      zone.on('pointerdown', item.action);
      zone.on('pointerover', () => itemBg.clear().fillStyle(0x334488, 0.5).fillRoundedRect(px+4, iy, pw-8, 52, 6));
      zone.on('pointerout', () => itemBg.clear().fillStyle(0x223366, 0.3).fillRoundedRect(px+4, iy, pw-8, 52, 6));
      this.panelZones.push(zone);
    });
  }

  clearPanel() {
    this.panelBg.setVisible(false);
    this.panelTexts.forEach(t => t.destroy());
    this.panelTexts = [];
    this.panelZones.forEach(z => z.destroy());
    this.panelZones = [];
  }

  drawBar(g, x, y, w, h, ratio, color1, color2) {
    // Background
    g.fillStyle(0x111122, 0.85);
    g.fillRoundedRect(x, y, w, h, 3);
    // Border
    g.lineStyle(1, 0x334466, 0.5);
    g.strokeRoundedRect(x, y, w, h, 3);
    // Fill with gradient feel
    const r = Math.max(0, Math.min(1, ratio));
    if (r > 0) {
      g.fillStyle(color1, 1);
      g.fillRoundedRect(x+1, y+1, (w-2)*r, h-2, 2);
      // Highlight on top
      if (color2) {
        g.fillStyle(color2, 0.3);
        g.fillRect(x+2, y+2, (w-4)*r, (h-4)/2);
      }
    }
  }

  updateUI() {
    const icons = {meat:'🥩',wood:'🪵',stone:'🪨',leather:'🧶',gold:'💰'};
    
    const topY = this.uiTopMargin;

    // Resource background
    this.uiResBg.clear();
    this.uiResBg.fillStyle(0x0a0a1e, 0.7);
    this.uiResBg.fillRoundedRect(4, topY - 4, 240, 100, 8);
    
    this.uiRes.setText(Object.entries(this.res).filter(([_,v])=>v>0).map(([k,v])=>`${icons[k]||k}${v}`).join(' '));

    // HP bar (red → yellow → green gradient)
    this.uiHP.clear();
    const hpR = this.playerHP/this.playerMaxHP;
    const hpCol = hpR > 0.6 ? 0x4CAF50 : hpR > 0.3 ? 0xFFCC00 : 0xF44336;
    const hpCol2 = hpR > 0.6 ? 0x66DD66 : hpR > 0.3 ? 0xFFEE44 : 0xFF6666;
    this.drawBar(this.uiHP, 10, topY + 20, 150, 13, hpR, hpCol, hpCol2);
    this.uiHPText.setText(`❤️ ${Math.ceil(Math.max(0,this.playerHP))}/${this.playerMaxHP}`);

    this.uiTemp.clear();
    this.drawBar(this.uiTemp, 10, topY + 36, 150, 13, this.temperature/this.maxTemp, 0x42A5F5, 0x66CCFF);
    this.uiTempText.setText(`🌡️ ${Math.ceil(this.temperature)}%`);

    this.uiHunger.clear();
    this.drawBar(this.uiHunger, 10, topY + 52, 150, 13, this.hunger/this.maxHunger, 0xFF9800, 0xFFBB44);
    this.uiHungerText.setText(`🍖 ${Math.ceil(this.hunger)}%`);

    // Quest
    if (this.questIndex < QUESTS.length) {
      const q = QUESTS[this.questIndex];
      this.uiQuest.setText(`📋 ${q.name}: ${q.desc}`);
    } else {
      this.uiQuest.setText('📋 모든 퀘스트 완료! 🎉');
    }

    // Campfire buff indicator
    if (this._inCampfire) {
      if (!this._buffLabel) {
        this._buffLabel = this.add.text(170, 28, '', {fontSize:'11px',fontFamily:'monospace',color:'#FFB74D',stroke:'#000',strokeThickness:2}).setScrollFactor(0).setDepth(101);
      }
      this._buffLabel.setText('🔥 화덕 버프: ⚔️+30% 🏃+20% ❤️+5/s 💰+2/s').setVisible(true);
    } else if (this._buffLabel) {
      this._buffLabel.setVisible(false);
    }

    // NPC labels
    this.npcLabels.forEach(l => l.destroy());
    this.npcLabels = [];
    this.npcsOwned.forEach(npc => {
      if (!npc.active) return;
      const l = this.add.text(npc.x, npc.y-20, npc.npcDef.name, {
        fontSize:'10px', fontFamily:'monospace', color:'#FFDD88', stroke:'#000', strokeThickness:2
      }).setDepth(12).setOrigin(0.5);
      this.npcLabels.push(l);
    });
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    const cam = this.cameras.main;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(200);
    ov.fillStyle(0x000000, 0.8); ov.fillRect(0, 0, cam.width, cam.height);

    this.add.text(cam.width/2, cam.height/2-80, '💀 사망', {
      fontSize:'40px', fontFamily:'monospace', color:'#FF4444', stroke:'#000', strokeThickness:5
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    const kills = Object.entries(this.stats.kills).map(([k,v])=>`${ANIMALS[k]?.name||k}: ${v}`).join(', ') || '없음';
    const txt = `🎯 사냥: ${kills}\n🏗️ 건설: ${Object.values(this.stats.built).reduce((a,b)=>a+b,0)}개\n🔨 제작: ${this.stats.crafted}개\n👥 NPC: ${this.stats.npcsHired}명\n📋 퀘스트: ${this.questCompleted.length}/${QUESTS.length}`;
    this.add.text(cam.width/2, cam.height/2+10, txt, {
      fontSize:'15px', fontFamily:'monospace', color:'#fff', stroke:'#000', strokeThickness:2, align:'center', lineSpacing:8
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    const rb = this.add.text(cam.width/2, cam.height/2+120, '🔄 다시 시작', {
      fontSize:'24px', fontFamily:'monospace', color:'#4CAF50', stroke:'#000', strokeThickness:3,
      backgroundColor:'#222244', padding:{x:20,y:10}
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5).setInteractive();
    rb.on('pointerdown', () => this.scene.restart());
    rb.on('pointerover', () => rb.setColor('#66FF66'));
    rb.on('pointerout', () => rb.setColor('#4CAF50'));
  }

  // ── Main Update ──
  update(time, deltaMs) {
    if (this.gameOver) return;
    const dt = deltaMs / 1000;

    const atkSpeedMul = this._inCampfire ? 1.3 : 1.0;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt * atkSpeedMul);

    // Mobile auto-attack: animals AND resource nodes within 50px
    if (this.isMobile && this.attackCooldown <= 0) {
      let nearest = null, nearestDist = Infinity;
      this.animals.getChildren().forEach(a => {
        if (!a.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
        if (d < 50 && d < nearestDist) { nearest = a; nearestDist = d; }
      });
      if (nearest) {
        this.attackCooldown = 0.4;
        this.player.setTexture('player_attack');
        this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });
        this.damageAnimal(nearest, this.playerDamage);
        this.showAttackFX(nearest.x, nearest.y, true);
        this.cameras.main.shake(50, 0.003);
      } else {
        // Try auto-harvest nodes
        let nearestNode = null, nearestND = Infinity;
        this.resourceNodes.forEach(n => {
          if (n.depleted) return;
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
          if (d < 50 && d < nearestND) { nearestNode = n; nearestND = d; }
        });
        if (nearestNode) {
          this.attackCooldown = 0.4;
          this.player.setTexture('player_attack');
          this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });
          this.harvestNode(nearestNode);
          this.showAttackFX(nearestNode.x, nearestNode.y, true);
        }
      }
    }

    // Player movement
    if (!this.isMobile || !this.joystickActive) {
      let mx=0, my=0;
      if(this.wasd.A.isDown||this.cursors.left.isDown) mx=-1;
      if(this.wasd.D.isDown||this.cursors.right.isDown) mx=1;
      if(this.wasd.W.isDown||this.cursors.up.isDown) my=-1;
      if(this.wasd.S.isDown||this.cursors.down.isDown) my=1;
      if(mx||my){const l=Math.sqrt(mx*mx+my*my);this.moveDir.x=mx/l;this.moveDir.y=my/l;}
      else if(!this.joystickActive){this.moveDir.x=0;this.moveDir.y=0;}
    }
    const speedMul = this._inCampfire ? 1.2 : 1.0;
    this.player.body.setVelocity(this.moveDir.x*this.playerSpeed*speedMul, this.moveDir.y*this.playerSpeed*speedMul);
    
    // Player flip
    if (this.moveDir.x > 0.1) { this.player.setFlipX(false); this.facingRight = true; }
    else if (this.moveDir.x < -0.1) { this.player.setFlipX(true); this.facingRight = false; }

    // Animal AI
    this.updateAnimalAI(dt);
    this.updateNPCs(dt);
    this.updateSurvival(dt);

    // Resource node regen
    this.resourceNodes.forEach(n => {
      if (!n.depleted) return;
      n.regenTimer -= dt;
      if (n.regenTimer <= 0) {
        n.depleted = false;
        n.nodeHP = n.nodeMaxHP;
        n.setAlpha(1);
      }
    });

    // Animal respawn
    this.animalSpawnTimer += dt;
    if (this.animalSpawnTimer > 12) {
      this.animalSpawnTimer = 0;
      const alive = this.animals.getChildren().length;
      if (alive < 20) {
        const types = ['rabbit','rabbit','deer','penguin','seal','wolf'];
        if ((this.stats.kills.wolf||0) >= 2 || (this.stats.kills.bear||0) >= 1) types.push('bear');
        for (let i = 0; i < 3; i++) this.spawnAnimal(Phaser.Utils.Array.GetRandom(types));
      }
    }

    // Drop magnet (stronger, smoother)
    this.drops.getChildren().forEach(d => {
      if(!d.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, d.x, d.y);
      if (dist < 60) {
        const a = Phaser.Math.Angle.Between(d.x, d.y, this.player.x, this.player.y);
        const speed = 200 * (1 - dist/60); // faster when closer
        d.x += Math.cos(a) * speed * dt;
        d.y += Math.sin(a) * speed * dt;
        if (dist < 15) this.collectDrop(d);
      }
    });

    this.checkQuests();
    this.updateUI();
  }
}

// ── Safe Area & Viewport Helpers ──
function getSafeBottom() {
  if (window.getSafeAreaInsets) {
    try { return Math.max(window.getSafeAreaInsets().bottom, 0); } catch(e) {}
  }
  // Fallback: detect iOS notch-era devices
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (isIOS && window.screen.height >= 812) return 34;
  return 0;
}
function getSafeTop() {
  if (window.getSafeAreaInsets) {
    try { return Math.max(window.getSafeAreaInsets().top, 0); } catch(e) {}
  }
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (isIOS && window.screen.height >= 812) return 47;
  return 0;
}
function getVW() { return window.getGameWidth ? window.getGameWidth() : window.innerWidth; }
function getVH() { return window.getGameHeight ? window.getGameHeight() : window.innerHeight; }

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: getVW(),
  height: getVH(),
  backgroundColor: '#1a1a2e',
  physics: { default: 'arcade', arcade: { gravity:{y:0}, debug:false } },
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, GameScene],
  input: { activePointers: 3 },
};

const game = new Phaser.Game(config);

// Listen to visualViewport resize (iOS Safari toolbar show/hide)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    game.scale.resize(getVW(), getVH());
  });
}
