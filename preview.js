const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 4173;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      return;
    }
    const ext = path.extname(filePath);
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  const resolved = path.join(ROOT, safePath || 'index.html');
  let target = resolved;

  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    target = path.join(resolved, 'index.html');
  }

  serveFile(target, res);
});

server.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
});
