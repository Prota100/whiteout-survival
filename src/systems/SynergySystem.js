// Synergy Manager
class SynergyManager {
  constructor() {
    this.activeSynergies = new Set();
    this.coldImmunityTimer = 0;
  }

  checkSynergies(upgradeManager, scene) {
    SKILL_SYNERGIES.forEach(syn => {
      if (this.activeSynergies.has(syn.id)) return;
      const allMet = syn.requires.every(id => upgradeManager.getLevel(id) >= 1);
      if (allMet) {
        this.activeSynergies.add(syn.id);
        this.applySynergy(syn, scene);
        if (scene._questProgress) scene._questProgress.synergy_activated++;
        this.showSynergyPopup(syn, scene);
      }
    });
  }

  applySynergy(syn, scene) {
    switch (syn.id) {
      case 'berserker':
        scene.playerDamage = Math.round(scene.playerDamage * (1 + syn.bonus.damageMultiplier) * 100) / 100;
        break;
      case 'ironwall':
        scene._synergyBlockChance = syn.bonus.blockChance;
        break;
      case 'swift_hunter':
        scene.playerBaseSpeed *= (1 + syn.bonus.speedMultiplier);
        scene.playerSpeed = scene.playerBaseSpeed;
        scene.playerBaseSpeed = Math.min(350, scene.playerBaseSpeed);
        scene.playerSpeed = Math.min(350, scene.playerSpeed);
        break;
      case 'lucky_finder':
        scene._synergyExtraDropRate = syn.bonus.extraDropRate;
        break;
      case 'cold_master':
        scene._synergyColdImmunity = true;
        this.coldImmunityTimer = 0;
        break;
    }
  }

  updateColdImmunity(dt, scene) {
    if (!scene._synergyColdImmunity) return;
    this.coldImmunityTimer += dt;
    if (this.coldImmunityTimer >= 5) {
      this.coldImmunityTimer -= 5;
      scene._coldImmunePulse = true;
      if (scene.player && scene.player.active) scene.showFloatingText(scene.player.x, scene.player.y - 40, '❄️ 한파 무효!', '#88DDFF');
    }
  }

  showSynergyPopup(syn, scene) {
    const cam = scene.cameras.main;
    const t = scene.add.text(cam.width / 2, cam.height * 0.4,
      '✨ ' + syn.name + ' 시너지 발동!', { // track synergy for quest
      fontSize: '28px', fontFamily: 'monospace', color: '#FFD700',
      stroke: '#000', strokeThickness: 5, fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 0, color: '#FF8C00', blur: 15, fill: true }
    }).setScrollFactor(0).setDepth(250).setOrigin(0.5).setAlpha(0);

    const desc = scene.add.text(cam.width / 2, cam.height * 0.4 + 35,
      syn.desc, {
      fontSize: '16px', fontFamily: 'monospace', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 3
    }).setScrollFactor(0).setDepth(250).setOrigin(0.5).setAlpha(0);

    scene.tweens.add({
      targets: [t, desc], alpha: 1, scale: { from: 0.5, to: 1.1 }, duration: 400, ease: 'Back.Out',
      onComplete: () => {
        scene.tweens.add({ targets: [t, desc], alpha: 0, y: '-=30', duration: 1000, delay: 1500,
          onComplete: () => { t.destroy(); desc.destroy(); }
        });
      }
    });

    scene.cameras.main.flash(300, 255, 200, 0, true);
  }

  renderHUD(scene) {
    // Clear old HUD
    if (this._hudElements) this._hudElements.forEach(e => { try { e.destroy(); } catch(ex) {} });
    this._hudElements = [];
    if (this.activeSynergies.size === 0) return;

    const cam = scene.cameras.main;
    let idx = 0;
    SKILL_SYNERGIES.forEach(syn => {
      if (!this.activeSynergies.has(syn.id)) return;
      const x = 20 + idx * 28;
      const y = cam.height - 30;
      const bg = scene.add.circle(x, y, 12, 0x333333, 0.7).setScrollFactor(0).setDepth(150);
      const icon = scene.add.text(x, y, syn.emoji, {
        fontSize: '14px'
      }).setScrollFactor(0).setDepth(151).setOrigin(0.5);
      this._hudElements.push(bg, icon);
      idx++;
    });
  }

  toJSON() { return { active: [...this.activeSynergies], coldTimer: this.coldImmunityTimer }; }
  fromJSON(data, scene) {
    if (!data) return;
    this.activeSynergies = new Set(data.active || []);
    this.coldImmunityTimer = data.coldTimer || 0;
    // Re-apply effects
    SKILL_SYNERGIES.forEach(syn => {
      if (this.activeSynergies.has(syn.id)) this.applySynergy(syn, scene);
    });
  }
}
// ═══ END SKILL SYNERGY ═══

