import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import { SLOTS } from '../constants';

const COLORS = {
  morning: '#2563eb',
  after_breakfast: '#16a34a',
  after_lunch: '#f59e0b',
  after_dinner: '#dc2626',
};

// One row per day, e.g. { day: 5, morning: 110, after_lunch: 180 }
function toChartData(readings) {
  const byDay = {};
  for (const r of readings) {
    const day = Number(r.date.slice(8, 10));
    if (!byDay[day]) byDay[day] = { day };
    byDay[day][r.slot] = r.value;
  }
  return Object.values(byDay).sort((a, b) => a.day - b.day);
}

export default function MonthChart({ date, refreshKey }) {
  const [readings, setReadings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .getMonthReadings(date)
      .then((data) => {
        if (!cancelled) {
          setReadings(data.readings);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [date, refreshKey]);

  return (
    <div className="card chart-card" id="glucose-tracking">
      <div className="card-heading">
        <div>
          <span className="eyebrow">GLUCOSE TRACKING</span>
          <h3>Readings over the month</h3>
        </div>
        <span className="chart-unit">Values in mg/dl</span>
      </div>
      {error && <div className="error">{error}</div>}
      {readings && readings.length === 0 && (
        <p className="empty">No readings for this month yet.</p>
      )}
      {readings && readings.length > 0 && (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={toChartData(readings)} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Day of month', position: 'insideBottom', offset: -4 }} />
              <YAxis domain={[40, 'auto']} />
              <Tooltip />
              <Legend verticalAlign="top" />
              {SLOTS.map((s) => (
                <Line
                  key={s.value}
                  type="monotone"
                  dataKey={s.value}
                  name={s.label}
                  stroke={COLORS[s.value]}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}