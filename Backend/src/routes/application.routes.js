const router = require('express').Router();
const { getApplications, createApplication, updateApplication } = require('../controllers/application.controller');
const protect = require('../middleware/auth');
const pool = require('../config/db');

router.get('/', protect, getApplications);
router.post('/', protect, createApplication);
router.patch('/:id', protect, updateApplication);

router.patch('/:id/remind', protect, async (req, res) => {
  try {
    const remind_me = req.body.remind_me;
    const remind_days_before = parseInt(req.body.remind_days_before) || 2;

    const { rows } = await pool.query(
      `UPDATE applications 
       SET remind_me = $1,
           remind_days_before = $2,
           deadline_reminder_sent = FALSE
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [remind_me, remind_days_before, parseInt(req.params.id), req.user.id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: remind_me ? 'Reminder set' : 'Reminder removed', application: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;