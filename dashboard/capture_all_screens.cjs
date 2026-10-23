const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5175/';
const OUT_DIR = path.join(__dirname, 'screenshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('🚀 Launching headless Chrome at:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('1. Navigating to Login Page...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '01_login_screen.png'), fullPage: false });
  console.log('✓ Captured 01_login_screen.png');

  // Quick Login as Doctor
  console.log('Logging in via Quick Login...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Dr. Pallavi')) {
      await btn.click();
      break;
    }
  }
  await sleep(2000);

  // Switch to "All Modules" in header so all tabs are visible
  console.log('Activating All Modules role in Header...');
  const headerButtons = await page.$$('header button');
  for (const btn of headerButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('All Modules')) {
      await btn.click();
      break;
    }
  }
  await sleep(1000);

  // Helper to click sidebar tab by matching label text
  async function clickTab(labelText) {
    const navButtons = await page.$$('aside nav button');
    for (const btn of navButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.toLowerCase().includes(labelText.toLowerCase())) {
        await btn.click();
        await sleep(1200);
        return true;
      }
    }
    return false;
  }

  // 02. Doctor ICU CDSS
  console.log('2. Capturing Doctor ICU CDSS...');
  await clickTab('Doctor ICU CDSS');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '02_doctor_cdss_overview.png') });
  console.log('✓ Captured 02_doctor_cdss_overview.png');

  // 03. Hospital Network (3 Nodes)
  console.log('3. Capturing Hospital Network...');
  await clickTab('Hospital Network');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '03_hospital_network_nodes.png') });
  console.log('✓ Captured 03_hospital_network_nodes.png');

  // 04. Hospital Admin Operations & Audit
  console.log('4. Capturing Hospital Admin Operations...');
  await clickTab('Hospital Operations');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '04_hospital_admin_operations.png') });
  console.log('✓ Captured 04_hospital_admin_operations.png');

  // 05. ICU Patient Registry (50 Cohort)
  console.log('5. Capturing ICU Patient Registry...');
  await clickTab('ICU Patient Registry');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '05_patient_registry.png') });
  console.log('✓ Captured 05_patient_registry.png');

  // 06. Patient Bedside Monitor
  console.log('6. Capturing Patient Bedside Monitor...');
  await clickTab('Patient Bedside Monitor');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '06_patient_bedside_monitor.png') });
  console.log('✓ Captured 06_patient_bedside_monitor.png');

  // 07. Sepsis Predict & PyTorch Simulator
  console.log('7. Capturing Sepsis Predictor & Live PyTorch Engine...');
  await clickTab('Sepsis Predict & PyTorch');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '07_sepsis_predictor_live_pytorch.png') });
  console.log('✓ Captured 07_sepsis_predictor_live_pytorch.png');

  // 08. Hour-1 SSC Bundle Sub-tab on Prediction Screen
  console.log('8. Capturing Hour-1 Sepsis Resuscitation Bundle...');
  const mainButtons = await page.$$('main button');
  for (const btn of mainButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Hour-1 SSC Bundle')) {
      await btn.click();
      break;
    }
  }
  await sleep(1200);
  await page.screenshot({ path: path.join(OUT_DIR, '08_hour1_sepsis_resuscitation_bundle.png') });
  console.log('✓ Captured 08_hour1_sepsis_resuscitation_bundle.png');

  // 14. Bedside Clinical Summary Modal
  console.log('14. Capturing Bedside Clinical Summary Modal...');
  const summaryButtons = await page.$$('main button');
  for (const btn of summaryButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Summary')) {
      await btn.click();
      break;
    }
  }
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '14_bedside_clinical_report_modal.png') });
  console.log('✓ Captured 14_bedside_clinical_report_modal.png');

  // Close modal by clicking Close button
  const modalCloseButtons = await page.$$('button');
  for (const btn of modalCloseButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.trim() === 'Close') {
      await btn.click();
      break;
    }
  }
  await sleep(800);

  // 09. Explainable AI (XAI)
  console.log('9. Capturing Explainable AI...');
  await clickTab('Explainable AI');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '09_explainable_ai_temporal_attention.png') });
  console.log('✓ Captured 09_explainable_ai_temporal_attention.png');

  // 10. AD-CUSUM Drift Monitor
  console.log('10. Capturing AD-CUSUM Drift Monitor...');
  await clickTab('AD-CUSUM Drift Monitor');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '10_ad_cusum_drift_monitor.png') });
  console.log('✓ Captured 10_ad_cusum_drift_monitor.png');

  // 11. Federated Learning Hub
  console.log('11. Capturing Federated Learning Hub...');
  await clickTab('Federated Learning Hub');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '11_federated_learning_hub.png') });
  console.log('✓ Captured 11_federated_learning_hub.png');

  // 12. 6-Way Model Benchmark
  console.log('12. Capturing 6-Way Model Benchmark...');
  await clickTab('6-Way Model Benchmark');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '12_model_benchmarks_six_way.png') });
  console.log('✓ Captured 12_model_benchmarks_six_way.png');

  // 13. Research & Methodology
  console.log('13. Capturing Research & Methodology...');
  await clickTab('Research & Methodology');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '13_research_methodology.png') });
  console.log('✓ Captured 13_research_methodology.png');

  await browser.close();
  console.log('🎉 ALL SCREENSHOTS CAPTURED SUCCESSFULLY IN dashboard/screenshots/ !');
}

capture().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
