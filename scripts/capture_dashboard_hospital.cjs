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
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log('1. Navigating to dashboard at:', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Quick Login as Doctor (Full Access / Clinician)
  console.log('2. Logging in as Doctor...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Dr. Pallavi'));
    if (btn) btn.click();
  });
  await sleep(2000);

  // 3. Navigate to ICU Patient Registry (tab id 'patients')
  console.log('3. Navigating to ICU Patient Registry...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('ICU Patient Registry'));
    if (btn) btn.click();
  });
  await sleep(2000);

  // Screenshot Patient List
  const listAllPath = path.join(OUT_DIR, 'dash_patient_registry_all.png');
  await page.screenshot({ path: listAllPath });
  console.log('Saved:', listAllPath);

  // 4. Select Clinical Partner Hospital in dropdown
  console.log('4. Selecting Clinical Partner Hospital filter...');
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    for (const sel of selects) {
      for (const opt of sel.options) {
        if (opt.value.includes('Clinical Partner Hospital') || opt.text.includes('Clinical Partner Hospital')) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }
      }
    }
  });
  await sleep(1500);

  const listPartnerPath = path.join(OUT_DIR, 'dash_partner_hospital_filtered.png');
  await page.screenshot({ path: listPartnerPath });
  console.log('Saved:', listPartnerPath);

  // 5. Click on HOSP-P18 Clinical Profile
  console.log('5. Clicking on HOSP-P18 Clinical Profile...');
  const clickedP18 = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr, div'));
    const p18Row = rows.find(r => r.textContent.includes('HOSP-P18') && r.textContent.includes('Bedside Monitor'));
    if (p18Row) {
      const btn = p18Row.querySelector('button');
      if (btn) { btn.click(); return true; }
    }
    // Fallback: any button near HOSP-P18
    const allButtons = Array.from(document.querySelectorAll('button'));
    const p18Btn = allButtons.find(b => b.closest('tr')?.textContent.includes('HOSP-P18') || b.textContent.includes('HOSP-P18'));
    if (p18Btn) { p18Btn.click(); return true; }
    return false;
  });
  console.log('Clicked P18:', clickedP18);
  await sleep(2500);

  const p18DetailsPath = path.join(OUT_DIR, 'dash_hosp_p18_monitor.png');
  await page.screenshot({ path: p18DetailsPath });
  console.log('Saved:', p18DetailsPath);

  // 6. Navigate to Sepsis Predict & PyTorch live inference screen
  console.log('6. Navigating to Sepsis Predict & PyTorch screen...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Sepsis Predict & PyTorch'));
    if (btn) btn.click();
  });
  await sleep(2500);

  const predictPath = path.join(OUT_DIR, 'dash_hosp_p18_pytorch_prediction.png');
  await page.screenshot({ path: predictPath });
  console.log('Saved:', predictPath);

  await browser.close();
  console.log('✓ All hospital patient screenshots generated successfully!');
}

run().catch(err => {
  console.error('Error running capture:', err);
  process.exit(1);
});
