import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warning') 
    console.log(`[${msg.type()}]`, msg.text());
});
page.on('pageerror', err => {
  console.log('[PAGEERROR]', err.message);
  console.log('[STACK]', err.stack);
});
page.on('crash', () => console.log('[PAGE CRASHED]'));
page.on('close', () => console.log('[PAGE CLOSED]'));

await page.goto('http://localhost:8765', { waitUntil: 'networkidle', timeout: 10000 });
await page.waitForTimeout(3000);

let scenes = await page.evaluate(() => window.phaserGame?.scene.getScenes(true).map(s => s.scene.key));
console.log('Scenes:', scenes);

// Start game with warrior class
await page.evaluate(() => {
  const title = window.phaserGame.scene.getScene('Title');
  if (title?.scene.isActive()) title.scene.start('Game', { playerClass: 'warrior' });
});
await page.waitForTimeout(3000);

scenes = await page.evaluate(() => window.phaserGame?.scene.getScenes(true).map(s => s.scene.key));
console.log('After start:', scenes);

// Install global error catcher
await page.evaluate(() => {
  window._crashLog = [];
  window.addEventListener('error', e => {
    window._crashLog.push(`${e.message} at ${e.filename}:${e.lineno}`);
  });
});

// Test 1: Kill rabbit with player at low HP
console.log('\n--- Test 1: Kill rabbit while player HP=1 ---');
let r = await page.evaluate(() => {
  const gs = window.phaserGame.scene.getScene('Game');
  if (!gs?.player) return 'no player';
  
  gs.playerHP = 1;
  gs.spawnAnimal('rabbit');
  const rabbit = gs.animals.getChildren().find(a => a.active && a.animalType === 'rabbit');
  if (!rabbit) return 'no rabbit';
  rabbit.x = gs.player.x + 20; rabbit.y = gs.player.y;
  
  try {
    gs.damageAnimal(rabbit, 100);
    return 'ok - rabbit killed, hp=' + gs.playerHP;
  } catch(e) { return 'CRASH: ' + e.message + '\n' + e.stack; }
});
console.log('Result:', r);

// Test 2: Kill rabbit AND endGame at same time
console.log('\n--- Test 2: Kill rabbit then endGame ---');
r = await page.evaluate(() => {
  const gs = window.phaserGame.scene.getScene('Game');
  if (!gs?.player) return 'no player';
  
  // Reset state
  gs.gameOver = false; gs.isRespawning = false;
  gs.playerHP = 50;
  
  gs.spawnAnimal('rabbit');
  const rabbit = gs.animals.getChildren().find(a => a.active && a.animalType === 'rabbit');
  if (!rabbit) return 'no rabbit';
  rabbit.x = gs.player.x + 20; rabbit.y = gs.player.y;
  
  try {
    gs.damageAnimal(rabbit, 100); // kill rabbit
    gs.playerHP = 0;
    gs.endGame(); // player dies
    return 'ok - both died';
  } catch(e) { return 'CRASH: ' + e.message + '\n' + e.stack; }
});
console.log('Result:', r);

// Test 3: Simulate the REAL scenario - cold kills player during rabbit attack
console.log('\n--- Test 3: endGame during killAnimal (monkey-patch) ---');
r = await page.evaluate(() => {
  const gs = window.phaserGame.scene.getScene('Game');
  if (!gs?.player) return 'no player';
  
  gs.gameOver = false; gs.isRespawning = false;
  gs.playerHP = 50;
  
  // Patch endGame to track if it's called during killAnimal
  const origEndGame = gs.endGame.bind(gs);
  let endGameCalledDuringKill = false;
  
  gs.spawnAnimal('rabbit');
  const rabbit = gs.animals.getChildren().find(a => a.active && a.animalType === 'rabbit');
  if (!rabbit) return 'no rabbit';
  rabbit.x = gs.player.x + 20; rabbit.y = gs.player.y;
  
  // Monkey-patch killAnimal to trigger endGame mid-execution
  const origKillAnimal = gs.killAnimal.bind(gs);
  let killAnimalError = null;
  gs.killAnimal = function(a) {
    try {
      // First call the real killAnimal
      origKillAnimal(a);
    } catch(e) {
      killAnimalError = e.message + '\n' + e.stack;
    }
  };
  
  try {
    gs.damageAnimal(rabbit, 100);
    gs.killAnimal = origKillAnimal; // restore
    if (killAnimalError) return 'KILL CRASH: ' + killAnimalError;
    return 'ok';
  } catch(e) { return 'CRASH: ' + e.message + '\n' + e.stack; }
});
console.log('Result:', r);

try {
  await page.waitForTimeout(2000);
  const errs = await page.evaluate(() => window._crashLog);
  if (errs?.length > 0) console.log('Caught errors:', errs);
} catch(e) {
  console.log('Page died during wait:', e.message);
}

console.log('\nDone');
await browser.close().catch(() => {});
process.exit(0);
