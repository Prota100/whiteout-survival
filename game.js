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

function _playSFX(name,vol=0.5,distance=0,maxDistance=0){
  if(!audioCtx||!soundEnabled||!_sfxCache[name])return;
  const src=audioCtx.createBufferSource();
  const gain=audioCtx.createGain();
  src.buffer=_sfxCache[name];
  // 거리 기반 볼륨 감쇠 (maxDistance 내에서 선형 감쇠)
  let finalVol = vol;
  if(maxDistance > 0 && distance > 0) {
    const attenuation = Math.max(0.1, 1 - (distance / maxDistance));
    finalVol = vol * attenuation;
  }
  // 전체 볼륨 제한 (0.3~0.5 범위)
  finalVol = Math.min(0.5, Math.max(0.3, finalVol));
  gain.gain.value=finalVol;
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
function playSlash(){_playSFX('slash',0.35)}
function playHit(){_playSFX('hit',0.4)}
function playKill(){_playSFX('kill',0.4)}
function playCoin(){_playSFX('coin',0.3)}
function playChop(){_playSFX('chop',0.35)}
function playBuild(){_playSFX('build',0.4)}
function playCraft(){_playSFX('craft',0.35)}
function playHire(){_playSFX('hire',0.4)}
function playHurt(){_playSFX('hurt',0.45)}
function playEat(){_playSFX('eat',0.3)}
function playQuest(){_playSFX('quest',0.4)}
function playDeath(){_playSFX('death',0.45)}
function playWhiff(){_playSFX('slash',0.08)}
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

// ═══ NEW SOUND FX (Web Audio procedural) ═══
function playBossSpawn(){
  if(!audioCtx||!soundEnabled)return;
  // Deep threatening bass rumble + horn
  [55, 65, 82.4].forEach((freq,i)=>{
    const osc=audioCtx.createOscillator();const g=audioCtx.createGain();
    osc.type='sawtooth';osc.frequency.value=freq;
    osc.frequency.linearRampToValueAtTime(freq*0.7,audioCtx.currentTime+1.5);
    g.gain.setValueAtTime(0.25,audioCtx.currentTime+i*0.15);
    g.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+1.8);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(audioCtx.currentTime+i*0.15);osc.stop(audioCtx.currentTime+2);
  });
  // Sub-bass rumble
  const sub=audioCtx.createOscillator();const sg=audioCtx.createGain();
  sub.type='sine';sub.frequency.value=35;
  sg.gain.setValueAtTime(0.3,audioCtx.currentTime);
  sg.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+2);
  sub.connect(sg).connect(audioCtx.destination);
  sub.start();sub.stop(audioCtx.currentTime+2);
}

function playWinSound(){if(!audioCtx||!soundEnabled)return;const o=audioCtx.createOscillator();const g=audioCtx.createGain();o.type='triangle';o.frequency.setValueAtTime(440,audioCtx.currentTime);g.gain.setValueAtTime(0.5,audioCtx.currentTime);o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+1);o.stop(audioCtx.currentTime+1)}

function playGameOverSound(){
  if(!audioCtx||!soundEnabled)return;
  // Sad descending melody
  const notes=[659.25,587.33,523.25,493.88,440];
  notes.forEach((freq,i)=>{
    const osc=audioCtx.createOscillator();const g=audioCtx.createGain();
    osc.type='sine';osc.frequency.value=freq;
    g.gain.setValueAtTime(0.2,audioCtx.currentTime+i*0.5);
    g.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+i*0.5+0.6);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(audioCtx.currentTime+i*0.5);osc.stop(audioCtx.currentTime+i*0.5+0.7);
  });
}

function playBlizzardStart(){
  if(!audioCtx||!soundEnabled)return;
  // Wind howl effect using filtered noise
  const bs=audioCtx.sampleRate*3,buf=audioCtx.createBuffer(1,bs,audioCtx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<bs;i++)d[i]=(Math.random()*2-1);
  const src=audioCtx.createBufferSource();src.buffer=buf;
  const bp=audioCtx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=400;bp.Q.value=2;
  bp.frequency.linearRampToValueAtTime(800,audioCtx.currentTime+1.5);
  bp.frequency.linearRampToValueAtTime(300,audioCtx.currentTime+3);
  const g=audioCtx.createGain();
  g.gain.setValueAtTime(0,audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0.3,audioCtx.currentTime+0.5);
  g.gain.linearRampToValueAtTime(0.15,audioCtx.currentTime+2);
  g.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+3);
  src.connect(bp).connect(g).connect(audioCtx.destination);
  src.start();src.stop(audioCtx.currentTime+3);
}

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
        act2MinibossSpawned: scene.act2MinibossSpawned,
        act4MinibossSpawned: scene.act4MinibossSpawned,
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

// ═══ 💫 META PROGRESSION ═══
class MetaManager {
  static META_KEY = 'whiteout_meta';
  
  static getDefault() {
    return {
      version: '1.0',
      totalPoints: 0,
      spentPoints: 0,
      bestTime: 0,
      totalRuns: 0,
      upgrades: {
        startHP: 0,
        startTempResist: 0,
        startWood: 0,
        extraCard: 0
      }
    };
  }
  
  static load() {
    try {
      const raw = localStorage.getItem(MetaManager.META_KEY);
      return raw ? JSON.parse(raw) : MetaManager.getDefault();
    } catch (e) {
      return MetaManager.getDefault();
    }
  }
  
  static save(meta) {
    localStorage.setItem(MetaManager.META_KEY, JSON.stringify(meta));
  }
  
  static earnPoints(survivalSeconds, totalKills, maxCombo) {
    return Math.floor(survivalSeconds / 10) + totalKills + (maxCombo * 2);
  }
  
  static getAvailablePoints() {
    const meta = MetaManager.load();
    return meta.totalPoints - meta.spentPoints;
  }
  
  static getUpgradeCost(type, level) {
    const costs = {
      startHP: [100, 200, 400, 800, 1600],
      startTempResist: [100, 200, 400, 800, 1600],
      startWood: [50, 100, 200, 400, 800],
      extraCard: [500, 1000, 2000]
    };
    return costs[type]?.[level] || 9999;
  }
  
  static getMaxLevel(type) {
    return type === 'extraCard' ? 3 : 5;
  }
  
  static canUpgrade(type) {
    const meta = MetaManager.load();
    const level = meta.upgrades[type];
    if (level >= MetaManager.getMaxLevel(type)) return false;
    return MetaManager.getAvailablePoints() >= MetaManager.getUpgradeCost(type, level);
  }
  
  static doUpgrade(type) {
    const meta = MetaManager.load();
    const level = meta.upgrades[type];
    const cost = MetaManager.getUpgradeCost(type, level);
    if (MetaManager.getAvailablePoints() < cost) return false;
    
    meta.spentPoints += cost;
    meta.upgrades[type]++;
    MetaManager.save(meta);
    return true;
  }
  
  static recordRun(survivalSeconds, totalKills, maxCombo) {
    const meta = MetaManager.load();
    const earned = MetaManager.earnPoints(survivalSeconds, totalKills, maxCombo);
    meta.totalPoints += earned;
    meta.bestTime = Math.max(meta.bestTime, survivalSeconds);
    meta.totalRuns++;
    MetaManager.save(meta);
    return earned;
  }
  
  static getBonusStats() {
    const meta = MetaManager.load();
    return {
      bonusHP: meta.upgrades.startHP * 20,
      bonusTempResist: meta.upgrades.startTempResist * 0.05,
      bonusWood: meta.upgrades.startWood * 3,
      extraCardChoices: meta.upgrades.extraCard
    };
  }
  
  static reset() {
    localStorage.removeItem(MetaManager.META_KEY);
  }
}
// ═══ END META PROGRESSION ═══

// ═══ 🎴 UPGRADE SYSTEM (뱀서 스타일) ═══
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
};

// ═══ 경험치(XP) 시스템 ═══
const XP_TABLE = [0, 12, 20, 30, 42, 55, 70, 90, 115, 145, 180, 220, 270, 330, 400, 490, 600, 730, 900, 1100, 1350];
const XP_SOURCES = {
  rabbit: 5, deer: 8, penguin: 6, seal: 12,
  wolf: 18, bear: 35, boss: 80, tree: 2, rock: 2, gold: 5,
  default: 5,
};

// ═══ 한파 스케줄 ═══
const BLIZZARD_SCHEDULE = [
  { startMs: 3*60*1000,      duration: 25*1000, tempMult: 1.8, reward: { boxes: 1, gold: 15 } },
  { startMs: 7*60*1000,      duration: 30*1000, tempMult: 2.2, reward: { boxes: 1, gold: 25 } },
  { startMs: 12*60*1000,     duration: 35*1000, tempMult: 2.6, reward: { boxes: 2, gold: 40 } },
  { startMs: 18*60*1000,     duration: 40*1000, tempMult: 3.0, reward: { boxes: 2, gold: 60 } },
  { startMs: 25*60*1000,     duration: 45*1000, tempMult: 3.5, reward: { boxes: 2, gold: 80 } },
  { startMs: 33*60*1000,     duration: 50*1000, tempMult: 4.0, reward: { boxes: 3, gold: 100 } },
  { startMs: 42*60*1000,     duration: 55*1000, tempMult: 4.5, reward: { boxes: 3, gold: 130 } },
  { startMs: 52*60*1000,     duration: 60*1000, tempMult: 5.0, reward: { boxes: 4, gold: 160 } },
];

// ═══ 맵 구역 시스템 ═══
const MAP_CENTER = { x: 1200, y: 1200 };
const ZONE_RADII = { safe: 300, normal: 700, danger: 1000 };
const ZONE_TEMP_DECAY = { safe: 0, normal: -1, danger: -2, extreme: -4 };

// ═══ 장비 시너지 힌트 ═══
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

const RARITY_WEIGHTS = { common: 70, rare: 25, epic: 5 };
const RARITY_LABELS = { common: { name: '일반', color: '#9E9E9E' }, rare: { name: '희귀', color: '#2196F3' }, epic: { name: '에픽', color: '#9C27B0' } };
const GRADE_COLORS = { common: '#9E9E9E', uncommon: '#4CAF50', rare: '#2196F3', epic: '#9C27B0', legend: '#FF9800' };

// ═══ EQUIPMENT SYSTEM ═══
const EQUIP_GRADES = ['common','rare','epic','legendary','unique'];
const EQUIP_GRADE_COLORS = { common:'#9E9E9E', rare:'#2196F3', epic:'#9C27B0', legendary:'#FFD700', unique:'#FF4081' };
const EQUIP_GRADE_LABELS = { common:'일반', rare:'희귀', epic:'에픽', legendary:'전설', unique:'고유' };
const EQUIP_GRADE_WEIGHTS = { common:55, rare:30, epic:12, legendary:2.5, unique:0.5 };
const EQUIP_SLOT_ICONS = { weapon:'⚔️', armor:'🛡️', boots:'👢', helmet:'🎩', ring:'💍' };

const EQUIPMENT_TABLE = {
  weapon: [
    { id:'stick', name:'나무작대기', icon:'🪵', effects:{ atkMul:0.10 } },
    { id:'knife', name:'사냥칼', icon:'🔪', effects:{ atkMul:0.20, aspdMul:0.10 } },
    { id:'axe', name:'도끼', icon:'🪓', effects:{ atkMul:0.40 } },
    { id:'spear', name:'얼음창', icon:'🔱', effects:{ atkMul:0.30 } },
    { id:'fire_sword', name:'화염검', icon:'🗡️', effects:{ atkMul:0.50 } },
    { id:'legend_sword', name:'전설의검', icon:'⚔️', effects:{ atkMul:0.80, aspdMul:0.20 } }
  ],
  armor: [
    { id:'rabbit_coat', name:'토끼털코트', icon:'🐰', effects:{ hpFlat:20 } },
    { id:'wolf_hide', name:'늑대가죽', icon:'🐺', effects:{ hpFlat:40, defMul:0.10 } },
    { id:'bear_hide', name:'곰가죽', icon:'🐻', effects:{ hpFlat:60, defMul:0.20 } },
    { id:'iron_armor', name:'철갑옷', icon:'🛡️', effects:{ hpFlat:80, defMul:0.30 } },
    { id:'hero_armor', name:'용사갑옷', icon:'🦸', effects:{ hpFlat:120, defMul:0.40 } }
  ],
  boots: [
    { id:'old_boots', name:'낡은신발', icon:'👞', effects:{ spdMul:0.10 } },
    { id:'fur_boots', name:'털장화', icon:'🥾', effects:{ spdMul:0.15, coldRes:0.05 } },
    { id:'swift_boots', name:'빠른장화', icon:'👟', effects:{ spdMul:0.25 } },
    { id:'snowshoes', name:'설상화', icon:'🎿', effects:{ spdMul:0.20, dodgeMul:0.10 } },
    { id:'wind_boots', name:'바람장화', icon:'💨', effects:{ spdMul:0.35, dodgeMul:0.15 } }
  ],
  helmet: [
    { id:'fur_hat', name:'털모자', icon:'🧢', effects:{ coldRes:0.10 } },
    { id:'camp_hat', name:'캠프파이어모자', icon:'🔥', effects:{ regenPS:0.5 } },
    { id:'battle_helm', name:'전투투구', icon:'⛑️', effects:{ hpFlat:30, defMul:0.10 } },
    { id:'crystal_helm', name:'수정투구', icon:'💎', effects:{ coldRes:0.20, regenPS:1 } },
    { id:'hero_helm', name:'용사투구', icon:'👑', effects:{ hpFlat:60, regenPS:2 } }
  ],
  ring: [
    { id:'wood_ring', name:'나무반지', icon:'🟤', effects:{ xpMul:0.10 } },
    { id:'silver_ring', name:'은반지', icon:'⚪', effects:{ xpMul:0.15, luckFlat:5 } },
    { id:'gold_ring', name:'금반지', icon:'🟡', effects:{ xpMul:0.20, luckFlat:10 } },
    { id:'ruby_ring', name:'루비반지', icon:'🔴', effects:{ luckFlat:20, atkMul:0.10 } },
    { id:'legend_ring', name:'전설반지', icon:'💍', effects:{ xpMul:0.30, luckFlat:30, atkMul:0.10 } }
  ]
};

class EquipmentManager {
  static STORAGE_KEY = 'whiteout_equipment';

  constructor() {
    this.slots = { weapon:null, armor:null, boots:null, helmet:null, ring:null };
    this.inventory = { weapon:[], armor:[], boots:[], helmet:[], ring:[] };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(EquipmentManager.STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        Object.keys(this.slots).forEach(s => { if (saved[s]) this.slots[s] = saved[s]; });
        if (saved._inventory) {
          Object.keys(this.inventory).forEach(s => { if (saved._inventory[s]) this.inventory[s] = saved._inventory[s]; });
        }
      }
    } catch(e) {}
  }

  save() {
    const data = { ...this.slots, _inventory: this.inventory };
    localStorage.setItem(EquipmentManager.STORAGE_KEY, JSON.stringify(data));
  }

  // Try equipping; returns true if equipped (upgrade)
  tryEquip(slot, itemId, grade) {
    const current = this.slots[slot];
    const gradeIdx = EQUIP_GRADES.indexOf(grade);
    if (current) {
      const curIdx = EQUIP_GRADES.indexOf(current.grade);
      if (gradeIdx <= curIdx) return false; // not an upgrade
    }
    this.slots[slot] = { itemId, grade };
    this.save();
    return true;
  }

  getItemDef(slot) {
    const eq = this.slots[slot];
    if (!eq) return null;
    const list = EQUIPMENT_TABLE[slot];
    return list ? list.find(i => i.id === eq.itemId) : null;
  }

  // Aggregate all equipment bonuses
  getTotalBonuses() {
    const b = { atkMul:0, aspdMul:0, hpFlat:0, defMul:0, spdMul:0, dodgeMul:0, coldRes:0, regenPS:0, xpMul:0, luckFlat:0 };
    for (const slot of Object.keys(this.slots)) {
      const def = this.getItemDef(slot);
      if (!def) continue;
      const gradeIdx = EQUIP_GRADES.indexOf(this.slots[slot].grade);
      const gradeMul = 1 + gradeIdx * 0.25; // common=1x, rare=1.25x, epic=1.5x, legendary=1.75x, unique=2x
      for (const [k, v] of Object.entries(def.effects)) {
        if (k === 'hpFlat' || k === 'luckFlat') b[k] += v * gradeMul;
        else b[k] += v * gradeMul;
      }
    }
    return b;
  }

  // Roll a random equipment drop
  static rollDrop(luck) {
    // Pick grade
    const roll = Math.random() * 100;
    let acc = 0; let grade = 'common';
    for (const g of EQUIP_GRADES) {
      acc += EQUIP_GRADE_WEIGHTS[g];
      if (roll < acc) { grade = g; break; }
    }
    // Pick random slot
    const slots = Object.keys(EQUIPMENT_TABLE);
    const slot = slots[Math.floor(Math.random() * slots.length)];
    // Pick random item from that slot
    const items = EQUIPMENT_TABLE[slot];
    const item = items[Math.floor(Math.random() * items.length)];
    return { slot, itemId: item.id, grade, name: item.name, icon: item.icon };
  }

  addToInventory(slot, itemId, grade) {
    this.inventory[slot].push({ itemId, grade });
    this.save();
  }

  // Count items of a specific grade in a slot's inventory
  countByGrade(slot, grade) {
    return this.inventory[slot].filter(i => i.grade === grade).length;
  }

  // Get craftable grades for a slot (grades that have 3+ items)
  getCraftableGrades(slot) {
    const result = [];
    for (const g of EQUIP_GRADES.slice(0, -1)) { // can't craft unique→next
      if (this.countByGrade(slot, g) >= 3) result.push(g);
    }
    return result;
  }

  // Craft: consume 3 items of same grade from slot → produce next grade random item
  craft(slot, grade) {
    const gradeIdx = EQUIP_GRADES.indexOf(grade);
    if (gradeIdx < 0 || gradeIdx >= EQUIP_GRADES.length - 1) return null;
    if (this.countByGrade(slot, grade) < 3) return null;
    // Remove 3 items of this grade
    let removed = 0;
    this.inventory[slot] = this.inventory[slot].filter(i => {
      if (removed >= 3) return true;
      if (i.grade === grade) { removed++; return false; }
      return true;
    });
    // Create next grade item
    const nextGrade = EQUIP_GRADES[gradeIdx + 1];
    const items = EQUIPMENT_TABLE[slot];
    const newItem = items[Math.floor(Math.random() * items.length)];
    const result = { slot, itemId: newItem.id, grade: nextGrade, name: newItem.name, icon: newItem.icon };
    // Auto-equip if better, otherwise add to inventory
    if (!this.tryEquip(slot, result.itemId, result.grade)) {
      this.inventory[slot].push({ itemId: result.itemId, grade: result.grade });
    }
    this.save();
    return result;
  }

  reset() {
    this.slots = { weapon:null, armor:null, boots:null, helmet:null, ring:null };
    this.inventory = { weapon:[], armor:[], boots:[], helmet:[], ring:[] };
    localStorage.removeItem(EquipmentManager.STORAGE_KEY);
  }
}

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

  pickThreeCards(extra = 0) {
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
    const count = Math.min(3 + extra, available.length);
    while (picked.length < count) {
      const k = weighted[Math.floor(Math.random() * weighted.length)];
      if (!used.has(k)) { used.add(k); picked.push(k); }
    }
    return picked;
  }

  // Diminishing returns: 2nd=70%, 3rd=40%, 4th+=20%
  _diminish(lv) {
    if (lv <= 1) return 1.0;
    if (lv === 2) return 0.7;
    if (lv === 3) return 0.4;
    return 0.2;
  }

  applyUpgrade(key, scene) {
    this.levels[key] = (this.levels[key] || 0) + 1;
    const lv = this.levels[key];
    const dim = this._diminish(lv);

    switch (key) {
      case 'DAMAGE_UP': {
        const boost = 1 + 0.25 * dim;
        scene.playerDamage = Math.round(scene.playerDamage * boost * 100) / 100;
        if (scene.playerDamage < 1) scene.playerDamage = 1;
        // Cap: 300% of base (base=10)
        scene.playerDamage = Math.min(scene.playerDamage, 30);
        break;
      }
      case 'ATTACK_SPEED': {
        scene.baseAttackSpeed *= (1 - 0.2 * dim);
        // Cap: 400% speed => min cooldown 0.35/4 = 0.0875
        scene.baseAttackSpeed = Math.max(0.0875, scene.baseAttackSpeed);
        break;
      }
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
        scene.playerBaseSpeed *= (1 + 0.15 * dim);
        scene.playerSpeed = scene.playerBaseSpeed;
        // Cap: 250% of base (base=120 => max 300)
        scene.playerBaseSpeed = Math.min(300, scene.playerBaseSpeed);
        scene.playerSpeed = Math.min(300, scene.playerSpeed);
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
  { id: 'q1', name: '첫 사냥', desc: '토끼 15마리 사냥', check: s => s.kills.rabbit >= 15, reward: { meat: 3 } },
  { id: 'q2', name: '나무꾼', desc: '나무 10개 채집', check: s => s.woodGathered >= 10, reward: { stone: 5 } },
  { id: 'q3', name: '화덕 건설', desc: '화덕 1개 건설', check: s => s.built.campfire >= 1, reward: { leather: 3 } },
  { id: 'q3b', name: '고기 수집', desc: '고기 5개 모으기', check: s => (s.meatCollected||0) >= 5, reward: { gold: 50 }, rewardEffect: { tempBonus: 5 } },
  { id: 'q4', name: '도구 제작', desc: '도구 1개 제작', check: s => s.crafted >= 1, reward: { meat: 10 } },
  { id: 'q5', name: '용맹한 사냥꾼', desc: '늑대 10마리 사냥', check: s => s.kills.wolf >= 10, reward: { leather: 5 } },
  { id: 'q5b', name: '사슴 사냥꾼', desc: '사슴 10마리 사냥', check: s => s.kills.deer >= 10, reward: { leather: 5, meat: 8 } },
  { id: 'q6', name: '텐트 건설', desc: '텐트 건설하기', check: s => s.built.tent >= 1, reward: { meat: 15 } },
  { id: 'q6b', name: '대량 납품', desc: '고기 10개 모으기', check: s => (s.meatCollected||0) >= 10, reward: { gold: 100 }, rewardEffect: { maxHPBonus: 20 } },
  { id: 'q7', name: '곰 사냥', desc: '곰 5마리 사냥', check: s => s.kills.bear >= 5, reward: { leather: 8, meat: 10 } },
  { id: 'q8', name: 'NPC 고용', desc: 'NPC 1명 고용', check: s => s.npcsHired >= 1, reward: { wood: 10, stone: 10 } },
];

// ═══ 🎬 TITLE SCENE ═══
class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    
    // ═══ 설산 배경: 그라데이션 하늘 ═══
    this.cameras.main.setBackgroundColor('#0A0E1A');
    this.skyGfx = this.add.graphics().setDepth(0);
    const skySteps = 40;
    for (let i = 0; i < skySteps; i++) {
      const t = i / skySteps;
      const r = Math.floor(10 + t * 200);
      const g = Math.floor(15 + t * 220);
      const b = Math.floor(60 + t * 195);
      const color = (r << 16) | (g << 8) | b;
      this.skyGfx.fillStyle(color, 1);
      this.skyGfx.fillRect(0, (H * 0.7) * (i / skySteps), W, (H * 0.7) / skySteps + 1);
    }
    
    // ═══ 설산 봉우리 실루엣 ═══
    this.mountainGfx = this.add.graphics().setDepth(1);
    // 뒷산 (연한 색)
    this.mountainGfx.fillStyle(0xc0d0e8, 0.5);
    this.mountainGfx.beginPath();
    this.mountainGfx.moveTo(0, H * 0.7);
    const peaks1 = [0, 0.1, 0.2, 0.35, 0.45, 0.55, 0.7, 0.8, 0.9, 1.0];
    const heights1 = [0.55, 0.35, 0.42, 0.25, 0.38, 0.3, 0.22, 0.4, 0.35, 0.5];
    peaks1.forEach((px, i) => this.mountainGfx.lineTo(px * W, H * heights1[i]));
    this.mountainGfx.lineTo(W, H * 0.7);
    this.mountainGfx.closePath();
    this.mountainGfx.fillPath();
    // 앞산 (밝은 흰색)
    this.mountainGfx.fillStyle(0xe8eef8, 0.7);
    this.mountainGfx.beginPath();
    this.mountainGfx.moveTo(0, H * 0.7);
    const peaks2 = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.0];
    const heights2 = [0.6, 0.4, 0.5, 0.32, 0.45, 0.38, 0.48, 0.6];
    peaks2.forEach((px, i) => this.mountainGfx.lineTo(px * W, H * heights2[i]));
    this.mountainGfx.lineTo(W, H * 0.7);
    this.mountainGfx.closePath();
    this.mountainGfx.fillPath();
    // 눈 덮인 바닥
    this.mountainGfx.fillStyle(0xd8e4f0, 0.8);
    this.mountainGfx.fillRect(0, H * 0.7, W, H * 0.3);
    
    // ═══ 자연 동물 스크롤 ═══
    this.scrollAnimals = [];
    this._animalSpawnTimer = 0;
    // Generate simple animal textures for title screen
    this._createTitleAnimalTextures();
    // Spawn initial animals
    for (let i = 0; i < 3; i++) this._spawnTitleAnimal(true);
    
    // ═══ Snow particles ═══
    this.snowParticles = [];
    for (let i = 0; i < 150; i++) {
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
    
    this.snowGfx = this.add.graphics().setDepth(10);
    
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
    
    // "영구 강화" button
    const metaBtnY = newBtnY + btnH + 20;
    const meta = MetaManager.load();
    const hasPoints = MetaManager.getAvailablePoints() > 0;
    this._createButton(W / 2, metaBtnY, btnW, btnH, `🔮 영구 강화${hasPoints ? ' ✨' : ''}`, hasPoints ? 0xaa44aa : 0x444466, () => {
      this._showMetaUpgradeUI();
    });
    
    // Show best time if exists
    if (meta.bestTime > 0) {
      const bestMin = Math.floor(meta.bestTime / 60);
      const bestSec = Math.floor(meta.bestTime % 60);
      this.add.text(W / 2, metaBtnY + btnH / 2 + 16, `🏆 최고 기록: ${bestMin}분 ${bestSec}초 | 총 ${meta.totalRuns}회`, {
        fontSize: '12px', fontFamily: 'monospace', color: '#aa88cc'
      }).setOrigin(0.5);
    }
    
    // Version
    this.add.text(W - 10, H - 10, 'v1.0', {
      fontSize: '11px', fontFamily: 'monospace', color: '#334'
    }).setOrigin(1, 1);
    
    this.elapsed = 0;
  }
  
  _createButton(x, y, w, h, text, color, callback) {
    const isOrange = color === 0x2255aa || color === 0xaa44aa;
    const bg = this.add.graphics();
    if (isOrange) {
      // Orange CTA gradient
      bg.fillStyle(0xFF6B35, 0.9);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
      bg.fillStyle(0xE65100, 0.5);
      bg.fillRoundedRect(x - w / 2, y - h / 2 + h * 0.5, w, h * 0.5, { tl: 0, tr: 0, bl: 12, br: 12 });
    } else {
      bg.fillStyle(color, 0.8);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    }
    bg.lineStyle(2, isOrange ? 0xFFAA66 : 0x88aadd, 0.5);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    
    const txt = this.add.text(x, y, text, {
      fontSize: '20px', fontFamily: 'monospace', color: '#fff',
      stroke: '#000', strokeThickness: 2, fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
    hitArea.on('pointerover', () => {
      bg.clear();
      if (isOrange) {
        bg.fillStyle(0xFF8C42, 1);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
        bg.fillStyle(0xE65100, 0.5);
        bg.fillRoundedRect(x - w / 2, y - h / 2 + h * 0.5, w, h * 0.5, { tl: 0, tr: 0, bl: 12, br: 12 });
      } else {
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
      }
      bg.lineStyle(2, isOrange ? 0xFFCC88 : 0xaaccff, 0.8);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      if (isOrange) {
        bg.fillStyle(0xFF6B35, 0.9);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
        bg.fillStyle(0xE65100, 0.5);
        bg.fillRoundedRect(x - w / 2, y - h / 2 + h * 0.5, w, h * 0.5, { tl: 0, tr: 0, bl: 12, br: 12 });
      } else {
        bg.fillStyle(color, 0.8);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
      }
      bg.lineStyle(2, isOrange ? 0xFFAA66 : 0x88aadd, 0.5);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    });
    hitArea.on('pointerdown', () => {
      // Scale 0.95 press effect
      txt.setScale(0.95);
      this.time.delayedCall(100, () => { txt.setScale(1); callback(); });
    });
    
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
  
  _showMetaUpgradeUI() {
    const W = this.scale.width;
    const H = this.scale.height;
    
    // Overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setInteractive().setDepth(100);
    
    // Panel
    const panel = this.add.graphics().setDepth(101);
    const pw = Math.min(400, W * 0.85);
    const ph = Math.min(500, H * 0.8);
    panel.fillStyle(0x1a1a2e, 0.98);
    panel.fillRoundedRect(W / 2 - pw / 2, H / 2 - ph / 2, pw, ph, 12);
    panel.lineStyle(2, 0xaa44aa, 0.8);
    panel.strokeRoundedRect(W / 2 - pw / 2, H / 2 - ph / 2, pw, ph, 12);
    
    // Title
    const title = this.add.text(W / 2, H / 2 - ph / 2 + 30, '🔮 영구 강화', {
      fontSize: '24px', fontFamily: 'monospace', color: '#ddaaff'
    }).setOrigin(0.5).setDepth(102);
    
    // Points display
    const available = MetaManager.getAvailablePoints();
    const pointsTxt = this.add.text(W / 2, H / 2 - ph / 2 + 60, `💎 보유 포인트: ${available}`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffdd44'
    }).setOrigin(0.5).setDepth(102);
    
    const meta = MetaManager.load();
    let yPos = H / 2 - ph / 2 + 100;
    const items = [];
    
    // Upgrade definitions
    const upgrades = [
      { key: 'startHP', name: '❤️ 시작 체력', desc: '+20 HP', max: 5 },
      { key: 'startTempResist', name: '🧥 체온 저항', desc: '+5% 저항', max: 5 },
      { key: 'startWood', name: '🪵 시작 나무', desc: '+3 나무', max: 5 },
      { key: 'extraCard', name: '🎴 카드 선택', desc: '+1 선택지', max: 3 }
    ];
    
    upgrades.forEach(upg => {
      const level = meta.upgrades[upg.key];
      const cost = MetaManager.getUpgradeCost(upg.key, level);
      const canBuy = available >= cost && level < upg.max;
      const maxed = level >= upg.max;
      
      // Item bg
      const itemBg = this.add.graphics().setDepth(102);
      itemBg.fillStyle(canBuy ? 0x332244 : 0x222233, 0.9);
      itemBg.fillRoundedRect(W / 2 - pw / 2 + 20, yPos - 10, pw - 40, 70, 8);
      
      // Name & desc
      this.add.text(W / 2 - pw / 2 + 35, yPos + 5, `${upg.name} (Lv.${level}/${upg.max})`, {
        fontSize: '14px', fontFamily: 'monospace', color: maxed ? '#88ff88' : '#ccccdd'
      }).setOrigin(0, 0).setDepth(103);
      
      this.add.text(W / 2 - pw / 2 + 35, yPos + 25, upg.desc, {
        fontSize: '11px', fontFamily: 'monospace', color: '#8899aa'
      }).setOrigin(0, 0).setDepth(103);
      
      // Cost or Maxed
      const costTxt = maxed ? '최대' : `${cost} 포인트`;
      this.add.text(W / 2 + pw / 2 - 35, yPos + 20, costTxt, {
        fontSize: '12px', fontFamily: 'monospace', color: maxed ? '#88ff88' : (canBuy ? '#ffdd44' : '#ff6666')
      }).setOrigin(1, 0).setDepth(103);
      
      // Upgrade button
      if (!maxed) {
        const btnBg = this.add.graphics().setDepth(103);
        btnBg.fillStyle(canBuy ? 0xaa44aa : 0x444455, 0.9);
        btnBg.fillRoundedRect(W / 2 + pw / 2 - 90, yPos + 40, 70, 24, 4);
        
        const btnTxt = this.add.text(W / 2 + pw / 2 - 55, yPos + 52, '강화', {
          fontSize: '12px', fontFamily: 'monospace', color: canBuy ? '#fff' : '#888'
        }).setOrigin(0.5).setDepth(104);
        
        if (canBuy) {
          const btnHit = this.add.rectangle(W / 2 + pw / 2 - 55, yPos + 52, 70, 24, 0, 0).setInteractive({ useHandCursor: true }).setDepth(105);
          btnHit.on('pointerdown', () => {
            if (MetaManager.doUpgrade(upg.key)) {
              // Refresh UI
              [overlay, panel, title, pointsTxt, ...items].forEach(o => o.destroy());
              this._showMetaUpgradeUI();
            }
          });
          items.push(btnHit);
        }
        items.push(btnBg, btnTxt);
      }
      
      items.push(itemBg);
      yPos += 85;
    });
    
    // Close button
    const closeBg = this.add.graphics().setDepth(102);
    closeBg.fillStyle(0x444466, 0.9);
    closeBg.fillRoundedRect(W / 2 - 50, H / 2 + ph / 2 - 50, 100, 36, 6);
    const closeTxt = this.add.text(W / 2, H / 2 + ph / 2 - 32, '닫기', {
      fontSize: '14px', fontFamily: 'monospace', color: '#aabbcc'
    }).setOrigin(0.5).setDepth(103);
    const closeHit = this.add.rectangle(W / 2, H / 2 + ph / 2 - 32, 100, 36, 0, 0).setInteractive({ useHandCursor: true }).setDepth(104);
    closeHit.on('pointerdown', () => {
      [overlay, panel, title, pointsTxt, closeBg, closeTxt, closeHit, ...items].forEach(o => o.destroy());
    });
    
    items.push(overlay, panel, title, pointsTxt, closeBg, closeTxt, closeHit);
  }
  
  _createTitleAnimalTextures() {
    // 토끼 (title용)
    if (!this.textures.exists('title_rabbit')) {
      const g = this.add.graphics();
      g.fillStyle(0xFFEEDD); g.fillEllipse(12, 14, 16, 12); // body
      g.fillStyle(0xFFEEDD); g.fillEllipse(12, 6, 6, 10); // head
      g.fillStyle(0xFFDDCC); g.fillEllipse(10, 0, 3, 7); g.fillEllipse(14, 0, 3, 7); // ears
      g.fillStyle(0x332222); g.fillCircle(10, 5, 1.5); g.fillCircle(14, 5, 1.5); // eyes
      g.generateTexture('title_rabbit', 24, 24); g.destroy();
    }
    // 사슴 (title용)
    if (!this.textures.exists('title_deer')) {
      const g = this.add.graphics();
      g.fillStyle(0xC4A46C); g.fillEllipse(14, 18, 20, 14); // body
      g.fillStyle(0xC4A46C); g.fillEllipse(14, 8, 10, 10); // head
      g.fillStyle(0x8B7355); g.fillEllipse(8, 2, 2, 8); g.fillEllipse(20, 2, 2, 8); // antlers
      g.fillStyle(0x332222); g.fillCircle(11, 7, 1.5); g.fillCircle(17, 7, 1.5); // eyes
      g.fillStyle(0xC4A46C);
      // legs
      g.fillRect(8, 24, 3, 8); g.fillRect(18, 24, 3, 8);
      g.generateTexture('title_deer', 28, 32); g.destroy();
    }
  }
  
  _spawnTitleAnimal(initial) {
    const W = this.scale.width;
    const H = this.scale.height;
    const isRabbit = Math.random() < 0.5;
    const goRight = Math.random() < 0.5;
    const speed = 40 + Math.random() * 40; // 40~80 px/s
    const yPos = H * 0.65 + Math.random() * (H * 0.2); // on the snowy ground area
    const startX = goRight ? -40 : W + 40;
    
    const sprite = this.add.image(
      initial ? Math.random() * W : startX,
      yPos,
      isRabbit ? 'title_rabbit' : 'title_deer'
    ).setDepth(5).setFlipX(!goRight).setScale(isRabbit ? 1.2 : 1.4);
    
    this.scrollAnimals.push({ sprite, speed: goRight ? speed : -speed, goRight });
  }
  
  update(time, delta) {
    this.elapsed += delta * 0.001;
    const dt = delta * 0.001;
    const W = this.scale.width;
    const H = this.scale.height;
    
    // ═══ 동물 스크롤 업데이트 ═══
    this._animalSpawnTimer -= dt;
    if (this._animalSpawnTimer <= 0) {
      if (this.scrollAnimals.length < 6) this._spawnTitleAnimal(false);
      this._animalSpawnTimer = 2 + Math.random() * 2; // 2~4초마다
    }
    for (let i = this.scrollAnimals.length - 1; i >= 0; i--) {
      const a = this.scrollAnimals[i];
      a.sprite.x += a.speed * dt;
      // 살짝 위아래 흔들림
      a.sprite.y += Math.sin(time * 0.002 + i * 1.5) * 0.3;
      // 화면 밖으로 나가면 제거
      if ((a.speed > 0 && a.sprite.x > W + 60) || (a.speed < 0 && a.sprite.x < -60)) {
        a.sprite.destroy();
        this.scrollAnimals.splice(i, 1);
      }
    }
    
    // ═══ Snow particles ═══
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
    this.createPlayerBackTexture();
    this.createPlayerAttackTexture();
    this.createRabbitTexture();
    this.createRabbitBackTexture();
    this.createDeerTexture();
    this.createDeerBackTexture();
    this.createPenguinTexture();
    this.createPenguinBackTexture();
    this.createSealTexture();
    this.createSealBackTexture();
    this.createWolfTexture();
    this.createWolfBackTexture();
    this.createBearTexture();
    this.createBearBackTexture();
    this.createNPCTextures();
    this.createNPCBackTextures();
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

  createPlayerBackTexture() {
    const g = this.add.graphics();
    const s = 40;
    // 모자 (뒷모습)
    g.fillStyle(0xCC2222, 1);
    g.fillRect(12, 2, 16, 8);
    g.fillRect(11, 5, 18, 4);
    // 뒤통수 (머리카락)
    g.fillStyle(0x553322, 1);
    g.fillRect(13, 10, 14, 9);
    g.fillStyle(0x442211, 1);
    g.fillRect(14, 11, 12, 7);
    // 코트 뒷면
    g.fillStyle(0x2299CC, 1);
    g.fillRect(11, 19, 18, 12);
    // 코트 뒤쪽 라인
    g.fillStyle(0x1188BB, 1);
    g.fillRect(19, 19, 2, 12);
    // 배낭
    g.fillStyle(0x885522, 1);
    g.fillRect(13, 20, 14, 10);
    g.fillStyle(0x774411, 1);
    g.fillRect(14, 21, 12, 8);
    g.fillStyle(0xAA7733, 1);
    g.fillRect(15, 22, 4, 3);
    // 배낭 끈
    g.fillStyle(0x664411, 1);
    g.fillRect(11, 20, 2, 8);
    g.fillRect(27, 20, 2, 8);
    // 팔
    g.fillStyle(0x2299CC, 1);
    g.fillRect(7, 20, 4, 9);
    g.fillRect(29, 20, 4, 9);
    g.fillStyle(0x884422, 1);
    g.fillRect(7, 29, 4, 3);
    g.fillRect(29, 29, 4, 3);
    // 다리
    g.fillStyle(0x555566, 1);
    g.fillRect(13, 31, 6, 6);
    g.fillRect(21, 31, 6, 6);
    g.fillStyle(0x664422, 1);
    g.fillRect(12, 36, 7, 4);
    g.fillRect(21, 36, 7, 4);
    g.generateTexture('player_back', s, s);
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

  createRabbitBackTexture() {
    const g = this.add.graphics();
    const sz = 28;
    // 몸통 뒷면
    g.fillStyle(0xFFEEDD, 1);
    g.fillRoundedRect(7, 12, 14, 12, 5);
    g.fillRoundedRect(9, 6, 10, 8, 4);
    // 귀 뒷면
    g.fillStyle(0xEEDDBB, 1);
    g.fillRect(10, 0, 3, 8);
    g.fillRect(15, 0, 3, 8);
    // 눈 없음 - 뒤통수
    g.fillStyle(0xEEDDCC, 1);
    g.fillRoundedRect(10, 7, 8, 6, 3);
    // 꼬리 (솜뭉치)
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(14, 24, 4);
    // 발
    g.fillStyle(0xEEDDBB, 1);
    g.fillRect(8, 23, 4, 3);
    g.fillRect(16, 23, 4, 3);
    g.generateTexture('rabbit_back', sz, sz);
    g.destroy();
  }

  createDeerBackTexture() {
    const g = this.add.graphics();
    const sz = 32;
    // 몸통 뒷면
    g.fillStyle(0xC4A46C, 1);
    g.fillRoundedRect(7, 14, 18, 12, 4);
    g.fillRoundedRect(9, 6, 14, 10, 4);
    // 뿔
    g.fillStyle(0x8B6914, 1);
    g.fillRect(11, 1, 2, 6);
    g.fillRect(19, 1, 2, 6);
    g.fillRect(9, 2, 2, 3);
    g.fillRect(21, 2, 2, 3);
    // 뒤통수 (눈 없음)
    g.fillStyle(0xB89458, 1);
    g.fillRoundedRect(11, 8, 10, 6, 3);
    // 꼬리
    g.fillStyle(0xE8D8B8, 1);
    g.fillRect(14, 12, 4, 3);
    // 다리
    g.fillStyle(0xA08050, 1);
    g.fillRect(10, 25, 3, 6);
    g.fillRect(19, 25, 3, 6);
    g.fillStyle(0x444444, 1);
    g.fillRect(10, 30, 3, 2);
    g.fillRect(19, 30, 3, 2);
    g.generateTexture('deer_back', sz, sz);
    g.destroy();
  }

  createPenguinBackTexture() {
    const g = this.add.graphics();
    const sz = 28;
    // 검은 등
    g.fillStyle(0x222222, 1);
    g.fillRoundedRect(7, 4, 14, 18, 5);
    // 머리 뒷면 (검은색)
    g.fillStyle(0x1a1a1a, 1);
    g.fillRoundedRect(9, 2, 10, 8, 4);
    // 날개
    g.fillStyle(0x333333, 1);
    g.fillRect(4, 9, 3, 8);
    g.fillRect(21, 9, 3, 8);
    // 발
    g.fillStyle(0xFF8800, 1);
    g.fillRect(8, 22, 5, 3);
    g.fillRect(15, 22, 5, 3);
    g.generateTexture('penguin_back', sz, sz);
    g.destroy();
  }

  createSealBackTexture() {
    const g = this.add.graphics();
    const sz = 32;
    // 몸통 뒷면
    g.fillStyle(0x7B8D9E, 1);
    g.fillEllipse(16, 14, 28, 16);
    // 머리 뒷면
    g.fillStyle(0x6B7D8E, 1);
    g.fillCircle(7, 12, 7);
    // 꼬리
    g.fillStyle(0x6B7D8E, 1);
    g.fillEllipse(26, 16, 8, 5);
    // 등 무늬
    g.fillStyle(0x5B6D7E, 0.5);
    g.fillEllipse(16, 13, 18, 6);
    g.generateTexture('seal_back', sz, sz);
    g.destroy();
  }

  createWolfBackTexture() {
    const g = this.add.graphics();
    const sz = 32;
    // 몸통 뒷면
    g.fillStyle(0x555566, 1);
    g.fillRoundedRect(6, 12, 20, 12, 4);
    // 머리 뒷면 (눈 없음)
    g.fillStyle(0x666677, 1);
    g.fillRoundedRect(3, 5, 14, 10, 4);
    // 귀
    g.fillStyle(0x444455, 1);
    g.fillTriangle(5, 0, 3, 6, 9, 6);
    g.fillTriangle(14, 0, 11, 6, 17, 6);
    // 뒤통수 털
    g.fillStyle(0x777788, 1);
    g.fillRoundedRect(4, 6, 12, 7, 3);
    // 꼬리 (위로 올림)
    g.fillStyle(0x555566, 1);
    g.fillRect(26, 8, 4, 4);
    g.fillRect(28, 5, 3, 5);
    // 다리
    g.fillStyle(0x444455, 1);
    g.fillRect(9, 23, 3, 6);
    g.fillRect(14, 23, 3, 6);
    g.fillRect(21, 23, 3, 6);
    g.fillStyle(0x333344, 1);
    g.fillRect(8, 28, 4, 3);
    g.fillRect(13, 28, 4, 3);
    g.fillRect(20, 28, 4, 3);
    g.generateTexture('wolf_back', sz, sz);
    g.destroy();
  }

  createBearBackTexture() {
    const g = this.add.graphics();
    const sz = 44;
    // 몸통 뒷면
    g.fillStyle(0xF0EEE8, 1);
    g.fillRoundedRect(6, 14, 32, 20, 10);
    // 머리 뒷면
    g.fillStyle(0xF5F3EE, 1);
    g.fillCircle(22, 12, 12);
    // 귀
    g.fillStyle(0xE0DDD5, 1);
    g.fillCircle(13, 3, 4);
    g.fillCircle(31, 3, 4);
    g.fillStyle(0xDDBBAA, 1);
    g.fillCircle(13, 3, 2);
    g.fillCircle(31, 3, 2);
    // 뒤통수 (눈 없음)
    g.fillStyle(0xE8E5DD, 1);
    g.fillCircle(22, 12, 10);
    // 등 무늬
    g.fillStyle(0xDDD8D0, 1);
    g.fillEllipse(22, 22, 24, 12);
    // 다리
    g.fillStyle(0xE8E5DD, 1);
    g.fillRoundedRect(9, 32, 8, 10, 4);
    g.fillRoundedRect(27, 32, 8, 10, 4);
    g.fillStyle(0xDDDAD2, 1);
    g.fillRoundedRect(8, 38, 10, 5, 3);
    g.fillRoundedRect(26, 38, 10, 5, 3);
    g.generateTexture('bear_back', sz, sz);
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

  createNPCBackTextures() {
    // 사냥꾼 뒷모습
    let g = this.add.graphics();
    g.fillStyle(0x8B6914, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0x553322, 1); g.fillRect(12, 6, 8, 8); // 뒤통수
    g.fillStyle(0x6B4914, 1); g.fillRect(11, 3, 10, 5); // 모자
    // 등에 활
    g.lineStyle(2, 0x884422, 1);
    g.beginPath(); g.arc(16, 18, 6, -1.2, 1.2); g.strokePath();
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_hunter_back', 32, 32); g.destroy();

    // 상인 뒷모습
    g = this.add.graphics();
    g.fillStyle(0xEEDDCC, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0x553322, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x44AA44, 1); g.fillRect(11, 2, 10, 5);
    // 배낭
    g.fillStyle(0x885522, 1); g.fillRect(12, 16, 8, 8);
    g.fillStyle(0x774411, 1); g.fillRect(13, 17, 6, 6);
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_merchant_back', 32, 32); g.destroy();

    // 채집꾼 뒷모습
    g = this.add.graphics();
    g.fillStyle(0x66AA44, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0x553322, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x558833, 1); g.fillRect(11, 3, 10, 5);
    // 등에 도구
    g.fillStyle(0x884422, 1); g.fillRect(20, 12, 2, 14);
    g.fillStyle(0x555555, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_gatherer_back', 32, 32); g.destroy();

    // 전사 뒷모습
    g = this.add.graphics();
    g.fillStyle(0x3366AA, 1); g.fillRect(10, 15, 12, 10);
    g.fillStyle(0x553322, 1); g.fillRect(12, 6, 8, 8);
    g.fillStyle(0x5588CC, 1); g.fillRect(11, 3, 10, 4);
    // 등에 방패
    g.fillStyle(0x3355AA, 1); g.fillRoundedRect(11, 16, 10, 8, 2);
    g.fillStyle(0xFFDD00, 1); g.fillCircle(16, 20, 2);
    // 등에 칼
    g.fillStyle(0xCCCCCC, 1); g.fillRect(22, 8, 2, 14);
    g.fillStyle(0x555566, 1); g.fillRect(12, 25, 3, 5); g.fillRect(17, 25, 3, 5);
    g.generateTexture('npc_warrior_back', 32, 32); g.destroy();
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
    
    // ═══ Apply Meta Progression Bonuses ═══
    const meta = MetaManager.getBonusStats();
    this.playerMaxHP += meta.bonusHP;
    this.playerHP = this.playerMaxHP;
    this.warmthResist += meta.bonusTempResist;
    this.res.wood += meta.bonusWood;
    this.extraCardChoices = meta.extraCardChoices || 0;

    // ═══ Apply Equipment Bonuses ═══
    const eqBonus = this.equipmentManager.getTotalBonuses();
    this.playerMaxHP += eqBonus.hpFlat;
    this.playerHP = this.playerMaxHP;
    this.warmthResist += eqBonus.coldRes;
    this._equipBonuses = eqBonus; // cache for runtime use
    
    this.gameOver = false;
    this.isRespawning = false;
    this.buildMode = null;
    this.storageCapacity = 50;
    this.upgradeManager = new UpgradeManager();
    this.equipmentManager = new EquipmentManager();
    this.equipmentDrops = []; // world items awaiting pickup
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
    
    // ═══ Streak Buff System ═══
    this.streakBuff = { dmgMul: 1, spdMul: 1, timer: 0, tier: 0 };

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
    this.act2MinibossSpawned = false;
    this.act4MinibossSpawned = false;

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

    this.stats = { kills: {}, woodGathered: 0, built: {}, crafted: 0, npcsHired: 0, maxCombo: 0, meatCollected: 0 };
    this.gameWon = false;
    this.questIndex = 0;
    this.questCompleted = [];
    this.currentZone = 'safe';
    this.questSpawnTimer = 0;

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
    // ═══ WASD + Arrow Key Support ═══
    this.wasd = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT');
    // ═══ BUFF ITEM SYSTEM ═══
    this._initBuffSystem();
    this.createUI();
    window._gameScene = this;
    this.physics.add.overlap(this.player, this.drops, (_, d) => this.collectDrop(d));
    this.physics.add.overlap(this.player, this.buffDropGroup, (_, bd) => this._collectBuffDrop(bd));
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
    
    // ── Tutorial Overlay (새 게임 시작 시 3초 표시) ──
    if (!loadSave) {
      this._showTutorialOverlay();

      // ═══ FTUE: Spawn 2 rabbits near player for early kill ═══
      for (let i = 0; i < 2; i++) {
        const ang = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const dist = Phaser.Math.Between(80, 120);
        const rx = this.player.x + Math.cos(ang) * dist;
        const ry = this.player.y + Math.sin(ang) * dist;
        const def = ANIMALS['rabbit'], type = 'rabbit';
        const a = this.physics.add.sprite(
          Phaser.Math.Clamp(rx, 60, WORLD_W-60),
          Phaser.Math.Clamp(ry, 60, WORLD_H-60),
          type
        ).setCollideWorldBounds(true).setDepth(5);
        a.animalType = type; a.def = def; a.hp = def.hp; a.maxHP = def.hp;
        a.wanderTimer = 0; a.wanderDir = {x:0,y:0}; a.hitFlash = 0; a.atkCD = 0; a.fleeTimer = 0;
        const lc = '#AADDFF';
        a.nameLabel = this.add.text(a.x, a.y - def.size - 10, def.name, {
          fontSize: '11px', fontFamily: 'monospace', color: lc, stroke: '#000', strokeThickness: 3
        }).setDepth(6).setOrigin(0.5);
        this.animals.add(a);
      }

      // ═══ FTUE: Hint text (disappears after 10s or first level-up) ═══
      this._ftueHint = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 80,
        '적을 처치하면 경험치를 얻습니다',
        { fontSize: '16px', fontFamily: 'monospace', color: '#FFFFFF',
          stroke: '#000', strokeThickness: 4, fontStyle: 'bold' }
      ).setOrigin(0.5).setDepth(100).setScrollFactor(0).setAlpha(0.9);
      this.time.delayedCall(10000, () => {
        if (this._ftueHint && this._ftueHint.active) {
          this.tweens.add({ targets: this._ftueHint, alpha: 0, duration: 500,
            onComplete: () => { if(this._ftueHint) this._ftueHint.destroy(); this._ftueHint = null; } });
        }
      });
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
    if (save.act2MinibossSpawned != null) this.act2MinibossSpawned = save.act2MinibossSpawned;
    if (save.act4MinibossSpawned != null) this.act4MinibossSpawned = save.act4MinibossSpawned;
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
    // Re-draw building graphics (same as placeBuilding)
    const wx = b.x, wy = b.y;
    const g = this.add.graphics().setDepth(2);
    if (b.type === 'campfire') {
      g.fillStyle(0x884422, 1); g.fillRect(wx-12, wy+6, 24, 6);
      g.fillStyle(0x664411, 1); g.fillRect(wx-10, wy+3, 20, 5);
      g.fillStyle(0x777777, 1);
      for (let i = 0; i < 8; i++) { const a2 = (i / 8) * Math.PI * 2; g.fillCircle(wx + Math.cos(a2)*14, wy + Math.sin(a2)*14, 3); }
      g.fillStyle(0xFF4400, 0.9); g.fillCircle(wx, wy, 10);
      g.fillStyle(0xFF8800, 0.8); g.fillCircle(wx, wy-2, 7);
      g.fillStyle(0xFFCC00, 0.6); g.fillCircle(wx, wy-4, 4);
    } else if (b.type === 'tent') {
      g.fillStyle(0x8B6914, 0.9); g.fillTriangle(wx, wy-26, wx-24, wy+12, wx+24, wy+12);
      g.fillStyle(0xA07B28, 0.7); g.fillTriangle(wx, wy-22, wx-20, wy+10, wx+20, wy+10);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-5, wy+2, 10, 10);
    } else if (b.type === 'storage') {
      g.fillStyle(0x795548, 1); g.fillRect(wx-18, wy-16, 36, 32);
      g.fillStyle(0x8D6E63, 1); g.fillTriangle(wx, wy-24, wx-20, wy-14, wx+20, wy-14);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-5, wy+4, 10, 12);
    } else if (b.type === 'workshop') {
      g.fillStyle(0x795548, 1); g.fillRect(wx-16, wy-14, 32, 28);
      g.fillStyle(0x8D6E63, 1); g.fillTriangle(wx, wy-22, wx-18, wy-12, wx+18, wy-12);
      g.fillStyle(0x5D4037, 1); g.fillRect(wx-5, wy+4, 10, 10);
    } else if (b.type === 'wall') {
      g.fillStyle(0x9E9E9E, 1); g.fillRect(wx-20, wy-10, 40, 20);
      g.fillStyle(0xBBBBBB, 0.5);
      g.fillRect(wx-18, wy-8, 10, 8); g.fillRect(wx-5, wy-8, 10, 8); g.fillRect(wx+8, wy-8, 10, 8);
    }
    const label = this.add.text(wx, wy-32, def.icon, {fontSize:'22px'}).setDepth(3).setOrigin(0.5);
    const bld = { type: b.type, x: wx, y: wy, graphic: g, label, def };
    this.placedBuildings.push(bld);
    this.buildingSprites.push(bld);
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
    // Zone colors: safe=#E8E8F0, normal=#B0C4DE, danger=#6A7A8A, extreme=#2D2D3A
    // 더 부드러운 눈밭 색상으로 개선
    const zoneColors = [
      { r: 0xEE, g: 0xEE, b: 0xF5 }, // safe - 밝은 눈색
      { r: 0xC8, g: 0xD4, b: 0xE0 }, // normal - 연한 파랑
      { r: 0x7A, g: 0x88, b: 0x96 }, // danger - 중간 회색
      { r: 0x35, g: 0x3D, b: 0x45 }, // extreme - 어두운 회색
    ];
    const zoneRadii = [ZONE_RADII.safe, ZONE_RADII.normal, ZONE_RADII.danger, Math.hypot(WORLD_W, WORLD_H)];
    const cx = MAP_CENTER.x, cy = MAP_CENTER.y;
    const tileSize = 32; // 더 작은 타일로 부드러운 전환
    const gradientWidth = 120; // 그라데이션 폭 증가

    for (let tx = 0; tx < WORLD_W; tx += tileSize) {
      for (let ty = 0; ty < WORLD_H; ty += tileSize) {
        const dist = Math.hypot(tx + tileSize/2 - cx, ty + tileSize/2 - cy);
        // Determine zone index with gradient blending
        let zoneIdx = 3;
        for (let z = 0; z < zoneRadii.length; z++) {
          if (dist <= zoneRadii[z]) { zoneIdx = z; break; }
        }
        // Blend between current zone and next zone at boundary (더 부드러운 전환)
        let c = zoneColors[zoneIdx];
        if (zoneIdx < 3) {
          const edge = zoneRadii[zoneIdx];
          const distToEdge = edge - dist;
          if (distToEdge < gradientWidth && distToEdge >= 0) {
            // smoothstep 함수로 더 자연스러운 전환
            const t = 1 - distToEdge / gradientWidth;
            const smoothT = t * t * (3 - 2 * t);
            const nc = zoneColors[zoneIdx + 1];
            c = {
              r: Math.round(c.r + (nc.r - c.r) * smoothT),
              g: Math.round(c.g + (nc.g - c.g) * smoothT),
              b: Math.round(c.b + (nc.b - c.b) * smoothT),
            };
          }
        }
        // 노이즈 기반 타일 변화 (Perlin-like)
        const noiseX = Math.floor(tx / tileSize);
        const noiseY = Math.floor(ty / tileSize);
        const noiseVal = Math.sin(noiseX * 0.5) * Math.cos(noiseY * 0.5) * 0.5 + 0.5;
        const variation = (noiseVal - 0.5) * 16; // -8 ~ 8 범위
        const cr = Phaser.Math.Clamp(c.r + variation, 0, 255);
        const cg = Phaser.Math.Clamp(c.g + variation, 0, 255);
        const cb = Phaser.Math.Clamp(c.b + variation, 0, 255);
        const color = (cr << 16) | (cg << 8) | cb;
        bg.fillStyle(color, 1);
        bg.fillRect(tx, ty, tileSize, tileSize);
      }
    }
    // 자연스러운 눈 패턴 오버레이
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, WORLD_W);
      const y = Phaser.Math.Between(0, WORLD_H);
      const w = Phaser.Math.Between(30, 150);
      const h = Phaser.Math.Between(15, 60);
      const alpha = Phaser.Math.FloatBetween(0.02, 0.12);
      bg.fillStyle(0xFFFFFF, alpha);
      bg.fillEllipse(x, y, w, h);
    }
    // 작은 눈 결정 패턴
    for (let i = 0; i < 300; i++) {
      const x = Phaser.Math.Between(0, WORLD_W);
      const y = Phaser.Math.Between(0, WORLD_H);
      const size = Phaser.Math.Between(2, 8);
      bg.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.05, 0.15));
      bg.fillCircle(x, y, size);
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
      if (Phaser.Math.Distance.Between(wx, wy, a.x, a.y) < range) { this.damageAnimal(a, Math.round(this.playerDamage * (this.streakBuff?.dmgMul || 1))); hit = true; }
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
        this.damageAnimal(nearAnimals[h].a, Math.round(this.playerDamage * (this.streakBuff?.dmgMul || 1)));
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
    // Equipment attack bonus
    if (this._equipBonuses && this._equipBonuses.atkMul > 0) {
      dmg = Math.round(dmg * (1 + this._equipBonuses.atkMul));
    }
    // Critical hit check
    if (this.upgradeManager.critChance > 0 && Math.random() < this.upgradeManager.critChance) {
      dmg = Math.ceil(dmg * 2);
      a._lastHitCrit = true;
      this.showFloatingText(a.x + 15, a.y - 30, '💥CRIT!', '#FF2222');
    }
    const isCrit = a._lastHitCrit || false; a._lastHitCrit = false;
    a.hp -= dmg; a.hitFlash = 0.2; a.setTint(0xFF4444); playHit();
    const fs = isCrit ? '28px' : dmg >= 3 ? '20px' : '16px';
    const c = isCrit ? '#FF2222' : '#FFFFFF';
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
    // ═══ Death particle effect (circles spreading) ═══
    for (let i = 0; i < 10; i++) {
      const ang = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(30, 70);
      const colors = [0xFFFFFF, 0xCCDDFF, 0xFF8888, 0xFFCC44];
      const p = this.add.circle(a.x, a.y, Phaser.Math.Between(2, 5), Phaser.Utils.Array.GetRandom(colors))
        .setDepth(15).setAlpha(1);
      this.tweens.add({ targets: p,
        x: a.x + Math.cos(ang) * dist, y: a.y + Math.sin(ang) * dist,
        alpha: 0, scale: { from: 1.2, to: 0 }, duration: Phaser.Math.Between(400, 800),
        ease: 'Quad.Out', onComplete: () => p.destroy() });
    }
    // Miniboss death: custom message + XP
    if (a.isMiniboss && a._minibossKillMsg) {
      this.cameras.main.shake(600, 0.02);
      this.cameras.main.flash(400, 255, 200, 50, true);
      if (a._minibossXP) this.gainXP(a._minibossXP);
      const mbText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 80,
        a._minibossKillMsg, {
        fontSize: '28px', fontFamily: 'monospace', color: '#FFD700',
        stroke: '#000', strokeThickness: 5, fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
      this.tweens.add({ targets: mbText, y: mbText.y - 50, alpha: 0, scale: { from: 1.2, to: 0.5 },
        duration: 3000, ease: 'Quad.Out', onComplete: () => mbText.destroy() });
    }
    // Boss death special effects
    if (a.isBoss && !a.isMiniboss) {
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
    // ═══ 고기 드랍 시스템 (확률 기반) ═══
    const meatDropChance = { rabbit: 0.3, deer: 0.5, wolf: 0.7, bear: 1.0 };
    const dropChance = meatDropChance[a.animalType] || 0;
    if (dropChance > 0 && Math.random() < dropChance) {
      this.stats.meatCollected = (this.stats.meatCollected || 0) + 1;
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
    // ═══ Buff item drop chance ═══
    this._tryDropBuff(a.x, a.y);

    // ═══ Equipment drop chance ═══
    this._tryDropEquipment(a.x, a.y);

    // ═══ Kill Combo ═══
    this.killCombo++;
    this.killComboTimer = 3; // 3 seconds to maintain combo
    if (this.killCombo > (this.stats.maxCombo || 0)) this.stats.maxCombo = this.killCombo;
    this._updateComboDisplay();
    this._applyStreakBuff(a.x, a.y);

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
    this.showFloatingText(a.x + 15, a.y - 30, '+' + _xpAmt + ' XP' + (this.killCombo >= 10 ? ' 🔥x2' : ''), '#44AAFF');

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
    const comboStr = this.killCombo >= 20
      ? `💥 ${this.killCombo}x COMBO! 광전사 모드!`
      : `🔥 ${this.killCombo}x COMBO` + (this.killCombo >= 10 ? ' · XP×2' : this.killCombo >= 5 ? ' · 💰+50%' : '');
    const color = this.killCombo >= 20 ? '#FF0044' : this.killCombo >= 10 ? '#FF4400' : this.killCombo >= 5 ? '#FFD700' : '#FFDD88';
    const fontSize = this.killCombo >= 20 ? '32px' : this.killCombo >= 10 ? '24px' : '18px';
    if (!this.killComboText) {
      this.killComboText = this.add.text(this.cameras.main.width - 10, 100, comboStr, {
        fontSize, fontFamily: 'monospace', color, stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
      }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);
    } else {
      this.killComboText.setText(comboStr).setColor(color).setFontSize(fontSize);
    }
    // Pulse effect
    this.tweens.add({ targets: this.killComboText, scale: { from: 1.3, to: 1 }, duration: 200 });

    // Big combo milestone popup (10, 20, 30...)
    if (this.killCombo >= 10 && this.killCombo % 10 === 0) {
      const milestoneText = this.killCombo >= 20
        ? `💥 ${this.killCombo} COMBO! 광전사 모드!`
        : `🔥 ${this.killCombo} COMBO!`;
      const milestoneColor = this.killCombo >= 20 ? '#FF0044' : '#FF4400';
      const mt = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 60, milestoneText, {
        fontSize: '36px', fontFamily: 'monospace', color: milestoneColor, stroke: '#000', strokeThickness: 6, fontStyle: 'bold'
      }).setScrollFactor(0).setDepth(250).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: mt, alpha: 1, scale: { from: 0.5, to: 1.5 }, duration: 300, ease: 'Back.Out',
        onComplete: () => this.tweens.add({ targets: mt, alpha: 0, y: mt.y - 40, duration: 1200, onComplete: () => mt.destroy() })
      });
      if (this.killCombo >= 20) this.cameras.main.flash(200, 255, 0, 68, true);
    }
  }

  // ═══ Streak Buff System ═══
  _applyStreakBuff(killX, killY) {
    const c = this.killCombo;
    let newTier = 0;
    let dmgMul = 1, spdMul = 1, timer = 0, label = '', color = '#FFFFFF';
    
    if (c >= 15) {
      newTier = 4; dmgMul = 1.5; spdMul = 1.3; timer = 10;
      label = '☠️ 전멸!'; color = '#FF0000';
    } else if (c >= 10) {
      newTier = 3; dmgMul = 1.5; spdMul = 1.3; timer = 10;
      label = '💀 학살자!'; color = '#FF4400';
    } else if (c >= 5) {
      newTier = 2; dmgMul = 1.3; spdMul = 1; timer = 8;
      label = '🔥 연쇄 처치!'; color = '#FF8800';
    } else if (c >= 3) {
      newTier = 1; dmgMul = 1; spdMul = 1.15; timer = 8;
      label = '⚡ 쾌속!'; color = '#FFDD00';
    }
    
    if (newTier > 0 && newTier > this.streakBuff.tier) {
      this.streakBuff = { dmgMul, spdMul, timer, tier: newTier };
      
      // Show center alert
      const cam = this.cameras.main;
      const alert = this.add.text(cam.width / 2, cam.height * 0.35, label, {
        fontSize: '32px', fontFamily: 'monospace', color, stroke: '#000', strokeThickness: 6, fontStyle: 'bold'
      }).setScrollFactor(0).setDepth(350).setOrigin(0.5).setAlpha(0);
      this.tweens.add({
        targets: alert, alpha: { from: 0, to: 1 }, y: { from: cam.height * 0.35, to: cam.height * 0.3 },
        duration: 300, ease: 'Back.Out',
        onComplete: () => this.tweens.add({ targets: alert, alpha: 0, duration: 400, delay: 600, onComplete: () => alert.destroy() })
      });
      
      // Visual feedback
      if (newTier >= 3) {
        cam.flash(200, 255, 100, 0, true);
        cam.shake(300, 0.01);
      } else if (newTier >= 2) {
        cam.flash(150, 255, 140, 0, true);
      }
      
      // Area explosion at tier 4+
      if (newTier >= 4 && killX && killY) {
        const radius = 150;
        this.animals.getChildren().forEach(en => {
          const dx = en.x - killX, dy = en.y - killY;
          if (Math.sqrt(dx*dx + dy*dy) < radius) {
            const dmg = 50;
            en.hp = (en.hp || 0) - dmg;
            this.showFloatingText(en.x, en.y - 20, `-${dmg}`, '#FF4400');
            if (en.hp <= 0) this.killAnimal(en);
          }
        });
        // Explosion ring
        for (let i = 0; i < 16; i++) {
          const ang = (Math.PI * 2 / 16) * i;
          const ep = this.add.circle(killX, killY, 5, 0xFF4400).setDepth(15).setAlpha(0.9);
          this.tweens.add({ targets: ep, x: killX + Math.cos(ang)*radius, y: killY + Math.sin(ang)*radius,
            alpha: 0, scale: { from: 2, to: 0 }, duration: 600, ease: 'Quad.Out', onComplete: () => ep.destroy() });
        }
      }
    }
  }
  
  _updateStreakBuff(dt) {
    if (this.streakBuff.timer <= 0) return;
    this.streakBuff.timer -= dt;
    if (this.streakBuff.timer <= 0) {
      this.streakBuff = { dmgMul: 1, spdMul: 1, timer: 0, tier: 0 };
    }
  }

  // ═══ Tutorial Hints ═══
  _updateTutorial() {
    if (this.tutorialShown) return;
    const t = this.gameElapsed;
    if (t > 16) {
      this.tutorialShown = true;
      if (this._tutorialText) { this.tweens.add({ targets: this._tutorialText, alpha: 0, duration: 500, onComplete: () => { this._tutorialText.destroy(); this._tutorialText = null; } }); }
      return;
    }

    const isMobile = this.sys.game.device.input.touch && window.innerWidth < 900;
    const hints = [
      { start: 0, end: 5, text: isMobile ? '👆 화면을 드래그해서 이동' : '🕹️ WASD / 방향키로 이동' },
      { start: 5, end: 10, text: '⚔️ 적에게 가까이 가면 자동 공격' },
      { start: 10, end: 15, text: '❄️ 한파를 피해 생존하세요!' },
    ];

    let activeHint = null;
    for (const h of hints) {
      if (t >= h.start && t < h.end) { activeHint = h; break; }
    }

    if (activeHint) {
      if (!this._tutorialText) {
        this._tutorialText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 80, '', {
          fontSize: '15px', fontFamily: 'monospace', color: '#FFFFFF',
          backgroundColor: 'rgba(0,0,0,0.65)', padding: { x: 16, y: 10 },
          stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0).setAlpha(0);
      }
      if (this._tutorialText.text !== activeHint.text) {
        this._tutorialText.setText(activeHint.text);
        this._tutorialText.setAlpha(0);
        this.tweens.add({ targets: this._tutorialText, alpha: 1, duration: 400 });
      }
      this._tutorialText.setVisible(true);
    } else {
      if (this._tutorialText) this._tutorialText.setVisible(false);
    }
  }

  _showTutorialOverlay() {
    const cam = this.cameras.main;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(300);
    ov.fillStyle(0x000000, 0.85); ov.fillRect(0, 0, cam.width, cam.height);

    const title = this.add.text(cam.width/2, cam.height*0.18, '❄️ 생존 가이드', {
      fontSize: '28px', fontFamily: 'monospace', color: '#e0e8ff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const tips = [
      '🕹️  조이스틱으로 이동 (적에게 다가가면 자동 공격)',
      '🪵  나무·돌을 채취해 건물을 건설하세요',
      '🔥  모닥불 근처에서 체온을 유지하세요',
      '🌡️  온도 0 이하 → HP 감소! 한파에 주의',
      '⬆️  적 처치 → XP → 레벨업 → 강화 선택',
    ];
    const tipTexts = tips.map((t, i) => {
      return this.add.text(cam.width/2, cam.height*0.32 + i*36, t, {
        fontSize: '14px', fontFamily: 'monospace', color: '#AABBDD', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);
    });

    const startMsg = this.add.text(cam.width/2, cam.height*0.78, '탭하여 시작', {
      fontSize: '20px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setAlpha(0);

    // Stagger fade in tips
    tipTexts.forEach((t, i) => {
      this.tweens.add({ targets: t, alpha: 1, duration: 300, delay: 200 + i * 150 });
    });
    this.tweens.add({ targets: startMsg, alpha: 1, duration: 400, delay: 1200, yoyo: true, repeat: -1, hold: 800 });

    // Pause game until tap
    this.gameOver = true; // temporarily pause update loop
    const hitArea = this.add.rectangle(cam.width/2, cam.height/2, cam.width, cam.height, 0, 0)
      .setScrollFactor(0).setDepth(302).setInteractive();
    hitArea.once('pointerdown', () => {
      resumeAudio();
      this.gameOver = false;
      [ov, title, startMsg, hitArea, ...tipTexts].forEach(o => o.destroy());
    });
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
    const total = Object.entries(this.res).filter(([k])=>k!=='gold').reduce((a,[_,v])=>a+(v||0), 0);
    if (r !== 'gold' && total >= this.storageCapacity) {
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
    let amount = (typeof source === 'number') ? source : (XP_SOURCES[source] ?? XP_SOURCES.default);
    if (this._equipBonuses && this._equipBonuses.xpMul > 0) amount = Math.round(amount * (1 + this._equipBonuses.xpMul));
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
    // Remove FTUE hint on first level-up
    if (this._ftueHint && this._ftueHint.active) {
      this._ftueHint.destroy(); this._ftueHint = null;
    }
    // Level up sound
    playLevelUp();

    // ═══ ENHANCED LEVEL UP EFFECT (Habby 스타일) ═══
    // 1. 화면 전체 황금색 플래시 (2단계)
    this.cameras.main.flash(600, 255, 200, 0, true);
    this.cameras.main.shake(400, 0.012);

    // Golden vignette overlay (more dramatic)
    const edgeFlash = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY,
      this.cameras.main.width, this.cameras.main.height, 0xFFD700, 0)
      .setDepth(99).setScrollFactor(0);
    this.tweens.add({ targets: edgeFlash, alpha: { from: 0.5, to: 0 }, duration: 800, ease: 'Quad.Out',
      onComplete: () => edgeFlash.destroy() });

    // 2. 레벨 숫자 팝업 (커졌다가 작아지는 애니메이션)
    const lvText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 60,
      `🎊 레벨 ${this.playerLevel} 달성!`, {
      fontSize: '52px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000', strokeThickness: 6, fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 0, color: '#FF8C00', blur: 20, fill: true }
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0).setScale(0.2).setAlpha(0);
    // Pop in big then settle
    this.tweens.add({ targets: lvText, scale: 1.4, alpha: 1, duration: 300, ease: 'Back.Out',
      onComplete: () => {
        this.tweens.add({ targets: lvText, scale: 1, duration: 200, ease: 'Quad.Out',
          onComplete: () => {
            this.tweens.add({ targets: lvText, y: lvText.y - 50, alpha: 0, scale: 0.6,
              duration: 1500, delay: 300, ease: 'Quad.Out', onComplete: () => lvText.destroy() });
          }
        });
      }
    });

    // Level number pop (big number behind)
    const bigNum = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 60,
      `${this.playerLevel}`, {
      fontSize: '120px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(98).setScrollFactor(0).setAlpha(0.3);
    this.tweens.add({ targets: bigNum, scale: { from: 0.5, to: 3 }, alpha: 0, duration: 1200,
      ease: 'Quad.Out', onComplete: () => bigNum.destroy() });

    // 3. 파티클 폭발 (3 rings, more particles)
    for (let ring = 0; ring < 3; ring++) {
      const count = ring === 0 ? 20 : ring === 1 ? 12 : 8;
      const radius = ring === 0 ? 90 : ring === 1 ? 55 : 30;
      const delay = ring * 80;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 / count) * i + ring * 0.3;
        const colors = [0xFFFFFF, 0xFFD700, 0xFFF8DC, 0xFFAA00, 0xFF6B35];
        const size = ring === 0 ? 6 : ring === 1 ? 4 : 3;
        const p = this.add.circle(this.player.x, this.player.y, size, Phaser.Utils.Array.GetRandom(colors))
          .setDepth(15).setAlpha(0.9);
        this.tweens.add({ targets: p, delay,
          x: this.player.x + Math.cos(ang) * radius,
          y: this.player.y + Math.sin(ang) * radius,
          alpha: 0, scale: { from: 2, to: 0 }, duration: 1000, ease: 'Quad.Out',
          onComplete: () => p.destroy() });
      }
    }

    // Sparkle trail particles
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 60, () => {
        const sp = this.add.image(
          this.player.x + Phaser.Math.Between(-50, 50),
          this.player.y + Phaser.Math.Between(-50, 50),
          'sparkle'
        ).setScrollFactor(1).setDepth(16).setScale(2).setTint(0xFFD700);
        this.tweens.add({ targets: sp, alpha: 0, scale: 0, y: sp.y - 40,
          duration: 600 + Math.random() * 400, onComplete: () => sp.destroy() });
      });
    }

    // Show upgrade card selection
    const cards = this.upgradeManager.pickThreeCards(this.extraCardChoices || 0);
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

  // ═══════════════════════════════════════════════
  // ═══ BUFF ITEM SYSTEM ═══
  // ═══════════════════════════════════════════════
  _initBuffSystem() {
    this.buffSlots = [null, null]; // 2 slots
    this.activeBuffs = {}; // { buffType: { remaining, ... } }
    this.buffDropGroup = this.physics.add.group();
    this.buffDropItems = []; // track for expiry
    this._buffTextures();
    // Q/E keys
    this.buffKeys = {
      q: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      e: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    };
    // HUD slots
    this._createBuffHUD();
    this._createEquipHUD();
    // Fire breath damage timer
    this._fireBreathTimer = 0;
  }

  _buffTextures() {
    const buffs = [
      { key: 'buff_fire', color: 0xFF4400, icon: '🔥' },
      { key: 'buff_sprint', color: 0x44CCFF, icon: '💨' },
      { key: 'buff_shotgun', color: 0xFFDD00, icon: '🔫' },
      { key: 'buff_wool', color: 0xFFFFFF, icon: '🐑' }
    ];
    buffs.forEach(b => {
      if (this.textures.exists(b.key)) return;
      const g = this.add.graphics();
      g.fillStyle(0x222244, 0.9); g.fillRoundedRect(0, 0, 24, 24, 4);
      g.fillStyle(b.color, 0.8); g.fillCircle(12, 12, 8);
      g.lineStyle(2, 0xFFFFFF, 0.6); g.strokeRoundedRect(0, 0, 24, 24, 4);
      g.generateTexture(b.key, 24, 24); g.destroy();
    });
  }

  _createBuffHUD() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.buffHudGfx = this.add.graphics().setScrollFactor(0).setDepth(105);
    this.buffHudTexts = [
      this.add.text(W / 2 - 35, H - 55, '', { fontSize: '11px', fontFamily: 'monospace', color: '#fff', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(106).setOrigin(0.5),
      this.add.text(W / 2 + 35, H - 55, '', { fontSize: '11px', fontFamily: 'monospace', color: '#fff', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(106).setOrigin(0.5)
    ];
    this.buffHudKeys = [
      this.add.text(W / 2 - 35, H - 30, '[Q]', { fontSize: '10px', fontFamily: 'monospace', color: '#888' }).setScrollFactor(0).setDepth(106).setOrigin(0.5),
      this.add.text(W / 2 + 35, H - 30, '[E]', { fontSize: '10px', fontFamily: 'monospace', color: '#888' }).setScrollFactor(0).setDepth(106).setOrigin(0.5)
    ];
    // Touch/click handlers on slots
    for (let i = 0; i < 2; i++) {
      const sx = W / 2 + (i === 0 ? -35 : 35);
      const hit = this.add.rectangle(sx, H - 45, 44, 44, 0, 0).setScrollFactor(0).setDepth(107).setInteractive();
      hit.on('pointerdown', () => this._useBuffSlot(i));
    }
  }

  _updateBuffHUD() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.buffHudGfx.clear();
    const names = { fire: '🔥불뿜기', sprint: '💨달리기', shotgun: '🔫샷건', wool: '🐑양털' };
    for (let i = 0; i < 2; i++) {
      const sx = W / 2 + (i === 0 ? -35 : 35);
      const slot = this.buffSlots[i];
      if (slot) {
        this.buffHudGfx.fillStyle(0x334466, 0.9);
        this.buffHudGfx.fillRoundedRect(sx - 22, H - 67, 44, 44, 6);
        this.buffHudGfx.lineStyle(2, 0x88CCFF, 0.8);
        this.buffHudGfx.strokeRoundedRect(sx - 22, H - 67, 44, 44, 6);
        this.buffHudTexts[i].setText(names[slot] || slot);
      } else {
        this.buffHudGfx.fillStyle(0x222233, 0.6);
        this.buffHudGfx.fillRoundedRect(sx - 22, H - 67, 44, 44, 6);
        this.buffHudGfx.lineStyle(1, 0x445566, 0.5);
        this.buffHudGfx.strokeRoundedRect(sx - 22, H - 67, 44, 44, 6);
        this.buffHudTexts[i].setText('');
      }
    }
  }

  _tryDropBuff(x, y) {
    // 3~5% chance, max 3 on map
    if (this.buffDropItems.length >= 3) return;
    if (Math.random() > 0.05) return;
    const types = ['fire', 'sprint', 'shotgun', 'wool'];
    const type = types[Math.floor(Math.random() * types.length)];
    const texKey = 'buff_' + type;
    const drop = this.physics.add.sprite(x, y, texKey).setDepth(8);
    drop.body.setAllowGravity(false);
    drop.buffType = type;
    drop.lifetime = 60; // seconds
    this.buffDropGroup.add(drop);
    this.buffDropItems.push(drop);
    // Bounce in
    this.tweens.add({ targets: drop, scale: { from: 0, to: 1.3 }, duration: 300, ease: 'Back.Out',
      onComplete: () => this.tweens.add({ targets: drop, scale: 1, duration: 200 }) });
    // Floating label
    const icons = { fire: '🔥', sprint: '💨', shotgun: '🔫', wool: '🐑' };
    const label = this.add.text(x, y - 20, icons[type] || '?', {
      fontSize: '16px', fontFamily: 'monospace'
    }).setDepth(9).setOrigin(0.5);
    drop._label = label;
  }

  _collectBuffDrop(bd) {
    if (!bd.active) return;
    // Find empty slot (oldest first = slot 0 first)
    let slotIdx = -1;
    if (this.buffSlots[0] === null) slotIdx = 0;
    else if (this.buffSlots[1] === null) slotIdx = 1;
    if (slotIdx === -1) return; // both full
    this.buffSlots[slotIdx] = bd.buffType;
    this.showFloatingText(bd.x, bd.y - 20, '버프 획득!', '#88FFAA');
    if (bd._label) bd._label.destroy();
    const idx = this.buffDropItems.indexOf(bd);
    if (idx >= 0) this.buffDropItems.splice(idx, 1);
    bd.destroy();
    this._updateBuffHUD();
  }

  _useBuffSlot(idx) {
    const type = this.buffSlots[idx];
    if (!type) return;
    this.buffSlots[idx] = null;
    this._activateBuff(type);
    this._updateBuffHUD();
  }

  _activateBuff(type) {
    const px = this.player.x, py = this.player.y;
    if (type === 'fire') {
      this.activeBuffs.fire = { remaining: 5 };
      this._fireBreathTimer = 0;
      this.showFloatingText(px, py - 30, '🔥 불뿜기!', '#FF4400');
    } else if (type === 'sprint') {
      this.activeBuffs.sprint = { remaining: 8, origSpeed: this.playerSpeed };
      this.playerSpeed *= 3;
      this.showFloatingText(px, py - 30, '💨 달리기!', '#44CCFF');
    } else if (type === 'shotgun') {
      this.showFloatingText(px, py - 30, '🔫 샷건!', '#FFDD00');
      // Flash effect
      this.cameras.main.flash(200, 255, 255, 200);
      // 8-directional projectiles
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const bullet = this.add.circle(px, py, 5, 0xFFFF44).setDepth(15);
        const speed = 400;
        const bx = Math.cos(ang), by = Math.sin(ang);
        this.tweens.add({
          targets: bullet, x: px + bx * 600, y: py + by * 600,
          duration: 1500, ease: 'Linear',
          onUpdate: () => {
            // Check hits on animals
            this.animals.getChildren().forEach(a => {
              if (!a.active || a._shotgunHit) return;
              const d = Phaser.Math.Distance.Between(bullet.x, bullet.y, a.x, a.y);
              if (d < 25) {
                a.hp -= 150;
                a.setTint(0xFFFF00);
                this.time.delayedCall(150, () => { if (a.active) a.clearTint(); });
                this.showFloatingText(a.x, a.y - 20, '-150', '#FFDD00');
                if (a.hp <= 0) this.killAnimal(a);
              }
            });
          },
          onComplete: () => bullet.destroy()
        });
      }
    } else if (type === 'wool') {
      this.activeBuffs.wool = { remaining: 15 };
      this.showFloatingText(px, py - 30, '🐑 양털슈트!', '#FFFFFF');
    }
  }

  _updateBuffs(dt) {
    // Q/E key check
    if (Phaser.Input.Keyboard.JustDown(this.buffKeys.q)) this._useBuffSlot(0);
    if (Phaser.Input.Keyboard.JustDown(this.buffKeys.e)) this._useBuffSlot(1);

    // Update buff drop expiry
    for (let i = this.buffDropItems.length - 1; i >= 0; i--) {
      const bd = this.buffDropItems[i];
      if (!bd.active) { this.buffDropItems.splice(i, 1); continue; }
      bd.lifetime -= dt;
      // Blink when < 10s
      if (bd.lifetime < 10) {
        bd.setAlpha(Math.sin(bd.lifetime * 8) * 0.3 + 0.5);
        if (bd._label) bd._label.setAlpha(bd.alpha);
      }
      if (bd.lifetime <= 0) {
        if (bd._label) bd._label.destroy();
        bd.destroy();
        this.buffDropItems.splice(i, 1);
      }
    }

    // Fire Breath
    if (this.activeBuffs.fire) {
      this.activeBuffs.fire.remaining -= dt;
      this._fireBreathTimer -= dt;
      // Visual: orange/red particles in front arc
      const dir = this.facingRight ? 0 : Math.PI;
      for (let i = 0; i < 3; i++) {
        const ang = dir + (Math.random() - 0.5) * (Math.PI * 2 / 3); // 120° arc
        const dist = 30 + Math.random() * 120;
        const px = this.player.x + Math.cos(ang) * dist;
        const py = this.player.y + Math.sin(ang) * dist;
        const colors = [0xFF4400, 0xFF6600, 0xFF8800, 0xFF2200];
        const p = this.add.circle(px, py, 2 + Math.random() * 4, Phaser.Utils.Array.GetRandom(colors))
          .setDepth(12).setAlpha(0.8);
        this.tweens.add({ targets: p, alpha: 0, scale: 0, duration: 300 + Math.random() * 300, onComplete: () => p.destroy() });
      }
      // Damage every 0.3s
      if (this._fireBreathTimer <= 0) {
        this._fireBreathTimer = 0.3;
        const dir2 = this.facingRight ? 0 : Math.PI;
        this.animals.getChildren().forEach(a => {
          if (!a.active) return;
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
          if (d > 150) return;
          const angToA = Phaser.Math.Angle.Between(this.player.x, this.player.y, a.x, a.y);
          let diff = angToA - dir2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) < Math.PI / 3) { // 120° = 60° each side
            a.hp -= 10;
            a.setTint(0xFF4400);
            this.time.delayedCall(100, () => { if (a.active) a.clearTint(); });
            if (a.hp <= 0) this.killAnimal(a);
          }
        });
      }
      if (this.activeBuffs.fire.remaining <= 0) delete this.activeBuffs.fire;
    }

    // Sprint
    if (this.activeBuffs.sprint) {
      this.activeBuffs.sprint.remaining -= dt;
      // Speed lines visual
      if (Math.random() < 0.3) {
        const ang = Math.random() * Math.PI * 2;
        const p = this.add.rectangle(
          this.player.x + Math.cos(ang) * 15, this.player.y + Math.sin(ang) * 15,
          2, 10 + Math.random() * 15, 0xFFFFFF, 0.6
        ).setDepth(9).setRotation(ang);
        this.tweens.add({ targets: p, alpha: 0, scaleX: 0, duration: 200, onComplete: () => p.destroy() });
      }
      if (this.activeBuffs.sprint.remaining <= 0) {
        this.playerSpeed = this.playerBaseSpeed;
        delete this.activeBuffs.sprint;
      }
    }

    // Wool Suit visual
    if (this.activeBuffs.wool) {
      this.activeBuffs.wool.remaining -= dt;
      // White glow
      if (!this._woolGlow) {
        this._woolGlow = this.add.circle(this.player.x, this.player.y, 30, 0xFFFFFF, 0.15).setDepth(9);
      }
      this._woolGlow.setPosition(this.player.x, this.player.y);
      if (this.activeBuffs.wool.remaining <= 0) {
        delete this.activeBuffs.wool;
        if (this._woolGlow) { this._woolGlow.destroy(); this._woolGlow = null; }
      }
    } else if (this._woolGlow) {
      this._woolGlow.destroy(); this._woolGlow = null;
    }

    this._updateBuffHUD();
  }

  // ═══ EQUIPMENT DROP & PICKUP ═══
  _tryDropEquipment(x, y) {
    const luck = (this._equipBonuses ? this._equipBonuses.luckFlat : 0);
    const dropRate = 0.03 + luck / 1000; // 3% base + luck bonus
    if (Math.random() > dropRate) return;
    if (this.equipmentDrops.length >= 5) return;

    const drop = EquipmentManager.rollDrop(luck);
    const color = EQUIP_GRADE_COLORS[drop.grade];
    const label = this.add.text(x, y - 10, drop.icon + ' ' + drop.name, {
      fontSize: '12px', fontFamily: 'monospace', color: color,
      stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setDepth(15).setOrigin(0.5);

    const glow = this.add.circle(x, y, 14, Phaser.Display.Color.HexStringToColor(color).color, 0.4).setDepth(8);
    this.tweens.add({ targets: glow, scale: { from: 0.5, to: 1.5 }, alpha: { from: 0.6, to: 0.2 }, yoyo: true, repeat: -1, duration: 800 });
    this.tweens.add({ targets: label, y: label.y - 8, yoyo: true, repeat: -1, duration: 1000, ease: 'Sine.InOut' });

    const eqDrop = { x, y, ...drop, label, glow, lifetime: 30 };
    this.equipmentDrops.push(eqDrop);
  }

  _updateEquipmentDrops(dt) {
    const px = this.player.x, py = this.player.y;
    for (let i = this.equipmentDrops.length - 1; i >= 0; i--) {
      const ed = this.equipmentDrops[i];
      ed.lifetime -= dt;
      if (ed.lifetime < 5) {
        const a = Math.sin(ed.lifetime * 6) * 0.3 + 0.5;
        if (ed.label) ed.label.setAlpha(a);
        if (ed.glow) ed.glow.setAlpha(a * 0.4);
      }
      if (ed.lifetime <= 0) {
        if (ed.label) ed.label.destroy();
        if (ed.glow) ed.glow.destroy();
        this.equipmentDrops.splice(i, 1);
        continue;
      }
      const dist = Phaser.Math.Distance.Between(px, py, ed.x, ed.y);
      if (dist < 100) {
        this._pickupEquipment(ed, i);
      }
    }
  }

  _pickupEquipment(ed, idx) {
    const equipped = this.equipmentManager.tryEquip(ed.slot, ed.itemId, ed.grade);
    // Grade-based SFX & visual feedback
    this._playEquipPickupFX(ed.grade);
    if (equipped) {
      const color = EQUIP_GRADE_COLORS[ed.grade];
      this.showFloatingText(this.player.x, this.player.y - 40,
        ed.icon + ' ' + ed.name + ' 장착!', color);
      this._equipBonuses = this.equipmentManager.getTotalBonuses();
      this._updateEquipHUD();
    } else {
      // Store in inventory for crafting
      this.equipmentManager.addToInventory(ed.slot, ed.itemId, ed.grade);
      this.showFloatingText(this.player.x, this.player.y - 40,
        ed.icon + ' 보관 (+1)', '#AAAAAA');
    }
    if (ed.label) ed.label.destroy();
    if (ed.glow) ed.glow.destroy();
    this.equipmentDrops.splice(idx, 1);
  }

  _playEquipPickupFX(grade) {
    switch (grade) {
      case 'common':
        playCoin();
        break;
      case 'rare':
        playUpgradeSelect();
        break;
      case 'epic':
        playEpicCard();
        this.cameras.main.flash(200, 160, 40, 200, true);
        break;
      case 'legendary':
        playEpicCard();
        this.cameras.main.flash(300, 255, 215, 0, true);
        // Golden burst particles
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          const p = this.add.circle(this.player.x, this.player.y, 5, 0xFFD700).setDepth(200).setAlpha(0.9);
          this.tweens.add({ targets: p, x: this.player.x + Math.cos(ang) * 60, y: this.player.y + Math.sin(ang) * 60,
            alpha: 0, scale: { from: 2, to: 0 }, duration: 700, onComplete: () => p.destroy() });
        }
        // Big popup
        const legText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, '⭐ LEGENDARY! ⭐', {
          fontSize: '28px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 5, fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(300).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: legText, alpha: 1, scale: { from: 0.3, to: 1.3 }, duration: 400, ease: 'Back.Out',
          onComplete: () => this.tweens.add({ targets: legText, alpha: 0, y: legText.y - 40, duration: 800, delay: 600, onComplete: () => legText.destroy() })
        });
        break;
      case 'unique':
        playEpicCard();
        this.cameras.main.flash(400, 255, 64, 129, true);
        for (let i = 0; i < 20; i++) {
          const ang = (i / 20) * Math.PI * 2;
          const colors = [0xFF4081, 0xFFD700, 0xFF69B4];
          const p = this.add.circle(this.player.x, this.player.y, 6, Phaser.Utils.Array.GetRandom(colors)).setDepth(200);
          this.tweens.add({ targets: p, x: this.player.x + Math.cos(ang) * 80, y: this.player.y + Math.sin(ang) * 80,
            alpha: 0, scale: { from: 2.5, to: 0 }, duration: 900, onComplete: () => p.destroy() });
        }
        const uniText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, '💎 UNIQUE!! 💎', {
          fontSize: '32px', fontFamily: 'monospace', color: '#FF4081', stroke: '#000', strokeThickness: 5, fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(300).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: uniText, alpha: 1, scale: { from: 0.3, to: 1.5 }, duration: 500, ease: 'Back.Out',
          onComplete: () => this.tweens.add({ targets: uniText, alpha: 0, y: uniText.y - 50, duration: 1000, delay: 800, onComplete: () => uniText.destroy() })
        });
        break;
    }
  }

  // ═══ EQUIPMENT HUD ═══
  _createEquipHUD() {
    const W = this.scale.width;
    const H = this.scale.height;
    this._equipHudGfx = this.add.graphics().setScrollFactor(0).setDepth(105);
    this._equipHudTexts = [];
    this._equipHudTooltip = null;
    const slotKeys = ['weapon','armor','boots','helmet','ring'];
    const startX = W - 230;
    const startY = H - 50;
    for (let i = 0; i < 5; i++) {
      const sx = startX + i * 45;
      const txt = this.add.text(sx, startY, '', {
        fontSize: '18px', fontFamily: 'monospace'
      }).setScrollFactor(0).setDepth(106).setOrigin(0.5);
      this._equipHudTexts.push(txt);
      // Click handler for tooltip
      const hit = this.add.rectangle(sx, startY, 40, 40, 0, 0)
        .setScrollFactor(0).setDepth(107).setInteractive();
      const slotKey = slotKeys[i];
      hit.on('pointerdown', () => this._showEquipTooltip(slotKey, sx, startY - 50));
    }
    this._updateEquipHUD();
  }

  _updateEquipHUD() {
    if (!this._equipHudGfx) return;
    const W = this.scale.width;
    const H = this.scale.height;
    this._equipHudGfx.clear();
    const slotKeys = ['weapon','armor','boots','helmet','ring'];
    const startX = W - 230;
    const startY = H - 50;
    for (let i = 0; i < 5; i++) {
      const sx = startX + i * 45;
      const slot = slotKeys[i];
      const eq = this.equipmentManager.slots[slot];
      if (eq) {
        const color = Phaser.Display.Color.HexStringToColor(EQUIP_GRADE_COLORS[eq.grade]).color;
        this._equipHudGfx.fillStyle(0x222244, 0.9);
        this._equipHudGfx.fillRoundedRect(sx - 20, startY - 20, 40, 40, 6);
        this._equipHudGfx.lineStyle(2, color, 1);
        this._equipHudGfx.strokeRoundedRect(sx - 20, startY - 20, 40, 40, 6);
        const def = this.equipmentManager.getItemDef(slot);
        this._equipHudTexts[i].setText(def ? def.icon : EQUIP_SLOT_ICONS[slot]);
      } else {
        this._equipHudGfx.fillStyle(0x333344, 0.5);
        this._equipHudGfx.fillRoundedRect(sx - 20, startY - 20, 40, 40, 6);
        this._equipHudGfx.lineStyle(1, 0x555566, 0.5);
        this._equipHudGfx.strokeRoundedRect(sx - 20, startY - 20, 40, 40, 6);
        this._equipHudTexts[i].setText(EQUIP_SLOT_ICONS[slot]).setAlpha(0.3);
      }
    }
  }

  _showEquipTooltip(slot, x, y) {
    // Clean up previous tooltip
    if (this._equipHudTooltip) { this._equipHudTooltip.forEach(o => o.destroy()); this._equipHudTooltip = null; }
    if (this._craftBtn) { this._craftBtn.forEach(o => o.destroy()); this._craftBtn = null; }

    const eq = this.equipmentManager.slots[slot];
    const inv = this.equipmentManager.inventory[slot] || [];
    const effectNames = { atkMul:'공격력', aspdMul:'공속', hpFlat:'HP', defMul:'방어', spdMul:'이속', dodgeMul:'회피', coldRes:'한파저항', regenPS:'HP회복', xpMul:'XP', luckFlat:'행운' };

    let lines = [];
    if (eq) {
      const def = this.equipmentManager.getItemDef(slot);
      if (def) {
        const gradeLabel = EQUIP_GRADE_LABELS[eq.grade];
        const effectStr = Object.entries(def.effects).map(([k,v]) => (effectNames[k]||k) + (k.includes('Flat') ? '+'+v : '+'+Math.round(v*100)+'%')).join(', ');
        lines.push(`[${gradeLabel}] ${def.icon} ${def.name}`);
        lines.push(effectStr);
      }
    } else {
      lines.push('빈 슬롯');
    }

    // Show inventory counts by grade
    if (inv.length > 0) {
      const counts = {};
      inv.forEach(i => { counts[i.grade] = (counts[i.grade]||0) + 1; });
      const invStr = Object.entries(counts).map(([g,c]) => `${EQUIP_GRADE_LABELS[g]}×${c}`).join(' ');
      lines.push(`📦 보관: ${invStr}`);
    }

    // Check craftable
    const craftable = this.equipmentManager.getCraftableGrades(slot);
    if (craftable.length > 0) {
      const cg = craftable[0]; // craft lowest grade first
      const nextG = EQUIP_GRADES[EQUIP_GRADES.indexOf(cg) + 1];
      lines.push(`⚗️ ${EQUIP_GRADE_LABELS[cg]}×3 → ${EQUIP_GRADE_LABELS[nextG]} 합성 가능!`);
    }

    const color = eq ? EQUIP_GRADE_COLORS[eq.grade] : '#888888';
    const tooltipText = this.add.text(x, y, lines.join('\n'), {
      fontSize: '11px', fontFamily: 'monospace', color: color,
      stroke: '#000', strokeThickness: 3, backgroundColor: '#111122',
      padding: { x: 6, y: 4 }, align: 'center', wordWrap: { width: 250 }
    }).setScrollFactor(0).setDepth(200).setOrigin(0.5, 1);

    const elements = [tooltipText];

    // Add craft button if craftable
    if (craftable.length > 0) {
      const cg = craftable[0];
      const btnY = tooltipText.y + 4;
      const btnBg = this.add.graphics().setScrollFactor(0).setDepth(200);
      btnBg.fillStyle(0x6633AA, 0.9);
      btnBg.fillRoundedRect(x - 50, btnY, 100, 26, 6);
      btnBg.lineStyle(1, 0xAA66FF, 1);
      btnBg.strokeRoundedRect(x - 50, btnY, 100, 26, 6);
      const btnText = this.add.text(x, btnY + 13, '⚗️ 합성', {
        fontSize: '13px', fontFamily: 'monospace', color: '#FFFFFF',
        stroke: '#000', strokeThickness: 2, fontStyle: 'bold'
      }).setScrollFactor(0).setDepth(201).setOrigin(0.5);
      const btnHit = this.add.rectangle(x, btnY + 13, 100, 26).setScrollFactor(0).setDepth(202).setOrigin(0.5).setInteractive().setAlpha(0.001);
      btnHit.on('pointerdown', () => {
        const result = this.equipmentManager.craft(slot, cg);
        if (result) {
          playCraft();
          this._playEquipPickupFX(result.grade);
          const rc = EQUIP_GRADE_COLORS[result.grade];
          this.showFloatingText(this.player.x, this.player.y - 50,
            `⚗️ ${result.icon} ${result.name} [${EQUIP_GRADE_LABELS[result.grade]}] 합성!`, rc);
          this._equipBonuses = this.equipmentManager.getTotalBonuses();
          this._updateEquipHUD();
          // Re-show tooltip
          this._showEquipTooltip(slot, x, y);
        }
      });
      elements.push(btnBg, btnText, btnHit);
      this._craftBtn = [btnBg, btnText, btnHit];
    }

    this._equipHudTooltip = elements;
    this.time.delayedCall(5000, () => {
      if (this._equipHudTooltip) { this._equipHudTooltip.forEach(o => o.destroy()); this._equipHudTooltip = null; }
      if (this._craftBtn) { this._craftBtn.forEach(o => o.destroy()); this._craftBtn = null; }
    });
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

      // ═══ Wool Suit: hostile animals flee from player ═══
      if (!repelled && this.activeBuffs.wool && a.def.behavior === 'chase' && dist < 200) {
        const ang = Phaser.Math.Angle.Between(px, py, a.x, a.y);
        a.body.setVelocity(Math.cos(ang) * a.def.speed * 1.2, Math.sin(ang) * a.def.speed * 1.2);
        repelled = true;
      }

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
              // Sprint invincibility
              if (this.activeBuffs.sprint) { a.atkCD = 0.5; return; }
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

      // 방향에 따른 스프라이트 전환 (뒷모습 포함)
      const avx = a.body.velocity.x, avy = a.body.velocity.y;
      if (Math.abs(avx) > Math.abs(avy)) {
        // 좌우 이동 → 앞모습
        if (avx > 5) a.setFlipX(false);
        else if (avx < -5) a.setFlipX(true);
        if (Math.abs(avx) > 5) a.setTexture(a.animalType);
      } else if (avy < -5) {
        // 위로 이동 → 뒷모습
        a.setTexture(a.animalType + '_back');
        a.setFlipX(false);
      } else if (avy > 5) {
        // 아래로 이동 → 앞모습
        a.setTexture(a.animalType);
      }
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
              // 사냥꾼/전사 타격 사운드 - 거리 기반 감쇠 적용
              const distToPlayer = Phaser.Math.Distance.Between(npc.x, npc.y, this.player.x, this.player.y);
              _playSFX('hit', 0.35, distToPlayer, 400);
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
      // NPC 방향에 따른 스프라이트 전환 (뒷모습 포함)
      const nvx = npc.body.velocity.x, nvy = npc.body.velocity.y;
      if (Math.abs(nvx) > Math.abs(nvy)) {
        if (nvx > 5) npc.setFlipX(false);
        else if (nvx < -5) npc.setFlipX(true);
        if (Math.abs(nvx) > 5) npc.setTexture('npc_' + npc.npcType);
      } else if (nvy < -5) {
        npc.setTexture('npc_' + npc.npcType + '_back');
        npc.setFlipX(false);
      } else if (nvy > 5) {
        npc.setTexture('npc_' + npc.npcType);
      }
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
        // Campfire HP regen indicator text
        if (!b._regenLabel) {
          b._regenLabel = this.add.text(b.x, b.y - 30, '🔥 HP+1/s', {
            fontSize: '11px', fontFamily: 'monospace', color: '#FF8844',
            stroke: '#000', strokeThickness: 2
          }).setDepth(12).setOrigin(0.5).setAlpha(0.6);
          this.tweens.add({ targets: b._regenLabel, y: b.y - 35, yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.InOut' });
        }
        if (pd < 100 && b._regenLabel) b._regenLabel.setAlpha(0.8);
        else if (b._regenLabel) b._regenLabel.setAlpha(0.4);
      } else {
        if (b._regenLabel) b._regenLabel.setAlpha(0.2);
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
      case 'damage': this.playerDamage = Math.min(30, this.playerDamage + recipe.value); break;
      case 'warmthResist': this.warmthResist = Math.min(1.0, this.warmthResist + recipe.value); break;
      case 'speed': this.playerSpeed = Math.min(300, this.playerSpeed + recipe.value); this.playerBaseSpeed = Math.min(300, this.playerBaseSpeed + recipe.value); break;
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
    const woolMul = this.activeBuffs.wool ? 0.5 : 1; // 양털슈트: 체온 소모 50% 감소
    const sprintFreeze = this.activeBuffs.sprint ? 0 : 1; // 달리기: 체온 소모 없음
    this.temperature = Math.max(0, this.temperature - (baseDecay + Math.abs(zoneDecay)) * this.blizzardMultiplier * (1 - frostRes) * woolMul * sprintFreeze * dt);
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
      // Special reward effects
      if (q.rewardEffect) {
        if (q.rewardEffect.tempBonus) this.temperature = Math.min(this.maxTemp, this.temperature + q.rewardEffect.tempBonus);
        if (q.rewardEffect.maxHPBonus) { this.playerMaxHP += q.rewardEffect.maxHPBonus; this.playerHP += q.rewardEffect.maxHPBonus; }
      }
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

    // Clean up existing joystick if any (prevent duplicates on restart)
    const existingBase = document.getElementById('vjoystick-base');
    if (existingBase) existingBase.remove();

    // Create joystick container (hidden by default — dynamic joystick)
    const base = document.createElement('div');
    base.id = 'vjoystick-base';
    base.style.cssText = `
      position:fixed; width:160px; height:160px;
      left:0; top:0;
      border-radius:50%; border:2.5px solid rgba(255,255,255,0.25);
      background:radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%);
      pointer-events:none; z-index:2000;
      opacity:0; visibility:hidden;
      transform:translate(-50%,-50%);
      transition: opacity 0.12s ease, visibility 0.12s ease;
    `;
    const knob = document.createElement('div');
    knob.id = 'vjoystick-knob';
    knob.style.cssText = `
      position:absolute; width:70px; height:70px; border-radius:50%;
      background:radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%);
      border:2px solid rgba(255,255,255,0.55);
      top:50%; left:50%; transform:translate(-50%,-50%);
      pointer-events:none;
    `;
    base.appendChild(knob);
    document.body.appendChild(base);

    const showJoystick = (cx, cy) => {
      base.style.left = cx + 'px';
      base.style.top = cy + 'px';
      base.style.opacity = '0.55';
      base.style.visibility = 'visible';
      knob.style.transform = 'translate(-50%, -50%)';
      self._vjoy = { cx, cy };
      self.joystickActive = true;
    };

    const hideJoystick = () => {
      base.style.opacity = '0';
      base.style.visibility = 'hidden';
      knob.style.transform = 'translate(-50%, -50%)';
      self.joystickActive = false;
      self._smoothMove.x = 0;
      self._smoothMove.y = 0;
    };

    const updateKnob = (clientX, clientY) => {
      const dx = clientX - self._vjoy.cx;
      const dy = clientY - self._vjoy.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = 60;
      const clamp = Math.min(dist, maxR);
      const ang = Math.atan2(dy, dx);
      const kx = Math.cos(ang) * clamp;
      const ky = Math.sin(ang) * clamp;
      knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;

      if (dist > 8) {
        const strength = Math.min(1, dist / maxR);
        self._smoothMove.x = Math.cos(ang) * strength;
        self._smoothMove.y = Math.sin(ang) * strength;
      } else {
        self._smoothMove.x = 0;
        self._smoothMove.y = 0;
      }
    };

    const isUITouch = (cx, cy) => {
      const h = window.innerHeight;
      const safeB = self.safeBottom || 0;
      if (cy > h - 60 - safeB) return true;
      if (cy < 120 && cx < 260) return true;
      if (self.activePanel && cx > window.innerWidth - 240 && cy > 60) return true;
      return false;
    };

    // Track which touch ID is the joystick
    let activeTouchId = null;

    const onStart = (e) => {
      if (self.gameOver) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (activeTouchId !== null) break;
        if (isUITouch(t.clientX, t.clientY)) continue;
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (el && (el.tagName === 'BUTTON' || el.closest('#bottom-buttons') || el.closest('#dom-hud'))) continue;

        e.preventDefault();
        activeTouchId = t.identifier;
        showJoystick(t.clientX, t.clientY);
        break;
      }
    };

    const onMove = (e) => {
      if (activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== activeTouchId) continue;
        e.preventDefault();
        updateKnob(t.clientX, t.clientY);
        break;
      }
    };

    const onEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          activeTouchId = null;
          hideJoystick();
          break;
        }
      }
    };

    document.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd, { passive: false });
    document.addEventListener('touchcancel', onEnd, { passive: false });

    // ─── Desktop mouse support (dynamic joystick via mouse drag) ───
    const MOUSE_ID = -1;
    const onMouseDown = (e) => {
      if (self.gameOver) return;
      if (isUITouch(e.clientX, e.clientY)) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && (el.tagName === 'BUTTON' || el.closest('#bottom-buttons') || el.closest('#dom-hud'))) return;
      if (activeTouchId !== null) return;
      activeTouchId = MOUSE_ID;
      showJoystick(e.clientX, e.clientY);
    };
    const onMouseMove = (e) => {
      if (activeTouchId !== MOUSE_ID) return;
      updateKnob(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      if (activeTouchId !== MOUSE_ID) return;
      activeTouchId = null;
      hideJoystick();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Cleanup on scene shutdown
    this.events.once('shutdown', () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      const baseEl = document.getElementById('vjoystick-base');
      if (baseEl) baseEl.remove();
    });
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
    // Button bounce animation
    document.querySelectorAll('#bottom-buttons button').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        btn.classList.remove('btn-bouncing');
        void btn.offsetWidth;
        btn.classList.add('btn-bouncing');
      });
    });
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
    d.hpFill.className = hpR > 0.6 ? 'bar-f hp-safe' : hpR > 0.3 ? 'bar-f hp-warn' : 'bar-f hp-danger';
    d.hpText.textContent = Math.ceil(Math.max(0,this.playerHP))+'/'+this.playerMaxHP;
    
    const tempR = Math.max(0, Math.min(1, this.temperature/this.maxTemp));
    d.tempFill.style.width = (tempR*100)+'%';
    d.tempFill.className = tempR > 0.4 ? 'bar-f' : tempR > 0.15 ? 'bar-f temp-warn' : 'bar-f temp-danger';
    const tempLabel = this.blizzardActive ? `${Math.ceil(this.temperature)}% ❄️위험!` : `${Math.ceil(this.temperature)}%`;
    d.tempText.textContent = tempLabel;
    
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
      d.xpFill.className = xpR > 0.8 ? 'xp-near-levelup' : '';
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
    const cards = this.upgradeManager.pickThreeCards(this.extraCardChoices || 0);
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

    // Dark overlay (다크네이비 반투명)
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(300);
    overlay.fillStyle(0x0A0E1A, 0).fillRect(0, 0, W, H);
    uiElements.push(overlay);
    this.tweens.add({ targets: { v: 0 }, v: 0.88, duration: 300,
      onUpdate: (_, t) => { overlay.clear(); overlay.fillStyle(0x0A0E1A, t.v); overlay.fillRect(0, 0, W, H); }
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

    // Card dimensions (supports variable card count)
    const numCards = cards.length || 3;
    const cardW = Math.min(160, (W - 60) / numCards);
    const cardH = Math.min(240, H * 0.55);
    const gap = Math.min(16, W * 0.02);
    const totalW = cardW * numCards + gap * (numCards - 1);
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

      // Grade-specific border color
      const gradeColorMap = { common: 0x9E9E9E, rare: 0x2196F3, epic: 0x9C27B0 };
      const gradeColor = gradeColorMap[upgrade.rarity] || 0x9E9E9E;
      const gradeGlowAlpha = upgrade.rarity === 'epic' ? 0.6 : upgrade.rarity === 'rare' ? 0.4 : 0.2;

      // Card front (hidden initially)
      const cardGfx = this.add.graphics().setScrollFactor(0).setDepth(304).setAlpha(0);
      // Outer glow (grade color)
      if (upgrade.rarity !== 'common') {
        cardGfx.lineStyle(4, gradeColor, gradeGlowAlpha);
        cardGfx.strokeRoundedRect(cx - cardW / 2 - 4, cy - cardH / 2 - 4, cardW + 8, cardH + 8, 16);
      }
      // Background (다크네이비)
      cardGfx.fillStyle(0x0D1B2A, 0.95);
      cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 14);
      // Grade color border
      cardGfx.lineStyle(3, gradeColor, 1);
      cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 14);
      // Top color band
      cardGfx.fillStyle(cat.bgColor, 0.3);
      cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, 50, { tl: 14, tr: 14, bl: 0, br: 0 });
      // Icon circle background (등급색 테두리)
      cardGfx.fillStyle(0x152238, 1);
      cardGfx.fillCircle(cx, cy - cardH / 2 + 30, 22);
      cardGfx.lineStyle(2, gradeColor, 0.8);
      cardGfx.strokeCircle(cx, cy - cardH / 2 + 30, 22);
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

      // Synergy hint
      const synergyHint = UPGRADE_SYNERGY[key] || '';
      let synergyText = null;
      if (synergyHint) {
        synergyText = this.add.text(cx, cy + cardH / 2 - 2, synergyHint, {
          fontSize: '9px', fontFamily: 'monospace', color: '#88CCAA',
          stroke: '#000', strokeThickness: 1
        }).setScrollFactor(0).setDepth(305).setOrigin(0.5).setAlpha(0);
        uiElements.push(synergyText);
      }

      const frontElements = [cardGfx, iconText, nameText, descText, rarityText, lvText, catText];
      if (synergyText) frontElements.push(synergyText);
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

      // Hover effect (살짝 위로 이동 + 밝아짐)
      zone.on('pointerover', () => {
        if (cardGfx.alpha > 0) {
          // Move card up slightly
          frontElements.forEach(el => { if (el.y !== undefined) el.y -= 5; });
          cardGfx.clear();
          if (upgrade.rarity !== 'common') {
            cardGfx.lineStyle(5, gradeColor, gradeGlowAlpha + 0.2);
            cardGfx.strokeRoundedRect(cx - cardW / 2 - 4, cy - cardH / 2 - 9, cardW + 8, cardH + 8, 16);
          }
          cardGfx.fillStyle(0x1B2838, 0.98);
          cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2 - 5, cardW, cardH, 14);
          cardGfx.lineStyle(4, gradeColor, 1);
          cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2 - 5, cardW, cardH, 14);
          cardGfx.fillStyle(cat.bgColor, 0.5);
          cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2 - 5, cardW, 50, { tl: 14, tr: 14, bl: 0, br: 0 });
          cardGfx.fillStyle(0x152238, 1); cardGfx.fillCircle(cx, cy - cardH / 2 + 25, 22);
          cardGfx.lineStyle(2, gradeColor, 1); cardGfx.strokeCircle(cx, cy - cardH / 2 + 25, 22);
        }
      });
      zone.on('pointerout', () => {
        if (cardGfx.alpha > 0) {
          // Move card back
          frontElements.forEach(el => { if (el.y !== undefined) el.y += 5; });
          cardGfx.clear();
          if (upgrade.rarity !== 'common') {
            cardGfx.lineStyle(4, gradeColor, gradeGlowAlpha);
            cardGfx.strokeRoundedRect(cx - cardW / 2 - 4, cy - cardH / 2 - 4, cardW + 8, cardH + 8, 16);
          }
          cardGfx.fillStyle(0x0D1B2A, 0.95);
          cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 14);
          cardGfx.lineStyle(3, gradeColor, 1);
          cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 14);
          cardGfx.fillStyle(cat.bgColor, 0.3);
          cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, 50, { tl: 14, tr: 14, bl: 0, br: 0 });
          cardGfx.fillStyle(0x152238, 1); cardGfx.fillCircle(cx, cy - cardH / 2 + 30, 22);
          cardGfx.lineStyle(2, gradeColor, 0.8); cardGfx.strokeCircle(cx, cy - cardH / 2 + 30, 22);
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
    if (min < 12) return 1;
    if (min < 25) return 2;
    if (min < 40) return 3;
    if (min < 55) return 4;
    return 5;
  }

  getWaveSize() {
    const min = this.gameElapsed / 60;
    if (min < 5) return 10;
    if (min < 12) return 20;
    if (min < 25) return 40;
    if (min < 40) return 60;
    if (min < 55) return 80;
    return 100;
  }

  getSpawnConfig() {
    const min = this.gameElapsed / 60;
    let weights, maxCount, spawnInterval;
    if (min < 5) {
      // 초반: 순한 동물 위주 + 늑대 소량
      weights = { rabbit: 5, deer: 3, penguin: 2, wolf: 1 }; maxCount = 14; spawnInterval = 9000;
    } else if (min < 10) {
      weights = { rabbit: 4, deer: 3, penguin: 2, wolf: 2, bear: 1 }; maxCount = 18; spawnInterval = 8000;
    } else if (min < 18) {
      weights = { rabbit: 3, deer: 2, penguin: 2, wolf: 3, bear: 2 }; maxCount = 24; spawnInterval = 7000;
    } else if (min < 28) {
      // 중반: 적대 동물 증가
      weights = { rabbit: 2, deer: 2, penguin: 1, wolf: 3, bear: 2 }; maxCount = 28; spawnInterval = 7000;
    } else if (min < 40) {
      weights = { rabbit: 1, deer: 1, wolf: 3, bear: 3, seal: 2 }; maxCount = 34; spawnInterval = 6000;
    } else if (min < 52) {
      // 후반: 강적 위주
      weights = { wolf: 3, bear: 4, seal: 3 }; maxCount = 40; spawnInterval = 5000;
    } else {
      // 최후반: 극한
      weights = { wolf: 2, bear: 5, seal: 4 }; maxCount = 48; spawnInterval = 4000;
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
    playBlizzardStart();
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

    this.showCenterAlert(`❄️ 한파 ${this.blizzardIndex}/${BLIZZARD_SCHEDULE.length} 시작!`, '#4488FF');
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
    const cam = this.cameras.main;
    const W = cam.width, H = cam.height;

    // ═══ 블리자드 화면 효과 (한파 강도 연동) ═══
    const coldLevel = this.blizzardActive ? this.blizzardIndex : 0;
    this.coldWaveOverlay.clear();
    if (coldLevel > 0) {
      // 블루 비네팅 (한파 3+)
      if (coldLevel >= 3) {
        const vigAlpha = coldLevel >= 5 ? 0.3 : 0.15;
        // Vignette: fill edges with blue gradient approximation
        this.coldWaveOverlay.fillStyle(0x1133AA, vigAlpha);
        this.coldWaveOverlay.fillRect(0, 0, W * 0.15, H); // left
        this.coldWaveOverlay.fillRect(W * 0.85, 0, W * 0.15, H); // right
        this.coldWaveOverlay.fillRect(0, 0, W, H * 0.12); // top
        this.coldWaveOverlay.fillRect(0, H * 0.88, W, H * 0.12); // bottom
      }
      // Overall blue overlay
      const pulse = (coldLevel >= 5 ? 0.2 : coldLevel >= 3 ? 0.12 : 0.06) + Math.sin(this.time.now / 500) * 0.03;
      this.coldWaveOverlay.fillStyle(0x2244CC, pulse);
      this.coldWaveOverlay.fillRect(0, 0, W, H);
      this.coldWaveOverlay.setAlpha(1);

      // 화면 흔들림 (한파 5+)
      if (coldLevel >= 5 && !this._blizzardShaking) {
        this._blizzardShaking = true;
        cam.shake(99999, 0.002); // continuous subtle shake
      }
    } else {
      this.coldWaveOverlay.setAlpha(0);
      if (this._blizzardShaking) {
        this._blizzardShaking = false;
        cam.shake(0); // stop shake
      }
    }

    // ═══ 눈 입자 시스템 (한파 강도 연동) ═══
    if (!this._snowParticles) this._snowParticles = [];
    const targetCount = coldLevel >= 5 ? 100 : coldLevel >= 3 ? 50 : coldLevel >= 1 ? 20 : 0;
    const snowAlpha = coldLevel >= 5 ? 0.3 : coldLevel >= 3 ? 0.2 : 0.1;
    // Spawn missing particles
    while (this._snowParticles.length < targetCount) {
      this._snowParticles.push({
        x: Math.random() * W, y: Math.random() * H,
        speed: 80 + Math.random() * 150,
        drift: -30 - Math.random() * 40, // diagonal
        size: 1 + Math.random() * 3
      });
    }
    // Remove excess
    while (this._snowParticles.length > targetCount) this._snowParticles.pop();
    // Update & draw
    if (this._snowParticles.length > 0) {
      this._snowParticles.forEach(p => {
        p.y += p.speed * dt;
        p.x += p.drift * dt;
        if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        this.coldWaveOverlay.fillStyle(0xFFFFFF, snowAlpha);
        this.coldWaveOverlay.fillCircle(p.x, p.y, p.size);
      });
    }
  }

  // ═══ 눈덩이/눈사태 시스템 ═══
  updateSnowballs(dt) {
    if (!this._snowballs) this._snowballs = [];
    if (!this._snowballTimer) this._snowballTimer = 0;
    this._snowballTimer += dt;

    const zone = this.getPlayerZone();
    const isActive = zone === 'danger' || zone === 'extreme';
    if (!isActive) return;

    // Spawn interval: 10~20s
    const spawnInterval = zone === 'extreme' ? 10 : 15 + Math.random() * 5;
    if (this._snowballTimer >= spawnInterval) {
      this._snowballTimer = 0;
      const count = zone === 'extreme' ? Phaser.Math.Between(5, 8) : Phaser.Math.Between(1, 3);
      const cam = this.cameras.main;
      for (let i = 0; i < count; i++) {
        const size = Phaser.Math.Between(20, 60);
        const sx = cam.scrollX + Phaser.Math.Between(0, cam.width);
        const sy = cam.scrollY - 40;
        const speed = Phaser.Math.Between(150, 250);
        const driftX = Phaser.Math.Between(-40, 40);
        const g = this.add.graphics().setDepth(45);
        const snowball = { x: sx, y: sy, size, speed, driftX, graphic: g, damage: Math.floor(15 + size * 0.25) };
        // Trail particles array
        snowball.trails = [];
        this._snowballs.push(snowball);
      }
      if (zone === 'extreme') {
        this.showCenterAlert('⛰️ 눈사태!', '#FFFFFF');
        this.cameras.main.shake(300, 0.01);
      }
    }

    // Update existing snowballs
    for (let i = this._snowballs.length - 1; i >= 0; i--) {
      const sb = this._snowballs[i];
      sb.y += sb.speed * dt;
      sb.x += sb.driftX * dt;
      // Draw
      sb.graphic.clear();
      sb.graphic.fillStyle(0xFFFFFF, 0.85);
      sb.graphic.fillCircle(sb.x, sb.y, sb.size / 2);
      sb.graphic.fillStyle(0xDDEEFF, 0.4);
      sb.graphic.fillCircle(sb.x - sb.size * 0.15, sb.y - sb.size * 0.15, sb.size * 0.2);

      // Player collision
      const dist = Phaser.Math.Distance.Between(sb.x, sb.y, this.player.x, this.player.y);
      if (dist < sb.size / 2 + 12) {
        this.playerHP -= sb.damage;
        playHurt();
        this.cameras.main.shake(150, 0.01);
        this.showFloatingText(this.player.x, this.player.y - 20, `-${sb.damage} ☃️`, '#AADDFF');
        // 0.5s slow
        const origSpeed = this.playerSpeed;
        this.playerSpeed *= 0.5;
        this.time.delayedCall(500, () => { this.playerSpeed = Math.max(this.playerSpeed, origSpeed); });
        sb.graphic.destroy();
        this._snowballs.splice(i, 1);
        if (this.playerHP <= 0) this.endGame();
        continue;
      }

      // Remove if off screen
      const cam = this.cameras.main;
      if (sb.y > cam.scrollY + cam.height + 100 || sb.x < cam.scrollX - 100 || sb.x > cam.scrollX + cam.width + 100) {
        sb.graphic.destroy();
        this._snowballs.splice(i, 1);
      }
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
  spawnActMiniboss(type) {
    const MINIBOSS_DEFS = {
      alpha_wolf: {
        hp: 150, speed: 130, damage: 12,
        drops: { meat: 5, leather: 3, gold: 20 },
        size: 26, behavior: 'chase', name: '🐺 알파 울프',
        aggroRange: 300, color: 0x4444AA, xpReward: 30,
        isMiniboss: true, sprite: 'wolf', scale: 1.8,
        escorts: { type: 'wolf', count: 4 },
        alertMsg: '⚠️ 알파 울프 출현!',
        killMsg: '🏆 알파 울프 처치! 다음 위협: 25분'
      },
      blizzard_bear: {
        hp: 400, speed: 60, damage: 20,
        drops: { meat: 10, leather: 6, gold: 40 },
        size: 36, behavior: 'chase', name: '🐻❄️ 블리자드 베어',
        aggroRange: 250, color: 0x88CCFF, xpReward: 80,
        isMiniboss: true, sprite: 'bear', scale: 2.2,
        escorts: { type: 'bear', count: 3 },
        alertMsg: '⚠️ 블리자드 베어 출현!',
        killMsg: '🏆 블리자드 베어 처치! 최종 전투까지 15분'
      }
    };
    const cfg = MINIBOSS_DEFS[type];
    if (!cfg) return;

    // 2-second warning then spawn
    this.cameras.main.flash(300, 200, 50, 50, true);
    this.showCenterAlert(cfg.alertMsg, '#FF4444');
    this.cameras.main.shake(400, 0.01);

    this.time.delayedCall(2000, () => {
      // Spawn miniboss
      const angle = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * 100;
      const bx = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 80, WORLD_W - 80);
      const by = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 80, WORLD_H - 80);

      const mb = this.physics.add.sprite(bx, by, cfg.sprite).setCollideWorldBounds(true).setDepth(5);
      mb.setScale(cfg.scale);
      mb.setTint(cfg.color);
      mb.animalType = cfg.sprite;
      mb.def = { hp: cfg.hp, speed: cfg.speed, damage: cfg.damage, drops: cfg.drops, size: cfg.size * cfg.scale, behavior: cfg.behavior, name: cfg.name, aggroRange: cfg.aggroRange, fleeRange: 0, fleeDistance: 0, color: cfg.color };
      mb.hp = cfg.hp;
      mb.maxHP = cfg.hp;
      mb.wanderTimer = 0;
      mb.wanderDir = { x: 0, y: 0 };
      mb.hitFlash = 0;
      mb.atkCD = 0;
      mb.fleeTimer = 0;
      mb.isBoss = true; // reuse boss HP bar rendering & death effects
      mb.isMiniboss = true;
      mb.minibossType = type;
      mb.hpBar = this.add.graphics().setDepth(6);
      mb.nameLabel = this.add.text(bx, by - cfg.size * cfg.scale - 10, cfg.name, {
        fontSize: '14px', fontFamily: 'monospace', color: '#FF6644', stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
      }).setDepth(6).setOrigin(0.5);
      this.animals.add(mb);

      // Override kill to show custom message + XP
      const scene = this;
      const origKill = this.killAnimal.bind(this);
      const minibossKillMsg = cfg.killMsg;
      const minibossXP = cfg.xpReward;
      mb._minibossKillMsg = minibossKillMsg;
      mb._minibossXP = minibossXP;

      // Spawn escort mobs
      for (let i = 0; i < cfg.escorts.count; i++) {
        const ea = Math.random() * Math.PI * 2;
        const ed = 40 + Math.random() * 60;
        const ex = Phaser.Math.Clamp(bx + Math.cos(ea) * ed, 80, WORLD_W - 80);
        const ey = Phaser.Math.Clamp(by + Math.sin(ea) * ed, 80, WORLD_H - 80);
        const esc = this.physics.add.sprite(ex, ey, cfg.escorts.type).setCollideWorldBounds(true).setDepth(4);
        const escDef = cfg.escorts.type === 'wolf'
          ? { hp: 25, speed: 120, damage: 6, drops: { meat: 1, leather: 1 }, size: 18, behavior: 'chase', name: '🐺 늑대', aggroRange: 250, fleeRange: 0, fleeDistance: 0, color: 0x666688 }
          : { hp: 60, speed: 50, damage: 12, drops: { meat: 3, leather: 2 }, size: 26, behavior: 'chase', name: '🐻 곰', aggroRange: 200, fleeRange: 0, fleeDistance: 0, color: 0x8B4513 };
        esc.animalType = cfg.escorts.type;
        esc.def = escDef;
        esc.hp = escDef.hp;
        esc.maxHP = escDef.hp;
        esc.wanderTimer = 0;
        esc.wanderDir = { x: 0, y: 0 };
        esc.hitFlash = 0;
        esc.atkCD = 0;
        esc.fleeTimer = 0;
        if (escDef.hp > 2) esc.hpBar = this.add.graphics().setDepth(6);
        esc.nameLabel = this.add.text(ex, ey - escDef.size - 10, escDef.name, {
          fontSize: '11px', fontFamily: 'monospace', color: '#FFFFFF', stroke: '#000', strokeThickness: 3
        }).setDepth(6).setOrigin(0.5);
        this.animals.add(esc);
      }

      playBossSpawn();
      this.cameras.main.shake(500, 0.015);
    });
  }

  spawnBoss(type) {
    const isFinal = type === 'final';
    const bossHP = isFinal ? 4000 : 1000;
    const bossScale = isFinal ? 2.8 : 2.0;
    const bossDmg = isFinal ? 35 : 18;
    const bossSpeed = isFinal ? 60 : 55;
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
    playBossSpawn();
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

  showVictory() {
    if (this.gameOver) return;
    this.gameOver = true;
    
    const totalKills = Object.values(this.stats.kills || {}).reduce((a,b)=>a+b, 0);
    const earned = MetaManager.recordRun(this.gameElapsed, totalKills, this.stats.maxCombo || 0);
    playWinSound();

    this._showEndScreen({
      isVictory: true,
      survivalTime: this.gameElapsed,
      totalKills,
      maxCombo: this.stats.maxCombo || 0,
      level: this.playerLevel,
      earned,
      equipBonuses: this._equipBonuses
    });
  }

  // ═══ HABBY-STYLE END SCREEN ═══
  _showEndScreen(opts) {
    const { isVictory, survivalTime, totalKills, maxCombo, level, earned, equipBonuses } = opts;
    const cam = this.cameras.main;
    const W = cam.width, H = cam.height;

    if (isVictory) {
      cam.flash(1000, 200, 255, 200);
      cam.shake(500, 0.01);
    } else {
      cam.flash(400, 255, 0, 0);
      cam.shake(500, 0.02);
    }

    // Dark overlay
    const ov = this.add.graphics().setScrollFactor(0).setDepth(300);
    ov.fillStyle(0x0A0E1A, 0).fillRect(0, 0, W, H);
    this.tweens.add({ targets: ov, alpha: 0.85, duration: 600 });

    // Panel background
    const panelW = Math.min(340, W - 40), panelH = 360;
    const px = W/2, py = H/2;
    const panel = this.add.graphics().setScrollFactor(0).setDepth(301);
    panel.fillStyle(0x1A1E2E, 0.95);
    panel.fillRoundedRect(px - panelW/2, py - panelH/2, panelW, panelH, 16);
    panel.lineStyle(2, isVictory ? 0xFFD700 : 0xFF4444, 0.6);
    panel.strokeRoundedRect(px - panelW/2, py - panelH/2, panelW, panelH, 16);
    panel.setAlpha(0);

    // Icon
    const icon = this.add.text(px, py - panelH/2 + 50, isVictory ? '🏆' : '💀', {
      fontSize: '48px'
    }).setScrollFactor(0).setDepth(302).setOrigin(0.5).setAlpha(0);

    // Title
    const titleColor = isVictory ? '#FFD700' : '#FF4444';
    const titleText = isVictory ? '60분 생존 성공!' : '생존 실패';
    const title = this.add.text(px, py - panelH/2 + 100, titleText, {
      fontSize: '28px', fontFamily: 'monospace', color: titleColor,
      stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(302).setOrigin(0.5).setAlpha(0);

    // Stats
    const survMin = Math.floor(survivalTime / 60);
    const survSec = Math.floor(survivalTime % 60);
    const statsLines = [
      `⏱️ 생존 시간: ${survMin}분 ${survSec}초`,
      `⚔️ 처치한 적: ${totalKills}`,
      `🔥 최대 콤보: ${maxCombo}킬`,
      `⭐ 달성 레벨: Lv.${level}`,
      `💎 획득 포인트: +${earned}`
    ];
    // Equipment bonus line
    if (equipBonuses) {
      const bonusStrs = [];
      if (equipBonuses.atkMul > 0) bonusStrs.push(`공격력+${Math.round(equipBonuses.atkMul*100)}%`);
      if (equipBonuses.defMul > 0) bonusStrs.push(`방어+${Math.round(equipBonuses.defMul*100)}%`);
      if (equipBonuses.spdMul > 0) bonusStrs.push(`이속+${Math.round(equipBonuses.spdMul*100)}%`);
      if (equipBonuses.hpFlat > 0) bonusStrs.push(`HP+${Math.round(equipBonuses.hpFlat)}`);
      if (bonusStrs.length > 0) statsLines.push(`🛡️ 장비 보너스: ${bonusStrs.join(', ')}`);
    }
    const stats = this.add.text(px, py - 20, statsLines.join('\n'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#CCDDEE',
      stroke: '#000', strokeThickness: 2, align: 'center', lineSpacing: 6
    }).setScrollFactor(0).setDepth(302).setOrigin(0.5).setAlpha(0);

    // Buttons
    const btnW = 130, btnH = 36, btnGap = 16;
    const btnY = py + panelH/2 - 55;

    // Retry button (orange CTA)
    const retryBg = this.add.graphics().setScrollFactor(0).setDepth(302);
    retryBg.fillStyle(0xFF6B35, 1);
    retryBg.fillRoundedRect(px - btnW - btnGap/2, btnY, btnW, btnH, 8);
    retryBg.setAlpha(0);
    const retryText = this.add.text(px - btnW/2 - btnGap/2, btnY + btnH/2, '🔄 다시 도전', {
      fontSize: '14px', fontFamily: 'monospace', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 2, fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(303).setOrigin(0.5).setAlpha(0);
    const retryHit = this.add.rectangle(px - btnW/2 - btnGap/2, btnY + btnH/2, btnW, btnH)
      .setScrollFactor(0).setDepth(304).setOrigin(0.5).setInteractive().setAlpha(0.001);

    // Title button (dark)
    const titleBg = this.add.graphics().setScrollFactor(0).setDepth(302);
    titleBg.fillStyle(0x2A2E3E, 1);
    titleBg.fillRoundedRect(px + btnGap/2, btnY, btnW, btnH, 8);
    titleBg.lineStyle(1, 0x555577, 0.6);
    titleBg.strokeRoundedRect(px + btnGap/2, btnY, btnW, btnH, 8);
    titleBg.setAlpha(0);
    const titleBtnText = this.add.text(px + btnW/2 + btnGap/2, btnY + btnH/2, '🏠 타이틀로', {
      fontSize: '14px', fontFamily: 'monospace', color: '#AABBCC',
      stroke: '#000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(303).setOrigin(0.5).setAlpha(0);
    const titleHit = this.add.rectangle(px + btnW/2 + btnGap/2, btnY + btnH/2, btnW, btnH)
      .setScrollFactor(0).setDepth(304).setOrigin(0.5).setInteractive().setAlpha(0.001);

    // Button handlers
    retryHit.on('pointerdown', () => { this.scene.start('Boot', { loadSave: false }); });
    titleHit.on('pointerdown', () => { this.scene.start('Title'); });

    // Slide-in + fade animation
    const allElements = [panel, icon, title, stats, retryBg, retryText, titleBg, titleBtnText];
    allElements.forEach((el, i) => {
      if (el.y !== undefined) el.y -= 40;
      this.tweens.add({
        targets: el, alpha: 1, y: (el.y !== undefined ? el.y + 40 : undefined),
        duration: 500, ease: 'Back.Out', delay: 200 + i * 80
      });
    });
  }

  endGame() {
    // GDD: HP 0 → 마을로 리스폰 3초 (통계 표시)
    if (this.gameOver || this.isRespawning) return;
    this.isRespawning = true;
    playGameOverSound();

    const totalKills = Object.values(this.stats.kills || {}).reduce((a,b)=>a+b, 0);
    const earned = MetaManager.recordRun(this.gameElapsed, totalKills, this.stats.maxCombo || 0);

    this._showEndScreen({
      isVictory: false,
      survivalTime: this.gameElapsed,
      totalKills,
      maxCombo: this.stats.maxCombo || 0,
      level: this.playerLevel,
      earned,
      equipBonuses: this._equipBonuses
    });

    // Auto-cleanup after choosing or timeout (respawn fallback)
    this._endScreenCleanup = this.time.delayedCall(30000, () => {
      this.scene.start('Title');
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
        this.streakBuff = { dmgMul: 1, spdMul: 1, timer: 0, tier: 0 }; // reset buff on combo break
        this._updateComboDisplay();
      }
    }
    
    // ═══ Streak Buff Timer ═══
    this._updateStreakBuff(dt);

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
        this.damageAnimal(nearest, Math.round(this.playerDamage * (this.streakBuff?.dmgMul || 1))); playSlash();
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
    // ═══ WASD + Arrow Key merge ═══
    const wasd = this.wasd;
    const kx = (wasd.D.isDown||wasd.RIGHT.isDown ? 1 : 0) - (wasd.A.isDown||wasd.LEFT.isDown ? 1 : 0);
    const ky = (wasd.S.isDown||wasd.DOWN.isDown ? 1 : 0) - (wasd.W.isDown||wasd.UP.isDown ? 1 : 0);
    let finalMX = this.moveDir.x, finalMY = this.moveDir.y;
    if (kx !== 0 || ky !== 0) {
      finalMX = kx; finalMY = ky;
      // If joystick also active, sum them
      if (this.moveDir.x !== 0 || this.moveDir.y !== 0) {
        finalMX = this.moveDir.x + kx;
        finalMY = this.moveDir.y + ky;
      }
      // Normalize
      const mag = Math.sqrt(finalMX*finalMX + finalMY*finalMY);
      if (mag > 1) { finalMX /= mag; finalMY /= mag; }
    }
    const eqSpdMul = 1 + (this._equipBonuses ? this._equipBonuses.spdMul : 0);
    const effectiveSpeed = this.playerSpeed * (this.streakBuff?.spdMul || 1) * eqSpdMul;
    this.player.body.setVelocity(finalMX*effectiveSpeed, finalMY*effectiveSpeed);
    // 4방향 스프라이트 전환 (상하좌우) + 뒷모습
    const absX = Math.abs(finalMX);
    const absY = Math.abs(finalMY);
    if (absX > absY) {
      // 좌우 이동 → 앞모습
      if (finalMX > 0.1) { 
        this.player.setFlipX(false); 
        this.facingRight = true; 
        this.playerFacing = 'right';
        if (this.attackCooldown <= 0) this.player.setTexture('player');
      } else if (finalMX < -0.1) { 
        this.player.setFlipX(true); 
        this.facingRight = false; 
        this.playerFacing = 'left';
        if (this.attackCooldown <= 0) this.player.setTexture('player');
      }
    } else if (absY > 0.1) {
      // 상하 이동
      if (finalMY < -0.1) {
        this.playerFacing = 'up';
        this.player.setFlipX(false);
        if (this.attackCooldown <= 0) this.player.setTexture('player_back');
      } else if (finalMY > 0.1) {
        this.playerFacing = 'down';
        if (this.attackCooldown <= 0) this.player.setTexture('player');
      }
    }

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

    this._updateBuffs(dt);
    this._updateEquipmentDrops(dt);
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

    // ═══ Snowball/Avalanche ═══
    this.updateSnowballs(dt);

    // ═══ Act Miniboss Spawns ═══
    if (!this.act2MinibossSpawned && this.gameElapsed >= 12 * 60) {
      this.act2MinibossSpawned = true;
      this.spawnActMiniboss('alpha_wolf');
    }
    if (!this.act4MinibossSpawned && this.gameElapsed >= 40 * 60) {
      this.act4MinibossSpawned = true;
      this.spawnActMiniboss('blizzard_bear');
    }

    // ═══ Phase 2: Boss Spawns ═══
    if (!this.boss1Spawned && this.gameElapsed >= 25 * 60) { // 25분
      this.boss1Spawned = true;
      this.spawnBoss('first');
    }
    if (!this.boss2Spawned && this.gameElapsed >= 55 * 60) { // 55분
      this.boss2Spawned = true;
      this.spawnBoss('final');
    }

    // ═══ Victory Condition: 60분 생존 ═══
    if (!this.gameWon && this.gameElapsed >= 60 * 60) {
      this.gameWon = true;
      this.showVictory();
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

    // ═══ Zone Alert System ═══
    const newZone = this.getPlayerZone();
    if (newZone !== this.currentZone) {
      const oldZone = this.currentZone;
      this.currentZone = newZone;
      const zoneAlerts = {
        normal: '주의 구역 진입',
        danger: '⚠️ 위험 구역 진입',
        extreme: '☠️ 극위험 구역 — 즉시 대피 권고',
      };
      if (zoneAlerts[newZone]) {
        this.showZoneAlert(zoneAlerts[newZone]);
      }
    }

    // ═══ Quest-based Wolf/Bear Spawn Guarantee ═══
    this.questSpawnTimer += dt;
    if (this.questIndex < QUESTS.length) {
      const q = QUESTS[this.questIndex];
      const needsWolf = q.id === 'q5';
      const needsBear = q.id === 'q7';
      if (needsWolf || needsBear) {
        const targetType = needsWolf ? 'wolf' : 'bear';
        const nearbyCount = this.animals.getChildren().filter(a =>
          a.active && a.animalType === targetType &&
          Phaser.Math.Distance.Between(a.x, a.y, this.player.x, this.player.y) < 500
        ).length;
        // Every 15s, ensure at least 2 nearby
        if (this.questSpawnTimer >= 15 && nearbyCount < 2) {
          this.questSpawnTimer = 0;
          const toSpawn = 2 - nearbyCount;
          for (let i = 0; i < toSpawn; i++) {
            this.spawnAnimalNearPlayer(targetType, 300, 500);
          }
        }
      }
    }

    this.checkQuests();
    this.updateUI();
  }

  showZoneAlert(text) {
    const cam = this.cameras.main;
    const alert = this.add.text(cam.width / 2, cam.height / 2 - 50, text, {
      fontSize: '28px', fontFamily: 'monospace', color: '#FF3333',
      stroke: '#000000', strokeThickness: 4, align: 'center',
    }).setScrollFactor(0).setDepth(200).setOrigin(0.5).setAlpha(1);
    this.tweens.add({
      targets: alert, alpha: 0, duration: 2000, delay: 500,
      onComplete: () => alert.destroy(),
    });
  }

  spawnAnimalNearPlayer(type, minDist, maxDist) {
    const def = ANIMALS[type];
    if (!def || !this.player) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = Phaser.Math.Between(minDist, maxDist);
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 60, WORLD_W - 60);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 60, WORLD_H - 60);
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
