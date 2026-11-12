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
    <>
      {error && <div className="error">{error}</div>}
      <ReadingForm
        key={editing ? editing.id : 'new'}
        reading={editing}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
      <ReadingsList
        readings={readings}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onEdit={setEditing}
        onDelete={handleDelete}
      />
      <ReportsPanel refreshKey={refreshKey} />
    </>
  );
}