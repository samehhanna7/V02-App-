/**
 * Heart Rate Zone definitions — fixed for the entire program.
 * Max HR assumed = 190 bpm for percentage calculations.
 */

export const HR_ZONES = [
  {
    number: 1,
    label: 'Zone 1',
    name: 'Recovery / Aerobic Base',
    range: '<142 bpm',
    min: 0,
    max: 141,
    percentRange: '<75% max HR',
    purpose: 'Aerobic base building and active recovery',
    whenUsed: 'All Phase 1 sessions; steady-state sessions in Phases 2 & 3',
    color: 'zone-1',
    tailwindBg: 'bg-cyan-500/20',
    tailwindBorder: 'border-cyan-500/30',
    tailwindText: 'text-cyan-400',
    hex: '#22d3ee',
  },
  {
    number: 2,
    label: 'Zone 2',
    name: 'Aerobic Development',
    range: '143–153 bpm',
    min: 143,
    max: 153,
    percentRange: '75–80% max HR',
    purpose: 'Aerobic fitness development',
    whenUsed: 'Upper end of steady-state sessions; Phase 2–3 recovery',
    color: 'zone-2',
    tailwindBg: 'bg-emerald-500/20',
    tailwindBorder: 'border-emerald-500/30',
    tailwindText: 'text-emerald-400',
    hex: '#34d399',
  },
  {
    number: 3,
    label: 'Zone 3',
    name: 'Aerobic Threshold',
    range: '154–164 bpm',
    min: 154,
    max: 164,
    percentRange: '81–86% max HR',
    purpose: 'Lactate threshold development',
    whenUsed: 'Modified 4×4 intervals (Phase 2)',
    color: 'zone-3',
    tailwindBg: 'bg-amber-500/20',
    tailwindBorder: 'border-amber-500/30',
    tailwindText: 'text-amber-400',
    hex: '#fbbf24',
  },
  {
    number: 4,
    label: 'Zone 4',
    name: 'High Intensity',
    range: '165–175 bpm',
    min: 165,
    max: 175,
    percentRange: '87–92% max HR',
    purpose: 'VO2 Max stimulus — high-intensity efforts',
    whenUsed: 'Modified 4×4 intervals (Phase 2)',
    color: 'zone-4',
    tailwindBg: 'bg-orange-500/20',
    tailwindBorder: 'border-orange-500/30',
    tailwindText: 'text-orange-400',
    hex: '#f97316',
  },
  {
    number: 5,
    label: 'Zone 5',
    name: '4×4 Interval Target',
    range: '176–190 bpm',
    min: 176,
    max: 190,
    percentRange: '93–100% max HR',
    purpose: 'Maximum VO2 Max stimulus — full effort intervals',
    whenUsed: 'Full 4×4 protocol intervals (Phase 3)',
    color: 'zone-5',
    tailwindBg: 'bg-red-500/20',
    tailwindBorder: 'border-red-500/30',
    tailwindText: 'text-red-400',
    hex: '#ef4444',
  },
];

/**
 * Get zone definition by zone number (1–5).
 */
export function getZone(number) {
  return HR_ZONES.find((z) => z.number === number);
}

/**
 * Detect which zone a given HR value falls in.
 * Returns the zone object or null.
 */
export function detectZone(bpm) {
  if (bpm < 142) return HR_ZONES[0];
  if (bpm <= 153) return HR_ZONES[1];
  if (bpm <= 164) return HR_ZONES[2];
  if (bpm <= 175) return HR_ZONES[3];
  if (bpm <= 190) return HR_ZONES[4];
  return null;
}
