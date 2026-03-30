function getRpeColor(rpe) {
  if (rpe <= 3) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (rpe <= 5) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (rpe <= 7) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
}

function getRpeLabel(rpe) {
  if (rpe <= 2) return 'Very Easy';
  if (rpe <= 4) return 'Easy';
  if (rpe === 5) return 'Moderate';
  if (rpe <= 7) return 'Hard';
  if (rpe <= 9) return 'Very Hard';
  return 'Max Effort';
}

export default function RPEBadge({ rpe }) {
  const color = getRpeColor(rpe);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${color}`}
    >
      RPE {rpe}
      <span className="opacity-70">· {getRpeLabel(rpe)}</span>
    </span>
  );
}
