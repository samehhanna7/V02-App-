import { useMemo } from 'react';
import {
  getPhaseForSession,
  getPhaseName,
  getSessionType,
  formatSessionType,
  getSessionFocus,
  getTargetZone,
  getNextSessionNumber,
  getPhaseSessionCount,
  getPhaseTotalSessions,
  isCheckpointSession,
  evaluatePhase1Progression,
  evaluatePhase2Progression,
  BASELINE_VO2MAX,
} from '../utils/programLogic';
import { getLastSession } from '../utils/storage';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import SessionTypeBadge from '../components/SessionTypeBadge';
import ZoneBar from '../components/ZoneBar';
import RPEBadge from '../components/RPEBadge';

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function PhaseUnlockBanner({ fromPhase, toPhase }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-emerald-300">
          Phase {toPhase} unlocked — you&apos;re ready to advance
        </p>
        <p className="text-xs text-emerald-400/70 mt-0.5">
          All Phase {fromPhase} criteria met. Your next session will be Phase {toPhase}.
        </p>
      </div>
    </div>
  );
}

function VO2MaxCard({ reading, session }) {
  const delta = reading - BASELINE_VO2MAX;
  const isGain = delta >= 0;

  const category = reading < 38 ? 'Fair' : reading < 42 ? 'Average' : 'Good';
  const catColor = reading < 38 ? 'text-amber-400' : reading < 42 ? 'text-emerald-400' : 'text-accent-bright';

  return (
    <div className="card p-5 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
            VO₂ Max Reading
          </p>
          <p className="text-xs text-slate-500">Session {session} checkpoint</p>
        </div>
        <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg bg-white/5 ${catColor}`}>
          {category}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-white">
          {reading}
          <span className="text-xl text-slate-400 ml-1">ml/kg/min</span>
        </span>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
        <span className={`text-sm font-semibold ${isGain ? 'text-emerald-400' : 'text-red-400'}`}>
          {isGain ? '+' : ''}{delta.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500">
          vs baseline ({BASELINE_VO2MAX} ml/kg/min)
        </span>
      </div>
    </div>
  );
}

function NextSessionCard({ sessionNumber, phase, sessionType }) {
  const isCheckpoint = isCheckpointSession(sessionNumber);
  const focus = getSessionFocus(sessionType, phase);
  const targetZone = getTargetZone(sessionType, phase);

  const durationHint = phase === 1
    ? sessionNumber <= 4 ? '25 min' : sessionNumber <= 8 ? '27 min' : '30 min'
    : sessionType !== 'steady_state' ? '~45 min' : '30 min';

  return (
    <div className="card p-5 border-accent/15 bg-gradient-to-br from-[rgba(59,130,246,0.04)] to-transparent">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
            Next Session
          </p>
          <p className="text-2xl font-bold text-white">#{sessionNumber}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <SessionTypeBadge type={sessionType} size="md" />
          {isCheckpoint && (
            <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-md font-medium">
              Checkpoint
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-bg-secondary/60 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Target Zone</p>
          <p className="text-sm font-semibold text-white leading-snug">{targetZone}</p>
        </div>
        <div className="bg-bg-secondary/60 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Duration</p>
          <p className="text-sm font-semibold text-white">{durationHint}</p>
        </div>
      </div>

      <div className="bg-bg-secondary/40 rounded-lg p-3">
        <p className="text-xs text-slate-500 mb-1">Focus</p>
        <p className="text-sm text-slate-300 leading-relaxed">{focus}</p>
      </div>

      {isCheckpoint && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-400/80">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Bring your VO₂ Max reading for this checkpoint session</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ sessions, onNavigate }) {
  const {
    nextSessionNumber,
    currentPhase,
    nextSessionType,
    phaseSessionsDone,
    phaseTotal,
    lastSession,
    phase1Unlocked,
    phase2Unlocked,
    lastCheckpointVO2,
  } = useMemo(() => {
    const nextNum = getNextSessionNumber(sessions);
    const phase = getPhaseForSession(nextNum);
    const type = getSessionType(nextNum);
    const phaseDone = getPhaseSessionCount(sessions, phase === 3 ? 3 : phase);
    const phaseTotal = getPhaseTotalSessions(phase);
    const last = getLastSession(sessions);

    const p1Met = evaluatePhase1Progression(sessions);
    const p2Met = evaluatePhase2Progression(sessions);

    // Find most recent checkpoint session with a VO2 max reading
    const checkpointSessions = [...sessions]
      .filter((s) => s.vo2max_reading !== null && s.vo2max_reading !== undefined)
      .sort((a, b) => b.session_number - a.session_number);
    const lastCP = checkpointSessions[0] || null;

    return {
      nextSessionNumber: nextNum,
      currentPhase: phase,
      nextSessionType: type,
      phaseSessionsDone: phaseDone,
      phaseTotal,
      lastSession: last,
      phase1Unlocked: p1Met,
      phase2Unlocked: p2Met,
      lastCheckpointVO2: lastCP,
    };
  }, [sessions]);

  const totalSessions = sessions.length;
  const lastDate = lastSession
    ? new Date(lastSession.session_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="flex flex-col gap-5 pb-4 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-bg-secondary to-transparent px-5 pt-5 pb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          {getPhaseName(currentPhase)}
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-bold text-white leading-tight">
            VO₂ Max Companion
          </h1>
          {totalSessions > 0 && (
            <span className="text-sm text-slate-500">
              Session {nextSessionNumber - 1} done
            </span>
          )}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Phase unlock banners */}
        {phase1Unlocked && currentPhase <= 2 && (
          <PhaseUnlockBanner fromPhase={1} toPhase={2} />
        )}
        {phase2Unlocked && currentPhase <= 3 && (
          <PhaseUnlockBanner fromPhase={2} toPhase={3} />
        )}

        {/* Latest VO2 Max checkpoint */}
        {lastCheckpointVO2 && (
          <VO2MaxCard
            reading={lastCheckpointVO2.vo2max_reading}
            session={lastCheckpointVO2.session_number}
          />
        )}

        {/* Next Session card */}
        <NextSessionCard
          sessionNumber={nextSessionNumber}
          phase={currentPhase}
          sessionType={nextSessionType}
        />

        {/* Phase Progress */}
        {phaseTotal && (
          <div className="card p-4">
            <p className="section-title">Phase {currentPhase} Progress</p>
            <ProgressBar
              current={phaseSessionsDone}
              total={phaseTotal}
              label={`${getPhaseName(currentPhase)}`}
              showFraction
            />
          </div>
        )}

        {/* Quick stats */}
        <div>
          <p className="section-title px-1">Overview</p>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Sessions"
              value={totalSessions}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
            <StatCard
              label="Phase"
              value={currentPhase}
              sub={currentPhase === 1 ? 'Base' : currentPhase === 2 ? 'Develop' : 'HIT'}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                </svg>
              }
            />
            <StatCard
              label="Last Session"
              value={lastDate === '—' ? '—' : lastDate.split(',')[0]}
              sub={lastDate !== '—' ? lastDate.split(', ')[1] : 'No sessions yet'}
            />
          </div>
        </div>

        {/* Last session summary */}
        {lastSession && (
          <div>
            <p className="section-title px-1">Last Session</p>
            <div className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Session #{lastSession.session_number}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{lastDate}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <SessionTypeBadge type={lastSession.session_type} />
                  <RPEBadge rpe={lastSession.rpe} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{lastSession.avg_hr_bpm}</p>
                  <p className="text-xs text-slate-500">Avg HR</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{lastSession.peak_hr_bpm}</p>
                  <p className="text-xs text-slate-500">Peak HR</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{lastSession.total_duration_min}</p>
                  <p className="text-xs text-slate-500">Minutes</p>
                </div>
              </div>

              <ZoneBar session={lastSession} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalSessions === 0 && (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <p className="text-base font-semibold text-white mb-2">Ready to start</p>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Log your first session to begin the VO₂ Max development program.
            </p>
            <button
              onClick={() => onNavigate('log')}
              className="btn-primary text-sm px-5 py-2.5"
            >
              Log Session #1
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
