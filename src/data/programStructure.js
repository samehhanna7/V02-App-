/**
 * Static program structure data for the Program reference page.
 */

export const PHASES = [
  {
    number: 1,
    name: 'Base Building',
    sessions: '1–12',
    sessionCount: 12,
    type: 'Steady State',
    primaryZone: 'Zone 1 (<142 bpm)',
    durationProgression: '25 → 27 → 30 min',
    description:
      'Build your aerobic foundation with consistent low-intensity steady-state cardio. The goal is to adapt your cardiovascular system to sustained effort while keeping heart rate firmly in Zone 1. This phase trains fat oxidation, cardiac efficiency, and capillary density.',
    goals: [
      'Establish consistent training habit',
      'Develop aerobic base at Zone 1 (<142 bpm)',
      'Avg HR stays below 133 bpm in final 4 sessions',
      'No peaks above 142 bpm in final 4 sessions',
    ],
    sessionBreakdown: [
      { sessions: '1–4', duration: '25 min', type: 'Steady State', zone: 'Zone 1' },
      { sessions: '5–8', duration: '27 min', type: 'Steady State', zone: 'Zone 1' },
      { sessions: '9–12', duration: '30 min', type: 'Steady State', zone: 'Zone 1' },
    ],
  },
  {
    number: 2,
    name: 'Aerobic Development',
    sessions: '13–24',
    sessionCount: 12,
    type: 'Alternating: Steady State / Modified 4×4',
    primaryZone: 'Zone 1–2 (steady) / Zone 3–4 (intervals)',
    description:
      'Introduce structured intervals to begin targeting VO2 Max adaptations. Sessions alternate between steady-state recovery and modified 4×4 intervals with 3-minute efforts. This phase bridges the gap between base aerobic fitness and full high-intensity training.',
    goals: [
      'Complete all 4 intervals per interval session',
      'Achieve Zone 3–4 (154–175 bpm) during intervals',
      'Recovery HR drops below 142 bpm between intervals',
      'Maintain aerobic base on steady-state days',
    ],
    sessionBreakdown: [
      { sessions: '13, 15, 17, 19, 21, 23', duration: '30 min', type: 'Steady State', zone: 'Zone 1–2' },
      { sessions: '14, 16, 18, 20, 22, 24', duration: '45 min', type: 'Modified 4×4', zone: 'Zone 3–4 intervals' },
    ],
    intervalDetails: {
      warmUp: '10 min Zone 1–2',
      intervals: '4 × 3 min at Zone 3–4 (154–175 bpm)',
      recovery: '3 min active recovery between each interval (<142 bpm)',
      coolDown: '10 min Zone 1–2',
    },
  },
  {
    number: 3,
    name: 'High-Intensity Training',
    sessions: '25+',
    sessionCount: null,
    type: 'Alternating: Steady State / Full 4×4',
    primaryZone: 'Zone 1–2 (steady) / Zone 5 (intervals)',
    description:
      'The full Norwegian 4×4 protocol — the most evidence-backed method for improving VO2 Max. Four-minute intervals at maximum intensity (Zone 5, 176–190 bpm) followed by three minutes of active recovery. This phase produces the largest VO2 Max gains.',
    goals: [
      'Sustain 176–190 bpm for all 4-minute intervals',
      'Complete all 4 intervals per session',
      'Progressive improvement in VO2 Max readings',
      'Maintain recovery quality on steady-state days',
    ],
    sessionBreakdown: [
      { sessions: 'Positions 1, 3 in each 4-session cycle', duration: '30 min', type: 'Steady State', zone: 'Zone 1–2' },
      { sessions: 'Positions 2, 4 in each 4-session cycle', duration: '47 min', type: 'Full 4×4', zone: 'Zone 5 intervals' },
    ],
    intervalDetails: {
      warmUp: '10 min Zone 1–2',
      intervals: '4 × 4 min at Zone 5 (176–190 bpm)',
      recovery: '3 min active recovery between each interval',
      coolDown: '5 min Zone 1–2',
    },
  },
];

export const PROGRESSION_CRITERIA = [
  {
    from: 'Phase 1',
    to: 'Phase 2',
    requirements: [
      '12 Phase 1 sessions completed',
      'Last 4 sessions: avg HR below 133 bpm in each',
      'Last 4 sessions: no peak HR above 142 bpm',
    ],
    rationale:
      'These criteria confirm your cardiovascular system has adapted to aerobic base work. The declining HR response at the same workload indicates improved cardiac efficiency.',
  },
  {
    from: 'Phase 2',
    to: 'Phase 3',
    requirements: [
      '12 Phase 2 sessions completed',
      'All 4 intervals completed in every interval session',
      'Recovery HR drops below 142 bpm after each interval',
    ],
    rationale:
      'Complete interval execution and recovery HR confirm your system can tolerate and recover from high-intensity efforts — a prerequisite for the full 4×4 protocol.',
  },
];

export const CHECKPOINT_SCHEDULE = [
  { session: 4, phase: 1, note: 'Early baseline check' },
  { session: 8, phase: 1, note: 'Mid-phase 1 progress' },
  { session: 12, phase: 1, note: 'Phase 1 completion' },
  { session: 16, phase: 2, note: 'Mid-phase 2 progress' },
  { session: 20, phase: 2, note: 'Late phase 2' },
  { session: 24, phase: 2, note: 'Phase 2 completion' },
  { session: 28, phase: 3, note: 'Early phase 3' },
  { session: 36, phase: 3, note: 'Full program milestone' },
];

export const VO2MAX_PROJECTIONS = [
  {
    milestone: 'Baseline (Session 1)',
    range: '35.9 ml/kg/min',
    category: 'Fair',
    note: 'Starting point',
    color: 'text-amber-400',
  },
  {
    milestone: 'Session 8',
    range: '35–37 ml/kg/min',
    category: 'Fair',
    note: 'Minimal early gains; adaptation in progress',
    color: 'text-amber-400',
  },
  {
    milestone: 'Session 20',
    range: '38–40 ml/kg/min',
    category: 'Fair → Average',
    note: 'Measurable improvement from Phase 2 intervals',
    color: 'text-emerald-400',
  },
  {
    milestone: 'Session 36',
    range: '41–44 ml/kg/min',
    category: 'Average → Good',
    note: 'Significant gains from full 4×4 protocol',
    color: 'text-accent-bright',
  },
];
