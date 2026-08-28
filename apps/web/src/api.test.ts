import { describe, expect, it } from 'vitest';
import { createPlanService, validateIntake } from './api.js';

async function waitForResult(service: ReturnType<typeof createPlanService>, id: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const job = service.get(id);
    if (job?.status !== 'planning') return job;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error('Plan job did not finish in time.');
}

describe('planning API service', () => {
  it('accepts intake and returns a completed typed view model after polling', async () => {
    const service = createPlanService(1);
    const job = service.start(validateIntake({ origin: 'Istanbul', targetRegion: 'Marmara', durationDays: 2, budgetAmount: 40000 }));
    expect(job.status).toBe('planning');
    const result = await waitForResult(service, job.id);
    expect(result?.status).toBe('completed');
    expect(result?.viewModel).toMatchObject({ status: 'completed', durationDays: 2 });
  });

  it('keeps final plan hidden when verification evidence is missing', async () => {
    const service = createPlanService(1);
    const job = service.start(validateIntake({ origin: 'Istanbul', targetRegion: 'Marmara', durationDays: 2, budgetAmount: 40000, mode: 'blocked' }));
    const result = await waitForResult(service, job.id);
    expect(result?.status).toBe('blocked');
    expect(result?.viewModel?.days).toHaveLength(0);
    expect(result?.viewModel?.blockers).toContain('women_only_beach_status_unverified');
  });

  it('returns a completed plan with visible verification warnings', async () => {
    const service = createPlanService(1);
    const job = service.start(validateIntake({ origin: 'Istanbul', targetRegion: 'Marmara', durationDays: 2, budgetAmount: 40000, mode: 'warning' }));
    const result = await waitForResult(service, job.id);
    expect(result?.status).toBe('completed');
    expect(result?.viewModel?.verificationWarnings).toContain('route_verification_needed:candidate-yalova:exact_distance');
  });

  it('rejects invalid intake at the API boundary', () => {
    expect(() => validateIntake({ origin: '', targetRegion: 'Marmara', durationDays: 0, budgetAmount: -1 })).toThrow();
  });
});
