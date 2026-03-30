export default function ProgressBar({ current, total, label, showFraction = true }) {
  const pct = total ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="w-full">
      {(label || showFraction) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          {showFraction && total && (
            <span className="text-sm font-semibold text-white">
              {current}
              <span className="text-slate-500"> / {total}</span>
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-bright rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showFraction && total && (
        <p className="text-xs text-slate-500 mt-1.5">
          {Math.round(pct)}% complete
        </p>
      )}
    </div>
  );
}
