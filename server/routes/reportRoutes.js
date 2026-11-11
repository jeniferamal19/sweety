const express = require('express');
const { getReports } = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getReports);

module.exports = router;