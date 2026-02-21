import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));

  await page.goto('http://localhost:8082', { timeout: 15000 });
  await page.waitForTimeout(3000);

  // Check what's available
  const check = await page.evaluate(() => {
    return {
      phaser: typeof Phaser,
      phaserVersion: typeof Phaser !== 'undefined' ? Phaser.VERSION : null,
      phaserGAMES: typeof Phaser !== 'undefined' ? (Phaser.GAMES || []).length : 0,
      titleScene: typeof TitleScene,
      bootScene: typeof BootScene,
      gameScene: typeof GameScene,
      upgrades: typeof UPGRADES,
      animals: typeof ANIMALS,
      playerClasses: typeof PLAYER_CLASSES,
      metaManager: typeof MetaManager,
      saveManager: typeof SaveManager,
      gameContainer: !!document.getElementById('game-container'),
    };
  });
  console.log('Check:', JSON.stringify(check, null, 2));
  
  // Print errors
  const errs = logs.filter(l => l.includes('ERROR') || l.includes('error') || l.includes('warn'));
  console.log('\nErrors/warnings:', errs.length);
  errs.forEach(e => console.log(e));
  
  // Print all logs if few
  if (logs.length < 30) {
    console.log('\nAll logs:');
    logs.forEach(l => console.log(l));
  }

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
