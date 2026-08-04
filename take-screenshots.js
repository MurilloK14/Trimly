const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  console.log("Taking screenshot of Dashboard...");
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'public', 'dashboard_demo.png') });
  
  console.log("Taking screenshot of Scheduling...");
  // Use the default scheduling link (e.g. /agendar) 
  await page.goto('http://localhost:3000/agendar', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'public', 'scheduling_demo.png') });

  await browser.close();
  console.log("Screenshots saved successfully.");
}

run().catch(console.error);
