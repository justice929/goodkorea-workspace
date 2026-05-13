const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Vite frontend via PM2 wrapper...');

const child = spawn('cmd.exe', ['/c', 'npm', 'run', 'dev', '--', '--host'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});
