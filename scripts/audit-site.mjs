import { chromium, devices } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = process.env.BASE_URL || 'https://ishanpk.github.io/YogeshChavanAssociates/';
const OUT = join(process.cwd(), 'audit-screenshots');
mkdirSync(OUT, { recursive: true });

const LEGACY_TEAM_ROLES = [
  'Senior Architect',
  'Interior Designer',
  'Project Manager',
  'Site Supervisor',
  'Structural Engineer',
];

const viewports = [
  { name: 'mobile-se', ...devices['iPhone SE'] },
  { name: 'mobile-14', ...devices['iPhone 14'] },
  { name: 'tablet', viewport: { width: 768, height: 1024 } },
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
];

const issues = [];
const results = [];

async function auditTeam(page, vpName) {
  const team = page.locator('#team');
  await team.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const leadCount = await page.locator('.team-lead').count();
  const photoCount = await page.locator('.team-photo').count();
  const legacyCards = await page.locator('.team-card').count();
  const groupPhotos = await page.locator('.team-group-photo').count();
  const teamText = (await team.innerText()).toLowerCase();
  const roleTexts = (await page.locator('.team-lead__role').allInnerTexts()).map(t => t.toLowerCase());

  if (leadCount !== 2) {
    issues.push(`${vpName}: expected 2 team leads, found ${leadCount}`);
  }
  if (photoCount !== 1) {
    issues.push(`${vpName}: expected 1 team photo, found ${photoCount}`);
  }
  if (legacyCards > 0) {
    issues.push(`${vpName}: legacy .team-card elements still present (${legacyCards})`);
  }
  if (groupPhotos > 0) {
    issues.push(`${vpName}: old .team-group-photo layout still present (${groupPhotos})`);
  }

  for (const role of LEGACY_TEAM_ROLES) {
    if (teamText.includes(role.toLowerCase())) {
      issues.push(`${vpName}: legacy role "${role}" visible in team section`);
    }
  }

  if (!roleTexts.some(r => r.includes('principal architect'))) {
    issues.push(`${vpName}: Principal Architect role not found`);
  }
  if (!roleTexts.some(r => r.includes('chief engineer'))) {
    issues.push(`${vpName}: Chief Engineer role not found`);
  }

  const teamBox = await team.boundingBox();
  if (!teamBox || teamBox.height > 520) {
    issues.push(`${vpName}: team section too tall (${teamBox?.height?.toFixed(0) ?? 0}px, max 520)`);
  }

  await team.screenshot({ path: join(OUT, `${vpName}-team.png`) });

  return { leadCount, photoCount, legacyCards, teamHeight: teamBox?.height };
}

async function auditProcess(page, vpName) {
  const process = page.locator('#process');
  await process.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const nodeCount = await page.locator('.process-journey__node').count();
  const stage = page.locator('#process-stage');
  const stageVisible = await stage.isVisible();

  if (nodeCount !== 4) {
    issues.push(`${vpName}: expected 4 process nodes, found ${nodeCount}`);
  }
  if (!stageVisible) {
    issues.push(`${vpName}: process stage panel not visible`);
  }

  const nextBtn = page.locator('#process-next');
  await nextBtn.click();
  await page.waitForTimeout(350);

  const activeNodes = await page.locator('.process-journey__node--active').count();
  const visitedNodes = await page.locator('.process-journey__node--visited').count();
  const countText = await page.locator('#process-count').innerText();

  if (activeNodes !== 1) {
    issues.push(`${vpName}: expected 1 active process node after next, found ${activeNodes}`);
  }
  if (visitedNodes < 2) {
    issues.push(`${vpName}: expected at least 2 visited process nodes, found ${visitedNodes}`);
  }
  if (!countText.includes('explored')) {
    issues.push(`${vpName}: process count label missing`);
  }

  await process.screenshot({ path: join(OUT, `${vpName}-process.png`) });

  return { nodeCount, activeNodes, visitedNodes, countText };
}

async function auditFeatured(page, vpName) {
  const featured = page.locator('#featured');
  const frame = page.locator('#featured-frame');
  const slides = page.locator('.featured-viewer__slide--active img');

  await featured.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const featuredBox = await featured.boundingBox();
  const frameBox = await frame.boundingBox();
  const slideVisible = await slides.isVisible().catch(() => false);
  const activeSlideCount = await page.locator('.featured-viewer__slide--active').count();

  if (!featuredBox || featuredBox.height < 100) {
    issues.push(`${vpName}: featured section too small`);
  }
  if (!frameBox || (frameBox.height ?? 0) < 200) {
    issues.push(`${vpName}: featured frame height ${frameBox?.height ?? 0}px`);
  }
  if (!slideVisible) issues.push(`${vpName}: active slide image not visible`);
  if (activeSlideCount === 0) issues.push(`${vpName}: no active slide`);

  await featured.screenshot({ path: join(OUT, `${vpName}-featured-crop.png`) });

  return { frameHeight: frameBox?.height, slideVisible, activeSlideCount };
}

for (const vp of viewports) {
  const browser = await chromium.launch();
  const context = await browser.newContext(
    vp.viewport ? { viewport: vp.viewport } : vp
  );
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  const teamResult = await auditTeam(page, vp.name);
  const processResult = await auditProcess(page, vp.name);
  const featuredResult = await auditFeatured(page, vp.name);

  const scriptSrc = await page.locator('script[src*="script.js"]').getAttribute('src');
  const hasTeamStrip = await page.locator('#team-strip').count();

  if (hasTeamStrip === 0) {
    issues.push(`${vp.name}: #team-strip missing — old HTML may be cached`);
  }
  if (!scriptSrc?.includes('v=')) {
    issues.push(`${vp.name}: script.js missing cache-bust query param`);
  }

  const marathiHeadings = await page.locator('.section__title-mr').count();
  const marathiHero = await page.locator('.hero__brand-mr').count();
  if (marathiHeadings < 6) {
    issues.push(`${vp.name}: expected Marathi section headings, found ${marathiHeadings}`);
  }
  if (marathiHero === 0) {
    issues.push(`${vp.name}: hero Marathi brand line missing`);
  }

  results.push({
    viewport: vp.name,
    scriptSrc,
    team: teamResult,
    process: processResult,
    featured: featuredResult,
    consoleErrors,
  });

  await browser.close();
}

writeFileSync(join(OUT, 'audit-report.json'), JSON.stringify({ base: BASE, results, issues }, null, 2));

console.log(JSON.stringify({ base: BASE, results, issues }, null, 2));

if (issues.length) {
  console.log('\nISSUES:', issues.join('\n'));
  process.exit(1);
}
console.log('\nAudit OK — mobile & desktop team, process, and featured verified.');
