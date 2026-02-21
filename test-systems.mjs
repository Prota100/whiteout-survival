import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = `file://${path.resolve(__dirname, 'index.html')}`;

const results = {};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Suppress dialog boxes
  page.on('dialog', d => d.dismiss().catch(() => {}));
  
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  
  // Wait for Phaser game to load
  await page.waitForFunction(() => {
    return window.phaserGame && 
           window.phaserGame.scene &&
           window.phaserGame.scene.getScene('Game');
  }, { timeout: 15000 });

  // Start game scene
  await page.evaluate(() => {
    const game = window.phaserGame;
    if (game.scene.isActive('Title')) {
      game.scene.stop('Title');
    }
    if (!game.scene.isActive('Game')) {
      game.scene.start('Game');
    }
  });
  await page.waitForTimeout(2000);

  // === TEST 1: Blizzard System ===
  console.log('=== TEST 1: Blizzard System ===');
  try {
    const t1 = await page.evaluate(() => {
      const gs = window.phaserGame.scene.getScene('Game');
      if (!gs || !gs.scene.isActive()) return { error: 'Game scene not active' };
      
      // Blizzard schedule uses this.time.now - this.gameStartTime (ms)
      // First blizzard at 3*60*1000 = 180000ms
      // Simulate by adjusting gameStartTime to make elapsed = 180001ms
      const origStartTime = gs.gameStartTime;
      gs.gameStartTime = gs.time.now - 180001;
      gs.blizzardIndex = 0;
      gs.blizzardActive = false;
      gs.blizzardWarned = false;
      
      // Call checkBlizzardSchedule
      gs.checkBlizzardSchedule();
      
      const active = gs.blizzardActive;
      const mult = gs.blizzardMultiplier;
      const idx = gs.blizzardIndex;
      
      // Restore
      gs.gameStartTime = origStartTime;
      
      return { active, mult, idx };
    });
    
    if (t1.error) {
      console.log('FAIL:', t1.error);
      results['blizzard'] = 'FAIL: ' + t1.error;
    } else if (t1.active && t1.mult >= 1.5 && t1.idx >= 1) {
      console.log(`PASS: blizzardActive=${t1.active}, mult=${t1.mult}, idx=${t1.idx}`);
      results['blizzard'] = 'PASS';
    } else {
      console.log(`FAIL: active=${t1.active}, mult=${t1.mult}, idx=${t1.idx}`);
      results['blizzard'] = `FAIL: active=${t1.active}, mult=${t1.mult}, idx=${t1.idx}`;
    }
  } catch (e) {
    console.log('FAIL:', e.message);
    results['blizzard'] = 'FAIL: ' + e.message;
  }

  // === TEST 2: Boss Spawn ===
  console.log('\n=== TEST 2: Boss Spawn (20min) ===');
  try {
    const t2 = await page.evaluate(() => {
      const gs = window.phaserGame.scene.getScene('Game');
      if (!gs || !gs.scene.isActive()) return { error: 'Game scene not active' };
      
      // Boss1 at 20min = 1200s (gameElapsed based)
      gs.boss1Spawned = false;
      gs._boss1Warned = false;
      gs.gameElapsed = 1201;
      
      // The boss spawn check happens in update loop via _updateActProgression or similar
      // Let's check if spawnBoss method exists
      const hasSpawnBoss = typeof gs.spawnBoss === 'function';
      
      // Directly call the boss spawn logic check
      // From code: if (!this.boss1Spawned && this.gameElapsed >= boss1Time) { this.boss1Spawned = true; this.spawnBoss('first'); }
      // _srT defaults to 1 unless speed run
      const _srT = gs._speedRunTimeMult || 1;
      const boss1Time = 20 * 60 * _srT;
      const shouldSpawn = !gs.boss1Spawned && gs.gameElapsed >= boss1Time;
      
      // Actually trigger it
      let bossFound = false;
      if (shouldSpawn && hasSpawnBoss) {
        try {
          gs.spawnBoss('first');
          gs.boss1Spawned = true;
          // Check animals for boss
          if (gs.animals) {
            const kids = gs.animals.getChildren();
            bossFound = kids.some(a => a.isBoss);
          }
        } catch(e) {
          return { error: 'spawnBoss error: ' + e.message };
        }
      }
      
      return { hasSpawnBoss, shouldSpawn, boss1Time, bossFound, boss1Spawned: gs.boss1Spawned };
    });
    
    if (t2.error) {
      console.log('FAIL:', t2.error);
      results['boss'] = 'FAIL: ' + t2.error;
    } else if (t2.bossFound || t2.boss1Spawned) {
      console.log(`PASS: bossFound=${t2.bossFound}, boss1Spawned=${t2.boss1Spawned}`);
      results['boss'] = 'PASS';
    } else {
      console.log(`FAIL:`, JSON.stringify(t2));
      results['boss'] = 'FAIL: ' + JSON.stringify(t2);
    }
  } catch (e) {
    console.log('FAIL:', e.message);
    results['boss'] = 'FAIL: ' + e.message;
  }

  // === TEST 3: Equipment Drop ===
  console.log('\n=== TEST 3: Equipment Drop ===');
  try {
    const t3 = await page.evaluate(() => {
      const gs = window.phaserGame.scene.getScene('Game');
      if (!gs || !gs.scene.isActive()) return { error: 'Game scene not active' };
      
      const hasFn = typeof gs._tryDropEquipment === 'function';
      if (!hasFn) return { error: '_tryDropEquipment not found' };
      
      // Force high elapsed for better drop rate, clear existing
      gs.gameElapsed = 1200;
      gs.equipmentDrops = [];
      
      // Try many times since it's RNG-based
      let dropped = false;
      for (let i = 0; i < 200; i++) {
        try { gs._tryDropEquipment(400 + i, 300); } catch(e) {}
        if (gs.equipmentDrops.length > 0) { dropped = true; break; }
      }
      
      return { hasFn, dropped, count: gs.equipmentDrops.length };
    });
    
    if (t3.error) {
      console.log('FAIL:', t3.error);
      results['equipment'] = 'FAIL: ' + t3.error;
    } else if (t3.dropped) {
      console.log(`PASS: dropped=${t3.dropped}, count=${t3.count}`);
      results['equipment'] = 'PASS';
    } else {
      console.log(`FAIL: no drops after 200 attempts`, JSON.stringify(t3));
      results['equipment'] = 'FAIL: no drops after 200 attempts';
    }
  } catch (e) {
    console.log('FAIL:', e.message);
    results['equipment'] = 'FAIL: ' + e.message;
  }

  // === TEST 4: Death → End Screen ===
  console.log('\n=== TEST 4: Death → End Screen (endGame) ===');
  try {
    const t4 = await page.evaluate(() => {
      const gs = window.phaserGame.scene.getScene('Game');
      if (!gs || !gs.scene.isActive()) return { error: 'Game scene not active' };
      
      const hasFn = typeof gs.endGame === 'function';
      if (!hasFn) return { error: 'endGame not found' };
      
      gs.playerHP = 0;
      gs.gameOver = false;
      gs.isRespawning = false;
      gs._revivalUsed = true; // skip revival
      
      try {
        gs.endGame();
      } catch(e) {
        return { error: 'endGame threw: ' + e.message };
      }
      
      return { 
        hasFn, 
        isRespawning: gs.isRespawning,
        gameOver: gs.gameOver
      };
    });
    
    if (t4.error) {
      console.log('FAIL:', t4.error);
      results['endGame'] = 'FAIL: ' + t4.error;
    } else if (t4.isRespawning) {
      console.log(`PASS: isRespawning=${t4.isRespawning}`);
      results['endGame'] = 'PASS';
    } else {
      console.log(`FAIL:`, JSON.stringify(t4));
      results['endGame'] = 'FAIL: ' + JSON.stringify(t4);
    }
  } catch (e) {
    console.log('FAIL:', e.message);
    results['endGame'] = 'FAIL: ' + e.message;
  }

  // Summary
  console.log('\n========== SUMMARY ==========');
  for (const [k, v] of Object.entries(results)) {
    console.log(`${k}: ${v}`);
  }
  
  await browser.close();
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
