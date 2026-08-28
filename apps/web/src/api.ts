import { randomUUID } from 'node:crypto';
import { CapabilityRegistry, executeWithRegistry, type CapabilityResult } from '../../../packages/capabilities/src/index.js';
import { FixtureDestinationProvider, FixtureRouteProvider } from '../../../packages/providers-mock/src/index.js';
import { runHeadlessTripPlan, type HeadlessTripPlanInput, type HeadlessTripPlanResult } from '../../../packages/orchestrator/src/index.js';
import { toUiPlanViewModel, type UiPlanViewModel } from './ui-adapter.js';

export type IntakeRequest = { origin: string; targetRegion: string; durationDays: number; budgetAmount: number; mode?: 'verified' | 'warning' | 'blocked' };
export type PlanJob = { id: string; status: 'planning' | 'completed' | 'blocked'; viewModel?: UiPlanViewModel; error?: string };

type DestinationProviderData = { candidates: HeadlessTripPlanInput['candidatePool'] };
type RouteProviderData = { routes: HeadlessTripPlanInput['routes'] };

function registryForProviders() {
  const registry = new CapabilityRegistry();
  registry.registerProvider(new FixtureDestinationProvider(), 'ACTIVE');
  registry.registerProvider(new FixtureRouteProvider(), 'ACTIVE');
  registry.registerCapability({ capability: 'place_discovery', primaryProviderId: 'mock:destination-fixture', timeoutMs: 250, retryPolicy: { maxAttempts: 2, retryableCodes: ['PROVIDER_TIMEOUT', 'PROVIDER_RATE_LIMIT', 'PROVIDER_UNAVAILABLE'] } });
  registry.registerCapability({ capability: 'route_lookup', primaryProviderId: 'mock:route-fixture', timeoutMs: 250, retryPolicy: { maxAttempts: 2, retryableCodes: ['PROVIDER_TIMEOUT', 'PROVIDER_RATE_LIMIT', 'PROVIDER_UNAVAILABLE'] } });
  return registry;
}

function blockedView(input: Pick<HeadlessTripPlanInput, 'durationDays'>, blockers: string[]): UiPlanViewModel {
  return { status: 'blocked', title: 'Plan oluşturulamadı', summary: 'Provider veya doğrulama tamamlanmadan final plan gösterilmez.', durationDays: input.durationDays, travelStyle: 'family_low_fatigue', privacyConstraintActive: true, days: [], disclosures: [], blockers, verificationWarnings: [], confidence: 'low', confidenceReasons: ['provider_or_verification_blocker'] };
}

async function run(request: IntakeRequest): Promise<UiPlanViewModel> {
  const traceId = 'web-' + randomUUID();
  const registry = registryForProviders();
  const base = { traceId, origin: request.origin, targetRegion: request.targetRegion, durationDays: request.durationDays, childrenAges: [2, 6], budgetAmount: request.budgetAmount, maxRadiusKm: 150, lowFatigueRequired: true, middayRestRequired: true, womenOnlyBeachRequiredWhenSeaRecommended: true };
  const destinations = await executeWithRegistry<DestinationProviderData>(registry, { capability: 'place_discovery', traceId, payload: { origin: request.origin, targetRegion: request.targetRegion } });
  const routes = await executeWithRegistry<RouteProviderData>(registry, { capability: 'route_lookup', traceId, payload: { origin: request.origin, targetRegion: request.targetRegion } });
  if (!destinations.ok) return blockedView(base, ['destination_provider:' + destinations.code]);
  if (!routes.ok) return blockedView(base, ['route_provider:' + routes.code]);
  const routeData = request.mode === 'warning' ? routes.data.routes.map((route) => { const { exactDistance: _exactDistance, ...evidenceIds } = route.evidenceIds; return { ...route, evidenceIds }; }) : routes.data.routes;
  const input: HeadlessTripPlanInput = { ...base, candidatePool: destinations.data.candidates, routes: routeData, ...(request.mode === 'blocked' ? {} : { evidence: { womenOnlyBeach: { evidenceId: 'official-facility-001', sourceType: 'official_facility' } } }) };
  const result: HeadlessTripPlanResult = runHeadlessTripPlan(input);
  if (result.finalResponse) return toUiPlanViewModel(result.finalResponse);
  return blockedView(input, result.verification.hard_blockers);
}

export function createPlanService(delayMs = 80) {
  const jobs = new Map<string, PlanJob>();
  return {
    start(request: IntakeRequest): PlanJob { const id = randomUUID(); const job: PlanJob = { id, status: 'planning' }; jobs.set(id, job); setTimeout(() => { void run(request).then((viewModel) => { const current = jobs.get(id); if (!current) return; current.status = viewModel.status === 'blocked' ? 'blocked' : 'completed'; current.viewModel = viewModel; }); }, delayMs); return job; },
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
