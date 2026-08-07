import { describe, expect, it } from 'vitest';
import { ScriptedTripIntakeModelAdapter, TripIntakeAgent, type TripIntakeDraft } from './trip-intake.js';

const baseDraft = (overrides: Partial<TripIntakeDraft> = {}): TripIntakeDraft => ({
  origin: { value: 'Kocaeli', source: 'user_explicit', confidence: 'high' },
  destination: { value: 'Balıkesir', source: 'user_explicit', confidence: 'high' },
  duration: { days: 3, nights: 2, source: 'user_explicit' },
  travelers: { adults: 2, children: [{ age: 6 }, { age: 2 }], source: 'user_explicit' },
  budget: { amount: 30000, currency: 'TRY', source: 'user_explicit' },
  preferences: {
    women_only_beach_required: true,
    child_friendly_required: true,
    midday_rest_required: true,
    low_fatigue_required: true,
    daily_alternatives_required: 3
  },
  hardConstraints: ['budget_max_30000', 'children_ages_6_2', 'women_only_beach'],
  softConstraints: ['prefer_low_fatigue'],
  missingRequiredFields: [],
  clarificationQuestions: [],
  assumptionsNotAllowed: ['do_not_infer_dates'],
  handoffNotes: ['preserve_hard_constraints'],
  ...overrides
});

const scripts: Record<string, TripIntakeDraft> = {
  'TM-INTAKE-001': baseDraft(),
  'TM-INTAKE-003': baseDraft({
    destination: { value: null, source: 'missing', confidence: 'low' },
    missingRequiredFields: []
  }),
  'TM-INTAKE-006': baseDraft({
    travelers: { adults: 2, children: [{ age: 6 }, { age: 2 }], source: 'memory_disclosure' }
  }),
  'TM-INTAKE-LEAK': baseDraft({ planningLeakage: ['Hotel önerisi üretildi'] }),
  'TM-INTAKE-SENSITIVE': baseDraft({ sensitiveInferences: ['religious_profile'] })
};

function agent() {
  return new TripIntakeAgent(new ScriptedTripIntakeModelAdapter(scripts));
}

describe('TripIntakeAgent L3', () => {
  it('preserves explicit facts and hard constraints for a complete request', async () => {
    const result = await agent().execute({ fixtureId: 'TM-INTAKE-001', userMessage: 'Kocaeli çıkışlı 3 gün Balıkesir...' });
    expect(result.origin.value).toBe('Kocaeli');
    expect(result.travelers.children.map((child) => child.age)).toEqual([6, 2]);
    expect(result.hardConstraints).toEqual(['budget_max_30000', 'children_ages_6_2', 'women_only_beach']);
    expect(result.missingRequiredFields).toEqual([]);
  });

  it('does not invent a missing destination and emits clarification', async () => {
    const result = await agent().execute({ fixtureId: 'TM-INTAKE-003', userMessage: 'Ailece üç günlük tatil istiyorum' });
    expect(result.destination.value).toBeNull();
    expect(result.destination.confidence).toBe('low');
    expect(result.missingRequiredFields).toContain('destination');
    expect(result.clarificationQuestions.some((q) => q.toLowerCase().includes('destination'))).toBe(true);
  });

  it('accepts family data only through disclosed memory source', async () => {
    const result = await agent().execute({ fixtureId: 'TM-INTAKE-006', userMessage: 'Aynı aile ile devam', memoryDisclosure: { childrenAges: [6, 2] } });
    expect(result.travelers.source).toBe('memory_disclosure');
  });

  it('rejects planning leakage', async () => {
    await expect(agent().execute({ fixtureId: 'TM-INTAKE-LEAK', userMessage: 'Plan yap' })).rejects.toThrow('TRIP_INTAKE_PLANNING_LEAKAGE');
  });

  it('rejects sensitive profile inference', async () => {
    await expect(agent().execute({ fixtureId: 'TM-INTAKE-SENSITIVE', userMessage: 'Kadınlar plajı olsun' })).rejects.toThrow('TRIP_INTAKE_SENSITIVE_INFERENCE');
  });

  it('is deterministic for the same scripted input', async () => {
    const input = { fixtureId: 'TM-INTAKE-001', userMessage: 'same' };
    expect(await agent().execute(input)).toEqual(await agent().execute(input));
  });

  it('declares zero direct capability, provider, memory-write and agent-call authority', () => {
    const subject = agent();
    expect(subject.allowedCapabilities).toEqual([]);
    expect(subject.callsOtherAgents).toBe(false);
    expect(subject.writesCanonicalMemory).toBe(false);
  });
});
