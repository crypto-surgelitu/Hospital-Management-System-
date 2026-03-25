require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');

const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Route Mounts ────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/lab',          require('./routes/lab'));
app.use('/api/pharmacy',     require('./routes/pharmacy'));
app.use('/api/billing',      require('./routes/billing'));
app.use('/api/admin',        require('./routes/admin'));

// ─── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ─── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, async () => {
    console.log(`🏥 HMS Meru server running on port ${PORT}`);
    await testConnection();
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
