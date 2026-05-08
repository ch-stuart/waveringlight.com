import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROD_URL = 'https://www.waveringlight.com/apps/nod-sleep-noise-app/';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const CHROME_PATH =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportsDir = join(__dirname, '..', 'lighthouse-reports');

console.log('Running Lighthouse audit against ' + PROD_URL + ' ...\n');

const chrome = await launch({
  chromePath: CHROME_PATH,
  chromeFlags: ['--headless=new'],
});

try {
  const result = await lighthouse(PROD_URL, {
    port: chrome.port,
    output: 'json',
    onlyCategories: CATEGORIES,
    logLevel: 'error',
  });

  const lhr = result.lhr;

  const scores = {};
  for (const cat of CATEGORIES) {
    scores[cat] = lhr.categories[cat]?.score ?? null;
  }

  // Map each audit id to its category
  const auditToCategory = {};
  for (const [catId, cat] of Object.entries(lhr.categories)) {
    for (const ref of cat.auditRefs) {
      auditToCategory[ref.id] = catId;
    }
  }

  const issues = [];
  for (const [id, audit] of Object.entries(lhr.audits)) {
    const { score, scoreDisplayMode, title, description, displayValue, details } = audit;
    if (
      score !== null &&
      score < 1 &&
      scoreDisplayMode !== 'informative' &&
      scoreDisplayMode !== 'notApplicable' &&
      scoreDisplayMode !== 'manual'
    ) {
      issues.push({
        id,
        category: auditToCategory[id] ?? 'unknown',
        score,
        title,
        description: description.replace(/ \[Learn.*?\]\(.*?\)\.?/g, ''),
        displayValue: displayValue ?? null,
        items: details?.items?.slice(0, 10) ?? [],
      });
    }
  }

  issues.sort((a, b) => a.score - b.score);

  const timestamp = new Date().toISOString();
  const filename = timestamp.replace(/:/g, '-').replace(/\..+/, '') + '.json';
  const report = { timestamp, url: PROD_URL, scores, issues };

  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(join(reportsDir, filename), JSON.stringify(report, null, 2));

  console.log('Lighthouse Report — ' + timestamp);
  console.log('URL: ' + PROD_URL + '\n');
  for (const [cat, score] of Object.entries(scores)) {
    const pct = score === null ? ' N/A' : (Math.round(score * 100) + '%').padStart(4);
    const icon = score === 1 ? '✓' : score >= 0.9 ? '~' : '✗';
    console.log(`  ${icon} ${cat.padEnd(20)} ${pct}`);
  }
  console.log('');
  console.log(`Report saved: lighthouse-reports/${filename}`);
  console.log(issues.length > 0 ? `Issues found: ${issues.length}` : 'No issues found.');

  process.exit(Object.values(scores).every(s => s === 1) ? 0 : 1);
} finally {
  await chrome.kill();
}
