const express = require('express');
const { listPatients, patientReports } = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const requireDoctor = require('../middleware/requireDoctor');

const router = express.Router();

router.use(auth, requireDoctor); // logged in AND a doctor

router.get('/patients', listPatients);
router.get('/patients/:id/reports', patientReports);

module.exports = router;