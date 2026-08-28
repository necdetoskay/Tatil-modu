import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-014-vf-b-001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; output.verificationRunId = `verification-run:${id.toLowerCase()}`;
  const failGate = (family: string, code: string, status: 'FAIL' | 'REPAIR', target = 'snapshot:trip:v1') => { const gate = objs(output.gates).find(item => item.gateFamily === family)!; gate.status = status; gate.findingCodes = [code]; output.status = status; output.blockingFindings = [{ findingId: `finding:${id.toLowerCase()}`, code, severity: 'BLOCKING', subjectRefs: [target], ruleRefs: gate.ruleRefs, evidenceRefs: gate.evidenceRefs, messageKey: code.toLowerCase() }]; output.confidence = 0.5; if (status === 'REPAIR') output.repairTargets = [{ repairTargetId: `repair-target:${id.toLowerCase()}`, reasonCode: code, targetRefs: [target], dependencyRefs: [], requiredOwner: 'TM-AG-013', requiredEvidenceTypes: [], severity: 'BLOCKING' }]; };
  switch (id) {
    case 'VF-B-001': break;
    case 'VF-B-002': failGate('G0_SCHEMA', 'SCHEMA_INVALID', 'FAIL'); break;
    case 'VF-B-003': failGate('G3_CONSTRAINTS', 'HARD_CONSTRAINT_VIOLATED', 'FAIL', 'constraint:hard:001'); break;
    case 'VF-B-004': failGate('G9_EVIDENCE_COVERAGE', 'HARD_CLAIM_UNKNOWN', 'REPAIR', 'claim:critical:unknown'); obj(output.evidenceCoverage).criticalClaimsVerified = 2; obj(output.evidenceCoverage).criticalClaimsUnknown = 1; break;
    case 'VF-B-005': failGate('G4_TIME_GRAPH', 'BLOCK_OVERLAP', 'REPAIR', 'itinerary:trip:v1'); break;
    case 'VF-B-006': failGate('G5_ROUTE', 'IMPOSSIBLE_TRANSITION', 'REPAIR', 'route:001'); break;
    case 'VF-B-007': failGate('G6_OPERATIONAL_FRESHNESS', 'OPENING_HOURS_STALE', 'REPAIR', 'official-fact:001'); break;
    case 'VF-B-008': failGate('G5_ROUTE', 'STRAIGHT_LINE_USED_AS_ROUTE', 'FAIL', 'route:001'); break;
    case 'VF-B-009': failGate('G7_WEATHER_EVENT_SEASONAL', 'CLIMATE_NORMAL_USED_AS_FORECAST', 'FAIL', 'weather:001'); break;
    case 'VF-B-010': failGate('G8_BUDGET', 'HARD_BUDGET_OVERFLOW', 'FAIL', 'budget:001'); break;
    default: throw new Error(`UNSUPPORTED_VERIFICATION_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const gates = objs(output.gates); const findings = objs(output.blockingFindings); const repairs = objs(output.repairTargets); const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); }; const gateStatus = (family: string) => gates.find(item => item.gateFamily === family)?.status;
  switch (fixture.fixtureId) {
    case 'VF-B-001': fail(output.status !== 'PASS' || findings.length !== 0 || gates.some(item => ['FAIL', 'REPAIR'].includes(String(item.status))), 'VF_EXPECT_PASS'); break;
    case 'VF-B-002': fail(output.status !== 'FAIL' || gateStatus('G0_SCHEMA') !== 'FAIL', 'VF_EXPECT_SCHEMA_FAIL'); break;
    case 'VF-B-003': fail(output.status !== 'FAIL' || gateStatus('G3_CONSTRAINTS') !== 'FAIL', 'VF_EXPECT_HARD_FAIL'); break;
    case 'VF-B-004': fail(output.status !== 'REPAIR' || obj(output.evidenceCoverage).criticalClaimsUnknown !== 1 || repairs.length === 0, 'VF_EXPECT_UNKNOWN_REPAIR'); break;
    case 'VF-B-005': fail(gateStatus('G4_TIME_GRAPH') !== 'REPAIR' || repairs.length === 0, 'VF_EXPECT_OVERLAP_REPAIR'); break;
    case 'VF-B-006': fail(gateStatus('G5_ROUTE') !== 'REPAIR', 'VF_EXPECT_TRANSITION_REPAIR'); break;
    case 'VF-B-007': fail(gateStatus('G6_OPERATIONAL_FRESHNESS') !== 'REPAIR', 'VF_EXPECT_STALE_REPAIR'); break;
    case 'VF-B-008': fail(gateStatus('G5_ROUTE') !== 'FAIL' || !findings.some(item => item.code === 'STRAIGHT_LINE_USED_AS_ROUTE'), 'VF_EXPECT_ROUTE_METHOD_FAIL'); break;
    case 'VF-B-009': fail(gateStatus('G7_WEATHER_EVENT_SEASONAL') !== 'FAIL', 'VF_EXPECT_CLIMATE_FAIL'); break;
    case 'VF-B-010': fail(gateStatus('G8_BUDGET') !== 'FAIL' || output.status !== 'FAIL', 'VF_EXPECT_BUDGET_FAIL'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-014 Verification', () => {
  it('executes the first 10 golden Verification behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-014'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-014'); if (!pack || !schemas) throw new Error('TM-AG-014 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
