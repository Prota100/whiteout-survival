// Equipment constants & tables
// [밸런스 패스3] legendary 추가 (클래스 업그레이드가 common 빈도로 나오던 버그 수정)
const RARITY_WEIGHTS = { common: 70, rare: 25, epic: 5, legendary: 2, unique: 3 };
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

// ═══ 🏆 ACHIEVEMENT SYSTEM ═══
