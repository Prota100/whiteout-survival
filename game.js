// Whiteout Survival - Idle Survival Style
// Phaser 3 - Full Rewrite

const WORLD_W = 2400;
const WORLD_H = 2400;

// ── Animal Definitions ──
const ANIMALS = {
  rabbit:  { hp: 1,  speed: 30,  damage: 0, drops: { meat: 1 }, color: 0xCCCCCC, size: 12, behavior: 'flee', name: '토끼', aggroRange: 60, fleeRange: 40 },
  deer:    { hp: 3,  speed: 40,  damage: 0, drops: { meat: 2, leather: 1 }, color: 0xC4A46C, size: 14, behavior: 'flee', name: '사슴', aggroRange: 120, fleeRange: 100 },
  penguin: { hp: 2,  speed: 25,  damage: 0, drops: { meat: 1 }, color: 0x222222, size: 12, behavior: 'wander', name: '펭귄', aggroRange: 0, fleeRange: 0 },
  seal:    { hp: 4,  speed: 20,  damage: 0, drops: { meat: 2, leather: 2 }, color: 0x7B8D9E, size: 14, behavior: 'wander', name: '물개', aggroRange: 0, fleeRange: 0 },
  wolf:    { hp: 5,  speed: 70,  damage: 1, drops: { meat: 3, leather: 1 }, color: 0x555555, size: 14, behavior: 'chase', name: '늑대', aggroRange: 180, fleeRange: 0 },
  bear:    { hp: 12, speed: 50,  damage: 3, drops: { meat: 6, leather: 3 }, color: 0x6B4226, size: 18, behavior: 'chase', name: '곰', aggroRange: 200, fleeRange: 0 },
};

// ── Building Definitions ──
const BUILDINGS = {
  campfire: { name: '화덕', cost: { wood: 5 }, warmth: 2, desc: '체온 회복 +2/s', color: 0xFF6600, icon: '🔥' },
  tent:     { name: '텐트', cost: { wood: 10, leather: 3 }, warmth: 5, desc: '체온 회복 +5/s', color: 0x8B6914, icon: '⛺' },
  storage:  { name: '창고', cost: { wood: 15, stone: 10 }, storageBonus: 50, desc: '자원 보관량 +50', color: 0x9E9E9E, icon: '📦' },
  workshop: { name: '작업대', cost: { wood: 20, stone: 15 }, desc: '도구 제작 가능', color: 0x795548, icon: '🔨' },
  wall:     { name: '방벽', cost: { stone: 8 }, desc: '동물 진입 차단', color: 0xAAAAAA, icon: '🧱' },
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
  { type: 'hunter',    name: '사냥꾼', cost: { meat: 8 },  color: 0x4CAF50, desc: '자동 사냥' },
  { type: 'gatherer',  name: '채집꾼', cost: { meat: 5 },  color: 0x8BC34A, desc: '자동 채집' },
  { type: 'merchant',  name: '상인',   cost: { meat: 20 }, color: 0xFFEB3B, desc: '고기→금화' },
  { type: 'warrior',   name: '전사',   cost: { meat: 35 }, color: 0xF44336, desc: '강력 전투' },
];

// ── Resource node types ──
const RESOURCE_NODES = {
  tree:  { name: '나무', resource: 'wood',  hp: 3, yield: 2, color: 0x2E7D32, size: 16, regen: 30 },
  rock:  { name: '바위', resource: 'stone', hp: 4, yield: 2, color: 0x757575, size: 14, regen: 45 },
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

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const g = this.add.graphics();
    const px = (g, x, y, w, h, col) => { g.fillStyle(col, 1); g.fillRect(x, y, w, h); };

    // ── Player (32x32) - 파카 입은 탐험가 ──
    g.clear();
    // 그림자
    g.fillStyle(0x000000, 0.2); g.fillEllipse(16, 30, 20, 6);
    // 부츠
    px(g, 10, 26, 5, 4, 0x4E342E); px(g, 17, 26, 5, 4, 0x4E342E);
    // 다리
    px(g, 11, 22, 4, 5, 0x37474F); px(g, 17, 22, 4, 5, 0x37474F);
    // 몸통 (파란 파카)
    g.fillStyle(0x1565C0, 1); g.fillRoundedRect(9, 12, 14, 11, 2);
    // 파카 디테일
    px(g, 14, 13, 4, 10, 0x1976D2); // 지퍼 라인
    g.fillStyle(0x0D47A1, 1); g.fillRect(9, 12, 14, 2); // 어깨
    // 팔
    px(g, 6, 14, 4, 8, 0x1565C0); px(g, 22, 14, 4, 8, 0x1565C0);
    px(g, 6, 21, 4, 2, 0x8D6E63); px(g, 22, 21, 4, 2, 0x8D6E63); // 장갑
    // 머리
    g.fillStyle(0xFFCC80, 1); g.fillRoundedRect(11, 5, 10, 8, 2);
    // 눈
    px(g, 13, 8, 2, 2, 0x212121); px(g, 18, 8, 2, 2, 0x212121);
    // 모자 (털모자)
    g.fillStyle(0xD32F2F, 1); g.fillRoundedRect(10, 2, 12, 5, 2);
    px(g, 14, 0, 4, 3, 0xD32F2F); // 꼭대기
    g.fillStyle(0xFFFFFF, 1); g.fillRect(10, 6, 12, 2); // 모자 테두리 (털)
    // 외곽선
    g.lineStyle(1, 0x263238, 0.6); g.strokeRoundedRect(9, 12, 14, 11, 2);
    g.generateTexture('player', 32, 32); g.clear();

    // ── Player Attack (32x32) ──
    g.fillStyle(0x000000, 0.2); g.fillEllipse(16, 30, 20, 6);
    px(g, 10, 26, 5, 4, 0x4E342E); px(g, 17, 26, 5, 4, 0x4E342E);
    px(g, 11, 22, 4, 5, 0x37474F); px(g, 17, 22, 4, 5, 0x37474F);
    g.fillStyle(0x1565C0, 1); g.fillRoundedRect(9, 12, 14, 11, 2);
    px(g, 14, 13, 4, 10, 0x1976D2);
    px(g, 6, 13, 4, 6, 0x1565C0); // 왼팔
    // 오른팔 (공격 자세 - 위로)
    px(g, 22, 8, 4, 8, 0x1565C0);
    px(g, 22, 6, 4, 3, 0x8D6E63); // 장갑
    // 무기 (칼)
    px(g, 24, 0, 2, 7, 0xBDBDBD); px(g, 23, 7, 4, 2, 0x795548);
    px(g, 6, 18, 4, 2, 0x8D6E63);
    g.fillStyle(0xFFCC80, 1); g.fillRoundedRect(11, 5, 10, 8, 2);
    px(g, 13, 8, 2, 2, 0x212121); px(g, 18, 8, 2, 2, 0x212121);
    g.fillStyle(0xD32F2F, 1); g.fillRoundedRect(10, 2, 12, 5, 2);
    px(g, 14, 0, 4, 3, 0xD32F2F);
    g.fillStyle(0xFFFFFF, 1); g.fillRect(10, 6, 12, 2);
    g.generateTexture('player_attack', 32, 32); g.clear();

    // ── 토끼 (24x24) - 흰 토끼, 큰 귀 ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(12, 22, 14, 4);
    // 몸통
    g.fillStyle(0xF5F5F5, 1); g.fillEllipse(12, 15, 12, 10);
    // 머리
    g.fillStyle(0xFAFAFA, 1); g.fillCircle(12, 9, 5);
    // 귀 (길고 뾰족)
    g.fillStyle(0xF5F5F5, 1); g.fillEllipse(8, 2, 3, 7); g.fillEllipse(16, 2, 3, 7);
    g.fillStyle(0xFFB0B0, 1); g.fillEllipse(8, 2, 1.5, 5); g.fillEllipse(16, 2, 1.5, 5); // 귀 안쪽 핑크
    // 눈 (빨간 눈)
    px(g, 9, 8, 2, 2, 0xE53935); px(g, 13, 8, 2, 2, 0xE53935);
    // 코
    px(g, 11, 11, 2, 1, 0xFFB0B0);
    // 꼬리
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(12, 20, 3);
    // 외곽선
    g.lineStyle(1, 0xBDBDBD, 0.5); g.strokeCircle(12, 9, 5);
    g.generateTexture('rabbit', 24, 24); g.clear();

    // ── 사슴 (28x28) - 갈색, 뿔 ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(14, 26, 16, 4);
    // 다리
    px(g, 6, 20, 2, 6, 0x8D6E63); px(g, 11, 20, 2, 6, 0x8D6E63);
    px(g, 15, 20, 2, 6, 0x8D6E63); px(g, 20, 20, 2, 6, 0x8D6E63);
    // 몸통
    g.fillStyle(0xA1887F, 1); g.fillEllipse(14, 16, 16, 8);
    g.fillStyle(0xBCAAA4, 1); g.fillEllipse(14, 18, 10, 4); // 배
    // 머리
    g.fillStyle(0x8D6E63, 1); g.fillCircle(14, 8, 5);
    // 뿔
    px(g, 7, 1, 2, 5, 0x795548); px(g, 5, 0, 2, 3, 0x795548);
    px(g, 19, 1, 2, 5, 0x795548); px(g, 21, 0, 2, 3, 0x795548);
    // 눈
    px(g, 11, 7, 2, 2, 0x3E2723); px(g, 15, 7, 2, 2, 0x3E2723);
    // 코
    px(g, 13, 10, 2, 2, 0x5D4037);
    // 하얀 반점
    g.fillStyle(0xD7CCC8, 0.6); g.fillCircle(10, 14, 2); g.fillCircle(18, 15, 1.5);
    g.generateTexture('deer', 28, 28); g.clear();

    // ── 펭귄 (24x24) - 흑백 턱시도 ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(12, 22, 12, 4);
    // 몸통 (검정)
    g.fillStyle(0x212121, 1); g.fillEllipse(12, 14, 12, 12);
    // 배 (흰색)
    g.fillStyle(0xFAFAFA, 1); g.fillEllipse(12, 15, 7, 9);
    // 머리
    g.fillStyle(0x212121, 1); g.fillCircle(12, 6, 5);
    // 눈 (하얀 패치)
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(9, 5, 2.5); g.fillCircle(15, 5, 2.5);
    px(g, 9, 5, 2, 2, 0x212121); px(g, 14, 5, 2, 2, 0x212121);
    // 부리
    g.fillStyle(0xFF9800, 1); g.fillTriangle(12, 7, 10, 10, 14, 10);
    // 날개
    px(g, 4, 12, 3, 8, 0x37474F); px(g, 17, 12, 3, 8, 0x37474F);
    // 발
    px(g, 8, 21, 4, 2, 0xFF9800); px(g, 14, 21, 4, 2, 0xFF9800);
    g.generateTexture('penguin', 24, 24); g.clear();

    // ── 물개 (28x28) - 둥글둥글 ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(14, 25, 18, 4);
    // 몸통
    g.fillStyle(0x78909C, 1); g.fillEllipse(14, 16, 18, 12);
    g.fillStyle(0x90A4AE, 1); g.fillEllipse(14, 18, 12, 6); // 배
    // 머리
    g.fillStyle(0x607D8B, 1); g.fillCircle(14, 7, 6);
    // 눈
    px(g, 10, 6, 3, 3, 0x263238); px(g, 16, 6, 3, 3, 0x263238);
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(11, 6, 1); g.fillCircle(17, 6, 1);
    // 코
    g.fillStyle(0x37474F, 1); g.fillCircle(14, 10, 2);
    // 수염
    g.lineStyle(1, 0xB0BEC5, 0.6);
    g.lineBetween(8, 9, 3, 8); g.lineBetween(8, 10, 3, 11);
    g.lineBetween(20, 9, 25, 8); g.lineBetween(20, 10, 25, 11);
    // 지느러미
    g.fillStyle(0x607D8B, 1);
    g.fillTriangle(3, 14, 6, 10, 6, 18);
    g.fillTriangle(25, 14, 22, 10, 22, 18);
    g.generateTexture('seal', 28, 28); g.clear();

    // ── 늑대 (28x28) - 회색, 날카로운 ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(14, 26, 16, 4);
    // 다리
    px(g, 6, 20, 3, 6, 0x424242); px(g, 11, 20, 3, 6, 0x424242);
    px(g, 14, 20, 3, 6, 0x424242); px(g, 19, 20, 3, 6, 0x424242);
    // 몸통
    g.fillStyle(0x616161, 1); g.fillEllipse(14, 16, 16, 8);
    g.fillStyle(0x9E9E9E, 1); g.fillEllipse(14, 17, 10, 4); // 배
    // 꼬리
    g.fillStyle(0x757575, 1); g.fillTriangle(24, 12, 28, 8, 22, 14);
    // 머리
    g.fillStyle(0x616161, 1); g.fillCircle(14, 8, 6);
    // 주둥이
    g.fillStyle(0x757575, 1); g.fillEllipse(14, 12, 5, 3);
    // 귀 (뾰족)
    g.fillStyle(0x424242, 1);
    g.fillTriangle(7, 1, 9, 7, 5, 7);
    g.fillTriangle(21, 1, 19, 7, 23, 7);
    // 눈 (노란 눈 - 사나운)
    px(g, 10, 7, 3, 2, 0xFFEB3B); px(g, 16, 7, 3, 2, 0xFFEB3B);
    px(g, 11, 7, 1, 2, 0x212121); px(g, 17, 7, 1, 2, 0x212121);
    // 코
    px(g, 13, 11, 2, 2, 0x212121);
    // 이빨
    px(g, 11, 13, 2, 1, 0xFFFFFF); px(g, 15, 13, 2, 1, 0xFFFFFF);
    g.generateTexture('wolf', 28, 28); g.clear();

    // ── 곰 (36x36) - 크고 갈색 ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(18, 34, 24, 5);
    // 다리
    px(g, 7, 26, 5, 8, 0x5D4037); px(g, 14, 26, 5, 8, 0x5D4037);
    px(g, 17, 26, 5, 8, 0x5D4037); px(g, 24, 26, 5, 8, 0x5D4037);
    // 몸통 (큰 덩치)
    g.fillStyle(0x6D4C41, 1); g.fillEllipse(18, 20, 22, 14);
    g.fillStyle(0x795548, 1); g.fillEllipse(18, 22, 14, 6); // 배
    // 머리
    g.fillStyle(0x6D4C41, 1); g.fillCircle(18, 9, 8);
    // 귀 (둥근)
    g.fillStyle(0x5D4037, 1); g.fillCircle(10, 3, 3); g.fillCircle(26, 3, 3);
    g.fillStyle(0x8D6E63, 1); g.fillCircle(10, 3, 1.5); g.fillCircle(26, 3, 1.5);
    // 주둥이
    g.fillStyle(0x8D6E63, 1); g.fillEllipse(18, 12, 6, 4);
    // 눈 (작고 사나움)
    px(g, 13, 8, 3, 3, 0x212121); px(g, 21, 8, 3, 3, 0x212121);
    g.fillStyle(0xFFFFFF, 0.7); g.fillCircle(14, 8, 0.8); g.fillCircle(22, 8, 0.8);
    // 코
    g.fillStyle(0x3E2723, 1); g.fillCircle(18, 11, 2);
    // 발톱
    px(g, 7, 33, 2, 2, 0xBCAAA4); px(g, 10, 33, 2, 2, 0xBCAAA4);
    px(g, 24, 33, 2, 2, 0xBCAAA4); px(g, 27, 33, 2, 2, 0xBCAAA4);
    g.generateTexture('bear', 36, 36); g.clear();

    // ── NPC: 사냥꾼 (24x28) ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(12, 26, 14, 4);
    px(g, 8, 22, 3, 5, 0x5D4037); px(g, 13, 22, 3, 5, 0x5D4037);
    g.fillStyle(0x6D4C41, 1); g.fillRoundedRect(7, 12, 10, 10, 2); // 갈색 옷
    px(g, 4, 14, 3, 7, 0x6D4C41); // 왼팔
    px(g, 17, 12, 3, 10, 0x6D4C41); // 오른팔
    // 활
    g.lineStyle(2, 0x795548, 1); g.beginPath(); g.arc(20, 14, 6, -1.2, 1.2); g.strokePath();
    g.lineStyle(1, 0xBCAAA4, 1); g.lineBetween(20, 8, 20, 20);
    g.fillStyle(0xFFCC80, 1); g.fillRoundedRect(9, 5, 6, 7, 2); // 머리
    px(g, 10, 7, 2, 2, 0x3E2723); px(g, 13, 7, 2, 2, 0x3E2723);
    g.fillStyle(0x4CAF50, 1); g.fillRect(8, 3, 8, 3); // 녹색 모자
    g.generateTexture('npc_hunter', 24, 28); g.clear();

    // ── NPC: 채집꾼 (24x28) ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(12, 26, 14, 4);
    px(g, 8, 22, 3, 5, 0x5D4037); px(g, 13, 22, 3, 5, 0x5D4037);
    g.fillStyle(0x8BC34A, 1); g.fillRoundedRect(7, 12, 10, 10, 2); // 녹색 옷
    px(g, 4, 14, 3, 7, 0x8BC34A);
    px(g, 17, 14, 3, 7, 0x8BC34A);
    // 바구니
    g.fillStyle(0xA1887F, 1); g.fillRoundedRect(17, 16, 6, 6, 1);
    g.lineStyle(1, 0x795548); g.strokeRoundedRect(17, 16, 6, 6, 1);
    g.fillStyle(0xFFCC80, 1); g.fillRoundedRect(9, 5, 6, 7, 2);
    px(g, 10, 7, 2, 2, 0x3E2723); px(g, 13, 7, 2, 2, 0x3E2723);
    g.fillStyle(0xFDD835, 1); g.fillRect(8, 2, 8, 4); // 밀짚모자
    g.fillRect(6, 5, 12, 2);
    g.generateTexture('npc_gatherer', 24, 28); g.clear();

    // ── NPC: 상인 (24x28) ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(12, 26, 14, 4);
    px(g, 8, 22, 3, 5, 0x5D4037); px(g, 13, 22, 3, 5, 0x5D4037);
    g.fillStyle(0xFFEB3B, 1); g.fillRoundedRect(7, 12, 10, 10, 2); // 노란 옷
    px(g, 7, 18, 10, 5, 0xF5F5F5); // 앞치마
    px(g, 4, 14, 3, 7, 0xFFEB3B);
    px(g, 17, 14, 3, 7, 0xFFEB3B);
    g.fillStyle(0xFFCC80, 1); g.fillRoundedRect(9, 5, 6, 7, 2);
    px(g, 10, 7, 2, 2, 0x3E2723); px(g, 13, 7, 2, 2, 0x3E2723);
    // 수염
    g.fillStyle(0x8D6E63, 0.5); g.fillRect(10, 10, 4, 2);
    g.fillStyle(0x7B1FA2, 1); g.fillRect(8, 2, 8, 4); // 보라색 모자
    g.generateTexture('npc_merchant', 24, 28); g.clear();

    // ── NPC: 전사 (24x28) ──
    g.fillStyle(0x000000, 0.15); g.fillEllipse(12, 26, 14, 4);
    px(g, 8, 22, 3, 5, 0x455A64); px(g, 13, 22, 3, 5, 0x455A64);
    g.fillStyle(0x1565C0, 1); g.fillRoundedRect(7, 12, 10, 10, 2); // 파란 갑옷
    g.fillStyle(0x90A4AE, 1); g.fillRect(8, 13, 8, 3); // 갑옷 디테일
    px(g, 4, 13, 3, 8, 0x1565C0); // 왼팔 + 방패
    g.fillStyle(0x90A4AE, 1); g.fillCircle(4, 17, 4); // 방패
    g.fillStyle(0xF44336, 1); g.fillCircle(4, 17, 2); // 방패 문양
    px(g, 17, 13, 3, 8, 0x1565C0); // 오른팔
    // 검
    px(g, 19, 6, 2, 10, 0xBDBDBD); px(g, 18, 15, 4, 2, 0x795548);
    g.fillStyle(0xFFCC80, 1); g.fillRoundedRect(9, 5, 6, 7, 2);
    // 투구
    g.fillStyle(0x78909C, 1); g.fillRoundedRect(8, 2, 8, 5, 2);
    px(g, 11, 1, 2, 3, 0xF44336); // 투구 깃털
    px(g, 10, 7, 2, 2, 0x212121); px(g, 13, 7, 2, 2, 0x212121);
    g.generateTexture('npc_warrior', 24, 28); g.clear();

    // ── 드롭 아이템들 (12x12) ──
    // 고기
    g.fillStyle(0xD32F2F, 1); g.fillEllipse(6, 7, 8, 6);
    g.fillStyle(0xEF5350, 1); g.fillEllipse(6, 6, 5, 3);
    px(g, 3, 2, 2, 5, 0xBCAAA4); // 뼈
    g.generateTexture('meat_drop', 12, 12); g.clear();
    // 나무
    g.fillStyle(0x5D4037, 1); g.fillRoundedRect(1, 2, 10, 4, 1);
    g.fillStyle(0x795548, 1); g.fillRoundedRect(2, 6, 8, 4, 1);
    g.lineStyle(1, 0x4E342E); g.lineBetween(3, 4, 9, 4);
    g.generateTexture('wood_drop', 12, 12); g.clear();
    // 돌
    g.fillStyle(0x757575, 1); g.fillRoundedRect(1, 3, 10, 7, 3);
    g.fillStyle(0x9E9E9E, 1); g.fillRoundedRect(2, 4, 5, 4, 2);
    g.generateTexture('stone_drop', 12, 12); g.clear();
    // 가죽
    g.fillStyle(0xA1887F, 1); g.fillRoundedRect(1, 2, 10, 8, 2);
    g.fillStyle(0xBCAAA4, 1); g.fillRoundedRect(3, 3, 6, 6, 1);
    g.lineStyle(1, 0x8D6E63); g.lineBetween(4, 5, 8, 5); g.lineBetween(4, 7, 8, 7);
    g.generateTexture('leather_drop', 12, 12); g.clear();

    // ── 나무 리소스 (32x48) - 큰 침엽수 ──
    g.fillStyle(0x000000, 0.12); g.fillEllipse(16, 46, 20, 5);
    // 줄기
    g.fillStyle(0x5D4037, 1); g.fillRect(13, 32, 6, 14);
    g.fillStyle(0x4E342E, 1); g.fillRect(15, 32, 2, 14);
    // 나뭇잎 (3단 삼각형)
    g.fillStyle(0x2E7D32, 1);
    g.fillTriangle(16, 2, 4, 18, 28, 18);
    g.fillTriangle(16, 10, 2, 28, 30, 28);
    g.fillTriangle(16, 18, 0, 36, 32, 36);
    // 하이라이트
    g.fillStyle(0x4CAF50, 0.4);
    g.fillTriangle(16, 4, 10, 14, 22, 14);
    g.fillTriangle(16, 12, 8, 24, 24, 24);
    // 눈 쌓임
    g.fillStyle(0xFFFFFF, 0.7);
    g.fillTriangle(16, 2, 12, 8, 20, 8);
    g.fillEllipse(8, 18, 6, 3); g.fillEllipse(24, 18, 6, 3);
    g.generateTexture('tree_node', 32, 48); g.clear();

    // ── 바위 리소스 (28x24) ──
    g.fillStyle(0x000000, 0.12); g.fillEllipse(14, 22, 20, 4);
    // 큰 바위
    g.fillStyle(0x616161, 1); g.fillRoundedRect(2, 6, 24, 16, 6);
    // 디테일
    g.fillStyle(0x757575, 1); g.fillRoundedRect(4, 4, 12, 10, 4);
    g.fillStyle(0x9E9E9E, 1); g.fillRoundedRect(6, 6, 6, 5, 2);
    // 균열
    g.lineStyle(1, 0x424242, 0.5); g.lineBetween(14, 8, 20, 14); g.lineBetween(10, 12, 16, 18);
    // 눈
    g.fillStyle(0xFFFFFF, 0.5); g.fillEllipse(10, 5, 8, 3); g.fillEllipse(20, 7, 6, 2);
    g.generateTexture('rock_node', 28, 24); g.clear();

    // ── 기타 ──
    // 눈송이
    g.fillStyle(0xFFFFFF, 1); g.fillCircle(2, 2, 2);
    g.generateTexture('snowflake', 4, 4); g.clear();
    // 피격 파티클
    g.fillStyle(0xFF0000, 1); g.fillCircle(3, 3, 3);
    g.generateTexture('hit_particle', 6, 6); g.clear();
    // 골드 파티클
    g.fillStyle(0xFFD700, 1); g.fillCircle(4, 4, 4);
    g.fillStyle(0xFFF176, 1); g.fillCircle(3, 3, 2);
    g.generateTexture('gold_particle', 8, 8); g.clear();

    g.destroy();
    this.scene.start('Game');
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    // ── State ──
    this.res = { meat: 0, wood: 0, stone: 0, leather: 0, gold: 0 };
    this.playerHP = 15; this.playerMaxHP = 15;
    this.playerDamage = 1; this.playerSpeed = 150;
    this.warmthResist = 1; // multiplier (lower = less cold)
    this.woodBonus = 0; this.stoneBonus = 0;
    this.temperature = 100; this.maxTemp = 100;
    this.hunger = 100; this.maxHunger = 100;
    this.attackCooldown = 0;
    this.moveDir = { x: 0, y: 0 };
    this.npcsOwned = [];
    this.nextNPCIndex = 0;
    this.placedBuildings = [];
    this.gameOver = false;
    this.buildMode = null;
    this.storageCapacity = 50;
    this.isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || ('ontouchstart' in window);

    // Stats for quests
    this.stats = { kills: {}, woodGathered: 0, built: {}, crafted: 0, npcsHired: 0 };
    this.questIndex = 0;
    this.questCompleted = [];

    // ── World ──
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0xE0E4EC, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);
    for (let i = 0; i < 80; i++) {
      bg.fillStyle(Phaser.Math.Between(0, 1) ? 0xD0D4DD : 0xCDD1DA, 0.4);
      bg.fillCircle(Phaser.Math.Between(0, WORLD_W), Phaser.Math.Between(0, WORLD_H), Phaser.Math.Between(30, 100));
    }
    // Decorative snow mounds
    for (let i = 0; i < 40; i++) {
      bg.fillStyle(0xF0F0F5, 0.5);
      const sx = Phaser.Math.Between(0, WORLD_W), sy = Phaser.Math.Between(0, WORLD_H);
      bg.fillEllipse(sx, sy, Phaser.Math.Between(40, 120), Phaser.Math.Between(20, 40));
    }

    // ── Player ──
    this.player = this.physics.add.sprite(WORLD_W/2, WORLD_H/2, 'player');
    this.player.setCollideWorldBounds(true).setDepth(10).setDamping(true).setDrag(0.9);

    // ── Groups ──
    this.animals = this.physics.add.group();
    this.drops = this.physics.add.group();
    this.npcSprites = this.physics.add.group();
    this.resourceNodes = [];
    this.buildingSprites = [];

    // ── Camera ──
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    // ── Snow ──
    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: WORLD_W }, y: -10,
      lifespan: 8000, speedY: { min: 15, max: 45 }, speedX: { min: -15, max: 15 },
      scale: { min: 0.5, max: 2 }, alpha: { start: 0.7, end: 0 },
      frequency: 40, quantity: 1,
    }).setDepth(50);

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

  // ── Resource Nodes ──
  spawnResourceNodes() {
    const types = ['tree', 'tree', 'tree', 'rock', 'rock'];
    for (let i = 0; i < 60; i++) {
      const type = Phaser.Utils.Array.GetRandom(types);
      const x = Phaser.Math.Between(80, WORLD_W - 80);
      const y = Phaser.Math.Between(80, WORLD_H - 80);
      this.createResourceNode(type, x, y);
    }
  }

  createResourceNode(type, x, y) {
    const def = RESOURCE_NODES[type];
    const spr = this.add.sprite(x, y, `${type}_node`).setDepth(3);
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
    // Shake effect
    this.tweens.add({ targets: node, x: node.x + 3, duration: 50, yoyo: true, repeat: 2 });

    if (node.nodeHP <= 0) {
      const def = node.nodeDef;
      const amount = def.yield + (def.resource === 'wood' ? this.woodBonus : def.resource === 'stone' ? this.stoneBonus : 0);
      for (let i = 0; i < amount; i++) {
        this.spawnDrop(def.resource, node.x + Phaser.Math.Between(-20, 20), node.y + Phaser.Math.Between(-20, 20));
      }
      if (def.resource === 'wood') this.stats.woodGathered += amount;
      node.depleted = true;
      node.setAlpha(0.2);
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
    const side = Phaser.Math.Between(0, 3);
    const m = 60;
    let x, y;
    switch(side) {
      case 0: x = Phaser.Math.Between(m, WORLD_W-m); y = m; break;
      case 1: x = Phaser.Math.Between(m, WORLD_W-m); y = WORLD_H-m; break;
      case 2: x = m; y = Phaser.Math.Between(m, WORLD_H-m); break;
      default: x = WORLD_W-m; y = Phaser.Math.Between(m, WORLD_H-m);
    }
    const a = this.physics.add.sprite(x, y, type).setCollideWorldBounds(true).setDepth(5);
    a.animalType = type; a.def = def;
    a.hp = def.hp; a.maxHP = def.hp;
    a.wanderTimer = 0; a.wanderDir = {x:0,y:0};
    a.hitFlash = 0; a.atkCD = 0;
    if (def.hp > 1) a.hpBar = this.add.graphics().setDepth(6);
    this.animals.add(a);
    // overlap for drop collection by npc
    this.physics.add.overlap(this.player, a, () => {});
  }

  // ── Combat ──
  performAttack(pointer) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 0.35;
    const wx = pointer.worldX, wy = pointer.worldY;
    const range = 65;
    this.player.setTexture('player_attack');
    this.time.delayedCall(100, () => { if(this.player.active) this.player.setTexture('player'); });
    let hit = false;
    // Attack animals
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      if (Phaser.Math.Distance.Between(wx, wy, a.x, a.y) < range) {
        this.damageAnimal(a, this.playerDamage); hit = true;
      }
    });
    // Attack resource nodes
    this.resourceNodes.forEach(n => {
      if (n.depleted) return;
      if (Phaser.Math.Distance.Between(wx, wy, n.x, n.y) < range) {
        this.harvestNode(n); hit = true;
      }
    });
    this.showAttackFX(wx, wy, hit);
  }

  performAttackNearest() {
    if (this.attackCooldown > 0) return;
    const range = 80;
    let best = null, bestD = Infinity;
    // Check animals
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
      if (d < range && d < bestD) { best = a; bestD = d; }
    });
    // Check nodes
    let bestNode = null, bestND = Infinity;
    this.resourceNodes.forEach(n => {
      if (n.depleted) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
      if (d < range && d < bestND) { bestNode = n; bestND = d; }
    });

    this.attackCooldown = 0.35;
    this.player.setTexture('player_attack');
    this.time.delayedCall(100, () => { if(this.player.active) this.player.setTexture('player'); });

    if (best && bestD <= bestND) {
      this.damageAnimal(best, this.playerDamage);
      this.showAttackFX(best.x, best.y, true);
    } else if (bestNode) {
      this.harvestNode(bestNode);
      this.showAttackFX(bestNode.x, bestNode.y, true);
    } else {
      this.showAttackFX(this.player.x + (this.moveDir.x||0)*40, this.player.y + (this.moveDir.y||0)*40, false);
    }
  }

  damageAnimal(a, dmg) {
    a.hp -= dmg; a.hitFlash = 0.15; a.setTint(0xFF0000);
    const t = this.add.text(a.x, a.y-20, `-${dmg}`, {fontSize:'14px',fontFamily:'monospace',color:'#FF4444',stroke:'#000',strokeThickness:2}).setDepth(15).setOrigin(0.5);
    this.tweens.add({targets:t, y:t.y-30, alpha:0, duration:500, onComplete:()=>t.destroy()});
    if (a.hp <= 0) this.killAnimal(a);
  }

  killAnimal(a) {
    const def = a.def;
    // drops
    Object.entries(def.drops).forEach(([res, amt]) => {
      for (let i = 0; i < amt; i++) {
        const ang = Phaser.Math.FloatBetween(0, Math.PI*2);
        const dist = Phaser.Math.Between(15, 40);
        this.spawnDrop(res, a.x + Math.cos(ang)*dist, a.y + Math.sin(ang)*dist, a.x, a.y);
      }
    });
    // Track kills
    if (!this.stats.kills[a.animalType]) this.stats.kills[a.animalType] = 0;
    this.stats.kills[a.animalType]++;
    // Death FX
    const dg = this.add.graphics().setDepth(15);
    dg.fillStyle(0xFFFFFF, 0.6); dg.fillCircle(a.x, a.y, 5);
    this.tweens.add({targets:dg, alpha:0, duration:300,
      onUpdate:()=>{dg.clear();dg.fillStyle(0xFFFFFF,dg.alpha);dg.fillCircle(a.x,a.y,5+(1-dg.alpha)*20);},
      onComplete:()=>dg.destroy()});
    if (a.hpBar) a.hpBar.destroy();
    a.destroy();
  }

  spawnDrop(resource, tx, ty, ox, oy) {
    ox = ox || tx; oy = oy || ty;
    const texMap = { meat: 'meat_drop', wood: 'wood_drop', stone: 'stone_drop', leather: 'leather_drop' };
    const d = this.physics.add.sprite(ox, oy, texMap[resource] || 'meat_drop').setDepth(4);
    d.resource = resource; d.value = 1;
    d.body.setAllowGravity(false);
    this.drops.add(d);
    this.tweens.add({targets:d, x:tx, y:ty, duration:400, ease:'Bounce.Out'});
    this.tweens.add({targets:d, scale:{from:0.5,to:1.2}, yoyo:true, repeat:2, duration:200});
    this.physics.add.overlap(this.player, d, (_,drop) => this.collectDrop(drop));
  }

  collectDrop(drop) {
    if (!drop.active) return;
    const r = drop.resource;
    const total = Object.values(this.res).reduce((a,b)=>a+b, 0);
    if (total >= this.storageCapacity) {
      // Full - show message briefly
      if (!this._fullMsg || this._fullMsg < this.time.now) {
        const ft = this.add.text(this.player.x, this.player.y - 30, '보관함 가득!', {fontSize:'12px',fontFamily:'monospace',color:'#FF6666',stroke:'#000',strokeThickness:2}).setDepth(15).setOrigin(0.5);
        this.tweens.add({targets:ft, y:ft.y-20, alpha:0, duration:600, onComplete:()=>ft.destroy()});
        this._fullMsg = this.time.now + 1000;
      }
      return;
    }
    this.res[r] = (this.res[r]||0) + drop.value;
    const icons = {meat:'🥩',wood:'🪵',stone:'🪨',leather:'🧶'};
    const t = this.add.text(drop.x, drop.y, `+1${icons[r]||''}`, {fontSize:'13px',fontFamily:'monospace',color:'#FFFFFF',stroke:'#000',strokeThickness:2}).setDepth(15).setOrigin(0.5);
    this.tweens.add({targets:t, y:t.y-20, alpha:0, duration:400, onComplete:()=>t.destroy()});
    drop.destroy();
  }

  showAttackFX(x, y, hit) {
    const c = hit ? 0xFF4444 : 0xFFFFFF;
    const g = this.add.graphics().setDepth(15);
    g.lineStyle(2, c, 0.8); g.strokeCircle(x, y, 5);
    this.tweens.add({targets:g, alpha:0, duration:200,
      onUpdate:()=>{g.clear();g.lineStyle(2,c,g.alpha);g.strokeCircle(x,y,5+(1-g.alpha)*30);},
      onComplete:()=>g.destroy()});
    if (hit) for(let i=0;i<4;i++){
      const p=this.add.image(x,y,'hit_particle').setDepth(15);
      this.tweens.add({targets:p,x:x+Phaser.Math.Between(-25,25),y:y+Phaser.Math.Between(-25,25),alpha:0,duration:250,onComplete:()=>p.destroy()});
    }
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
            this.cameras.main.shake(80, 0.008);
            this.player.setTint(0xFF0000);
            this.time.delayedCall(100, ()=>{if(this.player.active)this.player.clearTint();});
            const dt2 = this.add.text(px,py-20,`-${a.def.damage}`,{fontSize:'16px',fontFamily:'monospace',color:'#FF0000',stroke:'#000',strokeThickness:2}).setDepth(15).setOrigin(0.5);
            this.tweens.add({targets:dt2,y:dt2.y-30,alpha:0,duration:500,onComplete:()=>dt2.destroy()});
            if (this.playerHP <= 0) this.endGame();
          }
        } else {
          this.wander(a, dt, 0.25);
        }
      } else { // wander
        this.wander(a, dt, 0.3);
      }

      // HP bar
      if (a.hpBar) {
        a.hpBar.clear();
        const bw=30, bx=a.x-bw/2, by=a.y-a.def.size-8;
        a.hpBar.fillStyle(0x333333,0.8); a.hpBar.fillRect(bx,by,bw,4);
        const r = a.hp/a.maxHP;
        a.hpBar.fillStyle(r>0.5?0x4CAF50:r>0.25?0xFFEB3B:0xF44336,1);
        a.hpBar.fillRect(bx,by,bw*r,4);
      }
    });
  }

  wander(a, dt, speedMul) {
    a.wanderTimer -= dt;
    if (a.wanderTimer <= 0) {
      a.wanderTimer = Phaser.Math.FloatBetween(1.5, 4);
      const ang = Phaser.Math.FloatBetween(0, Math.PI*2);
      a.wanderDir = { x: Math.cos(ang), y: Math.sin(ang) };
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
            const t = this.add.text(npc.x,npc.y-15,'💰+5',{fontSize:'13px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:2}).setDepth(15).setOrigin(0.5);
            this.tweens.add({targets:t,y:t.y-20,alpha:0,duration:500,onComplete:()=>t.destroy()});
          }
          break;
        }
      }

      // NPC auto-collect drops
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
    // Check cost
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

    const ht = this.add.text(npc.x,npc.y-20,`${def.name} 고용!`,{fontSize:'16px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:3}).setDepth(20).setOrigin(0.5);
    this.tweens.add({targets:ht,y:ht.y-40,alpha:0,duration:1000,onComplete:()=>ht.destroy()});
    for(let i=0;i<6;i++){const p=this.add.image(npc.x,npc.y,'gold_particle').setDepth(15);this.tweens.add({targets:p,x:npc.x+Phaser.Math.Between(-30,30),y:npc.y+Phaser.Math.Between(-30,30),alpha:0,duration:400,onComplete:()=>p.destroy()});}
  }

  // ── Building ──
  placeBuilding(pointer) {
    if (!this.buildMode) return;
    const def = BUILDINGS[this.buildMode];
    // Check cost
    for (const [r, amt] of Object.entries(def.cost)) {
      if ((this.res[r]||0) < amt) { this.showFloatingText(this.player.x, this.player.y-20, '자원 부족!', '#FF6666'); this.buildMode = null; return; }
    }
    for (const [r, amt] of Object.entries(def.cost)) this.res[r] -= amt;

    const wx = pointer.worldX, wy = pointer.worldY;
    const g = this.add.graphics().setDepth(2);
    // Draw building
    if (this.buildMode === 'campfire') {
      g.fillStyle(0xFF6600, 0.9); g.fillCircle(wx, wy, 12);
      g.fillStyle(0xFFCC00, 0.7); g.fillCircle(wx, wy, 7);
    } else if (this.buildMode === 'tent') {
      g.fillStyle(0x8B6914, 0.9); g.fillTriangle(wx, wy-20, wx-18, wy+10, wx+18, wy+10);
      g.fillStyle(0xA07B28, 0.7); g.fillTriangle(wx, wy-16, wx-14, wy+8, wx+14, wy+8);
    } else if (this.buildMode === 'storage') {
      g.fillStyle(0x9E9E9E, 0.9); g.fillRect(wx-14, wy-12, 28, 24);
      g.lineStyle(2, 0x757575); g.strokeRect(wx-14, wy-12, 28, 24);
    } else if (this.buildMode === 'workshop') {
      g.fillStyle(0x795548, 0.9); g.fillRect(wx-12, wy-10, 24, 20);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-3, wy, 6, 10);
    } else if (this.buildMode === 'wall') {
      g.fillStyle(0xAAAAAA, 0.9); g.fillRect(wx-16, wy-6, 32, 12);
    }

    const label = this.add.text(wx, wy-25, def.icon, {fontSize:'16px'}).setDepth(3).setOrigin(0.5);
    const bld = { type: this.buildMode, x: wx, y: wy, graphic: g, label, def };
    this.placedBuildings.push(bld);

    if (!this.stats.built[this.buildMode]) this.stats.built[this.buildMode] = 0;
    this.stats.built[this.buildMode]++;

    if (def.storageBonus) this.storageCapacity += def.storageBonus;

    this.showFloatingText(wx, wy - 30, `${def.name} 건설!`, '#4CAF50');
    this.buildMode = null;
  }

  // ── Crafting ──
  craftItem(key) {
    const recipe = RECIPES[key];
    for (const [r, amt] of Object.entries(recipe.cost)) {
      if ((this.res[r]||0) < amt) { this.showFloatingText(this.player.x, this.player.y-20, '재료 부족!', '#FF6666'); return; }
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
    this.showFloatingText(this.player.x, this.player.y - 30, `${recipe.icon} ${recipe.name} 제작!`, '#64B5F6');
  }

  // ── Survival ──
  updateSurvival(dt) {
    // Temperature decreases over time
    const tempLoss = 1.5 * this.warmthResist * dt;
    this.temperature = Math.max(0, this.temperature - tempLoss);

    // Near campfire/tent? Warm up
    this.placedBuildings.forEach(b => {
      if (!b.def.warmth) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
      if (d < 80) {
        this.temperature = Math.min(this.maxTemp, this.temperature + b.def.warmth * dt);
      }
    });

    // Hunger decreases
    this.hunger = Math.max(0, this.hunger - 0.8 * dt);

    // If temperature or hunger hits 0, lose HP
    if (this.temperature <= 0) {
      this.playerHP -= 2 * dt;
      if (this.playerHP <= 0) this.endGame();
    }
    if (this.hunger <= 0) {
      this.playerHP -= 1.5 * dt;
      if (this.playerHP <= 0) this.endGame();
    }

    // Eat meat to restore hunger (auto if low)
    if (this.hunger < 30 && this.res.meat > 0) {
      this.res.meat--;
      this.hunger = Math.min(this.maxHunger, this.hunger + 25);
      this.showFloatingText(this.player.x, this.player.y - 20, '🥩 섭취', '#FF9800');
    }
  }

  // ── Quests ──
  checkQuests() {
    if (this.questIndex >= QUESTS.length) return;
    const q = QUESTS[this.questIndex];
    if (q.check(this.stats)) {
      // Grant reward
      Object.entries(q.reward).forEach(([r, amt]) => this.res[r] = (this.res[r]||0) + amt);
      this.questCompleted.push(q.id);
      this.questIndex++;
      this.showFloatingText(this.player.x, this.player.y - 40, `✅ ${q.name} 완료!`, '#FFD700');
    }
  }

  interactNearest() {
    // E key: eat meat or interact
    if (this.res.meat > 0 && this.hunger < 80) {
      this.res.meat--;
      this.hunger = Math.min(this.maxHunger, this.hunger + 25);
      this.playerHP = Math.min(this.playerMaxHP, this.playerHP + 2);
      this.showFloatingText(this.player.x, this.player.y - 20, '🥩 회복!', '#4CAF50');
    }
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {fontSize:'14px',fontFamily:'monospace',color:color,stroke:'#000',strokeThickness:2}).setDepth(20).setOrigin(0.5);
    this.tweens.add({targets:t, y:t.y-30, alpha:0, duration:800, onComplete:()=>t.destroy()});
  }

  // ── Joystick (mobile) ──
  createJoystick() {
    this.joystickBase = this.add.image(0,0,'snowflake').setScrollFactor(0).setDepth(100).setAlpha(0).setScale(25);
    this.joystickThumb = this.add.image(0,0,'snowflake').setScrollFactor(0).setDepth(101).setAlpha(0).setScale(12);
    this.joystickActive = false; this.joystickPID = null;

    this.input.on('pointerdown', p => {
      if (this.gameOver || this.isUIArea(p)) return;
      if (p.x < this.cameras.main.width * 0.4 && p.y > this.cameras.main.height * 0.4) {
        this.joystickActive = true; this.joystickPID = p.id;
        this.joystickBase.setPosition(p.x, p.y).setAlpha(0.15);
        this.joystickThumb.setPosition(p.x, p.y).setAlpha(0.3);
        this.joyOrigin = {x:p.x, y:p.y};
      }
    });
    this.input.on('pointermove', p => {
      if (!this.joystickActive || p.id !== this.joystickPID) return;
      const dx=p.x-this.joyOrigin.x, dy=p.y-this.joyOrigin.y;
      const dist=Math.sqrt(dx*dx+dy*dy), max=50, clamp=Math.min(dist,max), ang=Math.atan2(dy,dx);
      this.joystickThumb.setPosition(this.joyOrigin.x+Math.cos(ang)*clamp, this.joyOrigin.y+Math.sin(ang)*clamp);
      if(dist>8){this.moveDir.x=Math.cos(ang);this.moveDir.y=Math.sin(ang);}else{this.moveDir.x=0;this.moveDir.y=0;}
    });
    this.input.on('pointerup', p => {
      if(p.id===this.joystickPID){this.joystickActive=false;this.joystickPID=null;this.joystickBase.setAlpha(0);this.joystickThumb.setAlpha(0);this.moveDir.x=0;this.moveDir.y=0;}
    });
  }

  isJoystickArea(p) {
    return p.x < this.cameras.main.width * 0.4 && p.y > this.cameras.main.height * 0.4;
  }

  // ── UI ──
  createUI() {
    const s = {fontSize:'14px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:3};
    const sb = {...s, fontSize:'12px'};

    // Top bar
    this.uiRes = this.add.text(8, 8, '', s).setScrollFactor(0).setDepth(100);
    this.uiHP = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.uiHPText = this.add.text(8, 28, '', sb).setScrollFactor(0).setDepth(101);
    this.uiTemp = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.uiTempText = this.add.text(8, 44, '', sb).setScrollFactor(0).setDepth(101);
    this.uiHunger = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.uiHungerText = this.add.text(8, 60, '', sb).setScrollFactor(0).setDepth(101);

    // Quest
    this.uiQuest = this.add.text(8, 82, '', {...sb, color:'#FFD700', wordWrap:{width:200}}).setScrollFactor(0).setDepth(100);

    // Bottom buttons
    this.uiBtns = [];
    const btnData = [
      { label: '⚔️', action: () => this.performAttackNearest(), mobile: true },
      { label: '🔥건설', action: () => this.toggleBuildMenu() },
      { label: '🔨제작', action: () => this.toggleCraftMenu() },
      { label: '👥고용', action: () => this.toggleHireMenu() },
      { label: '🥩먹기', action: () => this.interactNearest() },
    ];

    btnData.forEach((bd, i) => {
      if (bd.mobile && !this.isMobile) return;
      const btn = this.add.text(0, 0, bd.label, {
        fontSize: '16px', fontFamily: 'monospace', color: '#fff', backgroundColor: '#333a',
        padding: { x: 10, y: 8 }, stroke: '#000', strokeThickness: 1,
      }).setScrollFactor(0).setDepth(100).setInteractive();
      btn.on('pointerdown', bd.action);
      this.uiBtns.push(btn);
    });

    // Panels (hidden by default)
    this.panelBg = this.add.graphics().setScrollFactor(0).setDepth(110).setVisible(false);
    this.panelTexts = [];
    this.panelZones = [];
    this.activePanel = null;

    // NPC labels container
    this.npcLabels = [];

    this.positionUI();
    this.scale.on('resize', () => this.positionUI());
  }

  positionUI() {
    const w = this.cameras.main.width, h = this.cameras.main.height;
    // Bottom buttons
    const totalBtns = this.uiBtns.length;
    const btnW = 70, gap = 6;
    const startX = w - (totalBtns * (btnW + gap));
    this.uiBtns.forEach((btn, i) => {
      btn.setPosition(startX + i * (btnW + gap), h - 44);
    });
  }

  isUIArea(p) {
    // Bottom 50px right side
    const h = this.cameras.main.height, w = this.cameras.main.width;
    if (p.y > h - 55 && p.x > w * 0.4) return true;
    // Panel area
    if (this.activePanel && p.x > w - 220 && p.y > 80 && p.y < h - 60) return true;
    return false;
  }

  toggleBuildMenu() { this.showPanel('build'); }
  toggleCraftMenu() { this.showPanel('craft'); }
  toggleHireMenu() { this.showPanel('hire'); }

  showPanel(type) {
    // Clear existing
    this.clearPanel();
    if (this.activePanel === type) { this.activePanel = null; return; }
    this.activePanel = type;

    const w = this.cameras.main.width, h = this.cameras.main.height;
    const px = w - 210, py = 80, pw = 200;

    let items = [];
    if (type === 'build') {
      items = Object.entries(BUILDINGS).map(([k, v]) => ({
        key: k, label: `${v.icon} ${v.name}`,
        sub: Object.entries(v.cost).map(([r,a])=>`${r}:${a}`).join(' '),
        desc: v.desc,
        action: () => { this.buildMode = k; this.clearPanel(); this.activePanel = null;
          this.showFloatingText(this.player.x, this.player.y-20, '클릭으로 설치', '#AAFFAA'); }
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

    this.panelBg.setVisible(true);
    this.panelBg.clear();
    this.panelBg.fillStyle(0x1a1a2e, 0.9);
    this.panelBg.fillRoundedRect(px, py, pw, items.length * 55 + 10, 8);
    this.panelBg.lineStyle(1, 0x4444aa, 0.5);
    this.panelBg.strokeRoundedRect(px, py, pw, items.length * 55 + 10, 8);

    items.forEach((item, i) => {
      const iy = py + 8 + i * 55;
      const t1 = this.add.text(px+8, iy, item.label, {fontSize:'14px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:2}).setScrollFactor(0).setDepth(111);
      const t2 = this.add.text(px+8, iy+18, item.sub, {fontSize:'10px',fontFamily:'monospace',color:'#aaa'}).setScrollFactor(0).setDepth(111);
      const t3 = this.add.text(px+8, iy+32, item.desc, {fontSize:'10px',fontFamily:'monospace',color:'#8f8'}).setScrollFactor(0).setDepth(111);
      this.panelTexts.push(t1, t2, t3);

      const zone = this.add.zone(px + pw/2, iy + 25, pw, 50).setScrollFactor(0).setDepth(112).setInteractive();
      zone.on('pointerdown', item.action);
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

  drawBar(g, x, y, w, h, ratio, color) {
    g.fillStyle(0x222222, 0.8); g.fillRect(x, y, w, h);
    g.fillStyle(color, 1); g.fillRect(x+1, y+1, (w-2)*Math.max(0,ratio), h-2);
  }

  updateUI() {
    const icons = {meat:'🥩',wood:'🪵',stone:'🪨',leather:'🧶',gold:'💰'};
    this.uiRes.setText(Object.entries(this.res).filter(([_,v])=>v>0).map(([k,v])=>`${icons[k]||k}${v}`).join(' '));

    this.uiHP.clear();
    this.drawBar(this.uiHP, 8, 28, 140, 12, this.playerHP/this.playerMaxHP, 0xF44336);
    this.uiHPText.setText(`❤️ ${Math.ceil(Math.max(0,this.playerHP))}/${this.playerMaxHP}`);

    this.uiTemp.clear();
    this.drawBar(this.uiTemp, 8, 44, 140, 12, this.temperature/this.maxTemp, 0x42A5F5);
    this.uiTempText.setText(`🌡️ ${Math.ceil(this.temperature)}%`);

    this.uiHunger.clear();
    this.drawBar(this.uiHunger, 8, 60, 140, 12, this.hunger/this.maxHunger, 0xFF9800);
    this.uiHungerText.setText(`🍖 ${Math.ceil(this.hunger)}%`);

    // Quest
    if (this.questIndex < QUESTS.length) {
      const q = QUESTS[this.questIndex];
      this.uiQuest.setText(`📋 ${q.name}\n   ${q.desc}`);
    } else {
      this.uiQuest.setText('📋 모든 퀘스트 완료!');
    }

    // NPC labels
    this.npcLabels.forEach(l => l.destroy());
    this.npcLabels = [];
    this.npcsOwned.forEach(npc => {
      if (!npc.active) return;
      const l = this.add.text(npc.x, npc.y-18, npc.npcDef.name, {fontSize:'9px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:2}).setDepth(12).setOrigin(0.5);
      this.npcLabels.push(l);
    });
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    const cam = this.cameras.main;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(200);
    ov.fillStyle(0x000000,0.75); ov.fillRect(0,0,cam.width,cam.height);

    this.add.text(cam.width/2, cam.height/2-60, '💀 사망', {fontSize:'36px',fontFamily:'monospace',color:'#FF4444',stroke:'#000',strokeThickness:4}).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    const kills = Object.entries(this.stats.kills).map(([k,v])=>`${ANIMALS[k]?.name||k}: ${v}`).join(', ') || '없음';
    const txt = `사냥: ${kills}\n건설: ${Object.values(this.stats.built).reduce((a,b)=>a+b,0)}개\n제작: ${this.stats.crafted}개\nNPC: ${this.stats.npcsHired}명\n퀘스트: ${this.questCompleted.length}/${QUESTS.length}`;
    this.add.text(cam.width/2, cam.height/2+10, txt, {fontSize:'16px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:2,align:'center',lineSpacing:6}).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    const rb = this.add.text(cam.width/2, cam.height/2+110, '🔄 다시 시작', {fontSize:'22px',fontFamily:'monospace',color:'#4CAF50',stroke:'#000',strokeThickness:3,backgroundColor:'#333',padding:{x:16,y:8}}).setScrollFactor(0).setDepth(201).setOrigin(0.5).setInteractive();
    rb.on('pointerdown', () => this.scene.restart());
  }

  // ── Main Update ──
  update(time, deltaMs) {
    if (this.gameOver) return;
    const dt = deltaMs / 1000;

    // Attack cooldown
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    // Mobile auto-attack: automatically attack nearest animal within 48px
    if (this.isMobile && this.attackCooldown <= 0) {
      let nearest = null, nearestDist = Infinity;
      this.animals.getChildren().forEach(a => {
        if (!a.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
        if (d < 48 && d < nearestDist) { nearest = a; nearestDist = d; }
      });
      if (nearest) {
        this.attackCooldown = 0.4;
        this.player.setTexture('player_attack');
        this.time.delayedCall(100, () => { if (this.player.active) this.player.setTexture('player'); });
        this.damageAnimal(nearest, this.playerDamage);
        this.showAttackFX(nearest.x, nearest.y, true);
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
    this.player.body.setVelocity(this.moveDir.x*this.playerSpeed, this.moveDir.y*this.playerSpeed);

    // Animal AI
    this.updateAnimalAI(dt);

    // NPC AI
    this.updateNPCs(dt);

    // Survival
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
        if (this.stats.kills.wolf >= 2 || (this.stats.kills.bear||0) >= 1) types.push('bear');
        for (let i = 0; i < 3; i++) this.spawnAnimal(Phaser.Utils.Array.GetRandom(types));
      }
    }

    // Drop magnet
    this.drops.getChildren().forEach(d => {
      if(!d.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x,this.player.y,d.x,d.y);
      if(dist<50){
        const a=Phaser.Math.Angle.Between(d.x,d.y,this.player.x,this.player.y);
        d.x+=Math.cos(a)*180*dt; d.y+=Math.sin(a)*180*dt;
        if(dist<15) this.collectDrop(d);
      }
    });

    // Quests
    this.checkQuests();

    // UI
    this.updateUI();
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1a1a2e',
  physics: { default: 'arcade', arcade: { gravity:{y:0}, debug:false } },
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, GameScene],
  input: { activePointers: 3 },
};

new Phaser.Game(config);
