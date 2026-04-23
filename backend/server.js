const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDB } = require('./config/db');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '10mb' }));

initDB(); // Initialize Postgres tables

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
