require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/db');
const corsOptions = require('./config/corsOptions');

const app = express();

// ─── Security Middleware ────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));

// ─── Rate Limiter for Auth Routes ────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { success: false, message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Middleware ──────────────────────────────────────────────
app.use(express.json());

// ─── Debug route ───────────────────────────────────────────
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server works' });
});

// ─── Route Mounts ───────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/lab',          require('./routes/lab'));
app.use('/api/pharmacy',    require('./routes/pharmacy'));
app.use('/api/billing',     require('./routes/billing'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/queue',      require('./routes/queue'));
app.use('/api/referrals',  require('./routes/referrals'));
app.use('/api/nurse',       require('./routes/nurse'));

// ─── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = Number.parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🏥 HMS Meru server running on port ${PORT}`);
  await testConnection();
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Update PORT in backend/.env or stop the process using that port.`);
  } else {
    console.error('Failed to start server:', error.message);
  }
  process.exit(1);
});
