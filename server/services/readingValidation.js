const SLOTS = {
  morning: 'Morning (fasting)',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner',
};

// Today's date as YYYY-MM-DD, using the server's local time
function todayString() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// True only for real dates like 2026-11-10 (rejects 2026-02-31)
function isRealDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
}

// Returns an error message, or null if everything is fine.
// "today" is a parameter so tests can control it.
function validateReading({ date, slot, value }, today = todayString()) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return 'Please enter a glucose value.';
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 40 || n > 600) {
    return 'Value must be between 40 and 600 mg/dl.';
  }
  if (!Object.hasOwn(SLOTS, slot)) return 'Please choose a time slot.';
  if (!isRealDate(date)) return 'Please choose a valid date.';
  if (date > today) return 'Date cannot be in the future.';
  return null;
}

module.exports = { SLOTS, todayString, isRealDate, validateReading };
