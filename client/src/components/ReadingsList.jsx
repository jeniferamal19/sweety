import { slotLabel } from '../constants';

export default function ReadingsList({ readings, page, totalPages, total, onPageChange, onEdit, onDelete }) {
  return (
    <div className="card readings-card">
      <div className="card-heading">
        <div>
          <span className="eyebrow">RECENT ACTIVITY</span>
          <h2>Your readings</h2>
        </div>
        <span className="reading-count">{total} total</span>
      </div>
      {readings.length === 0 ? (
        <p className="empty">No readings yet. Add your first one above.</p>
      ) : (
        <>
          <div className="table-scroll">
            <table className="readings-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Slot</th>
                  <th>mg/dl</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{slotLabel(r.slot)}</td>
                    <td><span className="reading-value">{r.value}</span></td>
                    <td className="table-actions">
                      <button className="secondary" onClick={() => onEdit(r)}>Edit</button>{' '}
                      <button className="danger" onClick={() => onDelete(r)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
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