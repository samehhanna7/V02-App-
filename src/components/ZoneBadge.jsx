import { HR_ZONES } from '../data/zones';

const zoneStyles = {
  1: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  2: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  3: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  4: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  5: 'bg-red-500/15 text-red-400 border-red-500/25',
};

export default function ZoneBadge({ zone, size = 'sm' }) {
  const z = HR_ZONES.find((z) => z.number === zone);
  if (!z) return null;

  const style = zoneStyles[zone] || zoneStyles[1];
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border font-medium ${textSize} ${style}`}
    >
      Z{zone}
    </span>
  );
}
