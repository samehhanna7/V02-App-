/**
 * Visual bar showing time distribution across zones for a session.
 */
export default function ZoneBar({ session }) {
  const total = session.total_duration_min || 1;
  const zones = [
    { num: 1, min: session.zone1_min || 0, color: 'bg-cyan-500' },
    { num: 2, min: session.zone2_min || 0, color: 'bg-emerald-500' },
    { num: 3, min: session.zone3_min || 0, color: 'bg-amber-500' },
    { num: 4, min: session.zone4_min || 0, color: 'bg-orange-500' },
    { num: 5, min: session.zone5_min || 0, color: 'bg-red-500' },
  ].filter((z) => z.min > 0);

  if (zones.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {zones.map((z) => (
          <div
            key={z.num}
            className={`${z.color} rounded-sm transition-all`}
            style={{ width: `${(z.min / total) * 100}%` }}
            title={`Zone ${z.num}: ${z.min} min`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {zones.map((z) => (
          <span key={z.num} className="text-xs text-slate-500">
            <span
              className={`inline-block w-2 h-2 rounded-sm mr-1 ${z.color} opacity-80`}
            />
            Z{z.num}: {z.min}m
          </span>
        ))}
      </div>
    </div>
  );
}
