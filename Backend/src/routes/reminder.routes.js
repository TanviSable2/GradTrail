const router = require('express').Router();
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { runAllReminders, sendDeadlineReminders, sendNewJobAlerts } = require('../services/reminder.service');

router.post('/send-deadline', protect, adminOnly, async (req, res, next) => {
  try {
    res.json({ message: 'Deadline reminders running in background' });
    sendDeadlineReminders().catch(console.error);  // specific function
  } catch (err) {
    next(err);
  }
});

router.post('/send-new-jobs', protect, adminOnly, async (req, res, next) => {
  try {
    res.json({ message: 'New job alerts running in background' });
    sendNewJobAlerts().catch(console.error);
  } catch (err) {
    next(err);
  }
});

router.post('/send-all', protect, adminOnly, async (req, res, next) => {
  try {
    res.json({ message: 'All reminders running in background' });
    runAllReminders().catch(console.error);
  } catch (err) {
    next(err);
  }
});

module.exports = router;