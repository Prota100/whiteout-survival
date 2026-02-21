// Title Scene
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
      const r = Math.floor(8 + t * 140);
      const g = Math.floor(12 + t * 160);
      const b = Math.floor(50 + t * 170);
      const color = (r << 16) | (g << 8) | b;
      this.skyGfx.fillStyle(color, 1);
      this.skyGfx.fillRect(0, (H * 0.7) * (i / skySteps), W, (H * 0.7) / skySteps + 1);
    }
    
    // ═══ 설산 봉우리 실루엣 ═══
    this.mountainGfx = this.add.graphics().setDepth(1);
    // 뒷산 (더 어둡고 장엄하게)
    this.mountainGfx.fillStyle(0x8090b0, 0.5);
    this.mountainGfx.beginPath();
    this.mountainGfx.moveTo(0, H * 0.7);
    const peaks1 = [0, 0.1, 0.2, 0.35, 0.45, 0.55, 0.7, 0.8, 0.9, 1.0];
    const heights1 = [0.55, 0.35, 0.42, 0.25, 0.38, 0.3, 0.22, 0.4, 0.35, 0.5];
    peaks1.forEach((px, i) => this.mountainGfx.lineTo(px * W, H * heights1[i]));
    this.mountainGfx.lineTo(W, H * 0.7);
    this.mountainGfx.closePath();
    this.mountainGfx.fillPath();
    // 앞산 (약간 어둡게)
    this.mountainGfx.fillStyle(0xc0cce0, 0.7);
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
    
    // ═══ Snow particles (강화 v2 - more natural) ═══
    this.snowParticles = [];
    for (let i = 0; i < 200; i++) {
      this.snowParticles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 0.5 + Math.random() * 4,
        speedX: -0.2 - Math.random() * 0.8,
        speedY: 0.3 + Math.random() * 2.5,
        alpha: 0.15 + Math.random() * 0.65,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.5 + Math.random() * 1.5,
        wobbleAmp: 0.3 + Math.random() * 0.8
      });
    }
    
    this.snowGfx = this.add.graphics().setDepth(10);
    
    // ═══ Game Tips (rotating) ═══
    this._tipIndex = 0;
    this._tipText = this.add.text(W / 2, H * 0.94, GAME_TIPS[0], {
      fontSize: isMobileLayout() ? '10px' : '12px', fontFamily: 'monospace', color: '#667788',
      wordWrap: { width: W * 0.85 }, align: 'center'
    }).setOrigin(0.5).setDepth(20).setAlpha(0.8);
    this._tipTimer = this.time.addEvent({
      delay: 5000, loop: true,
      callback: () => {
        this._tipIndex = (this._tipIndex + 1) % GAME_TIPS.length;
        this.tweens.add({ targets: this._tipText, alpha: 0, duration: 300, onComplete: () => {
          if (this._tipText && this._tipText.active) {
            this._tipText.setText(GAME_TIPS[this._tipIndex]);
            this.tweens.add({ targets: this._tipText, alpha: 0.8, duration: 300 });
          }
        }});
      }
    });
    
    // Title text with glow pulse
    const titleLogo = this.add.text(W / 2, H * 0.25, '❄️ 화이트아웃 서바이벌', {
      fontSize: Math.min(42, W * 0.06) + 'px',
      fontFamily: 'monospace',
      color: '#e0e8ff',
      stroke: '#000',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#0a0a2a', blur: 8, fill: true }
    }).setOrigin(0.5);
    // Glow pulse animation (shadowBlur 8→18→8)
    this.tweens.add({ targets: { v: 8 }, v: 18, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.InOut',
      onUpdate: (_, t) => { titleLogo.setShadow(2, 2, '#4466aa', t.v, true, true); }
    });
    
    this.add.text(W / 2, H * 0.33, '극한의 추위에서 살아남아라', {
      fontSize: Math.min(18, W * 0.03) + 'px',
      fontFamily: 'monospace',
      color: '#8899bb',
    }).setOrigin(0.5);

    // Version text (Easter egg: 5 rapid clicks)
    const versionText = this.add.text(W - 10, H - 10, 'v2.1', {
      fontSize: '11px', fontFamily: 'monospace', color: '#445566', alpha: 0.6
    }).setOrigin(1, 1).setDepth(20).setInteractive();
    let _vClickCount = 0, _vClickTimer = 0;
    versionText.on('pointerdown', () => {
      const now = Date.now();
      if (now - _vClickTimer > 2000) _vClickCount = 0;
      _vClickTimer = now;
      _vClickCount++;
      if (_vClickCount >= 5) {
        _vClickCount = 0;
        // Unlock all skins + 100 meta points
        const meta = MetaManager.load();
        meta.totalPoints += 100;
        MetaManager.save(meta);
        PLAYER_SKINS.forEach(s => {
          try {
            const data = JSON.parse(localStorage.getItem(SkinManager.KEY) || '{}');
            data[s.id] = true;
            localStorage.setItem(SkinManager.KEY, JSON.stringify(data));
          } catch(e) {}
        });
        // Save konami-like achievement
        try {
          const ach = JSON.parse(localStorage.getItem('achievements_whiteout') || '{}');
          ach['secret_konami'] = true;
          localStorage.setItem('achievements_whiteout', JSON.stringify(ach));
        } catch(e) {}
        const popup = this.add.text(W / 2, H / 2, '🛠️ 개발자 모드', {
          fontSize: '20px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(999);
        this.time.delayedCall(2000, () => popup.destroy());
      }
    });
    
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
        this._showConfirmDialogThenClass();
      } else {
        this._showClassSelection();
      }
    });
    
    // ═══ 2열 그리드 버튼 배치 ═══
    const meta = MetaManager.load();
    const hasPoints = MetaManager.getAvailablePoints() > 0;
    const skinCount = SkinManager.getUnlockedCount();
    const gridBtnW = Math.min(120, (W - 40) / 2 - 5);
    const gridBtnH = 42;
    const gridGap = 10;
    const gridStartY = newBtnY + btnH + 24;
    const gridLeft = W / 2 - gridBtnW - gridGap / 2;
    const gridRight = W / 2 + gridGap / 2;

    // Row 1: 영구 강화, 📖 도감
    this._createButton(gridLeft + gridBtnW / 2, gridStartY, gridBtnW, gridBtnH, `🔮 영구 강화${hasPoints ? ' ✨' : ''}`, hasPoints ? 0xaa44aa : 0x444466, () => {
      this._showMetaUpgradeUI();
    });
    this._createButton(gridRight + gridBtnW / 2, gridStartY, gridBtnW, gridBtnH, '📖 도감', 0x3A4455, () => {
      this._showCollectionScreen();
    });

    // Row 2: 📊 통계, 🎨 스킨
    const gridRow2Y = gridStartY + gridBtnH + gridGap;
    this._createButton(gridLeft + gridBtnW / 2, gridRow2Y, gridBtnW, gridBtnH, '📊 통계', 0x334455, () => {
      this._showStatsPopup();
    });
    this._createButton(gridRight + gridBtnW / 2, gridRow2Y, gridBtnW, gridBtnH, `🎨 스킨 (${skinCount})`, 0x445544, () => {
      this._showSkinPopup();
    });
    
    // Show best time if exists
    const afterGridY = gridRow2Y + gridBtnH / 2 + 16;
    if (meta.bestTime > 0) {
      const bestMin = Math.floor(meta.bestTime / 60);
      const bestSec = Math.floor(meta.bestTime % 60);
      this.add.text(W / 2, afterGridY, `🏆 최고 기록: ${bestMin}분 ${bestSec}초 | 총 ${meta.totalRuns}회`, {
        fontSize: '12px', fontFamily: 'monospace', color: '#aa88cc'
      }).setOrigin(0.5);
    }

    // ═══ 🏅 내 기록 (타이틀 하단) ═══
    const rec = RecordManager.load();
    const recordY = (meta.bestTime > 0 ? afterGridY + 20 : gridRow2Y + gridBtnH / 2 + 20);
    const recordBoxH = 76;
    const recordGfx = this.add.graphics().setDepth(10);
    recordGfx.fillStyle(0x0A0E1A, 0.7);
    recordGfx.fillRoundedRect(W/2 - btnW/2 - 10, recordY - 8, btnW + 20, recordBoxH, 8);

    if (rec.totalPlays > 0) {
      const bestTimeStr = RecordManager.formatTime(rec.bestSurvivalTime);
      let achCount = 0;
      try { achCount = Object.keys(JSON.parse(localStorage.getItem('achievements_whiteout') || '{}')).length; } catch(e) {}
      this.add.text(W / 2, recordY + 4, '🏅 내 기록', {
        fontSize: '13px', fontFamily: 'monospace', color: '#FFD700'
      }).setOrigin(0.5, 0).setDepth(11);
      if (rec.bestScore) {
        const bgi = ScoreSystem.getGrade(rec.bestScore);
        this.add.text(W / 2, recordY + 22, `🏆 최고점수: [${bgi.grade}] ${ScoreSystem.formatScore(rec.bestScore)}점`, {
          fontSize: '12px', fontFamily: 'monospace', color: bgi.color
        }).setOrigin(0.5, 0).setDepth(11);
      }
      this.add.text(W / 2, recordY + (rec.bestScore ? 38 : 22), `최장 ${bestTimeStr} | 최다 ${rec.bestKills}킬 | 클리어 ${rec.wins}회 | ${rec.totalPlays}판`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#8899bb'
      }).setOrigin(0.5, 0).setDepth(11);
      this.add.text(W / 2, recordY + 38, `🏆 성취: ${achCount} / ${ACHIEVEMENTS.length}`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#AABB88'
      }).setOrigin(0.5, 0).setDepth(11);
      if (rec.bestSpeedrunTime > 0) {
        const srMin = Math.floor(rec.bestSpeedrunTime / 60);
        const srSec = Math.floor(rec.bestSpeedrunTime % 60);
        this.add.text(W / 2, recordY + 54, `⚡ 스피드런 최고: ${srMin}분 ${srSec}초 남음`, {
          fontSize: '11px', fontFamily: 'monospace', color: '#FFCC44'
        }).setOrigin(0.5, 0).setDepth(11);
      }
    } else {
      this.add.text(W / 2, recordY + 18, '🏅 아직 기록 없음', {
        fontSize: '13px', fontFamily: 'monospace', color: '#556677'
      }).setOrigin(0.5, 0.5).setDepth(11);
    }

    // ═══ 📊 최근 점수 기록 (최근 5판) ═══
    const scoreHistory = ScoreSystem.loadScores();
    let scoreHistoryEndY = recordY + recordBoxH;
    if (scoreHistory.length > 0) {
      const shY = recordY + recordBoxH + 12;
      const shH = 18 + scoreHistory.length * 18 + 8;
      const shGfx = this.add.graphics().setDepth(10);
      shGfx.fillStyle(0x0A0E1A, 0.7);
      shGfx.fillRoundedRect(W/2 - btnW/2 - 10, shY - 4, btnW + 20, shH, 8);
      this.add.text(W/2, shY + 4, '📊 최근 점수', {
        fontSize: '12px', fontFamily: 'monospace', color: '#FFD700'
      }).setOrigin(0.5, 0).setDepth(11);
      const bestInHistory = Math.max(...scoreHistory.map(s => s.score));
      scoreHistory.forEach((s, i) => {
        const gi = ScoreSystem.getGrade(s.score);
        const isBest = s.score === bestInHistory;
        const color = isBest ? '#FFD700' : '#8899bb';
        const prefix = isBest ? '★ ' : '  ';
        this.add.text(W/2, shY + 20 + i * 18,
          prefix + s.date + '  [' + gi.grade + '] ' + ScoreSystem.formatScore(s.score) + '점', {
          fontSize: '10px', fontFamily: 'monospace', color: color
        }).setOrigin(0.5, 0).setDepth(11);
      });
      scoreHistoryEndY = shY + shH;
    }

    // ═══ 📅 데일리 챌린지 ═══
    const dailyCh = getTodayChallenge();
    const dailyKey = getDailyChallengeKey();
    const dailyCleared = localStorage.getItem('daily_clear_' + dailyKey) === 'true';
    const dailyY = scoreHistoryEndY + 16;
    const dailyBoxH = 70;
    const dailyGfx = this.add.graphics().setDepth(10);
    dailyGfx.fillStyle(0x1A1E2E, 0.8);
    dailyGfx.fillRoundedRect(W/2 - btnW/2 - 10, dailyY - 8, btnW + 20, dailyBoxH, 8);
    dailyGfx.lineStyle(1, 0xFFAA00, 0.4);
    dailyGfx.strokeRoundedRect(W/2 - btnW/2 - 10, dailyY - 8, btnW + 20, dailyBoxH, 8);

    this.add.text(W / 2, dailyY + 4, `📅 오늘의 챌린지: ${dailyCh.name}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#FFD700'
    }).setOrigin(0.5, 0).setDepth(11);
    this.add.text(W / 2, dailyY + 22, dailyCh.desc, {
      fontSize: '11px', fontFamily: 'monospace', color: '#aabbcc', wordWrap: { width: btnW - 20 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(11);

    if (dailyCleared) {
      this.add.text(W / 2, dailyY + 44, '✅ 클리어 완료!', {
        fontSize: '12px', fontFamily: 'monospace', color: '#44DD44'
      }).setOrigin(0.5, 0).setDepth(11);
    } else {
      const dailyBtnW2 = 80, dailyBtnH2 = 24;
      const dbg = this.add.graphics().setDepth(11);
      dbg.fillStyle(0xFF6B35, 0.9);
      dbg.fillRoundedRect(W/2 - dailyBtnW2/2, dailyY + 42, dailyBtnW2, dailyBtnH2, 6);
      this.add.text(W / 2, dailyY + 42 + dailyBtnH2/2, '🎯 도전', {
        fontSize: '12px', fontFamily: 'monospace', color: '#fff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(12);
      const dailyHit = this.add.rectangle(W/2, dailyY + 42 + dailyBtnH2/2, dailyBtnW2, dailyBtnH2, 0, 0).setInteractive({ useHandCursor: true }).setDepth(13);
      dailyHit.on('pointerdown', () => {
        this.scene.start('Boot', { loadSave: false, playerClass: localStorage.getItem('whiteout_class') || 'warrior', dailyChallenge: dailyCh });
      });
    }

    // Version
    this.add.text(W - 10, H - 10, 'v2.1', {
      fontSize: '11px', fontFamily: 'monospace', color: '#334'
    }).setOrigin(1, 1);

    // ═══ ? 도움말 버튼 ═══
    const helpBtnSize = 36;
    const helpBg = this.add.graphics().setDepth(20);
    helpBg.fillStyle(0x334466, 0.8);
    helpBg.fillCircle(30, H - 30, helpBtnSize / 2);
    helpBg.lineStyle(2, 0x6688aa, 0.6);
    helpBg.strokeCircle(30, H - 30, helpBtnSize / 2);
    const helpTxt = this.add.text(30, H - 30, '?', {
      fontSize: '20px', fontFamily: 'monospace', color: '#aaccee', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);
    const helpHit = this.add.circle(30, H - 30, helpBtnSize / 2, 0, 0).setInteractive({ useHandCursor: true }).setDepth(22);
    helpHit.on('pointerdown', () => this._showHelpModal());
    
    this.elapsed = 0;
  }

  _showHelpModal() {
    const W = this.scale.width;
    const H = this.scale.height;
    const allEl = [];
    const destroy = () => allEl.forEach(o => { try { o.destroy(); } catch(e) {} });

    const ov = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.85).setInteractive().setDepth(300);
    allEl.push(ov);
    const pw = Math.min(380, W * 0.85);
    const ph = Math.min(340, H * 0.7);
    const panel = this.add.graphics().setDepth(301);
    panel.fillStyle(0x0A0E1A, 0.98);
    panel.fillRoundedRect(W/2 - pw/2, H/2 - ph/2, pw, ph, 12);
    panel.lineStyle(2, 0x4488ff, 0.6);
    panel.strokeRoundedRect(W/2 - pw/2, H/2 - ph/2, pw, ph, 12);
    allEl.push(panel);

    const title = this.add.text(W/2, H/2 - ph/2 + 30, '📖 플레이 방법', {
      fontSize: '22px', fontFamily: 'monospace', color: '#e0e8ff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(302);
    allEl.push(title);

    const helpLines = [
      '🕹️ 이동: WASD 또는 화살표키 (모바일: 조이스틱)',
      '⚔️ 공격: 적에게 다가가면 자동 공격',
      '⬆️ 레벨업: 적 처치 → XP → 3개 카드 중 택 1',
      '❄️ 생존: 한파 때 체온 관리! 캠프파이어 활용',
      '🪵 건설: 자원을 모아 건물을 지으면 유리',
      '🗡️ 장비: 적이 드롭하는 장비로 강해지세요',
      '🔮 영구 강화: 게임 종료 시 포인트 획득 → 다음 판 적용',
    ];
    helpLines.forEach((line, i) => {
      const t = this.add.text(W/2, H/2 - ph/2 + 70 + i * 30, line, {
        fontSize: '12px', fontFamily: 'monospace', color: '#AABBDD', wordWrap: { width: pw - 40 }
      }).setOrigin(0.5).setDepth(302);
      allEl.push(t);
    });

    const closeBtn = this.add.text(W/2, H/2 + ph/2 - 30, '닫기', {
      fontSize: '16px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });
    allEl.push(closeBtn);
    closeBtn.on('pointerdown', destroy);
    ov.on('pointerdown', destroy);
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
      // Scale up on hover
      this.tweens.add({ targets: [bg, txt], scale: 1.05, duration: 120, ease: 'Quad.Out' });
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
      // Scale back to normal
      this.tweens.add({ targets: [bg, txt], scale: 1, duration: 120, ease: 'Quad.Out' });
    });
    hitArea.on('pointerdown', () => {
      // Scale 0.95 press effect
      this.tweens.add({ targets: [bg, txt], scale: 0.95, duration: 60, yoyo: true, ease: 'Quad.InOut',
        onComplete: () => { bg.setScale(1); txt.setScale(1); callback(); }
      });
    });
    
    return { bg, txt, hitArea };
  }
  
  _showSkinPopup() {
    const W = this.scale.width;
    const H = this.scale.height;
    const allElements = [];
    const destroy = () => allElements.forEach(o => { try { o.destroy(); } catch(e) {} });

    const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.85).setInteractive().setDepth(200);
    allElements.push(overlay);
    overlay.on('pointerdown', destroy);

    const titleTxt = this.add.text(W/2, H*0.08, '🎨 플레이어 스킨', {
      fontSize: Math.min(24, W*0.045)+'px', fontFamily:'monospace', color:'#e0e8ff', stroke:'#000', strokeThickness:3
    }).setOrigin(0.5).setDepth(201);
    allElements.push(titleTxt);

    const cols = 4;
    const cellW = Math.min(80, W * 0.2);
    const cellH = 90;
    const gap = 8;
    const totalGridW = cols * cellW + (cols-1) * gap;
    const startX = W/2 - totalGridW/2 + cellW/2;
    const startY = H * 0.18;

    const selectedId = SkinManager.getSelectedId();

    PLAYER_SKINS.forEach((skin, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cellW + gap);
      const cy = startY + row * (cellH + gap);
      const unlocked = SkinManager.isUnlocked(skin.id);
      const isSelected = skin.id === selectedId;

      const g = this.add.graphics().setDepth(201);
      g.fillStyle(isSelected ? 0x2a3a4e : 0x1a1a2e, 0.95);
      g.fillRoundedRect(cx - cellW/2, cy - cellH/2, cellW, cellH, 6);
      g.lineStyle(2, isSelected ? 0xFFD700 : (unlocked ? 0x556688 : 0x333344), 1);
      g.strokeRoundedRect(cx - cellW/2, cy - cellH/2, cellW, cellH, 6);

      // Skin preview circle
      const previewG = this.add.graphics().setDepth(202);
      if (unlocked) {
        previewG.fillStyle(skin.color, 1);
        previewG.fillCircle(cx, cy - 16, 14);
        previewG.lineStyle(2, skin.outline, 1);
        previewG.strokeCircle(cx, cy - 16, 14);
      } else {
        previewG.fillStyle(0x333333, 1);
        previewG.fillCircle(cx, cy - 16, 14);
        previewG.lineStyle(2, 0x555555, 1);
        previewG.strokeCircle(cx, cy - 16, 14);
      }
      allElements.push(previewG);

      // Lock icon or name
      if (unlocked) {
        const nameTxt = this.add.text(cx, cy + 10, skin.name, {
          fontSize: '10px', fontFamily: 'monospace', color: isSelected ? '#FFD700' : '#CCDDEE'
        }).setOrigin(0.5).setDepth(202);
        allElements.push(nameTxt);
        if (isSelected) {
          const selTxt = this.add.text(cx, cy + 24, '✓ 선택됨', {
            fontSize: '9px', fontFamily: 'monospace', color: '#88FF88'
          }).setOrigin(0.5).setDepth(202);
          allElements.push(selTxt);
        }
      } else {
        const lockTxt = this.add.text(cx, cy - 16, '🔒', {
          fontSize: '16px'
        }).setOrigin(0.5).setDepth(203);
        allElements.push(lockTxt);
        const condTxt = this.add.text(cx, cy + 10, SkinManager.getUnlockDescription(skin.unlockCondition), {
          fontSize: '8px', fontFamily: 'monospace', color: '#666677', wordWrap: { width: cellW - 8 }, align: 'center'
        }).setOrigin(0.5).setDepth(202);
        allElements.push(condTxt);
      }

      allElements.push(g);

      // Click to select
      if (unlocked && !isSelected) {
        const hit = this.add.rectangle(cx, cy, cellW, cellH, 0, 0).setInteractive({ useHandCursor: true }).setDepth(204);
        allElements.push(hit);
        hit.on('pointerdown', () => {
          SkinManager.select(skin.id);
          destroy();
          this._showSkinPopup();
        });
      }
    });

    // Close button
    const closeTxt = this.add.text(W/2, H*0.85, '닫기', {
      fontSize: '18px', fontFamily: 'monospace', color: '#AABBCC', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true });
    closeTxt.on('pointerdown', destroy);
    allElements.push(closeTxt);
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
  
  _showConfirmDialogThenClass() {
    const W = this.scale.width;
    const H = this.scale.height;
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setInteractive().setDepth(100);
    const dlg = this.add.graphics().setDepth(101);
    const dw = Math.min(320, W * 0.7); const dh = 180;
    dlg.fillStyle(0x1a1a2e, 0.95); dlg.fillRoundedRect(W/2-dw/2, H/2-dh/2, dw, dh, 12);
    dlg.lineStyle(2, 0xff6644, 0.8); dlg.strokeRoundedRect(W/2-dw/2, H/2-dh/2, dw, dh, 12);
    const title = this.add.text(W/2, H/2-50, '⚠️ 경고', { fontSize:'20px', fontFamily:'monospace', color:'#ff8866' }).setOrigin(0.5).setDepth(102);
    const msg = this.add.text(W/2, H/2-15, '기존 저장 데이터가 삭제됩니다.\n정말 새로 시작하시겠습니까?', { fontSize:'14px', fontFamily:'monospace', color:'#ccccdd', align:'center' }).setOrigin(0.5).setDepth(102);
    const confirmBg = this.add.graphics().setDepth(102);
    confirmBg.fillStyle(0xcc3322, 0.9); confirmBg.fillRoundedRect(W/2-70-50, H/2+40, 100, 36, 6);
    const confirmTxt = this.add.text(W/2-70, H/2+58, '삭제 후 시작', { fontSize:'13px', fontFamily:'monospace', color:'#fff' }).setOrigin(0.5).setDepth(102);
    const confirmHit = this.add.rectangle(W/2-70, H/2+58, 100, 36, 0, 0).setInteractive({ useHandCursor:true }).setDepth(103);
    confirmHit.on('pointerdown', () => {
      SaveManager.delete();
      [overlay, dlg, title, msg, confirmBg, confirmTxt, confirmHit, cancelBg, cancelTxt, cancelHit].forEach(o => o.destroy());
      this._showClassSelection();
    });
    const cancelBg = this.add.graphics().setDepth(102);
    cancelBg.fillStyle(0x334466, 0.9); cancelBg.fillRoundedRect(W/2+70-50, H/2+40, 100, 36, 6);
    const cancelTxt = this.add.text(W/2+70, H/2+58, '취소', { fontSize:'13px', fontFamily:'monospace', color:'#aabbcc' }).setOrigin(0.5).setDepth(102);
    const cancelHit = this.add.rectangle(W/2+70-50, H/2+58, 100, 36, 0, 0).setInteractive({ useHandCursor:true }).setDepth(103);
    cancelHit.on('pointerdown', () => {
      [overlay, dlg, title, msg, confirmBg, confirmTxt, confirmHit, cancelBg, cancelTxt, cancelHit].forEach(o => o.destroy());
    });
  }

  _showClassSelection() {
    const W = this.scale.width;
    const H = this.scale.height;
    const allElements = [];
    // Hide DOM HUD behind class selection
    const _csHud = document.getElementById('dom-hud');
    const _csBtns = document.getElementById('bottom-buttons');
    if (_csHud) _csHud.style.visibility = 'hidden';
    if (_csBtns) _csBtns.style.display = 'none';
    const destroy = () => {
      allElements.forEach(o => { try { o.destroy(); } catch(e) {} });
      if (_csHud) _csHud.style.visibility = 'visible';
      if (_csBtns) _csBtns.style.display = '';
    };

    // Overlay
    const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.85).setInteractive().setDepth(200);
    allElements.push(overlay);

    // Title
    const titleTxt = this.add.text(W/2, H*0.10, '⚔️ 클래스를 선택하세요', {
      fontSize: Math.min(28, W*0.05)+'px', fontFamily:'monospace', color:'#e0e8ff', stroke:'#000', strokeThickness:3
    }).setOrigin(0.5).setDepth(201);
    allElements.push(titleTxt);

    // FTUE hint
    const hintTop = this.add.text(W/2, H*0.16, '⚡ 클래스를 선택하면 게임이 시작됩니다', {
      fontSize: Math.min(13, W*0.025)+'px', fontFamily:'monospace', color:'#667788'
    }).setOrigin(0.5).setDepth(201);
    allElements.push(hintTop);

    let selectedClass = localStorage.getItem('whiteout_class') || 'warrior';
    let selectedDifficulty = localStorage.getItem('whiteout_difficulty') || 'normal';
    const classKeys = ['warrior', 'mage', 'survivor', 'shaman', 'hunter'];
    const diffKeys = ['normal', 'hard', 'hell'];
    const cardW = Math.min(75, W * 0.17);
    const cardH = 170;
    const gap = Math.min(10, W * 0.015);
    const totalW = cardW * 5 + gap * 4;
    const startX = W/2 - totalW/2 + cardW/2;
    const cardY = H * 0.38;

    // Class recommendation map
    const classRecommend = {
      warrior: '🛡️ 근접 전투와 생존력을 원하는 분',
      mage: '🔮 강력한 광역기를 원하는 분',
      survivor: '🏃 속도와 유틸리티를 원하는 분',
      hunter: '🏹 원거리 크리티컬에 특화된 분',
      shaman: '🌿 팀 서포트와 힐링을 원하는 분',
    };

    // Description text (updated on selection)
    const descTxt = this.add.text(W/2, H*0.70, '', {
      fontSize:'13px', fontFamily:'monospace', color:'#ccddee', align:'center', wordWrap:{width:W*0.8}
    }).setOrigin(0.5).setDepth(201);
    allElements.push(descTxt);

    // Recommendation text
    const recommendTxt = this.add.text(W/2, H*0.74, '', {
      fontSize:'11px', fontFamily:'monospace', color:'#88BBAA', align:'center'
    }).setOrigin(0.5).setDepth(201);
    allElements.push(recommendTxt);

    // Stat bars container
    const statBarGfx = this.add.graphics().setDepth(201);
    allElements.push(statBarGfx);
    const statBarLabels = [];
    const statBarY = H * 0.78;
    const barW = Math.min(180, W * 0.35);
    const barH = 10;
    const statNames = ['HP', '공격', '속도', '생존'];
    const statKeys = ['hp', 'atk', 'spd', 'surv'];
    const statColors = [0x44BB44, 0xFF4444, 0x44AAFF, 0xFFAA44];
    statNames.forEach((name, i) => {
      const lbl = this.add.text(W/2 - barW/2 - 40, statBarY + i * 18, name, {
        fontSize: '10px', fontFamily: 'monospace', color: '#8899aa'
      }).setOrigin(1, 0.5).setDepth(202);
      allElements.push(lbl);
      statBarLabels.push(lbl);
    });

    // Star rating helper
    const stars = (val, max=5) => '★'.repeat(Math.round(val)) + '☆'.repeat(max - Math.round(val));

    const cardElements = []; // track per-card elements for highlight updates
    const cardGfx = [];

    const updateSelection = () => {
      const cls = PLAYER_CLASSES[selectedClass];
      descTxt.setText(`${cls.icon} ${cls.name}: ${cls.desc}\n패시브: ${cls.passives.join(' / ')}`);
      recommendTxt.setText(classRecommend[selectedClass] || '');
      // Draw stat bars
      statBarGfx.clear();
      statKeys.forEach((key, i) => {
        const val = cls.ratings[key] || 0;
        const y = statBarY + i * 18;
        // Background
        statBarGfx.fillStyle(0x222244, 0.8);
        statBarGfx.fillRoundedRect(W/2 - barW/2, y - barH/2, barW, barH, 3);
        // Fill
        statBarGfx.fillStyle(statColors[i], 0.9);
        statBarGfx.fillRoundedRect(W/2 - barW/2, y - barH/2, barW * (val / 5), barH, 3);
      });
      // Update card highlights
      classKeys.forEach((k, i) => {
        const isSelected = k === selectedClass;
        const g = cardGfx[i];
        const cx = startX + i * (cardW + gap);
        g.clear();
        // Background
        g.fillStyle(isSelected ? 0x2a2a4e : 0x1a1a2e, 0.95);
        g.fillRoundedRect(cx - cardW/2, cardY - cardH/2, cardW, cardH, 8);
        // Border
        const borderColor = PLAYER_CLASSES[k].colorHex;
        g.lineStyle(isSelected ? 3 : 1, borderColor, isSelected ? 1 : 0.5);
        g.strokeRoundedRect(cx - cardW/2, cardY - cardH/2, cardW, cardH, 8);
        if (isSelected) {
          // Glow effect
          g.lineStyle(1, borderColor, 0.3);
          g.strokeRoundedRect(cx - cardW/2 - 3, cardY - cardH/2 - 3, cardW + 6, cardH + 6, 10);
        }
      });
    };

    classKeys.forEach((k, i) => {
      const cls = PLAYER_CLASSES[k];
      const cx = startX + i * (cardW + gap);

      // Card background graphics
      const g = this.add.graphics().setDepth(201);
      allElements.push(g);
      cardGfx.push(g);

      // Icon + name
      const iconTxt = this.add.text(cx, cardY - cardH/2 + 22, cls.icon, {
        fontSize:'24px'
      }).setOrigin(0.5).setDepth(202);
      allElements.push(iconTxt);

      const nameTxt = this.add.text(cx, cardY - cardH/2 + 45, cls.name, {
        fontSize:'14px', fontFamily:'monospace', color: cls.color, fontStyle:'bold'
      }).setOrigin(0.5).setDepth(202);
      allElements.push(nameTxt);

      // Stats
      const statY = cardY - cardH/2 + 65;
      const statStyle = { fontSize:'10px', fontFamily:'monospace', color:'#aabbcc' };
      const labels = [
        `HP: ${stars(cls.ratings.hp)}`,
        `공격: ${stars(cls.ratings.atk)}`,
        `속도: ${stars(cls.ratings.spd)}`,
        `생존: ${stars(cls.ratings.surv)}`,
      ];
      labels.forEach((lbl, li) => {
        const st = this.add.text(cx, statY + li * 16, lbl, statStyle).setOrigin(0.5).setDepth(202);
        allElements.push(st);
      });

      // 🎨 Skin preview circle
      const skinData = SkinManager.getCurrentSkin();
      const skinPreviewG = this.add.graphics().setDepth(202);
      skinPreviewG.fillStyle(skinData.color, 1);
      skinPreviewG.fillCircle(cx + cardW/2 - 14, cardY - cardH/2 + 14, 6);
      skinPreviewG.lineStyle(1, skinData.outline, 1);
      skinPreviewG.strokeCircle(cx + cardW/2 - 14, cardY - cardH/2 + 14, 6);
      allElements.push(skinPreviewG);

      // Clickable area
      const hitArea = this.add.rectangle(cx, cardY, cardW, cardH, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
      allElements.push(hitArea);
      hitArea.on('pointerdown', () => { selectedClass = k; updateSelection(); });
    });

    updateSelection();

    // ═══ 난이도 선택 ═══
    const diffY = H * 0.68;
    const diffBtnW = Math.min(80, W * 0.2);
    const diffBtnH = 32;
    const diffGap = Math.min(10, W * 0.02);
    const diffTotalW = diffBtnW * 3 + diffGap * 2;
    const diffStartX = W/2 - diffTotalW/2 + diffBtnW/2;

    const diffLabel = this.add.text(W/2, diffY - 22, '난이도', {
      fontSize: '13px', fontFamily: 'monospace', color: '#8899aa'
    }).setOrigin(0.5).setDepth(201);
    allElements.push(diffLabel);

    const diffWarnTxt = this.add.text(W/2, diffY + diffBtnH/2 + 14, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#FF8800'
    }).setOrigin(0.5).setDepth(201);
    allElements.push(diffWarnTxt);

    const diffGfxArr = [];
    const diffTxtArr = [];

    const updateDiffSelection = () => {
      const dm = DIFFICULTY_MODES[selectedDifficulty];
      diffWarnTxt.setText(dm.warn);
      diffWarnTxt.setColor(dm.color);
      diffKeys.forEach((dk, di) => {
        const isSelected = dk === selectedDifficulty;
        const ddm = DIFFICULTY_MODES[dk];
        const dx = diffStartX + di * (diffBtnW + diffGap);
        const g = diffGfxArr[di];
        g.clear();
        g.fillStyle(isSelected ? ddm.colorHex : 0x1a1a2e, isSelected ? 0.9 : 0.6);
        g.fillRoundedRect(dx - diffBtnW/2, diffY - diffBtnH/2, diffBtnW, diffBtnH, 6);
        g.lineStyle(isSelected ? 2 : 1, ddm.colorHex, isSelected ? 1 : 0.4);
        g.strokeRoundedRect(dx - diffBtnW/2, diffY - diffBtnH/2, diffBtnW, diffBtnH, 6);
        diffTxtArr[di].setColor(isSelected ? '#ffffff' : '#888888');
      });
    };

    diffKeys.forEach((dk, di) => {
      const ddm = DIFFICULTY_MODES[dk];
      const dx = diffStartX + di * (diffBtnW + diffGap);
      const g = this.add.graphics().setDepth(201);
      allElements.push(g);
      diffGfxArr.push(g);
      const t = this.add.text(dx, diffY, ddm.name, {
        fontSize: '12px', fontFamily: 'monospace', color: '#888888', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(202);
      allElements.push(t);
      diffTxtArr.push(t);
      const hit = this.add.rectangle(dx, diffY, diffBtnW, diffBtnH, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
      allElements.push(hit);
      hit.on('pointerdown', () => { selectedDifficulty = dk; updateDiffSelection(); if (dk === 'hell') playHellSelect(); });
    });

    updateDiffSelection();

    // ═══ 고급 설정 (접기/펼치기) ═══
    let endlessMode = localStorage.getItem('whiteout_endless') === 'true';
    const rec = RecordManager.load();
    const ngPlusUnlocked = rec.wins > 0;
    let ngPlusMode = false;
    let bossRushMode = false;
    let advancedOpen = false;
    const advBtnY = diffY + diffBtnH/2 + 36;
    const advElements = []; // elements shown only when expanded

    // "⚙️ 고급 설정" toggle button
    const advToggleTxt = this.add.text(W/2, advBtnY, '⚙️ 고급 설정 ▼', {
      fontSize: '13px', fontFamily: 'monospace', color: '#8899bb'
    }).setOrigin(0.5).setDepth(202);
    allElements.push(advToggleTxt);
    const advToggleHit = this.add.rectangle(W/2, advBtnY, 200, 28, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
    allElements.push(advToggleHit);

    // Create advanced toggle elements (hidden initially)
    const endlessY = advBtnY + 30;
    const endlessGfx = this.add.graphics().setDepth(201);
    advElements.push(endlessGfx); allElements.push(endlessGfx);
    const endlessTxt = this.add.text(W/2 + 14, endlessY, '♾️ 무한 모드 (60분 이후 계속)', {
      fontSize: '12px', fontFamily: 'monospace', color: '#888899'
    }).setOrigin(0, 0.5).setDepth(202);
    advElements.push(endlessTxt); allElements.push(endlessTxt);

    const drawEndlessToggle = () => {
      endlessGfx.clear();
      const cbx = W/2 - 8, cby = endlessY - 8;
      endlessGfx.fillStyle(endlessMode ? 0x44BB44 : 0x333344, 0.9);
      endlessGfx.fillRoundedRect(cbx, cby, 16, 16, 3);
      endlessGfx.lineStyle(1, endlessMode ? 0x66DD66 : 0x555566, 1);
      endlessGfx.strokeRoundedRect(cbx, cby, 16, 16, 3);
      endlessTxt.setColor(endlessMode ? '#44FF44' : '#888899');
    };
    const endlessHit = this.add.rectangle(W/2 + 60, endlessY, 200, 24, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
    advElements.push(endlessHit); allElements.push(endlessHit);
    endlessHit.on('pointerdown', () => { endlessMode = !endlessMode; if (endlessMode) { speedrunMode = false; drawSpeedrunToggle(); } drawEndlessToggle(); });

    const ngPlusY = endlessY + 28;
    const ngPlusGfx = this.add.graphics().setDepth(201);
    advElements.push(ngPlusGfx); allElements.push(ngPlusGfx);
    const ngPlusLevel = rec.ngPlusClears || 0;
    const ngPlusLabel = ngPlusLevel > 0 ? `⭐ NG+ (Lv${ngPlusLevel + 1})` : '⭐ NEW GAME+';
    const ngPlusTxt = this.add.text(W/2 + 14, ngPlusY, ngPlusLabel + (ngPlusUnlocked ? '' : ' 🔒'), {
      fontSize: '12px', fontFamily: 'monospace', color: ngPlusUnlocked ? '#888899' : '#555566'
    }).setOrigin(0, 0.5).setDepth(202);
    advElements.push(ngPlusTxt); allElements.push(ngPlusTxt);

    const drawNgPlusToggle = () => {
      ngPlusGfx.clear();
      const cbx = W/2 - 8, cby = ngPlusY - 8;
      if (!ngPlusUnlocked) {
        ngPlusGfx.fillStyle(0x222233, 0.5); ngPlusGfx.fillRoundedRect(cbx, cby, 16, 16, 3);
        ngPlusGfx.lineStyle(1, 0x333344, 0.5); ngPlusGfx.strokeRoundedRect(cbx, cby, 16, 16, 3);
      } else {
        ngPlusGfx.fillStyle(ngPlusMode ? 0xFFD700 : 0x333344, 0.9); ngPlusGfx.fillRoundedRect(cbx, cby, 16, 16, 3);
        ngPlusGfx.lineStyle(1, ngPlusMode ? 0xFFAA00 : 0x555566, 1); ngPlusGfx.strokeRoundedRect(cbx, cby, 16, 16, 3);
        ngPlusTxt.setColor(ngPlusMode ? '#FFD700' : '#888899');
      }
    };
    if (ngPlusUnlocked) {
      const ngPlusHit = this.add.rectangle(W/2 + 60, ngPlusY, 200, 24, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
      advElements.push(ngPlusHit); allElements.push(ngPlusHit);
      ngPlusHit.on('pointerdown', () => { ngPlusMode = !ngPlusMode; drawNgPlusToggle(); });
    }

    const bossRushY = ngPlusY + 28;
    const bossRushGfx = this.add.graphics().setDepth(201);
    advElements.push(bossRushGfx); allElements.push(bossRushGfx);
    const bossRushTxt = this.add.text(W/2 + 14, bossRushY, '🔴 보스 러시', {
      fontSize: '12px', fontFamily: 'monospace', color: '#888899'
    }).setOrigin(0, 0.5).setDepth(202);
    advElements.push(bossRushTxt); allElements.push(bossRushTxt);
    const drawBossRushToggle = () => {
      bossRushGfx.clear();
      const cbx = W/2 - 8, cby = bossRushY - 8;
      bossRushGfx.fillStyle(bossRushMode ? 0xFF4444 : 0x333344, 0.9); bossRushGfx.fillRoundedRect(cbx, cby, 16, 16, 3);
      bossRushGfx.lineStyle(1, bossRushMode ? 0xFF6666 : 0x555566, 1); bossRushGfx.strokeRoundedRect(cbx, cby, 16, 16, 3);
      bossRushTxt.setColor(bossRushMode ? '#FF6666' : '#888899');
    };
    const bossRushHit = this.add.rectangle(W/2 + 60, bossRushY, 200, 24, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
    advElements.push(bossRushHit); allElements.push(bossRushHit);
    bossRushHit.on('pointerdown', () => { bossRushMode = !bossRushMode; drawBossRushToggle(); });

    // ═══ Speedrun Toggle ═══
    let speedrunMode = false;
    const speedrunY = bossRushY + 28;
    const speedrunGfx = this.add.graphics().setDepth(201);
    advElements.push(speedrunGfx); allElements.push(speedrunGfx);
    const speedrunTxt = this.add.text(W/2 + 14, speedrunY, '⚡ 스피드런 (30분 클리어)', {
      fontSize: '12px', fontFamily: 'monospace', color: '#888899'
    }).setOrigin(0, 0.5).setDepth(202);
    advElements.push(speedrunTxt); allElements.push(speedrunTxt);
    const drawSpeedrunToggle = () => {
      speedrunGfx.clear();
      const cbx = W/2 - 8, cby = speedrunY - 8;
      speedrunGfx.fillStyle(speedrunMode ? 0xFFAA00 : 0x333344, 0.9); speedrunGfx.fillRoundedRect(cbx, cby, 16, 16, 3);
      speedrunGfx.lineStyle(1, speedrunMode ? 0xFFCC44 : 0x555566, 1); speedrunGfx.strokeRoundedRect(cbx, cby, 16, 16, 3);
      speedrunTxt.setColor(speedrunMode ? '#FFCC44' : '#888899');
    };
    const speedrunHit = this.add.rectangle(W/2 + 60, speedrunY, 200, 24, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
    advElements.push(speedrunHit); allElements.push(speedrunHit);
    speedrunHit.on('pointerdown', () => { speedrunMode = !speedrunMode; if (speedrunMode) { endlessMode = false; drawEndlessToggle(); } drawSpeedrunToggle(); });

    // ═══ Handicap Dropdown ═══
    const handicapOptions = ['none', 'glass_body', 'no_equipment', 'random_build', 'low_vision'];
    const handicapLabels = ['핸디캡 없음', '🩸 유리몸', '💪 맨손', '🎲 랜덤 빌드', '👁️ 저시력'];
    let handicapIdx = 0;
    const handicapY = speedrunY + 28;
    const handicapTxt = this.add.text(W/2 + 14, handicapY, '🎯 ' + handicapLabels[0], {
      fontSize: '12px', fontFamily: 'monospace', color: '#888899'
    }).setOrigin(0, 0.5).setDepth(202);
    advElements.push(handicapTxt); allElements.push(handicapTxt);
    const handicapGfx = this.add.graphics().setDepth(201);
    advElements.push(handicapGfx); allElements.push(handicapGfx);
    const drawHandicapToggle = () => {
      handicapGfx.clear();
      const cbx = W/2 - 8, cby = handicapY - 8;
      const active = handicapIdx > 0;
      handicapGfx.fillStyle(active ? 0xCC44CC : 0x333344, 0.9); handicapGfx.fillRoundedRect(cbx, cby, 16, 16, 3);
      handicapGfx.lineStyle(1, active ? 0xEE66EE : 0x555566, 1); handicapGfx.strokeRoundedRect(cbx, cby, 16, 16, 3);
      handicapTxt.setText('🎯 ' + handicapLabels[handicapIdx]);
      handicapTxt.setColor(active ? '#EE66EE' : '#888899');
    };
    const handicapHit = this.add.rectangle(W/2 + 60, handicapY, 200, 24, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
    advElements.push(handicapHit); allElements.push(handicapHit);
    handicapHit.on('pointerdown', () => { handicapIdx = (handicapIdx + 1) % handicapOptions.length; drawHandicapToggle(); });

    // Initially hide advanced elements
    const toggleAdvanced = () => {
      advancedOpen = !advancedOpen;
      advToggleTxt.setText(advancedOpen ? '⚙️ 고급 설정 ▲' : '⚙️ 고급 설정 ▼');
      advElements.forEach(el => el.setVisible(advancedOpen));
      if (advancedOpen) { drawEndlessToggle(); drawNgPlusToggle(); drawBossRushToggle(); drawSpeedrunToggle(); drawHandicapToggle(); }
    };
    advElements.forEach(el => el.setVisible(false));
    advToggleHit.on('pointerdown', toggleAdvanced);

    // Confirm button
    const btnW2 = Math.min(200, W * 0.4);
    const btnH2 = 44;
    const btnY2 = H * 0.88;
    const btnBg = this.add.graphics().setDepth(201);
    btnBg.fillStyle(0x2255aa, 0.9); btnBg.fillRoundedRect(W/2 - btnW2/2, btnY2 - btnH2/2, btnW2, btnH2, 8);
    btnBg.lineStyle(2, 0x4488ff, 0.8); btnBg.strokeRoundedRect(W/2 - btnW2/2, btnY2 - btnH2/2, btnW2, btnH2, 8);
    allElements.push(btnBg);
    const btnTxt = this.add.text(W/2, btnY2, '▶ 선택', {
      fontSize:'18px', fontFamily:'monospace', color:'#ffffff', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(202);
    allElements.push(btnTxt);
    const btnHit = this.add.rectangle(W/2, btnY2, btnW2, btnH2, 0, 0).setInteractive({ useHandCursor: true }).setDepth(203);
    allElements.push(btnHit);
    btnHit.on('pointerdown', () => {
      try { localStorage.setItem('whiteout_class', selectedClass); } catch(e) {}
      try { localStorage.setItem('whiteout_difficulty', selectedDifficulty); } catch(e) {}
      try { localStorage.setItem('whiteout_endless', endlessMode ? 'true' : 'false'); } catch(e) {}
      destroy();
      this.scene.start('Boot', { loadSave: false, playerClass: selectedClass, difficulty: selectedDifficulty, endlessMode, ngPlus: ngPlusMode, bossRush: bossRushMode, speedrun: speedrunMode, handicap: handicapOptions[handicapIdx] });
    });

    // FTUE bottom hint
    const hintBottom = this.add.text(W/2, btnY2 + btnH2/2 + 16, '💡 처음이라면 🪓 전사를 추천합니다', {
      fontSize: '11px', fontFamily: 'monospace', color: '#667788'
    }).setOrigin(0.5).setDepth(201);
    allElements.push(hintBottom);

    // Cancel / back
    const backTxt = this.add.text(W*0.05, H*0.05, '← 뒤로', {
      fontSize:'14px', fontFamily:'monospace', color:'#8899aa'
    }).setDepth(202).setInteractive({ useHandCursor: true });
    allElements.push(backTxt);
    backTxt.on('pointerdown', () => destroy());
  }

  _showMetaUpgradeUI(activeTab) {
    const W = this.scale.width;
    const H = this.scale.height;
    const allElements = [];
    const destroy = () => allElements.forEach(o => { try { o.destroy(); } catch(e) {} });

    // Overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setInteractive().setDepth(100);
    allElements.push(overlay);

    // Panel
    const panel = this.add.graphics().setDepth(101);
    const pw = Math.min(420, W * 0.9);
    const ph = Math.min(560, H * 0.88);
    const px0 = W / 2 - pw / 2, py0 = H / 2 - ph / 2;
    panel.fillStyle(0x0A0E1A, 0.98);
    panel.fillRoundedRect(px0, py0, pw, ph, 14);
    panel.lineStyle(2, 0xaa44aa, 0.6);
    panel.strokeRoundedRect(px0, py0, pw, ph, 14);
    allElements.push(panel);

    // Title
    allElements.push(this.add.text(W / 2, py0 + 24, '🔮 영구 강화', {
      fontSize: '22px', fontFamily: 'monospace', color: '#ddaaff', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(102));

    // Points display - big
    const available = MetaManager.getAvailablePoints();
    const meta = MetaManager.load();
    allElements.push(this.add.text(W / 2, py0 + 52, `💎 ${available} 포인트`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(102));

    // Tabs
    const tabs = [
      { id: 'attack', label: '⚔️ 공격', color: 0xFF4444 },
      { id: 'defense', label: '🛡️ 방어', color: 0x4488FF },
      { id: 'util', label: '🔧 유틸', color: 0x44FF88 },
      { id: 'equip', label: '🎒 장비', color: 0xFFAA44 }
    ];
    const currentTab = activeTab || 'attack';
    const tabW = (pw - 20) / tabs.length;
    const tabY = py0 + 76;
    tabs.forEach((tab, i) => {
      const tx = px0 + 10 + i * tabW;
      const isActive = tab.id === currentTab;
      const tg = this.add.graphics().setDepth(102);
      tg.fillStyle(isActive ? tab.color : 0x1a1a2e, isActive ? 0.9 : 0.5);
      tg.fillRoundedRect(tx, tabY, tabW - 4, 28, { tl: 6, tr: 6, bl: 0, br: 0 });
      if (isActive) { tg.lineStyle(1, tab.color, 0.8); tg.strokeRoundedRect(tx, tabY, tabW - 4, 28, { tl: 6, tr: 6, bl: 0, br: 0 }); }
      allElements.push(tg);
      allElements.push(this.add.text(tx + (tabW - 4) / 2, tabY + 14, tab.label, {
        fontSize: '12px', fontFamily: 'monospace', color: isActive ? '#fff' : '#889'
      }).setOrigin(0.5).setDepth(103));
      const tabHit = this.add.rectangle(tx + (tabW - 4) / 2, tabY + 14, tabW - 4, 28, 0, 0).setInteractive({ useHandCursor: true }).setDepth(104);
      tabHit.on('pointerdown', () => { destroy(); this._showMetaUpgradeUI(tab.id); });
      allElements.push(tabHit);
    });

    // Upgrade definitions per tab
    const allUpgrades = {
      attack: [
        { key: 'startHP', name: '❤️ 시작 체력', desc: 'Lv당 +20 HP', max: 5, icon: '❤️' },
        { key: 'extraCard', name: '🎴 카드 선택지', desc: 'Lv당 +1 선택지', max: 3, icon: '🎴' },
      ],
      defense: [
        { key: 'startTempResist', name: '🧥 체온 저항', desc: 'Lv당 +5% 저항', max: 5, icon: '🧥' },
      ],
      util: [
        { key: 'startWood', name: '🪵 시작 나무', desc: 'Lv당 +3 나무', max: 5, icon: '🪵' },
        { key: 'revival_scroll', name: '💫 부활 주문서', desc: '게임 오버 시 1회 부활', max: 1, icon: '💫' },
      ],
      equip: []
    };
    const upgrades = allUpgrades[currentTab] || [];
    const cardW = pw - 40;
    const cardH = 72;
    let yPos = tabY + 38;
    const RARITY_COLORS = { common: 0x888888, rare: 0x4488FF, epic: 0xAA44FF, legendary: 0xFFAA00 };

    if (upgrades.length === 0) {
      allElements.push(this.add.text(W / 2, yPos + 60, '🚧 준비 중...', {
        fontSize: '16px', fontFamily: 'monospace', color: '#667788'
      }).setOrigin(0.5).setDepth(103));
    }

    upgrades.forEach(upg => {
      const level = meta.upgrades[upg.key] || 0;
      const cost = MetaManager.getUpgradeCost(upg.key, level);
      const canBuy = available >= cost && level < upg.max;
      const maxed = level >= upg.max;

      // Card background
      const cg = this.add.graphics().setDepth(102);
      const borderColor = maxed ? 0xFFD700 : (canBuy ? 0xaa44aa : 0x333344);
      cg.fillStyle(canBuy ? 0x151928 : 0x0D1018, 0.95);
      cg.fillRoundedRect(px0 + 20, yPos, cardW, cardH, 8);
      cg.lineStyle(maxed ? 2 : 1, borderColor, maxed ? 1 : 0.5);
      cg.strokeRoundedRect(px0 + 20, yPos, cardW, cardH, 8);
      allElements.push(cg);

      // Icon
      allElements.push(this.add.text(px0 + 38, yPos + cardH / 2, upg.icon, {
        fontSize: '24px'
      }).setOrigin(0.5).setDepth(103));

      // Name + Level
      const nameColor = maxed ? '#FFD700' : '#ccddee';
      allElements.push(this.add.text(px0 + 58, yPos + 10, upg.name, {
        fontSize: '13px', fontFamily: 'monospace', color: nameColor, fontStyle: 'bold'
      }).setOrigin(0, 0).setDepth(103));

      // Level progress bar
      const barX = px0 + 58, barY = yPos + 28, barW = cardW - 120, barH = 8;
      const pg = this.add.graphics().setDepth(103);
      pg.fillStyle(0x222233, 0.8); pg.fillRoundedRect(barX, barY, barW, barH, 4);
      const fillW = upg.max > 0 ? (barW * level / upg.max) : 0;
      pg.fillStyle(maxed ? 0xFFD700 : 0xaa44aa, 0.9); pg.fillRoundedRect(barX, barY, fillW, barH, 4);
      allElements.push(pg);
      allElements.push(this.add.text(barX + barW + 4, barY - 1, maxed ? 'MAX' : `${level}/${upg.max}`, {
        fontSize: '10px', fontFamily: 'monospace', color: maxed ? '#FFD700' : '#8899aa'
      }).setOrigin(0, 0).setDepth(103));

      // Description
      allElements.push(this.add.text(px0 + 58, yPos + 42, upg.desc, {
        fontSize: '10px', fontFamily: 'monospace', color: '#667788'
      }).setOrigin(0, 0).setDepth(103));

      // Cost + Buy button
      if (!maxed) {
        allElements.push(this.add.text(px0 + cardW - 10, yPos + 12, `${cost}💎`, {
          fontSize: '11px', fontFamily: 'monospace', color: canBuy ? '#FFD700' : '#ff5555'
        }).setOrigin(1, 0).setDepth(103));
        const btnX = px0 + cardW - 10, btnY2 = yPos + 38;
        const bg2 = this.add.graphics().setDepth(103);
        bg2.fillStyle(canBuy ? 0xaa44aa : 0x333344, 0.9);
        bg2.fillRoundedRect(btnX - 52, btnY2, 56, 22, 4);
        allElements.push(bg2);
        allElements.push(this.add.text(btnX - 24, btnY2 + 11, canBuy ? '강화' : '부족', {
          fontSize: '11px', fontFamily: 'monospace', color: canBuy ? '#fff' : '#666'
        }).setOrigin(0.5).setDepth(104));
        if (canBuy) {
          const hit = this.add.rectangle(btnX - 24, btnY2 + 11, 56, 22, 0, 0).setInteractive({ useHandCursor: true }).setDepth(105);
          hit.on('pointerdown', () => { if (MetaManager.doUpgrade(upg.key)) { destroy(); this._showMetaUpgradeUI(currentTab); } });
          allElements.push(hit);
        }
      } else {
        allElements.push(this.add.text(px0 + cardW - 10, yPos + cardH / 2, '✅ MAX', {
          fontSize: '14px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(1, 0.5).setDepth(103));
      }

      yPos += cardH + 8;
    });

    // Stats
    const statsY = H / 2 + ph / 2 - 70;
    allElements.push(this.add.text(W / 2, statsY, `🏆 최고: ${Math.floor(meta.bestTime/60)}분${Math.floor(meta.bestTime%60)}초 | 🎮 ${meta.totalRuns}회`, {
      fontSize: '11px', fontFamily: 'monospace', color: '#667788'
    }).setOrigin(0.5).setDepth(103));

    // Close button
    const closeBg = this.add.graphics().setDepth(102);
    closeBg.fillStyle(0x334455, 0.9);
    closeBg.fillRoundedRect(W / 2 - 50, H / 2 + ph / 2 - 46, 100, 34, 6);
    allElements.push(closeBg);
    allElements.push(this.add.text(W / 2, H / 2 + ph / 2 - 29, '닫기', {
      fontSize: '14px', fontFamily: 'monospace', color: '#aabbcc'
    }).setOrigin(0.5).setDepth(103));
    const closeHit = this.add.rectangle(W / 2, H / 2 + ph / 2 - 29, 100, 34, 0, 0).setInteractive({ useHandCursor: true }).setDepth(104);
    closeHit.on('pointerdown', destroy);
    allElements.push(closeHit);
  }
  
  // ═══════════════════════════════════════════════════════════════════
  // 📖 도감 (컬렉션) 화면
  // ═══════════════════════════════════════════════════════════════════
  _showCollectionScreen() {
    const W = this.scale.width, H = this.scale.height;
    const container = [];
    let activeTab = 'achievements';

    // Overlay
    const ov = this.add.graphics().setDepth(300);
    ov.fillStyle(0x000000, 0.75); ov.fillRect(0, 0, W, H);
    container.push(ov);
    const ovHit = this.add.rectangle(W/2, H/2, W, H).setDepth(300).setOrigin(0.5).setInteractive().setAlpha(0.001);
    container.push(ovHit);

    // Panel
    const pw = Math.min(360, W - 20), ph = Math.min(520, H - 40);
    const px = W/2 - pw/2, py = H/2 - ph/2;
    const panel = this.add.graphics().setDepth(301);
    panel.fillStyle(0x0E1225, 0.97);
    panel.fillRoundedRect(px, py, pw, ph, 16);
    panel.lineStyle(2, 0x4466aa, 0.6);
    panel.strokeRoundedRect(px, py, pw, ph, 16);
    container.push(panel);

    // Title
    const titleT = this.add.text(W/2, py + 24, '📖 도감', {
      fontSize: '22px', fontFamily: 'monospace', color: '#e0e8ff',
      stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(302);
    container.push(titleT);

    // Tab buttons
    const tabs = [
      { id: 'achievements', label: '🏆 성취' },
      { id: 'equipment', label: '📦 장비' },
      { id: 'quests', label: '📊 퀘스트' },
      { id: 'runhistory', label: '📜 런 기록' }
    ];
    const tabW = (pw - 30) / 4;
    const tabY = py + 52;
    const tabBtns = [];

    // Content area
    const contentY = tabY + 36;
    const contentH = ph - 130;
    let contentItems = [];

    const clearContent = () => { contentItems.forEach(el => el.destroy()); contentItems = []; };

    const renderTabs = () => {
      tabBtns.forEach(t => t.destroy());
      tabBtns.length = 0;
      tabs.forEach((tab, i) => {
        const tx = px + 15 + i * tabW + tabW/2;
        const isActive = activeTab === tab.id;
        const bg = this.add.graphics().setDepth(302);
        bg.fillStyle(isActive ? 0x2244aa : 0x1A1E2E, 0.9);
        bg.fillRoundedRect(tx - tabW/2, tabY, tabW - 4, 30, 6);
        tabBtns.push(bg);
        const lbl = this.add.text(tx, tabY + 15, tab.label, {
          fontSize: '12px', fontFamily: 'monospace', color: isActive ? '#ffffff' : '#667788',
          stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5).setDepth(303).setInteractive({ useHandCursor: true });
        lbl.on('pointerdown', () => { activeTab = tab.id; renderTabs(); renderContent(); });
        tabBtns.push(lbl);
      });
    };

    const SLOT_ICONS = { weapon: '⚔️', armor: '🛡️', boots: '👟', helmet: '🎩', ring: '💍' };
    const SLOT_NAMES = { weapon: '무기', armor: '방어구', boots: '장화', helmet: '모자', ring: '반지' };
    const HIDDEN_IDS = ['secret_hidden_boss', 'secret_konami', 'secret_survive_zone'];
    const ACH_CATEGORIES = [
      { key: 'basic', label: '🏅 기본 성취', filter: (a) => !a.hidden && !a.category },
      { key: 'class', label: '🏆 클래스 마스터리', filter: (a) => a.category === 'class' },
      { key: 'challenge', label: '🎯 도전 모드', filter: (a) => a.category === 'challenge' },
      { key: 'collect', label: '🗺️ 탐험/수집', filter: (a) => a.category === 'collect' },
      { key: 'hidden', label: '🔒 히든 성취', filter: (a) => a.hidden },
    ];

    const renderContent = () => {
      clearContent();
      const leftX = px + 16;
      const textW = pw - 32;
      let cy = contentY + 8;

      if (activeTab === 'achievements') {
        // Load achievements
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem('achievements_whiteout') || '{}'); } catch(e) {}
        const achCount = Object.keys(saved).length;
        const total = ACHIEVEMENTS.length;
        const pct = total > 0 ? Math.round(achCount / total * 100) : 0;

        const header = this.add.text(W/2, cy, `달성: ${achCount} / ${total} (${pct}%)`, {
          fontSize: '14px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(303);
        contentItems.push(header);
        cy += 26;

        // Progress bar
        const barW = pw - 60, barH = 8;
        const barG = this.add.graphics().setDepth(303);
        barG.fillStyle(0x222244, 1); barG.fillRoundedRect(W/2 - barW/2, cy, barW, barH, 4);
        barG.fillStyle(0x44AA44, 1); barG.fillRoundedRect(W/2 - barW/2, cy, barW * (achCount/total), barH, 4);
        contentItems.push(barG);
        cy += 20;

        for (const cat of ACH_CATEGORIES) {
          const catAchs = ACHIEVEMENTS.filter(cat.filter);
          const catDone = catAchs.filter(a => saved[a.id]).length;
          const catHeader = this.add.text(leftX, cy, `${cat.label} (${catDone}/${catAchs.length})`, {
            fontSize: '12px', fontFamily: 'monospace', color: '#AABBDD', stroke: '#000', strokeThickness: 1
          }).setDepth(303);
          contentItems.push(catHeader);
          cy += 18;

          for (const ach of catAchs) {
            const isHidden = HIDDEN_IDS.includes(ach.id);
            const achieved = !!saved[ach.id];
            let line, color;
            if (achieved) {
              line = `  ${ach.icon} ${ach.name}  ${ach.desc}  ✅`;
              color = '#88DDAA';
            } else if (isHidden) {
              line = `  🔒 ???  비밀 성취  🔒`;
              color = '#445566';
            } else {
              line = `  ${ach.icon} ${ach.name}  ${ach.desc}  ⬜`;
              color = '#667788';
            }
            const t = this.add.text(leftX, cy, line, {
              fontSize: '11px', fontFamily: 'monospace', color, wordWrap: { width: textW }
            }).setDepth(303);
            contentItems.push(t);
            cy += 20;
            if (cy > contentY + contentH - 10) break;
          }
          cy += 6;
          if (cy > contentY + contentH - 10) break;
        }
      } else if (activeTab === 'equipment') {
        const disc = EquipmentManager.loadDiscovered();
        // Also scan current equipment manager data from localStorage
        let currentSlots = {};
        try {
          const eqRaw = localStorage.getItem(EquipmentManager.STORAGE_KEY);
          if (eqRaw) { const eqData = JSON.parse(eqRaw); Object.keys(SLOT_ICONS).forEach(s => { if (eqData[s]) currentSlots[s] = eqData[s].itemId; }); }
        } catch(e) {}

        for (const slot of Object.keys(EQUIPMENT_TABLE)) {
          const items = EQUIPMENT_TABLE[slot];
          const found = disc[slot] || [];
          const icon = SLOT_ICONS[slot] || '';
          const name = SLOT_NAMES[slot] || slot;

          const headerT = this.add.text(leftX, cy, `${icon} ${name} (${found.length}/${items.length})`, {
            fontSize: '13px', fontFamily: 'monospace', color: '#AABBDD', stroke: '#000', strokeThickness: 1
          }).setDepth(303);
          contentItems.push(headerT);
          cy += 18;

          let itemLine = '';
          for (const item of items) {
            if (found.includes(item.id)) {
              const isEquipped = currentSlots[slot] === item.id;
              itemLine += `${isEquipped ? '★' : ''}${item.icon}${item.name}  `;
            } else {
              itemLine += '???  ';
            }
          }
          const itemT = this.add.text(leftX + 8, cy, itemLine.trim(), {
            fontSize: '11px', fontFamily: 'monospace', color: '#8899AA', wordWrap: { width: textW - 16 }
          }).setDepth(303);
          contentItems.push(itemT);
          cy += Math.max(20, itemT.height + 6);
          if (cy > contentY + contentH - 10) break;
        }

        // Total count
        let totalFound = 0, totalAll = 0;
        for (const slot of Object.keys(EQUIPMENT_TABLE)) {
          totalAll += EQUIPMENT_TABLE[slot].length;
          totalFound += (disc[slot] || []).length;
        }
        if (cy < contentY + contentH - 20) {
          const sumT = this.add.text(W/2, cy + 8, `전체: ${totalFound} / ${totalAll} 발견`, {
            fontSize: '12px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 1
          }).setOrigin(0.5).setDepth(303);
          contentItems.push(sumT);
        }
      } else if (activeTab === 'quests') {
        const rec = RecordManager.load();
        const totalCompleted = rec.totalQuestsCompleted || 0;

        // Show all quests with status
        const headerT = this.add.text(W/2, cy, '퀘스트 목록', {
          fontSize: '14px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(303);
        contentItems.push(headerT);
        cy += 26;

        for (let i = 0; i < QUESTS.length; i++) {
          const q = QUESTS[i];
          const icon = i < totalCompleted ? '✅' : (i === totalCompleted ? '▶' : '□');
          const color = i < totalCompleted ? '#88DDAA' : (i === totalCompleted ? '#FFFFFF' : '#556677');
          const line = `${icon} ${q.name}  ${q.desc}`;
          const t = this.add.text(leftX, cy, line, {
            fontSize: '11px', fontFamily: 'monospace', color, wordWrap: { width: textW }
          }).setDepth(303);
          contentItems.push(t);
          cy += 20;
          if (cy > contentY + contentH - 40) break;
        }

        // Summary
        cy = Math.max(cy, contentY + contentH - 30);
        const sumT = this.add.text(W/2, cy, `전체 퀘스트 완료 누계: ${totalCompleted}회`, {
          fontSize: '12px', fontFamily: 'monospace', color: '#AABB88', stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5).setDepth(303);
        contentItems.push(sumT);
      } else if (activeTab === 'runhistory') {
        // ═══ 📜 런 기록 탭 ═══
        const rhm = new RunHistoryManager();
        const runs = rhm.runs;
        const CLASS_ICONS = {};
        Object.entries(PLAYER_CLASSES).forEach(([k,v]) => { CLASS_ICONS[k] = v.icon + ' ' + v.name; });
        const DIFF_NAMES = { normal: '일반', hard: '하드', hell: '지옥' };
        const GRADE_ICONS = { common: '⬜', rare: '🟦', epic: '🟪', legendary: '🟨', unique: '🟧' };

        // 🌟 베스트 런 하이라이트
        if (runs.length > 0) {
          const best = rhm.getBest();
          const bestHeaderT = this.add.text(W/2, cy, '🌟 내 베스트 런', {
            fontSize: '13px', fontFamily: 'monospace', color: '#FFD700', stroke: '#000', strokeThickness: 2, fontStyle: 'bold'
          }).setOrigin(0.5).setDepth(303);
          contentItems.push(bestHeaderT);
          cy += 20;

          const bestCards = [
            { label: '⏱️최장생존', run: best.longestSurvival, val: RunHistoryManager.formatTime(best.longestSurvival.survivalTime) },
            { label: '⚔️최다킬', run: best.mostKills, val: best.mostKills.kills + '킬' },
            { label: '⭐최고레벨', run: best.highestLevel, val: 'Lv.' + best.highestLevel.level },
          ];
          const cardW2 = (pw - 40) / 3;
          bestCards.forEach((bc, ci) => {
            const bx = px + 15 + ci * (cardW2 + 5);
            const bg2 = this.add.graphics().setDepth(302);
            bg2.fillStyle(0x1A2244, 0.9); bg2.fillRoundedRect(bx, cy, cardW2, 36, 4);
            bg2.lineStyle(1, 0xFFD700, 0.3); bg2.strokeRoundedRect(bx, cy, cardW2, 36, 4);
            contentItems.push(bg2);
            const t1 = this.add.text(bx + cardW2/2, cy + 10, bc.label, {
              fontSize: '9px', fontFamily: 'monospace', color: '#AABBCC', stroke: '#000', strokeThickness: 1
            }).setOrigin(0.5).setDepth(303);
            contentItems.push(t1);
            const t2 = this.add.text(bx + cardW2/2, cy + 26, bc.val, {
              fontSize: '10px', fontFamily: 'monospace', color: '#FFFFFF', stroke: '#000', strokeThickness: 1, fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(303);
            contentItems.push(t2);
          });
          cy += 44;
        }

        // 런 목록
        const listHeaderT = this.add.text(W/2, cy, `📜 런 기록 (최근 ${runs.length}회)`, {
          fontSize: '12px', fontFamily: 'monospace', color: '#AADDFF', stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5).setDepth(303);
        contentItems.push(listHeaderT);
        cy += 20;

        if (runs.length === 0) {
          const emptyT = this.add.text(W/2, cy + 30, '아직 기록이 없습니다\n게임을 플레이해보세요!', {
            fontSize: '12px', fontFamily: 'monospace', color: '#556677', align: 'center'
          }).setOrigin(0.5).setDepth(303);
          contentItems.push(emptyT);
        }

        // Scrollable run entries
        let expandedIdx = -1;
        const renderRuns = () => {
          // Clear only run items (keep headers)
          const runItemStart = contentItems.length;
          let ry = cy;
          runs.forEach((run, idx) => {
            if (ry > contentY + contentH - 20) return;
            const isExpanded = expandedIdx === idx;
            const classLabel = CLASS_ICONS[run.playerClass] || run.playerClass;
            const diffLabel = DIFF_NAMES[run.difficulty] || run.difficulty;
            const timeStr = RunHistoryManager.formatTime(run.survivalTime);
            const resultIcon = run.isWin ? '✅' : '❌';
            const resultStr = run.isWin ? '클리어 🏆' : '실패';

            // Run card background
            const cardH2 = isExpanded ? 80 : 36;
            const rbg = this.add.graphics().setDepth(302);
            rbg.fillStyle(run.isWin ? 0x1A2A1A : 0x1A1A2A, 0.9);
            rbg.fillRoundedRect(leftX, ry, textW, cardH2, 4);
            rbg.lineStyle(1, run.isWin ? 0xFFD700 : 0x444466, 0.5);
            rbg.strokeRoundedRect(leftX, ry, textW, cardH2, 4);
            contentItems.push(rbg);

            // Main line
            const mainLine = `#${idx+1} ${classLabel} | ${diffLabel} | ${timeStr}`;
            const mt = this.add.text(leftX + 6, ry + 4, mainLine, {
              fontSize: '10px', fontFamily: 'monospace', color: '#DDDDEE', stroke: '#000', strokeThickness: 1
            }).setDepth(303);
            contentItems.push(mt);

            // Stats line
            const statsLine2 = `킬 ${run.kills} | Lv.${run.level} | 콤보 ${run.maxCombo} | ${resultIcon} ${resultStr}`;
            const st = this.add.text(leftX + 6, ry + 18, statsLine2, {
              fontSize: '9px', fontFamily: 'monospace', color: '#8899AA', stroke: '#000', strokeThickness: 1
            }).setDepth(303);
            contentItems.push(st);

            // Expanded details
            if (isExpanded) {
              // Equipment
              const eqParts = [];
              for (const [slot, item] of Object.entries(run.equippedItems || {})) {
                if (item) eqParts.push((GRADE_ICONS[item.grade] || '') + (SLOT_ICONS[slot] || slot));
              }
              const eqStr = eqParts.length > 0 ? '장비: ' + eqParts.join(' ') : '장비: 없음';

              // Synergies
              const synStr = (run.synergiesActivated || []).length > 0
                ? '시너지: ' + run.synergiesActivated.map(s => { const found = typeof SKILL_SYNERGIES !== 'undefined' ? SKILL_SYNERGIES.find(ss => ss.id === s) : null; return found ? found.name : s; }).join(', ')
                : '';

              // Top upgrades
              const upCounts = {};
              (run.upgrades || []).forEach(k => { upCounts[k] = (upCounts[k] || 0) + 1; });
              const topUp = Object.entries(upCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);
              const upStr = topUp.map(([k,c]) => { const u = UPGRADES[k]; return u ? `${u.icon}${c > 1 ? 'x'+c : ''}` : k; }).join(' ');

              let detailStr = eqStr;
              if (synStr) detailStr += '\n' + synStr;
              if (upStr) detailStr += '\n빌드: ' + upStr;

              const dt2 = this.add.text(leftX + 6, ry + 32, detailStr, {
                fontSize: '9px', fontFamily: 'monospace', color: '#7788AA', stroke: '#000', strokeThickness: 1,
                wordWrap: { width: textW - 12 }, lineSpacing: 3
              }).setDepth(303);
              contentItems.push(dt2);
            }

            // Click to expand/collapse
            const hitArea = this.add.rectangle(leftX + textW/2, ry + cardH2/2, textW, cardH2)
              .setDepth(304).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0.001);
            hitArea.on('pointerdown', () => {
              expandedIdx = expandedIdx === idx ? -1 : idx;
              // Re-render content
              clearContent();
              renderContent();
            });
            contentItems.push(hitArea);

            ry += cardH2 + 4;
          });
        };
        renderRuns();
      }
    };

    // Close button
    const closeBtn = this.add.text(W/2, py + ph - 28, '✕ 닫기', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aabbcc',
      stroke: '#000', strokeThickness: 2, backgroundColor: '#2A2E3E',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setDepth(303).setInteractive({ useHandCursor: true });
    container.push(closeBtn);

    const cleanup = () => { clearContent(); tabBtns.forEach(t => t.destroy()); container.forEach(el => el.destroy()); };
    closeBtn.on('pointerdown', cleanup);
    ovHit.on('pointerdown', cleanup);

    renderTabs();
    renderContent();
  }

  _showStatsPopup() {
    const W = this.scale.width, H = this.scale.height;
    const rec = RecordManager.load();
    const container = [];

    // Overlay
    const ov = this.add.graphics().setDepth(200);
    ov.fillStyle(0x000000, 0.7); ov.fillRect(0, 0, W, H);
    container.push(ov);
    const ovHit = this.add.rectangle(W/2, H/2, W, H).setDepth(200).setOrigin(0.5).setInteractive().setAlpha(0.001);
    container.push(ovHit);

    // Panel
    const pw = Math.min(320, W - 40), ph = 380;
    const panel = this.add.graphics().setDepth(201);
    panel.fillStyle(0x1A1E2E, 0.95);
    panel.fillRoundedRect(W/2 - pw/2, H/2 - ph/2, pw, ph, 16);
    panel.lineStyle(2, 0x4466aa, 0.6);
    panel.strokeRoundedRect(W/2 - pw/2, H/2 - ph/2, pw, ph, 16);
    container.push(panel);

    // Title
    const title = this.add.text(W/2, H/2 - ph/2 + 30, '📊 나의 기록', {
      fontSize: '22px', fontFamily: 'monospace', color: '#e0e8ff',
      stroke: '#000', strokeThickness: 3, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(202);
    container.push(title);

    // Stats content
    const bestTime = RecordManager.formatTime(rec.bestSurvivalTime);
    const totalTime = RecordManager.formatTime(rec.totalPlayTime);
    const totalAch = ACHIEVEMENTS ? ACHIEVEMENTS.length : 10;
    const lines = [
      `⏱️ 최장 생존:      ${bestTime}`,
      `☠️ 최다 킬:        ${rec.bestKills.toLocaleString()}마리`,
      `⭐ 최고 레벨:       ${rec.bestLevel}`,
      `🔥 최대 콤보:       ${rec.bestCombo}킬`,
      `─────────────────────`,
      `🎮 총 플레이:       ${rec.totalPlays}회`,
      `💀 누적 킬:         ${rec.totalKills.toLocaleString()}마리`,
      `⏰ 총 플레이 시간:  ${totalTime}`,
      `🏆 60분 클리어:     ${rec.wins}회`,
      (rec.ngPlusClears || 0) > 0 ? `⭐ NG+ 달성:        ${rec.ngPlusClears}회` : null,
      rec.longestEndlessSurvival > 0 ? `🔥 최장생존: ${Math.floor(rec.longestEndlessSurvival/60)}분 ${Math.floor(rec.longestEndlessSurvival%60)}초` : null,
      `🥇 달성 성취:       ${rec.achievementsUnlocked} / ${totalAch}`,
    ];
    const statsText = this.add.text(W/2, H/2 - 20, lines.filter(Boolean).join('\n'), {
      fontSize: '13px', fontFamily: 'monospace', color: '#CCDDEE',
      stroke: '#000', strokeThickness: 1, lineSpacing: 5
    }).setOrigin(0.5).setDepth(202);
    container.push(statsText);

    // Close button
    const closeBtn = this.add.text(W/2, H/2 + ph/2 - 40, '✕ 닫기', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aabbcc',
      stroke: '#000', strokeThickness: 2, backgroundColor: '#2A2E3E',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    container.push(closeBtn);

    const cleanup = () => { container.forEach(el => el.destroy()); };
    closeBtn.on('pointerdown', cleanup);
    ovHit.on('pointerdown', cleanup);
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
      p.wobble += 0.02 * (p.wobbleSpeed || 1);
      p.x += Math.sin(p.wobble) * (p.wobbleAmp || 0.3);
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; p.size = 0.5 + Math.random() * 4; }
      if (p.x < -10) { p.x = W + 10; }
      const _sAlpha = p.alpha * (0.6 + Math.sin(this.elapsed * 0.8 + p.wobble) * 0.4);
      this.snowGfx.fillStyle(0xffffff, Math.max(0.05, _sAlpha));
      this.snowGfx.fillCircle(p.x, p.y, p.size);
    });
  }
}
// ═══ END TITLE SCENE ═══

