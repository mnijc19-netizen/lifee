import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const screenshotsDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const exe = chromePaths.find(p => fs.existsSync(p));

function startServer(port) {
  return new Promise((resolve, reject) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png'
    };

    const server = http.createServer((req, res) => {
      let rawPath = req.url.split('?')[0];
      if (rawPath === '/' || rawPath === '/lifee' || rawPath === '/lifee/') {
        rawPath = '/index.html';
      }
      if (rawPath.startsWith('/lifee/')) {
        rawPath = rawPath.replace('/lifee/', '/');
      }
      const filePath = path.join(distDir, rawPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        const indexPath = path.join(distDir, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          fs.createReadStream(indexPath).pipe(res);
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      }
    });

    server.listen(port, '127.0.0.1', () => resolve(server)).on('error', reject);
  });
}

async function capture() {
  const port = 4174;
  const server = await startServer(port);
  console.log(`Server started on http://127.0.0.1:${port}`);

  const browser = await puppeteer.launch({
    executablePath: exe,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop (1280x850) - Today Dashboard
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop_today.png') });
    console.log('Saved: desktop_today.png');

    // 2. Mobile (390x844 iPhone 16 Pro) - Today Dashboard with Mobile Bottom Nav
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_today.png') });
    console.log('Saved: mobile_today.png');

    // 3. Mobile (390x844) - Routes Popover Sheet open
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('nav button'));
      const routeBtn = btns.find(b => b.innerText.includes('路线'));
      if (routeBtn) routeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_routes_sheet.png') });
    console.log('Saved: mobile_routes_sheet.png');

    // 4. Desktop (1280x850) - MultiCompare with sticky column
    await page.setViewport({ width: 1280, height: 850 });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('nav button'));
      const cmpBtn = btns.find(b => b.innerText.includes('多维对比'));
      if (cmpBtn) cmpBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop_compare.png') });
    console.log('Saved: desktop_compare.png');

    console.log('All responsive UI screenshots captured successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
