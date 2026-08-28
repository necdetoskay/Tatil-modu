import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-012-rv-b-001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function adjustSignal(signal: J, mentions: number, valid: number, confidence: number) { signal.mentionCount = mentions; signal.validSampleSize = valid; signal.prevalence = valid === 0 ? 0 : mentions / valid; signal.strength = signal.prevalence; signal.confidence = confidence; obj(signal.confidenceBasis).sampleSizeBand = valid <= 1 ? 'VERY_LOW' : valid < 5 ? 'LOW' : 'MEDIUM'; }

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; output.reviewAnalysisId = `review-analysis:${id.toLowerCase()}`; const sample = obj(output.sample); const signal = objs(output.signals)[0]!;
  switch (id) {
    case 'RV-B-001': break;
    case 'RV-B-002': input.records = [objs(input.records)[0]]; sample.rawCount = 1; sample.windowEligibleCount = 1; sample.entityMatchedCount = 1; sample.validCount = 1; output.dataCoverageStatus = 'INSUFFICIENT'; adjustSignal(signal, 1, 1, 0.45); output.overallConfidence = 0.45; break;
    case 'RV-B-003': input.records = objs(input.records).slice(0, 2); sample.rawCount = 2; sample.windowEligibleCount = 2; sample.entityMatchedCount = 2; sample.validCount = 2; output.dataCoverageStatus = 'LIMITED'; adjustSignal(signal, 2, 2, 0.55); output.overallConfidence = 0.55; break;
    case 'RV-B-004': sample.rawCount = 10; sample.windowEligibleCount = 10; sample.entityMatchedCount = 10; sample.validCount = 9; sample.duplicateRemoved = 1; adjustSignal(signal, 6, 9, 0.7); break;
    case 'RV-B-005': sample.validCount = 9; sample.suspectedSpamRemoved = 1; adjustSignal(signal, 5, 9, 0.65); break;
    case 'RV-B-006': sample.validCount = 9; sample.unusableRemoved = 1; adjustSignal(signal, 5, 9, 0.65); break;
    case 'RV-B-007': sample.entityMatchedCount = 9; sample.validCount = 9; adjustSignal(signal, 5, 9, 0.65); output.limitations = [...(output.limitations as unknown[]), 'wrong_entity_record_excluded']; break;
    case 'RV-B-008': sample.windowEligibleCount = 9; sample.entityMatchedCount = 9; sample.validCount = 9; adjustSignal(signal, 5, 9, 0.65); output.limitations = [...(output.limitations as unknown[]), 'outside_window_record_excluded']; break;
    case 'RV-B-009': adjustSignal(signal, 4, 10, 0.68); output.signals = [signal, { ...structuredClone(signal), reviewSignalId: 'review-signal:parking-positive', direction: 'POSITIVE', mentionCount: 3, prevalence: 0.3, strength: 0.3, confidence: 0.62, observationRefs: ['ev-rv-007', 'ev-rv-008', 'ev-rv-009'] }]; break;
    case 'RV-B-010': sample.sourceCount = 2; sample.sourceProviderRefs = ['reviews:p1', 'reviews:p2']; signal.sourceProviderRefs = ['reviews:p1', 'reviews:p2']; obj(signal.confidenceBasis).sourceCoverageBand = 'MULTI_SOURCE'; break;
    default: throw new Error(`UNSUPPORTED_REVIEW_FIXTURE:${id}`);
  }
  obj(output.snapshotWriteCandidate).signalRefs = objs(output.signals).map(item => item.reviewSignalId); obj(output.snapshotWriteCandidate).sourceProviderRefs = sample.sourceProviderRefs; return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const sample = obj(output.sample); const signals = objs(output.signals); const signal = signals[0]; const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  switch (fixture.fixtureId) {
    case 'RV-B-001': fail(signal?.mentionCount !== 6 || signal?.prevalence !== 0.6, 'RV_EXPECT_RECURRING_PARKING'); break;
    case 'RV-B-002': fail(sample.validCount !== 1 || Number(signal?.confidence) >= 0.8, 'RV_EXPECT_SINGLE_LOW_CONFIDENCE'); break;
    case 'RV-B-003': fail(sample.validCount !== 2 || output.dataCoverageStatus !== 'LIMITED', 'RV_EXPECT_SMALL_SAMPLE_LIMITED'); break;
    case 'RV-B-004': fail(sample.duplicateRemoved !== 1 || sample.validCount !== 9, 'RV_EXPECT_DUPLICATE_REMOVED'); break;
    case 'RV-B-005': fail(sample.suspectedSpamRemoved !== 1 || sample.validCount !== 9, 'RV_EXPECT_SPAM_REMOVED'); break;
    case 'RV-B-006': fail(sample.unusableRemoved !== 1 || sample.validCount !== 9, 'RV_EXPECT_EMPTY_REMOVED'); break;
    case 'RV-B-007': fail(sample.entityMatchedCount !== 9 || !(output.limitations as unknown[]).includes('wrong_entity_record_excluded'), 'RV_EXPECT_WRONG_ENTITY_EXCLUDED'); break;
    case 'RV-B-008': fail(sample.windowEligibleCount !== 9 || !(output.limitations as unknown[]).includes('outside_window_record_excluded'), 'RV_EXPECT_WINDOW_EXCLUDED'); break;
    case 'RV-B-009': fail(!signals.some(item => item.direction === 'NEGATIVE') || !signals.some(item => item.direction === 'POSITIVE'), 'RV_EXPECT_MIXED_OBSERVATIONS'); break;
    case 'RV-B-010': fail(sample.sourceCount !== 2 || obj(signal?.confidenceBasis).sourceCoverageBand !== 'MULTI_SOURCE', 'RV_EXPECT_MULTISOURCE'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-012 Review Intelligence', () => {
  it('executes the first 10 golden Review behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-012'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-012'); if (!pack || !schemas) throw new Error('TM-AG-012 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
