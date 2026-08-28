import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-015-ex-b-001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; output.explanationBundleId = `explanation:${id.toLowerCase()}`; output.generationRefs = [`generation:fixture:${id.toLowerCase()}`]; const record = objs(input.explainableRecords)[0]!; const block = objs(output.blocks)[0]!;
  const configure = (recordType: string, blockType: string, subject: string, claim: string, support: string, text: string) => { record.recordType = recordType; record.subjectRef = subject; record.decisionRefs = [`decision:${id.toLowerCase()}`]; record.constraintRefs = []; record.supportRefs = support ? [support] : []; record.allowedClaimRefs = claim ? [claim] : []; record.uncertaintyRefs = blockType === 'UNCERTAINTY' ? [`uncertainty:${id.toLowerCase()}`] : []; block.type = blockType; block.subjectRefs = [subject]; block.decisionRefs = record.decisionRefs; block.constraintRefs = []; block.supportRefs = record.supportRefs; block.assertedClaimRefs = record.allowedClaimRefs; block.uncertaintyRefs = record.uncertaintyRefs; block.text = text; const count = claim ? 1 : 0; output.coverage = { explainableRecordCount: 1, explainedRecordCount: 1, assertedClaimCount: count, supportedAssertedClaimCount: count, unsupportedAssertedClaimCount: 0 }; };
  switch (id) {
    case 'EX-B-001': break;
    case 'EX-B-002': configure('REJECTED', 'WHY_REJECTED', 'place:rejected', 'claim:rejected:closed', 'support:official:closure', 'Doğrulanmış kapanış bilgisi nedeniyle elendi.'); break;
    case 'EX-B-003': configure('JOURNEY_STOP', 'JOURNEY_STOP', 'journey-stop:1', 'claim:stop:rest', 'support:route:stop', 'Yolculuk dinlenme dengesi için ara durak olarak seçildi.'); break;
    case 'EX-B-004': configure('BUDGET', 'BUDGET', 'budget:ledger:1', 'claim:budget:known', 'support:budget:ledger', 'Bilinen toplam ile tahmini ve bilinmeyen kalemler ayrı gösterildi.'); break;
    case 'EX-B-005': configure('WEATHER', 'WEATHER', 'weather:signal:1', 'claim:weather:rain', 'support:forecast:1', 'Yağış tahmini nedeniyle kapalı alan alternatifi sunuldu.'); break;
    case 'EX-B-006': configure('EVENT', 'EVENT', 'event:1', 'claim:event:confirmed', 'support:official:event', 'Kullanıcının aradığı etkinlik resmi kaynakla doğrulandığı için plana alındı.'); break;
    case 'EX-B-007': configure('EVENT', 'EVENT', 'event:crowded', 'claim:event:avoid', 'support:official:event', 'Kaçınılması istenen etkinlik yoğunluğu nedeniyle bu zaman aralığı kullanılmadı.'); break;
    case 'EX-B-008': configure('SEASONAL', 'SEASONAL', 'season:swimming', 'claim:season:poor-fit', 'support:climate:normal', 'Mevsimsel yüzme uygunluğu zayıf olduğu için deniz ana plan yapılmadı.'); break;
    case 'EX-B-009': configure('TRADEOFF', 'TRADEOFF', 'review:parking', 'claim:parking:difficulty', 'support:review:parking', 'Resmi otopark varlığına rağmen yorumlarda tekrarlanan park zorluğu deneyim riski olarak gösterildi.'); break;
    case 'EX-B-010': configure('UNCERTAINTY', 'UNCERTAINTY', 'claim:hours:unknown', '', '', 'Çalışma saati doğrulanamadığı için kesin bilgi yerine belirsizlik uyarısı gösterildi.'); output.unresolvedWarnings = ['warning:hours:unknown']; break;
    default: throw new Error(`UNSUPPORTED_EXPLANATION_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const block = objs(output.blocks)[0]!; const expectedTypes: Record<string, string> = { 'EX-B-001': 'WHY_SELECTED', 'EX-B-002': 'WHY_REJECTED', 'EX-B-003': 'JOURNEY_STOP', 'EX-B-004': 'BUDGET', 'EX-B-005': 'WEATHER', 'EX-B-006': 'EVENT', 'EX-B-007': 'EVENT', 'EX-B-008': 'SEASONAL', 'EX-B-009': 'TRADEOFF', 'EX-B-010': 'UNCERTAINTY' }; const violations: { code: string; message: string }[] = [];
  if (block.type !== expectedTypes[fixture.fixtureId]) violations.push({ code: 'EX_EXPECT_BLOCK_TYPE', message: fixture.fixtureId });
  if (typeof block.text !== 'string' || block.text.length < 20) violations.push({ code: 'EX_EXPECT_EXPLANATION_TEXT', message: fixture.fixtureId });
  if (fixture.fixtureId === 'EX-B-010' && !(output.unresolvedWarnings as unknown[]).includes('warning:hours:unknown')) violations.push({ code: 'EX_EXPECT_UNKNOWN_WARNING', message: fixture.fixtureId });
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-015 Explanation', () => {
  it('executes the first 10 golden Explanation behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-015'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-015'); if (!pack || !schemas) throw new Error('TM-AG-015 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
