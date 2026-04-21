const http = require('http');

const PORT = process.env.SERVICE_PORT || 8081;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'kijanikiosk-payments' }));
});

server.listen(PORT, () => {
  console.log(`KijaniKiosk Payments running on port ${PORT}`);
});

module.exports = server;
// v2
