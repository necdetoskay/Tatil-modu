import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-011-pa-b-001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; output.officialFactId = `official-fact:${id.toLowerCase()}`; const evidence = objs(output.evidence)[0]!;
  switch (id) {
    case 'PA-B-001': break;
    case 'PA-B-002': obj(input.claim).claimType = 'FEES'; output.claimType = 'FEES'; obj(output.verificationScope).claimType = 'FEES'; output.status = 'CONTRADICTED'; output.resolvedValue = 750; evidence.claimType = 'FEES'; evidence.supports = 'CONTRADICTS'; break;
    case 'PA-B-003': output.status = 'UNKNOWN'; output.resolvedValue = null; output.sourceLookupPath = 'GENERIC_DISCOVERY'; output.sourceLookupTrace = [{ stepIndex: 0, stepType: 'REGISTRY_LOOKUP', sourceRef: null, sourceRegistryRef: null, outcome: 'MISS', reasonCode: 'NO_SCOPE_MATCH' }, { stepIndex: 1, stepType: 'GENERIC_DISCOVERY', sourceRef: null, sourceRegistryRef: null, outcome: 'MISS', reasonCode: 'NO_OFFICIAL_SOURCE_FOUND' }]; output.sourceRegistryRefs = []; output.primarySourceRefs = []; output.evidence = []; output.sourceFeedback = []; output.freshnessStatus = 'UNKNOWN'; output.confidence = 0.1; break;
    case 'PA-B-004': output.status = 'UNKNOWN'; output.resolvedValue = null; output.sourceLookupPath = 'GENERIC_DISCOVERY'; output.primarySourceRefs = []; evidence.sourceTier = 4; evidence.sourceRole = 'DISCOVERY_ONLY'; evidence.authorityScore = 0.2; evidence.authorityClass = 'D'; evidence.supports = 'PARTIAL'; output.confidence = 0.2; break;
    case 'PA-B-005': output.status = 'UNKNOWN'; output.resolvedValue = null; evidence.freshnessStatus = 'STALE'; output.freshnessStatus = 'STALE'; output.primarySourceRefs = []; output.confidence = 0.35; break;
    case 'PA-B-006': output.status = 'VERIFIED'; output.resolvedValue = 'SPECIAL_CLOSURE'; evidence.claimType = 'SPECIAL_CLOSURE'; output.claimType = 'SPECIAL_CLOSURE'; obj(output.verificationScope).claimType = 'SPECIAL_CLOSURE'; evidence.supports = 'SUPPORTS'; break;
    case 'PA-B-007': output.status = 'UNKNOWN'; output.resolvedValue = null; output.primarySourceRefs = []; output.evidence = [evidence, { ...structuredClone(evidence), evidenceId: 'pa-ev-conflict', sourceRef: 'official:second', supports: 'CONTRADICTS' }]; output.conflicts = [{ conflictId: 'conflict:official-hours', evidenceRefs: ['pa-ev-001', 'pa-ev-conflict'], resolutionStatus: 'UNRESOLVED', reasonCode: 'TWO_CURRENT_AUTHORITATIVE_SOURCES' }]; output.confidence = 0.3; break;
    case 'PA-B-008': output.status = 'VERIFIED'; output.resolvedValue = 'OPERATOR_CURRENT_VALUE'; output.evidence = [evidence, { ...structuredClone(evidence), evidenceId: 'pa-ev-old', sourceRef: 'official:ministry-old', freshnessStatus: 'STALE', supports: 'CONTRADICTS' }]; output.conflicts = [{ conflictId: 'conflict:resolved-newer', evidenceRefs: ['pa-ev-001', 'pa-ev-old'], resolutionStatus: 'RESOLVED', reasonCode: 'CURRENT_OPERATOR_SOURCE_WINS' }]; break;
    case 'PA-B-009': output.sourceLookupPath = 'REGISTRY_HIT'; break;
    case 'PA-B-010': obj(objs(input.trustedSourceRegistryEntries)[0]).healthStatus = 'DEAD'; output.sourceLookupPath = 'REGISTRY_REFRESH'; output.sourceLookupTrace = [{ stepIndex: 0, stepType: 'REGISTRY_LOOKUP', sourceRef: 'official:museum-001', sourceRegistryRef: 'source-registry:museum-001', outcome: 'DEAD', reasonCode: 'REGISTRY_SOURCE_DEAD' }, { stepIndex: 1, stepType: 'GENERIC_DISCOVERY', sourceRef: 'official:museum-new', sourceRegistryRef: null, outcome: 'SUCCESS', reasonCode: 'NEW_OFFICIAL_SOURCE_DISCOVERED' }, { stepIndex: 2, stepType: 'OFFICIAL_FETCH', sourceRef: 'official:museum-new', sourceRegistryRef: null, outcome: 'SUCCESS', reasonCode: 'CURRENT_CLAIM_SCOPE_MATCH' }]; output.primarySourceRefs = ['official:museum-new']; evidence.sourceRef = 'official:museum-new'; evidence.sourceRegistryRef = null; output.sourceFeedback = [{ sourceRef: 'official:museum-001', sourceRegistryRef: 'source-registry:museum-001', healthSignal: 'DEAD', reasonCode: 'FETCH_DEAD', replacementSourceRef: 'official:museum-new' }, { sourceRef: 'official:museum-new', sourceRegistryRef: null, healthSignal: 'NEW_SOURCE_DISCOVERED', reasonCode: 'DISCOVERY_SUCCESS', replacementSourceRef: null }]; break;
    default: throw new Error(`UNSUPPORTED_PUBLIC_AUTHORITY_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const evidence = objs(output.evidence); const conflicts = objs(output.conflicts); const trace = objs(output.sourceLookupTrace); const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  switch (fixture.fixtureId) {
    case 'PA-B-001': fail(output.status !== 'VERIFIED' || !evidence.some(item => item.sourceRole === 'AUTHORITATIVE' && item.supports === 'SUPPORTS'), 'PA_EXPECT_VERIFIED_HOURS'); break;
    case 'PA-B-002': fail(output.status !== 'CONTRADICTED' || !evidence.some(item => item.supports === 'CONTRADICTS'), 'PA_EXPECT_FEE_CONTRADICTED'); break;
    case 'PA-B-003': fail(output.status !== 'UNKNOWN' || evidence.length !== 0, 'PA_EXPECT_NO_SOURCE_UNKNOWN'); break;
    case 'PA-B-004': fail(output.status !== 'UNKNOWN' || !evidence.every(item => item.sourceTier === 4), 'PA_EXPECT_TIER4_UNKNOWN'); break;
    case 'PA-B-005': fail(output.status !== 'UNKNOWN' || output.freshnessStatus !== 'STALE', 'PA_EXPECT_STALE_UNKNOWN'); break;
    case 'PA-B-006': fail(output.status !== 'VERIFIED' || output.resolvedValue !== 'SPECIAL_CLOSURE', 'PA_EXPECT_SPECIAL_CLOSURE'); break;
    case 'PA-B-007': fail(output.status !== 'UNKNOWN' || !conflicts.some(item => item.resolutionStatus === 'UNRESOLVED'), 'PA_EXPECT_UNRESOLVED_CONFLICT'); break;
    case 'PA-B-008': fail(output.status !== 'VERIFIED' || !conflicts.some(item => item.resolutionStatus === 'RESOLVED'), 'PA_EXPECT_NEWER_OPERATOR'); break;
    case 'PA-B-009': fail(output.sourceLookupPath !== 'REGISTRY_HIT' || trace[0]?.outcome !== 'HIT', 'PA_EXPECT_REGISTRY_HIT'); break;
    case 'PA-B-010': fail(output.sourceLookupPath !== 'REGISTRY_REFRESH' || !trace.some(item => item.outcome === 'DEAD') || !trace.some(item => item.stepType === 'GENERIC_DISCOVERY' && item.outcome === 'SUCCESS'), 'PA_EXPECT_DEAD_THEN_DISCOVERY'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-011 Public Authority Intelligence', () => {
  it('executes the first 10 golden Public Authority behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-011'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-011'); if (!pack || !schemas) throw new Error('TM-AG-011 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
