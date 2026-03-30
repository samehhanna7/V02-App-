import { useState } from 'react';
import {
  getPhaseName,
  formatSessionType,
  formatEquipment,
  sessionHasIntervals,
} from '../utils/programLogic';
import SessionTypeBadge from '../components/SessionTypeBadge';
import ZoneBadge from '../components/ZoneBadge';
import ZoneBar from '../components/ZoneBar';
import RPEBadge from '../components/RPEBadge';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function PhaseLabel({ phase }) {
  const colors = {
    1: 'text-cyan-400 bg-cyan-500/10',
    2: 'text-violet-400 bg-violet-500/10',
    3: 'text-rose-400 bg-rose-500/10',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors[phase] || 'text-slate-400 bg-white/5'}`}>
      Phase {phase}
    </span>
  );
}

function SessionDetail({ session }) {
  const hasIntervals = sessionHasIntervals(session.session_type);

  return (
    <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-4 animate-fade-in">
      {/* Zone breakdown */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Time in Zone</p>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {[
            { num: 1, min: session.zone1_min, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
            { num: 2, min: session.zone2_min, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
            { num: 3, min: session.zone3_min, color: 'text-amber-400', bg: 'bg-amber-500/15' },
            { num: 4, min: session.zone4_min, color: 'text-orange-400', bg: 'bg-orange-500/15' },
            { num: 5, min: session.zone5_min, color: 'text-red-400', bg: 'bg-red-500/15' },
          ].map((z) => (
            <div
              key={z.num}
              className={`rounded-lg p-2 text-center ${z.bg}`}
            >
              <p className={`text-sm font-bold ${z.color}`}>
                {z.min ?? 0}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Z{z.num}</p>
            </div>
          ))}
        </div>
        <ZoneBar session={session} />
      </div>

      {/* Interval data */}
      {hasIntervals && session.intervals_completed != null && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
            Intervals — {session.intervals_completed}/4 completed
          </p>

          {session.intervals_completed > 0 && session.interval_durations_sec && (
            <div className="flex flex-col gap-2 mb-3">
              {session.interval_durations_sec.map((dur, i) => (
                <div key={i} className="bg-bg-secondary/60 rounded-lg p-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">Interval {i + 1}</p>
                  <div className="flex items-center gap-3">
                    {dur != null && (
                      <span className="text-xs text-slate-500">
                        {Math.floor(dur / 60)}:{String(dur % 60).padStart(2, '0')} min
                      </span>
                    )}
                    {session.interval_avg_hr && session.interval_avg_hr[i] != null && (
                      <span className="text-sm font-semibold text-white">
                        {session.interval_avg_hr[i]} bpm
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {session.recovery_avg_hr && session.recovery_avg_hr.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Recovery HR</p>
              <div className="flex gap-2">
                {session.recovery_avg_hr.map((hr, i) => (
                  <div key={i} className="bg-bg-secondary/60 rounded-lg px-3 py-2 text-center flex-1">
                    <p className="text-sm font-semibold text-white">{hr ?? '—'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Rec {i + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VO2 Max (if checkpoint) */}
      {session.vo2max_reading != null && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
          <p className="text-xs text-accent mb-1 font-semibold uppercase tracking-wider">VO₂ Max Reading</p>
          <p className="text-xl font-bold text-white">
            {session.vo2max_reading}
            <span className="text-sm text-slate-400 ml-1">ml/kg/min</span>
          </p>
        </div>
      )}

      {/* Notes */}
      {session.notes && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Notes</p>
          <p className="text-sm text-slate-300 leading-relaxed bg-bg-secondary/40 rounded-lg p-3">
            {session.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-4 transition-all duration-200">
      <button
        className="w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Session number + date */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-accent">#{session.session_number}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{formatDate(session.session_date)}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <PhaseLabel phase={session.phase} />
                <SessionTypeBadge type={session.session_type} />
              </div>
            </div>
          </div>

          {/* Right: expand toggle */}
          <div
            className={`text-slate-500 transition-transform duration-200 flex-shrink-0 mt-1 ${
              expanded ? 'rotate-180' : ''
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="text-center">
            <p className="text-base font-bold text-white">{session.avg_hr_bpm}</p>
            <p className="text-[10px] text-slate-500">Avg HR</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-white">{session.peak_hr_bpm}</p>
            <p className="text-[10px] text-slate-500">Peak HR</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-white">{session.total_duration_min}</p>
            <p className="text-[10px] text-slate-500">Min</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-white">{session.rpe}</p>
            <p className="text-[10px] text-slate-500">RPE</p>
          </div>
        </div>

        {/* Equipment tag */}
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-xs text-slate-500 capitalize">
            {formatEquipment(session.equipment)}
          </span>
          {session.vo2max_reading != null && (
            <span className="text-xs text-accent font-semibold">
              VO₂: {session.vo2max_reading}
            </span>
          )}
        </div>
      </button>

      {expanded && <SessionDetail session={session} />}
    </div>
  );
}

export default function History({ sessions }) {
  const sorted = [...sessions].sort((a, b) => b.session_number - a.session_number);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="text-base font-semibold text-white mb-2">No sessions yet</p>
        <p className="text-sm text-slate-500">
          Your logged sessions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-bg-secondary to-transparent px-5 pt-5 pb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          All Sessions
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-bold text-white">History</h1>
          <span className="text-sm text-slate-500">{sorted.length} sessions</span>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3">
        {sorted.map((session) => (
          <SessionCard key={session.session_number} session={session} />
        ))}
      </div>
    </div>
  );
}
