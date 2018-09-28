import http from 'http';
import WebSocket from 'ws';

export default function createMockRNServer(port = 8081) {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/debugger-ui') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html></html>');
    }
  });
  const wss = new WebSocket.Server({ server });
  server.listen(port);
  return { server, wss };
}
