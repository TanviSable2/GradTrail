const router = require('express').Router();
const protect = require('../middleware/auth');
const { getMyInsights } = require('../controllers/insight.controller');

router.get('/', protect, getMyInsights);

module.exports = router;