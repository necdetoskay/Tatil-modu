import { describe, expect, it } from 'vitest';
import { toUiPlanViewModel } from './ui-adapter.js';

describe('typed UI adapter', () => {
  it('projects canonical final response fields without generating new decisions', () => {
    const model = toUiPlanViewModel({
      validation_status: 'pass',
      final_response: {
        response_title: 'Yalova family trip plan',
        executive_summary: 'Verified two-day plan.',
        plan_overview: { duration_days: 1, travel_style: 'family_low_fatigue', privacy_constraint_active: true },
        daily_plan_cards: [{
          day_number: 1, day_theme: 'Yalova - day 1',
          primary_plan: {
            morning_block: { title: 'Morning', notes: [] },
            lunch_rest_block: { title: 'Rest', notes: ['Toddler rest window'] },
            afternoon_block: { title: 'Afternoon', notes: [] },
            evening_block: { title: 'Evening', notes: [] }
          },
          alternatives: [{ title: 'Indoor alternative' }, { title: 'Rest alternative' }], warnings: []
        }],
        verification_disclosures: [{ status: 'verified', message: 'Evidence attached.', source_evidence_item_ids: ['evidence-1'] }],
        hard_blockers: [], confidence_summary: { overall_confidence: 'high', confidence_reasons: ['Verified inputs'] }
      }
    });
    expect(model).toMatchObject({ status: 'completed', durationDays: 1, privacyConstraintActive: true, confidence: 'high', verificationWarnings: [] });
    expect(model.days[0]).toMatchObject({ dayNumber: 1, alternatives: ['Indoor alternative', 'Rest alternative'] });
    expect(model.days[0]?.blocks[1]).toMatchObject({ label: 'Öğle ve dinlenme', title: 'Rest' });
    expect(model.disclosures[0]).toMatchObject({ status: 'verified', evidenceAttached: true });
  });
});
