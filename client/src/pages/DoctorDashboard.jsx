import { useEffect, useState } from 'react';
import { api } from '../api';
import ReportsPanel from '../components/ReportsPanel';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listPatients()
      .then((data) => {
        setPatients(data.patients);
        if (data.patients.length > 0) setSelectedId(data.patients[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const selected = patients && patients.find((p) => p.id === selectedId);

  return (
    <>
      <div className="card">
        <h2>Your patients</h2>
        {error && <div className="error">{error}</div>}
        {patients && patients.length === 0 && (
          <p className="empty">No patients are assigned to you yet.</p>
        )}
        {patients && patients.length > 0 && (
          <>
            <label htmlFor="patient">Select a patient</label>
            <select
              id="patient"
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {selected && (
        <>
          <h2>Reports for {selected.name}</h2>
          {/* key makes the reports reset when you switch patient */}
          <ReportsPanel key={selected.id} patientId={selected.id} refreshKey={0} />
        </>
      )}
    </>
  );
}