import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROD_URL = 'https://www.waveringlight.com/apps/nod-sleep-noise-app/';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const CHROME_PATH =
  process.env.CHROME_PATH ??
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportsDir = join(__dirname, '..', 'lighthouse-reports');

console.log('Running Lighthouse audit against ' + PROD_URL + ' ...\n');

const chrome = await launch({
  chromePath: CHROME_PATH,
  chromeFlags: ['--headless=new'],
});

let exitCode = 1;

try {
  const result = await lighthouse(PROD_URL, {
    port: chrome.port,
    output: 'json',
    onlyCategories: CATEGORIES,
    logLevel: 'error',
  });

  const lhr = result.lhr;

  const scores = {};
  for (const category of CATEGORIES) {
    scores[category] = lhr.categories[category]?.score ?? null;
  }

  // Map each audit id to its category
  const auditToCategory = {};
  for (const [categoryId, category] of Object.entries(lhr.categories)) {
    for (const ref of category.auditRefs) {
      auditToCategory[ref.id] = categoryId;
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
  for (const [category, score] of Object.entries(scores)) {
    const percent = score === null ? ' N/A' : (Math.round(score * 100) + '%').padStart(4);
    const icon = score === 1 ? '✓' : score >= 0.9 ? '~' : '✗';
    console.log(`  ${icon} ${category.padEnd(20)} ${percent}`);
  }
  console.log('');
  console.log(`Report saved: lighthouse-reports/${filename}`);

  if (issues.length === 0) {
    console.log('No issues found.');
  } else {
    console.log(`Issues found: ${issues.length}\n`);
    for (const issue of issues) {
      const percent = (Math.round(issue.score * 100) + '%').padStart(4);
      console.log(`  [${issue.category}] ${percent} — ${issue.title}`);
      if (issue.displayValue) console.log(`         ${issue.displayValue}`);
      console.log(`         ${issue.description}`);
      console.log('');
    }
  }

  exitCode = Object.values(scores).every(score => score === 1) ? 0 : 1;
} finally {
  await chrome.kill();
}

process.exit(exitCode);
