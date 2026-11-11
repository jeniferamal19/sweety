import { useEffect, useState } from 'react';
import { api } from '../api';
import ReadingForm from '../components/ReadingForm';
import ReadingsList from '../components/ReadingsList';
import ReportsPanel from '../components/ReportsPanel';

export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // bumping this refreshes the reports

  async function load() {
    try {
      const data = await api.listReadings();
      setReadings(data.readings);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
      <ReadingsList readings={readings} onEdit={setEditing} onDelete={handleDelete} />
      <ReportsPanel refreshKey={refreshKey} />
    </>
  );
}