// Save Manager
// ═══ 💾 SAVE MANAGER ═══
class SaveManager {
  static SAVE_KEY = 'whiteout_save';
  
  static save(scene) {
    try {
      const saveData = {
        version: '2.1',
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
        synergies: scene.synergyManager.toJSON(),
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
