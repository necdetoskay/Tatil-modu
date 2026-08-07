export type FieldSource = 'user_explicit' | 'conversation_context' | 'memory_disclosure' | 'missing' | 'open_choice';
export type Confidence = 'high' | 'medium' | 'low';

export interface IntakeField<T> {
  value: T | null;
  source: FieldSource;
  confidence: Confidence;
}

export interface TripIntakeDraft {
  origin: IntakeField<string>;
  destination: IntakeField<string>;
  duration: { days: number | null; nights: number | null; source: 'user_explicit' | 'inferred_from_dates' | 'missing' };
  travelers: { adults: number | null; children: { age: number | null }[]; source: 'user_explicit' | 'memory_disclosure' | 'missing' };
  budget: { amount: number | null; currency: string; source: 'user_explicit' | 'missing' };
  preferences: {
    women_only_beach_required: boolean | null;
    child_friendly_required: boolean | null;
    midday_rest_required: boolean | null;
    low_fatigue_required: boolean | null;
    daily_alternatives_required: number | null;
  };
  hardConstraints: string[];
  softConstraints: string[];
  missingRequiredFields: string[];
  clarificationQuestions: string[];
  assumptionsNotAllowed: string[];
  handoffNotes: string[];
  planningLeakage?: string[];
  sensitiveInferences?: string[];
}

export interface TripIntakeInput {
  fixtureId: string;
  userMessage: string;
  conversationContextSummary?: string;
  memoryDisclosure?: Readonly<Record<string, unknown>>;
}

export interface TripIntakeModelAdapter {
  extract(input: TripIntakeInput): Promise<TripIntakeDraft>;
}

export class ScriptedTripIntakeModelAdapter implements TripIntakeModelAdapter {
  constructor(private readonly scripts: Readonly<Record<string, TripIntakeDraft>>) {}

  async extract(input: TripIntakeInput): Promise<TripIntakeDraft> {
    const script = this.scripts[input.fixtureId];
    if (!script) throw new Error(`No scripted intake fixture: ${input.fixtureId}`);
    return structuredClone(script);
  }
}

const unique = (values: readonly string[]) => [...new Set(values)].sort();

export class TripIntakeAgent {
  readonly agentId = 'trip_intake_agent';
  readonly allowedCapabilities: readonly string[] = [];
  readonly callsOtherAgents = false;
  readonly writesCanonicalMemory = false;

  constructor(private readonly model: TripIntakeModelAdapter) {}

  async execute(input: TripIntakeInput): Promise<TripIntakeDraft> {
    const draft = await this.model.extract(input);

    if (draft.planningLeakage?.length) {
      throw new Error('TRIP_INTAKE_PLANNING_LEAKAGE');
    }
    if (draft.sensitiveInferences?.length) {
      throw new Error('TRIP_INTAKE_SENSITIVE_INFERENCE');
    }

    const missing = new Set(draft.missingRequiredFields);
    if (draft.origin.value === null) missing.add('origin');
    if (draft.duration.days === null) missing.add('duration');
    if (draft.travelers.adults === null || draft.travelers.children.some((child) => child.age === null)) missing.add('travelers');

    if (draft.destination.value === null && draft.destination.source !== 'open_choice') {
      missing.add('destination');
    }
    if (draft.budget.amount === null) missing.add('budget');

    const clarificationQuestions = [...draft.clarificationQuestions];
    for (const field of [...missing].sort()) {
      if (!clarificationQuestions.some((question) => question.toLowerCase().includes(field.toLowerCase()))) {
        clarificationQuestions.push(`Please clarify ${field}.`);
      }
    }

    return {
      ...draft,
      hardConstraints: unique(draft.hardConstraints),
      softConstraints: unique(draft.softConstraints),
      missingRequiredFields: [...missing].sort(),
      clarificationQuestions: unique(clarificationQuestions),
      assumptionsNotAllowed: unique(draft.assumptionsNotAllowed),
      handoffNotes: unique(draft.handoffNotes)
    };
  }
}
