/**
 * localStorage persistence layer for VO2 Max sessions.
 */

const STORAGE_KEY = 'vo2max_sessions';

/**
 * Load all sessions from localStorage.
 * Returns an array (empty if nothing stored or parse error).
 */
export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save the full sessions array to localStorage.
 */
export function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
}

/**
 * Append a new session to the stored array and persist.
 * Returns the updated array.
 */
export function appendSession(session) {
  const sessions = loadSessions();
  sessions.push(session);
  saveSessions(sessions);
  return sessions;
}

/**
 * Delete a session by session_number and persist the updated array.
 * Returns the updated array.
 */
export function deleteSession(sessionNumber) {
  const sessions = loadSessions();
  const updated = sessions.filter((s) => s.session_number !== sessionNumber);
  saveSessions(updated);
  return updated;
}

/**
 * Get the most recent session or null.
 */
export function getLastSession(sessions) {
  if (!sessions || sessions.length === 0) return null;
  return [...sessions].sort((a, b) => b.session_number - a.session_number)[0];
}
