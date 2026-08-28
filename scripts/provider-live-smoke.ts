import { MapboxRouteProvider } from '../packages/providers-mapbox/src/index.js';
import type { CapabilityRequest } from '../packages/capabilities/src/index.js';

const token = process.env.MAPBOX_ACCESS_TOKEN?.trim();
if (!token) {
  console.error('LIVE_SMOKE_NOT_RUN: MAPBOX_ACCESS_TOKEN is not configured.');
  process.exitCode = 2;
} else {
  const request: CapabilityRequest = {
    capability: 'route_lookup',
    traceId: 'live-provider-smoke',
    payload: { origin: { longitude: 29.9169, latitude: 40.7654 }, destination: { longitude: 29.061, latitude: 40.195 }, departureAt: 'now' }
  };
  const result = await new MapboxRouteProvider({ accessToken: token }).execute(request);
  if (!result.ok) {
    console.error(`LIVE_SMOKE_FAILED: ${result.code}`);
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ status: 'PASS', provider: result.data && typeof result.data === 'object' && 'provider' in result.data ? result.data.provider : 'unknown', evidenceCount: result.evidence.length }));
  }
}
