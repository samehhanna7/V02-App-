/**
 * Validation logic for session form fields.
 */

/**
 * Validate a session form object.
 * Returns { valid: boolean, errors: { fieldName: string }, warnings: string[] }
 */
export function validateSession(form) {
  const errors = {};
  const warnings = [];

  // avg_hr_bpm
  if (!form.avg_hr_bpm || isNaN(form.avg_hr_bpm) || Number(form.avg_hr_bpm) <= 0) {
    errors.avg_hr_bpm = 'Required — must be a positive number';
  }

  // peak_hr_bpm
  if (!form.peak_hr_bpm || isNaN(form.peak_hr_bpm) || Number(form.peak_hr_bpm) <= 0) {
    errors.peak_hr_bpm = 'Required — must be a positive number';
  } else if (
    form.avg_hr_bpm &&
    Number(form.peak_hr_bpm) < Number(form.avg_hr_bpm)
  ) {
    errors.peak_hr_bpm = 'Peak HR must be ≥ average HR';
  }

  // total_duration_min
  if (
    !form.total_duration_min ||
    isNaN(form.total_duration_min) ||
    Number(form.total_duration_min) <= 0
  ) {
    errors.total_duration_min = 'Required — must be a positive number';
  }

  // zone minutes — must be non-negative
  ['zone1_min', 'zone2_min', 'zone3_min', 'zone4_min', 'zone5_min'].forEach((field) => {
    const val = parseFloat(form[field]);
    if (isNaN(val) || val < 0) {
      errors[field] = 'Must be 0 or greater';
    }
  });

  // Zone minutes sum warning
  if (!Object.keys(errors).some((k) => k.startsWith('zone') || k === 'total_duration_min')) {
    const zoneSum =
      parseFloat(form.zone1_min || 0) +
      parseFloat(form.zone2_min || 0) +
      parseFloat(form.zone3_min || 0) +
      parseFloat(form.zone4_min || 0) +
      parseFloat(form.zone5_min || 0);
    const duration = Number(form.total_duration_min || 0);
    if (Math.abs(zoneSum - duration) > 3) {
      warnings.push(
        `Zone minutes total (${zoneSum.toFixed(1)} min) differs from session duration (${duration} min) by more than 3 minutes.`
      );
    }
  }

  // rpe
  const rpe = Number(form.rpe);
  if (!form.rpe || isNaN(rpe) || rpe < 1 || rpe > 10) {
    errors.rpe = 'RPE must be between 1 and 10';
  }

  // session_date
  if (!form.session_date) {
    errors.session_date = 'Required';
  }

  // equipment
  if (!form.equipment) {
    errors.equipment = 'Required';
  }

  // Interval fields (only for interval sessions)
  if (form.session_type === 'modified_4x4' || form.session_type === 'full_4x4') {
    const completed = Number(form.intervals_completed);
    if (isNaN(completed) || completed < 0 || completed > 4) {
      errors.intervals_completed = 'Must be 0–4';
    }
  }

  // vo2max_reading (optional but must be valid if entered)
  if (form.vo2max_reading !== '' && form.vo2max_reading !== null && form.vo2max_reading !== undefined) {
    const v = parseFloat(form.vo2max_reading);
    if (isNaN(v) || v < 10 || v > 90) {
      errors.vo2max_reading = 'Must be between 10 and 90 ml/kg/min';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}
