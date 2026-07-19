import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sessionId = 'expo-go-stuck';
const host = '0.0.0.0';
const port = 7777;
const outdir = path.resolve('.dbg');

fs.mkdirSync(outdir, { recursive: true });

const logFile = path.join(outdir, `trae-debug-log-${sessionId}.ndjson`);
const envFile = path.join(outdir, `${sessionId}.env`);

const networkIp =
  Object.values(os.networkInterfaces())
    .flat()
    .find((entry) => entry && entry.family === 'IPv4' && !entry.internal)?.address ?? '127.0.0.1';

try {
  fs.rmSync(logFile, { force: true });
} catch {}

fs.writeFileSync(
  envFile,
  `DEBUG_SERVER_URL=http://${networkIp}:${port}/event\nDEBUG_SESSION_ID=${sessionId}\n`,
  'utf8'
);

const reply = (res, status, body) => {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  });
  res.end(body);
};

http
  .createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      reply(res, 204, '');
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      reply(res, 200, JSON.stringify({ ok: true, sessionId, logFile }));
      return;
    }

    if (req.method === 'GET' && req.url === '/logs') {
      reply(
        res,
        200,
        JSON.stringify({
          ok: true,
          body: fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8') : '',
        })
      );
      return;
    }

    if (req.method === 'POST' && req.url === '/event') {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', () => {
        try {
          const event = JSON.parse(raw || '{}');
          if (!event.ts) event.ts = Date.now();
          fs.appendFileSync(logFile, `${JSON.stringify(event)}\n`, 'utf8');
          reply(res, 200, JSON.stringify({ ok: true }));
        } catch (error) {
          reply(res, 400, JSON.stringify({ ok: false, error: String(error) }));
        }
      });
      return;
    }

    reply(res, 404, JSON.stringify({ ok: false }));
  })
  .listen(port, host, () => {
    console.log('@@DEBUG_SERVER_INFO');
    console.log(
      JSON.stringify(
        {
          api_url: `http://${networkIp}:${port}/event`,
          session_id: sessionId,
          log_dir: outdir,
          log_file: logFile,
          env_file: envFile,
        },
        null,
        2
      )
    );
    console.log('@@END_DEBUG_SERVER_INFO');
  });
