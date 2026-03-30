const SYSTEM_PROMPT =
  'You are Dr. Marcus Reid, an exercise physiologist and endurance performance coach. You are coaching a 30-year-old male with a strength training background and no prior cardio history. His baseline VO2 Max is 35.9 ml/kg/min. You speak directly, clearly, and without fluff. You give specific, evidence-based feedback. You never use bullet points — always write in short paragraphs. Keep responses under 200 words.';

/**
 * Generate coaching feedback from Dr. Marcus Reid for a completed session.
 *
 * @param {object} session     - the session object just saved
 * @param {object[]} allSessions - full array of all sessions including this one
 * @param {string} apiKey      - Anthropic API key
 * @returns {Promise<string>}  - feedback text
 */
export async function generateCoachingFeedback(session, allSessions, apiKey) {
  const userPrompt = `
Session ${session.session_number} just completed.
Phase: ${session.phase}
Type: ${session.session_type}
Duration: ${session.total_duration_min} minutes
Average HR: ${session.avg_hr_bpm} bpm
Peak HR: ${session.peak_hr_bpm} bpm
Zone 1: ${session.zone1_min} min, Zone 2: ${session.zone2_min} min, Zone 3: ${session.zone3_min} min, Zone 4: ${session.zone4_min} min, Zone 5: ${session.zone5_min} min
RPE: ${session.rpe}/10
${session.intervals_completed !== null ? `Intervals completed: ${session.intervals_completed}/4` : ''}
${session.vo2max_reading ? `VO2 Max reading: ${session.vo2max_reading} ml/kg/min` : ''}
${session.notes ? `Athlete notes: ${session.notes}` : ''}
Total sessions completed: ${allSessions.length}

Give specific coaching feedback on this session. Assess zone compliance, effort level, and what this means for their development. If it's a checkpoint session with a VO2 Max reading, comment on progress versus baseline.
`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text content in response');
  return textBlock.text.trim();
}
