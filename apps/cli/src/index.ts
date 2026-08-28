import projectStatus from '../../../project-status.json' with { type: 'json' };
import { runHeadlessTripPlan } from '../../../packages/orchestrator/src/index.js';

const command = process.argv[2] ?? 'status';

const status = {
  application: 'tatil-modu-headless',
  phase: projectStatus.currentStage,
  currentFocus: projectStatus.currentFocus,
  harness: projectStatus.harness,
  gates: projectStatus.gates,
  networkDefault: 'off',
  deterministicMode: true,
  statusSource: 'project-status.json'
} as const;

switch (command) {
  case 'status':
    process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
    break;
  case 'run': {
    const fixtureFlagIndex = process.argv.indexOf('--fixture');
    const fixtureId = fixtureFlagIndex >= 0 ? process.argv[fixtureFlagIndex + 1] : 'HS-001';
    if (fixtureId !== 'HS-001') {
      process.stderr.write(`Unknown fixture: ${fixtureId ?? '(missing)'}\n`);
      process.exitCode = 2;
      break;
    }
    const result = runHeadlessTripPlan({
      traceId: 'cli-fixture-001',
      origin: 'Istanbul',
      targetRegion: 'Marmara',
      durationDays: 2,
      childrenAges: [2, 6],
      budgetAmount: 40_000,
      maxRadiusKm: 150,
      lowFatigueRequired: true,
      middayRestRequired: true,
      womenOnlyBeachRequiredWhenSeaRecommended: true,
      candidatePool: [{
        candidateId: 'candidate-yalova',
        name: 'Yalova',
        type: 'mixed',
        relationToTarget: 'primary',
        estimatedDistanceBucket: '50_100_km',
        likelyTripRole: 'base_stay',
        familyRelevanceHypothesis: 'Short transfer and family rest options.',
        seaRelevant: true,
        fatigueRisk: 'low'
      }],
      routes: [{
        destinationId: 'candidate-yalova',
        destinationName: 'Yalova',
        exactDistanceKm: 92,
        exactDriveTimeMinutes: 85,
        parkingAvailable: true,
        trafficRisk: 'low',
        evidenceIds: {
          exactDistance: 'route-distance-001',
          exactDriveTime: 'route-duration-001',
          parkingAvailability: 'parking-001',
          liveTraffic: 'traffic-001'
        }
      }],
      evidence: {
        womenOnlyBeach: {
          evidenceId: 'official-facility-001',
          sourceType: 'official_facility'
        }
      }
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.status !== 'completed') process.exitCode = 1;
    break;
  }
  default:
    process.stderr.write(`Unknown command: ${command}\n`);
    process.exitCode = 2;
}
