// Equipment Manager
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
    try { localStorage.setItem(EquipmentManager.STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
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
    EquipmentManager.recordDiscovered(slot, itemId);
    return true;
  }

  getItemDef(slot) {
    const eq = this.slots[slot];
    if (!eq) return null;
    const list = EQUIPMENT_TABLE[slot];
    return list ? list.find(i => i.id === eq.itemId) : null;
  }

  // Aggregate all equipment bonuses (30% nerfed for balance)
  getTotalBonuses() {
    const b = { atkMul:0, aspdMul:0, hpFlat:0, defMul:0, spdMul:0, dodgeMul:0, coldRes:0, regenPS:0, xpMul:0, luckFlat:0 };
    const EQUIP_NERF = 0.7; // 장비 효과 30% 하향
    for (const slot of Object.keys(this.slots)) {
      const def = this.getItemDef(slot);
      if (!def) continue;
      const gradeIdx = EQUIP_GRADES.indexOf(this.slots[slot].grade);
      const gradeMul = 1 + gradeIdx * 0.25; // common=1x, rare=1.25x, epic=1.5x, legendary=1.75x, unique=2x
      for (const [k, v] of Object.entries(def.effects)) {
        if (k === 'hpFlat' || k === 'luckFlat') b[k] += v * gradeMul * EQUIP_NERF;
        else b[k] += v * gradeMul * EQUIP_NERF;
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
    EquipmentManager.recordDiscovered(slot, itemId);
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
    try { localStorage.removeItem(EquipmentManager.STORAGE_KEY); } catch(e) {}
  }

  // ═══ 📦 장비 도감 (발견 기록) ═══
  static DISCOVERED_KEY = 'whiteout_discovered';

  static loadDiscovered() {
    try {
      return JSON.parse(localStorage.getItem(EquipmentManager.DISCOVERED_KEY) || '{}');
    } catch(e) { return {}; }
  }

  static saveDiscovered(data) {
    try { localStorage.setItem(EquipmentManager.DISCOVERED_KEY, JSON.stringify(data)); } catch(e) {}
  }

  static recordDiscovered(slot, itemId) {
    const disc = EquipmentManager.loadDiscovered();
    if (!disc[slot]) disc[slot] = [];
    if (!disc[slot].includes(itemId)) {
      disc[slot].push(itemId);
      EquipmentManager.saveDiscovered(disc);
    }
  }
}

// ═══ 📜 런 히스토리 매니저 ═══
