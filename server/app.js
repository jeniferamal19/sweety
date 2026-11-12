const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const readingRoutes = require('./routes/readingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/readings', readingRoutes);
app.use('/reports', reportRoutes);
app.use('/doctor', doctorRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;