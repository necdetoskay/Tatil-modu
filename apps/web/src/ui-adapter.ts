export type UiStatus = 'completed' | 'blocked';

export interface UiPlanViewModel {
  status: UiStatus;
  title: string;
  summary: string;
  durationDays: number;
  travelStyle: string;
  privacyConstraintActive: boolean;
  days: { dayNumber: number; theme: string; blocks: { label: string; title: string; notes: string[] }[]; alternatives: string[]; warnings: string[] }[];
  disclosures: { status: string; message: string; evidenceAttached: boolean }[];
  blockers: string[];
  confidence: string;
  confidenceReasons: string[];
}

type FinalResponse = {
  validation_status: 'pass' | 'pass_with_warnings' | 'blocked';
  final_response: {
    response_title: string;
    executive_summary: string;
    plan_overview: { duration_days: number; travel_style: string; privacy_constraint_active: boolean };
    daily_plan_cards: { day_number: number; day_theme: string; primary_plan: Record<string, { title: string; notes: string[] }>; alternatives: { title: string }[]; warnings: string[] }[];
    verification_disclosures: { status: string; message: string; source_evidence_item_ids: string[] }[];
    hard_blockers: string[];
    confidence_summary: { overall_confidence: string; confidence_reasons: string[] };
  };
};

export function toUiPlanViewModel(response: FinalResponse): UiPlanViewModel {
  const result = response.final_response;
  const labels: Record<string, string> = { morning_block: 'Sabah', lunch_rest_block: 'Öğle ve dinlenme', afternoon_block: 'Öğleden sonra', evening_block: 'Akşam' };
  return {
    status: response.validation_status === 'blocked' ? 'blocked' : 'completed', title: result.response_title,
    summary: result.executive_summary, durationDays: result.plan_overview.duration_days,
    travelStyle: result.plan_overview.travel_style, privacyConstraintActive: result.plan_overview.privacy_constraint_active,
    days: result.daily_plan_cards.map((day) => ({ dayNumber: day.day_number, theme: day.day_theme,
      blocks: Object.entries(day.primary_plan).map(([key, block]) => ({ label: labels[key] ?? key, title: block.title, notes: block.notes })),
      alternatives: day.alternatives.map((alternative) => alternative.title), warnings: day.warnings })),
    disclosures: result.verification_disclosures.map((disclosure) => ({ status: disclosure.status, message: disclosure.message, evidenceAttached: disclosure.source_evidence_item_ids.length > 0 })),
    blockers: result.hard_blockers, confidence: result.confidence_summary.overall_confidence, confidenceReasons: result.confidence_summary.confidence_reasons
  };
}
