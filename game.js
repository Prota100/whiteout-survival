// Whiteout Survival - ULTIMATE with Sound FX
// All feedback applied: mobile, balance, visuals, campfire, buildings, SOUND

// ═══ 🔊 SOUND ENGINE ═══
let audioCtx=null,soundEnabled=true,fireAmbSrc=null;
function initAudio(){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){soundEnabled=false}}
function resumeAudio(){if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume()}
function _osc(type,f1,f2,dur,vol){if(!audioCtx||!soundEnabled)return;const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g).connect(audioCtx.destination);o.start(t);o.stop(t+dur)}
function _noise(dur,vol,decay){if(!audioCtx||!soundEnabled)return;const t=audioCtx.currentTime,bs=Math.floor(audioCtx.sampleRate*dur),b=audioCtx.createBuffer(1,bs,audioCtx.sampleRate),d=b.getChannelData(0);for(let i=0;i<bs;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/bs,decay);const s=audioCtx.createBufferSource(),g=audioCtx.createGain();s.buffer=b;g.gain.value=vol;s.connect(g).connect(audioCtx.destination);s.start(t)}
function _arp(type,freqs,gap,vol,dur){if(!audioCtx||!soundEnabled)return;const t=audioCtx.currentTime;freqs.forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,t+i*gap);g.gain.exponentialRampToValueAtTime(0.001,t+i*gap+dur);o.connect(g).connect(audioCtx.destination);o.start(t+i*gap);o.stop(t+i*gap+dur)})}
function playSlash(){_osc('sawtooth',1200,200,0.12,0.25)}
function playHit(){_noise(0.06,0.5,1.5);_osc('sine',150,40,0.1,0.3)}
function playKill(){_osc('triangle',600,80,0.3,0.2);_noise(0.08,0.4,3)}
function playCoin(){_osc('sine',880,1760,0.12,0.15)}
function playChop(){_osc('square',300,100,0.08,0.15)}
function playBuild(){_arp('sine',[440,554,659],0.08,0.12,0.15)}
function playCraft(){_arp('triangle',[523,659,784,1047],0.06,0.1,0.12)}
function playHire(){_arp('sine',[392,494,587,784],0.1,0.15,0.2)}
function playHurt(){_osc('sawtooth',200,80,0.15,0.2)}
function playEat(){_arp('sine',[200,250,300],0.06,0.08,0.06)}
function playQuest(){_arp('sine',[523,659,784,1047,1319],0.08,0.12,0.25)}
function playDeath(){_arp('sawtooth',[400,300,200,100],0.15,0.15,0.3)}
function playWhiff(){_osc('sine',800,400,0.06,0.06)}
function startFire(){if(!audioCtx||!soundEnabled||fireAmbSrc)return;const bs=Math.floor(audioCtx.sampleRate*2),b=audioCtx.createBuffer(1,bs,audioCtx.sampleRate),d=b.getChannelData(0);for(let i=0;i<bs;i++){d[i]=(Math.random()*2-1)*0.03;if(Math.random()<0.002)d[i]*=8}const s=audioCtx.createBufferSource(),g=audioCtx.createGain();s.buffer=b;s.loop=true;g.gain.value=0.12;s.connect(g).connect(audioCtx.destination);s.start();fireAmbSrc={s,g}}
function stopFire(){if(fireAmbSrc){try{fireAmbSrc.s.stop()}catch(e){}fireAmbSrc=null}}
// ═══ END SOUND ═══

const WORLD_W = 2400;
const WORLD_H = 2400;

// ── Animal Definitions (REBALANCED) ──
const ANIMALS = {
  rabbit:  { hp: 2,  speed: 25,  damage: 0, drops: { meat: 1 }, size: 16, behavior: 'flee', name: '🐰 토끼', aggroRange: 80, fleeRange: 60, fleeDistance: 80, color: 0xFFEEDD },
  deer:    { hp: 4,  speed: 30,  damage: 0, drops: { meat: 2, leather: 1 }, size: 18, behavior: 'flee', name: '🦌 사슴', aggroRange: 120, fleeRange: 90, fleeDistance: 100, color: 0xC4A46C },
  penguin: { hp: 3,  speed: 18,  damage: 0, drops: { meat: 1 }, size: 16, behavior: 'wander', name: '🐧 펭귄', aggroRange: 0, fleeRange: 0, fleeDistance: 0, color: 0x222222 },
  seal:    { hp: 5,  speed: 12,  damage: 0, drops: { meat: 2, leather: 2 }, size: 20, behavior: 'wander', name: '🦭 물개', aggroRange: 0, fleeRange: 0, fleeDistance: 0, color: 0x7B8D9E },
  wolf:    { hp: 6,  speed: 65,  damage: 1, drops: { meat: 3, leather: 1 }, size: 18, behavior: 'chase', name: '🐺 늑대', aggroRange: 160, fleeRange: 0, fleeDistance: 0, color: 0x666677 },
  bear:    { hp: 15, speed: 45,  damage: 3, drops: { meat: 6, leather: 3 }, size: 26, behavior: 'chase', name: '🐻 곰', aggroRange: 140, fleeRange: 0, fleeDistance: 0, color: 0xF0EEE8 },
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

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  
  create() {
    initAudio();
    this.createPlayerTexture();
    this.createPlayerAttackTexture();
    this.createRabbitTexture();
    this.createDeerTexture();
    this.createPenguinTexture();
    this.createSealTexture();
    this.createWolfTexture();
    this.createBearTexture();
    this.createNPCTextures();
    this.createTreeTexture();
    this.createRockTexture();
    this.createDropTextures();
    this.createParticleTextures();
    this.scene.start('Game');
  }

  createPlayerTexture() {
    const g = this.add.graphics();
    const s = 40;
    g.fillStyle(0xCC2222, 1);
    g.fillRect(12, 2, 16, 8);
    g.fillRect(11, 5, 18, 4);
    g.fillStyle(0xFFDDBB, 1);
    g.fillRect(13, 10, 14, 9);
    g.fillStyle(0x222222, 1);
    g.fillRect(16, 13, 3, 3);
    g.fillRect(22, 13, 3, 3);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(17, 13, 1, 1);
    g.fillRect(23, 13, 1, 1);
    g.fillStyle(0xDD8866, 1);
    g.fillRect(17, 17, 6, 1);
    g.fillStyle(0x2299CC, 1);
    g.fillRect(11, 19, 18, 12);
    g.fillStyle(0xEEDDCC, 1);
    g.fillRect(11, 19, 18, 3);
    g.fillRect(11, 19, 3, 12);
    g.fillRect(26, 19, 3, 12);
    g.fillStyle(0x2299CC, 1);
    g.fillRect(7, 20, 4, 9);
    g.fillRect(29, 20, 4, 9);
    g.fillStyle(0x884422, 1);
    g.fillRect(7, 29, 4, 3);
    g.fillRect(29, 29, 4, 3);
    g.fillStyle(0x555566, 1);
    g.fillRect(13, 31, 6, 6);
    g.fillRect(21, 31, 6, 6);
    g.fillStyle(0x664422, 1);
    g.fillRect(12, 36, 7, 4);
    g.fillRect(21, 36, 7, 4);
    g.generateTexture('player', s, s);
    g.destroy();
  }

  createPlayerAttackTexture() {
    const g = this.add.graphics();
    const s = 44;
    g.fillStyle(0xCC2222, 1);
    g.fillRect(14, 2, 16, 8);
    g.fillRect(13, 5, 18, 4);
    g.fillStyle(0xFFDDBB, 1);
    g.fillRect(15, 10, 14, 9);
    g.fillStyle(0x222222, 1);
    g.fillRect(18, 13, 3, 3);
    g.fillRect(24, 13, 3, 3);
    g.fillStyle(0xDD8866, 1);
    g.fillRect(19, 17, 6, 1);
    g.fillStyle(0x2299CC, 1);
    g.fillRect(13, 19, 18, 12);
    g.fillStyle(0xEEDDCC, 1);
    g.fillRect(13, 19, 18, 3);
    g.fillStyle(0x2299CC, 1);
    g.fillRect(31, 18, 10, 4);
    g.fillRect(10, 20, 4, 9);
    g.fillStyle(0xAAAAAA, 1);
    g.fillRect(38, 12, 3, 10);
    g.fillStyle(0x884422, 1);
    g.fillRect(37, 21, 5, 3);
    g.fillStyle(0x555566, 1);
    g.fillRect(15, 31, 6, 6);
    g.fillRect(23, 31, 6, 6);
    g.fillStyle(0x664422, 1);
    g.fillRect(14, 36, 7, 4);
    g.fillRect(23, 36, 7, 4);
    g.generateTexture('player_attack', s, s);
    g.destroy();
  }

  createRabbitTexture() {
    const g = this.add.graphics();
    const sz = 28;
    g.fillStyle(0xFFEEDD, 1);
    g.fillRoundedRect(7, 12, 14, 12, 5);
    g.fillRoundedRect(9, 6, 10, 8, 4);
    g.fillStyle(0xEEDDBB, 1);
    g.fillRect(10, 0, 3, 8);
    g.fillRect(15, 0, 3, 8);
    g.fillStyle(0xFFAAAA, 1);
    g.fillRect(11, 1, 1, 5);
    g.fillRect(16, 1, 1, 5);
    g.fillStyle(0x000000, 1);
    g.fillCircle(12, 9, 1.5);
    g.fillCircle(16, 9, 1.5);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(12, 8, 1, 1);
    g.fillRect(16, 8, 1, 1);
    g.fillStyle(0xFF8899, 1);
    g.fillRect(13, 11, 2, 2);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(7, 18, 3);
    g.fillStyle(0xEEDDBB, 1);
    g.fillRect(8, 23, 4, 3);
    g.fillRect(16, 23, 4, 3);
    g.generateTexture('rabbit', sz, sz);
    g.destroy();
  }

  createDeerTexture() {
    const g = this.add.graphics();
    const sz = 32;
    g.fillStyle(0xC4A46C, 1);
    g.fillRoundedRect(7, 14, 18, 12, 4);
    g.fillRoundedRect(9, 6, 14, 10, 4);
    g.fillStyle(0x8B6914, 1);
    g.fillRect(11, 1, 2, 6);
    g.fillRect(19, 1, 2, 6);
    g.fillRect(9, 2, 2, 3);
    g.fillRect(21, 2, 2, 3);
    g.fillStyle(0x000000, 1);
    g.fillCircle(13, 9, 1.5);
    g.fillCircle(19, 9, 1.5);
    g.fillStyle(0x333333, 1);
    g.fillRect(15, 12, 2, 2);
    g.fillStyle(0xE8D8B8, 1);
    g.fillRect(11, 22, 10, 3);
    g.fillStyle(0xA08050, 1);
    g.fillRect(10, 25, 3, 6);
    g.fillRect(19, 25, 3, 6);
    g.fillStyle(0x444444, 1);
    g.fillRect(10, 30, 3, 2);
    g.fillRect(19, 30, 3, 2);
    g.generateTexture('deer', sz, sz);
    g.destroy();
  }

  createPenguinTexture() {
    const g = this.add.graphics();
    const sz = 28;
    g.fillStyle(0x222222, 1);
    g.fillRoundedRect(7, 4, 14, 18, 5);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRoundedRect(9, 8, 10, 12, 4);
    g.fillCircle(11, 6, 2.5);
    g.fillCircle(17, 6, 2.5);
    g.fillStyle(0x000000, 1);
    g.fillCircle(11, 6, 1);
    g.fillCircle(17, 6, 1);
    g.fillStyle(0xFF8800, 1);
    g.fillRect(12, 9, 4, 3);
    g.fillRect(8, 22, 5, 3);
    g.fillRect(15, 22, 5, 3);
    g.fillStyle(0x333333, 1);
    g.fillRect(4, 9, 3, 8);
    g.fillRect(21, 9, 3, 8);
    g.generateTexture('penguin', sz, sz);
    g.destroy();
  }

  createSealTexture() {
    const g = this.add.graphics();
    const sz = 32;
    g.fillStyle(0x7B8D9E, 1);
    g.fillEllipse(16, 14, 28, 16);
    g.fillStyle(0x8B9DAE, 1);
    g.fillCircle(7, 12, 7);
    g.fillStyle(0x000000, 1);
    g.fillCircle(5, 10, 1.5);
    g.fillStyle(0x333333, 1);
    g.fillCircle(3, 13, 1.5);
    g.fillStyle(0x6B7D8E, 1);
    g.fillEllipse(26, 16, 8, 5);
    g.fillStyle(0x9BAABB, 0.5);
    g.fillEllipse(16, 16, 20, 8);
    g.generateTexture('seal', sz, sz);
    g.destroy();
  }

  createWolfTexture() {
    const g = this.add.graphics();
    const sz = 32;
    g.fillStyle(0x555566, 1);
    g.fillRoundedRect(6, 12, 20, 12, 4);
    g.fillStyle(0x666677, 1);
    g.fillRoundedRect(3, 5, 14, 10, 4);
    g.fillStyle(0x777788, 1);
    g.fillRect(1, 8, 5, 5);
    g.fillStyle(0x444455, 1);
    g.fillTriangle(5, 0, 3, 6, 9, 6);
    g.fillTriangle(14, 0, 11, 6, 17, 6);
    g.fillStyle(0xFF3333, 1);
    g.fillCircle(7, 8, 2);
    g.fillCircle(13, 8, 2);
    g.fillStyle(0xFFFF00, 1);
    g.fillCircle(7, 7, 0.8);
    g.fillCircle(13, 7, 0.8);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(2, 12, 2, 3);
    g.fillRect(5, 12, 2, 3);
    g.fillStyle(0x222222, 1);
    g.fillRect(1, 9, 2, 2);
    g.fillStyle(0x444455, 1);
    g.fillRect(26, 10, 5, 3);
    g.fillRect(29, 8, 3, 3);
    g.fillRect(9, 23, 3, 6);
    g.fillRect(14, 23, 3, 6);
    g.fillRect(21, 23, 3, 6);
    g.fillStyle(0x333344, 1);
    g.fillRect(8, 28, 4, 3);
    g.fillRect(13, 28, 4, 3);
    g.fillRect(20, 28, 4, 3);
    g.generateTexture('wolf', sz, sz);
    g.destroy();
  }

  createBearTexture() {
    const g = this.add.graphics();
    const sz = 44;
    g.fillStyle(0xF0EEE8, 1);
    g.fillRoundedRect(6, 14, 32, 20, 10);
    g.fillStyle(0xF5F3EE, 1);
    g.fillCircle(22, 12, 12);
    g.fillStyle(0xE0DDD5, 1);
    g.fillCircle(13, 3, 4);
    g.fillCircle(31, 3, 4);
    g.fillStyle(0xDDBBAA, 1);
    g.fillCircle(13, 3, 2);
    g.fillCircle(31, 3, 2);
    g.fillStyle(0x222222, 1);
    g.fillCircle(17, 11, 2);
    g.fillCircle(27, 11, 2);
    g.fillStyle(0x333333, 1);
    g.fillCircle(22, 16, 3);
    g.lineStyle(1, 0x666666, 0.5);
    g.lineBetween(22, 18, 19, 20);
    g.lineBetween(22, 18, 25, 20);
    g.fillStyle(0xE8E5DD, 1);
    g.fillRoundedRect(9, 32, 8, 10, 4);
    g.fillRoundedRect(27, 32, 8, 10, 4);
    g.fillStyle(0xDDDAD2, 1);
    g.fillRoundedRect(8, 38, 10, 5, 3);
    g.fillRoundedRect(26, 38, 10, 5, 3);
    g.fillStyle(0x888888, 1);
    for (let i = 0; i < 3; i++) {
      g.fillRect(9 + i*3, 42, 1, 2);
      g.fillRect(27 + i*3, 42, 1, 2);
    }
    g.generateTexture('bear', sz, sz);
    g.destroy();
  }

  createNPCTextures() {
    let g = this.add.graphics();
    g.fillStyle(0x8B6914, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0xFFDDBB, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x6B4914, 1); g.fillRect(11, 3, 10, 5);
    g.fillStyle(0x222222, 1); g.fillRect(14, 9, 1, 1); g.fillRect(17, 9, 1, 1);
    g.lineStyle(2, 0x884422, 1);
    g.beginPath(); g.arc(25, 15, 8, -1.2, 1.2); g.strokePath();
    g.lineStyle(1, 0xCCCCCC, 1); g.lineBetween(25, 7, 25, 23);
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_hunter', 32, 32); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0xEEDDCC, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0xFFDDBB, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x44AA44, 1); g.fillRect(11, 2, 10, 5);
    g.fillStyle(0xFFFFFF, 1); g.fillRect(10, 15, 12, 2);
    g.fillStyle(0x222222, 1); g.fillRect(14, 9, 1, 1); g.fillRect(17, 9, 1, 1);
    g.fillStyle(0xDD8866, 1); g.fillRect(14, 11, 4, 1);
    g.fillStyle(0xFFDD00, 1); g.fillCircle(25, 20, 4);
    g.fillStyle(0xFFAA00, 1); g.fillCircle(25, 20, 2);
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_merchant', 32, 32); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0x66AA44, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0xFFDDBB, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x558833, 1); g.fillRect(11, 3, 10, 5);
    g.fillStyle(0x222222, 1); g.fillRect(14, 9, 1, 1); g.fillRect(17, 9, 1, 1);
    g.fillStyle(0x884422, 1); g.fillRect(5, 12, 2, 14);
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_gatherer', 32, 32); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0x3366AA, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0x4477BB, 1); g.fillRect(10, 15, 12, 3);
    g.fillStyle(0xFFDDBB, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x5588CC, 1); g.fillRect(11, 3, 10, 4);
    g.fillStyle(0x222222, 1); g.fillRect(14, 9, 1, 1); g.fillRect(17, 9, 1, 1);
    g.fillStyle(0xCCCCCC, 1); g.fillRect(24, 8, 2, 14);
    g.fillStyle(0x884422, 1); g.fillRect(23, 21, 4, 3);
    g.fillStyle(0x3355AA, 1); g.fillRoundedRect(2, 14, 8, 10, 2);
    g.fillStyle(0xFFDD00, 1); g.fillCircle(6, 19, 2);
    g.fillStyle(0x555566, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_warrior', 32, 32); g.destroy();
  }

  createTreeTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x5D4037, 1); g.fillRect(20, 44, 8, 20);
    g.fillStyle(0xEEEEFF, 0.4); g.fillRect(20, 44, 4, 6);
    g.fillStyle(0x1B5E20, 1); g.fillTriangle(24, 4, 4, 34, 44, 34);
    g.fillStyle(0x2E7D32, 1); g.fillTriangle(24, 14, 8, 40, 40, 40);
    g.fillStyle(0x388E3C, 1); g.fillTriangle(24, 24, 10, 48, 38, 48);
    g.fillStyle(0xFFFFFF, 0.6); g.fillTriangle(24, 4, 14, 18, 34, 18);
    g.fillStyle(0xFFFFFF, 0.3); g.fillRect(10, 38, 28, 3);
    g.generateTexture('tree_node', 48, 64);
    g.destroy();
  }

  createRockTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x666666, 1); g.fillRoundedRect(2, 6, 24, 16, 6);
    g.fillStyle(0x888888, 1); g.fillRoundedRect(4, 4, 14, 10, 5);
    g.fillStyle(0x999999, 0.6); g.fillRoundedRect(6, 6, 8, 6, 3);
    g.fillStyle(0xFFFFFF, 0.5); g.fillRoundedRect(4, 3, 16, 4, 3);
    g.lineStyle(1, 0x444444, 0.4); g.lineBetween(10, 8, 14, 16); g.lineBetween(18, 6, 20, 14);
    g.generateTexture('rock_node', 28, 24);
    g.destroy();
  }

  createDropTextures() {
    let g = this.add.graphics();
    g.fillStyle(0xCC4422, 1); g.fillRoundedRect(3, 3, 18, 14, 5);
    g.fillStyle(0xEE6644, 1); g.fillRoundedRect(5, 5, 14, 8, 4);
    g.fillStyle(0xFFAA88, 0.6); g.fillRoundedRect(7, 6, 4, 4, 2);
    g.fillStyle(0xEEDDCC, 1); g.fillRect(1, 8, 4, 3); g.fillCircle(2, 8, 2); g.fillCircle(2, 11, 2);
    g.generateTexture('meat_drop', 24, 20); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0x8B6914, 1); g.fillRect(4, 2, 6, 18);
    g.fillStyle(0xA07B28, 1); g.fillRect(5, 3, 4, 16);
    g.fillStyle(0x7B5914, 1); g.fillRect(4, 2, 6, 2); g.fillRect(4, 18, 6, 2);
    g.generateTexture('wood_drop', 14, 22); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0x888888, 1); g.fillRoundedRect(2, 4, 14, 10, 4);
    g.fillStyle(0xAAAAAA, 0.6); g.fillRoundedRect(4, 5, 6, 5, 3);
    g.generateTexture('stone_drop', 18, 18); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0xC4A46C, 1); g.fillRoundedRect(2, 2, 14, 14, 3);
    g.fillStyle(0xB09458, 0.6); g.fillRect(4, 4, 10, 10);
    g.generateTexture('leather_drop', 18, 18); g.destroy();
  }

  createParticleTextures() {
    let g = this.add.graphics();
    g.fillStyle(0xFFFFFF, 0.9); g.fillCircle(4, 4, 3);
    g.fillStyle(0xFFFFFF, 0.5); g.fillCircle(4, 4, 4);
    g.generateTexture('snowflake', 8, 8); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0xFF4444, 1); g.fillCircle(4, 4, 4);
    g.fillStyle(0xFF8844, 0.7); g.fillCircle(4, 4, 2);
    g.generateTexture('hit_particle', 8, 8); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0xFFDD00, 1); g.fillCircle(4, 4, 3);
    g.fillStyle(0xFFFF88, 0.7); g.fillCircle(3, 3, 1.5);
    g.generateTexture('gold_particle', 8, 8); g.destroy();

    g = this.add.graphics();
    g.lineStyle(3, 0xFFFFFF, 0.9);
    g.beginPath(); g.arc(16, 16, 12, -0.8, 0.8); g.strokePath();
    g.generateTexture('slash_fx', 32, 32); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0xFF6600, 1); g.fillCircle(4, 4, 4);
    g.fillStyle(0xFFAA00, 0.8); g.fillCircle(4, 3, 2.5);
    g.fillStyle(0xFFDD44, 0.5); g.fillCircle(4, 2, 1.5);
    g.generateTexture('fire_particle', 8, 8); g.destroy();
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.res = { meat: 0, wood: 0, stone: 0, leather: 0, gold: 0 };
    this.playerHP = 15; this.playerMaxHP = 15;
    this.playerDamage = 1;
    this.playerSpeed = 160;
    this.playerBaseSpeed = 160;
    this.warmthResist = 1;
    this.woodBonus = 0; this.stoneBonus = 0;
    this.temperature = 100; this.maxTemp = 100;
    this.hunger = 100; this.maxHunger = 100;
    this.attackCooldown = 0;
    this.baseAttackSpeed = 0.35;
    this.moveDir = { x: 0, y: 0 };
    this.npcsOwned = [];
    this.placedBuildings = [];
    this.gameOver = false;
    this.buildMode = null;
    this.storageCapacity = 50;
    this.isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || ('ontouchstart' in window);
    this.facingRight = true;

    // Safe area bottom - compute from DOM
    this.safeBottom = 0;
    try {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom,0px);visibility:hidden;';
      document.body.appendChild(d);
      this.safeBottom = d.offsetHeight || 0;
      document.body.removeChild(d);
    } catch(e) {}
    if (!this.safeBottom && /iPhone/.test(navigator.userAgent) && window.screen.height >= 812) {
      this.safeBottom = 34;
    }

    this.stats = { kills: {}, woodGathered: 0, built: {}, crafted: 0, npcsHired: 0 };
    this.questIndex = 0;
    this.questCompleted = [];

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.drawBackground();

    this.player = this.physics.add.sprite(WORLD_W/2, WORLD_H/2, 'player');
    this.player.setCollideWorldBounds(true).setDepth(10).setDamping(true).setDrag(0.9);
    this.player.body.setSize(18, 22).setOffset(11, 14);

    this.animals = this.physics.add.group();
    this.drops = this.physics.add.group();
    this.npcSprites = this.physics.add.group();
    this.resourceNodes = [];
    this.buildingSprites = [];

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: WORLD_W }, y: -10,
      lifespan: 12000, speedY: { min: 10, max: 30 }, speedX: { min: -20, max: 10 },
      scale: { min: 0.3, max: 1.5 }, alpha: { start: 0.8, end: 0 },
      frequency: 60, quantity: 1, rotate: { min: 0, max: 360 },
    }).setDepth(50);

    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: WORLD_W }, y: -10,
      lifespan: 10000, speedY: { min: 20, max: 50 }, speedX: { min: -10, max: 20 },
      scale: { min: 1, max: 2.5 }, alpha: { start: 0.3, end: 0 },
      frequency: 200, quantity: 1,
    }).setDepth(55);

    this.campfireGlow = this.add.graphics().setDepth(1);

    this.spawnResourceNodes();
    this.spawnWave();
    this.animalSpawnTimer = 0;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-E', () => this.interactNearest());
    this.input.keyboard.on('keydown-B', () => this.toggleBuildMenu());
    this.input.keyboard.on('keydown-C', () => this.toggleCraftMenu());
    this.input.keyboard.on('keydown-SPACE', () => this.performAttackNearest());

    this.input.on('pointerdown', (p) => {
      resumeAudio();
      if (this.gameOver) return;
      if (this.isUIArea(p)) return;
      if (this.isMobile && this.isJoystickArea(p)) return;
      if (this.buildMode) { this.placeBuilding(p); return; }
      this.performAttack(p);
    });

    if (this.isMobile) this.createDOMJoystick();
    this.createUI();
    window._gameScene = this;
    this.physics.add.overlap(this.player, this.drops, (_, d) => this.collectDrop(d));
    this.campfireParticleTimer = 0;
  }

  drawBackground() {
    const bg = this.add.graphics();
    bg.fillStyle(0xE8ECF2, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);
    for (let i = 0; i < 120; i++) {
      const colors = [0xDDE2EA, 0xD5DAE2, 0xE0E4EC];
      bg.fillStyle(colors[Phaser.Math.Between(0, 2)], 0.3);
      bg.fillEllipse(Phaser.Math.Between(0, WORLD_W), Phaser.Math.Between(0, WORLD_H),
        Phaser.Math.Between(40, 200), Phaser.Math.Between(20, 60));
    }
    for (let i = 0; i < 60; i++) {
      bg.fillStyle(0xF5F7FA, 0.4);
      bg.fillEllipse(Phaser.Math.Between(0, WORLD_W), Phaser.Math.Between(0, WORLD_H),
        Phaser.Math.Between(30, 80), Phaser.Math.Between(10, 30));
    }
    for (let i = 0; i < 20; i++) {
      bg.fillStyle(0xCCDDEE, 0.2);
      bg.fillEllipse(Phaser.Math.Between(0, WORLD_W), Phaser.Math.Between(0, WORLD_H),
        Phaser.Math.Between(60, 150), Phaser.Math.Between(40, 100));
    }
  }

  spawnResourceNodes() {
    for (let i = 0; i < 40; i++) this.createResourceNode('tree', Phaser.Math.Between(80, WORLD_W-80), Phaser.Math.Between(80, WORLD_H-80));
    for (let i = 0; i < 25; i++) this.createResourceNode('rock', Phaser.Math.Between(80, WORLD_W-80), Phaser.Math.Between(80, WORLD_H-80));
  }

  createResourceNode(type, x, y) {
    const def = RESOURCE_NODES[type];
    const spr = this.add.sprite(x, y, type+'_node').setDepth(3);
    if (type === 'tree') spr.setOrigin(0.5, 0.85);
    spr.nodeType = type; spr.nodeDef = def;
    spr.nodeHP = def.hp; spr.nodeMaxHP = def.hp;
    spr.depleted = false; spr.regenTimer = 0;
    this.resourceNodes.push(spr);
    return spr;
  }

  harvestNode(node) {
    if (node.depleted) return;
    node.nodeHP--; playChop();
    this.tweens.add({ targets: node, x: node.x + 4, duration: 40, yoyo: true, repeat: 3 });
    for (let i = 0; i < 3; i++) {
      const p = this.add.image(node.x, node.y, node.nodeType === 'tree' ? 'wood_drop' : 'stone_drop')
        .setDepth(15).setScale(0.5).setAlpha(0.8);
      this.tweens.add({ targets: p, x: node.x + Phaser.Math.Between(-30, 30),
        y: node.y + Phaser.Math.Between(-30, 10), alpha: 0, scale: 0.1, duration: 400,
        onComplete: () => p.destroy() });
    }
    if (node.nodeHP <= 0) {
      const def = node.nodeDef;
      const amount = def.yield + (def.resource === 'wood' ? this.woodBonus : def.resource === 'stone' ? this.stoneBonus : 0);
      for (let i = 0; i < amount; i++)
        this.spawnDrop(def.resource, node.x + Phaser.Math.Between(-20, 20), node.y + Phaser.Math.Between(-10, 10));
      if (def.resource === 'wood') this.stats.woodGathered += amount;
      node.depleted = true; node.setAlpha(0.15); node.regenTimer = def.regen;
    }
  }

  spawnWave() {
    [{ type: 'rabbit', count: 8 }, { type: 'deer', count: 4 }, { type: 'penguin', count: 4 },
     { type: 'seal', count: 2 }, { type: 'wolf', count: 2 }]
    .forEach(e => { for (let i = 0; i < e.count; i++) this.spawnAnimal(e.type); });
  }

  spawnAnimal(type) {
    const def = ANIMALS[type], m = 60;
    let x = Phaser.Math.Between(m, WORLD_W-m), y = Phaser.Math.Between(m, WORLD_H-m);
    if (Phaser.Math.Distance.Between(x, y, this.player?.x || WORLD_W/2, this.player?.y || WORLD_H/2) < 200)
      { x = Phaser.Math.Between(m, WORLD_W-m); y = Phaser.Math.Between(m, WORLD_H-m); }
    const a = this.physics.add.sprite(x, y, type).setCollideWorldBounds(true).setDepth(5);
    a.animalType = type; a.def = def; a.hp = def.hp; a.maxHP = def.hp;
    a.wanderTimer = 0; a.wanderDir = {x:0,y:0}; a.hitFlash = 0; a.atkCD = 0; a.fleeTimer = 0;
    if (def.hp > 2) a.hpBar = this.add.graphics().setDepth(6);
    const lc = def.behavior === 'chase' ? '#FF4444' : def.behavior === 'flee' ? '#88DDFF' : '#AADDFF';
    a.nameLabel = this.add.text(x, y - def.size - 10, def.name, {
      fontSize: '11px', fontFamily: 'monospace', color: lc, stroke: '#000', strokeThickness: 3
    }).setDepth(6).setOrigin(0.5);
    this.animals.add(a);
  }

  performAttack(pointer) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = this.getAttackCooldown();
    const wx = pointer.worldX, wy = pointer.worldY, range = 55;
    this.player.setTexture('player_attack');
    this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });
    let hit = false;
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      if (Phaser.Math.Distance.Between(wx, wy, a.x, a.y) < range) { this.damageAnimal(a, this.playerDamage); hit = true; }
    });
    this.resourceNodes.forEach(n => {
      if (n.depleted) return;
      if (Phaser.Math.Distance.Between(wx, wy, n.x, n.y) < range) { this.harvestNode(n); hit = true; }
    });
    if(hit){playSlash();this.cameras.main.shake(60,0.003);}else playWhiff();
    this.showAttackFX(wx, wy, hit);
  }

  performAttackNearest() {
    if (this.attackCooldown > 0) return;
    const range = 55;
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
    this.attackCooldown = this.getAttackCooldown();
    this.player.setTexture('player_attack');
    this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });
    if (best && bestD <= bestND) {
      this.damageAnimal(best, this.playerDamage); playSlash();
      this.showAttackFX(best.x, best.y, true);
      this.cameras.main.shake(60, 0.004);
    } else if (bestNode) {
      this.harvestNode(bestNode);
      this.showAttackFX(bestNode.x, bestNode.y, true);
    } else {
      playWhiff();
      const dx = this.moveDir.x || (this.facingRight ? 1 : -1);
      this.showAttackFX(this.player.x + dx*40, this.player.y + (this.moveDir.y||0)*40, false);
    }
  }

  getAttackCooldown() {
    let cd = this.baseAttackSpeed;
    if (this._nearCampfire) cd /= (this._campfireAttackBonus || 1);
    return cd;
  }

  damageAnimal(a, dmg) {
    a.hp -= dmg; a.hitFlash = 0.2; a.setTint(0xFF4444); playHit();
    const fs = dmg >= 3 ? '24px' : dmg >= 2 ? '20px' : '16px';
    const c = dmg >= 3 ? '#FF2222' : '#FF6644';
    const t = this.add.text(a.x + Phaser.Math.Between(-10, 10), a.y - 20, '-'+dmg, {
      fontSize: fs, fontFamily: 'monospace', color: c, stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setDepth(15).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, scale: { from: 1.3, to: 0.8 },
      duration: 600, ease: 'Back.Out', onComplete: () => t.destroy() });
    const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, a.x, a.y);
    a.body.setVelocity(Math.cos(ang) * 120, Math.sin(ang) * 120);
    for (let i = 0; i < 5; i++) {
      const p = this.add.image(a.x, a.y, 'hit_particle').setDepth(15).setScale(Phaser.Math.FloatBetween(0.5, 1.2));
      this.tweens.add({ targets: p, x: a.x + Phaser.Math.Between(-30, 30), y: a.y + Phaser.Math.Between(-30, 30),
        alpha: 0, scale: 0, duration: 300, onComplete: () => p.destroy() });
    }
    if (a.hp <= 0) this.killAnimal(a);
  }

  killAnimal(a) { playKill();
    const def = a.def;
    Object.entries(def.drops).forEach(([res, amt]) => {
      for (let i = 0; i < amt; i++) {
        const ang = Phaser.Math.FloatBetween(0, Math.PI*2), dist = Phaser.Math.Between(15, 40);
        this.spawnDrop(res, a.x + Math.cos(ang)*dist, a.y + Math.sin(ang)*dist, a.x, a.y);
      }
    });
    if (!this.stats.kills[a.animalType]) this.stats.kills[a.animalType] = 0;
    this.stats.kills[a.animalType]++;
    for (let i = 0; i < 8; i++) {
      const p = this.add.image(a.x, a.y, 'snowflake').setDepth(15).setTint(0xFFDDDD).setScale(1.5);
      this.tweens.add({ targets: p, x: a.x + Phaser.Math.Between(-40, 40), y: a.y + Phaser.Math.Between(-40, 40),
        alpha: 0, scale: 0, duration: 400, ease: 'Quad.Out', onComplete: () => p.destroy() });
    }
    const kt = this.add.text(a.x, a.y - 25, '💀 ' + def.name, {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFDD44', stroke: '#000', strokeThickness: 3
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
    d.resource = resource; d.value = 1; d.body.setAllowGravity(false);
    this.drops.add(d);
    this.tweens.add({ targets: d, x: tx, y: ty, duration: 400, ease: 'Bounce.Out' });
    this.tweens.add({ targets: d, scale: { from: 0.3, to: 1 }, duration: 300, ease: 'Back.Out' });
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
    this.res[r] = (this.res[r]||0) + drop.value; playCoin();
    const icons = { meat: '🥩', wood: '🪵', stone: '🪨', leather: '🧶' };
    const t = this.add.text(drop.x, drop.y, '+1'+( icons[r]||''), {
      fontSize: '15px', fontFamily: 'monospace', color: '#FFFFFF', stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setDepth(15).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 25, alpha: 0, scale: { from: 1.2, to: 0.8 },
      duration: 500, ease: 'Quad.Out', onComplete: () => t.destroy() });
    drop.destroy();
  }

  showAttackFX(x, y, hit) {
    const slash = this.add.image(x, y, 'slash_fx').setDepth(15).setAlpha(0.8).setAngle(Phaser.Math.Between(-30, 30));
    if (hit) slash.setTint(0xFF6644);
    this.tweens.add({ targets: slash, alpha: 0, scale: { from: 0.8, to: 1.8 }, duration: 200, onComplete: () => slash.destroy() });
    const g = this.add.graphics().setDepth(14);
    const c = hit ? 0xFF4444 : 0xFFFFFF;
    let ring = { r: 5, a: 0.8 };
    this.tweens.add({ targets: ring, r: 35, a: 0, duration: 250,
      onUpdate: () => { g.clear(); g.lineStyle(hit ? 3 : 2, c, ring.a); g.strokeCircle(x, y, ring.r); },
      onComplete: () => g.destroy() });
  }

  updateAnimalAI(dt) {
    const px = this.player.x, py = this.player.y;
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      a.atkCD = Math.max(0, a.atkCD - dt);
      if (a.hitFlash > 0) { a.hitFlash -= dt; if (a.hitFlash <= 0) a.clearTint(); }
      const dist = Phaser.Math.Distance.Between(a.x, a.y, px, py);

      // Campfire/wall repel
      let repelled = false;
      this.placedBuildings.forEach(b => {
        if (b.type === 'campfire') {
          const bd = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
          if (bd < b.def.effects.animalRepelRadius) {
            const ang = Phaser.Math.Angle.Between(b.x, b.y, a.x, a.y);
            a.body.setVelocity(Math.cos(ang) * (b.def.effects.animalRepelRadius - bd) * 2,
                               Math.sin(ang) * (b.def.effects.animalRepelRadius - bd) * 2);
            repelled = true;
          }
        } else if (b.type === 'wall') {
          const bd = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
          if (bd < 30) {
            const ang = Phaser.Math.Angle.Between(b.x, b.y, a.x, a.y);
            a.body.setVelocity(Math.cos(ang) * 80, Math.sin(ang) * 80);
            repelled = true;
          }
        }
      });

      if (!repelled) {
        if (a.def.behavior === 'flee') {
          if (dist < a.def.fleeRange) {
            const ang = Phaser.Math.Angle.Between(px, py, a.x, a.y);
            a.body.setVelocity(Math.cos(ang)*a.def.speed, Math.sin(ang)*a.def.speed);
            a.fleeTimer = 2;
          } else if (a.fleeTimer > 0) {
            a.fleeTimer -= dt;
            a.body.velocity.normalize().scale(a.def.speed * (a.fleeTimer / 2));
          } else this.wander(a, dt, 0.3);
        } else if (a.def.behavior === 'chase') {
          if (dist < a.def.aggroRange) {
            const ang = Phaser.Math.Angle.Between(a.x, a.y, px, py);
            a.body.setVelocity(Math.cos(ang)*a.def.speed, Math.sin(ang)*a.def.speed);
            if (dist < 28 && a.atkCD <= 0) {
              this.playerHP -= a.def.damage; a.atkCD = 1.2; playHurt();
              this.cameras.main.shake(120, 0.012);
              this.player.setTint(0xFF4444);
              this.time.delayedCall(150, ()=>{if(this.player.active)this.player.clearTint();});
              const dt2 = this.add.text(px, py-20, '-'+a.def.damage, {
                fontSize:'20px',fontFamily:'monospace',color:'#FF0000',stroke:'#000',strokeThickness:3,fontStyle:'bold'
              }).setDepth(15).setOrigin(0.5);
              this.tweens.add({targets:dt2, y:dt2.y-35, alpha:0, scale:{from:1.3,to:0.7}, duration:600, onComplete:()=>dt2.destroy()});
              if (this.playerHP <= 0) this.endGame();
            }
          } else this.wander(a, dt, 0.25);
        } else this.wander(a, dt, 0.3);
      }

      if (a.body.velocity.x > 5) a.setFlipX(false);
      else if (a.body.velocity.x < -5) a.setFlipX(true);
      if (a.nameLabel) a.nameLabel.setPosition(a.x, a.y - a.def.size - 14);
      if (a.hpBar) {
        a.hpBar.clear();
        const bw = 34, bx = a.x - bw/2, by = a.y - a.def.size - 8;
        a.hpBar.fillStyle(0x222222, 0.8); a.hpBar.fillRoundedRect(bx-1, by-1, bw+2, 7, 2);
        const r = a.hp / a.maxHP;
        a.hpBar.fillStyle(r > 0.6 ? 0x4CAF50 : r > 0.3 ? 0xFFEB3B : 0xF44336, 1);
        a.hpBar.fillRoundedRect(bx, by, bw * r, 5, 2);
      }
    });
  }

  wander(a, dt, speedMul) {
    a.wanderTimer -= dt;
    if (a.wanderTimer <= 0) {
      a.wanderTimer = Phaser.Math.FloatBetween(1.5, 4);
      if (Phaser.Math.Between(0, 2) === 0) a.wanderDir = { x: 0, y: 0 };
      else { const ang = Phaser.Math.FloatBetween(0, Math.PI*2); a.wanderDir = { x: Math.cos(ang), y: Math.sin(ang) }; }
    }
    a.body.setVelocity(a.wanderDir.x*a.def.speed*speedMul, a.wanderDir.y*a.def.speed*speedMul);
  }

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
            if (bestD < 30 && npc.actionTimer <= 0) { this.harvestNode(best); npc.actionTimer = 1.5; }
          } else this.followPlayer(npc, followDist);
          break;
        }
        case 'merchant': {
          this.followPlayer(npc, 60);
          if (npc.actionTimer <= 0 && this.res.meat >= 3) {
            this.res.meat -= 3; this.res.gold += 5; npc.actionTimer = 2.5;
            const t = this.add.text(npc.x, npc.y-15, '💰+5', {fontSize:'15px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:3}).setDepth(15).setOrigin(0.5);
            this.tweens.add({targets:t, y:t.y-25, alpha:0, duration:600, onComplete:()=>t.destroy()});
          }
          break;
        }
      }
      if (npc.body.velocity.x > 5) npc.setFlipX(false);
      else if (npc.body.velocity.x < -5) npc.setFlipX(true);
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
    for (const [r, amt] of Object.entries(def.cost)) { if ((this.res[r]||0) < amt) return; }
    for (const [r, amt] of Object.entries(def.cost)) this.res[r] -= amt;
    const npc = this.physics.add.sprite(
      this.player.x + Phaser.Math.Between(-30,30), this.player.y + Phaser.Math.Between(-30,30),
      'npc_'+def.type).setCollideWorldBounds(true).setDepth(9);
    npc.npcType = def.type; npc.npcDef = def; npc.actionTimer = 0;
    this.npcSprites.add(npc); this.npcsOwned.push(npc); this.stats.npcsHired++; playHire();
    const ht = this.add.text(npc.x, npc.y-20, '✨ '+def.name+' 고용!', {
      fontSize:'16px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:3
    }).setDepth(20).setOrigin(0.5);
    this.tweens.add({targets:ht, y:ht.y-40, alpha:0, duration:1200, onComplete:()=>ht.destroy()});
    for(let i=0;i<8;i++){
      const p = this.add.image(npc.x, npc.y, 'gold_particle').setDepth(15);
      this.tweens.add({targets:p, x:npc.x+Phaser.Math.Between(-35,35), y:npc.y+Phaser.Math.Between(-35,35),
        alpha:0, scale:{from:1.5,to:0}, duration:500, onComplete:()=>p.destroy()});
    }
  }

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
      g.fillStyle(0x884422, 1); g.fillRect(wx-12, wy+6, 24, 6);
      g.fillStyle(0x664411, 1); g.fillRect(wx-10, wy+3, 20, 5);
      g.fillStyle(0x777777, 1);
      for (let i = 0; i < 8; i++) {
        const a2 = (i / 8) * Math.PI * 2;
        g.fillCircle(wx + Math.cos(a2)*14, wy + Math.sin(a2)*14, 3);
      }
      g.fillStyle(0xFF4400, 0.9); g.fillCircle(wx, wy, 10);
      g.fillStyle(0xFF8800, 0.8); g.fillCircle(wx, wy-2, 7);
      g.fillStyle(0xFFCC00, 0.6); g.fillCircle(wx, wy-4, 4);
      g.fillStyle(0xFFFF88, 0.4); g.fillCircle(wx, wy-5, 2);
    } else if (this.buildMode === 'tent') {
      g.fillStyle(0x8B6914, 0.9); g.fillTriangle(wx, wy-26, wx-24, wy+12, wx+24, wy+12);
      g.fillStyle(0xA07B28, 0.7); g.fillTriangle(wx, wy-22, wx-20, wy+10, wx+20, wy+10);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-5, wy+2, 10, 10);
    } else if (this.buildMode === 'storage') {
      g.fillStyle(0x795548, 1); g.fillRect(wx-18, wy-16, 36, 32);
      g.fillStyle(0x8D6E63, 1); g.fillTriangle(wx, wy-24, wx-20, wy-14, wx+20, wy-14);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-5, wy+4, 10, 12);
      g.lineStyle(1, 0x4E342E); g.strokeRect(wx-18, wy-16, 36, 32);
    } else if (this.buildMode === 'workshop') {
      g.fillStyle(0x795548, 1); g.fillRect(wx-16, wy-14, 32, 28);
      g.fillStyle(0x8D6E63, 1); g.fillTriangle(wx, wy-22, wx-18, wy-12, wx+18, wy-12);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-5, wy+4, 10, 10);
      g.fillStyle(0x555555, 1); g.fillRect(wx+8, wy+4, 8, 5);
    } else if (this.buildMode === 'wall') {
      g.fillStyle(0x9E9E9E, 1); g.fillRect(wx-20, wy-10, 40, 20);
      g.fillStyle(0xBBBBBB, 0.5);
      g.fillRect(wx-18, wy-8, 10, 8); g.fillRect(wx-5, wy-8, 10, 8); g.fillRect(wx+8, wy-8, 10, 8);
      g.lineStyle(1, 0x757575); g.strokeRect(wx-20, wy-10, 40, 20);
    }

    const label = this.add.text(wx, wy-32, def.icon, {fontSize:'22px'}).setDepth(3).setOrigin(0.5);
    const bld = { type: this.buildMode, x: wx, y: wy, graphic: g, label, def };
    this.placedBuildings.push(bld);
    if (!this.stats.built[this.buildMode]) this.stats.built[this.buildMode] = 0;
    this.stats.built[this.buildMode]++;
    if (def.storageBonus) this.storageCapacity += def.storageBonus;
    playBuild(); this.showFloatingText(wx, wy - 40, '✅ '+def.name+' 건설!', '#4CAF50');
    for (let i = 0; i < 8; i++) {
      const p = this.add.image(wx, wy, 'snowflake').setDepth(15).setTint(0xFFDD88).setScale(1.2);
      this.tweens.add({ targets: p, x: wx + Phaser.Math.Between(-35, 35), y: wy + Phaser.Math.Between(-35, 35),
        alpha: 0, duration: 500, onComplete: () => p.destroy() });
    }
    this.buildMode = null;
  }

  updateCampfireSystem(dt) {
    this.campfireGlow.clear();
    this._nearCampfire = false;
    this._campfireAttackBonus = 1;

    this.placedBuildings.forEach(b => {
      if (b.type !== 'campfire') return;
      const effects = b.def.effects;
      const warmthR = b.def.warmthRadius;
      const time = this.time.now / 1000;

      // 3-tier warmth zone
      this.campfireGlow.fillStyle(0xFF8844, 0.04 + Math.sin(time * 1.5) * 0.01);
      this.campfireGlow.fillCircle(b.x, b.y, warmthR);
      this.campfireGlow.lineStyle(1, 0xFF8844, 0.1);
      this.campfireGlow.strokeCircle(b.x, b.y, warmthR);

      this.campfireGlow.fillStyle(0xFF6622, 0.07 + Math.sin(time * 2) * 0.02);
      this.campfireGlow.fillCircle(b.x, b.y, 100);
      this.campfireGlow.lineStyle(1, 0xFF6622, 0.15);
      this.campfireGlow.strokeCircle(b.x, b.y, 100);

      this.campfireGlow.fillStyle(0xFF4400, 0.12 + Math.sin(time * 3) * 0.03);
      this.campfireGlow.fillCircle(b.x, b.y, 60);
      this.campfireGlow.lineStyle(1.5, 0xFF4400, 0.25);
      this.campfireGlow.strokeCircle(b.x, b.y, 60);

      const pd = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
      if (pd < warmthR) {
        this._nearCampfire = true;
        const intensity = 1 - (pd / warmthR);
        this.temperature = Math.min(this.maxTemp, this.temperature + effects.healthRegen * intensity * dt);
        this.playerHP = Math.min(this.playerMaxHP, this.playerHP + effects.healthRegen * intensity * dt);
        this.res.gold = (this.res.gold || 0) + effects.goldGeneration * intensity * dt;
        if (pd < 100) {
          this._campfireAttackBonus = Math.max(this._campfireAttackBonus, effects.attackSpeedBonus);
          this.playerSpeed = this.playerBaseSpeed * effects.moveSpeedBonus;
        }
      }
    });

    if (!this._nearCampfire) this.playerSpeed = this.playerBaseSpeed;

    // 🔊 Fire ambient
    if(this._nearCampfire&&!fireAmbSrc)startFire();else if(!this._nearCampfire&&fireAmbSrc)stopFire();

    // Fire particles
    this.campfireParticleTimer += dt;
    if (this.campfireParticleTimer > 0.1) {
      this.campfireParticleTimer = 0;
      this.placedBuildings.forEach(cb => {
        if (cb.type !== 'campfire') return;
        const fp = this.add.image(cb.x + Phaser.Math.Between(-8, 8), cb.y + Phaser.Math.Between(-5, 5), 'fire_particle')
          .setDepth(15).setScale(Phaser.Math.FloatBetween(0.8, 2.0));
        this.tweens.add({ targets: fp, y: fp.y - Phaser.Math.Between(20, 50), x: fp.x + Phaser.Math.Between(-15, 15),
          alpha: 0, scale: 0, duration: Phaser.Math.Between(400, 800), onComplete: () => fp.destroy() });
      });
    }

    // Tent effects
    this.placedBuildings.forEach(b => {
      if (b.type !== 'tent' || !b.def.effects) return;
      const pd = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
      if (pd < 80) this.playerHP = Math.min(this.playerMaxHP, this.playerHP + b.def.effects.healthRegen * dt);
    });
  }

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
      case 'speed': this.playerSpeed += recipe.value; this.playerBaseSpeed += recipe.value; break;
    }
    this.stats.crafted++; playCraft();
    this.showFloatingText(this.player.x, this.player.y - 30, '✨ '+recipe.icon+' '+recipe.name+' 제작!', '#64B5F6');
  }

  updateSurvival(dt) {
    this.temperature = Math.max(0, this.temperature - 1.5 * this.warmthResist * dt);
    this.placedBuildings.forEach(b => {
      if (b.type === 'campfire') return;
      if (!b.def.warmth) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
      if (d < 80) this.temperature = Math.min(this.maxTemp, this.temperature + b.def.warmth * dt);
    });
    let hungerRate = 0.8;
    this.placedBuildings.forEach(b => {
      if (b.type === 'tent' && b.def.effects) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
        if (d < 80) hungerRate *= b.def.effects.hungerSlowdown;
      }
    });
    this.hunger = Math.max(0, this.hunger - hungerRate * dt);
    if (this.temperature <= 0) { this.playerHP -= 2 * dt; if (this.playerHP <= 0) this.endGame(); }
    if (this.hunger <= 0) { this.playerHP -= 1.5 * dt; if (this.playerHP <= 0) this.endGame(); }
    if (this.hunger < 30 && this.res.meat > 0) {
      this.res.meat--; this.hunger = Math.min(this.maxHunger, this.hunger + 25);
      playEat(); this.showFloatingText(this.player.x, this.player.y - 20, '🥩 자동 섭취', '#FF9800');
    }
  }

  checkQuests() {
    if (this.questIndex >= QUESTS.length) return;
    const q = QUESTS[this.questIndex];
    if (q.check(this.stats)) {
      Object.entries(q.reward).forEach(([r, amt]) => this.res[r] = (this.res[r]||0) + amt);
      this.questCompleted.push(q.id); this.questIndex++; playQuest();
      const cam = this.cameras.main;
      const qText = this.add.text(cam.width/2, cam.height * 0.3, '🎉 퀘스트 완료!\n'+q.name, {
        fontSize:'22px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:4,align:'center',lineSpacing:4
      }).setScrollFactor(0).setDepth(200).setOrigin(0.5);
      this.tweens.add({targets:qText, y:qText.y-30, alpha:0, duration:2000, delay:500, onComplete:()=>qText.destroy()});
    }
  }

  interactNearest() {
    if (this.res.meat > 0 && this.hunger < 80) {
      this.res.meat--; this.hunger = Math.min(this.maxHunger, this.hunger + 25);
      this.playerHP = Math.min(this.playerMaxHP, this.playerHP + 2);
      playEat(); this.showFloatingText(this.player.x, this.player.y - 20, '🥩 회복!', '#4CAF50');
    }
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {fontSize:'14px',fontFamily:'monospace',color:color,stroke:'#000',strokeThickness:3}).setDepth(20).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  createDOMJoystick() {
    const zone = document.getElementById('joystick-zone');
    const joy = document.getElementById('joystick');
    const knob = document.getElementById('joystick-knob');
    if (!zone) return;
    zone.style.display = 'block';
    this.joystickActive = false;
    let origin = {x:0, y:0};
    const self = this;

    const onStart = (e) => {
      e.preventDefault();
      if (self.gameOver) return;
      const t = e.touches ? e.touches[0] : e;
      origin = {x: t.clientX, y: t.clientY};
      self.joystickActive = true;
      joy.style.display = 'block';
      joy.style.left = (t.clientX - 55) + 'px';
      joy.style.top = (t.clientY - zone.getBoundingClientRect().top - 55) + 'px';
      knob.style.transform = 'translate(-50%, -50%)';
    };
    const onMove = (e) => {
      if (!self.joystickActive) return;
      e.preventDefault();
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - origin.x, dy = t.clientY - origin.y;
      const dist = Math.sqrt(dx*dx+dy*dy), max=55, clamp=Math.min(dist,max), ang=Math.atan2(dy,dx);
      const kx = Math.cos(ang)*clamp, ky = Math.sin(ang)*clamp;
      knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
      if(dist>8){self.moveDir.x=Math.cos(ang);self.moveDir.y=Math.sin(ang);}
      else{self.moveDir.x=0;self.moveDir.y=0;}
    };
    const onEnd = () => {
      self.joystickActive = false;
      joy.style.display = 'none';
      knob.style.transform = 'translate(-50%, -50%)';
      self.moveDir.x=0; self.moveDir.y=0;
    };
    zone.addEventListener('touchstart', onStart, {passive:false});
    document.addEventListener('touchmove', onMove, {passive:false});
    document.addEventListener('touchend', onEnd);
    zone.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  }

  isJoystickArea(p) {
    const h = this.cameras.main.height;
    // Full width, above bottom buttons area
    return p.y > h * 0.15 && p.y < h - this.safeBottom - 60;
  }

  createUI() {
    // HUD is now fully DOM-based (see index.html #dom-hud)
    this._dom = {
      res: document.getElementById('res-text'),
      hpFill: document.getElementById('hp-fill'),
      hpText: document.getElementById('hp-text'),
      tempFill: document.getElementById('temp-fill'),
      tempText: document.getElementById('temp-text'),
      hungerFill: document.getElementById('hunger-fill'),
      hungerText: document.getElementById('hunger-text'),
      quest: document.getElementById('quest-text'),
      buff: document.getElementById('buff-text'),
    };

    // ═══ DOM Buttons (100% reliable touch) ═══
    const scene = this;
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); resumeAudio(); fn(); });
    };
    bind('btn-attack', () => scene.performAttackNearest());
    bind('btn-build', () => scene.toggleBuildMenu());
    bind('btn-craft', () => scene.toggleCraftMenu());
    bind('btn-hire', () => scene.toggleHireMenu());
    bind('btn-eat', () => scene.interactNearest());
    bind('btn-sound', () => {
      soundEnabled = !soundEnabled;
      if (!soundEnabled) stopFire();
      const el = document.getElementById('btn-sound');
      if (el) el.textContent = soundEnabled ? '🔊' : '🔇';
    });

    this.panelBg = this.add.graphics().setScrollFactor(0).setDepth(110).setVisible(false);
    this.panelTexts = []; this.panelZones = []; this.activePanel = null;
    this.npcLabels = [];
  }

  isUIArea(p) {
    const h = this.cameras.main.height, w = this.cameras.main.width;
    // Bottom DOM buttons area (55px + safe area)
    if (p.y > h - 55 - this.safeBottom) return true;
    // Top HUD area
    if (p.y < 120 && p.x < 260) return true;
    // Panel area
    if (this.activePanel && p.x > w - 240 && p.y > 60 && p.y < h - 60) return true;
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
    const pw = 220, px = w - pw - 8, py = 70;
    let items = [];
    if (type === 'build') {
      items = Object.entries(BUILDINGS).map(([k, v]) => ({
        key:k, label:v.icon+' '+v.name, sub:Object.entries(v.cost).map(([r,a])=>r+':'+a).join(' '),
        desc:v.desc, action:()=>{this.buildMode=k;this.clearPanel();this.activePanel=null;
          this.showFloatingText(this.player.x,this.player.y-20,'👆 터치로 설치','#AAFFAA');}
      }));
    } else if (type === 'craft') {
      items = Object.entries(RECIPES).map(([k, v]) => ({
        key:k, label:v.icon+' '+v.name, sub:Object.entries(v.cost).map(([r,a])=>r+':'+a).join(' '),
        desc:v.desc, action:()=>{this.craftItem(k);this.clearPanel();this.activePanel=null;}
      }));
    } else if (type === 'hire') {
      items = NPC_DEFS.map((d,i) => ({
        key:d.type, label:d.name, sub:Object.entries(d.cost).map(([r,a])=>r+':'+a).join(' '),
        desc:d.desc, action:()=>{this.hireNPC(i);}
      }));
    }
    const panelH = Math.min(items.length * 60 + 20, h - 140);
    this.panelBg.setVisible(true).clear();
    this.panelBg.fillStyle(0x0a0a1e, 0.93); this.panelBg.fillRoundedRect(px, py, pw, panelH, 10);
    this.panelBg.lineStyle(2, 0x4466aa, 0.6); this.panelBg.strokeRoundedRect(px, py, pw, panelH, 10);
    const titles = { build:'🔥 건설', craft:'🔨 제작', hire:'👥 고용' };
    const titleText = this.add.text(px + pw/2, py + 4, titles[type], {
      fontSize:'15px',fontFamily:'monospace',color:'#AACCFF',stroke:'#000',strokeThickness:2
    }).setScrollFactor(0).setDepth(111).setOrigin(0.5, 0);
    this.panelTexts.push(titleText);
    items.forEach((item, i) => {
      const iy = py + 26 + i * 60;
      if (iy + 56 > py + panelH) return;
      const itemBg = this.add.graphics().setScrollFactor(0).setDepth(110.5);
      itemBg.fillStyle(0x223366, 0.3); itemBg.fillRoundedRect(px + 4, iy, pw - 8, 54, 6);
      this.panelTexts.push(itemBg);
      const t1 = this.add.text(px+12,iy+4,item.label,{fontSize:'14px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:2}).setScrollFactor(0).setDepth(111);
      const t2 = this.add.text(px+12,iy+22,item.sub,{fontSize:'10px',fontFamily:'monospace',color:'#AABBCC'}).setScrollFactor(0).setDepth(111);
      const t3 = this.add.text(px+12,iy+36,item.desc,{fontSize:'10px',fontFamily:'monospace',color:'#88FF88'}).setScrollFactor(0).setDepth(111);
      this.panelTexts.push(t1, t2, t3);
      const zone = this.add.zone(px+pw/2, iy+27, pw, 54).setScrollFactor(0).setDepth(112).setInteractive();
      zone.on('pointerdown', item.action);
      zone.on('pointerover', ()=>itemBg.clear().fillStyle(0x334488,0.5).fillRoundedRect(px+4,iy,pw-8,54,6));
      zone.on('pointerout', ()=>itemBg.clear().fillStyle(0x223366,0.3).fillRoundedRect(px+4,iy,pw-8,54,6));
      this.panelZones.push(zone);
    });
  }

  clearPanel() {
    this.panelBg.setVisible(false);
    this.panelTexts.forEach(t=>t.destroy()); this.panelTexts = [];
    this.panelZones.forEach(z=>z.destroy()); this.panelZones = [];
  }

  // drawBar removed - now using DOM bars

  updateUI() {
    const d = this._dom;
    if (!d) return;
    const icons = {meat:'🥩',wood:'🪵',stone:'🪨',leather:'🧶',gold:'💰'};
    d.res.textContent = Object.entries(this.res).filter(([_,v])=>v>0).map(([k,v])=>icons[k]+Math.floor(v)).join(' ');
    
    const hpR = Math.max(0, Math.min(1, this.playerHP/this.playerMaxHP));
    d.hpFill.style.width = (hpR*100)+'%';
    d.hpFill.style.background = hpR>0.6?'#4CAF50':hpR>0.3?'#FFCC00':'#F44336';
    d.hpText.textContent = Math.ceil(Math.max(0,this.playerHP))+'/'+this.playerMaxHP;
    
    const tempR = Math.max(0, Math.min(1, this.temperature/this.maxTemp));
    d.tempFill.style.width = (tempR*100)+'%';
    d.tempText.textContent = Math.ceil(this.temperature)+'%';
    
    const hungerR = Math.max(0, Math.min(1, this.hunger/this.maxHunger));
    d.hungerFill.style.width = (hungerR*100)+'%';
    d.hungerText.textContent = Math.ceil(this.hunger)+'%';
    
    if (this.questIndex < QUESTS.length) {
      const q = QUESTS[this.questIndex];
      d.quest.textContent = '📋 '+q.name+': '+q.desc;
    } else d.quest.textContent = '📋 모든 퀘스트 완료! 🎉';
    
    d.buff.style.display = this._nearCampfire ? 'block' : 'none';
    
    this.npcLabels.forEach(l=>l.destroy()); this.npcLabels = [];
    this.npcsOwned.forEach(npc => {
      if (!npc.active) return;
      const l = this.add.text(npc.x, npc.y-22, npc.npcDef.name, {
        fontSize:'11px',fontFamily:'monospace',color:'#FFDD88',stroke:'#000',strokeThickness:2
      }).setDepth(12).setOrigin(0.5);
      this.npcLabels.push(l);
    });
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true; playDeath(); stopFire();
    const cam = this.cameras.main;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(200);
    ov.fillStyle(0x000000, 0.8); ov.fillRect(0, 0, cam.width, cam.height);
    this.add.text(cam.width/2, cam.height/2-80, '💀 사망', {
      fontSize:'44px',fontFamily:'monospace',color:'#FF4444',stroke:'#000',strokeThickness:5
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5);
    const kills = Object.entries(this.stats.kills).map(([k,v])=>(ANIMALS[k]?.name||k)+': '+v).join(', ') || '없음';
    const txt = '🎯 사냥: '+kills+'\n🏗️ 건설: '+Object.values(this.stats.built).reduce((a,b)=>a+b,0)+'개\n🔨 제작: '+this.stats.crafted+'개\n👥 NPC: '+this.stats.npcsHired+'명\n📋 퀘스트: '+this.questCompleted.length+'/'+QUESTS.length;
    this.add.text(cam.width/2, cam.height/2+10, txt, {
      fontSize:'15px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:2,align:'center',lineSpacing:8
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5);
    const rb = this.add.text(cam.width/2, cam.height/2+120, '🔄 다시 시작', {
      fontSize:'26px',fontFamily:'monospace',color:'#4CAF50',stroke:'#000',strokeThickness:3,
      backgroundColor:'#222244',padding:{x:24,y:12}
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5).setInteractive();
    rb.on('pointerdown', () => this.scene.restart());
    rb.on('pointerover', () => rb.setColor('#66FF66'));
    rb.on('pointerout', () => rb.setColor('#4CAF50'));
  }

  update(time, deltaMs) {
    if (this.gameOver) return;
    const dt = deltaMs / 1000;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    // Mobile auto-attack
    if (this.isMobile && this.attackCooldown <= 0) {
      let nearest = null, nearestDist = Infinity;
      this.animals.getChildren().forEach(a => {
        if (!a.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
        if (d < 55 && d < nearestDist) { nearest = a; nearestDist = d; }
      });
      if (nearest) {
        this.attackCooldown = this.getAttackCooldown();
        this.player.setTexture('player_attack');
        this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });
        this.damageAnimal(nearest, this.playerDamage); playSlash();
        this.showAttackFX(nearest.x, nearest.y, true);
        this.cameras.main.shake(50, 0.003);
      } else {
        let nearestNode = null, nearestND = Infinity;
        this.resourceNodes.forEach(n => {
          if (n.depleted) return;
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
          if (d < 55 && d < nearestND) { nearestNode = n; nearestND = d; }
        });
        if (nearestNode) {
          this.attackCooldown = this.getAttackCooldown();
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
    this.player.body.setVelocity(this.moveDir.x*this.playerSpeed, this.moveDir.y*this.playerSpeed);
    if (this.moveDir.x > 0.1) { this.player.setFlipX(false); this.facingRight = true; }
    else if (this.moveDir.x < -0.1) { this.player.setFlipX(true); this.facingRight = false; }

    this.updateAnimalAI(dt);
    this.updateNPCs(dt);
    this.updateCampfireSystem(dt);
    this.updateSurvival(dt);

    this.resourceNodes.forEach(n => {
      if (!n.depleted) return;
      n.regenTimer -= dt;
      if (n.regenTimer <= 0) { n.depleted = false; n.nodeHP = n.nodeMaxHP; n.setAlpha(1); }
    });

    this.animalSpawnTimer += dt;
    if (this.animalSpawnTimer > 12) {
      this.animalSpawnTimer = 0;
      if (this.animals.getChildren().length < 22) {
        const types = ['rabbit','rabbit','rabbit','deer','penguin','seal','wolf'];
        if ((this.stats.kills.wolf||0) >= 2 || (this.stats.kills.bear||0) >= 1) types.push('bear');
        for (let i = 0; i < 3; i++) this.spawnAnimal(Phaser.Utils.Array.GetRandom(types));
      }
    }

    this.drops.getChildren().forEach(d => {
      if(!d.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, d.x, d.y);
      if (dist < 70) {
        const a = Phaser.Math.Angle.Between(d.x, d.y, this.player.x, this.player.y);
        const speed = 220 * (1 - dist/70);
        d.x += Math.cos(a) * speed * dt;
        d.y += Math.sin(a) * speed * dt;
        if (dist < 18) this.collectDrop(d);
      }
    });

    this.checkQuests();
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
