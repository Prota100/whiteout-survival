// Sound Engine (WebAudio + Procedural BGM/Ambience)
// Whiteout Survival v1.0 Final - ULTIMATE with Sound FX
// All feedback applied: mobile, balance, visuals, campfire, buildings, SOUND

// ═══ 🔊 SOUND ENGINE (ElevenLabs + Web Audio + Procedural BGM/Ambience) ═══
let audioCtx=null,soundEnabled=true,fireAmbSrc=null;
const _sfxCache={};const _sfxPool={};
let _bgm=null,_bgmStarted=false;
let _proBGM=null; // procedural BGM state
let _windAmb=null; // wind ambience state
let _bgmMode='normal'; // 'normal','blizzard','boss','gameover'

function initAudio(){
  try{audioCtx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){soundEnabled=false}
  const sounds=['bgm','slash','hit','kill','coin','chop','build','craft','hire','hurt','eat','quest','death','upgrade_select','box_appear','epic_card'];
  sounds.forEach(name=>{
    fetch('sounds/'+name+'.mp3').then(r=>r.arrayBuffer()).then(buf=>{
      if(audioCtx)audioCtx.decodeAudioData(buf,decoded=>{_sfxCache[name]=decoded;},()=>{});
    }).catch(()=>{});
  });
}

function resumeAudio(){
  if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();
  if(!_bgmStarted&&soundEnabled){_bgmStarted=true;startBGM();startWindAmbience();}
}

// ═══ Procedural BGM System ═══
function startBGM(){
  if(!audioCtx||!soundEnabled||_proBGM)return;
  // Try file-based BGM first, fallback to procedural
  if(_sfxCache.bgm){
    const src=audioCtx.createBufferSource();
    const gain=audioCtx.createGain();
    src.buffer=_sfxCache.bgm;src.loop=true;gain.gain.value=0.15;
    src.connect(gain).connect(audioCtx.destination);src.start(0);
    _bgm={src,gain};
  }
  // Always start procedural BGM layer
  _startProceduralBGM();
}

function _startProceduralBGM(){
  if(!audioCtx||!soundEnabled||_proBGM)return;
  const t=audioCtx.currentTime;
  // Master gain for procedural BGM
  const master=audioCtx.createGain();
  master.gain.value=0.12;
  // Lowpass filter (tighten during blizzard)
  const lp=audioCtx.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=2000;lp.Q.value=0.7;
  lp.connect(master).connect(audioCtx.destination);
  // Drone: low C2 sine
  const drone=audioCtx.createOscillator();
  const droneG=audioCtx.createGain();
  drone.type='sine';drone.frequency.value=65.41;droneG.gain.value=0.3;
  drone.connect(droneG).connect(lp);drone.start(t);
  // Drone2: C3 triangle (subtle)
  const drone2=audioCtx.createOscillator();
  const drone2G=audioCtx.createGain();
  drone2.type='triangle';drone2.frequency.value=130.81;drone2G.gain.value=0.08;
  drone2.connect(drone2G).connect(lp);drone2.start(t);
  // Pad: Eb3 (minor third) soft pad
  const pad=audioCtx.createOscillator();
  const padG=audioCtx.createGain();
  pad.type='sine';pad.frequency.value=155.56;padG.gain.value=0.06;
  pad.connect(padG).connect(lp);pad.start(t);
  // Melody sequencer (interval-based, C minor scale notes)
  const melodyNotes=[261.63,293.66,311.13,349.23,392,415.30,466.16,523.25]; // C4 Cm scale
  let melodyOsc=null,melodyGain=null;
  const melodyInterval=setInterval(()=>{
    if(!audioCtx||!soundEnabled||!_proBGM)return;
    if(Math.random()>0.4)return; // 40% chance each beat
    const ct=audioCtx.currentTime;
    const freq=melodyNotes[Math.floor(Math.random()*melodyNotes.length)];
    const o=audioCtx.createOscillator();const g=audioCtx.createGain();
    o.type='triangle';o.frequency.value=freq;
    g.gain.setValueAtTime(0.08,ct);
    g.gain.exponentialRampToValueAtTime(0.001,ct+1.5);
    o.connect(g).connect(lp);o.start(ct);o.stop(ct+1.5);
  },2000);
  // Boss rhythm sequencer
  let bossInterval=null;
  _proBGM={master,lp,drone,droneG,drone2,drone2G,pad,padG,melodyInterval,bossInterval,
    setBossMode:function(){
      if(bossInterval)return;
      _bgmMode='boss';
      lp.frequency.setValueAtTime(3000,audioCtx.currentTime);
      droneG.gain.setValueAtTime(0.4,audioCtx.currentTime);
      drone.frequency.setValueAtTime(55,audioCtx.currentTime);
      // Fast rhythmic pulse
      bossInterval=setInterval(()=>{
        if(!audioCtx||!soundEnabled||!_proBGM)return;
        const ct=audioCtx.currentTime;
        const o=audioCtx.createOscillator();const g=audioCtx.createGain();
        o.type='square';o.frequency.value=110;
        g.gain.setValueAtTime(0.15,ct);g.gain.exponentialRampToValueAtTime(0.001,ct+0.1);
        o.connect(g).connect(lp);o.start(ct);o.stop(ct+0.12);
      },300);
    },
    clearBossMode:function(){
      if(bossInterval){clearInterval(bossInterval);bossInterval=null;}
      _bgmMode='normal';
      lp.frequency.setValueAtTime(2000,audioCtx.currentTime);
      droneG.gain.setValueAtTime(0.3,audioCtx.currentTime);
      drone.frequency.setValueAtTime(65.41,audioCtx.currentTime);
    },
    setBlizzardMode:function(){
      _bgmMode='blizzard';
      const ct=audioCtx.currentTime;
      lp.frequency.linearRampToValueAtTime(600,ct+1);
      padG.gain.linearRampToValueAtTime(0.15,ct+1);
      pad.frequency.linearRampToValueAtTime(138.59,ct+1); // Eb lowered
      master.gain.linearRampToValueAtTime(0.08,ct+1);
    },
    clearBlizzardMode:function(){
      if(_bgmMode!=='blizzard')return;
      _bgmMode='normal';
      const ct=audioCtx.currentTime;
      lp.frequency.linearRampToValueAtTime(2000,ct+2);
      padG.gain.linearRampToValueAtTime(0.06,ct+2);
      pad.frequency.linearRampToValueAtTime(155.56,ct+2);
      master.gain.linearRampToValueAtTime(0.12,ct+2);
    },
    fadeOut:function(){
      const ct=audioCtx.currentTime;
      master.gain.linearRampToValueAtTime(0,ct+3);
      setTimeout(()=>{stopBGM();},3500);
    }
  };
}

function stopBGM(){
  if(_bgm){try{_bgm.src.stop();}catch(e){}_bgm=null;}
  if(_proBGM){
    try{
      clearInterval(_proBGM.melodyInterval);
      if(_proBGM.bossInterval)clearInterval(_proBGM.bossInterval);
      _proBGM.drone.stop();_proBGM.drone2.stop();_proBGM.pad.stop();
      _proBGM.master.disconnect();
    }catch(e){}
    _proBGM=null;
  }
  _bgmMode='normal';
  _bgmStarted=false;
}

// ═══ Wind Ambience System ═══
function startWindAmbience(){
  if(!audioCtx||!soundEnabled||_windAmb)return;
  const bs=Math.floor(audioCtx.sampleRate*4);
  const buf=audioCtx.createBuffer(1,bs,audioCtx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<bs;i++)d[i]=(Math.random()*2-1);
  const src=audioCtx.createBufferSource();src.buffer=buf;src.loop=true;
  const bp=audioCtx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=350;bp.Q.value=1.5;
  const gain=audioCtx.createGain();gain.gain.value=0.04; // very subtle
  src.connect(bp).connect(gain).connect(audioCtx.destination);
  src.start();
  _windAmb={src,bp,gain,baseVol:0.04};
}
function stopWindAmbience(){
  if(_windAmb){try{_windAmb.src.stop();}catch(e){}_windAmb=null;}
}
function setWindIntensity(level){ // 0=calm, 1=normal, 2=extreme zone, 3=blizzard
  if(!_windAmb||!audioCtx)return;
  const ct=audioCtx.currentTime;
  const vols=[0.02,0.04,0.1,0.2];
  const freqs=[300,350,500,700];
  const qs=[1,1.5,2,3];
  _windAmb.gain.gain.linearRampToValueAtTime(vols[level]||0.04,ct+0.5);
  _windAmb.bp.frequency.linearRampToValueAtTime(freqs[level]||350,ct+0.5);
  _windAmb.bp.Q.linearRampToValueAtTime(qs[level]||1.5,ct+0.5);
}

function _playSFX(name,vol=0.5,distance=0,maxDistance=0){
  if(!audioCtx||!soundEnabled||!_sfxCache[name])return;
  const src=audioCtx.createBufferSource();
  const gain=audioCtx.createGain();
  src.buffer=_sfxCache[name];
  let finalVol = vol;
  if(maxDistance > 0 && distance > 0) {
    const attenuation = Math.max(0.1, 1 - (distance / maxDistance));
    finalVol = vol * attenuation;
  }
  finalVol = Math.min(0.5, Math.max(0.3, finalVol));
  gain.gain.value=finalVol;
  src.connect(gain).connect(audioCtx.destination);
  src.start(0);
  return src;
}

// ═══ Legacy-compatible sound functions ═══
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

// ═══ Enhanced SFX (Procedural) ═══
function playLevelUp(){
  if(!audioCtx||!soundEnabled)return;
  // Triumphant 3-note fanfare (C-E-G ascending)
  const notes=[523.25,659.25,783.99];
  notes.forEach((freq,i)=>{
    const osc=audioCtx.createOscillator();const g=audioCtx.createGain();
    osc.type='triangle';osc.frequency.value=freq;
    g.gain.setValueAtTime(0.3,audioCtx.currentTime+i*0.12);
    g.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+i*0.12+0.5);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(audioCtx.currentTime+i*0.12);osc.stop(audioCtx.currentTime+i*0.12+0.5);
  });
  // Shimmer on top
  const sh=audioCtx.createOscillator();const sg=audioCtx.createGain();
  sh.type='sine';sh.frequency.value=1046.5;
  sg.gain.setValueAtTime(0.15,audioCtx.currentTime+0.36);
  sg.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+1.2);
  sh.connect(sg).connect(audioCtx.destination);
  sh.start(audioCtx.currentTime+0.36);sh.stop(audioCtx.currentTime+1.2);
}
function playUpgradeSelect(){
  // Chime/sparkle effect
  if(!audioCtx||!soundEnabled)return;
  const ct=audioCtx.currentTime;
  [1318.5,1760,2093].forEach((f,i)=>{
    const o=audioCtx.createOscillator();const g=audioCtx.createGain();
    o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0.12,ct+i*0.05);
    g.gain.exponentialRampToValueAtTime(0.001,ct+i*0.05+0.3);
    o.connect(g).connect(audioCtx.destination);
    o.start(ct+i*0.05);o.stop(ct+i*0.05+0.35);
  });
  _playSFX('upgrade_select',0.4);
}
function playBoxAppear(){_playSFX('box_appear',0.5)}
function playEpicCard(){_playSFX('epic_card',0.7)}

// ═══ Enemy-type hit sounds ═══
function playHitEnemy(enemyType){
  if(!audioCtx||!soundEnabled)return;
  const ct=audioCtx.currentTime;
  if(enemyType==='boss'){
    // Deep, long rumble hit
    const o=audioCtx.createOscillator();const g=audioCtx.createGain();
    o.type='sawtooth';o.frequency.value=60;
    o.frequency.exponentialRampToValueAtTime(30,ct+0.6);
    g.gain.setValueAtTime(0.3,ct);g.gain.exponentialRampToValueAtTime(0.01,ct+0.6);
    o.connect(g).connect(audioCtx.destination);o.start(ct);o.stop(ct+0.65);
  } else if(enemyType==='elite'){
    // Heavy thud
    const o=audioCtx.createOscillator();const g=audioCtx.createGain();
    o.type='square';o.frequency.value=100;
    o.frequency.exponentialRampToValueAtTime(50,ct+0.2);
    g.gain.setValueAtTime(0.25,ct);g.gain.exponentialRampToValueAtTime(0.01,ct+0.25);
    o.connect(g).connect(audioCtx.destination);o.start(ct);o.stop(ct+0.3);
  } else {
    // Normal: short beep (existing hit + synth layer)
    _playSFX('hit',0.3);
  }
}

// ═══ Critical hit: metallic clang ═══
function playCriticalHit(){
  if(!audioCtx||!soundEnabled)return;
  const ct=audioCtx.currentTime;
  // Metallic ring (high freq + fast decay)
  [2400,3200,4000].forEach((f,i)=>{
    const o=audioCtx.createOscillator();const g=audioCtx.createGain();
    o.type='square';o.frequency.value=f;
    g.gain.setValueAtTime(0.12,ct);g.gain.exponentialRampToValueAtTime(0.001,ct+0.15);
    o.connect(g).connect(audioCtx.destination);o.start(ct);o.stop(ct+0.2);
  });
  // Impact thump
  const sub=audioCtx.createOscillator();const sg=audioCtx.createGain();
  sub.type='sine';sub.frequency.value=80;
  sg.gain.setValueAtTime(0.2,ct);sg.gain.exponentialRampToValueAtTime(0.001,ct+0.1);
  sub.connect(sg).connect(audioCtx.destination);sub.start(ct);sub.stop(ct+0.12);
}

// ═══ Item pickup: bright jingle ═══
function playItemPickup(){
  if(!audioCtx||!soundEnabled)return;
  const ct=audioCtx.currentTime;
  [880,1108.7,1318.5].forEach((f,i)=>{
    const o=audioCtx.createOscillator();const g=audioCtx.createGain();
    o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0.15,ct+i*0.06);
    g.gain.exponentialRampToValueAtTime(0.001,ct+i*0.06+0.25);
    o.connect(g).connect(audioCtx.destination);
    o.start(ct+i*0.06);o.stop(ct+i*0.06+0.3);
  });
}

// ═══ Revival scroll: mystical shimmer ═══
function playRevival(){
  if(!audioCtx||!soundEnabled)return;
  const ct=audioCtx.currentTime;
  // Ascending ethereal tones
  [330,440,554.37,659.25,880].forEach((f,i)=>{
    const o=audioCtx.createOscillator();const g=audioCtx.createGain();
    o.type='sine';o.frequency.value=f;
    o.frequency.linearRampToValueAtTime(f*1.02,ct+i*0.15+0.8); // slight vibrato
    g.gain.setValueAtTime(0,ct+i*0.15);
    g.gain.linearRampToValueAtTime(0.12,ct+i*0.15+0.1);
    g.gain.exponentialRampToValueAtTime(0.001,ct+i*0.15+0.8);
    o.connect(g).connect(audioCtx.destination);
    o.start(ct+i*0.15);o.stop(ct+i*0.15+0.85);
  });
  // Shimmer noise
  const bs=Math.floor(audioCtx.sampleRate*1.5);
  const buf=audioCtx.createBuffer(1,bs,audioCtx.sampleRate);
  const d=buf.getChannelData(0);for(let i=0;i<bs;i++)d[i]=(Math.random()*2-1);
  const src=audioCtx.createBufferSource();src.buffer=buf;
  const hp=audioCtx.createBiquadFilter();hp.type='highpass';hp.frequency.value=4000;
  const ng=audioCtx.createGain();ng.gain.setValueAtTime(0,ct);
  ng.gain.linearRampToValueAtTime(0.06,ct+0.3);
  ng.gain.exponentialRampToValueAtTime(0.001,ct+1.5);
  src.connect(hp).connect(ng).connect(audioCtx.destination);
  src.start(ct);src.stop(ct+1.5);
}

// ═══ UI Sounds ═══
function playUITick(){
  if(!audioCtx||!soundEnabled)return;
  const o=audioCtx.createOscillator();const g=audioCtx.createGain();
  o.type='sine';o.frequency.value=1800;
  g.gain.setValueAtTime(0.06,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.04);
  o.connect(g).connect(audioCtx.destination);
  o.start();o.stop(audioCtx.currentTime+0.05);
}
function playUISwing(){
  if(!audioCtx||!soundEnabled)return;
  const ct=audioCtx.currentTime;
  const o=audioCtx.createOscillator();const g=audioCtx.createGain();
  o.type='sine';o.frequency.setValueAtTime(600,ct);
  o.frequency.exponentialRampToValueAtTime(300,ct+0.15);
  g.gain.setValueAtTime(0.08,ct);g.gain.exponentialRampToValueAtTime(0.001,ct+0.15);
  o.connect(g).connect(audioCtx.destination);o.start(ct);o.stop(ct+0.18);
}
function playAchievement(){
  if(!audioCtx||!soundEnabled)return;
  const ct=audioCtx.currentTime;
  // Victory fanfare: C-E-G-C (octave)
  [523.25,659.25,783.99,1046.5].forEach((f,i)=>{
    const o=audioCtx.createOscillator();const g=audioCtx.createGain();
    o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(0.2,ct+i*0.15);
    g.gain.exponentialRampToValueAtTime(0.01,ct+i*0.15+0.6);
    o.connect(g).connect(audioCtx.destination);
    o.start(ct+i*0.15);o.stop(ct+i*0.15+0.65);
  });
}

// ═══ Existing procedural SFX (enhanced) ═══
function playBossSpawn(){
  if(!audioCtx||!soundEnabled)return;
  // Activate boss BGM mode
  if(_proBGM)_proBGM.setBossMode();
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
  // Fade out BGM
  if(_proBGM)_proBGM.fadeOut();
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
  // Activate blizzard BGM mode
  if(_proBGM)_proBGM.setBlizzardMode();
  setWindIntensity(3);
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

function playBlizzardEnd(){
  if(_proBGM)_proBGM.clearBlizzardMode();
  setWindIntensity(1);
}

function playBossDefeated(){
  if(_proBGM)_proBGM.clearBossMode();
}

// Fire ambient
function startFire(){if(!audioCtx||!soundEnabled||fireAmbSrc)return;const bs=Math.floor(audioCtx.sampleRate*2),b=audioCtx.createBuffer(1,bs,audioCtx.sampleRate),d=b.getChannelData(0);for(let i=0;i<bs;i++){d[i]=(Math.random()*2-1)*0.03;if(Math.random()<0.002)d[i]*=8}const s=audioCtx.createBufferSource(),g=audioCtx.createGain();s.buffer=b;s.loop=true;g.gain.value=0.12;s.connect(g).connect(audioCtx.destination);s.start();fireAmbSrc={s,g}}
function stopFire(){if(fireAmbSrc){try{fireAmbSrc.s.stop()}catch(e){}fireAmbSrc=null}}
// ═══ Pitched SFX helper ═══
function _playSFXPitched(name, vol, pitchRate) {
  if (!audioCtx || !soundEnabled || !_sfxCache[name]) return;
  const src = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  src.buffer = _sfxCache[name];
  src.playbackRate.value = pitchRate || 1;
  gain.gain.value = Math.min(0.5, Math.max(0.05, vol));
  src.connect(gain).connect(audioCtx.destination);
  src.start(0);
  return src;
}
function playColdWarning() { _playSFXPitched('hurt', 0.3, 0.6); }
function playClassSkill() { _playSFXPitched('slash', 0.35, 1.3); }
function playHellSelect() { _playSFXPitched('death', 0.35, 0.5); }
