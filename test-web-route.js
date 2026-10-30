const http = require('http');

function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:8081${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const rootIdx = data.indexOf('id="root"');
        const snippet = rootIdx !== -1 ? data.substring(rootIdx, rootIdx + 300) : 'none';
        resolve({ path, status: res.statusCode, snippet });
      });
    }).on('error', err => resolve({ path, error: err.message }));
  });
}

async function run() {
  console.log(await checkRoute('/'));
  console.log(await checkRoute('/calendar'));
  console.log(await checkRoute('/(app)/(tabs)/calendar'));
}
run();
