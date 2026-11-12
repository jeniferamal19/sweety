const express = require('express');
const { getReports, getMonthReadings } = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getReports);
router.get('/month', auth, getMonthReadings);

module.exports = router;