import { spawn } from 'node:child_process';
import http from 'node:http';

const healthUrl = 'http://127.0.0.1:5000/api/health';

const server = spawn('npm', ['run', 'dev', '--workspace=server'], {
  stdio: 'inherit',
  shell: true
});

let client = null;

function shutdown() {
  if (client) client.kill();
  server.kill();
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

function waitForHealth(timeoutMs) {
  const started = Date.now();
  return new Promise((resolve) => {
    const attempt = () => {
      if (Date.now() - started > timeoutMs) {
        resolve(false);
        return;
      }
      const request = http.get(healthUrl, (response) => {
        response.resume();
        if (response.statusCode === 200) resolve(true);
        else setTimeout(attempt, 250);
      });
      request.setTimeout(1000, () => request.destroy());
      request.on('error', () => setTimeout(attempt, 250));
    };
    attempt();
  });
}

const ready = await waitForHealth(25000);
if (!ready) {
  console.error('Backend did not answer /api/health on port 5000. Starting Vite anyway so later API failures stay visible.');
} else {
  console.log('Backend health check succeeded. Starting Vite.');
}

client = spawn('npm', ['run', 'dev', '--workspace=client'], {
  stdio: 'inherit',
  shell: true
});
