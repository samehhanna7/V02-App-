import { useState, useEffect, useRef } from 'react';
import {
  getNextSessionNumber,
  getPhaseForSession,
  getSessionType,
  formatSessionType,
  getPhaseName,
  isCheckpointSession,
  sessionHasIntervals,
} from '../utils/programLogic';
import { appendSession } from '../utils/storage';
import { validateSession } from '../utils/validation';
import { HR_ZONES } from '../data/zones';
import { extractSessionData } from '../utils/extractSessionData';
import { generateCoachingFeedback } from '../utils/generateCoachingFeedback';

const today = () => new Date().toISOString().split('T')[0];

const INITIAL_INTERVAL = { duration_sec: '', avg_hr: '' };
const INITIAL_RECOVERY = { avg_hr: '' };

function buildInitialForm(sessions) {
  const sessionNumber = getNextSessionNumber(sessions);
  const phase = getPhaseForSession(sessionNumber);
  const sessionType = getSessionType(sessionNumber);

  return {
    session_number: sessionNumber,
    session_date: today(),
    phase,
    session_type: sessionType,
    equipment: '',
    total_duration_min: '',
    avg_hr_bpm: '',
    peak_hr_bpm: '',
    zone1_min: '',
    zone2_min: '',
    zone3_min: '',
    zone4_min: '',
    zone5_min: '',
    intervals_completed: '',
    interval_data: [
      { ...INITIAL_INTERVAL },
      { ...INITIAL_INTERVAL },
      { ...INITIAL_INTERVAL },
      { ...INITIAL_INTERVAL },
    ],
    recovery_data: [
      { ...INITIAL_RECOVERY },
      { ...INITIAL_RECOVERY },
      { ...INITIAL_RECOVERY },
    ],
    rpe: 5,
    vo2max_reading: '',
    notes: '',
  };
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-400 mt-1">{message}</p>;
}

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function FormSection({ children, className = '' }) {
  return (
    <div className={`card p-4 ${className}`}>
      {children}
    </div>
  );
}

// ── helper: read a File as a base64 string (no data-URL prefix) ──────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<mime>;base64,<data>" — strip the prefix
      const b64 = reader.result.split(',')[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── upload zone sub-component ─────────────────────────────────────────────────
function UploadZone({ label, subtitle, file, onFile, onClear }) {
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white mb-0.5">{label}</p>
      <p className="text-xs text-slate-500 mb-2">{subtitle}</p>
      {file ? (
        <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden" style={{ minHeight: 100 }}>
          <img src={previewUrl} alt={label} className="w-full object-cover rounded-xl" style={{ maxHeight: 160 }} />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1.5 right-1.5 bg-bg-primary/80 rounded-full w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="Remove image"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-dashed border-2 border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1.5 py-5 text-slate-500 hover:border-slate-500 hover:text-slate-400 transition-colors"
          style={{ minHeight: 100 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs">Tap to upload</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); }}
      />
    </div>
  );
}

// ── saved screen ──────────────────────────────────────────────────────────────
function SessionSavedScreen({ session, feedbackState, feedbackText, feedbackError, onBack }) {
  return (
    <div className="flex flex-col gap-4 pb-4 animate-fade-in px-4 pt-6">
      {/* checkmark + heading */}
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Session #{session.session_number} Saved</h2>
      </div>

      {/* coach feedback card */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Coach Feedback</h3>
        {feedbackState === 'loading' && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Dr. Reid is reviewing your session...
          </div>
        )}
        {feedbackState === 'done' && (
          <div className="flex flex-col gap-3">
            {feedbackText.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed">{para}</p>
            ))}
          </div>
        )}
        {feedbackState === 'error' && (
          <p className="text-sm text-red-400">Feedback unavailable — check your API key and try again.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onBack(session)}
        className="btn-primary w-full py-4 text-base mt-1"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default function LogSession({ sessions, onSessionSaved }) {
  const [form, setForm] = useState(() => buildInitialForm(sessions));
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ── screenshot import state ────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState('');
  const [summaryFile, setSummaryFile] = useState(null);
  const [zonesFile, setZonesFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [extractError, setExtractError] = useState(false);

  // ── post-save coaching state ───────────────────────────────────────────────
  const [savedSession, setSavedSession] = useState(null);
  const [feedbackState, setFeedbackState] = useState('loading'); // 'loading' | 'done' | 'error'
  const [feedbackText, setFeedbackText] = useState('');

  // Rebuild form if sessions change (e.g., after navigating away and back)
  useEffect(() => {
    setForm(buildInitialForm(sessions));
    setErrors({});
    setWarnings([]);
  }, [sessions.length]);

  const showIntervals = sessionHasIntervals(form.session_type);
  const isCheckpoint = isCheckpointSession(form.session_number);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setIntervalField = (index, field, value) => {
    setForm((f) => {
      const updated = f.interval_data.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...f, interval_data: updated };
    });
  };

  const setRecoveryField = (index, value) => {
    setForm((f) => {
      const updated = f.recovery_data.map((item, i) =>
        i === index ? { avg_hr: value } : item
      );
      return { ...f, recovery_data: updated };
    });
  };

  const handleExtract = async () => {
    if (!summaryFile || !zonesFile || !apiKey) return;
    setExtracting(true);
    setExtractSuccess(false);
    setExtractError(false);
    try {
      const [summaryB64, zonesB64] = await Promise.all([
        fileToBase64(summaryFile),
        fileToBase64(zonesFile),
      ]);
      const extracted = await extractSessionData(summaryB64, zonesB64, apiKey);
      const fields = [
        'total_duration_min', 'avg_hr_bpm', 'peak_hr_bpm',
        'zone1_min', 'zone2_min', 'zone3_min', 'zone4_min', 'zone5_min',
      ];
      fields.forEach((field) => {
        if (extracted[field] !== null && extracted[field] !== undefined) {
          set(field, String(extracted[field]));
        }
      });
      setExtractSuccess(true);
    } catch {
      setExtractError(true);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Build the validation payload
    const payload = {
      ...form,
      avg_hr_bpm: Number(form.avg_hr_bpm),
      peak_hr_bpm: Number(form.peak_hr_bpm),
      total_duration_min: Number(form.total_duration_min),
      zone1_min: parseFloat(form.zone1_min) || 0,
      zone2_min: parseFloat(form.zone2_min) || 0,
      zone3_min: parseFloat(form.zone3_min) || 0,
      zone4_min: parseFloat(form.zone4_min) || 0,
      zone5_min: parseFloat(form.zone5_min) || 0,
      rpe: Number(form.rpe),
    };

    const { valid, errors: validErrors, warnings: validWarnings } = validateSession(payload);

    if (!valid) {
      setErrors(validErrors);
      setWarnings([]);
      setSubmitting(false);
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('[data-error="true"]');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setWarnings(validWarnings);

    // Build final session object
    const numCompleted = showIntervals ? Number(form.intervals_completed) || 0 : 0;
    const session = {
      session_number: form.session_number,
      session_date: form.session_date,
      phase: form.phase,
      session_type: form.session_type,
      equipment: form.equipment,
      total_duration_min: Number(form.total_duration_min),
      avg_hr_bpm: Number(form.avg_hr_bpm),
      peak_hr_bpm: Number(form.peak_hr_bpm),
      zone1_min: parseFloat(form.zone1_min) || 0,
      zone2_min: parseFloat(form.zone2_min) || 0,
      zone3_min: parseFloat(form.zone3_min) || 0,
      zone4_min: parseFloat(form.zone4_min) || 0,
      zone5_min: parseFloat(form.zone5_min) || 0,
      intervals_completed: showIntervals ? numCompleted : null,
      interval_durations_sec: showIntervals
        ? form.interval_data
            .slice(0, numCompleted)
            .map((d) => (d.duration_sec !== '' ? Number(d.duration_sec) : null))
        : null,
      interval_avg_hr: showIntervals
        ? form.interval_data
            .slice(0, numCompleted)
            .map((d) => (d.avg_hr !== '' ? Number(d.avg_hr) : null))
        : null,
      recovery_avg_hr: showIntervals && numCompleted > 1
        ? form.recovery_data
            .slice(0, numCompleted - 1)
            .map((d) => (d.avg_hr !== '' ? Number(d.avg_hr) : null))
        : null,
      rpe: Number(form.rpe),
      vo2max_reading:
        isCheckpoint && form.vo2max_reading !== ''
          ? parseFloat(form.vo2max_reading)
          : null,
      progression_criteria_met: null,
      notes: form.notes.trim(),
    };

    if (validWarnings.length > 0) {
      // Show warnings but save anyway
      setWarnings(validWarnings);
    }

    appendSession(session);
    setSubmitting(false);

    // Show the saved screen immediately, then fire coaching async
    setSavedSession(session);
    setFeedbackState('loading');

    const allSessionsNow = [...sessions, session];
    generateCoachingFeedback(session, allSessionsNow, apiKey)
      .then((text) => {
        setFeedbackText(text);
        setFeedbackState('done');
      })
      .catch(() => {
        setFeedbackState('error');
      });
  };

  const zoneFields = [
    { field: 'zone1_min', label: 'Zone 1', range: '<142 bpm', color: 'text-cyan-400' },
    { field: 'zone2_min', label: 'Zone 2', range: '143–153 bpm', color: 'text-emerald-400' },
    { field: 'zone3_min', label: 'Zone 3', range: '154–164 bpm', color: 'text-amber-400' },
    { field: 'zone4_min', label: 'Zone 4', range: '165–175 bpm', color: 'text-orange-400' },
    { field: 'zone5_min', label: 'Zone 5', range: '176–190 bpm', color: 'text-red-400' },
  ];

  const rpeDescriptions = ['', 'Very Easy', 'Easy', 'Easy-Mod', 'Moderate', 'Moderate', 'Somewhat Hard', 'Hard', 'Very Hard', 'Max-ish', 'Max'];

  // Show saved screen instead of form once a session has been saved
  if (savedSession) {
    return (
      <SessionSavedScreen
        session={savedSession}
        feedbackState={feedbackState}
        feedbackText={feedbackText}
        feedbackError={feedbackState === 'error'}
        onBack={onSessionSaved}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-bg-secondary to-transparent px-5 pt-5 pb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          {getPhaseName(form.phase)}
        </p>
        <h1 className="text-2xl font-bold text-white">Log Session</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-4">
        {/* ── Import from Apple Watch ─────────────────────────────────────── */}
        <FormSection>
          <SectionHeader title="Import from Apple Watch" />

          {/* API key input */}
          <div className="mb-4">
            <label className="label-text">Anthropic API Key</label>
            <input
              type="password"
              className="input-field"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">
              Your key is used locally and never stored or sent anywhere except the Anthropic API
            </p>
          </div>

          {/* Upload zones */}
          <div className="flex gap-3 mb-4">
            <UploadZone
              label="Workout Summary"
              subtitle="Time, calories, heart rate screen"
              file={summaryFile}
              onFile={setSummaryFile}
              onClear={() => setSummaryFile(null)}
            />
            <UploadZone
              label="Heart Rate Zones"
              subtitle="Zone breakdown screen"
              file={zonesFile}
              onFile={setZonesFile}
              onClear={() => setZonesFile(null)}
            />
          </div>

          {/* Status banners */}
          {extractSuccess && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
              <p className="text-sm text-emerald-400">Data extracted — review and confirm below</p>
            </div>
          )}
          {extractError && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25">
              <p className="text-sm text-red-400">Could not read screenshots. Please fill in the form manually.</p>
            </div>
          )}

          {/* Extract button */}
          <button
            type="button"
            disabled={!summaryFile || !zonesFile || !apiKey || extracting}
            onClick={handleExtract}
            className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {extracting ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Extracting...
              </>
            ) : (
              'Extract Data'
            )}
          </button>
        </FormSection>
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
            {warnings.map((w, i) => (
              <p key={i} className="text-sm text-amber-300 flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {w}
              </p>
            ))}
          </div>
        )}

        {/* Session Info (read-only) */}
        <FormSection>
          <SectionHeader title="Session Info" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-text">Session #</label>
              <div className="input-field bg-bg-elevated/60 text-slate-400 text-center font-bold">
                {form.session_number}
              </div>
            </div>
            <div>
              <label className="label-text">Phase</label>
              <div className="input-field bg-bg-elevated/60 text-slate-400 text-center">
                {form.phase}
              </div>
            </div>
            <div>
              <label className="label-text">Type</label>
              <div className="input-field bg-bg-elevated/60 text-slate-400 text-center text-xs">
                {form.session_type === 'steady_state' ? 'Steady' : form.session_type === 'modified_4x4' ? 'Mod 4×4' : 'Full 4×4'}
              </div>
            </div>
          </div>

          {isCheckpoint && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 flex-shrink-0">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p className="text-xs text-amber-400">Checkpoint session — VO₂ Max reading required</p>
            </div>
          )}
        </FormSection>

        {/* Date & Equipment */}
        <FormSection>
          <SectionHeader title="Date & Equipment" />
          <div className="grid grid-cols-2 gap-3">
            <div data-error={!!errors.session_date}>
              <label className="label-text">Date</label>
              <input
                type="date"
                className="input-field"
                value={form.session_date}
                onChange={(e) => set('session_date', e.target.value)}
              />
              <FieldError message={errors.session_date} />
            </div>
            <div data-error={!!errors.equipment}>
              <label className="label-text">Equipment</label>
              <select
                className="input-field"
                value={form.equipment}
                onChange={(e) => set('equipment', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="treadmill">Treadmill</option>
                <option value="bike">Bike</option>
              </select>
              <FieldError message={errors.equipment} />
            </div>
          </div>
        </FormSection>

        {/* Heart Rate & Duration */}
        <FormSection>
          <SectionHeader title="Heart Rate & Duration" />
          <div className="grid grid-cols-3 gap-3">
            <div data-error={!!errors.total_duration_min}>
              <label className="label-text">Duration (min)</label>
              <input
                type="number"
                className="input-field"
                placeholder="30"
                min="1"
                value={form.total_duration_min}
                onChange={(e) => set('total_duration_min', e.target.value)}
              />
              <FieldError message={errors.total_duration_min} />
            </div>
            <div data-error={!!errors.avg_hr_bpm}>
              <label className="label-text">Avg HR (bpm)</label>
              <input
                type="number"
                className="input-field"
                placeholder="128"
                min="50"
                max="220"
                value={form.avg_hr_bpm}
                onChange={(e) => set('avg_hr_bpm', e.target.value)}
              />
              <FieldError message={errors.avg_hr_bpm} />
            </div>
            <div data-error={!!errors.peak_hr_bpm}>
              <label className="label-text">Peak HR (bpm)</label>
              <input
                type="number"
                className="input-field"
                placeholder="145"
                min="50"
                max="220"
                value={form.peak_hr_bpm}
                onChange={(e) => set('peak_hr_bpm', e.target.value)}
              />
              <FieldError message={errors.peak_hr_bpm} />
            </div>
          </div>
        </FormSection>

        {/* Zone Minutes */}
        <FormSection>
          <SectionHeader
            title="Time in Zone"
            sub="Minutes spent in each heart rate zone"
          />
          <div className="flex flex-col gap-3">
            {zoneFields.map(({ field, label, range, color }) => (
              <div key={field} data-error={!!errors[field]}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-sm font-medium ${color}`}>{label}</label>
                  <span className="text-xs text-slate-500">{range}</span>
                </div>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0"
                  min="0"
                  step="0.5"
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                />
                <FieldError message={errors[field]} />
              </div>
            ))}
          </div>
        </FormSection>

        {/* Interval Fields (only for interval sessions) */}
        {showIntervals && (
          <FormSection>
            <SectionHeader
              title="Interval Data"
              sub={form.session_type === 'modified_4x4' ? 'Modified 4×4 — 3-min intervals at Zone 3–4' : 'Full 4×4 — 4-min intervals at Zone 5'}
            />

            <div data-error={!!errors.intervals_completed} className="mb-4">
              <label className="label-text">Intervals Completed (0–4)</label>
              <input
                type="number"
                className="input-field"
                placeholder="4"
                min="0"
                max="4"
                value={form.intervals_completed}
                onChange={(e) => set('intervals_completed', e.target.value)}
              />
              <FieldError message={errors.intervals_completed} />
            </div>

            {/* Individual interval inputs */}
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-400 mb-2.5">Interval {i + 1}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-text text-xs">Duration (sec)</label>
                      <input
                        type="number"
                        className="input-field text-sm py-2"
                        placeholder="240"
                        min="0"
                        value={form.interval_data[i].duration_sec}
                        onChange={(e) => setIntervalField(i, 'duration_sec', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label-text text-xs">Avg HR (bpm)</label>
                      <input
                        type="number"
                        className="input-field text-sm py-2"
                        placeholder="178"
                        min="50"
                        max="220"
                        value={form.interval_data[i].avg_hr}
                        onChange={(e) => setIntervalField(i, 'avg_hr', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recovery HR */}
            <div className="mt-4">
              <p className="text-sm font-semibold text-white mb-1">Recovery Segments</p>
              <p className="text-xs text-slate-500 mb-3">Average HR during recovery between intervals</p>
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <label className="label-text text-xs">Recovery {i + 1} Avg HR (bpm)</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="135"
                      min="50"
                      max="220"
                      value={form.recovery_data[i].avg_hr}
                      onChange={(e) => setRecoveryField(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </FormSection>
        )}

        {/* RPE */}
        <FormSection>
          <SectionHeader title="Perceived Effort" />
          <div data-error={!!errors.rpe}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-slate-400">RPE Scale (1–10)</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{form.rpe}</span>
                <span className="text-sm text-slate-500">— {rpeDescriptions[form.rpe]}</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-accent"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(form.rpe - 1) / 9 * 100}%, rgba(255,255,255,0.1) ${(form.rpe - 1) / 9 * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
              value={form.rpe}
              onChange={(e) => set('rpe', Number(e.target.value))}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-600">1</span>
              <span className="text-xs text-slate-600">5</span>
              <span className="text-xs text-slate-600">10</span>
            </div>
            <FieldError message={errors.rpe} />
          </div>
        </FormSection>

        {/* VO2 Max (checkpoint only) */}
        {isCheckpoint && (
          <FormSection className="border-amber-500/20 bg-amber-500/5">
            <SectionHeader
              title="VO₂ Max Reading"
              sub="Enter your VO₂ Max from a fitness test or wearable device"
            />
            <div data-error={!!errors.vo2max_reading}>
              <label className="label-text">VO₂ Max (ml/kg/min)</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 38.5"
                step="0.1"
                min="10"
                max="90"
                value={form.vo2max_reading}
                onChange={(e) => set('vo2max_reading', e.target.value)}
              />
              <FieldError message={errors.vo2max_reading} />
              <p className="text-xs text-slate-500 mt-1.5">
                Baseline: 35.9 ml/kg/min
              </p>
            </div>
          </FormSection>
        )}

        {/* Notes */}
        <FormSection>
          <SectionHeader title="Notes" sub="Optional — how did it feel? Any observations?" />
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="e.g. Felt strong in the first two intervals, HR came down quickly in recovery..."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </FormSection>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-4 text-base mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : `Save Session #${form.session_number}`}
        </button>
      </form>
    </div>
  );
}
