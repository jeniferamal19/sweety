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
    <div className="report-stat">
      <div className="report-stat-label">{label}</div>
      <div className="report-stat-value">{value}</div>
    </div>
  );
}

function ReportCard({ title, report, children }) {
  return (
    <div className={`card report-card${title === 'Daily report' ? ' daily-report-card' : ''}`}>
      <div className="card-heading">
        <div>
          <span className="eyebrow">GLUCOSE SUMMARY</span>
          <h3>{title}</h3>
        </div>
        <span className="report-period">{formatRange(report.from, report.to)}</span>
      </div>
      {report.count === 0 ? (
        <p className="empty">No readings for this period yet.</p>
      ) : (
        <>
          {title === 'Daily report' && (
            <div className="average-indicator" aria-label={`Daily average ${report.average} milligrams per deciliter`}>
              <span>{report.average}</span>
              <small>mg/dl</small>
            </div>
          )}
          <div className="report-stats">
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

export default function ReportsPanel({ refreshKey, patientId }) {
  const [date, setDate] = useState(todayString());
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
       const request = patientId ? api.getPatientReports(patientId, date) : api.getReports(date);
    request
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
   }, [date, refreshKey, patientId]);

  return (
    <>
      <div className="card report-date-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">REPORT PERIOD</span>
            <h2>Choose a date</h2>
          </div>
        </div>
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
            <ul className="daily-reading-list">
              {reports.daily.readings.map((r) => (
                <li key={r.id}>
                  {r.slotLabel}: <strong>{r.value}</strong> mg/dl
                </li>
              ))}
            </ul>
          </ReportCard>
          <ReportCard title="Month-to-date report" report={reports.monthToDate} />
          <ReportCard title="Previous month report" report={reports.previousMonth} />
          {!patientId && <MonthChart date={date} refreshKey={refreshKey} />}
        </>
      )}
    </>
  );
}