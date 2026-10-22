const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002/');
  await page.waitForTimeout(3000);
  
  const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log("ROOT CONTENT:", rootHtml.substring(0, 500));
  
  await browser.close();
})();
