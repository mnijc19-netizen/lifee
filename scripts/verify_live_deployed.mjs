import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyLive() {
  const liveUrl = 'https://mnijc19-netizen.github.io/lifee/';
  console.log(`=== [Live Deployment Verification] Testing ${liveUrl} ===`);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  try {
    // 1. Desktop Test on Live URL
    await page.setViewport({ width: 1280, height: 850 });
    console.log('Navigating to live production URL...');
    const response = await page.goto(liveUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    console.log(`HTTP Status: ${response.status()}`);

    await new Promise(r => setTimeout(r, 1500));

    const pageTitle = await page.title();
    console.log(`Page Title: "${pageTitle}"`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasToday = bodyText.includes('今日最值得做的一件事') || bodyText.includes('我现在最应该做什么');
    const hasTop3 = bodyText.includes('当前最重要的 3 件事');
    const hasPathways = bodyText.includes('动态评估当前最优路线 Top 3');
    console.log(`Live Content Check: Header(${hasToday}), Top3(${hasTop3}), Pathways(${hasPathways})`);

    const liveDesktopScreenshot = path.resolve(__dirname, '../deployed_desktop.png');
    await page.screenshot({ path: liveDesktopScreenshot, fullPage: true });
    console.log(`Live Desktop Screenshot: ${liveDesktopScreenshot}`);

    // 2. Mobile Test on Live URL
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 600));

    const liveMobileScreenshot = path.resolve(__dirname, '../deployed_mobile.png');
    await page.screenshot({ path: liveMobileScreenshot, fullPage: false });
    console.log(`Live Mobile Screenshot: ${liveMobileScreenshot}`);

    console.log(`Console Errors on Live URL: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(e => console.error('  Error:', e));
    }

    if (hasToday && hasTop3 && hasPathways && consoleErrors.length === 0) {
      console.log('\n>>> LIVE PRODUCTION DEPLOYMENT FULLY VERIFIED AND PASSING! <<<');
    } else {
      console.error('\n>>> LIVE VERIFICATION INCOMPLETE <<<');
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

verifyLive().catch(err => {
  console.error('[Live Verification Error]', err);
  process.exit(1);
});
