import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { AgentRegistry } from './agent-registry.js';
import { loadResolvedContractBundle } from './contract-loader.js';

export interface CompiledComponentSchemas {
  componentId: string;
  inputSchemaId: string;
  outputSchemaId: string;
  inputValidator: ValidateFunction;
  outputValidator: ValidateFunction;
}

export interface SchemaCompilationResult {
  compiled: CompiledComponentSchemas[];
  errors: string[];
}

export function createContractSchemaCompiler(): Ajv2020 {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    allowUnionTypes: true,
    validateFormats: true
  });
  addFormats(ajv);
  return ajv;
}

function schemaId(schema: Record<string, unknown>, componentId: string, kind: 'input' | 'output'): string {
  const id = schema.$id;
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error(`${componentId}:${kind}:SCHEMA_ID_MISSING`);
  }
  return id;
}

function formatAjvErrors(componentId: string, kind: 'input' | 'output', errors: ErrorObject[] | null | undefined): string[] {
  return (errors ?? []).map(error =>
    `${componentId}:${kind}:${error.keyword}:${error.instancePath || '/'}:${error.message ?? 'invalid'}`
  );
}

export async function compileRegistrySchemas(
  registry: AgentRegistry,
  repoRoot = process.cwd()
): Promise<SchemaCompilationResult> {
  const ajv = createContractSchemaCompiler();
  const bundles = await Promise.all(
    registry.entries.map(entry => loadResolvedContractBundle(entry, repoRoot))
  );
  const errors: string[] = [];

  for (const bundle of bundles) {
    try {
      ajv.addSchema(bundle.inputSchema);
    } catch (error) {
      errors.push(`${bundle.entry.componentId}:input:COMPILE_ADD:${error instanceof Error ? error.message : String(error)}`);
    }
    try {
      ajv.addSchema(bundle.outputSchema);
    } catch (error) {
      errors.push(`${bundle.entry.componentId}:output:COMPILE_ADD:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (errors.length > 0) return { compiled: [], errors: [...new Set(errors)].sort() };

  const compiled: CompiledComponentSchemas[] = [];
  for (const bundle of bundles) {
    const inputSchemaId = schemaId(bundle.inputSchema, bundle.entry.componentId, 'input');
    const outputSchemaId = schemaId(bundle.outputSchema, bundle.entry.componentId, 'output');

    try {
      const inputValidator = ajv.getSchema(inputSchemaId) ?? ajv.compile(bundle.inputSchema);
      const outputValidator = ajv.getSchema(outputSchemaId) ?? ajv.compile(bundle.outputSchema);
      compiled.push({
        componentId: bundle.entry.componentId,
        inputSchemaId,
        outputSchemaId,
        inputValidator,
        outputValidator
      });
    } catch (error) {
      errors.push(`${bundle.entry.componentId}:COMPILE:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { compiled, errors: [...new Set(errors)].sort() };
}

export function validateWithCompiledSchema(
  validator: ValidateFunction,
  data: unknown,
  componentId: string,
  kind: 'input' | 'output'
): string[] {
  const valid = validator(data);
  return valid ? [] : formatAjvErrors(componentId, kind, validator.errors);
}
