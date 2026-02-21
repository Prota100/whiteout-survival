import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gameUrl = `file://${__dirname}/index.html`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
    console.log('[ERROR]', msg.text());
  } else if (msg.type() === 'warning') {
    console.log('[WARN]', msg.text());
  }
});
page.on('pageerror', err => {
  errors.push(err.message);
  console.log('[CRASH]', err.message, err.stack);
});

await page.goto(gameUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Try to select a class and start game
try {
  // Click first class card (전사)
  await page.click('canvas', { position: { x: 150, y: 400 } });
  await page.waitForTimeout(500);
  // Click 선택 button
  await page.click('canvas', { position: { x: 200, y: 550 } });
  await page.waitForTimeout(500);
  
  console.log('Game started, waiting for animals to appear...');
  await page.waitForTimeout(3000);
  
  // Try to attack (simulate attacking a rabbit position)
  // Attack in multiple spots to try to hit a rabbit
  for (let i = 0; i < 10; i++) {
    const x = 200 + Math.random() * 200;
    const y = 200 + Math.random() * 200;
    await page.click('canvas', { position: { x, y } });
    await page.waitForTimeout(300);
  }
  
  await page.waitForTimeout(2000);
  
} catch (e) {
  console.log('[TEST ERROR]', e.message);
}

console.log('\n=== ERRORS FOUND ===');
if (errors.length === 0) {
  console.log('No errors detected!');
} else {
  errors.forEach((e, i) => console.log(`${i+1}: ${e}`));
}

await browser.close();
process.exit(0);
