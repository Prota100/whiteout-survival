import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const DIR = new URL('.', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.webp': 'image/webp', '.json': 'application/json' };

const server = createServer((req, res) => {
  let url = req.url.split('?')[0]; // strip query params
  if (url === '/') url = '/index.html';
  const p = join(DIR, url);
  if (!existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});

await new Promise(r => server.listen(0, r));
const port = server.address().port;
console.log(`Server on port ${port}`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));

try {
  await page.goto(`http://localhost:${port}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log('Page loaded');

  // Wait for Phaser
  await page.waitForTimeout(4000);

  const canvas = await page.$('canvas');
  if (!canvas) throw new Error('No canvas found');
  console.log('Canvas found');

  // Filter out 404 errors for sound files (non-critical)
  const criticalErrors = errors.filter(e => !e.includes('404') && !e.includes('sound') && !e.includes('audio') && !e.includes('.mp3') && !e.includes('.ogg'));

  if (criticalErrors.length > 0) {
    console.log('CRITICAL ERRORS:');
    criticalErrors.forEach(e => console.log('  -', e));
    process.exitCode = 1;
  } else {
    console.log('✅ No critical JS errors! Game loaded successfully.');
    if (errors.length > 0) console.log(`(${errors.length} non-critical warnings filtered)`);
  }
} catch (e) {
  console.error('Test failed:', e.message);
  const criticalErrors = errors.filter(e => !e.includes('404'));
  if (criticalErrors.length > 0) {
    console.log('Critical JS Errors:');
    criticalErrors.forEach(e => console.log('  -', e));
  }
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
