import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'test-results';

function newestTrace(dir) {
  if (!existsSync(dir)) return null;
  let newest = null;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      const found = newestTrace(full);
      if (found && (!newest || found.mtime > newest.mtime)) newest = found;
    } else if (entry === 'trace.zip') {
      if (!newest || stat.mtimeMs > newest.mtime) newest = { path: full, mtime: stat.mtimeMs };
    }
  }
  return newest;
}

const trace = newestTrace(root);
if (!trace) {
  console.error('No trace found under test-results/. Run the suite first; traces are kept on failure.');
  process.exit(1);
}

console.log(`Opening ${trace.path}`);
execFileSync('npx', ['playwright', 'show-trace', trace.path], { stdio: 'inherit', shell: true });
