import { describe, expect, it } from 'vitest';
import {
  compileRegistrySchemas,
  loadAgentRegistry,
  validateWithCompiledSchema
} from '../../harness/src/index.js';

describe('M1.2 R0 JSON Schema compilation', () => {
  it('compiles every canonical input and output schema with Draft 2020-12', async () => {
    const registry = await loadAgentRegistry();
    const result = await compileRegistrySchemas(registry);

    expect(result.errors).toEqual([]);
    expect(result.compiled).toHaveLength(17);
    expect(new Set(result.compiled.flatMap(item => [item.inputSchemaId, item.outputSchemaId])).size).toBe(34);
  });

  it('rejects a trivially invalid payload for every compiled schema', async () => {
    const registry = await loadAgentRegistry();
    const result = await compileRegistrySchemas(registry);
    expect(result.errors).toEqual([]);

    const falseAccepts: string[] = [];
    for (const item of result.compiled) {
      if (validateWithCompiledSchema(item.inputValidator, {}, item.componentId, 'input').length === 0) {
        falseAccepts.push(`${item.componentId}:input`);
      }
      if (validateWithCompiledSchema(item.outputValidator, {}, item.componentId, 'output').length === 0) {
        falseAccepts.push(`${item.componentId}:output`);
      }
    }

    expect(falseAccepts).toEqual([]);
  });

  it('exposes deterministic validation errors rather than throwing for invalid data', async () => {
    const registry = await loadAgentRegistry();
    const result = await compileRegistrySchemas(registry);
    expect(result.errors).toEqual([]);

    const profile = result.compiled.find(item => item.componentId === 'TM-AG-001');
    expect(profile).toBeDefined();

    const errors = validateWithCompiledSchema(profile!.inputValidator, {}, 'TM-AG-001', 'input');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every(error => error.startsWith('TM-AG-001:input:'))).toBe(true);
  });
});
