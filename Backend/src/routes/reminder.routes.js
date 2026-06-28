const router = require('express').Router();
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { triggerDeadlineReminders, triggerNewJobAlerts, triggerAllReminders } = require('../controllers/reminder.controller');

router.post('/send-deadline', protect, adminOnly, triggerDeadlineReminders);
router.post('/send-new-jobs', protect, adminOnly, triggerNewJobAlerts);
router.post('/send-all',      protect, adminOnly, triggerAllReminders);

module.exports = router;