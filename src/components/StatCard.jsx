export default function StatCard({ label, value, sub, icon, accent = false }) {
  return (
    <div
      className={`card p-4 flex flex-col gap-1 ${
        accent ? 'border-accent/20 bg-accent/5' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && (
          <span className={`text-base ${accent ? 'text-accent' : 'text-slate-500'}`}>
            {icon}
          </span>
        )}
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span
        className={`text-2xl font-bold leading-none ${
          accent ? 'text-accent-bright' : 'text-white'
        }`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-slate-500 mt-0.5">{sub}</span>}
    </div>
  );
}
