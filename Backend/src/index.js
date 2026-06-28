const router = require('express').Router();
const { authLimiter } = require('./middleware/rateLimiter');

router.use('/auth',           authLimiter, require('./routes/auth.routes'));
router.use('/profiles',       require('./routes/profile.routes'));
router.use('/jobs',           require('./routes/job.routes'));
router.use('/applications',   require('./routes/application.routes'));
router.use('/certifications', require('./routes/certification.routes'));
router.use('/reminders',      require('./routes/reminder.routes'));
router.use('/insights',       require('./routes/insights.routes'));

module.exports = router;