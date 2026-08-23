import { parseRouteLogistics, type RouteLogisticsEnvelope } from '../../contracts/src/index.js';

export interface RouteEvidenceInput {
  destinationId: string;
  destinationName: string;
  exactDistanceKm?: number;
  exactDriveTimeMinutes?: number;
  parkingAvailable?: boolean;
  trafficRisk?: 'low' | 'medium' | 'high' | 'unknown' | 'weekend_sensitive';
  evidenceIds: {
    exactDistance?: string;
    exactDriveTime?: string;
    parkingAvailability?: string;
    liveTraffic?: string;
  };
}

export interface RouteLogisticsAgentInput {
  traceId: string;
  origin: string;
  transportMode: 'private_car' | 'public_transport' | 'mixed';
  childrenAges: readonly number[];
  lowFatigueRequired: boolean;
  middayRestRequired: boolean;
  routes: readonly RouteEvidenceInput[];
}

export const ROUTE_LOGISTICS_AGENT_BOUNDARY = {
  agentId: 'route_logistics_agent',
  harnessProfile: 'route-logistics',
  allowedCapabilities: ['route_lookup', 'parking_lookup', 'evidence_lookup'] as const,
  callsOtherAgents: false,
  writesCanonicalMemory: false,
  producesFinalUserResponse: false,
  inventsExactRouteFacts: false
} as const;

function distanceBand(km?: number): 'short' | 'medium' | 'long' | 'very_long' | 'unknown' {
  if (km === undefined) return 'unknown';
  if (km <= 60) return 'short';
  if (km <= 150) return 'medium';
  if (km <= 250) return 'long';
  return 'very_long';
}

function driveBand(minutes?: number): 'short' | 'medium' | 'long' | 'very_long' | 'unknown' {
  if (minutes === undefined) return 'unknown';
  if (minutes <= 60) return 'short';
  if (minutes <= 150) return 'medium';
  if (minutes <= 240) return 'long';
  return 'very_long';
}

export function runRouteLogisticsAgent(input: RouteLogisticsAgentInput): RouteLogisticsEnvelope {
  const hasToddler = input.childrenAges.some((age) => age <= 2);
  const verificationNeeds = new Set<string>();
  const warnings = new Set<string>();

  const destination_route_profiles = input.routes.map((route) => {
    const evidence_refs: Array<{
      claim: 'exact_distance' | 'exact_drive_time' | 'parking_availability' | 'live_traffic';
      evidence_id: string;
    }> = [];

    if (route.exactDistanceKm !== undefined && route.evidenceIds.exactDistance) {
      evidence_refs.push({ claim: 'exact_distance', evidence_id: route.evidenceIds.exactDistance });
    } else if (route.exactDistanceKm !== undefined) {
      verificationNeeds.add(`${route.destinationId}:exact_distance`);
    }

    if (route.exactDriveTimeMinutes !== undefined && route.evidenceIds.exactDriveTime) {
      evidence_refs.push({ claim: 'exact_drive_time', evidence_id: route.evidenceIds.exactDriveTime });
    } else if (route.exactDriveTimeMinutes !== undefined) {
      verificationNeeds.add(`${route.destinationId}:exact_drive_time`);
    }

    if (route.parkingAvailable !== undefined && route.evidenceIds.parkingAvailability) {
      evidence_refs.push({ claim: 'parking_availability', evidence_id: route.evidenceIds.parkingAvailability });
    } else if (route.parkingAvailable !== undefined) {
      verificationNeeds.add(`${route.destinationId}:parking_availability`);
    }

    if (route.trafficRisk && route.trafficRisk !== 'unknown' && route.evidenceIds.liveTraffic) {
      evidence_refs.push({ claim: 'live_traffic', evidence_id: route.evidenceIds.liveTraffic });
    }

    const distance = route.exactDistanceKm;
    const drive = route.exactDriveTimeMinutes;
    const fatigueHigh = drive !== undefined && (drive > 180 || (hasToddler && drive > 150));
    const routeHigh = drive !== undefined && drive > 180;

    let route_burden_level: 'low' | 'moderate' | 'high' | 'blocked' = 'moderate';
    if (drive !== undefined && drive <= 90) route_burden_level = 'low';
    else if (routeHigh) route_burden_level = 'high';

    const child_fatigue_risk: 'low' | 'medium' | 'high' | 'blocked' =
      drive === undefined ? 'medium' : fatigueHigh ? 'high' : drive <= 90 ? 'low' : 'medium';

    if (input.lowFatigueRequired && child_fatigue_risk === 'high') {
      warnings.add(`${route.destinationId}:low_fatigue_preference_at_risk`);
    }

    const rest_stop_need: 'none' | 'optional' | 'recommended' | 'required' =
      drive === undefined ? 'optional' : drive > 180 ? 'required' : drive > 120 ? 'recommended' : 'optional';

    const midday_rest_compatibility: 'compatible' | 'compatible_if_afternoon_light' | 'conflict' | 'unknown' =
      drive === undefined
        ? 'unknown'
        : input.middayRestRequired && drive > 180
          ? 'conflict'
          : drive > 120
            ? 'compatible_if_afternoon_light'
            : 'compatible';

    const exactDistanceVerified = route.exactDistanceKm !== undefined && !!route.evidenceIds.exactDistance;
    const exactDriveVerified = route.exactDriveTimeMinutes !== undefined && !!route.evidenceIds.exactDriveTime;
    const parkingVerified = route.parkingAvailable !== undefined && !!route.evidenceIds.parkingAvailability;

    const confidenceReasons: string[] = [];
    if (exactDistanceVerified) confidenceReasons.push('exact_distance_evidence_present');
    if (exactDriveVerified) confidenceReasons.push('exact_drive_time_evidence_present');
    if (parkingVerified) confidenceReasons.push('parking_evidence_present');
    if (!exactDistanceVerified || !exactDriveVerified) confidenceReasons.push('route_evidence_incomplete');

    const confidenceValue: 'low' | 'medium' | 'high' =
      exactDistanceVerified && exactDriveVerified ? 'high' : distance !== undefined || drive !== undefined ? 'medium' : 'low';

    return {
      destination_id: route.destinationId,
      destination_name: route.destinationName,
      origin: input.origin,
      route_distance_band: distanceBand(distance),
      drive_time_band: driveBand(drive),
      route_burden_level,
      child_fatigue_risk,
      parking_risk: route.parkingAvailable === true ? 'low' : route.parkingAvailable === false ? 'high' : 'needs_verification',
      traffic_risk: route.trafficRisk ?? 'unknown',
      rest_stop_need,
      midday_rest_compatibility,
      verification_status: {
        distance: exactDistanceVerified ? 'verified' : 'needs_verification',
        drive_time: exactDriveVerified ? 'verified' : 'needs_verification',
        parking: parkingVerified ? 'verified' : 'needs_verification',
        traffic: route.trafficRisk && route.trafficRisk !== 'unknown'
          ? route.evidenceIds.liveTraffic ? 'verified' : 'needs_verification'
          : 'unknown'
      },
      confidence: {
        value: confidenceValue,
        reasons: confidenceReasons
      },
      ...(exactDistanceVerified ? { exact_distance_km: route.exactDistanceKm } : {}),
      ...(exactDriveVerified ? { exact_drive_time_minutes: route.exactDriveTimeMinutes } : {}),
      ...(parkingVerified ? { parking_available: route.parkingAvailable } : {}),
      evidence_refs,
      blocker_reasons: [],
      route_notes: input.lowFatigueRequired ? ['low_fatigue_profile_applied'] : []
    };
  });

  return parseRouteLogistics({
    contract_id: 'route_logistics_contract',
    contract_version: '0.1.0',
    producer_agent: 'route_logistics_agent',
    trace_id: input.traceId,
    validation_status: verificationNeeds.size > 0 ? 'valid_with_warnings' : 'valid',
    logistics_scope_summary: {
      origin: input.origin,
      transport_mode: input.transportMode
    },
    destination_route_profiles,
    logistics_blockers: [],
    logistics_warnings: [...warnings].sort(),
    verification_needs: [...verificationNeeds].sort(),
    clarification_requirements: []
  });
}
