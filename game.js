// Whiteout Survival - ULTIMATE with Sound FX
// All feedback applied: mobile, balance, visuals, campfire, buildings, SOUND

// ═══ 🔊 SOUND ENGINE (ElevenLabs + Web Audio) ═══
let audioCtx=null,soundEnabled=true,fireAmbSrc=null;
const _sfxCache={};const _sfxPool={};
let _bgm=null,_bgmStarted=false;

function initAudio(){
  try{audioCtx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){soundEnabled=false}
  // Preload all sound files
  const sounds=['bgm','slash','hit','kill','coin','chop','build','craft','hire','hurt','eat','quest','death','upgrade_select','box_appear','epic_card'];
  sounds.forEach(name=>{
    fetch('sounds/'+name+'.mp3').then(r=>r.arrayBuffer()).then(buf=>{
      if(audioCtx)audioCtx.decodeAudioData(buf,decoded=>{_sfxCache[name]=decoded;},()=>{});
    }).catch(()=>{});
  });
}

function resumeAudio(){
  if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();
  // Start BGM on first interaction
  if(!_bgmStarted&&soundEnabled){_bgmStarted=true;startBGM();}
}

function _playSFX(name,vol=0.5){
  if(!audioCtx||!soundEnabled||!_sfxCache[name])return;
  const src=audioCtx.createBufferSource();
  const gain=audioCtx.createGain();
  src.buffer=_sfxCache[name];
  gain.gain.value=vol;
  src.connect(gain).connect(audioCtx.destination);
  src.start(0);
  return src;
}

function startBGM(){
  if(!audioCtx||!soundEnabled||_bgm)return;
  if(!_sfxCache.bgm){setTimeout(startBGM,500);return;}
  const src=audioCtx.createBufferSource();
  const gain=audioCtx.createGain();
  src.buffer=_sfxCache.bgm;
  src.loop=true;
  gain.gain.value=0.15;
  src.connect(gain).connect(audioCtx.destination);
  src.start(0);
  _bgm={src,gain};
}
function stopBGM(){if(_bgm){try{_bgm.src.stop();}catch(e){}_bgm=null;}}

// Legacy-compatible sound functions using ElevenLabs SFX
function playSlash(){_playSFX('slash',0.4)}
function playHit(){_playSFX('hit',0.5)}
function playKill(){_playSFX('kill',0.5)}
function playCoin(){_playSFX('coin',0.35)}
function playChop(){_playSFX('chop',0.4)}
function playBuild(){_playSFX('build',0.5)}
function playCraft(){_playSFX('craft',0.45)}
function playHire(){_playSFX('hire',0.5)}
function playHurt(){_playSFX('hurt',0.6)}
function playEat(){_playSFX('eat',0.4)}
function playQuest(){_playSFX('quest',0.5)}
function playDeath(){_playSFX('death',0.6)}
function playWhiff(){_playSFX('slash',0.1)}
function playLevelUp(){
  if(!audioCtx||!soundEnabled)return;
  // Triumphant ascending arpeggio
  const notes=[523.25,659.25,783.99,1046.5];
  notes.forEach((freq,i)=>{
    const osc=audioCtx.createOscillator();const g=audioCtx.createGain();
    osc.type='triangle';osc.frequency.value=freq;
    g.gain.setValueAtTime(0.3,audioCtx.currentTime+i*0.1);
    g.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+i*0.1+0.4);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(audioCtx.currentTime+i*0.1);osc.stop(audioCtx.currentTime+i*0.1+0.4);
  });
}
function playUpgradeSelect(){_playSFX('upgrade_select',0.6)}
function playBoxAppear(){_playSFX('box_appear',0.5)}
function playEpicCard(){_playSFX('epic_card',0.7)}

// Fire ambient (keep Web Audio procedural for looping crackle)
function startFire(){if(!audioCtx||!soundEnabled||fireAmbSrc)return;const bs=Math.floor(audioCtx.sampleRate*2),b=audioCtx.createBuffer(1,bs,audioCtx.sampleRate),d=b.getChannelData(0);for(let i=0;i<bs;i++){d[i]=(Math.random()*2-1)*0.03;if(Math.random()<0.002)d[i]*=8}const s=audioCtx.createBufferSource(),g=audioCtx.createGain();s.buffer=b;s.loop=true;g.gain.value=0.12;s.connect(g).connect(audioCtx.destination);s.start();fireAmbSrc={s,g}}
function stopFire(){if(fireAmbSrc){try{fireAmbSrc.s.stop()}catch(e){}fireAmbSrc=null}}
// ═══ END SOUND ═══

// ═══ 💾 SAVE MANAGER ═══
class SaveManager {
  static SAVE_KEY = 'whiteout_save';
  
  static save(scene) {
    try {
      const saveData = {
        version: '1.0',
        timestamp: Date.now(),
        player: {
          x: scene.player ? scene.player.x : WORLD_W / 2,
          y: scene.player ? scene.player.y : WORLD_H / 2,
          hp: scene.playerHP,
          maxHP: scene.playerMaxHP,
          damage: scene.playerDamage,
          speed: scene.playerSpeed,
          baseSpeed: scene.playerBaseSpeed,
          warmthResist: scene.warmthResist,
          woodBonus: scene.woodBonus,
          stoneBonus: scene.stoneBonus,
          baseAttackSpeed: scene.baseAttackSpeed,
          facingRight: scene.facingRight,
        },
        resources: { ...scene.res },
        temperature: scene.temperature,
        maxTemp: scene.maxTemp,
        hunger: scene.hunger,
        maxHunger: scene.maxHunger,
        storageCapacity: scene.storageCapacity,
        stats: JSON.parse(JSON.stringify(scene.stats)),
        questCompleted: [...scene.questCompleted],
        questIndex: scene.questIndex,
        buildings: scene.placedBuildings.map(b => ({ type: b.type, x: b.x, y: b.y })),
        npcs: scene.npcsOwned.map(n => ({ type: n.npcType, x: n.x, y: n.y })),
        upgrades: scene.upgradeManager.toJSON(),
        playerXP: scene.playerXP,
        playerLevel: scene.playerLevel,
        gameElapsed: scene.gameElapsed,
        coldWaveCount: scene.coldWaveCount,
        nextColdWaveTime: scene.nextColdWaveTime,
        boss1Spawned: scene.boss1Spawned,
        boss2Spawned: scene.boss2Spawned,
        waveNumber: scene.waveNumber,
      };
      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }
  
  static load() {
    try {
      const saved = localStorage.getItem(SaveManager.SAVE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }
  
  static exists() {
    try {
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object';
    } catch (e) {
      // Corrupt data - clean it up
      localStorage.removeItem(SaveManager.SAVE_KEY);
      return false;
    }
  }
  
  static delete() {
    localStorage.removeItem(SaveManager.SAVE_KEY);
  }
}
// ═══ END SAVE MANAGER ═══

// ═══ 🎴 UPGRADE SYSTEM (뱀서 스타일) ═══
const UPGRADE_CATEGORIES = {
  combat: { color: '#FF4444', bgColor: 0xCC2222, borderColor: '#FF6666', icon: '⚔️', name: '전투' },
  survival: { color: '#4488FF', bgColor: 0x2255AA, borderColor: '#66AAFF', icon: '🛡️', name: '생존' },
  economy: { color: '#FFCC00', bgColor: 0xAA8800, borderColor: '#FFDD44', icon: '💰', name: '경제' },
  special: { color: '#AA44FF', bgColor: 0x7722CC, borderColor: '#CC66FF', icon: '✨', name: '특수' },
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
};

// ═══ 경험치(XP) 시스템 ═══
const XP_TABLE = [0, 25, 40, 55, 75, 95, 120, 150, 185, 225, 270, 330, 400, 490, 600, 730, 900, 1100, 1350, 1650, 2000];
const XP_SOURCES = {
  rabbit: 3, deer: 5, penguin: 4, seal: 8,
  wolf: 12, bear: 25, boss: 50, tree: 1, rock: 1, gold: 3,
  default: 3,
};

// ═══ 한파 스케줄 ═══
const BLIZZARD_SCHEDULE = [
  { startMs: 3*60*1000,      duration: 30*1000, tempMult: 2,   reward: { boxes: 1, gold: 20 } },
  { startMs: 6*60*1000,      duration: 35*1000, tempMult: 2.5, reward: { boxes: 2, gold: 40 } },
  { startMs: 8.5*60*1000,    duration: 40*1000, tempMult: 3,   reward: { boxes: 2, gold: 60 } },
  { startMs: 10.5*60*1000,   duration: 45*1000, tempMult: 3.5, reward: { boxes: 2, gold: 80 } },
  { startMs: 12.5*60*1000,   duration: 50*1000, tempMult: 4,   reward: { boxes: 3, gold: 100 } },
];

// ═══ 맵 구역 시스템 ═══
const MAP_CENTER = { x: 1200, y: 1200 };
const ZONE_RADII = { safe: 300, normal: 700, danger: 1000 };
const ZONE_TEMP_DECAY = { safe: 0, normal: -1, danger: -2, extreme: -4 };

const RARITY_WEIGHTS = { common: 70, rare: 25, epic: 5 };
const RARITY_LABELS = { common: { name: '일반', color: '#CCCCCC' }, rare: { name: '희귀', color: '#4488FF' }, epic: { name: '에픽', color: '#AA44FF' } };

class UpgradeManager {
  constructor() {
    this.levels = {}; // { DAMAGE_UP: 2, ... }
    this.totalKills = 0;
    this.cratesSpawned = 0; // how many crates triggered so far
    this.regenPerSec = 0;
    this.critChance = 0;
    this.dodgeChance = 0;
    this.lifestealAmount = 0;
    this.knockbackBonus = 0;
    this.lootBonus = 0;
    this.sellBonus = 0;
    this.magnetRange = 70; // base magnet range
    this.multiHitCount = 1;
    this.explosionLevel = 0;
    this.campfireBoost = 1;
    this.cooldownReduction = 1;
    this.frostResistance = 0;
    this.berserkerBonus = 0;
    this.chainAttackChance = 0;
    this.treasureHunterBonus = 0;
    this.armorReduction = 0;
    this.vampireHeal = 0;
    this.winterHeartBonus = 0;
    this.scavengerSpeed = 0;
    this.swiftStrikeActive = false;
    this.swiftStrikeUsed = false; // tracks if first attack bonus was used
    this.frostWalkerActive = false;
    this.swiftStrikeApplied = false; // For SWIFT_STRIKE Lvl 1: true after first bonus used, reset on upgrade/load
    this.attackCounter = 0; // For SWIFT_STRIKE Lvl 2: count attacks
  }

  getLevel(key) { return this.levels[key] || 0; }
  isMaxed(key) { return this.getLevel(key) >= UPGRADES[key].maxLevel; }

  getAvailableUpgrades() {
    return Object.keys(UPGRADES).filter(k => !this.isMaxed(k));
  }

  pickThreeCards() {
    const available = this.getAvailableUpgrades();
    if (available.length === 0) return [];

    // Weighted by rarity
    const weighted = [];
    available.forEach(k => {
      const w = RARITY_WEIGHTS[UPGRADES[k].rarity] || 70;
      for (let i = 0; i < w; i++) weighted.push(k);
    });

    const picked = [];
    const used = new Set();
    const count = Math.min(3, available.length);
    while (picked.length < count) {
      const k = weighted[Math.floor(Math.random() * weighted.length)];
      if (!used.has(k)) { used.add(k); picked.push(k); }
    }
    return picked;
  }

  applyUpgrade(key, scene) {
    this.levels[key] = (this.levels[key] || 0) + 1;
    const lv = this.levels[key];

    switch (key) {
      case 'DAMAGE_UP':
        scene.playerDamage = Math.round(scene.playerDamage * 1.25 * 100) / 100;
        if (scene.playerDamage < 1) scene.playerDamage = 1;
        break;
      case 'ATTACK_SPEED':
        scene.baseAttackSpeed *= 0.8;
        break;
      case 'CRITICAL':
        this.critChance = lv * 0.1;
        break;
      case 'LIFESTEAL':
        this.lifestealAmount = lv;
        break;
      case 'KNOCKBACK':
        this.knockbackBonus = lv * 40;
        break;
      case 'MAX_HP':
        scene.playerMaxHP += 20;
        scene.playerHP += 20;
        break;
      case 'WARMTH':
        scene.warmthResist = Math.min(1.0, scene.warmthResist + 0.2); // Now increases resistance
        break;
      case 'REGEN':
        this.regenPerSec = lv * 0.5;
        break;
      case 'MOVEMENT':
        scene.playerBaseSpeed *= 1.15;
        scene.playerSpeed = scene.playerBaseSpeed;
        break;
      case 'DODGE':
        this.dodgeChance = lv * 0.1;
        break;
      case 'LOOT_BONUS':
        this.lootBonus = lv * 0.5;
        break;
      case 'WOOD_BONUS':
        scene.woodBonus += 1;
        break;
      case 'STONE_BONUS':
        scene.stoneBonus += 1;
        break;
      case 'STORAGE':
        scene.storageCapacity += 25;
        break;
      case 'SELL_BONUS':
        this.sellBonus = lv * 0.2;
        break;
      case 'MAGNET':
        this.magnetRange = 70 + lv * 50;
        break;
      case 'MULTI_HIT':
        this.multiHitCount = 1 + lv;
        break;
      case 'EXPLOSION':
        this.explosionLevel = lv;
        break;
      case 'CAMPFIRE_BOOST':
        this.campfireBoost = 1 + lv * 0.5;
        break;
      case 'TIME_BONUS':
        this.cooldownReduction = Math.pow(0.8, lv);
        break;
      case 'FROST_RESISTANCE': this.frostResistance = Math.min(0.9, this.frostResistance + 0.3); break;
      case 'BERSERKER': this.berserkerBonus = Math.min(1.0, this.berserkerBonus + 0.5); break;
      case 'CHAIN_ATTACK': this.chainAttackChance = Math.min(1.0, this.chainAttackChance + 0.5); break;
      case 'TREASURE_HUNTER': this.treasureHunterBonus += 0.4; break;
      case 'ARMOR': this.armorReduction = Math.min(0.6, this.armorReduction + 0.2); break;
      case 'VAMPIRE': this.vampireHeal += 5; break;
      case 'WINTER_HEART': this.winterHeartBonus += 0.2; break;
      case 'SCAVENGER': this.scavengerSpeed += 0.3; break;
      case 'SWIFT_STRIKE': this.swiftStrikeActive = true; break;
      case 'FROST_WALKER': this.frostWalkerActive = true; break;
    }
  }

  onKill(scene) {
    this.totalKills++;
    // Crate spawning removed - now handled by XP level-up system
  }

  toJSON() {
    return {
      levels: { ...this.levels },
      totalKills: this.totalKills,
      cratesSpawned: this.cratesSpawned,
    };
  }

  fromJSON(data, scene) {
    if (!data) return;
    this.totalKills = data.totalKills || 0;
    this.cratesSpawned = data.cratesSpawned || 0;
    // Re-apply all upgrades from scratch
    if (data.levels) {
      const savedLevels = { ...data.levels };
      this.levels = {};
      this.regenPerSec = 0; this.critChance = 0; this.dodgeChance = 0;
      this.lifestealAmount = 0; this.knockbackBonus = 0; this.lootBonus = 0;
      this.sellBonus = 0; this.magnetRange = 70; this.multiHitCount = 1;
      this.explosionLevel = 0; this.campfireBoost = 1; this.cooldownReduction = 1;
      this.frostResistance = 0; this.berserkerBonus = 0; this.chainAttackChance = 0;
      this.treasureHunterBonus = 0; this.armorReduction = 0; this.vampireHeal = 0;
      this.winterHeartBonus = 0; this.scavengerSpeed = 0;
      this.swiftStrikeActive = false; this.swiftStrikeUsed = false; this.frostWalkerActive = false;
      this.swiftStrikeApplied = false; // Reset for new session
      this.attackCounter = 0; // Reset for new session
      Object.entries(savedLevels).forEach(([key, lv]) => {
        for (let i = 0; i < lv; i++) this.applyUpgrade(key, scene);
      });
    }
  }
}
// ═══ END UPGRADE SYSTEM ═══

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

// ═══ 🎬 TITLE SCENE ═══
class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    
    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a1a');
    
    // Scrolling snow landscape (Factorio-style)
    this.bgGraphics = this.add.graphics();
    this.snowTiles = [];
    for (let i = 0; i < 80; i++) {
      this.snowTiles.push({
        x: Math.random() * W * 2,
        y: Math.random() * H * 2,
        size: 1 + Math.random() * 3,
        speed: 0.2 + Math.random() * 0.5,
        alpha: 0.1 + Math.random() * 0.3
      });
    }
    
    // Ground scroll tiles
    this.groundTiles = [];
    for (let i = 0; i < 30; i++) {
      this.groundTiles.push({
        x: Math.random() * W * 2 - W * 0.5,
        y: Math.random() * H * 2 - H * 0.5,
        w: 20 + Math.random() * 60,
        h: 10 + Math.random() * 30,
        color: Phaser.Math.Between(0x1a1a3e, 0x2a2a4e),
        speed: 0.3 + Math.random() * 0.3
      });
    }
    
    // Snow particles
    this.snowParticles = [];
    for (let i = 0; i < 120; i++) {
      this.snowParticles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 1 + Math.random() * 3,
        speedX: -0.3 - Math.random() * 0.5,
        speedY: 0.5 + Math.random() * 1.5,
        alpha: 0.3 + Math.random() * 0.7,
        wobble: Math.random() * Math.PI * 2
      });
    }
    
    this.snowGfx = this.add.graphics();
    
    // Title text
    this.add.text(W / 2, H * 0.25, '❄️ 화이트아웃 서바이벌', {
      fontSize: Math.min(42, W * 0.06) + 'px',
      fontFamily: 'monospace',
      color: '#e0e8ff',
      stroke: '#000',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#0a0a2a', blur: 8, fill: true }
    }).setOrigin(0.5);
    
    this.add.text(W / 2, H * 0.33, '극한의 추위에서 살아남아라', {
      fontSize: Math.min(18, W * 0.03) + 'px',
      fontFamily: 'monospace',
      color: '#8899bb',
    }).setOrigin(0.5);
    
    // Menu buttons
    const btnY = H * 0.52;
    const btnW = Math.min(260, W * 0.5);
    const btnH = 50;
    const hasSave = SaveManager.exists();
    
    // "이어하기" button
    if (hasSave) {
      this._createButton(W / 2, btnY, btnW, btnH, '▶ 이어하기', 0x2255aa, () => {
        // Double-check save exists at click time (may have been cleared)
        if (!SaveManager.exists()) {
          this.scene.start('Boot', { loadSave: false });
          return;
        }
        this.scene.start('Boot', { loadSave: true });
      });
      
      // Show save info
      const saveData = SaveManager.load();
      if (saveData) {
        const date = new Date(saveData.timestamp);
        const timeStr = date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        this.add.text(W / 2, btnY + btnH / 2 + 16, '💾 ' + timeStr, {
          fontSize: '12px', fontFamily: 'monospace', color: '#6688aa'
        }).setOrigin(0.5);
      }
    }
    
    // "새로하기" button
    const newBtnY = hasSave ? btnY + btnH + 40 : btnY;
    this._createButton(W / 2, newBtnY, btnW, btnH, '🆕 새로하기', hasSave ? 0x444466 : 0x2255aa, () => {
      if (hasSave) {
        this._showConfirmDialog();
      } else {
        this.scene.start('Boot', { loadSave: false });
      }
    });
    
    // Version
    this.add.text(W - 10, H - 10, 'v1.0', {
      fontSize: '11px', fontFamily: 'monospace', color: '#334'
    }).setOrigin(1, 1);
    
    this.elapsed = 0;
  }
  
  _createButton(x, y, w, h, text, color, callback) {
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.8);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    bg.lineStyle(2, 0x88aadd, 0.5);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    
    const txt = this.add.text(x, y, text, {
      fontSize: '20px', fontFamily: 'monospace', color: '#e0e8ff',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
    hitArea.on('pointerover', () => { bg.clear(); bg.fillStyle(color, 1); bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8); bg.lineStyle(2, 0xaaccff, 0.8); bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8); });
    hitArea.on('pointerout', () => { bg.clear(); bg.fillStyle(color, 0.8); bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8); bg.lineStyle(2, 0x88aadd, 0.5); bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8); });
    hitArea.on('pointerdown', callback);
    
    return { bg, txt, hitArea };
  }
  
  _showConfirmDialog() {
    const W = this.scale.width;
    const H = this.scale.height;
    
    // Overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setInteractive().setDepth(100);
    
    // Dialog box
    const dlg = this.add.graphics().setDepth(101);
    const dw = Math.min(320, W * 0.7);
    const dh = 180;
    dlg.fillStyle(0x1a1a2e, 0.95);
    dlg.fillRoundedRect(W / 2 - dw / 2, H / 2 - dh / 2, dw, dh, 12);
    dlg.lineStyle(2, 0xff6644, 0.8);
    dlg.strokeRoundedRect(W / 2 - dw / 2, H / 2 - dh / 2, dw, dh, 12);
    
    const title = this.add.text(W / 2, H / 2 - 50, '⚠️ 경고', {
      fontSize: '20px', fontFamily: 'monospace', color: '#ff8866'
    }).setOrigin(0.5).setDepth(102);
    
    const msg = this.add.text(W / 2, H / 2 - 15, '기존 저장 데이터가 삭제됩니다.\n정말 새로 시작하시겠습니까?', {
      fontSize: '14px', fontFamily: 'monospace', color: '#ccccdd', align: 'center'
    }).setOrigin(0.5).setDepth(102);
    
    // Confirm button
    const confirmBg = this.add.graphics().setDepth(102);
    confirmBg.fillStyle(0xcc3322, 0.9); confirmBg.fillRoundedRect(W / 2 - 70 - 50, H / 2 + 40, 100, 36, 6);
    const confirmTxt = this.add.text(W / 2 - 70, H / 2 + 58, '삭제 후 시작', { fontSize: '13px', fontFamily: 'monospace', color: '#fff' }).setOrigin(0.5).setDepth(102);
    const confirmHit = this.add.rectangle(W / 2 - 70, H / 2 + 58, 100, 36, 0, 0).setInteractive({ useHandCursor: true }).setDepth(103);
    confirmHit.on('pointerdown', () => {
      SaveManager.delete();
      this.scene.start('Boot', { loadSave: false });
    });
    
    // Cancel button
    const cancelBg = this.add.graphics().setDepth(102);
    cancelBg.fillStyle(0x334466, 0.9); cancelBg.fillRoundedRect(W / 2 + 70 - 50, H / 2 + 40, 100, 36, 6);
    const cancelTxt = this.add.text(W / 2 + 70, H / 2 + 58, '취소', { fontSize: '13px', fontFamily: 'monospace', color: '#aabbcc' }).setOrigin(0.5).setDepth(102);
    const cancelHit = this.add.rectangle(W / 2 + 70, H / 2 + 58, 100, 36, 0, 0).setInteractive({ useHandCursor: true }).setDepth(103);
    cancelHit.on('pointerdown', () => {
      [overlay, dlg, title, msg, confirmBg, confirmTxt, confirmHit, cancelBg, cancelTxt, cancelHit].forEach(o => o.destroy());
    });
  }
  
  update(time, delta) {
    this.elapsed += delta * 0.001;
    const W = this.scale.width;
    const H = this.scale.height;
    
    // Draw scrolling ground
    this.bgGraphics.clear();
    this.groundTiles.forEach(t => {
      t.x -= t.speed;
      t.y -= t.speed * 0.3;
      if (t.x + t.w < -50) { t.x = W + 50; t.y = Math.random() * H; }
      this.bgGraphics.fillStyle(t.color, 0.3);
      this.bgGraphics.fillRect(t.x, t.y, t.w, t.h);
    });
    
    // Snow particles
    this.snowGfx.clear();
    this.snowParticles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.wobble += 0.02;
      p.x += Math.sin(p.wobble) * 0.3;
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
      if (p.x < -10) { p.x = W + 10; }
      this.snowGfx.fillStyle(0xffffff, p.alpha * (0.7 + Math.sin(this.elapsed + p.wobble) * 0.3));
      this.snowGfx.fillCircle(p.x, p.y, p.size);
    });
  }
}
// ═══ END TITLE SCENE ═══

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
    this.createCrateTexture();
    const loadSave = this.scene.settings.data?.loadSave || false;
    this.scene.start('Game', { loadSave });
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
    g.fillStyle(0xFFDD44, 1); g.fillCircle(4, 4, 4);
    g.fillStyle(0xFFFFAA, 0.7); g.fillCircle(3, 3, 2);
    g.generateTexture('sparkle', 8, 8); g.destroy();

    g = this.add.graphics();
    g.fillStyle(0xFF6600, 1); g.fillCircle(4, 4, 4);
    g.fillStyle(0xFFAA00, 0.8); g.fillCircle(4, 3, 2.5);
    g.fillStyle(0xFFDD44, 0.5); g.fillCircle(4, 2, 1.5);
    g.generateTexture('fire_particle', 8, 8); g.destroy();
  }

  createCrateTexture() {
    const g = this.add.graphics();
    // Wooden crate with golden trim
    g.fillStyle(0x8B6914, 1); g.fillRoundedRect(4, 6, 28, 24, 3);
    g.fillStyle(0xA07B28, 1); g.fillRoundedRect(6, 8, 24, 20, 2);
    g.lineStyle(2, 0xFFDD44, 0.8); g.strokeRoundedRect(4, 6, 28, 24, 3);
    // Cross bands
    g.fillStyle(0x664411, 1);
    g.fillRect(4, 16, 28, 3);
    g.fillRect(16, 6, 3, 24);
    // Lock/star
    g.fillStyle(0xFFDD44, 1); g.fillCircle(18, 18, 4);
    g.fillStyle(0xFFAA00, 1); g.fillCircle(18, 18, 2);
    g.generateTexture('supply_crate', 36, 36);
    g.destroy();
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.res = { meat: 0, wood: 0, stone: 0, leather: 0, gold: 0 };
    this.playerHP = 100; this.playerMaxHP = 100;
    this.playerDamage = 10;
    this.playerSpeed = 120;
    this.playerBaseSpeed = 120;
    this.warmthResist = 0;
    this.woodBonus = 0; this.stoneBonus = 0;
    this.temperature = 100; this.maxTemp = 100;
    this.hunger = 100; this.maxHunger = 100;
    this.attackCooldown = 0;
    this.baseAttackSpeed = 0.35;
    this.moveDir = { x: 0, y: 0 };
    this.npcsOwned = [];
    this.placedBuildings = [];
    this.gameOver = false;
    this.isRespawning = false;
    this.buildMode = null;
    this.storageCapacity = 50;
    this.upgradeManager = new UpgradeManager();
    this.supplyCrates = [];
    this.upgradeUIActive = false;
    this.playerXP = 0;
    this.playerLevel = 1;
    this.pendingLevelUps = 0;
    this.levelUpQueue = 0; // compat alias

    // ═══ Kill Combo System ═══
    this.killCombo = 0;
    this.killComboTimer = 0; // seconds remaining
    this.killComboText = null;

    // ═══ Tutorial Hints ═══
    this.tutorialShown = false;

    // Mobile-first: always use touch/joystick controls
    this.facingRight = true;

    // ═══ Phase 2: Game Timer & Act System ═══
    this.gameElapsed = 0; // seconds since game start
    this.currentAct = 1;
    this.waveTimer = 0; // 30s wave spawn timer
    this.waveNumber = 0;

    // ═══ Blizzard (한파) System ═══
    this.blizzardActive = false;
    this.blizzardMultiplier = 1;
    this.blizzardIndex = 0;
    this.blizzardWarned = false;
    this.blizzardWarningEndTime = 0;
    this.blizzardCountdownTimer = null;
    this.coldWaveOverlay = null;
    // Compat aliases for save/load
    this.coldWaveActive = false;
    this.coldWaveTimer = 0;
    this.coldWaveDuration = 0;
    this.coldWaveIntensity = 0;
    this.coldWaveCount = 0;
    this.nextColdWaveTime = 999999;

    // ═══ Phase 2: Rhythm System (15-20s events) ═══
    this.rhythmTimer = 0;
    this.nextRhythmInterval = 15;

    // ═══ Phase 2: Boss System ═══
    this.boss1Spawned = false;
    this.boss2Spawned = false;

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

    // Cold wave blue overlay (screen-space)
    this.coldWaveOverlay = this.add.graphics().setScrollFactor(0).setDepth(60).setAlpha(0);

    // Blizzard scheduler
    this.gameStartTime = this.time.now;
    this.time.addEvent({
      delay: 1000, loop: true,
      callback: this.checkBlizzardSchedule, callbackScope: this
    });

    this.spawnResourceNodes();
    this.spawnWave();

    this.input.on('pointerdown', (p) => {
      resumeAudio();
      if (this.gameOver) return;
      if (this.isUIArea(p)) return;
      if (this.buildMode) { this.placeBuilding(p); return; }
    });

    this.createVirtualJoystick();
    this.createUI();
    window._gameScene = this;
    this.physics.add.overlap(this.player, this.drops, (_, d) => this.collectDrop(d));
    this.campfireParticleTimer = 0;

    // ── Load Save Data ──
    const loadSave = this.scene.settings.data?.loadSave;
    if (loadSave) {
      const save = SaveManager.load();
      if (save) {
        try {
          this._applySaveData(save);
        } catch (e) {
          console.error('Save data corrupt, starting fresh:', e);
          SaveManager.delete();
        }
      }
      // If save requested but not found → safe fallback (no crash)
    }
    
    // ── Auto-Save Timer (60초) ──
    this.autoSaveTimer = this.time.addEvent({
      delay: 60000,
      callback: () => {
        if (!this.gameOver) {
          SaveManager.save(this);
          this._showSaveIndicator();
        }
      },
      loop: true
    });
  }

  _applySaveData(save) {
    // Player stats
    if (save.player) {
      this.player.setPosition(save.player.x, save.player.y);
      this.playerHP = save.player.hp;
      this.playerMaxHP = save.player.maxHP;
      this.playerDamage = save.player.damage;
      this.playerSpeed = save.player.speed;
      this.playerBaseSpeed = save.player.baseSpeed;
      this.warmthResist = save.player.warmthResist;
      this.woodBonus = save.player.woodBonus;
      this.stoneBonus = save.player.stoneBonus;
      this.baseAttackSpeed = save.player.baseAttackSpeed;
      this.facingRight = save.player.facingRight;
    }
    // Resources
    if (save.resources) this.res = save.resources;
    if (save.temperature != null) this.temperature = save.temperature;
    if (save.maxTemp != null) this.maxTemp = save.maxTemp;
    if (save.hunger != null) this.hunger = save.hunger;
    if (save.maxHunger != null) this.maxHunger = save.maxHunger;
    if (save.storageCapacity != null) this.storageCapacity = save.storageCapacity;
    if (save.stats) this.stats = save.stats;
    if (save.questCompleted) this.questCompleted = save.questCompleted;
    if (save.questIndex != null) this.questIndex = save.questIndex;
    // XP system
    if (save.playerXP != null) this.playerXP = save.playerXP;
    if (save.playerLevel != null) this.playerLevel = save.playerLevel;
    // Buildings
    if (save.buildings) {
      save.buildings.forEach(b => {
        this.buildMode = b.type;
        this._restoreBuilding(b);
      });
      this.buildMode = null;
    }
    // Upgrades
    if (save.upgrades) {
      this.upgradeManager.fromJSON(save.upgrades, this);
    }
    // Phase 2 state
    if (save.gameElapsed != null) this.gameElapsed = save.gameElapsed;
    if (save.coldWaveCount != null) this.coldWaveCount = save.coldWaveCount;
    if (save.nextColdWaveTime != null) this.nextColdWaveTime = save.nextColdWaveTime;
    if (save.boss1Spawned != null) this.boss1Spawned = save.boss1Spawned;
    if (save.boss2Spawned != null) this.boss2Spawned = save.boss2Spawned;
    if (save.waveNumber != null) this.waveNumber = save.waveNumber;
    this.currentAct = this.getCurrentAct();
    // NPCs
    if (save.npcs) {
      save.npcs.forEach(n => {
        this._restoreNPC(n);
      });
    }
  }

  _restoreBuilding(b) {
    const def = BUILDINGS[b.type];
    if (!def) return;
    const spr = this.add.sprite(b.x, b.y, 'building_' + b.type).setDepth(3);
    spr.type = b.type;
    spr.buildDef = def;
    this.placedBuildings.push(spr);
    this.buildingSprites.push(spr);
    if (def.storageBonus) this.storageCapacity += def.storageBonus;
    if (!this.stats.built[b.type]) this.stats.built[b.type] = 0;
  }

  _restoreNPC(n) {
    const npcDef = NPC_DEFS.find(d => d.type === n.type);
    if (!npcDef) return;
    const npc = this.physics.add.sprite(n.x, n.y, 'npc_' + n.type).setDepth(5);
    npc.npcType = n.type;
    npc.npcDef = npcDef;
    npc.setCollideWorldBounds(true);
    npc.body.setSize(16, 20).setOffset(8, 10);
    npc.actionTimer = 0;
    npc.state = 'idle';
    this.npcSprites.add(npc);
    this.npcsOwned.push(npc);
  }

  _showSaveIndicator() {
    const cam = this.cameras.main;
    const txt = this.add.text(cam.scrollX + cam.width - 10, cam.scrollY + 10, '💾 저장됨', {
      fontSize: '14px', fontFamily: 'monospace', color: '#88ccff',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(1, 0).setDepth(200);
    this.tweens.add({
      targets: txt, alpha: 0, y: txt.y - 20,
      duration: 1500, ease: 'Power2',
      onComplete: () => txt.destroy()
    });
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
      this.gainXP(XP_SOURCES[node.nodeType] || 1);
      node.depleted = true; node.setAlpha(0.15); node.regenTimer = def.regen;
    }
  }

  spawnWave() {
    [{ type: 'rabbit', count: 8 }, { type: 'deer', count: 4 }, { type: 'penguin', count: 4 },
     { type: 'seal', count: 2 }]
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
    // Multi-hit: find N nearest
    const nearAnimals = [];
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
      if (d < range) nearAnimals.push({ a, d });
    });
    nearAnimals.sort((a, b) => a.d - b.d);
    let best = nearAnimals.length > 0 ? nearAnimals[0].a : null;
    let bestD = nearAnimals.length > 0 ? nearAnimals[0].d : Infinity;
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
      // Multi-hit
      const hitCount = Math.min(this.upgradeManager.multiHitCount, nearAnimals.length);
      for (let h = 0; h < hitCount; h++) {
        this.damageAnimal(nearAnimals[h].a, this.playerDamage);
        this.showAttackFX(nearAnimals[h].a.x, nearAnimals[h].a.y, true);
      }
      this.upgradeManager.attackCounter++; // Increment attack counter for successful hit
      playSlash();
      this.cameras.main.shake(60, 0.004);
    } else if (bestNode) {
      this.harvestNode(bestNode);
      this.upgradeManager.attackCounter++; // Increment attack counter for successful hit
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
    cd *= this.upgradeManager.cooldownReduction;

    // SWIFT_STRIKE Lvl 2: instant cooldown every 3rd attack
    if (this.upgradeManager.getLevel('SWIFT_STRIKE') >= 2 &&
        this.upgradeManager.attackCounter > 0 &&
        this.upgradeManager.attackCounter % 3 === 0) {
      return 0; // Instant cooldown
    }
    // SWIFT_STRIKE Lvl 1 (or initial Lvl 2 bonus): 50% reduced cooldown for the next attack
    else if (this.upgradeManager.swiftStrikeActive && !this.upgradeManager.swiftStrikeApplied) {
      cd *= 0.5;
      this.upgradeManager.swiftStrikeApplied = true; // Mark as applied
    }
    return cd;
  }

  damageAnimal(a, dmg) {
    // Critical hit check
    if (this.upgradeManager.critChance > 0 && Math.random() < this.upgradeManager.critChance) {
      dmg = Math.ceil(dmg * 2);
      this.showFloatingText(a.x + 15, a.y - 30, '💥CRIT!', '#FF2222');
    }
    a.hp -= dmg; a.hitFlash = 0.2; a.setTint(0xFF4444); playHit();
    const fs = dmg >= 3 ? '24px' : dmg >= 2 ? '20px' : '16px';
    const c = dmg >= 3 ? '#FF2222' : '#FF6644';
    const t = this.add.text(a.x + Phaser.Math.Between(-10, 10), a.y - 20, '-'+dmg, {
      fontSize: fs, fontFamily: 'monospace', color: c, stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setDepth(15).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, scale: { from: 1.3, to: 0.8 },
      duration: 600, ease: 'Back.Out', onComplete: () => t.destroy() });
    const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, a.x, a.y);
    const kb = 120 + this.upgradeManager.knockbackBonus;
    a.body.setVelocity(Math.cos(ang) * kb, Math.sin(ang) * kb);
    for (let i = 0; i < 5; i++) {
      const p = this.add.image(a.x, a.y, 'hit_particle').setDepth(15).setScale(Phaser.Math.FloatBetween(0.5, 1.2));
      this.tweens.add({ targets: p, x: a.x + Phaser.Math.Between(-30, 30), y: a.y + Phaser.Math.Between(-30, 30),
        alpha: 0, scale: 0, duration: 300, onComplete: () => p.destroy() });
    }
    if (a.hp <= 0) this.killAnimal(a);
  }

  killAnimal(a) { playKill();
    // Boss death special effects
    if (a.isBoss) {
      this.cameras.main.shake(800, 0.03);
      this.cameras.main.flash(500, 255, 50, 50, true);
      const bossText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 80,
        '🏆 보스 처치!', {
        fontSize: '52px', fontFamily: 'monospace', color: '#FF4444',
        stroke: '#000', strokeThickness: 6, fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
      this.tweens.add({ targets: bossText, y: bossText.y - 50, alpha: 0, scale: { from: 1.3, to: 0.5 },
        duration: 2500, ease: 'Quad.Out', onComplete: () => bossText.destroy() });
      // Burst particles for boss loot
      for (let i = 0; i < 24; i++) {
        const ang = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const dist = Phaser.Math.Between(20, 60);
        const colors = [0xFFD700, 0xFF4444, 0xFF8800, 0xFFFFFF];
        const p = this.add.circle(a.x, a.y, Phaser.Math.Between(3, 6), Phaser.Utils.Array.GetRandom(colors))
          .setDepth(15).setAlpha(1);
        this.tweens.add({ targets: p,
          x: a.x + Math.cos(ang) * dist * 2, y: a.y + Math.sin(ang) * dist * 2,
          alpha: 0, scale: { from: 1.5, to: 0 }, duration: Phaser.Math.Between(600, 1200),
          ease: 'Quad.Out', onComplete: () => p.destroy() });
      }
    }
    const def = a.def;
    const lootMul = 1 + this.upgradeManager.lootBonus;
    Object.entries(def.drops).forEach(([res, amt]) => {
      const finalAmt = Math.floor(amt * lootMul) + (Math.random() < (amt * lootMul) % 1 ? 1 : 0);
      for (let i = 0; i < finalAmt; i++) {
        const ang = Phaser.Math.FloatBetween(0, Math.PI*2), dist = Phaser.Math.Between(15, 40);
        this.spawnDrop(res, a.x + Math.cos(ang)*dist, a.y + Math.sin(ang)*dist, a.x, a.y);
      }
    });
    if (!this.stats.kills[a.animalType]) this.stats.kills[a.animalType] = 0;
    this.stats.kills[a.animalType]++;

    // ═══ Kill Combo ═══
    this.killCombo++;
    this.killComboTimer = 3; // 3 seconds to maintain combo
    this._updateComboDisplay();

    // XP gain on kill with combo bonus
    let _xpAmt = XP_SOURCES[a.animalType] || 3;
    let _comboGoldBonus = 0;
    if (this.killCombo >= 10) {
      _xpAmt = Math.floor(_xpAmt * 2); // +100% XP
      _comboGoldBonus = 1;
    }
    if (this.killCombo >= 5) {
      _comboGoldBonus = 1; // gold +50% handled in drop
    }
    this.gainXP(_xpAmt);
    this.showFloatingText(a.x + 15, a.y - 30, '+' + _xpAmt + ' XP' + (this.killCombo >= 10 ? ' 🔥x2' : ''), '#FFDD44');

    // Combo gold bonus drops
    if (this.killCombo >= 5) {
      const bonusGold = Math.max(1, Math.floor((a.def.drops.gold || 0) * 0.5));
      if (bonusGold > 0) {
        for (let i = 0; i < bonusGold; i++) {
          const cAng = Phaser.Math.FloatBetween(0, Math.PI*2);
          this.spawnDrop('gold', a.x + Math.cos(cAng)*20, a.y + Math.sin(cAng)*20, a.x, a.y);
        }
        this.showFloatingText(a.x - 15, a.y - 45, '+' + bonusGold + '💰 콤보!', '#FFD700');
      }
    }

    // Combo 5+ particle burst
    if (this.killCombo >= 5 && this.killCombo < 10) {
      for (let i = 0; i < 6; i++) {
        const cAng = (Math.PI*2/6)*i;
        const cp = this.add.circle(a.x, a.y, 3, 0xFFD700).setDepth(15).setAlpha(0.8);
        this.tweens.add({ targets: cp, x: a.x+Math.cos(cAng)*35, y: a.y+Math.sin(cAng)*35,
          alpha: 0, scale: {from:1.2,to:0}, duration: 500, onComplete:()=>cp.destroy() });
      }
    }
    // Combo 10+ special effect
    if (this.killCombo >= 10) {
      this.cameras.main.flash(150, 255, 100, 0, true);
      for (let i = 0; i < 12; i++) {
        const cAng = (Math.PI*2/12)*i;
        const colors = [0xFF4400, 0xFFAA00, 0xFFDD00];
        const cp = this.add.circle(a.x, a.y, 4, Phaser.Utils.Array.GetRandom(colors)).setDepth(15);
        this.tweens.add({ targets: cp, x: a.x+Math.cos(cAng)*50, y: a.y+Math.sin(cAng)*50,
          alpha: 0, scale: {from:2,to:0}, duration: 700, ease:'Quad.Out', onComplete:()=>cp.destroy() });
      }
    }
    if (this.upgradeManager.explosionLevel > 0) this.triggerExplosion(a.x, a.y);
    if (this.upgradeManager.lifestealAmount > 0) {
      this.playerHP = Math.min(this.playerMaxHP, this.playerHP + this.upgradeManager.lifestealAmount);
      this.showFloatingText(a.x, a.y - 10, '+' + this.upgradeManager.lifestealAmount + '❤️', '#FF8888');
    }
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

  // ═══ Kill Combo Display ═══
  _updateComboDisplay() {
    if (this.killCombo < 2) {
      if (this.killComboText) { this.killComboText.destroy(); this.killComboText = null; }
      return;
    }
    const comboStr = `🔥 ${this.killCombo}x COMBO` + (this.killCombo >= 10 ? ' · XP×2' : this.killCombo >= 5 ? ' · 💰+50%' : '');
    const color = this.killCombo >= 10 ? '#FF4400' : this.killCombo >= 5 ? '#FFD700' : '#FFDD88';
    if (!this.killComboText) {
      this.killComboText = this.add.text(this.cameras.main.width - 10, 100, comboStr, {
        fontSize: '18px', fontFamily: 'monospace', color, stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
      }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);
    } else {
      this.killComboText.setText(comboStr).setColor(color);
    }
    // Pulse effect
    this.tweens.add({ targets: this.killComboText, scale: { from: 1.3, to: 1 }, duration: 200 });
  }

  // ═══ Tutorial Hints ═══
  _updateTutorial() {
    if (this.tutorialShown) return;
    const t = this.gameElapsed;
    if (t > 30) { this.tutorialShown = true; return; }

    const hints = [
      { start: 0, end: 5, text: '🕹️ 조이스틱으로 이동하세요' },
      { start: 15, end: 20, text: '🪵 나무를 채취해 모닥불을 피우세요' },
      { start: 25, end: 30, text: '🌡️ 온도가 0 이하로 떨어지면 HP가 깎입니다' },
    ];

    let activeHint = null;
    for (const h of hints) {
      if (t >= h.start && t < h.end) { activeHint = h; break; }
    }

    if (activeHint) {
      if (!this._tutorialText) {
        this._tutorialText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 80, '', {
          fontSize: '15px', fontFamily: 'monospace', color: '#FFFFFF',
          backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 14, y: 8 },
          stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
      }
      this._tutorialText.setText(activeHint.text).setVisible(true);
    } else {
      if (this._tutorialText) this._tutorialText.setVisible(false);
    }
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
    // Note: group-level overlap in create() handles collection; no per-drop overlap needed
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

  // ═══ XP SYSTEM ═══
  _getXPRequired(lv) {
    return lv < XP_TABLE.length ? XP_TABLE[lv] : XP_TABLE[XP_TABLE.length - 1] + (lv - XP_TABLE.length + 1) * 400;
  }

  gainXP(source) {
    const amount = (typeof source === 'number') ? source : (XP_SOURCES[source] ?? XP_SOURCES.default);
    this.playerXP += amount;
    while (this.playerXP >= this._getXPRequired(this.playerLevel)) {
      this.playerXP -= this._getXPRequired(this.playerLevel);
      this.playerLevel++;
      this.pendingLevelUps++;
    }
    if (this.pendingLevelUps > 0 && !this.upgradeUIActive) {
      this.pendingLevelUps--;
      this.triggerLevelUp();
    }
  }

  triggerLevelUp() {
    // Level up sound
    playLevelUp();

    // Level up effect - enhanced
    this.cameras.main.flash(400, 255, 215, 0, true);
    this.cameras.main.shake(300, 0.008);
    this.showFloatingText(this.player.x, this.player.y - 50, `⬆️ Level ${this.playerLevel}!`, '#FFD700', 1500);

    // Golden edge vignette flash
    const edgeFlash = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY,
      this.cameras.main.width, this.cameras.main.height, 0xFFD700, 0)
      .setDepth(99).setScrollFactor(0);
    this.tweens.add({ targets: edgeFlash, alpha: { from: 0.3, to: 0 }, duration: 600, ease: 'Quad.Out',
      onComplete: () => edgeFlash.destroy() });

    // Large center text
    const lvText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 60,
      `LEVEL UP! Lv.${this.playerLevel}`, {
      fontSize: '48px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000', strokeThickness: 6, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
    this.tweens.add({ targets: lvText, y: lvText.y - 40, alpha: 0, scale: { from: 1.2, to: 0.6 },
      duration: 2000, ease: 'Quad.Out', onComplete: () => lvText.destroy() });

    // Circular particle burst - enhanced (24 particles, 2 rings)
    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? 16 : 8;
      const radius = ring === 0 ? 70 : 40;
      const delay = ring * 100;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 / count) * i + ring * 0.2;
        const colors = [0xFFFFFF, 0xFFD700, 0xFFF8DC, 0xFFAA00];
        const p = this.add.circle(this.player.x, this.player.y, ring === 0 ? 5 : 3, Phaser.Utils.Array.GetRandom(colors))
          .setDepth(15).setAlpha(0.9);
        this.tweens.add({ targets: p, delay,
          x: this.player.x + Math.cos(ang) * radius,
          y: this.player.y + Math.sin(ang) * radius,
          alpha: 0, scale: { from: 1.8, to: 0 }, duration: 900, ease: 'Quad.Out',
          onComplete: () => p.destroy() });
      }
    }

    // Show upgrade card selection
    const cards = this.upgradeManager.pickThreeCards();
    if (cards.length > 0) {
      this.showUpgradeUI(cards);
    }
  }

  processLevelUpQueue() {
    if (this.pendingLevelUps > 0 && !this.upgradeUIActive) {
      this.pendingLevelUps--;
      this.triggerLevelUp();
    }
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
              // Dodge check
              if (this.upgradeManager.dodgeChance > 0 && Math.random() < this.upgradeManager.dodgeChance) {
                a.atkCD = 0.8;
                this.showFloatingText(px, py - 25, '🌀 회피!', '#88DDFF');
                return;
              }
              const actualDmg = a.def.damage * (1 - this.upgradeManager.armorReduction);
              this.playerHP -= actualDmg; a.atkCD = 1.2; playHurt();
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

      // FROST_WALKER: slow nearby enemies when player is moving
      if (this.upgradeManager.frostWalkerActive && this.player.body &&
          (Math.abs(this.player.body.velocity.x) > 5 || Math.abs(this.player.body.velocity.y) > 5)) {
        if (dist < 150) {
          a.body.velocity.scale(0.9);
        }
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
            this.res.meat -= 3; this.res.gold += Math.floor(5 * (1 + this.upgradeManager.sellBonus)); npc.actionTimer = 2.5;
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
    SaveManager.save(this); this._showSaveIndicator();
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
        const cfBoost = this.upgradeManager.campfireBoost;
        this.temperature = Math.min(this.maxTemp, this.temperature + effects.healthRegen * intensity * dt * cfBoost);
        this.playerHP = Math.min(this.playerMaxHP, this.playerHP + effects.healthRegen * intensity * dt * cfBoost);
        this.res.gold = (this.res.gold || 0) + effects.goldGeneration * intensity * dt * cfBoost;
        if (pd < 100) {
          this._campfireAttackBonus = Math.max(this._campfireAttackBonus, effects.attackSpeedBonus);
          this.playerSpeed = this.playerBaseSpeed * effects.moveSpeedBonus;
        }
      }
    });

    if (!this._nearCampfire) {
      this.playerSpeed = this.blizzardActive ? this.playerBaseSpeed * 0.8 : this.playerBaseSpeed;
    }

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
    this.stats.crafted++; playCraft(); SaveManager.save(this);
    this.showFloatingText(this.player.x, this.player.y - 30, '✨ '+recipe.icon+' '+recipe.name+' 제작!', '#64B5F6');
  }

  updateSurvival(dt) {
    // Base temp decay + zone penalty, multiplied by blizzard
    const zone = this.getPlayerZone();
    const zoneDecay = ZONE_TEMP_DECAY[zone] || 0;
    const baseDecay = 0.5 * (1 - this.warmthResist); // warmthResist now directly reduces decay
    const frostRes = this.upgradeManager ? this.upgradeManager.frostResistance : 0;
    this.temperature = Math.max(0, this.temperature - (baseDecay + Math.abs(zoneDecay)) * this.blizzardMultiplier * (1 - frostRes) * dt);
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
    if (this.temperature <= 0) { this.playerHP -= 8 * dt; if (this.playerHP <= 0) this.endGame(); }
    if (this.hunger <= 0) { this.playerHP -= 5 * dt; if (this.playerHP <= 0) this.endGame(); }
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

  createVirtualJoystick() {
    this.joystickActive = false;
    this._vjoy = null; // virtual joystick state
    this._smoothMove = { x: 0, y: 0 }; // for lerp smoothing
    const self = this;

    // Create joystick container (hidden by default)
    const base = document.createElement('div');
    base.id = 'vjoystick-base';
    const safeB = this.safeBottom || 0;
    base.style.cssText = `
      position:fixed; width:160px; height:160px;
      left:10px; bottom:${70 + safeB}px;
      border-radius:50%; border:2.5px solid rgba(255,255,255,0.25);
      background:radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%);
      pointer-events:none; z-index:2000;
      opacity:0.35;
      transition: opacity 0.15s ease;
    `;
    const knob = document.createElement('div');
    knob.id = 'vjoystick-knob';
    knob.style.cssText = `
      position:absolute; width:70px; height:70px; border-radius:50%;
      background:radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%);
      border:2px solid rgba(255,255,255,0.55);
      top:50%; left:50%; transform:translate(-50%,-50%);
      pointer-events:none;
      opacity:0.7;
      transition: opacity 0.12s ease;
    `;
    base.appendChild(knob);
    document.body.appendChild(base);

    const isUITouch = (cx, cy) => {
      // Bottom buttons area
      const h = window.innerHeight;
      const safeB = self.safeBottom || 0;
      if (cy > h - 60 - safeB) return true;
      // Top HUD
      if (cy < 120 && cx < 260) return true;
      // Active panel (right side)
      if (self.activePanel && cx > window.innerWidth - 240 && cy > 60) return true;
      return false;
    };

    // Track which touch ID is the joystick
    let activeTouchId = null;

    const onStart = (e) => {
      if (self.gameOver) return;
      // Find the first new touch that's not on UI
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (activeTouchId !== null) break; // already have a joystick touch
        if (isUITouch(t.clientX, t.clientY)) continue;
        // Check if touching a DOM button
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (el && (el.tagName === 'BUTTON' || el.closest('#bottom-buttons') || el.closest('#dom-hud'))) continue;

        e.preventDefault();
        activeTouchId = t.identifier;
        self.joystickActive = true;
        // Use center of the fixed joystick base as origin
        const rect = base.getBoundingClientRect();
        self._vjoy = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };

        base.style.opacity = '0.55';
        knob.style.opacity = '0.9';
        knob.style.transform = 'translate(-50%, -50%)';
        break;
      }
    };

    const onMove = (e) => {
      if (activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== activeTouchId) continue;
        e.preventDefault();
        const dx = t.clientX - self._vjoy.cx;
        const dy = t.clientY - self._vjoy.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxR = 60;
        const clamp = Math.min(dist, maxR);
        const ang = Math.atan2(dy, dx);
        const kx = Math.cos(ang) * clamp;
        const ky = Math.sin(ang) * clamp;
        knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;

        // Analog input: normalize by maxR for smooth 0~1 range
        if (dist > 8) {
          const strength = Math.min(1, dist / maxR);
          self._smoothMove.x = Math.cos(ang) * strength;
          self._smoothMove.y = Math.sin(ang) * strength;
        } else {
          self._smoothMove.x = 0;
          self._smoothMove.y = 0;
        }
        break;
      }
    };

    const onEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          activeTouchId = null;
          self.joystickActive = false;
          self._smoothMove.x = 0;
          self._smoothMove.y = 0;
          base.style.opacity = '0.35';
          knob.style.opacity = '0.7';
          knob.style.transform = 'translate(-50%, -50%)';
          break;
        }
      }
    };

    document.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd, { passive: false });
    document.addEventListener('touchcancel', onEnd, { passive: false });

    // ─── Desktop mouse support (joystick via mouse drag) ───
    const MOUSE_ID = -1; // synthetic touch id for mouse
    const onMouseDown = (e) => {
      if (self.gameOver) return;
      if (isUITouch(e.clientX, e.clientY)) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && (el.tagName === 'BUTTON' || el.closest('#bottom-buttons') || el.closest('#dom-hud'))) return;
      if (activeTouchId !== null) return;
      activeTouchId = MOUSE_ID;
      self.joystickActive = true;
      const rect = base.getBoundingClientRect();
      self._vjoy = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
      base.style.opacity = '0.55';
      knob.style.opacity = '0.9';
      knob.style.transform = 'translate(-50%, -50%)';
    };
    const onMouseMove = (e) => {
      if (activeTouchId !== MOUSE_ID) return;
      const dx = e.clientX - self._vjoy.cx;
      const dy = e.clientY - self._vjoy.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = 60;
      const clamp = Math.min(dist, maxR);
      const ang = Math.atan2(dy, dx);
      knob.style.transform = `translate(calc(-50% + ${Math.cos(ang)*clamp}px), calc(-50% + ${Math.sin(ang)*clamp}px))`;
      if (dist > 8) {
        const strength = Math.min(1, dist / maxR);
        self._smoothMove.x = Math.cos(ang) * strength;
        self._smoothMove.y = Math.sin(ang) * strength;
      } else {
        self._smoothMove.x = 0;
        self._smoothMove.y = 0;
      }
    };
    const onMouseUp = () => {
      if (activeTouchId !== MOUSE_ID) return;
      activeTouchId = null;
      self.joystickActive = false;
      self._smoothMove.x = 0;
      self._smoothMove.y = 0;
      base.style.opacity = '0.35';
      knob.style.opacity = '0.7';
      knob.style.transform = 'translate(-50%, -50%)';
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  createUI() {
    // HUD is now fully DOM-based (see index.html #dom-hud)
    // Create inventory capacity element dynamically
    const resEl = document.getElementById('res-text');
    let invCapEl = document.getElementById('inv-cap');
    if (!invCapEl && resEl && resEl.parentNode) {
      invCapEl = document.createElement('div');
      invCapEl.id = 'inv-cap';
      invCapEl.style.cssText = 'font-size:11px;color:#AABBCC;margin-top:2px;';
      resEl.parentNode.insertBefore(invCapEl, resEl.nextSibling);
    }
    this._dom = {
      res: resEl,
      invCap: invCapEl,
      hpFill: document.getElementById('hp-fill'),
      hpText: document.getElementById('hp-text'),
      tempFill: document.getElementById('temp-fill'),
      tempText: document.getElementById('temp-text'),
      hungerFill: document.getElementById('hunger-fill'),
      hungerText: document.getElementById('hunger-text'),
      quest: document.getElementById('quest-text'),
      buff: document.getElementById('buff-text'),
      xpFill: document.getElementById('xp-fill'),
      xpText: document.getElementById('xp-text'),
      actText: document.getElementById('act-text'),
    };

    // ═══ DOM Buttons (100% reliable touch) ═══
    const scene = this;
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); resumeAudio(); fn(); });
    };
    bind('btn-build', () => scene.toggleBuildMenu());
    bind('btn-craft', () => scene.toggleCraftMenu());
    bind('btn-hire', () => scene.toggleHireMenu());
    bind('btn-inv', () => scene.toggleInventoryMenu());
    bind('btn-eat', () => scene.interactNearest());
    bind('btn-sound', () => {
      soundEnabled = !soundEnabled;
      if (!soundEnabled) { stopFire(); stopBGM(); _bgmStarted=false; }
      else { _bgmStarted=false; resumeAudio(); }
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
  toggleInventoryMenu() { this.showPanel('inventory'); }

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
    } else if (type === 'inventory') {
      // Show current resources with drop option
      const icons = {meat:'🥩',wood:'🪵',stone:'🪨',leather:'🧶',gold:'💰'};
      const dropAmounts = {meat:5, wood:10, stone:10, leather:5, gold:10};
      items = Object.entries(this.res)
        .filter(([k,v]) => k !== 'gold' && v > 0)
        .map(([k,v]) => ({
          key:k, label:icons[k]+' '+k+': '+Math.floor(v),
          sub:'버리기 -'+dropAmounts[k]+'개 | 보유: '+Math.floor(v),
          desc:'터치하면 '+dropAmounts[k]+'개 버림 (총량 확보)',
          action:() => {
            const amt = Math.min(dropAmounts[k]||5, this.res[k]||0);
            if (amt <= 0) return;
            this.res[k] = Math.max(0, (this.res[k]||0) - amt);
            this.showFloatingText(this.player.x, this.player.y-20, '🗑️ '+icons[k]+'×'+amt+' 버림', '#FF9988');
            this.clearPanel(); this.showPanel('inventory');
          }
        }));
      // Shop tab: buy with gold
      const shopItems = [
        {key:'buy_meat', label:'💰→🥩 고기 구매', sub:'금화 5개 → 고기 10개', desc:'상인에게 구매', action:()=>{ if((this.res.gold||0)<5){this.showFloatingText(this.player.x,this.player.y-20,'❌ 금화 부족',  '#FF6666');return;} this.res.gold-=5;this.res.meat=(this.res.meat||0)+10;playCoin();this.showFloatingText(this.player.x,this.player.y-20,'🥩+10 구매완료','#FFDD44');}},
        {key:'buy_wood', label:'💰→🪵 나무 구매', sub:'금화 5개 → 나무 10개', desc:'상인에게 구매', action:()=>{ if((this.res.gold||0)<5){this.showFloatingText(this.player.x,this.player.y-20,'❌ 금화 부족',  '#FF6666');return;} this.res.gold-=5;this.res.wood=(this.res.wood||0)+10;playCoin();this.showFloatingText(this.player.x,this.player.y-20,'🪵+10 구매완료','#FFDD44');}},
        {key:'buy_stone', label:'💰→🪨 돌 구매',  sub:'금화 5개 → 돌 10개',  desc:'상인에게 구매', action:()=>{ if((this.res.gold||0)<5){this.showFloatingText(this.player.x,this.player.y-20,'❌ 금화 부족',  '#FF6666');return;} this.res.gold-=5;this.res.stone=(this.res.stone||0)+10;playCoin();this.showFloatingText(this.player.x,this.player.y-20,'🪨+10 구매완료','#FFDD44');}},
        {key:'buy_hp',   label:'💰→❤️ 체력 회복', sub:'금화 10개 → HP+50',   desc:'포션 구매',   action:()=>{ if((this.res.gold||0)<10){this.showFloatingText(this.player.x,this.player.y-20,'❌ 금화 부족', '#FF6666');return;} this.res.gold-=10;this.playerHP=Math.min(this.playerHP+50,this.playerMaxHP);playCoin();this.showFloatingText(this.player.x,this.player.y-20,'❤️+50 회복!','#FF6688');}},
      ];
      items = [...items, ...shopItems];
    }
    const panelH = Math.min(items.length * 60 + 20, h - 140);
    this.panelBg.setVisible(true).clear();
    this.panelBg.fillStyle(0x0a0a1e, 0.93); this.panelBg.fillRoundedRect(px, py, pw, panelH, 10);
    this.panelBg.lineStyle(2, 0x4466aa, 0.6); this.panelBg.strokeRoundedRect(px, py, pw, panelH, 10);
    const titles = { build:'🔥 건설', craft:'🔨 제작', hire:'👥 고용', inventory:'🎒 인벤/상점' };
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
    const total = Object.entries(this.res).filter(([k])=>k!=='gold').reduce((a,[_,v])=>a+(v||0),0);
    const isFull = total >= this.storageCapacity;
    d.res.textContent = Object.entries(this.res).filter(([_,v])=>v>0).map(([k,v])=>icons[k]+Math.floor(v)).join(' ');
    // Show inventory capacity
    d.res.style.color = isFull ? '#FF6666' : '#FFFFFF';
    if (d.invCap) d.invCap.textContent = `📦 ${Math.floor(total)}/${this.storageCapacity}`;
    
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
    
    if (d.xpFill) {
      const req = this._getXPRequired(this.playerLevel);
      const xpR = Math.min(1, this.playerXP / req);
      d.xpFill.style.width = (xpR * 100) + '%';
      d.xpText.textContent = `Lv${this.playerLevel} · ${Math.floor(this.playerXP)}/${req} XP`;
    }

    // Act & Timer display
    if (d.actText) {
      const totalSec = Math.floor(this.gameElapsed);
      const mm = Math.floor(totalSec / 60).toString().padStart(2, '0');
      const ss = (totalSec % 60).toString().padStart(2, '0');
      d.actText.textContent = `Act ${this.currentAct} · ${mm}:${ss}`;
      if (this.blizzardActive) {
        d.actText.textContent += ` ❄️한파!`;
        d.actText.style.color = '#6699FF';
      } else {
        d.actText.style.color = '#FFDD88';
      }
    }

    // Zone indicator
    const zoneEl = document.getElementById('zone-indicator');
    if (zoneEl) {
      const zone = this.getPlayerZone();
      const zoneNames = { safe: '🏠 안전', normal: '🌲 일반', danger: '⚠️ 위험', extreme: '☠️ 극한' };
      zoneEl.textContent = zoneNames[zone];
    }
    
    this.npcLabels.forEach(l=>l.destroy()); this.npcLabels = [];
    this.npcsOwned.forEach(npc => {
      if (!npc.active) return;
      const l = this.add.text(npc.x, npc.y-22, npc.npcDef.name, {
        fontSize:'11px',fontFamily:'monospace',color:'#FFDD88',stroke:'#000',strokeThickness:2
      }).setDepth(12).setOrigin(0.5);
      this.npcLabels.push(l);
    });
  }

  // ═══ SUPPLY CRATE SYSTEM ═══
  spawnSupplyCrate() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 100;
    const cx = this.player.x + Math.cos(angle) * dist;
    const cy = this.player.y + Math.sin(angle) * dist;
    const tx = Phaser.Math.Clamp(cx, 50, WORLD_W - 50);
    const ty = Phaser.Math.Clamp(cy, 50, WORLD_H - 50);

    const crate = this.physics.add.sprite(tx, ty - 200, 'supply_crate').setDepth(8).setScale(0).setAlpha(0);
    crate.body.setAllowGravity(false);
    crate.body.setSize(28, 24);
    crate.isCrate = true;
    crate._sparkleTimer = 0;

    // Drop animation
    playBoxAppear();
    this.tweens.add({
      targets: crate, y: ty, scale: 1.2, alpha: 1,
      duration: 600, ease: 'Bounce.Out',
      onComplete: () => {
        this.tweens.add({ targets: crate, scale: { from: 1.2, to: 1 }, duration: 200 });
        // Glow pulse
        this.tweens.add({
          targets: crate, scale: 1.15, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut'
        });
      }
    });

    // Impact particles
    this.time.delayedCall(500, () => {
      for (let i = 0; i < 6; i++) {
        const p = this.add.image(tx, ty, 'sparkle').setDepth(15).setScale(1.5);
        this.tweens.add({
          targets: p, x: tx + Phaser.Math.Between(-30, 30), y: ty + Phaser.Math.Between(-30, 10),
          alpha: 0, scale: 0, duration: 400, onComplete: () => p.destroy()
        });
      }
    });

    // Label
    const label = this.add.text(tx, ty - 24, '📦 보급상자', {
      fontSize: '11px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000', strokeThickness: 3
    }).setDepth(9).setOrigin(0.5);
    crate._label = label;

    this.supplyCrates.push(crate);
    this.physics.add.overlap(this.player, crate, () => this.openCrate(crate));

    this.showFloatingText(this.player.x, this.player.y - 30, '📦 보급상자 출현!', '#FFD700');
  }

  openCrate(crate) {
    if (!crate.active || this.upgradeUIActive) return;
    const cards = this.upgradeManager.pickThreeCards();
    if (cards.length === 0) {
      this.showFloatingText(crate.x, crate.y - 20, '✅ 모든 업그레이드 최대!', '#88FF88');
      if (crate._label) crate._label.destroy();
      crate.destroy();
      return;
    }

    // Remove crate with burst effect
    for (let i = 0; i < 10; i++) {
      const p = this.add.image(crate.x, crate.y, 'sparkle').setDepth(15).setScale(2);
      this.tweens.add({
        targets: p, x: crate.x + Phaser.Math.Between(-50, 50), y: crate.y + Phaser.Math.Between(-50, 50),
        alpha: 0, scale: 0, duration: 500, onComplete: () => p.destroy()
      });
    }
    if (crate._label) crate._label.destroy();
    this.supplyCrates = this.supplyCrates.filter(c => c !== crate);
    crate.destroy();

    this.showUpgradeUI(cards);
  }

  // ═══ TRIPLE CHOICE UPGRADE UI ═══
  showUpgradeUI(cards) {
    this.upgradeUIActive = true;
    this.physics.pause();
    const cam = this.cameras.main;
    const W = cam.width, H = cam.height;

    // Clean up any previous upgrade UI elements to prevent text overlap
    if (this._upgradeUIElements) {
      this._upgradeUIElements.forEach(el => {
        if (el && el.destroy) { try { el.destroy(); } catch(e) {} }
      });
      this._upgradeUIElements = null;
    }

    // Container for all UI elements
    const uiElements = [];

    // Dark overlay
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(300);
    overlay.fillStyle(0x000000, 0).fillRect(0, 0, W, H);
    uiElements.push(overlay);
    this.tweens.add({ targets: { v: 0 }, v: 0.75, duration: 300,
      onUpdate: (_, t) => { overlay.clear(); overlay.fillStyle(0x000000, t.v); overlay.fillRect(0, 0, W, H); }
    });

    // Title
    const title = this.add.text(W / 2, H * 0.12, '⬆️ 업그레이드 선택', {
      fontSize: Math.min(28, W * 0.05) + 'px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000', strokeThickness: 4
    }).setScrollFactor(0).setDepth(301).setOrigin(0.5).setAlpha(0);
    uiElements.push(title);
    this.tweens.add({ targets: title, alpha: 1, y: title.y + 10, duration: 400, ease: 'Back.Out' });

    const subtitle = this.add.text(W / 2, H * 0.18, '카드를 선택하세요', {
      fontSize: '14px', fontFamily: 'monospace', color: '#AABBCC'
    }).setScrollFactor(0).setDepth(301).setOrigin(0.5).setAlpha(0);
    uiElements.push(subtitle);
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 500, delay: 200 });

    // Card dimensions
    const cardW = Math.min(160, (W - 60) / 3);
    const cardH = Math.min(240, H * 0.55);
    const gap = Math.min(16, W * 0.02);
    const totalW = cardW * 3 + gap * 2;
    const startX = (W - totalW) / 2;
    const cardY = H * 0.25;

    cards.forEach((key, i) => {
      const upgrade = UPGRADES[key];
      const cat = UPGRADE_CATEGORIES[upgrade.category];
      const rarityInfo = RARITY_LABELS[upgrade.rarity];
      const currentLv = this.upgradeManager.getLevel(key);
      const nextLv = currentLv + 1;
      const cx = startX + i * (cardW + gap) + cardW / 2;
      const cy = cardY + cardH / 2;

      // Card back (for flip animation)
      const cardBack = this.add.graphics().setScrollFactor(0).setDepth(302);
      cardBack.fillStyle(0x222244, 0.95);
      cardBack.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
      cardBack.lineStyle(3, 0x4466AA, 0.8);
      cardBack.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
      // Pattern on back
      cardBack.fillStyle(0x334466, 0.5);
      cardBack.fillCircle(cx, cy, 20);
      const qmark = this.add.text(cx, cy, '?', {
        fontSize: '36px', fontFamily: 'monospace', color: '#6688AA'
      }).setScrollFactor(0).setDepth(303).setOrigin(0.5);
      uiElements.push(cardBack, qmark);

      // Card front (hidden initially)
      const cardGfx = this.add.graphics().setScrollFactor(0).setDepth(304).setAlpha(0);
      // Background
      cardGfx.fillStyle(0x1a1a2e, 0.95);
      cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
      // Category color border
      cardGfx.lineStyle(3, cat.bgColor, 1);
      cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
      // Top color band
      cardGfx.fillStyle(cat.bgColor, 0.3);
      cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, 50, { tl: 12, tr: 12, bl: 0, br: 0 });
      // Rarity glow for epic
      if (upgrade.rarity === 'epic') {
        cardGfx.lineStyle(2, 0xAA44FF, 0.6);
        cardGfx.strokeRoundedRect(cx - cardW / 2 - 3, cy - cardH / 2 - 3, cardW + 6, cardH + 6, 14);
      }
      uiElements.push(cardGfx);

      // Card content texts (hidden initially)
      const iconText = this.add.text(cx, cy - cardH / 2 + 30, upgrade.icon, {
        fontSize: '32px'
      }).setScrollFactor(0).setDepth(305).setOrigin(0.5).setAlpha(0);

      const nameText = this.add.text(cx, cy - cardH / 2 + 62, upgrade.name, {
        fontSize: '15px', fontFamily: 'monospace', color: cat.color,
        stroke: '#000', strokeThickness: 2, fontStyle: 'bold'
      }).setScrollFactor(0).setDepth(305).setOrigin(0.5).setAlpha(0);

      const descText = this.add.text(cx, cy - cardH / 2 + 84, upgrade.desc, {
        fontSize: '12px', fontFamily: 'monospace', color: '#CCDDEE',
        wordWrap: { width: cardW - 20 }, align: 'center'
      }).setScrollFactor(0).setDepth(305).setOrigin(0.5).setAlpha(0);

      const rarityText = this.add.text(cx, cy + cardH / 2 - 55, rarityInfo.name, {
        fontSize: '11px', fontFamily: 'monospace', color: rarityInfo.color,
        stroke: '#000', strokeThickness: 2
      }).setScrollFactor(0).setDepth(305).setOrigin(0.5).setAlpha(0);

      // Level indicator
      let lvStr = '';
      for (let l = 0; l < upgrade.maxLevel; l++) {
        lvStr += l < nextLv ? '★' : '☆';
      }
      const lvText = this.add.text(cx, cy + cardH / 2 - 35, 'Lv.' + nextLv + ' ' + lvStr, {
        fontSize: '12px', fontFamily: 'monospace', color: '#FFD700',
        stroke: '#000', strokeThickness: 2
      }).setScrollFactor(0).setDepth(305).setOrigin(0.5).setAlpha(0);

      const catText = this.add.text(cx, cy + cardH / 2 - 18, cat.icon + ' ' + cat.name, {
        fontSize: '11px', fontFamily: 'monospace', color: cat.color
      }).setScrollFactor(0).setDepth(305).setOrigin(0.5).setAlpha(0);

      const frontElements = [cardGfx, iconText, nameText, descText, rarityText, lvText, catText];
      uiElements.push(iconText, nameText, descText, rarityText, lvText, catText);

      // Flip animation: delay per card
      const flipDelay = 300 + i * 250;
      this.time.delayedCall(flipDelay, () => {
        // Hide back
        this.tweens.add({ targets: [cardBack, qmark], scaleX: 0, duration: 150, ease: 'Quad.In',
          onComplete: () => { cardBack.setAlpha(0); qmark.setAlpha(0); }
        });
        // Show front
        this.time.delayedCall(150, () => {
          frontElements.forEach(el => {
            el.setAlpha(1);
            if (el.setScale) el.setScale(1, 1);
          });
          // Scale-in effect
          this.tweens.add({
            targets: frontElements, scaleX: { from: 0, to: 1 }, duration: 200, ease: 'Back.Out'
          });
          // Rarity sparkle
          if (upgrade.rarity === 'epic' || upgrade.rarity === 'rare') {
            for (let s = 0; s < (upgrade.rarity === 'epic' ? 8 : 4); s++) {
              this.time.delayedCall(s * 50, () => {
                const sp = this.add.image(cx + Phaser.Math.Between(-cardW/2, cardW/2), cy + Phaser.Math.Between(-cardH/2, cardH/2), 'sparkle')
                  .setScrollFactor(0).setDepth(306).setScale(1.5).setTint(upgrade.rarity === 'epic' ? 0xAA44FF : 0x4488FF);
                uiElements.push(sp);
                this.tweens.add({ targets: sp, alpha: 0, scale: 0, y: sp.y - 20, duration: 600, onComplete: () => sp.destroy() });
              });
            }
          }
        });
      });

      // Interactive zone (enabled after flip)
      const zone = this.add.zone(cx, cy, cardW, cardH).setScrollFactor(0).setDepth(310).setInteractive();
      uiElements.push(zone);

      // Hover effect
      zone.on('pointerover', () => {
        if (cardGfx.alpha > 0) {
          cardGfx.clear();
          cardGfx.fillStyle(0x2a2a4e, 0.95);
          cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
          cardGfx.lineStyle(4, cat.bgColor, 1);
          cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
          cardGfx.fillStyle(cat.bgColor, 0.4);
          cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, 50, { tl: 12, tr: 12, bl: 0, br: 0 });
        }
      });
      zone.on('pointerout', () => {
        if (cardGfx.alpha > 0) {
          cardGfx.clear();
          cardGfx.fillStyle(0x1a1a2e, 0.95);
          cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
          cardGfx.lineStyle(3, cat.bgColor, 1);
          cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
          cardGfx.fillStyle(cat.bgColor, 0.3);
          cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, 50, { tl: 12, tr: 12, bl: 0, br: 0 });
        }
      });

      zone.on('pointerdown', () => {
        if (cardGfx.alpha < 0.5) return; // not yet revealed
        this.selectUpgrade(key, uiElements, cx, cy);
      });
    });

    this._upgradeUIElements = uiElements;
  }

  selectUpgrade(key, uiElements, cx, cy) {
    const upgrade = UPGRADES[key];
    const cat = UPGRADE_CATEGORIES[upgrade.category];

    // Sound on selection
    if (upgrade.rarity === 'epic') playEpicCard();
    else playUpgradeSelect();

    // Apply upgrade
    this.upgradeManager.applyUpgrade(key, this);

    // Selection burst effect
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const p = this.add.image(cx, cy, 'sparkle')
        .setScrollFactor(0).setDepth(320).setScale(2).setTint(cat.bgColor);
      this.tweens.add({
        targets: p, x: cx + Math.cos(ang) * 80, y: cy + Math.sin(ang) * 80,
        alpha: 0, scale: 0, duration: 500, onComplete: () => p.destroy()
      });
    }

    // Acquisition text
    const acqText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.85,
      '✨ ' + upgrade.icon + ' ' + upgrade.name + ' 획득!', {
      fontSize: '22px', fontFamily: 'monospace', color: cat.color,
      stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(320).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: acqText, alpha: 1, scale: { from: 0.5, to: 1.2 }, duration: 400, ease: 'Back.Out',
      onComplete: () => {
        this.tweens.add({ targets: acqText, alpha: 0, y: acqText.y - 30, duration: 800, delay: 400,
          onComplete: () => acqText.destroy()
        });
      }
    });

    // Close UI after brief delay
    this.time.delayedCall(300, () => {
      uiElements.forEach(el => {
        if (el && el.active !== false && el.destroy) {
          this.tweens.add({ targets: el, alpha: 0, duration: 200, onComplete: () => { try { el.destroy(); } catch(e) {} } });
        }
      });
      this._upgradeUIElements = null;
      this.time.delayedCall(250, () => {
        this.upgradeUIActive = false;
        this.physics.resume();
        // Auto-save after upgrade
        SaveManager.save(this);
        // Process queued level-ups (pendingLevelUps)
        this.time.delayedCall(500, () => this.processLevelUpQueue());
      });
    });
  }

  // ═══ EXPLOSION ON KILL (upgrade effect) ═══
  triggerExplosion(x, y) {
    const radius = 60 + this.upgradeManager.explosionLevel * 30;
    const dmg = this.upgradeManager.explosionLevel;

    // Visual explosion
    const g = this.add.graphics().setDepth(15);
    let ring = { r: 10, a: 0.8 };
    this.tweens.add({
      targets: ring, r: radius, a: 0, duration: 300,
      onUpdate: () => { g.clear(); g.fillStyle(0xFF6600, ring.a * 0.3); g.fillCircle(x, y, ring.r); g.lineStyle(3, 0xFF4400, ring.a); g.strokeCircle(x, y, ring.r); },
      onComplete: () => g.destroy()
    });

    // Damage nearby enemies
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      if (Phaser.Math.Distance.Between(x, y, a.x, a.y) < radius) {
        this.damageAnimal(a, dmg);
      }
    });

    // Particles
    for (let i = 0; i < 8; i++) {
      const p = this.add.image(x, y, 'fire_particle').setDepth(15).setScale(2);
      this.tweens.add({
        targets: p, x: x + Phaser.Math.Between(-50, 50), y: y + Phaser.Math.Between(-50, 50),
        alpha: 0, scale: 0, duration: 400, onComplete: () => p.destroy()
      });
    }
  }

  // ═══ 5-ACT ENEMY SYSTEM ═══
  getCurrentAct() {
    const min = this.gameElapsed / 60;
    if (min < 10) return 1;
    if (min < 20) return 2;
    if (min < 35) return 3;
    if (min < 50) return 4;
    return 5;
  }

  getWaveSize() {
    const min = this.gameElapsed / 60;
    if (min < 4) return 10;
    if (min < 8) return 20;
    if (min < 12) return 40;
    if (min < 20) return 60;
    if (min < 30) return 80;
    return 100;
  }

  getSpawnConfig() {
    const min = this.gameElapsed / 60;
    let weights, maxCount, spawnInterval;
    if (min < 3) {
      weights = { rabbit: 5, deer: 3, penguin: 2 }; maxCount = 12; spawnInterval = 10000;
    } else if (min < 6) {
      weights = { rabbit: 4, deer: 3, penguin: 2, wolf: 1 }; maxCount = 18; spawnInterval = 8000;
    } else if (min < 10) {
      weights = { rabbit: 3, deer: 2, penguin: 2, wolf: 2, bear: 1 }; maxCount = 24; spawnInterval = 7000;
    } else if (min < 15) {
      weights = { rabbit: 2, deer: 2, penguin: 1, wolf: 3, bear: 2 }; maxCount = 30; spawnInterval = 6000;
    } else if (min < 20) {
      weights = { rabbit: 1, deer: 1, wolf: 3, bear: 3, seal: 2 }; maxCount = 36; spawnInterval = 5000;
    } else {
      weights = { wolf: 3, bear: 4, seal: 3 }; maxCount = 40; spawnInterval = 4000;
    }
    return { weights, maxCount, spawnInterval };
  }

  pickAnimalType(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const [type, w] of Object.entries(weights)) {
      r -= w;
      if (r <= 0) return type;
    }
    return Object.keys(weights)[0];
  }

  getSpawnWeights() {
    return this.getSpawnConfig().weights;
  }

  getMaxAnimals() {
    return this.getSpawnConfig().maxCount;
  }

  // ═══ BLIZZARD (한파) SYSTEM ═══
  checkBlizzardSchedule() {
    if (this.blizzardIndex >= BLIZZARD_SCHEDULE.length) return;
    if (!this.gameStartTime) return;
    const elapsed = this.time.now - this.gameStartTime;
    const next = BLIZZARD_SCHEDULE[this.blizzardIndex];

    // 60초 전 경고
    const warnTime = next.startMs - 60 * 1000;
    if (!this.blizzardWarned && elapsed >= warnTime && elapsed < next.startMs) {
      this.blizzardWarned = true;
      this.startBlizzardWarning(next.startMs - elapsed);
    }

    // 한파 시작
    if (!this.blizzardActive && elapsed >= next.startMs) {
      this.startBlizzard(next);
    }
  }

  startBlizzardWarning(msUntil) {
    this.blizzardWarningEndTime = this.time.now + msUntil;
    const warnEl = document.getElementById('blizzard-warning');
    if (warnEl) warnEl.style.display = 'block';
    this.updateBlizzardWarning(Math.ceil(msUntil / 1000));
    if (this.blizzardCountdownTimer) this.blizzardCountdownTimer.remove();
    this.blizzardCountdownTimer = this.time.addEvent({
      delay: 1000, repeat: Math.ceil(msUntil / 1000) - 1,
      callback: () => {
        const remaining = this.blizzardWarningEndTime - this.time.now;
        if (remaining > 0) this.updateBlizzardWarning(Math.ceil(remaining / 1000));
      }
    });
  }

  updateBlizzardWarning(sec) {
    const el = document.getElementById('blizzard-countdown');
    if (el) el.textContent = Math.max(0, sec);
  }

  startBlizzard(config) {
    this.blizzardActive = true;
    this.blizzardMultiplier = config.tempMult;
    this.blizzardIndex++;
    this.blizzardWarned = false;
    if (this.blizzardCountdownTimer) { this.blizzardCountdownTimer.remove(); this.blizzardCountdownTimer = null; }

    // Hide warning, show active
    const warnEl = document.getElementById('blizzard-warning');
    const activeEl = document.getElementById('blizzard-active');
    if (warnEl) warnEl.style.display = 'none';
    if (activeEl) activeEl.style.display = 'block';

    // Slow player
    this.playerSpeed = this.playerBaseSpeed * 0.8;

    this.showCenterAlert(`❄️ 한파 ${this.blizzardIndex}/5 시작!`, '#4488FF');
    this.cameras.main.shake(300, 0.008);

    // End timer
    this.time.delayedCall(config.duration, () => {
      this.endBlizzard(config.reward);
    });
  }

  endBlizzard(reward) {
    this.blizzardActive = false;
    this.blizzardMultiplier = 1;
    this.playerSpeed = this.playerBaseSpeed;

    const activeEl = document.getElementById('blizzard-active');
    if (activeEl) activeEl.style.display = 'none';

    this.coldWaveOverlay.clear();
    this.coldWaveOverlay.setAlpha(0);

    this.showFloatingText(this.player.x, this.player.y - 60, '❄️ 한파 생존!', '#88CCFF', 2000);
    this.showCenterAlert('☀️ 한파 종료! 보상 지급!', '#FFDD44');

    // Reward
    this.res.gold = (this.res.gold || 0) + reward.gold;
    for (let i = 0; i < reward.boxes; i++) {
      this.time.delayedCall(i * 500, () => this.spawnSupplyCrate());
    }
  }

  updateBlizzardVisuals(dt) {
    if (this.blizzardActive) {
      const cam = this.cameras.main;
      const pulse = 0.15 + Math.sin(this.time.now / 500) * 0.05;
      this.coldWaveOverlay.clear();
      this.coldWaveOverlay.fillStyle(0x2244CC, pulse);
      this.coldWaveOverlay.fillRect(0, 0, cam.width, cam.height);
      this.coldWaveOverlay.setAlpha(1);
    }
  }

  // ═══ ZONE SYSTEM ═══
  getPlayerZone() {
    if (!this.player) return 'safe';
    const dist = Math.hypot(this.player.x - MAP_CENTER.x, this.player.y - MAP_CENTER.y);
    if (dist <= ZONE_RADII.safe) return 'safe';
    if (dist <= ZONE_RADII.normal) return 'normal';
    if (dist <= ZONE_RADII.danger) return 'danger';
    return 'extreme';
  }

  // ═══ BOSS SYSTEM ═══
  spawnBoss(type) {
    const isFinal = type === 'final';
    const bossHP = isFinal ? 2000 : 500;
    const bossScale = isFinal ? 2.5 : 1.8; // visual scale (sprite)
    const bossDmg = isFinal ? 25 : 12;
    const bossSpeed = isFinal ? 55 : 50;
    const bossName = isFinal ? '❄️ 폭풍왕' : '🐻‍❄️ 서리곰';

    // Spawn away from player
    const angle = Math.random() * Math.PI * 2;
    const dist = 400;
    const bx = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 80, WORLD_W - 80);
    const by = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 80, WORLD_H - 80);

    const boss = this.physics.add.sprite(bx, by, 'bear').setCollideWorldBounds(true).setDepth(5);
    boss.setScale(bossScale);
    boss.setTint(isFinal ? 0x6666FF : 0xAABBFF);
    boss.animalType = 'boss';
    boss.def = { hp: bossHP, speed: bossSpeed, damage: bossDmg, drops: { meat: isFinal ? 30 : 15, leather: isFinal ? 15 : 8 }, size: 26 * bossScale, behavior: 'chase', name: bossName, aggroRange: 500, fleeRange: 0, fleeDistance: 0, color: 0x6666FF };
    boss.hp = bossHP;
    boss.maxHP = bossHP;
    boss.wanderTimer = 0;
    boss.wanderDir = { x: 0, y: 0 };
    boss.hitFlash = 0;
    boss.atkCD = 0;
    boss.fleeTimer = 0;
    boss.isBoss = true;
    boss.hpBar = this.add.graphics().setDepth(6);
    boss.nameLabel = this.add.text(bx, by - boss.def.size - 10, bossName, {
      fontSize: '16px', fontFamily: 'monospace', color: '#FF4444', stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
    }).setDepth(6).setOrigin(0.5);
    this.animals.add(boss);

    // Epic entrance
    this.showCenterAlert(`⚠️ 보스 출현: ${bossName}`, '#FF4444');
    this.cameras.main.shake(500, 0.015);
    this.cameras.main.flash(300, 100, 100, 255);
  }

  // ═══ RHYTHM SYSTEM (15-20초 이벤트) ═══
  updateRhythm(dt) {
    this.rhythmTimer += dt;
    if (this.rhythmTimer >= this.nextRhythmInterval) {
      this.rhythmTimer = 0;
      this.nextRhythmInterval = 15 + Math.random() * 5; // 15~20s
      this.triggerRhythmEvent();
    }
  }

  triggerRhythmEvent() {
    // Pick an event type based on what's most needed
    const events = [];

    // Resource drop cluster
    events.push('resource_drop');
    events.push('resource_drop');

    // Blizzard warning (if one is coming soon)
    if (!this.blizzardActive && this.blizzardIndex < BLIZZARD_SCHEDULE.length) {
      const next = BLIZZARD_SCHEDULE[this.blizzardIndex];
      const elapsed = this.time.now - (this.gameStartTime || this.time.now);
      if (next.startMs - elapsed < 30000 && next.startMs - elapsed > 0) {
        events.push('cold_warning');
      }
    }

    // Wave alert
    if (this.waveTimer > 20) {
      events.push('wave_alert');
    }

    const event = events[Math.floor(Math.random() * events.length)];
    switch (event) {
      case 'resource_drop':
        this.spawnResourceCluster();
        break;
      case 'cold_warning':
        this.showCenterAlert('⚠️ 한파 접근 중...', '#4488FF');
        break;
      case 'wave_alert':
        this.showCenterAlert(`🐺 새 웨이브 접근 중!`, '#FF8844');
        break;
    }
  }

  spawnResourceCluster() {
    const types = ['meat', 'wood', 'stone', 'leather'];
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 120;
    const cx = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 50, WORLD_W - 50);
    const cy = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 50, WORLD_H - 50);
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      this.spawnDrop(type, cx + Phaser.Math.Between(-30, 30), cy + Phaser.Math.Between(-30, 30));
    }
    this.showFloatingText(cx, cy - 20, '🎁 자원 드롭!', '#FFD700');
  }

  showCenterAlert(text, color) {
    const cam = this.cameras.main;
    const t = this.add.text(cam.width / 2, cam.height * 0.15, text, {
      fontSize: '24px', fontFamily: 'monospace', color: color,
      stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(200).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: t, alpha: 1, scale: { from: 0.5, to: 1.1 }, duration: 400, ease: 'Back.Out',
      onComplete: () => {
        this.tweens.add({ targets: t, alpha: 0, y: t.y - 30, duration: 1500, delay: 1000, onComplete: () => t.destroy() });
      }
    });
  }

  endGame() {
    // GDD: HP 0 → 마을로 리스폰 2초 (게임오버 없음)
    if (this.gameOver || this.isRespawning) return;
    this.isRespawning = true;
    playHurt();
    const cam = this.cameras.main;
    cam.flash(400, 255, 0, 0);
    cam.shake(500, 0.02);

    const ov = this.add.graphics().setScrollFactor(0).setDepth(200);
    ov.fillStyle(0x000000, 0.6); ov.fillRect(0, 0, cam.width, cam.height);
    const msg = this.add.text(cam.width/2, cam.height/2, '💀 기절...\n마을로 이동 중', {
      fontSize:'32px', fontFamily:'monospace', color:'#FF8888', stroke:'#000', strokeThickness:4, align:'center', lineSpacing:8
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      // Restore player
      this.playerHP = Math.floor(this.playerMaxHP * 0.5); // 50% HP on respawn
      this.hunger = Math.min(this.maxHunger, this.hunger + 30);
      this.temperature = Math.min(this.maxTemp, this.maxTemp * 0.8);
      // Move to town center
      this.player.setPosition(WORLD_W / 2, WORLD_H - 200);
      this.cameras.main.flash(300, 255, 255, 255);
      ov.destroy();
      msg.destroy();
      this.isRespawning = false;
    });
  }

  update(time, deltaMs) {
    if (this.gameOver || this.upgradeUIActive || this.isRespawning) return;
    const dt = deltaMs / 1000;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    // ═══ Kill Combo Timer ═══
    if (this.killComboTimer > 0) {
      this.killComboTimer -= dt;
      if (this.killComboTimer <= 0) {
        this.killCombo = 0;
        this.killComboTimer = 0;
        this._updateComboDisplay();
      }
    }

    // ═══ Tutorial Hints ═══
    if (!this.tutorialShown && this.gameElapsed > 0) {
      this._updateTutorial();
    }

    // Mobile auto-attack
    if (this.attackCooldown <= 0) {
      let nearest = null, nearestDist = Infinity;
      this.animals.getChildren().forEach(a => {
        if (!a.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
        if (d < 60 && d < nearestDist) { nearest = a; nearestDist = d; }
      });
      if (nearest) {
        this.attackCooldown = this.getAttackCooldown();
        this.player.setTexture('player_attack');
        this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });
        this.damageAnimal(nearest, this.playerDamage); playSlash();
        this.showAttackFX(nearest.x, nearest.y, true);
        this.cameras.main.shake(50, 0.003);
        this.upgradeManager.attackCounter++; // Increment attack counter for successful hit
      } else {
        let nearestNode = null, nearestND = Infinity;
        this.resourceNodes.forEach(n => {
          if (n.depleted) return;
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
          if (d < 60 && d < nearestND) { nearestNode = n; nearestND = d; }
        });
        if (nearestNode) {
          this.attackCooldown = this.getAttackCooldown();
          this.player.setTexture('player_attack');
          this.time.delayedCall(150, () => { if(this.player.active) this.player.setTexture('player'); });
          this.harvestNode(nearestNode);
          this.showAttackFX(nearestNode.x, nearestNode.y, true);
          this.upgradeManager.attackCounter++; // Increment attack counter for successful hit
        }
      }
    }

    // Player movement with smooth lerp
    if (this._smoothMove) {
      // Smooth lerp for virtual joystick
      const lerpSpeed = 8 * dt; // smooth interpolation
      this.moveDir.x += (this._smoothMove.x - this.moveDir.x) * Math.min(1, lerpSpeed);
      this.moveDir.y += (this._smoothMove.y - this.moveDir.y) * Math.min(1, lerpSpeed);
      // Dead zone cleanup
      if (Math.abs(this.moveDir.x) < 0.01) this.moveDir.x = 0;
      if (Math.abs(this.moveDir.y) < 0.01) this.moveDir.y = 0;
    } else {
      this.moveDir.x = 0;
      this.moveDir.y = 0;
    }
    this.player.body.setVelocity(this.moveDir.x*this.playerSpeed, this.moveDir.y*this.playerSpeed);
    if (this.moveDir.x > 0.1) { this.player.setFlipX(false); this.facingRight = true; }
    else if (this.moveDir.x < -0.1) { this.player.setFlipX(true); this.facingRight = false; }

    // Upgrade: passive regen
    if (this.upgradeManager.regenPerSec > 0) {
      this.playerHP = Math.min(this.playerMaxHP, this.playerHP + this.upgradeManager.regenPerSec * dt);
    }
    // Upgrade: sparkle on supply crates
    this.supplyCrates.forEach(c => {
      if (!c.active) return;
      c._sparkleTimer = (c._sparkleTimer || 0) + dt;
      if (c._sparkleTimer > 0.5) {
        c._sparkleTimer = 0;
        const sp = this.add.image(c.x + Phaser.Math.Between(-14, 14), c.y + Phaser.Math.Between(-12, 12), 'sparkle').setDepth(9).setScale(0.8);
        this.tweens.add({ targets: sp, alpha: 0, y: sp.y - 15, scale: 0, duration: 500, onComplete: () => sp.destroy() });
      }
      if (c._label && c._label.active) c._label.setPosition(c.x, c.y - 24);
    });

    this.updateAnimalAI(dt);
    this.updateNPCs(dt);
    this.updateCampfireSystem(dt);
    this.updateSurvival(dt);

    this.resourceNodes.forEach(n => {
      if (!n.depleted) return;
      n.regenTimer -= dt;
      if (n.regenTimer <= 0) { n.depleted = false; n.nodeHP = n.nodeMaxHP; n.setAlpha(1); }
    });

    // ═══ Phase 2: Game Timer & Act ═══
    this.gameElapsed += dt;
    const newAct = this.getCurrentAct();
    if (newAct !== this.currentAct) {
      this.currentAct = newAct;
      this.showCenterAlert(`🎬 Act ${this.currentAct} 시작!`, '#FFD700');
      this.cameras.main.flash(500, 255, 255, 200);
    }

    // ═══ Wave Spawn (dynamic interval) ═══
    this.waveTimer += dt;
    const spawnConfig = this.getSpawnConfig();
    const spawnIntervalSec = spawnConfig.spawnInterval / 1000;
    if (this.waveTimer >= spawnIntervalSec) {
      this.waveTimer = 0;
      this.waveNumber++;
      const currentCount = this.animals.getChildren().length;
      const toSpawn = Math.max(0, Math.min(spawnConfig.maxCount - currentCount, 15));
      if (toSpawn > 0) {
        for (let i = 0; i < toSpawn; i++) {
          this.spawnAnimal(this.pickAnimalType(spawnConfig.weights));
        }
      }
    }

    // ═══ Blizzard Visuals ═══
    this.updateBlizzardVisuals(dt);

    // ═══ Phase 2: Boss Spawns ═══
    if (!this.boss1Spawned && this.gameElapsed >= 8 * 60) { // 8분으로 단축
      this.boss1Spawned = true;
      this.spawnBoss('first');
    }
    if (!this.boss2Spawned && this.gameElapsed >= 18 * 60) { // 18분으로 단축
      this.boss2Spawned = true;
      this.spawnBoss('final');
    }

    // ═══ Phase 2: Rhythm System ═══
    this.updateRhythm(dt);

    this.drops.getChildren().forEach(d => {
      if(!d.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, d.x, d.y);
      if (dist < this.upgradeManager.magnetRange) {
        const a = Phaser.Math.Angle.Between(d.x, d.y, this.player.x, this.player.y);
        const speed = 220 * (1 - dist / this.upgradeManager.magnetRange);
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
  scene: [TitleScene, BootScene, GameScene],
  input: { activePointers: 3 },
};

new Phaser.Game(config);
