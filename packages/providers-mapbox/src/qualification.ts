import type { CapabilityProvider, CapabilityResult } from '@tatil-modu/capabilities';
import { MAPBOX_ROUTE_PROVIDER_ID, type MapboxRouteData } from './index.js';

export type MapboxQualificationStatus = 'PASS' | 'FAIL' | 'BLOCKED_MISSING_SECRET';

export interface MapboxQualificationCheck {
  id: string;
  status: 'PASS' | 'FAIL';
  detail: string;
}

export interface MapboxQualificationReport {
  providerId: typeof MAPBOX_ROUTE_PROVIDER_ID;
  status: MapboxQualificationStatus;
  eligibleForActivation: boolean;
  checks: MapboxQualificationCheck[];
  traceId: string;
  observedEvidenceIds: string[];
}

export const MAPBOX_KOCAELI_BURSA_PROBE = {
  origin: { longitude: 29.9169, latitude: 40.7654 },
  destination: { longitude: 29.0610, latitude: 40.1950 },
  departureAt: 'now' as const
};

function pass(id: string, detail: string): MapboxQualificationCheck {
  return { id, status: 'PASS', detail };
}

function fail(id: string, detail: string): MapboxQualificationCheck {
  return { id, status: 'FAIL', detail };
}

export function blockedMapboxQualification(traceId: string): MapboxQualificationReport {
  return {
    providerId: MAPBOX_ROUTE_PROVIDER_ID,
    status: 'BLOCKED_MISSING_SECRET',
    eligibleForActivation: false,
    checks: [fail('secret_available', 'MAPBOX_ACCESS_TOKEN is not configured.')],
    traceId,
    observedEvidenceIds: []
  };
}

function isRouteSuccess(result: CapabilityResult<unknown>): result is Extract<CapabilityResult<MapboxRouteData>, { ok: true }> {
  if (!result.ok || !result.data || typeof result.data !== 'object') return false;
  const data = result.data as Partial<MapboxRouteData>;
  return typeof data.distanceKm === 'number'
    && Number.isFinite(data.distanceKm)
    && typeof data.durationMinutes === 'number'
    && Number.isFinite(data.durationMinutes)
    && data.trafficAware === true
    && data.provider === MAPBOX_ROUTE_PROVIDER_ID;
}

export async function qualifyMapboxRouteProvider(
  provider: CapabilityProvider,
  traceId = 'qualification-mapbox-route-v1'
): Promise<MapboxQualificationReport> {
  const result = await provider.execute({
    capability: 'route_lookup',
    traceId,
    payload: MAPBOX_KOCAELI_BURSA_PROBE
  });

  const checks: MapboxQualificationCheck[] = [];

  checks.push(result.traceId === traceId
    ? pass('trace_preserved', 'Provider preserved the qualification trace id.')
    : fail('trace_preserved', 'Provider returned a mismatched trace id.'));

  if (!result.ok) {
    checks.push(fail('provider_call_success', `Provider call failed with ${result.code}.`));
    return {
      providerId: MAPBOX_ROUTE_PROVIDER_ID,
      status: 'FAIL',
      eligibleForActivation: false,
      checks,
      traceId,
      observedEvidenceIds: []
    };
  }

  checks.push(pass('provider_call_success', 'Representative route probe returned successfully.'));

  if (!isRouteSuccess(result)) {
    checks.push(fail('normalized_route_shape', 'Route result does not match the expected normalized Mapbox route shape.'));
    return {
      providerId: MAPBOX_ROUTE_PROVIDER_ID,
      status: 'FAIL',
      eligibleForActivation: false,
      checks,
      traceId,
      observedEvidenceIds: result.evidence.map((item) => item.sourceId)
    };
  }

  const data = result.data;
  checks.push(data.trafficAware
    ? pass('traffic_aware', 'Route result is explicitly traffic-aware.')
    : fail('traffic_aware', 'Route result is not traffic-aware.'));

  checks.push(data.distanceKm >= 80 && data.distanceKm <= 220
    ? pass('distance_plausible', `Distance ${data.distanceKm.toFixed(1)} km is inside the broad qualification range.`)
    : fail('distance_plausible', `Distance ${data.distanceKm.toFixed(1)} km is outside the broad qualification range.`));

  checks.push(data.durationMinutes >= 60 && data.durationMinutes <= 300
    ? pass('duration_plausible', `Duration ${data.durationMinutes.toFixed(1)} min is inside the broad qualification range.`)
    : fail('duration_plausible', `Duration ${data.durationMinutes.toFixed(1)} min is outside the broad qualification range.`));

  const providerEvidence = result.evidence.filter((item) =>
    item.sourceId === MAPBOX_ROUTE_PROVIDER_ID
    && item.sourceType === 'provider'
    && item.freshness === 'fresh'
  );
  checks.push(providerEvidence.length > 0
    ? pass('fresh_provider_evidence', 'Fresh Mapbox provider evidence is attached.')
    : fail('fresh_provider_evidence', 'Fresh Mapbox provider evidence is missing.'));

  const status: MapboxQualificationStatus = checks.every((check) => check.status === 'PASS') ? 'PASS' : 'FAIL';

  return {
    providerId: MAPBOX_ROUTE_PROVIDER_ID,
    status,
    eligibleForActivation: status === 'PASS',
    checks,
    traceId,
    observedEvidenceIds: result.evidence.map((item) => item.sourceId)
  };
}
