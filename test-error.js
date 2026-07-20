import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  
  await page.evaluate(() => {
    localStorage.setItem('enako_access_token', 'fake-token');
    localStorage.setItem('enako_user', JSON.stringify({
      id: '1',
      email: 'ceo@enakoos.com',
      fullName: 'Jane Doe',
      role: 'CEO',
      department: 'Executive'
    }));
  });
  
  await page.goto('http://localhost:3000/app/dashboard', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
