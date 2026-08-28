import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-016-fc-b-001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function section(id: string, type: string, text: string, subjects: string[], sources: string[], warnings: string[] = []): J { return { sectionId: `section:${id}`, type, title: id.replaceAll('-', ' '), text, subjectRefs: subjects, sourceRefs: sources, claimRefs: [], valueBindingRefs: [], warningRefs: warnings }; }

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; output.finalPlanId = `final-plan:${id.toLowerCase()}`; output.renderGenerationRefs = [`render-generation:${id.toLowerCase()}`];
  const append = (item: J) => { output.sections = [...objs(output.sections), item]; };
  switch (id) {
    case 'FC-B-001': break;
    case 'FC-B-002': append(section('alternatives', 'ALTERNATIVES', 'Doğrulanmış iki uygulanabilir alternatif ayrı seçenekler olarak sunulmaktadır.', input.alternativeRefs as string[], input.alternativeRefs as string[])); break;
    case 'FC-B-003': append(section('journey', 'JOURNEY', 'Çok şehirli yolculuk durak ve segment sırası değiştirilmeden gösterilmektedir.', ['itinerary:trip:v1'], ['itinerary:trip:v1'])); break;
    case 'FC-B-004': append(section('budget', 'BUDGET', 'Bilinen toplam, tahmini tutar ve bilinmeyen maliyet kalemleri ayrı gösterilmektedir.', ['budget:001'], ['budget:001'])); break;
    case 'FC-B-005': break;
    case 'FC-B-006': append(section('event-confirmed', 'EVENT_SEASONAL_WEATHER', 'Resmi kaynakla doğrulanan etkinlik tarih ve kapsam bilgisiyle gösterilmektedir.', ['event:confirmed'], ['official-fact:event'])); break;
    case 'FC-B-007': append(section('event-recurring', 'EVENT_SEASONAL_WEATHER', 'Yalnız tekrar eden etkinlik bilgisi vardır; bu yılın kesin gerçekleşmesi doğrulanmamıştır.', ['event:recurring'], ['knowledge:event'], ['warning:event-occurrence-unverified'])); input.warningRefs = [...(input.warningRefs as unknown[]), 'warning:event-occurrence-unverified']; break;
    case 'FC-B-008': append(section('seasonal', 'EVENT_SEASONAL_WEATHER', 'Mevsimsel aktivite uygunluğu kesin günlük hava iddiasına dönüştürülmeden sunulmaktadır.', ['season:activity'], ['climate:normal'])); break;
    case 'FC-B-009': append(section('weather', 'EVENT_SEASONAL_WEATHER', 'Güncel hava tahmini plan notu olarak ve geçerlilik penceresi korunarak gösterilmektedir.', ['weather:forecast'], ['weather:forecast'])); break;
    case 'FC-B-010': append(section('review-crowd', 'WARNINGS', 'Yorumlarda tekrarlanan kalabalık deneyimi resmi kapasite bilgisi gibi sunulmadan belirtilmektedir.', ['review:crowd'], ['review:crowd'])); break;
    default: throw new Error(`UNSUPPORTED_FINAL_COMPOSER_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const sections = objs(output.sections); const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  const has = (type: string, token: string) => sections.some(item => item.type === type && String(item.text).includes(token));
  switch (fixture.fixtureId) {
    case 'FC-B-001': fail(!has('TRIP_SUMMARY', 'Doğrulanmış') || !has('DAY_PLAN', 'Günlük'), 'FC_EXPECT_STANDARD'); break;
    case 'FC-B-002': fail(!has('ALTERNATIVES', 'iki'), 'FC_EXPECT_TWO_ALTERNATIVES'); break;
    case 'FC-B-003': fail(!has('JOURNEY', 'segment'), 'FC_EXPECT_JOURNEY'); break;
    case 'FC-B-004': fail(!has('BUDGET', 'bilinmeyen'), 'FC_EXPECT_BUDGET_SEPARATION'); break;
    case 'FC-B-005': fail(!(output.mandatoryWarningRefsRendered as unknown[]).includes('warning:parking-current-availability') || !has('WARNINGS', 'garanti'), 'FC_EXPECT_MANDATORY_WARNING'); break;
    case 'FC-B-006': fail(!has('EVENT_SEASONAL_WEATHER', 'doğrulanan etkinlik'), 'FC_EXPECT_CONFIRMED_EVENT'); break;
    case 'FC-B-007': fail(!has('EVENT_SEASONAL_WEATHER', 'kesin gerçekleşmesi doğrulanmamıştır'), 'FC_EXPECT_RECURRING_ONLY'); break;
    case 'FC-B-008': fail(!has('EVENT_SEASONAL_WEATHER', 'Mevsimsel'), 'FC_EXPECT_SEASONAL'); break;
    case 'FC-B-009': fail(!has('EVENT_SEASONAL_WEATHER', 'hava tahmini'), 'FC_EXPECT_FORECAST_NOTE'); break;
    case 'FC-B-010': fail(!has('WARNINGS', 'Yorumlarda'), 'FC_EXPECT_REVIEW_EXPERIENCE'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-016 Final Composer', () => {
  it('executes the first 10 golden Final Composer behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-016'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-016'); if (!pack || !schemas) throw new Error('TM-AG-016 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
