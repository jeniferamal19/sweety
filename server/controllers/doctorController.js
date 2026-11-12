const pool = require('../db');
const { todayString } = require('../services/readingValidation');
const { buildReport, dateError } = require('./reportController');

// GET /doctor/patients : the patients assigned to this doctor
async function listPatients(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM doctor_patients dp
       JOIN users u ON u.id = dp.patient_id
       WHERE dp.doctor_id = $1
       ORDER BY u.name`,
      [req.userId]
    );
    res.json({ patients: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// GET /doctor/patients/:id/reports?date=YYYY-MM-DD
async function patientReports(req, res) {
  try {
    const patientId = Number(req.params.id);
    if (!Number.isInteger(patientId) || patientId < 1) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // The guard: is this patient on this doctor's list?
    const assigned = await pool.query(
      'SELECT 1 FROM doctor_patients WHERE doctor_id = $1 AND patient_id = $2',
      [req.userId, patientId]
    );
    if (assigned.rows.length === 0) return res.status(404).json({ error: 'Patient not found.' });

    const date = req.query.date || todayString();
    const error = dateError(date);
    if (error) return res.status(400).json({ error });

    res.json(await buildReport(patientId, date));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { listPatients, patientReports };