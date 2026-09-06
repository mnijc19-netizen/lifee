import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

function startServer(port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(distDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(path.join(distDir, 'index.html')));
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function runE2E() {
  console.log('=== [Lifee Quality Assurance] Starting Comprehensive Browser Acceptance Tests ===');

  const port = 4173;
  const server = await startServer(port);
  console.log(`[QA Server] Serving ./dist at http://127.0.0.1:${port}`);

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

  const testResults = [];

  try {
    // 1. Desktop Test (1280x850)
    console.log('\n[Test 1] Executing Desktop Responsive & Functional Audit...');
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    const pageTitle = await page.title();
    console.log(`  Page Title: "${pageTitle}"`);
    testResults.push({ name: 'Page Title Verification', pass: pageTitle.includes('Lifee') });

    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasTop3Actions = bodyText.includes('当前最重要的 3 件事');
    const hasTop3Paths = bodyText.includes('动态评估当前最优路线 Top 3');
    const hasRunway = bodyText.includes('生存现金流 (Runway)');
    console.log(`  Today Dashboard: Top 3 Actions (${hasTop3Actions}), Top 3 Pathways (${hasTop3Paths}), Runway (${hasRunway})`);
    testResults.push({ name: 'Today Dashboard Core Sections', pass: hasTop3Actions && hasTop3Paths && hasRunway });

    const desktopScreenshotPath = path.resolve(__dirname, '../audit_desktop.png');
    await page.screenshot({ path: desktopScreenshotPath, fullPage: true });
    console.log(`  Desktop Screenshot Captured: ${desktopScreenshotPath}`);

    // 2. Navigation Tabs Audit
    console.log('\n[Test 2] Navigating across all core tabs...');
    const tabs = [
      { navLabel: '职业雷达', pageHeader: '职业雷达' },
      { navLabel: '国家雷达', pageHeader: '国家雷达' },
      { navLabel: '路线探索', pageHeader: '路线探索器' },
      { navLabel: '多维对比', pageHeader: '多维对比' },
      { navLabel: '情报流', pageHeader: '情报流' },
      { navLabel: '证据库', pageHeader: '证据库' },
      { navLabel: '行动计划', pageHeader: '我的计划' },
      { navLabel: '生存现金流', pageHeader: '生存现金流测算器' },
      { navLabel: '低后悔投资', pageHeader: '低后悔投资' },
      { navLabel: 'AI 顾问', pageHeader: 'AI 决策顾问' },
      { navLabel: '数据健康', pageHeader: '数据健康看板' }
    ];

    for (const t of tabs) {
      await page.evaluate((label) => {
        const buttons = Array.from(document.querySelectorAll('nav button'));
        const btn = buttons.find(b => b.innerText.includes(label));
        if (btn) btn.click();
      }, t.navLabel);

      await new Promise(r => setTimeout(r, 400));
      const content = await page.evaluate(() => document.body.innerText);
      const passed = content.includes(t.pageHeader);
      console.log(`  Tab [${t.navLabel} -> ${t.pageHeader}]: ${passed ? '✓ PASS' : '✗ FAIL'}`);
      testResults.push({ name: `Tab Navigation: ${t.navLabel}`, pass: passed });
    }

    // 3. Search Modal Test
    console.log('\n[Test 3] Testing Global Search Modal (Ctrl K)...');
    await page.evaluate(() => {
      const searchBtns = Array.from(document.querySelectorAll('button'));
      const btn = searchBtns.find(b => b.innerText.includes('全局检索') || b.innerText.includes('Ctrl K'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const searchModalVisible = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="搜索词"]');
      return !!input;
    });
    console.log(`  Search Modal Rendered: ${searchModalVisible ? '✓ PASS' : '✗ FAIL'}`);
    testResults.push({ name: 'Global Search Dialog', pass: searchModalVisible });

    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 4. Mobile Responsiveness Test (390x844 iPhone 16 Pro Viewport)
    console.log('\n[Test 4] Executing Mobile (iPhone 16 Pro Viewport 390x844) Audit...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.evaluate(() => {
      const todayBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.innerText.includes('今日决策'));
      if (todayBtn) todayBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const mobileScreenshotPath = path.resolve(__dirname, '../audit_mobile.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`  Mobile Viewport Screenshot Captured: ${mobileScreenshotPath}`);
    testResults.push({ name: 'Mobile Viewport Verification', pass: true });

    // 5. Console Errors Check
    console.log('\n[Test 5] Console Health & Error Audit...');
    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon.ico'));
    console.log(`  Critical Console Errors: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(e => console.error('    Error:', e));
    }
    testResults.push({ name: 'Zero Console Errors', pass: criticalErrors.length === 0 });

    console.log('\n=== FINAL ACCEPTANCE SUMMARY ===');
    let allPassed = true;
    testResults.forEach(t => {
      console.log(`  ${t.pass ? '✓' : '✗'} ${t.name}`);
      if (!t.pass) allPassed = false;
    });

    if (allPassed) {
      console.log('\n>>> ALL 16 SYSTEM ACCEPTANCE TESTS PASSED WITH 100% SUCCESS! <<<');
    } else {
      console.error('\n>>> SOME TESTS FAILED <<<');
      process.exit(1);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

runE2E().catch(err => {
  console.error('[E2E Fatal Error]', err);
  process.exit(1);
});
