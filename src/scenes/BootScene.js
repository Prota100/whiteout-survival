// Boot Scene - texture/asset generation
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  
  create() {
    // ═══ Loading Screen ═══
    const W = this.scale.width, H = this.scale.height;
    this.cameras.main.setBackgroundColor('#0A0E1A');
    const snowIcon = this.add.text(W/2, H*0.35, '❄️', { fontSize: '64px' }).setOrigin(0.5);
    this.tweens.add({ targets: snowIcon, scaleX: 1.2, scaleY: 1.2, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const loadTitle = this.add.text(W/2, H*0.50, '화이트아웃 서바이벌', {
      fontSize: '22px', fontFamily: 'monospace', color: '#e0e8ff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);
    const barW = Math.min(260, W*0.6), barH = 14, barX = W/2-barW/2, barY = H*0.62;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a1e2e, 1); barBg.fillRoundedRect(barX, barY, barW, barH, 7);
    const barFill = this.add.graphics();
    const loadPct = this.add.text(W/2, barY + barH + 14, '로딩 중... 0%', {
      fontSize: '12px', fontFamily: 'monospace', color: '#667788'
    }).setOrigin(0.5);

    // Simulate loading progress during texture creation
    const textureMethods = [
      'createPlayerTexture', 'createPlayerBackTexture', 'createPlayerAttackTexture',
      'createRabbitTexture', 'createRabbitBackTexture', 'createDeerTexture', 'createDeerBackTexture',
      'createPenguinTexture', 'createPenguinBackTexture', 'createSealTexture', 'createSealBackTexture',
      'createWolfTexture', 'createWolfBackTexture', 'createBearTexture', 'createBearBackTexture',
      'createIceGolemTexture', 'createSnowLeopardTexture',
      'createIceHunterTexture', 'createSplittingSlimeTexture', 'createBlizzardShamanTexture',
      'createNPCTextures', 'createNPCBackTextures',
      'createTreeTexture', 'createRockTexture', 'createDropTextures', 'createParticleTextures', 'createCrateTexture'
    ];
    let idx = 0;
    const total = textureMethods.length;
    const processNext = () => {
      if (idx < total) {
        this[textureMethods[idx]]();
        idx++;
        const pct = Math.round((idx / total) * 100);
        barFill.clear();
        barFill.fillStyle(0x2266cc, 1);
        barFill.fillRoundedRect(barX, barY, barW * (idx/total), barH, 7);
        barFill.fillStyle(0x4488ff, 0.5);
        barFill.fillRoundedRect(barX, barY, barW * (idx/total), barH/2, { tl: 7, tr: 7, bl: 0, br: 0 });
        loadPct.setText(`로딩 중... ${pct}%`);
        this.time.delayedCall(16, processNext);
      } else {
        // All textures loaded, proceed
        const loadSave = this.scene.settings.data?.loadSave || false;
        const playerClass = this.scene.settings.data?.playerClass || null;
        const difficulty = this.scene.settings.data?.difficulty || null;
        const dailyChallenge = this.scene.settings.data?.dailyChallenge || null;
        const endlessMode = this.scene.settings.data?.endlessMode || false;
        const ngPlus = this.scene.settings.data?.ngPlus || false;
        const bossRush = this.scene.settings.data?.bossRush || false;
        const speedrun = this.scene.settings.data?.speedrun || false;
        const handicap = this.scene.settings.data?.handicap || 'none';
        this.time.delayedCall(200, () => {
          this.scene.start('Game', { loadSave, playerClass, difficulty, dailyChallenge, endlessMode, ngPlus, bossRush, speedrun, handicap });
        });
      }
    };

    initAudio();
    processNext();
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

  createIceGolemTexture() {
    const g = this.add.graphics();
    const sz = 48;
    // Body - large gray-blue circle
    g.lineStyle(4, 0x6699BB, 1);
    g.fillStyle(0x88CCEE, 1);
    g.fillCircle(24, 24, 22);
    g.strokeCircle(24, 24, 22);
    // Inner ice cracks
    g.lineStyle(1, 0xAADDFF, 0.6);
    g.lineBetween(14, 16, 24, 24);
    g.lineBetween(24, 24, 34, 18);
    g.lineBetween(24, 24, 20, 34);
    // Eyes
    g.fillStyle(0x4477AA, 1);
    g.fillCircle(18, 20, 3);
    g.fillCircle(30, 20, 3);
    g.fillStyle(0xCCEEFF, 1);
    g.fillCircle(19, 19, 1);
    g.fillCircle(31, 19, 1);
    g.generateTexture('ice_golem', sz, sz);
    g.destroy();
  }

  createSnowLeopardTexture() {
    const g = this.add.graphics();
    const sz = 28;
    // Body - white circle
    g.fillStyle(0xF8F8FF, 1);
    g.fillCircle(14, 14, 12);
    // Spots (gray dots)
    g.fillStyle(0x999999, 1);
    g.fillCircle(10, 11, 2);
    g.fillCircle(18, 13, 2);
    g.fillCircle(14, 18, 2);
    // Eyes
    g.fillStyle(0x44AA44, 1);
    g.fillCircle(10, 10, 1.5);
    g.fillCircle(18, 10, 1.5);
    // Ears
    g.fillStyle(0xEEEEEE, 1);
    g.fillTriangle(7, 4, 10, 2, 12, 6);
    g.fillTriangle(16, 6, 18, 2, 21, 4);
    g.generateTexture('snow_leopard', sz, sz);
    g.destroy();
  }

  createIceHunterTexture() {
    const g = this.add.graphics(); const sz = 40;
    // Diamond body shape (blue)
    g.fillStyle(0x4488CC, 1);
    g.fillTriangle(20, 2, 38, 20, 20, 38);
    g.fillTriangle(20, 2, 2, 20, 20, 38);
    // Inner lighter diamond
    g.fillStyle(0x66AADD, 1);
    g.fillTriangle(20, 8, 32, 20, 20, 32);
    g.fillTriangle(20, 8, 8, 20, 20, 32);
    // Eyes
    g.fillStyle(0xCCEEFF, 1);
    g.fillCircle(15, 18, 2); g.fillCircle(25, 18, 2);
    g.fillStyle(0x112244, 1);
    g.fillCircle(15, 18, 1); g.fillCircle(25, 18, 1);
    g.generateTexture('ice_hunter', sz, sz); g.destroy();
  }

  createSplittingSlimeTexture() {
    const g = this.add.graphics(); const sz = 48;
    // Big green circle
    g.fillStyle(0x44CC44, 1);
    g.fillCircle(24, 26, 20);
    // Highlight
    g.fillStyle(0x88EE88, 0.6);
    g.fillCircle(18, 20, 8);
    // Eyes
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(17, 22, 4); g.fillCircle(31, 22, 4);
    g.fillStyle(0x115511, 1);
    g.fillCircle(18, 23, 2); g.fillCircle(32, 23, 2);
    g.generateTexture('splitting_slime', sz, sz); g.destroy();
    // Mini slime texture
    const g2 = this.add.graphics(); const sz2 = 24;
    g2.fillStyle(0x44CC44, 1);
    g2.fillCircle(12, 14, 10);
    g2.fillStyle(0x88EE88, 0.6);
    g2.fillCircle(9, 11, 4);
    g2.fillStyle(0xFFFFFF, 1);
    g2.fillCircle(9, 12, 2); g2.fillCircle(15, 12, 2);
    g2.fillStyle(0x115511, 1);
    g2.fillCircle(9, 12, 1); g2.fillCircle(15, 12, 1);
    g2.generateTexture('mini_slime', sz2, sz2); g2.destroy();
  }

  createBlizzardShamanTexture() {
    const g = this.add.graphics(); const sz = 36;
    // Star shape (purple)
    g.fillStyle(0xAA55FF, 1);
    const cx = 18, cy = 18, outerR = 16, innerR = 7;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 * i / 10) - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath(); g.fillPath();
    // Inner glow
    g.fillStyle(0xCC88FF, 0.6);
    g.fillCircle(cx, cy, 6);
    // Eyes
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(14, 16, 2); g.fillCircle(22, 16, 2);
    g.fillStyle(0x440088, 1);
    g.fillCircle(14, 16, 1); g.fillCircle(22, 16, 1);
    g.generateTexture('blizzard_shaman', sz, sz); g.destroy();
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

