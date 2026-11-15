const puppeteer = require('/Users/aksharsakhi/.gemini/antigravity-ide/brain/31c4098c-c85c-4408-9ac2-d96724f48013/scratch/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = '/Users/aksharsakhi/.gemini/antigravity/brain/55f94ce2-73b7-49d9-8e62-56b35f390040/dashboard_screens';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching headless Chrome for PAT-1033 XAI verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1560, height: 1250, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1560, height: 1250 });

  // Navigate to login
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await sleep(1000);

  // Login as Doctor Pallavi
  console.log('Logging in as Dr. Pallavi...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Dr. Pallavi'));
    if (btn) btn.click();
  });
  await sleep(1500);

  // Navigate to Prediction tab (Sepsis Neural Inference)
  console.log('Navigating to Sepsis Neural Inference...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Sepsis Neural Inference'));
    if (btn) btn.click();
  });
  await sleep(2500);

  // Click 'Open PAT-1033 XAI Explanation'
  console.log('Clicking "Open PAT-1033 XAI Explanation"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('XAI Explanation'));
    if (btn) btn.click();
  });
  await sleep(2500);

  // 1. Capture Dark Mode: 'Why' tab for PAT-1033
  console.log('Capturing pat1033_xai_01_why_dark.png...');
  await page.screenshot({ path: path.join(OUT_DIR, 'pat1033_xai_01_why_dark.png') });

  // 2. Click 'How' tab
  console.log('Clicking "How" tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.trim() === 'How');
    if (btn) btn.click();
  });
  await sleep(800);
  console.log('Capturing pat1033_xai_02_how_dark.png...');
  await page.screenshot({ path: path.join(OUT_DIR, 'pat1033_xai_02_how_dark.png') });

  // 3. Click 'Action' tab
  console.log('Clicking "Action" tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.trim() === 'Action');
    if (btn) btn.click();
  });
  await sleep(800);
  console.log('Capturing pat1033_xai_03_action_dark.png...');
  await page.screenshot({ path: path.join(OUT_DIR, 'pat1033_xai_03_action_dark.png') });

  // 4. Click 'Copy Rationale to Medical Notes'
  console.log('Clicking Copy Rationale button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Copy Rationale'));
    if (btn) btn.click();
  });
  await sleep(500);
  console.log('Capturing pat1033_xai_04_copied_feedback.png...');
  await page.screenshot({ path: path.join(OUT_DIR, 'pat1033_xai_04_copied_feedback.png') });

  // 5. Switch to Light Mode and return to 'Why' tab
  console.log('Toggling to Light Mode...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const whyBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'Why');
    if (whyBtn) whyBtn.click();
    
    // Theme toggle button
    const themeBtn = buttons.find(b => b.getAttribute('title')?.toLowerCase().includes('theme') || b.querySelector('svg.lucide-sun') || b.querySelector('svg.lucide-moon'));
    if (themeBtn) themeBtn.click();
  });
  await sleep(1500);

  console.log('Capturing pat1033_xai_05_why_light.png...');
  await page.screenshot({ path: path.join(OUT_DIR, 'pat1033_xai_05_why_light.png') });

  await browser.close();
  console.log('PAT-1033 XAI screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
