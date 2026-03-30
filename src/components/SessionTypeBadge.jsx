import { formatSessionType } from '../utils/programLogic';

const typeStyles = {
  steady_state: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  modified_4x4: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  full_4x4: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
};

export default function SessionTypeBadge({ type, size = 'sm' }) {
  const style = typeStyles[type] || 'bg-white/10 text-slate-400 border-white/10';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md border font-medium ${textSize} ${style}`}
    >
      {formatSessionType(type)}
    </span>
  );
}
