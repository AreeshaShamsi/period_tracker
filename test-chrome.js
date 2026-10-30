const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Use Chrome to dump DOM of http://localhost:8081/calendar
  const res = execSync(
    '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --disable-gpu --dump-dom "http://localhost:8081/calendar"',
    { encoding: 'utf8', timeout: 15000 }
  );
  console.log('DOM length:', res.length);
  console.log('DOM snippet:', res.substring(0, 1000));
  fs.writeFileSync('chrome_dom.html', res);
} catch (e) {
  console.error('Chrome exec error:', e.message);
}
