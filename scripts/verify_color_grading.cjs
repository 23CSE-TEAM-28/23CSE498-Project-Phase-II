const puppeteer = require('/Users/aksharsakhi/.gemini/antigravity-ide/brain/31c4098c-c85c-4408-9ac2-d96724f48013/scratch/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = '/Users/aksharsakhi/.gemini/antigravity/brain/55f94ce2-73b7-49d9-8e62-56b35f390040/dashboard_screens';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching Chrome to verify color grading fixes...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1500, height: 950, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 950 });

  // Navigate to login
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await sleep(1000);

  // Login as Doctor Pallavi
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Dr. Pallavi'));
    if (btn) btn.click();
  });
  await sleep(1500);

  // Navigate to Prediction tab (Sepsis Neural Inference)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Sepsis Neural Inference'));
    if (btn) btn.click();
  });
  await sleep(2500);

  // 1. Dark Mode Overview of Prediction Screen
  console.log('Capturing Dark Mode Prediction Screen...');
  await page.screenshot({ path: path.join(OUT_DIR, 'fix_01_prediction_dark.png') });

  // 2. Dark Mode Hover over chart using coordinates
  console.log('Hovering over chart in Dark Mode...');
  const chartBox = await page.evaluate(() => {
    const chart = document.querySelector('.recharts-responsive-container');
    if (!chart) return null;
    const rect = chart.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  });

  if (chartBox) {
    // Hover over FPDAF v1 (~75% across chart width)
    await page.mouse.move(chartBox.x + chartBox.width * 0.72, chartBox.y + chartBox.height * 0.5);
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'fix_02_prediction_dark_hover_fpdaf_v1.png') });

    // Hover over FPDAF-v2 (~90% across chart width)
    await page.mouse.move(chartBox.x + chartBox.width * 0.88, chartBox.y + chartBox.height * 0.3);
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'fix_03_prediction_dark_hover_fpdaf_v2.png') });
  }

  // 3. Toggle to Light Mode
  console.log('Toggling to Light Mode...');
  await page.evaluate(() => {
    const themeBtn = document.querySelector('button[title="Toggle Light/Dark Mode"]');
    if (themeBtn) themeBtn.click();
  });
  await sleep(1500);

  // 4. Light Mode Overview of Prediction Screen
  console.log('Capturing Light Mode Prediction Screen...');
  await page.screenshot({ path: path.join(OUT_DIR, 'fix_04_prediction_light.png') });

  // 5. Light Mode Hover over FPDAF v1 & FPDAF-v2
  if (chartBox) {
    console.log('Hovering over chart in Light Mode...');
    await page.mouse.move(chartBox.x + chartBox.width * 0.72, chartBox.y + chartBox.height * 0.5);
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'fix_05_prediction_light_hover_fpdaf_v1.png') });

    await page.mouse.move(chartBox.x + chartBox.width * 0.88, chartBox.y + chartBox.height * 0.3);
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'fix_06_prediction_light_hover_fpdaf_v2.png') });
  }

  await browser.close();
  console.log('All screenshots saved successfully!');
}

run().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
