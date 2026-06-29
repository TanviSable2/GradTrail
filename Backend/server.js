require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const cron    = require('node-cron');

const apiRoutes    = require('./src/index');
const errorHandler = require('./src/middleware/errorHandler');
const protect      = require('./src/middleware/auth');
const adminOnly    = require('./src/middleware/adminOnly');
const { generalLimiter, syncLimiter } = require('./src/middleware/rateLimiter');

const { runAllSyncs, runCoursesSeed, getSyncStatus } = require('./src/services/sync/syncRunner');
const { runAllReminders } = require('./src/services/reminder.service'); // ← removed runCourseReminders, it doesn't exist

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use('/api', generalLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'nextstep', timestamp: new Date() });
});

app.get('/api/admin/sync-status', protect, adminOnly, async (req, res) => {
  try {
    const status = await getSyncStatus();
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/sync', protect, adminOnly, syncLimiter, (req, res) => {
  const force = req.query.force === 'true';
  res.json({ message: force ? 'Forced sync started' : 'Smart sync started' });
  runAllSyncs(force).catch(console.error);
});

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found: ' + req.method + ' ' + req.originalUrl });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log('NextStep server running on http://localhost:' + PORT);

  await runCoursesSeed().catch(console.error);
  await runAllSyncs(false).catch(console.error);

  // Sync cron — every Sunday at 2am
  cron.schedule('0 2 * * 0', () => {
    console.log('[cron] Weekly sync starting...');
    runAllSyncs(false).catch(console.error);
  });

  // Reminder cron — every day at 8am
  cron.schedule('0 8 * * *', () => {
    console.log('[cron] Daily reminders running...');
    runAllReminders().catch(console.error);
  });

  console.log('[cron] All schedules active — daily reminders @ 8AM, weekly sync @ Sun 2AM');
});