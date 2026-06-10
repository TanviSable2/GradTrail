const router = require('express').Router();
const { getMyProfile, upsertMyProfile } = require('../controllers/profile.controller');
const protect = require('../middleware/auth');

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, upsertMyProfile);

module.exports = router;