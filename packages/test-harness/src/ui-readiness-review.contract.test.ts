import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../..');
const registry = JSON.parse(readFileSync(resolve(root, 'packages/test-harness/registry/ui-readiness-review.v1.json'), 'utf8')) as {
  requiredStates: string[];
  requiredSurfaces: string[];
  forbiddenUiOwnership: string[];
  invariants: Record<string, boolean>;
};

describe('UI Readiness Review', () => {
  it('covers every required user-visible runtime state', () => {
    expect(registry.requiredStates).toEqual(expect.arrayContaining([
      'idle', 'collecting_input', 'clarification_required', 'planning', 'partial_result',
      'completed', 'blocked', 'failed', 'revising'
    ]));
    expect(new Set(registry.requiredStates).size).toBe(registry.requiredStates.length);
  });

  it('maps every critical final-result surface to a review contract', () => {
    expect(registry.requiredSurfaces).toEqual(expect.arrayContaining([
      'constraint_summary', 'plan_overview', 'daily_cards', 'alternatives', 'disclosures',
      'blockers', 'confidence', 'user_actions', 'errors'
    ]));
  });

  it('ships the review artifacts required for an auditable readiness decision', () => {
    const requiredDocs = [
      'README.md',
      '01-screen-flow.md',
      '02-state-error-matrix.md',
      '03-contract-traceability.md',
      '04-accessibility-checklist.md'
    ];
    for (const fileName of requiredDocs) {
      const content = readFileSync(resolve(root, 'docs/28-ui-readiness-review', fileName), 'utf8');
      expect(content.length).toBeGreaterThan(100);
    }
  });

  it('keeps decision ownership out of UI', () => {
    expect(registry.forbiddenUiOwnership).toEqual(expect.arrayContaining([
      'candidate_generation', 'constraint_classification', 'ranking', 'verification',
      'confidence_generation', 'quality_score', 'orchestration_routing', 'memory_write'
    ]));
  });

  it('enforces safety invariants required before frontend implementation', () => {
    expect(registry.invariants).toEqual({
      blockedHidesFinalPlan: true,
      hardBlockersAreVisible: true,
      unverifiedClaimsDiscloseUncertainty: true,
      memoryRequiresConsent: true,
      revisionPreservesScope: true
    });
  });
});
