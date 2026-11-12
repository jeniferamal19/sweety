import { useState } from 'react';
import { api } from '../api';
import { SLOTS, todayString } from '../constants';

// Used for both adding (no "reading" prop) and editing (reading passed in)
export default function ReadingForm({ reading, onSaved, onCancel }) {
  const editing = Boolean(reading);
  const [date, setDate] = useState(reading ? reading.date : todayString());
  const [slot, setSlot] = useState(reading ? reading.slot : 'morning');
  const [value, setValue] = useState(reading ? String(reading.value) : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = { date, slot, value };
      if (editing) await api.updateReading(reading.id, body);
      else await api.addReading(body);
      if (!editing) setValue('');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card reading-form" onSubmit={handleSubmit} noValidate>
      <div className="card-heading">
        <div>
          <span className="eyebrow">GLUCOSE TRACKING</span>
          <h2>{editing ? 'Edit reading' : 'Add a reading'}</h2>
        </div>
        <span className="card-heading-icon" aria-hidden="true">+</span>
      </div>

      <label htmlFor="date">Date</label>
      <input id="date" type="date" max={todayString()} value={date} onChange={(e) => setDate(e.target.value)} />

      <label htmlFor="slot">Time slot</label>
      <select id="slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
        {SLOTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <label htmlFor="value">Glucose value (mg/dl)</label>
      <input id="value" type="text" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} />

      {error && <div className="error">{error}</div>}

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : editing ? 'Save changes' : 'Add reading'}
        </button>
        {editing && (
          <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}