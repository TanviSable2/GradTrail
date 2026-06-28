const { runAllReminders, sendDeadlineReminders, sendNewJobAlerts } = require('../services/reminder.service');

const triggerDeadlineReminders = async (req, res, next) => {
  try {
    console.log('[reminders] /send-deadline triggered by user:', req.user.id);
    await sendDeadlineReminders();
    res.json({ message: 'Deadline reminders processed — check server logs for details' });
  } catch (err) {
    console.error('[reminders] send-deadline failed:', err.message);
    next(err);
  }
};

const triggerNewJobAlerts = async (req, res, next) => {
  try {
    await sendNewJobAlerts();
    res.json({ message: 'New job alerts processed' });
  } catch (err) {
    next(err);
  }
};

const triggerAllReminders = async (req, res, next) => {
  try {
    await runAllReminders();
    res.json({ message: 'All reminders processed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { triggerDeadlineReminders, triggerNewJobAlerts, triggerAllReminders };