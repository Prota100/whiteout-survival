// Whiteout Survival - Hyper Casual Web Game
// Built with Phaser 3

const GAME_DURATION = Infinity; // 무제한 플레이
const WORLD_W = 1600;
const WORLD_H = 1600;

// Timeline: when animals spawn
const TIMELINE = [
  { time: 0, type: 'rabbit', count: 5 },
  { time: 5, type: 'rabbit', count: 3 },
  { time: 10, type: 'wolf', count: 2 },
  { time: 15, type: 'rabbit', count: 4 },
  { time: 20, type: 'wolf', count: 3 },
  { time: 25, type: 'bear', count: 1 },
  { time: 30, type: 'rabbit', count: 3 },
  { time: 30, type: 'wolf', count: 2 },
  { time: 35, type: 'bear', count: 2 },
  { time: 40, type: 'wolf', count: 3 },
  { time: 45, type: 'bear', count: 2 },
  { time: 50, type: 'bear', count: 3 },
  { time: 55, type: 'wolf', count: 4 },
];

// NPC costs and order
const NPC_DEFS = [
  { type: 'hunter', name: '사냥꾼', cost: 5, color: 0x4CAF50, desc: '자동 사냥' },
  { type: 'merchant', name: '상인', cost: 15, color: 0xFFEB3B, desc: '고기→금화' },
  { type: 'warrior', name: '전사', cost: 30, color: 0xF44336, desc: '강력 전투' },
];

const ANIMAL_STATS = {
  rabbit: { hp: 1, speed: 30, damage: 0, meat: 1, color: 0xCCCCCC, size: 8, behavior: 'flee', name: '토끼' },
  wolf: { hp: 3, speed: 90, damage: 1, meat: 3, color: 0x666666, size: 12, behavior: 'chase', name: '늑대' },
  bear: { hp: 8, speed: 60, damage: 3, meat: 8, color: 0x8B4513, size: 18, behavior: 'chase', name: '곰' },
};

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    // Generate textures programmatically
    this.createCircleTexture('player', 14, 0x42A5F5);
    this.createCircleTexture('player_attack', 16, 0x64B5F6);
    this.createCircleTexture('rabbit', 8, 0xCCCCCC);
    this.createCircleTexture('wolf', 12, 0x666666);
    this.createCircleTexture('bear', 18, 0x8B4513);
    this.createCircleTexture('meat', 6, 0xFF5722);
    this.createCircleTexture('npc_hunter', 12, 0x4CAF50);
    this.createCircleTexture('npc_merchant', 12, 0xFFEB3B);
    this.createCircleTexture('npc_warrior', 14, 0xF44336);
    this.createCircleTexture('snowflake', 2, 0xFFFFFF);
    this.createCircleTexture('hit_particle', 3, 0xFF0000);
    this.createCircleTexture('gold_particle', 3, 0xFFD700);
    this.createCircleTexture('joystick_base', 50, 0x333333, 0.3);
    this.createCircleTexture('joystick_thumb', 25, 0x666666, 0.5);
    this.createCircleTexture('attack_range', 40, 0xFF0000, 0.1);

    this.scene.start('Game');
  }

  createCircleTexture(key, radius, color, alpha = 1) {
    const g = this.add.graphics();
    g.fillStyle(color, alpha);
    g.fillCircle(radius, radius, radius);
    g.generateTexture(key, radius * 2, radius * 2);
    g.destroy();
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.gameTime = 0;
    this.gameOver = false;
    this.meat = 0;
    this.gold = 0;
    this.playerHP = 10;
    this.playerMaxHP = 10;
    this.playerDamage = 1;
    this.playerSpeed = 150;
    this.attackCooldown = 0;
    this.timelineIndex = 0;
    this.npcsOwned = [];
    this.nextNPCIndex = 0;
    this.moveDir = { x: 0, y: 0 };
    this.isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || 
                    ('ontouchstart' in window);

    // World bounds
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    // Background - snow ground
    const bg = this.add.graphics();
    bg.fillStyle(0xE8E8F0, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);
    // Add some subtle terrain variation
    for (let i = 0; i < 60; i++) {
      bg.fillStyle(0xD0D0E0, 0.3);
      const rx = Phaser.Math.Between(0, WORLD_W);
      const ry = Phaser.Math.Between(0, WORLD_H);
      bg.fillCircle(rx, ry, Phaser.Math.Between(20, 80));
    }
    // Trees
    for (let i = 0; i < 30; i++) {
      const tx = Phaser.Math.Between(50, WORLD_W - 50);
      const ty = Phaser.Math.Between(50, WORLD_H - 50);
      bg.fillStyle(0x2E7D32, 0.6);
      bg.fillTriangle(tx, ty - 30, tx - 15, ty + 10, tx + 15, ty + 10);
      bg.fillStyle(0x4E342E, 0.8);
      bg.fillRect(tx - 3, ty + 10, 6, 10);
    }

    // Player
    this.player = this.physics.add.sprite(WORLD_W / 2, WORLD_H / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setDamping(true);
    this.player.setDrag(0.9);

    // Player direction indicator
    this.playerDir = this.add.graphics();
    this.playerDir.setDepth(11);

    // Groups
    this.animals = this.physics.add.group();
    this.meats = this.physics.add.group();
    this.npcSprites = this.physics.add.group();

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setZoom(1);

    // Snow particles
    this.snowEmitter = this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: WORLD_W },
      y: -10,
      lifespan: 6000,
      speedY: { min: 20, max: 60 },
      speedX: { min: -20, max: 20 },
      scale: { min: 0.5, max: 1.5 },
      alpha: { start: 0.8, end: 0 },
      frequency: 50,
      quantity: 1,
    });
    this.snowEmitter.setDepth(20);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    // Attack on click/tap
    this.input.on('pointerdown', (pointer) => {
      if (this.gameOver) return;
      // Don't attack if clicking on joystick area (mobile)
      if (this.isMobile && pointer.y > this.cameras.main.height - 180 && pointer.x < 200) return;
      // Don't attack if clicking UI buttons
      if (this.isUIClick(pointer)) return;
      this.performAttack(pointer);
    });

    // Mobile joystick
    if (this.isMobile) {
      this.createJoystick();
    }

    // UI (fixed to camera)
    this.createUI();

    // Meat pickup overlap
    this.physics.add.overlap(this.player, this.meats, (player, meat) => {
      this.collectMeat(meat);
    });

    // Initial spawns
    this.spawnTimeline();
  }

  createJoystick() {
    const cam = this.cameras.main;
    this.joystickBase = this.add.image(0, 0, 'joystick_base').setScrollFactor(0).setDepth(100).setAlpha(0);
    this.joystickThumb = this.add.image(0, 0, 'joystick_thumb').setScrollFactor(0).setDepth(101).setAlpha(0);
    this.joystickActive = false;
    this.joystickPointerId = null;

    this.input.on('pointerdown', (pointer) => {
      if (this.gameOver) return;
      if (pointer.x < cam.width * 0.5 && pointer.y > cam.height * 0.4) {
        this.joystickActive = true;
        this.joystickPointerId = pointer.id;
        this.joystickBase.setPosition(pointer.x, pointer.y).setAlpha(0.4);
        this.joystickThumb.setPosition(pointer.x, pointer.y).setAlpha(0.6);
        this.joystickOrigin = { x: pointer.x, y: pointer.y };
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (!this.joystickActive || pointer.id !== this.joystickPointerId) return;
      const dx = pointer.x - this.joystickOrigin.x;
      const dy = pointer.y - this.joystickOrigin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 50;
      const clampDist = Math.min(dist, maxDist);
      const angle = Math.atan2(dy, dx);
      this.joystickThumb.setPosition(
        this.joystickOrigin.x + Math.cos(angle) * clampDist,
        this.joystickOrigin.y + Math.sin(angle) * clampDist
      );
      if (dist > 10) {
        this.moveDir.x = Math.cos(angle);
        this.moveDir.y = Math.sin(angle);
      } else {
        this.moveDir.x = 0;
        this.moveDir.y = 0;
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (pointer.id === this.joystickPointerId) {
        this.joystickActive = false;
        this.joystickPointerId = null;
        this.joystickBase.setAlpha(0);
        this.joystickThumb.setAlpha(0);
        this.moveDir.x = 0;
        this.moveDir.y = 0;
      }
    });
  }

  createUI() {
    const pad = 10;
    const style = { fontSize: '16px', fontFamily: 'monospace', color: '#ffffff', stroke: '#000000', strokeThickness: 3 };
    const bigStyle = { ...style, fontSize: '20px' };

    // Top-left: HP bar
    this.hpBarBg = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.hpBarFill = this.add.graphics().setScrollFactor(0).setDepth(101);
    this.hpText = this.add.text(pad + 75, pad + 2, '', style).setScrollFactor(0).setDepth(102).setOrigin(0.5, 0);

    // Top-center: Timer
    this.timerText = this.add.text(0, pad, '60', { ...bigStyle, fontSize: '28px' }).setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);

    // Top-right: Resources
    this.meatText = this.add.text(0, pad, '🥩 0', bigStyle).setScrollFactor(0).setDepth(100).setOrigin(1, 0);
    this.goldText = this.add.text(0, pad + 26, '💰 0', bigStyle).setScrollFactor(0).setDepth(100).setOrigin(1, 0);

    // NPC hire button (bottom-right)
    this.hireBtn = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.hireBtnText = this.add.text(0, 0, '', { ...style, fontSize: '14px', align: 'center' })
      .setScrollFactor(0).setDepth(101).setOrigin(0.5, 0.5);
    this.hireBtnZone = this.add.zone(0, 0, 140, 50).setScrollFactor(0).setDepth(102).setOrigin(0.5, 0.5).setInteractive();
    this.hireBtnZone.on('pointerdown', () => this.hireNPC());

    // Attack button (mobile, bottom-right)
    if (this.isMobile) {
      this.atkBtn = this.add.graphics().setScrollFactor(0).setDepth(100);
      this.atkBtnText = this.add.text(0, 0, '⚔️', { fontSize: '32px' })
        .setScrollFactor(0).setDepth(101).setOrigin(0.5, 0.5);
      this.atkBtnZone = this.add.zone(0, 0, 70, 70).setScrollFactor(0).setDepth(102).setOrigin(0.5, 0.5).setInteractive();
      this.atkBtnZone.on('pointerdown', () => {
        // Attack nearest animal
        this.performAttackNearest();
      });
    }

    // NPC status display
    this.npcStatusTexts = [];

    this.updateUIPositions();
    this.scale.on('resize', () => this.updateUIPositions());
  }

  updateUIPositions() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const pad = 10;

    this.timerText.setPosition(w / 2, pad);
    this.meatText.setPosition(w - pad, pad);
    this.goldText.setPosition(w - pad, pad + 26);

    // Hire button
    const hbx = w - 80;
    const hby = h - 40;
    this.hireBtnZone.setPosition(hbx, hby);

    // Attack button (mobile)
    if (this.isMobile && this.atkBtnZone) {
      const abx = w - 70;
      const aby = h - 110;
      this.atkBtnZone.setPosition(abx, aby);
    }
  }

  isUIClick(pointer) {
    if (!this.hireBtnZone) return false;
    const hb = this.hireBtnZone;
    const dx = Math.abs(pointer.x - hb.x);
    const dy = Math.abs(pointer.y - hb.y);
    if (dx < 70 && dy < 25) return true;

    if (this.isMobile && this.atkBtnZone) {
      const ab = this.atkBtnZone;
      const adx = Math.abs(pointer.x - ab.x);
      const ady = Math.abs(pointer.y - ab.y);
      if (adx < 35 && ady < 35) return true;
    }
    return false;
  }

  spawnTimeline() {
    // Check which timeline entries should fire (loops every 60s)
    const cycleTime = this.gameTime % 60;
    const cycle = Math.floor(this.gameTime / 60);
    const expectedIndex = cycle * TIMELINE.length;
    
    // Reset index for new cycle
    if (this.timelineIndex < expectedIndex) {
      this.timelineIndex = expectedIndex;
    }
    
    const localIndex = this.timelineIndex - expectedIndex;
    if (localIndex < TIMELINE.length && TIMELINE[localIndex].time <= cycleTime) {
      const entry = TIMELINE[localIndex];
      for (let i = 0; i < entry.count; i++) {
        this.spawnAnimal(entry.type);
      }
      this.timelineIndex++;
    }
  }

  spawnAnimal(type) {
    const stats = ANIMAL_STATS[type];
    // Spawn at random edge or random position away from player
    let x, y;
    const side = Phaser.Math.Between(0, 3);
    const margin = 100;
    switch (side) {
      case 0: x = Phaser.Math.Between(margin, WORLD_W - margin); y = margin; break;
      case 1: x = Phaser.Math.Between(margin, WORLD_W - margin); y = WORLD_H - margin; break;
      case 2: x = margin; y = Phaser.Math.Between(margin, WORLD_H - margin); break;
      case 3: x = WORLD_W - margin; y = Phaser.Math.Between(margin, WORLD_H - margin); break;
    }

    const animal = this.physics.add.sprite(x, y, type);
    animal.setCollideWorldBounds(true);
    animal.setDepth(5);
    animal.animalType = type;
    animal.animalHP = stats.hp;
    animal.animalMaxHP = stats.hp;
    animal.animalSpeed = stats.speed;
    animal.animalDamage = stats.damage;
    animal.animalMeat = stats.meat;
    animal.animalBehavior = stats.behavior;
    animal.wanderTimer = 0;
    animal.wanderDir = { x: 0, y: 0 };
    animal.hitFlash = 0;
    animal.attackCooldown = 0;
    this.animals.add(animal);

    // HP bar for non-rabbit
    if (type !== 'rabbit') {
      animal.hpBar = this.add.graphics().setDepth(6);
    }
  }

  performAttack(pointer) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 0.4;

    // World position of click
    const wx = pointer.worldX;
    const wy = pointer.worldY;
    const attackRange = 60;

    // Flash player
    this.player.setTexture('player_attack');
    this.time.delayedCall(100, () => {
      if (this.player.active) this.player.setTexture('player');
    });

    // Find animals in range of click
    let hit = false;
    this.animals.getChildren().forEach(animal => {
      if (!animal.active) return;
      const dist = Phaser.Math.Distance.Between(wx, wy, animal.x, animal.y);
      if (dist < attackRange) {
        this.damageAnimal(animal, this.playerDamage);
        hit = true;
      }
    });

    // Attack effect
    this.showAttackEffect(wx, wy, hit);
  }

  performAttackNearest() {
    if (this.attackCooldown > 0) return;
    const range = 80;
    let nearest = null;
    let nearestDist = Infinity;

    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
      if (d < range && d < nearestDist) {
        nearest = a;
        nearestDist = d;
      }
    });

    if (nearest) {
      this.attackCooldown = 0.4;
      this.player.setTexture('player_attack');
      this.time.delayedCall(100, () => {
        if (this.player.active) this.player.setTexture('player');
      });
      this.damageAnimal(nearest, this.playerDamage);
      this.showAttackEffect(nearest.x, nearest.y, true);
    } else {
      // Attack in front
      this.attackCooldown = 0.4;
      this.player.setTexture('player_attack');
      this.time.delayedCall(100, () => {
        if (this.player.active) this.player.setTexture('player');
      });
      this.showAttackEffect(
        this.player.x + (this.moveDir.x || 0) * 40,
        this.player.y + (this.moveDir.y || 0) * 40,
        false
      );
    }
  }

  showAttackEffect(x, y, hit) {
    const color = hit ? 0xFF4444 : 0xFFFFFF;
    const g = this.add.graphics().setDepth(15);
    g.lineStyle(2, color, 0.8);
    g.strokeCircle(x, y, 5);
    this.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 200,
      onUpdate: () => {
        g.clear();
        g.lineStyle(2, color, g.alpha);
        g.strokeCircle(x, y, 5 + (1 - g.alpha) * 30);
      },
      onComplete: () => g.destroy()
    });

    if (hit) {
      // Hit particles
      for (let i = 0; i < 5; i++) {
        const p = this.add.image(x, y, 'hit_particle').setDepth(15);
        this.tweens.add({
          targets: p,
          x: x + Phaser.Math.Between(-30, 30),
          y: y + Phaser.Math.Between(-30, 30),
          alpha: 0,
          duration: 300,
          onComplete: () => p.destroy()
        });
      }
    }
  }

  damageAnimal(animal, damage) {
    animal.animalHP -= damage;
    animal.hitFlash = 0.15;
    animal.setTint(0xFF0000);

    // Damage number
    const dmgText = this.add.text(animal.x, animal.y - 20, `-${damage}`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#FF4444', stroke: '#000', strokeThickness: 2
    }).setDepth(15).setOrigin(0.5);
    this.tweens.add({
      targets: dmgText,
      y: dmgText.y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => dmgText.destroy()
    });

    if (animal.animalHP <= 0) {
      this.killAnimal(animal);
    }
  }

  killAnimal(animal) {
    // Drop meat with bounce
    const meatCount = animal.animalMeat;
    for (let i = 0; i < meatCount; i++) {
      const angle = (Math.PI * 2 * i) / meatCount + Phaser.Math.FloatBetween(-0.3, 0.3);
      const dist = Phaser.Math.Between(20, 50);
      const targetX = animal.x + Math.cos(angle) * dist;
      const targetY = animal.y + Math.sin(angle) * dist;

      const m = this.physics.add.sprite(animal.x, animal.y, 'meat');
      m.setDepth(4);
      m.meatValue = 1;
      m.body.setAllowGravity(false);
      this.meats.add(m);

      // Bounce animation
      this.tweens.add({
        targets: m,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Bounce.Out',
      });

      // Pulsing glow
      this.tweens.add({
        targets: m,
        scale: { from: 0.5, to: 1.2 },
        yoyo: true,
        repeat: 2,
        duration: 200,
      });

      // Auto-collect overlap with player
      this.physics.add.overlap(this.player, m, (p, meat) => {
        this.collectMeat(meat);
      });
    }

    // Death effect
    const deathG = this.add.graphics().setDepth(15);
    deathG.fillStyle(0xFFFFFF, 0.8);
    deathG.fillCircle(animal.x, animal.y, 5);
    this.tweens.add({
      targets: deathG,
      alpha: 0,
      duration: 300,
      onUpdate: () => {
        deathG.clear();
        deathG.fillStyle(0xFFFFFF, deathG.alpha);
        deathG.fillCircle(animal.x, animal.y, 5 + (1 - deathG.alpha) * 20);
      },
      onComplete: () => deathG.destroy()
    });

    if (animal.hpBar) animal.hpBar.destroy();
    animal.destroy();
  }

  collectMeat(meat) {
    if (!meat.active) return;
    this.meat++;

    // Collect effect
    const txt = this.add.text(meat.x, meat.y, '+1 🥩', {
      fontSize: '14px', fontFamily: 'monospace', color: '#FF5722', stroke: '#000', strokeThickness: 2
    }).setDepth(15).setOrigin(0.5);
    this.tweens.add({
      targets: txt,
      y: txt.y - 25,
      alpha: 0,
      duration: 500,
      onComplete: () => txt.destroy()
    });

    meat.destroy();
  }

  hireNPC() {
    if (this.gameOver) return;
    if (this.nextNPCIndex >= NPC_DEFS.length) return;
    const def = NPC_DEFS[this.nextNPCIndex];
    if (this.meat < def.cost) return;

    this.meat -= def.cost;
    this.nextNPCIndex++;

    // Create NPC sprite
    const npc = this.physics.add.sprite(
      this.player.x + Phaser.Math.Between(-40, 40),
      this.player.y + Phaser.Math.Between(-40, 40),
      `npc_${def.type}`
    );
    npc.setCollideWorldBounds(true);
    npc.setDepth(9);
    npc.npcType = def.type;
    npc.npcDef = def;
    npc.actionTimer = 0;
    npc.target = null;
    this.npcSprites.add(npc);
    this.npcsOwned.push(npc);

    // Hire effect
    const hireText = this.add.text(npc.x, npc.y - 20, `${def.name} 고용!`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 3
    }).setDepth(20).setOrigin(0.5);
    this.tweens.add({
      targets: hireText,
      y: hireText.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => hireText.destroy()
    });

    // Gold particles
    for (let i = 0; i < 8; i++) {
      const p = this.add.image(npc.x, npc.y, 'gold_particle').setDepth(15);
      this.tweens.add({
        targets: p,
        x: npc.x + Phaser.Math.Between(-40, 40),
        y: npc.y + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: 500,
        onComplete: () => p.destroy()
      });
    }
  }

  updateNPCs(delta) {
    this.npcsOwned.forEach(npc => {
      if (!npc.active) return;
      npc.actionTimer -= delta;

      switch (npc.npcType) {
        case 'hunter':
          this.updateHunterAI(npc, delta);
          break;
        case 'merchant':
          this.updateMerchantAI(npc, delta);
          break;
        case 'warrior':
          this.updateWarriorAI(npc, delta);
          break;
      }
    });
  }

  updateHunterAI(npc, delta) {
    // Find nearest animal and hunt it
    let nearest = null;
    let nearestDist = Infinity;
    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      const d = Phaser.Math.Distance.Between(npc.x, npc.y, a.x, a.y);
      if (d < nearestDist) { nearest = a; nearestDist = d; }
    });

    if (nearest) {
      // Move towards
      const angle = Phaser.Math.Angle.Between(npc.x, npc.y, nearest.x, nearest.y);
      npc.body.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100);

      // Attack if close
      if (nearestDist < 40 && npc.actionTimer <= 0) {
        this.damageAnimal(nearest, 1);
        npc.actionTimer = 0.8;
      }
    } else {
      // Follow player
      const dp = Phaser.Math.Distance.Between(npc.x, npc.y, this.player.x, this.player.y);
      if (dp > 80) {
        const a = Phaser.Math.Angle.Between(npc.x, npc.y, this.player.x, this.player.y);
        npc.body.setVelocity(Math.cos(a) * 100, Math.sin(a) * 100);
      } else {
        npc.body.setVelocity(0, 0);
      }
    }
  }

  updateMerchantAI(npc, delta) {
    // Follow player, periodically convert meat to gold
    const dp = Phaser.Math.Distance.Between(npc.x, npc.y, this.player.x, this.player.y);
    if (dp > 60) {
      const a = Phaser.Math.Angle.Between(npc.x, npc.y, this.player.x, this.player.y);
      npc.body.setVelocity(Math.cos(a) * 90, Math.sin(a) * 90);
    } else {
      npc.body.setVelocity(0, 0);
    }

    if (npc.actionTimer <= 0 && this.meat >= 3) {
      this.meat -= 3;
      this.gold += 5;
      npc.actionTimer = 2;

      // Effect
      const txt = this.add.text(npc.x, npc.y - 15, '💰+5', {
        fontSize: '14px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 2
      }).setDepth(15).setOrigin(0.5);
      this.tweens.add({
        targets: txt, y: txt.y - 25, alpha: 0, duration: 600,
        onComplete: () => txt.destroy()
      });
    }
  }

  updateWarriorAI(npc, delta) {
    // Aggressive hunter - targets dangerous animals first
    let nearest = null;
    let nearestDist = Infinity;
    // Prefer bears > wolves > rabbits
    const priority = { bear: 0, wolf: 1, rabbit: 2 };
    let bestPriority = 999;

    this.animals.getChildren().forEach(a => {
      if (!a.active) return;
      const d = Phaser.Math.Distance.Between(npc.x, npc.y, a.x, a.y);
      const p = priority[a.animalType] || 2;
      if (p < bestPriority || (p === bestPriority && d < nearestDist)) {
        nearest = a;
        nearestDist = d;
        bestPriority = p;
      }
    });

    if (nearest) {
      const angle = Phaser.Math.Angle.Between(npc.x, npc.y, nearest.x, nearest.y);
      npc.body.setVelocity(Math.cos(angle) * 130, Math.sin(angle) * 130);

      if (nearestDist < 45 && npc.actionTimer <= 0) {
        this.damageAnimal(nearest, 3);
        npc.actionTimer = 0.6;
      }
    } else {
      const dp = Phaser.Math.Distance.Between(npc.x, npc.y, this.player.x, this.player.y);
      if (dp > 80) {
        const a = Phaser.Math.Angle.Between(npc.x, npc.y, this.player.x, this.player.y);
        npc.body.setVelocity(Math.cos(a) * 110, Math.sin(a) * 110);
      } else {
        npc.body.setVelocity(0, 0);
      }
    }
  }

  updateAnimalAI(delta) {
    this.animals.getChildren().forEach(animal => {
      if (!animal.active) return;

      animal.attackCooldown = Math.max(0, animal.attackCooldown - delta);

      // Hit flash
      if (animal.hitFlash > 0) {
        animal.hitFlash -= delta;
        if (animal.hitFlash <= 0) animal.clearTint();
      }

      const distToPlayer = Phaser.Math.Distance.Between(animal.x, animal.y, this.player.x, this.player.y);

      if (animal.animalBehavior === 'flee') {
        // Rabbit: flee from player when close
        if (distToPlayer < 100) {
          const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, animal.x, animal.y);
          animal.body.setVelocity(
            Math.cos(angle) * animal.animalSpeed,
            Math.sin(angle) * animal.animalSpeed
          );
        } else {
          // Wander
          animal.wanderTimer -= delta;
          if (animal.wanderTimer <= 0) {
            animal.wanderTimer = Phaser.Math.FloatBetween(1, 3);
            const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
            animal.wanderDir = { x: Math.cos(a), y: Math.sin(a) };
          }
          animal.body.setVelocity(
            animal.wanderDir.x * animal.animalSpeed * 0.3,
            animal.wanderDir.y * animal.animalSpeed * 0.3
          );
        }
      } else if (animal.animalBehavior === 'chase') {
        // Wolf/Bear: chase player when in range
        const aggroRange = animal.animalType === 'bear' ? 250 : 200;
        if (distToPlayer < aggroRange) {
          const angle = Phaser.Math.Angle.Between(animal.x, animal.y, this.player.x, this.player.y);
          animal.body.setVelocity(
            Math.cos(angle) * animal.animalSpeed,
            Math.sin(angle) * animal.animalSpeed
          );

          // Attack player if close
          if (distToPlayer < 30 && animal.attackCooldown <= 0) {
            this.playerHP -= animal.animalDamage;
            animal.attackCooldown = 1;

            // Hit effect on player
            this.cameras.main.shake(100, 0.01);
            this.player.setTint(0xFF0000);
            this.time.delayedCall(100, () => {
              if (this.player.active) this.player.clearTint();
            });

            const dmg = this.add.text(this.player.x, this.player.y - 20, `-${animal.animalDamage}`, {
              fontSize: '16px', fontFamily: 'monospace', color: '#FF0000', stroke: '#000', strokeThickness: 2
            }).setDepth(15).setOrigin(0.5);
            this.tweens.add({
              targets: dmg, y: dmg.y - 30, alpha: 0, duration: 600,
              onComplete: () => dmg.destroy()
            });

            if (this.playerHP <= 0) {
              this.endGame(false);
            }
          }
        } else {
          // Wander
          animal.wanderTimer -= delta;
          if (animal.wanderTimer <= 0) {
            animal.wanderTimer = Phaser.Math.FloatBetween(2, 4);
            const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
            animal.wanderDir = { x: Math.cos(a), y: Math.sin(a) };
          }
          animal.body.setVelocity(
            animal.wanderDir.x * animal.animalSpeed * 0.3,
            animal.wanderDir.y * animal.animalSpeed * 0.3
          );
        }
      }

      // Update HP bar
      if (animal.hpBar) {
        animal.hpBar.clear();
        const bw = 30;
        const bx = animal.x - bw / 2;
        const by = animal.y - ANIMAL_STATS[animal.animalType].size - 8;
        animal.hpBar.fillStyle(0x333333, 0.8);
        animal.hpBar.fillRect(bx, by, bw, 4);
        const ratio = animal.animalHP / animal.animalMaxHP;
        const hpColor = ratio > 0.5 ? 0x4CAF50 : ratio > 0.25 ? 0xFFEB3B : 0xF44336;
        animal.hpBar.fillStyle(hpColor, 1);
        animal.hpBar.fillRect(bx, by, bw * ratio, 4);
      }
    });
  }

  updateUI() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const pad = 10;

    // Timer - show elapsed time
    const elapsed = Math.floor(this.gameTime);
    this.timerText.setText(`⏱ ${elapsed}s 생존하세요`);
    this.timerText.setColor('#FFFFFF');

    // Resources
    this.meatText.setText(`🥩 ${this.meat}`);
    this.goldText.setText(`💰 ${this.gold}`);

    // HP bar
    this.hpBarBg.clear();
    this.hpBarFill.clear();
    this.hpBarBg.fillStyle(0x333333, 0.8);
    this.hpBarBg.fillRect(pad, pad, 150, 20);
    const hpRatio = Math.max(0, this.playerHP / this.playerMaxHP);
    const hpCol = hpRatio > 0.5 ? 0x4CAF50 : hpRatio > 0.25 ? 0xFFEB3B : 0xF44336;
    this.hpBarFill.fillStyle(hpCol, 1);
    this.hpBarFill.fillRect(pad + 2, pad + 2, 146 * hpRatio, 16);
    this.hpText.setText(`❤️ ${Math.max(0, Math.ceil(this.playerHP))}/${this.playerMaxHP}`);
    this.hpText.setPosition(pad + 75, pad + 2);

    // Hire button
    this.hireBtn.clear();
    const hbx = w - 80;
    const hby = h - 40;
    if (this.nextNPCIndex < NPC_DEFS.length) {
      const def = NPC_DEFS[this.nextNPCIndex];
      const canAfford = this.meat >= def.cost;
      this.hireBtn.fillStyle(canAfford ? 0x4CAF50 : 0x666666, 0.8);
      this.hireBtn.fillRoundedRect(hbx - 65, hby - 22, 130, 44, 8);
      this.hireBtn.lineStyle(2, canAfford ? 0x66BB6A : 0x888888, 1);
      this.hireBtn.strokeRoundedRect(hbx - 65, hby - 22, 130, 44, 8);
      this.hireBtnText.setText(`${def.name} 고용\n🥩${def.cost}`);
      this.hireBtnText.setPosition(hbx, hby);
    } else {
      this.hireBtn.fillStyle(0x333333, 0.5);
      this.hireBtn.fillRoundedRect(hbx - 65, hby - 22, 130, 44, 8);
      this.hireBtnText.setText('모두 고용됨!');
      this.hireBtnText.setPosition(hbx, hby);
    }

    // Attack button (mobile)
    if (this.isMobile && this.atkBtn) {
      this.atkBtn.clear();
      const abx = w - 70;
      const aby = h - 110;
      this.atkBtn.fillStyle(0xF44336, 0.7);
      this.atkBtn.fillCircle(abx, aby, 30);
      this.atkBtn.lineStyle(2, 0xFF5252, 1);
      this.atkBtn.strokeCircle(abx, aby, 30);
      this.atkBtnText.setPosition(abx, aby);
    }

    // NPC status
    this.npcStatusTexts.forEach(t => t.destroy());
    this.npcStatusTexts = [];
    this.npcsOwned.forEach((npc, i) => {
      if (!npc.active) return;
      const label = this.add.text(npc.x, npc.y - 20, npc.npcDef.name, {
        fontSize: '10px', fontFamily: 'monospace', color: '#FFFFFF', stroke: '#000', strokeThickness: 2
      }).setDepth(12).setOrigin(0.5);
      this.npcStatusTexts.push(label);
    });
  }

  endGame(survived) {
    if (this.gameOver) return;
    this.gameOver = true;

    // Overlay
    const cam = this.cameras.main;
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(200);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, cam.width, cam.height);

    const title = survived ? '🏆 생존 성공!' : '💀 사망...';
    const titleColor = survived ? '#FFD700' : '#FF4444';

    this.add.text(cam.width / 2, cam.height / 2 - 60, title, {
      fontSize: '36px', fontFamily: 'monospace', color: titleColor, stroke: '#000', strokeThickness: 4
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    const stats = `고기 수집: ${this.meat}\n금화: ${this.gold}\nNPC 고용: ${this.npcsOwned.length}\n생존 시간: ${Math.floor(this.gameTime)}초`;
    this.add.text(cam.width / 2, cam.height / 2 + 10, stats, {
      fontSize: '18px', fontFamily: 'monospace', color: '#FFFFFF', stroke: '#000', strokeThickness: 2,
      align: 'center', lineSpacing: 8
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    // Restart button
    const restartBtn = this.add.text(cam.width / 2, cam.height / 2 + 110, '🔄 다시 시작', {
      fontSize: '24px', fontFamily: 'monospace', color: '#4CAF50', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#333333', padding: { x: 20, y: 10 }
    }).setScrollFactor(0).setDepth(201).setOrigin(0.5).setInteractive();

    restartBtn.on('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, deltaMs) {
    if (this.gameOver) return;
    const delta = deltaMs / 1000;

    // Game timer
    this.gameTime += delta;

    // Spawn timeline (loops every 60s)
    this.spawnTimeline();

    // Attack cooldown
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);

    // Player movement (keyboard)
    if (!this.isMobile || !this.joystickActive) {
      let mx = 0, my = 0;
      if (this.wasd.A.isDown || this.cursors.left.isDown) mx = -1;
      if (this.wasd.D.isDown || this.cursors.right.isDown) mx = 1;
      if (this.wasd.W.isDown || this.cursors.up.isDown) my = -1;
      if (this.wasd.S.isDown || this.cursors.down.isDown) my = 1;
      if (mx !== 0 || my !== 0) {
        const len = Math.sqrt(mx * mx + my * my);
        this.moveDir.x = mx / len;
        this.moveDir.y = my / len;
      } else if (!this.joystickActive) {
        this.moveDir.x = 0;
        this.moveDir.y = 0;
      }
    }

    this.player.body.setVelocity(
      this.moveDir.x * this.playerSpeed,
      this.moveDir.y * this.playerSpeed
    );

    // Animal AI
    this.updateAnimalAI(delta);

    // NPC AI
    this.updateNPCs(delta);

    // Auto-collect nearby meats
    this.meats.getChildren().forEach(m => {
      if (!m.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, m.x, m.y);
      if (d < 40) {
        // Magnetic pull
        const a = Phaser.Math.Angle.Between(m.x, m.y, this.player.x, this.player.y);
        m.x += Math.cos(a) * 200 * delta;
        m.y += Math.sin(a) * 200 * delta;
        if (d < 15) this.collectMeat(m);
      }
    });

    // NPC auto-collect meats
    this.npcsOwned.forEach(npc => {
      if (!npc.active) return;
      this.meats.getChildren().forEach(m => {
        if (!m.active) return;
        const d = Phaser.Math.Distance.Between(npc.x, npc.y, m.x, m.y);
        if (d < 30) this.collectMeat(m);
      });
    });

    // UI
    this.updateUI();
  }
}

// Game config
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GameScene],
  input: {
    activePointers: 3,
  }
};

const game = new Phaser.Game(config);
