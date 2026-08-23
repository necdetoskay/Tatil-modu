import type {
  CapabilityProvider,
  CapabilityRequest,
  CapabilityResult
} from '@tatil-modu/capabilities';

export const MAPBOX_ROUTE_PROVIDER_ID = 'mapbox-directions-v5' as const;
export const MAPBOX_ROUTE_PROVIDER_QUALIFICATION = 'QUALIFIED' as const;

export interface RouteLookupPoint {
  longitude: number;
  latitude: number;
}

export interface MapboxRouteLookupPayload {
  origin: RouteLookupPoint;
  destination: RouteLookupPoint;
  departureAt?: 'now' | string;
}

export interface MapboxRouteData {
  distanceKm: number;
  durationMinutes: number;
  trafficAware: true;
  provider: typeof MAPBOX_ROUTE_PROVIDER_ID;
}

export interface MapboxHttpResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type MapboxFetch = (url: string, init?: { signal?: AbortSignal }) => Promise<MapboxHttpResponse>;

export interface MapboxRouteProviderOptions {
  accessToken: string;
  fetchImpl?: MapboxFetch;
  now?: () => string;
}

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parsePayload(payload: unknown): MapboxRouteLookupPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  const candidate = payload as Partial<MapboxRouteLookupPayload>;
  if (!candidate.origin || !candidate.destination) return null;
  if (!isFiniteCoordinate(candidate.origin.longitude) || !isFiniteCoordinate(candidate.origin.latitude)) return null;
  if (!isFiniteCoordinate(candidate.destination.longitude) || !isFiniteCoordinate(candidate.destination.latitude)) return null;
  return candidate as MapboxRouteLookupPayload;
}

function failure(
  request: CapabilityRequest,
  code: 'PROVIDER_RATE_LIMIT' | 'PROVIDER_UNAVAILABLE' | 'MALFORMED_PROVIDER_PAYLOAD' | 'EMPTY_RESULT',
  retryable: boolean
): CapabilityResult<unknown> {
  return {
    ok: false,
    capability: request.capability,
    traceId: request.traceId,
    code,
    retryable
  };
}

export class MapboxRouteProvider implements CapabilityProvider {
  readonly providerId = MAPBOX_ROUTE_PROVIDER_ID;
  private readonly accessToken: string;
  private readonly fetchImpl: MapboxFetch;
  private readonly now: () => string;

  constructor(options: MapboxRouteProviderOptions) {
    if (!options.accessToken.trim()) throw new Error('Mapbox access token is required');
    this.accessToken = options.accessToken;
    this.fetchImpl = options.fetchImpl ?? (globalThis.fetch as unknown as MapboxFetch);
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>> {
    if (request.capability !== 'route_lookup') {
      return {
        ok: false,
        capability: request.capability,
        traceId: request.traceId,
        code: 'UNAUTHORIZED_CAPABILITY',
        retryable: false
      };
    }

    const payload = parsePayload(request.payload);
    if (!payload) return failure(request, 'MALFORMED_PROVIDER_PAYLOAD', false);

    const coordinates = [payload.origin, payload.destination]
      .map((point) => `${point.longitude},${point.latitude}`)
      .join(';');
    const params = new URLSearchParams({
      access_token: this.accessToken,
      alternatives: 'false',
      overview: 'false',
      steps: 'false',
      depart_at: payload.departureAt ?? 'now'
    });
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?${params.toString()}`;

    let response: MapboxHttpResponse;
    try {
      response = await this.fetchImpl(url);
    } catch {
      return failure(request, 'PROVIDER_UNAVAILABLE', true);
    }

    if (response.status === 429) return failure(request, 'PROVIDER_RATE_LIMIT', true);
    if (!response.ok) return failure(request, 'PROVIDER_UNAVAILABLE', response.status >= 500);

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return failure(request, 'MALFORMED_PROVIDER_PAYLOAD', false);
    }

    if (!body || typeof body !== 'object') return failure(request, 'MALFORMED_PROVIDER_PAYLOAD', false);
    const routes = (body as { routes?: unknown }).routes;
    if (!Array.isArray(routes)) return failure(request, 'MALFORMED_PROVIDER_PAYLOAD', false);
    if (routes.length === 0) return failure(request, 'EMPTY_RESULT', false);

    const firstRoute = routes[0] as { distance?: unknown; duration?: unknown };
    if (!isFiniteCoordinate(firstRoute.distance) || firstRoute.distance <= 0) {
      return failure(request, 'MALFORMED_PROVIDER_PAYLOAD', false);
    }
    if (!isFiniteCoordinate(firstRoute.duration) || firstRoute.duration <= 0) {
      return failure(request, 'MALFORMED_PROVIDER_PAYLOAD', false);
    }

    const data: MapboxRouteData = {
      distanceKm: firstRoute.distance / 1000,
      durationMinutes: firstRoute.duration / 60,
      trafficAware: true,
      provider: MAPBOX_ROUTE_PROVIDER_ID
    };

    return {
      ok: true,
      capability: 'route_lookup',
      traceId: request.traceId,
      data,
      evidence: [
        {
          sourceId: MAPBOX_ROUTE_PROVIDER_ID,
          sourceType: 'provider',
          observedAt: this.now(),
          freshness: 'fresh'
        }
      ]
    };
  }
}
