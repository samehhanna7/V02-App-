const SYSTEM_PROMPT =
  'You are a data extraction assistant. You extract workout data from Apple Watch screenshots. You always respond with valid JSON only — no preamble, no explanation, no markdown code fences.';

const USER_PROMPT = `These are two Apple Watch screenshots from a workout session. The first is the workout summary screen. The second is the heart rate zones screen.
Extract the following data and return it as a JSON object with exactly these fields:

total_duration_min: integer (total workout time in minutes, round to nearest whole minute)
avg_hr_bpm: integer (average heart rate in bpm)
peak_hr_bpm: integer (peak/max heart rate in bpm)
zone1_min: float (minutes in Zone 1 — the lowest zone shown)
zone2_min: float (minutes in Zone 2)
zone3_min: float (minutes in Zone 3)
zone4_min: float (minutes in Zone 4)
zone5_min: float (minutes in Zone 5 — the highest zone shown)

If a field cannot be read from the screenshots, set it to null. Return only the JSON object, nothing else.`;

/**
 * Call the Anthropic API with two Apple Watch screenshot images (base64 encoded)
 * and return extracted session data as a plain object.
 *
 * @param {string} summaryImageBase64  - base64 string for the workout summary screenshot
 * @param {string} zonesImageBase64    - base64 string for the heart rate zones screenshot
 * @param {string} apiKey              - Anthropic API key
 * @returns {Promise<object>}          - extracted fields (nulls for unreadable fields)
 */
export async function extractSessionData(summaryImageBase64, zonesImageBase64, apiKey) {
  const response = await fetch('/.netlify/functions/claude-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: summaryImageBase64 },
            },
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: zonesImageBase64 },
            },
            { type: 'text', text: USER_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text content in response');

  // Strip accidental backticks / markdown fences / whitespace before parsing
  const cleaned = textBlock.text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  return parsed;
}
