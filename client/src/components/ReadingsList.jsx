import { slotLabel } from '../constants';

export default function ReadingsList({ readings, page, totalPages, total, onPageChange, onEdit, onDelete }) {
  return (
    <div className="card">
      <h2>Your readings</h2>
      {readings.length === 0 ? (
        <p className="empty">No readings yet. Add your first one above.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Date</th>
                  <th>Slot</th>
                  <th>mg/dl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 0' }}>{r.date}</td>
                    <td>{slotLabel(r.slot)}</td>
                    <td>{r.value}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="secondary" onClick={() => onEdit(r)}>Edit</button>{' '}
                      <button className="danger" onClick={() => onDelete(r)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages} ({total} readings)
              </span>
              <button className="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}