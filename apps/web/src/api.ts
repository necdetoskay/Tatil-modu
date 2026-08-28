import { randomUUID } from 'node:crypto';
import { runHeadlessTripPlan, type HeadlessTripPlanInput, type HeadlessTripPlanResult } from '../../../packages/orchestrator/src/index.js';
import { toUiPlanViewModel, type UiPlanViewModel } from './ui-adapter.js';

export type IntakeRequest = { origin: string; targetRegion: string; durationDays: number; budgetAmount: number; mode?: 'verified' | 'warning' | 'blocked' };
export type PlanJob = { id: string; status: 'planning' | 'completed' | 'blocked'; viewModel?: UiPlanViewModel; error?: string };

const baseInput = (request: IntakeRequest): HeadlessTripPlanInput => ({
  traceId: 'web-' + randomUUID(), origin: request.origin, targetRegion: request.targetRegion, durationDays: request.durationDays,
  childrenAges: [2, 6], budgetAmount: request.budgetAmount, maxRadiusKm: 150, lowFatigueRequired: true, middayRestRequired: true,
  womenOnlyBeachRequiredWhenSeaRecommended: true,
  candidatePool: [{ candidateId: 'candidate-yalova', name: 'Yalova', type: 'mixed', relationToTarget: 'primary', estimatedDistanceBucket: '50_100_km', likelyTripRole: 'base_stay', familyRelevanceHypothesis: 'Short transfer and family rest options.', seaRelevant: true, fatigueRisk: 'low' }],
  routes: [{ destinationId: 'candidate-yalova', destinationName: 'Yalova', exactDistanceKm: 92, exactDriveTimeMinutes: 85, parkingAvailable: true, trafficRisk: 'low', evidenceIds: { exactDistance: 'route-distance-001', exactDriveTime: 'route-duration-001', parkingAvailability: 'parking-001', liveTraffic: 'traffic-001' } }],
  evidence: { womenOnlyBeach: { evidenceId: 'official-facility-001', sourceType: 'official_facility' } }
});

function run(request: IntakeRequest): UiPlanViewModel {
  const input = baseInput(request);
  if (request.mode === 'blocked') delete input.evidence;
  if (request.mode === 'warning') {
    const route = input.routes[0];
    if (route) delete route.evidenceIds.exactDistance;
  }
  const result: HeadlessTripPlanResult = runHeadlessTripPlan(input);
  if (result.finalResponse) return toUiPlanViewModel(result.finalResponse);
  return { status: 'blocked', title: 'Plan oluşturulamadı', summary: 'Gerekli doğrulama tamamlanmadan final plan gösterilmez.', durationDays: input.durationDays, travelStyle: 'family_low_fatigue', privacyConstraintActive: true, days: [], disclosures: [], blockers: result.verification.hard_blockers, verificationWarnings: [], confidence: result.verification.confidence.value, confidenceReasons: result.verification.confidence.reasons };
}

export function createPlanService(delayMs = 80) {
  const jobs = new Map<string, PlanJob>();
  return {
    start(request: IntakeRequest): PlanJob { const id = randomUUID(); const job: PlanJob = { id, status: 'planning' }; jobs.set(id, job); setTimeout(() => { const current = jobs.get(id); if (!current) return; const viewModel = run(request); current.status = viewModel.status === 'blocked' ? 'blocked' : 'completed'; current.viewModel = viewModel; }, delayMs); return job; },
    get(id: string): PlanJob | undefined { return jobs.get(id); }
  };
}

export function validateIntake(value: unknown): IntakeRequest {
  if (!value || typeof value !== 'object') throw new Error('Request body must be an object.');
  const body = value as Record<string, unknown>; const origin = typeof body.origin === 'string' ? body.origin.trim() : ''; const targetRegion = typeof body.targetRegion === 'string' ? body.targetRegion.trim() : ''; const durationDays = body.durationDays; const budgetAmount = body.budgetAmount;
  if (!origin || !targetRegion || typeof durationDays !== 'number' || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 14 || typeof budgetAmount !== 'number' || !Number.isFinite(budgetAmount) || budgetAmount <= 0) throw new Error('origin, targetRegion, durationDays (1-14) and positive budgetAmount are required.');
  const mode = body.mode; if (mode !== undefined && mode !== 'verified' && mode !== 'warning' && mode !== 'blocked') throw new Error('mode must be verified, warning or blocked.');
  return { origin, targetRegion, durationDays, budgetAmount, ...(mode ? { mode } : {}) };
}
