import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import { parseDeOpportunityCard } from './parsers/deOpportunityCardParser.mjs';
import { parseDeVocationalTraining } from './parsers/deVocationalTrainingParser.mjs';
import { parseMakeItGermany } from './parsers/makeItGermanyParser.mjs';
import { parseNzAewv } from './parsers/nzAewvParser.mjs';
import { parseNzMinimumWage } from './parsers/nzMinimumWageParser.mjs';
import { parseNzMedianWage } from './parsers/nzMedianWageParser.mjs';
import { parseNzForklift } from './parsers/nzForkliftParser.mjs';
import { parseInz } from './parsers/inzParser.mjs';
import { parseJsa } from './parsers/jsaParser.mjs';
import { saveSnapshot } from './snapshotManager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser'
];

export function findBrowserExecutable() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const WAF_CHALLENGE_PATTERNS = [
  'secure access verification',
  'please solve this captcha',
  'incident id:',
  'challenge-platform',
  'cf-turnstile',
  'just a moment...',
  'attention required! | cloudflare',
  'checking your browser before accessing',
  'bot detection',
  'access denied',
  'request blocked'
];

function isWafBlocked(content, status) {
  if (status === 403) return true;
  if (!content) return false;
  const lower = content.toLowerCase();
  return WAF_CHALLENGE_PATTERNS.some(pat => lower.includes(pat));
}

export const RESIDENTIAL_TARGETS = [
  {
    id: 'src-inz-aewv',
    name: '新西兰移民局 AEWV 通用准入政策端点',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
    country: '新西兰',
    parser: parseNzAewv,
    formatFact: (f) => `[LIVE_DATA] AEWV 工作经验要求至少 ${f.generalExperienceYears.value} 年或 NZQCF 4 级学历`
  },
  {
    id: 'src-de-opportunity-card',
    name: '德国联邦官方机会卡细分数据端点 (Make it in Germany - Chancenkarte)',
    url: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
    country: '德国',
    parser: parseDeOpportunityCard,
    formatFact: (f) => `[LIVE_DATA] 机会卡月度最低自保金 €${f.monthlyBlockedFundsEur.value}，打工上限 ${f.partTimeWorkAllowedHoursWeekly.value} 小时/周`
  },
  {
    id: 'src-de-vocational-training',
    name: '德国联邦官方职业培训细分数据端点 (Make it in Germany - Ausbildung)',
    url: 'https://www.make-it-in-germany.com/en/study-vocational-training/vocational-training',
    country: '德国',
    parser: parseDeVocationalTraining,
    formatFact: (f) => `[LIVE_DATA] 双元制企业实训津贴毛额 €${f.companyBasedMinimumGross.min}/月，语言要求 ${f.languageRequirement.level}`
  },
  {
    id: 'src-nz-min-wage',
    name: '新西兰商业创新与就业部法定最低时薪 (MBIE / Employment NZ)',
    url: 'https://www.employment.govt.nz/hours-and-rates/pay/minimum-wage/minimum-wage-rates',
    country: '新西兰',
    parser: parseNzMinimumWage,
    formatFact: (f) => `[LIVE_DATA] 法定成人最低时薪 $${f.legalMinimumWageNzd.value} NZD/小时`
  },
  {
    id: 'src-nz-median-wage',
    name: '新西兰移民审理专用中位数时薪 (INZ Wage Thresholds)',
    url: 'https://www.immigration.govt.nz/employ-migrants/guides/pay-rates-for-visas',
    country: '新西兰',
    parser: parseNzMedianWage,
    formatFact: (f) => `[LIVE_DATA] 移民审理专用中位数时薪 $${f.medianWageNzd.value} NZD/小时`
  },
  {
    id: 'src-inz-forklift',
    name: '新西兰叉车工监管职业细分数据端点 (ANZSCO 721311)',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
    country: '新西兰',
    parser: parseNzForklift,
    formatFact: (f) => `[LIVE_DATA] 叉车工代码 ANZSCO ${f.officialAnzscoCode} (Skill Level ${f.baselineSkillLevel})`
  },
  {
    id: 'src-jsa-au-2025',
    name: '澳大利亚就业与技能署 2025 紧缺职业清单 (JSA 2025 OSL)',
    url: 'https://www.jobsandskills.gov.au/data/skills-shortage-som',
    country: '澳大利亚',
    parser: parseJsa,
    formatFact: (f) => `[LIVE_DATA] JSA 2025: 电工 ${f.monitoredShortages.electrician_341111.labour_market_status.rating}, 软件工程师 ${f.monitoredShortages.software_engineer_261313.labour_market_status.rating}`
  }
];

export async function runResidentialCollector(targetIds = null, options = {}) {
  const exePath = findBrowserExecutable();
  if (!exePath) {
    console.error('[Residential Collector] No valid Chrome/Edge executable found on this machine.');
    return {
      success: false,
      error: 'NO_BROWSER_EXECUTABLE',
      results: []
    };
  }

  console.log(`[Residential Collector] Launching browser engine via: ${exePath}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: exePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080',
        '--lang=zh-CN,zh,en-US,en'
      ]
    });
  } catch (launchErr) {
    console.error('[Residential Collector] Failed to launch headless browser:', launchErr.message);
    return { success: false, error: launchErr.message, results: [] };
  }

  const targets = targetIds 
    ? RESIDENTIAL_TARGETS.filter(t => targetIds.includes(t.id))
    : RESIDENTIAL_TARGETS;

  const results = [];
  const nowIso = new Date().toISOString();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"'
    });

    // Stealth injection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });

    for (const target of targets) {
      const t0 = Date.now();
      process.stdout.write(`  [Residential] Scraping ${target.id} (${target.url})... `);

      try {
        const response = await page.goto(target.url, {
          waitUntil: 'domcontentloaded',
          timeout: options.timeout || 12000
        });

        const latencyMs = Date.now() - t0;
        const httpStatus = response ? response.status() : 200;
        let pageHtml = await page.content();

        // Check if WAF CAPTCHA / challenge was returned
        if (isWafBlocked(pageHtml, httpStatus)) {
          console.log(`[BLOCKED] (${latencyMs}ms) - WAF Challenge / CAPTCHA active. Safely keeping verified baseline.`);
          results.push({
            id: target.id,
            name: target.name,
            url: target.url,
            country: target.country,
            status: 'BLOCKED',
            httpStatus: httpStatus === 200 ? 403 : httpStatus,
            latencyMs,
            lastCheck: nowIso,
            extractedFact: '受官方 WAF/CAPTCHA 保护拦截，系统合规降级使用最新官方基准缓存',
            error: 'WAF / CAPTCHA verification challenge detected'
          });
          continue;
        }

        // Run specialized strict parser
        try {
          const parsed = target.parser(pageHtml, target.url);
          const factSummary = target.formatFact(parsed.normalizedFacts);

          const savedSnapshot = saveSnapshot(target.id, parsed, {
            fetchedAt: nowIso,
            sourcePublishedAt: parsed.sourcePublishedAt || null,
            url: target.url,
            summary: factSummary
          });

          console.log(`[LIVE_DATA] (${latencyMs}ms) - Version: v${savedSnapshot.version}`);
          results.push({
            id: target.id,
            name: target.name,
            url: target.url,
            country: target.country,
            status: 'LIVE_DATA',
            httpStatus,
            latencyMs,
            lastCheck: nowIso,
            fetchedAt: nowIso,
            version: savedSnapshot.version,
            contentHash: savedSnapshot.contentHash,
            extractedFact: factSummary
          });
        } catch (parseErr) {
          console.log(`[FAILED_PARSER] (${latencyMs}ms) - ${parseErr.message}`);
          results.push({
            id: target.id,
            name: target.name,
            url: target.url,
            country: target.country,
            status: 'FAILED_PARSER',
            httpStatus,
            latencyMs,
            lastCheck: nowIso,
            extractedFact: '页面获取成功但结构解析器不匹配，拒绝冒充有效数据',
            error: parseErr.message
          });
        }
      } catch (navErr) {
        const latencyMs = Date.now() - t0;
        console.log(`[FAILED] (${latencyMs}ms) - ${navErr.message}`);
        results.push({
          id: target.id,
          name: target.name,
          url: target.url,
          country: target.country,
          status: 'FAILED',
          httpStatus: null,
          latencyMs,
          lastCheck: nowIso,
          extractedFact: '网络超时或连接中断',
          error: navErr.message
        });
      }
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('[Residential Collector] Browser engine closed cleanly.');
    }
  }

  // Persist residential manifest report
  const reportPath = path.resolve(rootDir, 'public/data/residential_manifest.json');
  const reportData = {
    updatedAt: nowIso,
    totalTargets: results.length,
    liveDataCount: results.filter(r => r.status === 'LIVE_DATA').length,
    blockedCount: results.filter(r => r.status === 'BLOCKED').length,
    failedCount: results.filter(r => r.status === 'FAILED' || r.status === 'FAILED_PARSER').length,
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
  console.log(`[Residential Collector] Report saved to ${reportPath}`);

  return {
    success: true,
    data: reportData
  };
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith('residential_collector.mjs')) {
  console.log('=== [Lifee Anti-WAF Residential Collector v1.0] ===');
  runResidentialCollector()
    .then(res => {
      console.log(`Finished. Live: ${res.data?.liveDataCount || 0} / Blocked: ${res.data?.blockedCount || 0} / Total: ${res.data?.totalTargets || 0}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error in residential collector:', err);
      process.exit(1);
    });
}
