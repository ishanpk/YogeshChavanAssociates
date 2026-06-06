import { chromium, devices } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'https://ishanpk.github.io/YogeshChavanAssociates/';
const OUT = join(process.cwd(), 'audit-screenshots');
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: 'mobile-se', ...devices['iPhone SE'] },
  { name: 'mobile-14', ...devices['iPhone 14'] },
  { name: 'tablet', viewport: { width: 768, height: 1024 } },
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
];

const issues = [];

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
  await page.waitForTimeout(2000);

  const featured = page.locator('#featured');
  const frame = page.locator('#featured-frame');
  const slides = page.locator('.featured-viewer__slide--active img');
  const viewer = page.locator('#featured-viewer');

  await featured.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const featuredBox = await featured.boundingBox();
  const frameBox = await frame.boundingBox();
  const viewerBox = await viewer.boundingBox();
  const slideVisible = await slides.isVisible().catch(() => false);
  const slideSrc = slideVisible ? await slides.getAttribute('src') : null;
  const frameHeight = frameBox?.height ?? 0;
  const activeSlideCount = await page.locator('.featured-viewer__slide--active').count();

  if (!featuredBox || featuredBox.height < 100) issues.push(`${vp.name}: featured section too small`);
  if (!frameBox || frameHeight < 200) issues.push(`${vp.name}: featured frame height ${frameHeight}px`);
  if (!slideVisible) issues.push(`${vp.name}: active slide image not visible`);
  if (activeSlideCount === 0) issues.push(`${vp.name}: no active slide`);

  await page.screenshot({ path: join(OUT, `${vp.name}-featured.png`), fullPage: false });
  await featured.screenshot({ path: join(OUT, `${vp.name}-featured-crop.png`) });

  console.log(JSON.stringify({
    viewport: vp.name,
    featuredBox,
    frameBox,
    viewerBox,
    frameHeight,
    slideVisible,
    slideSrc,
    activeSlideCount,
    consoleErrors,
  }, null, 2));

  await browser.close();
}

if (issues.length) {
  console.log('\nISSUES:', issues.join('\n'));
  process.exit(1);
}
console.log('\nAudit OK');
