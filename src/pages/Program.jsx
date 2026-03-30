import { HR_ZONES } from '../data/zones';
import {
  PHASES,
  PROGRESSION_CRITERIA,
  CHECKPOINT_SCHEDULE,
  VO2MAX_PROJECTIONS,
} from '../data/programStructure';

function SectionCard({ title, children, accent = false }) {
  return (
    <div className={`card p-5 ${accent ? 'border-accent/20 bg-accent/5' : ''}`}>
      <h2 className="text-base font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function PhaseCard({ phase }) {
  const phaseColors = {
    1: { badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25', dot: 'bg-cyan-500' },
    2: { badge: 'bg-violet-500/15 text-violet-400 border-violet-500/25', dot: 'bg-violet-500' },
    3: { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/25', dot: 'bg-rose-500' },
  };
  const colors = phaseColors[phase.number] || phaseColors[1];

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${colors.dot}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <h3 className="text-base font-bold text-white">Phase {phase.number} — {phase.name}</h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-lg border ${colors.badge}`}>
              Sessions {phase.sessions}
            </span>
          </div>
          <p className="text-sm text-slate-400">{phase.type}</p>
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed mb-4">{phase.description}</p>

      {/* Session breakdown table */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Session Breakdown</p>
        <div className="rounded-lg overflow-hidden border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary/60">
                <th className="text-left px-3 py-2 text-xs text-slate-500 font-semibold">Sessions</th>
                <th className="text-left px-3 py-2 text-xs text-slate-500 font-semibold">Duration</th>
                <th className="text-left px-3 py-2 text-xs text-slate-500 font-semibold">Type</th>
                <th className="text-left px-3 py-2 text-xs text-slate-500 font-semibold">Zone</th>
              </tr>
            </thead>
            <tbody>
              {phase.sessionBreakdown.map((row, i) => (
                <tr key={i} className="border-t border-white/[0.04]">
                  <td className="px-3 py-2.5 text-xs text-slate-300">{row.sessions}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-300">{row.duration}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-300">{row.type}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-300">{row.zone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interval details for phases 2 & 3 */}
      {phase.intervalDetails && (
        <div className="bg-bg-secondary/40 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Interval Session Structure</p>
          <ul className="flex flex-col gap-1.5">
            {[
              { label: 'Warm-up', value: phase.intervalDetails.warmUp },
              { label: 'Intervals', value: phase.intervalDetails.intervals },
              { label: 'Recovery', value: phase.intervalDetails.recovery },
              { label: 'Cool-down', value: phase.intervalDetails.coolDown },
            ].map((item) => (
              <li key={item.label} className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[80px] flex-shrink-0">{item.label}:</span>
                <span className="text-slate-300">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Goals */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Phase Goals</p>
        <ul className="flex flex-col gap-1.5">
          {phase.goals.map((goal, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {goal}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ZonesTable() {
  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-white mb-4">Heart Rate Zones</h2>
      <div className="flex flex-col gap-3">
        {HR_ZONES.map((zone) => (
          <div key={zone.number} className={`rounded-xl p-3.5 border ${zone.tailwindBg} ${zone.tailwindBorder}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${zone.tailwindText}`}>{zone.label}</span>
                <span className="text-xs text-slate-500">— {zone.name}</span>
              </div>
              <span className={`text-xs font-semibold ${zone.tailwindText}`}>{zone.percentRange}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-base font-bold ${zone.tailwindText}`}>{zone.range}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{zone.purpose}</p>
            <p className="text-xs text-slate-600 mt-1">Used: {zone.whenUsed}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressionCriteriaCard() {
  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-white mb-4">Progression Criteria</h2>
      <div className="flex flex-col gap-4">
        {PROGRESSION_CRITERIA.map((criteria, i) => (
          <div key={i} className="bg-bg-secondary/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-white">{criteria.from}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
              <span className="text-sm font-semibold text-accent">{criteria.to}</span>
            </div>
            <ul className="flex flex-col gap-2 mb-3">
              {criteria.requirements.map((req, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mt-0.5 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {req}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 leading-relaxed border-t border-white/[0.05] pt-2.5">
              {criteria.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckpointCard() {
  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-white mb-4">Checkpoint Schedule</h2>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
        At these sessions, you'll enter a VO₂ Max reading from a fitness test or wearable to track your progress.
      </p>
      <div className="flex flex-wrap gap-2">
        {CHECKPOINT_SCHEDULE.map((cp) => (
          <div
            key={cp.session}
            className="flex flex-col items-center bg-bg-secondary/60 border border-white/[0.06] rounded-xl px-3 py-2.5 min-w-[60px]"
          >
            <span className="text-sm font-bold text-accent">#{cp.session}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Ph.{cp.phase}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VO2ProjectionCard() {
  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-white mb-1">VO₂ Max Projections</h2>
      <p className="text-sm text-slate-500 mb-4">Evidence-based expected ranges from consistent training</p>
      <div className="flex flex-col gap-2">
        {VO2MAX_PROJECTIONS.map((proj, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3.5 rounded-xl bg-bg-secondary/50 border border-white/[0.05] ${
              i === 0 ? 'opacity-70' : ''
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-white">{proj.milestone}</p>
              <p className="text-xs text-slate-500 mt-0.5">{proj.note}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${proj.color}`}>{proj.range}</p>
              <p className={`text-xs mt-0.5 ${proj.color} opacity-80`}>{proj.category}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-3 leading-relaxed">
        Projections based on the Norwegian 4×4 interval training protocol research. Individual results vary based on consistency, genetics, and fitness baseline.
      </p>
    </div>
  );
}

export default function Program() {
  return (
    <div className="flex flex-col gap-4 pb-4 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-bg-secondary to-transparent px-5 pt-5 pb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          Reference
        </p>
        <h1 className="text-2xl font-bold text-white">The Program</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete VO₂ Max development protocol — structure, zones, and progressions
        </p>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Program overview */}
        <div className="card p-4 bg-gradient-to-br from-accent/5 to-transparent border-accent/15">
          <p className="text-sm text-slate-300 leading-relaxed">
            This program uses the evidence-based Norwegian 4×4 interval method to systematically develop VO₂ Max over 3 phases. Starting with aerobic base building, then introducing intervals, and finally executing the full high-intensity protocol.
          </p>
        </div>

        {/* Phase cards */}
        <div>
          <p className="section-title px-1">Program Phases</p>
          <div className="flex flex-col gap-4">
            {PHASES.map((phase) => (
              <PhaseCard key={phase.number} phase={phase} />
            ))}
          </div>
        </div>

        {/* HR Zones */}
        <ZonesTable />

        {/* Progression criteria */}
        <ProgressionCriteriaCard />

        {/* Checkpoint schedule */}
        <CheckpointCard />

        {/* VO2 Max projections */}
        <VO2ProjectionCard />
      </div>
    </div>
  );
}
