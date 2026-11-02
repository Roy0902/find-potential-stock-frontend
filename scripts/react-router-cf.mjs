import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../node_modules/@react-router/dev/bin.js', import.meta.url));
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Usage: node scripts/react-router-cf.mjs <build|dev> [options]');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [cli, command, '--config', 'vite.cloudflare.config.ts', ...args],
  {
    stdio: 'inherit',
    env: { ...process.env, CF: '1' },
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
