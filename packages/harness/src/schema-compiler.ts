import { createRequire } from 'node:module';
import type { ErrorObject, ValidateFunction } from 'ajv';
import type { AgentRegistry } from './agent-registry.js';
import { loadResolvedContractBundle } from './contract-loader.js';

interface ContractSchemaCompiler {
  addSchema(schema: Record<string, unknown>): unknown;
  getSchema(id: string): ValidateFunction | undefined;
  compile(schema: Record<string, unknown>): ValidateFunction;
}

type Ajv2020Constructor = new (options: {
  allErrors: boolean;
  strict: boolean;
  allowUnionTypes: boolean;
  validateFormats: boolean;
}) => ContractSchemaCompiler;

type AddFormats = (ajv: ContractSchemaCompiler) => unknown;

const require = createRequire(import.meta.url);
const ajv2020Module = require('ajv/dist/2020.js') as { default?: Ajv2020Constructor } | Ajv2020Constructor;
const ajvFormatsModule = require('ajv-formats') as { default?: AddFormats } | AddFormats;

function resolveAjv2020Constructor(): Ajv2020Constructor {
  if (typeof ajv2020Module === 'function') return ajv2020Module;
  if (typeof ajv2020Module.default === 'function') return ajv2020Module.default;
  throw new Error('AJV2020_CONSTRUCTOR_NOT_FOUND');
}

function resolveAddFormats(): AddFormats {
  if (typeof ajvFormatsModule === 'function') return ajvFormatsModule;
  if (typeof ajvFormatsModule.default === 'function') return ajvFormatsModule.default;
  throw new Error('AJV_FORMATS_FUNCTION_NOT_FOUND');
}

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

export function createContractSchemaCompiler(): ContractSchemaCompiler {
  const Ajv2020 = resolveAjv2020Constructor();
  const addFormats = resolveAddFormats();
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
