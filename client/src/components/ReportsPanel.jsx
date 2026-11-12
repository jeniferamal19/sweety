import { useEffect, useState } from 'react';
import { api } from '../api';
import { todayString } from '../constants';
import MonthChart from './MonthChart';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// "15 Oct 2026" for one day, "1 Oct – 15 Oct 2026" for a range
function formatRange(from, to) {
  if (from === to) return formatDate(to);
  const [, m, d] = from.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} – ${formatDate(to)}`;
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function ReportCard({ title, report, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p style={{ color: '#64748b', marginTop: -8 }}>{formatRange(report.from, report.to)}</p>
      {report.count === 0 ? (
        <p className="empty">No readings for this period yet.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
            <Stat label="Highest" value={report.highest} />
            <Stat label="Lowest" value={report.lowest} />
            <Stat label="Average" value={report.average.toFixed(1)} />
            <Stat label="Readings" value={report.count} />
          </div>
          {children}
        </>
      )}
    </div>
  );
}

export default function ReportsPanel({ refreshKey }) {
  const [date, setDate] = useState(todayString());
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .getReports(date)
      .then((data) => {
        if (!cancelled) {
          setReports(data);
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
    <>
      <div className="card">
        <h2>Reports</h2>
        <label htmlFor="report-date">Select a date</label>
        <input
          id="report-date"
          type="date"
          max={todayString()}
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
      </div>

      {reports && (
        <>
          <ReportCard title="Daily report" report={reports.daily}>
            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
              {reports.daily.readings.map((r) => (
                <li key={r.id}>
                  {r.slotLabel}: <strong>{r.value}</strong> mg/dl
                </li>
              ))}
            </ul>
          </ReportCard>
          <ReportCard title="Month-to-date report" report={reports.monthToDate} />
          <ReportCard title="Previous month report" report={reports.previousMonth} />
                    <MonthChart date={date} refreshKey={refreshKey} />
        </>
      )}
    </>
  );
}