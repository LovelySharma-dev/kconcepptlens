import { spawn } from 'node:child_process';

const server = spawn('npm', ['run', 'dev', '--workspace=server'], {
  stdio: 'inherit',
  shell: true
});
const client = spawn('npm', ['run', 'dev', '--workspace=client'], {
  stdio: 'inherit',
  shell: true
});

function shutdown() {
  server.kill();
  client.kill();
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
