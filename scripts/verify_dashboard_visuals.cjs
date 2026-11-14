const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173/';
const OUT_DIR = '/Users/aksharsakhi/.gemini/antigravity/brain/55f94ce2-73b7-49d9-8e62-56b35f390040';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching headless Chrome for Visual Audit...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log('1. Navigating to dashboard...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Login as Doctor
  console.log('2. Logging in as Doctor Pallavi...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Dr. Pallavi'));
    if (btn) btn.click();
  });
  await sleep(2000);

  // A. DARK MODE SCREENSHOTS
  console.log('--- CAPTURING DARK MODE ---');
  // 1. Dashboard CDSS Overview
  await page.screenshot({ path: path.join(OUT_DIR, 'dash_dark_cdss_verified.png') });

  // 2. Click Patient Registry and select HOSP-P01
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('ICU Patient Registry'));
    if (btn) btn.click();
  });
  await sleep(1500);

  // Filter Clinical Partner Hospital
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const sel of selects) {
      for (const opt of sel.options) {
        if (opt.text.includes('Clinical Partner Hospital') || opt.value.includes('Clinical Partner Hospital')) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }
      }
    }
  });
  await sleep(1500);

  // Click HOSP-P01
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const p1Btn = allButtons.find(b => b.closest('tr')?.textContent.includes('HOSP-P01') || b.textContent.includes('HOSP-P01'));
    if (p1Btn) p1Btn.click();
  });
  await sleep(2000);

  // 3. Patient Details HOSP-P01 (Dark)
  await page.screenshot({ path: path.join(OUT_DIR, 'dash_dark_patient_details.png') });

  // 4. Sepsis Predict & PyTorch (Dark)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Sepsis Predict & PyTorch'));
    if (btn) btn.click();
  });
  await sleep(2500);
  await page.screenshot({ path: path.join(OUT_DIR, 'dash_dark_predict_nosliders.png') });

  // 5. Explainable AI & Feature Heatmaps (Dark)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Explainable AI & Feature Heatmaps'));
    if (btn) btn.click();
  });
  await sleep(2500);
  // Scroll down to show Pillar 3
  await page.evaluate(() => window.scrollBy(0, 700));
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'dash_dark_xai_nosliders.png') });

  // B. SWITCH TO LIGHT MODE
  console.log('--- SWITCHING TO LIGHT MODE ---');
  await page.evaluate(() => {
    // Find theme toggle button (moon/sun icon) in header
    const buttons = Array.from(document.querySelectorAll('header button'));
    // Theme toggle is usually the button with title or icon for theme
    const themeBtn = buttons.find(b => b.title?.toLowerCase().includes('mode') || b.title?.toLowerCase().includes('theme') || b.querySelector('svg'));
    if (themeBtn) themeBtn.click();
    // Direct toggle on html tag if needed
    if (!document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  });
  await sleep(1500);

  // 6. Explainable AI in Light Mode
  await page.screenshot({ path: path.join(OUT_DIR, 'dash_light_xai_nosliders.png') });

  // 7. Sepsis Predict in Light Mode
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Sepsis Predict & PyTorch'));
    if (btn) btn.click();
  });
  await sleep(2500);
  await page.screenshot({ path: path.join(OUT_DIR, 'dash_light_predict_nosliders.png') });

  // 8. Patient Details in Light Mode
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Bedside Monitor'));
    if (btn) btn.click();
  });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'dash_light_patient_details_contrast.png') });

  // 9. Dashboard CDSS in Light Mode
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('ICU CDSS Overview'));
    if (btn) btn.click();
  });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'dash_light_cdss_verified.png') });

  await browser.close();
  console.log('✓ All visual audit screenshots generated successfully!');
}

run().catch(err => {
  console.error('Error during visual capture:', err);
  process.exit(1);
});
