import { chromium } from 'playwright';

const results = [];
function log(test, pass, detail = '') {
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'}: ${test} ${detail}`);
  results.push({ test, pass, detail });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  // Clear state and load
  await page.goto('http://localhost:8082', { timeout: 15000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ timeout: 15000 });
  await page.waitForTimeout(3000);

  // T1: Game instance
  const phaserOk = await page.evaluate(() => !!window.phaserGame);
  log('게임 인스턴스', phaserOk);
  if (!phaserOk) throw new Error('No game');

  // T2: Title scene
  const titleOk = await page.evaluate(() => {
    const s = phaserGame.scene.getScene('Title');
    return s && s.scene.isActive();
  });
  log('타이틀 씬', titleOk);

  // Start game: click 새로하기 → warrior → confirm
  const vp = page.viewportSize();
  await page.mouse.click(vp.width / 2, vp.height * 0.52);
  await page.waitForTimeout(1000);
  // Warrior = first card
  await page.mouse.click(vp.width / 2 - 170, vp.height * 0.38);
  await page.waitForTimeout(300);
  await page.mouse.click(vp.width / 2, vp.height * 0.88);
  await page.waitForTimeout(5000);

  // T3: Game scene
  const gameOk = await page.evaluate(() => {
    const s = phaserGame.scene.getScene('Game');
    return s && s.scene.isActive();
  });
  log('게임 씬 활성화', gameOk);
  if (!gameOk) throw new Error('Game scene not active');

  // T4: Player
  const p = await page.evaluate(() => {
    const s = phaserGame.scene.getScene('Game');
    return { ok: !!s.player, hp: s.playerHP, maxHP: s.playerMaxHP, lv: s.playerLevel };
  });
  log('플레이어 존재', p.ok, `HP:${p.hp}/${p.maxHP} Lv:${p.lv}`);

  // T5: Animals group
  const animalsOk = await page.evaluate(() => {
    const s = phaserGame.scene.getScene('Game');
    return { ok: !!s.animals, count: s.animals ? s.animals.getChildren().length : 0 };
  });
  log('동물 그룹 존재', animalsOk.ok, `Count: ${animalsOk.count}`);

  // T6: Wait and check enemies + temp
  await page.waitForTimeout(5000);
  const after = await page.evaluate(() => {
    const s = phaserGame.scene.getScene('Game');
    return {
      count: s.animals ? s.animals.getChildren().filter(a => a.active).length : 0,
      temp: s.temperature,
      elapsed: s.gameElapsed,
      xp: s.playerXP,
    };
  });
  log('적 존재', after.count > 0, `적: ${after.count}, 경과: ${after.elapsed?.toFixed(1)}s`);
  log('체온 감소 작동', after.temp < 100, `Temp: ${after.temp?.toFixed(1)}`);

  // T7: Kill enemy
  const kill = await page.evaluate(() => {
    const s = phaserGame.scene.getScene('Game');
    const xpBefore = s.playerXP;
    const enemies = s.animals.getChildren().filter(e => e.active);
    if (enemies.length === 0) return { ok: false, reason: 'no enemies' };
    try {
      s.killAnimal(enemies[0]);
      return { ok: true, xpBefore, xpAfter: s.playerXP };
    } catch(e) { return { ok: false, reason: e.message }; }
  });
  log('적 처치 크래시 없음', kill.ok, JSON.stringify(kill));
  if (kill.ok) log('XP 획득', kill.xpAfter > kill.xpBefore, `${kill.xpBefore}→${kill.xpAfter}`);

  // T8: Level up UI (generate cards first)
  const lvl = await page.evaluate(() => {
    const s = phaserGame.scene.getScene('Game');
    try {
      const cards = s.upgradeManager.pickThreeCards(0, s._playerClass, false);
      if (cards.length === 0) return { ok: false, reason: 'no cards available' };
      s.showUpgradeUI(cards);
      return { ok: true, cardCount: cards.length };
    } catch(e) { return { ok: false, reason: e.message }; }
  });
  log('레벨업 UI 표시', lvl.ok, lvl.ok ? `Cards: ${lvl.cardCount}` : lvl.reason);

  // T9: JS errors
  const critical = errors.filter(e => !e.includes('favicon'));
  log('JS 에러 없음', critical.length === 0, critical.length > 0 ? critical.slice(0,3).join(' | ') : '');

  await browser.close();

  console.log('\n═══ 결과 요약 ═══');
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} 통과`);
  results.filter(r => !r.pass).forEach(r => console.log(`  ❌ ${r.test}: ${r.detail}`));
  process.exit(passed === results.length ? 0 : 1);
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
