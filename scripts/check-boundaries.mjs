import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const forbidden = [
  ['packages/agents', '@tatil-modu/providers-mock'],
  ['packages/agents', '../providers-mock'],
  ['packages/agents', '@tatil-modu/orchestrator'],
  ['packages/policy', '@tatil-modu/agents'],
  ['packages/domain', '@tatil-modu/agents'],
  ['packages/contracts', '@tatil-modu/agents']
];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(path));
    else if (/\.(ts|mts|cts|js|mjs|cjs)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const violations = [];
for (const [scope, token] of forbidden) {
  const dir = join(root, scope);
  let files = [];
  try { files = await walk(dir); } catch { continue; }
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    if (text.includes(token)) violations.push(`${file}: forbidden dependency '${token}'`);
  }
}

if (violations.length) {
  console.error('Boundary violations:\n' + violations.join('\n'));
  process.exit(1);
}
console.log('Package boundaries: PASS');
