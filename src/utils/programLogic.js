/**
 * Core program logic utilities for VO2 Max Companion.
 * All phase rules, session type logic, and progression criteria live here.
 */

// Sessions that require a VO2 Max reading entry
export const CHECKPOINT_SESSIONS = [4, 8, 12, 16, 20, 24, 28, 36];

// Baseline VO2 Max (ml/kg/min)
export const BASELINE_VO2MAX = 35.9;

/**
 * Determine the phase for a given session number.
 * Phase 1: sessions 1–12
 * Phase 2: sessions 13–24
 * Phase 3: sessions 25+
 */
export function getPhaseForSession(sessionNumber) {
  if (sessionNumber <= 12) return 1;
  if (sessionNumber <= 24) return 2;
  return 3;
}

/**
 * Determine the session type for a given session number.
 * Phase 1: always steady_state
 * Phase 2: pattern A(steady_state), B(modified_4x4), C(steady_state), repeat
 *   - sessions 13,15,17,19,21,23 → steady_state
 *   - sessions 14,16,18,20,22,24 → modified_4x4
 * Phase 3: pattern A(steady_state), B(full_4x4), C(steady_state), D(full_4x4), repeat
 *   - position within phase 3 (1-indexed): 1→steady, 2→full_4x4, 3→steady, 4→full_4x4, repeat
 */
export function getSessionType(sessionNumber) {
  const phase = getPhaseForSession(sessionNumber);

  if (phase === 1) {
    return 'steady_state';
  }

  if (phase === 2) {
    // Phase 2 starts at session 13. Odd position = steady, even = modified
    const posInPhase = sessionNumber - 12; // 1-indexed within phase 2
    return posInPhase % 2 === 0 ? 'modified_4x4' : 'steady_state';
  }

  // Phase 3 starts at session 25. Pattern: steady, full_4x4, steady, full_4x4
  const posInPhase = ((sessionNumber - 25) % 4) + 1; // 1–4 cycling
  if (posInPhase === 1 || posInPhase === 3) return 'steady_state';
  return 'full_4x4';
}

/**
 * Returns true if this session number is a checkpoint session.
 */
export function isCheckpointSession(sessionNumber) {
  return CHECKPOINT_SESSIONS.includes(sessionNumber);
}

/**
 * Returns true if interval fields should be shown for this session type.
 */
export function sessionHasIntervals(sessionType) {
  return sessionType === 'modified_4x4' || sessionType === 'full_4x4';
}

/**
 * Get the phase-end session numbers that trigger progression evaluation.
 * Phase 1 ends after session 12, Phase 2 ends after session 24.
 */
export function isPhaseEndSession(sessionNumber) {
  return sessionNumber === 12 || sessionNumber === 24;
}

/**
 * Returns the next session number based on existing sessions array.
 */
export function getNextSessionNumber(sessions) {
  if (!sessions || sessions.length === 0) return 1;
  const existing = new Set(sessions.map((s) => s.session_number));
  let next = 1;
  while (existing.has(next)) {
    next++;
  }
  return next;
}

/**
 * Evaluate Phase 1 → Phase 2 progression criteria.
 * Requirements:
 *   - 12 Phase 1 sessions complete
 *   - Final 4 sessions all have avg_hr_bpm < 133 AND no peak_hr_bpm > 142
 */
export function evaluatePhase1Progression(sessions) {
  const phase1Sessions = sessions
    .filter((s) => s.phase === 1)
    .sort((a, b) => a.session_number - b.session_number);

  if (phase1Sessions.length < 12) return false;

  const lastFour = phase1Sessions.slice(-4);
  return lastFour.every(
    (s) => s.avg_hr_bpm < 133 && s.peak_hr_bpm <= 142
  );
}

/**
 * Evaluate Phase 2 → Phase 3 progression criteria.
 * Requirements:
 *   - 12 Phase 2 sessions complete
 *   - All interval sessions had all 4 intervals completed
 *   - All recovery HR values below 142 bpm
 */
export function evaluatePhase2Progression(sessions) {
  const phase2Sessions = sessions
    .filter((s) => s.phase === 2)
    .sort((a, b) => a.session_number - b.session_number);

  if (phase2Sessions.length < 12) return false;

  const intervalSessions = phase2Sessions.filter((s) =>
    sessionHasIntervals(s.session_type)
  );

  return intervalSessions.every((s) => {
    const allIntervalsCompleted = s.intervals_completed === 4;
    const recoveryOk =
      !s.recovery_avg_hr ||
      s.recovery_avg_hr.every((hr) => hr !== null && hr < 142);
    return allIntervalsCompleted && recoveryOk;
  });
}

/**
 * Get the current progression status given all sessions.
 * Returns an object with: currentPhase, phase1Met, phase2Met
 */
export function getProgressionStatus(sessions) {
  if (!sessions || sessions.length === 0) {
    return { currentPhase: 1, phase1Met: false, phase2Met: false };
  }

  const phase1Met = evaluatePhase1Progression(sessions);
  const phase2Met = evaluatePhase2Progression(sessions);

  const maxSession = Math.max(...sessions.map((s) => s.session_number));
  const currentPhase = getPhaseForSession(maxSession + 1); // phase of next session

  return { currentPhase, phase1Met, phase2Met };
}

/**
 * Get human-readable phase name.
 */
export function getPhaseName(phase) {
  const names = {
    1: 'Phase 1 — Base Building',
    2: 'Phase 2 — Aerobic Development',
    3: 'Phase 3 — High-Intensity Training',
  };
  return names[phase] || `Phase ${phase}`;
}

/**
 * Get the phase description / focus for a given session type.
 */
export function getSessionFocus(sessionType, phase) {
  if (sessionType === 'steady_state') {
    if (phase === 1) return 'Maintain Zone 1 (<142 bpm). Focus on aerobic base building at a comfortable pace.';
    if (phase === 2) return 'Recovery steady state. Stay in Zone 1–2. Let your body consolidate gains from intervals.';
    return 'Active recovery. Keep HR in Zone 1–2. Prepare for your next interval session.';
  }
  if (sessionType === 'modified_4x4') {
    return 'Modified intervals: 3-min efforts at Zone 3–4 (154–175 bpm). Full recovery between intervals.';
  }
  if (sessionType === 'full_4x4') {
    return 'Full 4×4 protocol: 4-min intervals at Zone 5 (176–190 bpm). 3-min active recovery between.';
  }
  return '';
}

/**
 * Get target HR zone label for a session type.
 */
export function getTargetZone(sessionType, phase) {
  if (sessionType === 'steady_state') {
    if (phase === 1) return 'Zone 1 (<142 bpm)';
    return 'Zone 1–2 (<153 bpm)';
  }
  if (sessionType === 'modified_4x4') return 'Zone 3–4 (154–175 bpm)';
  if (sessionType === 'full_4x4') return 'Zone 5 (176–190 bpm)';
  return '';
}

/**
 * Get the sessions count within a given phase from the sessions array.
 */
export function getPhaseSessionCount(sessions, phase) {
  return sessions.filter((s) => s.phase === phase).length;
}

/**
 * Get the total sessions allowed in a phase.
 */
export function getPhaseTotalSessions(phase) {
  if (phase === 1) return 12;
  if (phase === 2) return 12;
  return null; // Phase 3 is open-ended
}

/**
 * Format session type for display.
 */
export function formatSessionType(sessionType) {
  const map = {
    steady_state: 'Steady State',
    modified_4x4: 'Modified 4×4',
    full_4x4: 'Full 4×4',
  };
  return map[sessionType] || sessionType;
}

/**
 * Format equipment for display.
 */
export function formatEquipment(equipment) {
  const map = {
    treadmill: 'Treadmill',
    bike: 'Bike',
  };
  return map[equipment] || equipment;
}
