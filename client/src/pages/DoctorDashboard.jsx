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
    <div className="dashboard-content" id="dashboard">
      <header className="page-intro">
        <div>
          <span className="eyebrow">CARE WORKSPACE</span>
          <h1>Patient overview</h1>
          <p>Review reports for patients assigned to your care.</p>
        </div>
      </header>
      <div className="card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">PATIENTS</span>
            <h2>Your patients</h2>
          </div>
        </div>
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
        <section id="reports" className="reports-section">
          <div className="section-intro">
            <div>
              <span className="eyebrow">PATIENT REPORTS</span>
              <h2>Reports for {selected.name}</h2>
            </div>
          </div>
          {/* key makes the reports reset when you switch patient */}
          <ReportsPanel key={selected.id} patientId={selected.id} refreshKey={0} />
        </section>
      )}
    </div>
  );
}