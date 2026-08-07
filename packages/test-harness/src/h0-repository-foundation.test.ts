import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { describe, expect, it } from 'vitest';

const requiredPaths = [
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  'vitest.config.ts',
  'apps/cli/src/index.ts',
  'packages/contracts/package.json',
  'packages/domain/package.json',
  'packages/policy/package.json',
  'packages/capabilities/package.json',
  'packages/providers-mock/package.json',
  'packages/memory/package.json',
  'packages/agents/package.json',
  'packages/orchestrator/package.json',
  'packages/verification/package.json',
  'packages/quality/package.json',
  'packages/observability/package.json',
  'packages/test-fixtures/package.json',
  'packages/test-harness/package.json'
] as const;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

describe('H0 repository foundation', () => {
  it('contains every required headless package and root config', async () => {
    const results = await Promise.all(requiredPaths.map(async path => [path, await exists(path)] as const));
    expect(results.filter(([, present]) => !present)).toEqual([]);
  });

  it('keeps UI implementation locked', async () => {
    expect(await exists('apps/web')).toBe(false);
  });
});
