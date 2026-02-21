// Meta Progression Manager
class MetaManager {
  static META_KEY = 'whiteout_meta';
  
  static getDefault() {
    return {
      version: '2.1',
      totalPoints: 0,
      spentPoints: 0,
      bestTime: 0,
      totalRuns: 0,
      upgrades: {
        startHP: 0,
        startTempResist: 0,
        startWood: 0,
        extraCard: 0,
        revival_scroll: 0
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
    try { localStorage.setItem(MetaManager.META_KEY, JSON.stringify(meta)); } catch(e) { console.error('Meta save failed:', e); }
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
      extraCard: [500, 1000, 2000],
      revival_scroll: [20]
    };
    return costs[type]?.[level] || 9999;
  }
  
  static getMaxLevel(type) {
    return type === 'extraCard' ? 3 : type === 'revival_scroll' ? 1 : 5;
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
    try { localStorage.removeItem(MetaManager.META_KEY); } catch(e) {}
  }
}
// ═══ END META PROGRESSION ═══

// ═══ 🎴 UPGRADE SYSTEM (뱀서 스타일) ═══
