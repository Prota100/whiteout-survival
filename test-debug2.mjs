import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log(`[PAGE_ERROR] ${err.message}`));

  await page.goto('http://localhost:8082', { timeout: 15000 });
  await page.waitForTimeout(3000);

  const check = await page.evaluate(() => {
    // Find game instance
    const canvas = document.querySelector('canvas');
    const gameContainer = document.getElementById('game-container');
    
    // Try to find the Phaser game via different methods
    let gameInstance = null;
    
    // Method 1: window.game or window.phaserGame
    if (window.game) gameInstance = 'window.game';
    if (window.phaserGame) gameInstance = 'window.phaserGame';
    
    // Method 2: Check if Phaser has a game registry
    const phaserKeys = Object.keys(Phaser).filter(k => k.toLowerCase().includes('game'));
    
    // Method 3: Check canvas parent for __phaser
    let canvasData = null;
    if (canvas) {
      canvasData = {
        width: canvas.width,
        height: canvas.height,
        parentId: canvas.parentElement?.id
      };
    }
    
    // Method 4: Check for scene manager globally
    // The config creates `new Phaser.Game(config)` without assigning to a variable
    // But Phaser stores instances
    
    return {
      canvas: !!canvas,
      canvasData,
      gameContainer: !!gameContainer,
      gameContainerChildren: gameContainer?.children?.length,
      gameInstance,
      phaserKeys,
      phaserGamesType: typeof Phaser.GAMES,
      phaserGames: Array.isArray(Phaser.GAMES) ? Phaser.GAMES.length : 'not array',
    };
  });
  console.log(JSON.stringify(check, null, 2));

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
