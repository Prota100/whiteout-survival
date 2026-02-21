// Upgrade Manager (뱀서 스타일 카드 시스템)
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
    this.swiftStrikeApplied = false;
    this.attackCounter = 0;
    // Phase 2
    this.chainLightningLevel = 0; this.iceAuraLevel = 0; this.lifeStealPct = 0;
    this.shieldBashActive = false; this.shieldBashCD = 0; this.shieldBashReady = false;
    this.doubleShotChance = 0; this.thornsDamage = 0;
    this.timeWarpLevel = 0; this.timeWarpCD = 0;
    this.xpScavengerBonus = 0; this.adrenalineLevel = 0; this.blizzardCloakActive = false;
  }

  getLevel(key) { return this.levels[key] || 0; }
  isMaxed(key) { return this.getLevel(key) >= UPGRADES[key].maxLevel; }

  getAvailableUpgrades(playerClass, endgameMode = false) {
    return Object.keys(UPGRADES).filter(k => {
      if (this.isMaxed(k)) return false;
      const u = UPGRADES[k];
      // Endgame-only cards: only in endless mode after 60min
      if (u.endgameOnly && !endgameMode) return false;
      // Class-only cards: only show for matching class
      if (u.classOnly) return u.classOnly === playerClass;
      return true;
    });
  }

  pickThreeCards(extra = 0, playerClass = null, endgameMode = false) {
    // In endgame mode, only offer endgame cards if any are available
    if (endgameMode) {
      const endgameAvailable = this.getAvailableUpgrades(playerClass, true).filter(k => UPGRADES[k].endgameOnly);
      if (endgameAvailable.length > 0) {
        const picked = [];
        const used = new Set();
        const count = Math.min(3 + extra, endgameAvailable.length);
        const shuffled = [...endgameAvailable].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) { picked.push(shuffled[i]); }
        return picked;
      }
    }
    const available = this.getAvailableUpgrades(playerClass, endgameMode);
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
      // === Phase 2 신규 10종 ===
      case 'CHAIN_LIGHTNING': this.chainLightningLevel = lv; break;
      case 'ICE_AURA': this.iceAuraLevel = lv; break;
      case 'LIFE_STEAL_PCT': this.lifeStealPct = lv * 0.10; break;
      case 'SHIELD_BASH': this.shieldBashActive = true; this.shieldBashCD = 0; break;
      case 'DOUBLE_SHOT': this.doubleShotChance = Math.min(0.6, lv * 0.30); break;
      case 'THORNS': this.thornsDamage = lv * 5; break;
      case 'TIME_WARP': this.timeWarpLevel = lv; this.timeWarpCD = 0; break;
      case 'XP_SCAVENGER': this.xpScavengerBonus = lv * 0.50; this.magnetRange = Math.round((70 + this.getLevel('MAGNET') * 50) * (1 + this.xpScavengerBonus)); break;
      case 'ADRENALINE': this.adrenalineLevel = lv; break;
      case 'BLIZZARD_CLOAK': this.blizzardCloakActive = true; break;
      // ═══ Class Upgrades ═══
      case 'CLASS_WARRIOR_ROAR': this._classWarriorRoar = true; break;
      case 'CLASS_MAGE_BLIZZARD': this._classMageBlizzard = true; break;
      case 'CLASS_SURVIVOR_SPRINT': this._classSurvivorSprint = true; break;
      case 'CLASS_SHAMAN_SPIRIT': this._classShamanSpirit = true; break;
      case 'CLASS_SHAMAN_STORM': this._classShamanStorm = true; break;
      case 'CLASS_HUNTER_VOLLEY': this._classHunterVolley = true; break;
      case 'CLASS_HUNTER_POISON': this._classHunterPoison = true; break;
      // ═══ Endgame Upgrades ═══
      case 'GODLIKE_POWER':
        scene.playerDamage = Math.round(scene.playerDamage * 1.5);
        scene.playerMaxHP = Math.round(scene.playerMaxHP * 1.5);
        scene.playerHP = Math.min(scene.playerHP + scene.playerMaxHP * 0.5, scene.playerMaxHP);
        scene.playerSpeed *= 1.5;
        scene.baseAttackSpeed *= 0.67; // 50% faster
        break;
      case 'IMMORTAL_WILL':
        scene.playerMaxHP += 200;
        scene.playerHP = Math.min(scene.playerHP + 200, scene.playerMaxHP);
        this.regenPerSec += 5;
        break;
      case 'TIME_WARP_ULTRA':
        scene.baseAttackSpeed *= 0.5; // 100% faster
        this.cooldownReduction *= 0.5;
        break;
      case 'FROZEN_WORLD':
        this._frozenWorldActive = true;
        break;
      case 'SPIRIT_BOMB':
        this._spiritBombActive = true;
        this._spiritBombTimer = 0;
        break;
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
      this.swiftStrikeApplied = false; this.attackCounter = 0;
      // Phase 2 resets
      this.chainLightningLevel = 0; this.iceAuraLevel = 0; this.lifeStealPct = 0;
      this.shieldBashActive = false; this.shieldBashCD = 0; this.shieldBashReady = false;
      this.doubleShotChance = 0; this.thornsDamage = 0;
      this.timeWarpLevel = 0; this.timeWarpCD = 0;
      this.xpScavengerBonus = 0; this.adrenalineLevel = 0; this.blizzardCloakActive = false;
      Object.entries(savedLevels).forEach(([key, lv]) => {
        for (let i = 0; i < lv; i++) this.applyUpgrade(key, scene);
      });
    }
  }
}
// ═══ END UPGRADE SYSTEM ═══

