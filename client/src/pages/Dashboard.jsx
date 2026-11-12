import { useEffect, useState } from 'react';
import { api } from '../api';
import ReadingForm from '../components/ReadingForm';
import ReadingsList from '../components/ReadingsList';
import ReportsPanel from '../components/ReportsPanel';

const PAGE_SIZE = 10;

export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // bumping this refreshes the reports

  async function load() {
    try {
      const data = await api.listReadings(page, PAGE_SIZE);
      // Deleted the last reading on a page? Step back to a page that exists.
      if (data.readings.length === 0 && page > 1) {
        setPage(Math.max(1, data.totalPages));
        return;
      }
      setReadings(data.readings);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  function handleChanged() {
    load();
    setRefreshKey((k) => k + 1);
  }

  function handleSaved() {
    setEditing(null);
    handleChanged();
  }

  async function handleDelete(reading) {
    if (!window.confirm('Delete this reading?')) return;
    try {
      await api.deleteReading(reading.id);
      if (editing && editing.id === reading.id) setEditing(null);
      handleChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboard-content" id="dashboard">
      <header className="page-intro">
        <div>
          <span className="eyebrow">YOUR HEALTH OVERVIEW</span>
          <h1>Your glucose, at a glance</h1>
          <p>Keep track of your readings and see how they change over time.</p>
        </div>
        <a className="text-link" href="#reading-history">View reading history <span aria-hidden="true">→</span></a>
      </header>
      {error && <div className="error">{error}</div>}
      <section className="tracking-grid" aria-label="Glucose readings">
        <ReadingForm
          key={editing ? editing.id : 'new'}
          reading={editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
        <ReadingsList
          id="reading-history"
          readings={readings}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      </section>
      <section id="reports" className="reports-section" aria-label="Glucose reports">
        <div className="section-intro">
          <div>
            <span className="eyebrow">TRENDS & INSIGHTS</span>
            <h2>Your reports</h2>
          </div>
          <p>Daily and monthly summaries from your recorded readings.</p>
        </div>
        <ReportsPanel refreshKey={refreshKey} />
      </section>
    </div>
  );
}