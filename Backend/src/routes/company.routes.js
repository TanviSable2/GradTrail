const router = require('express').Router();
const c = require('../controllers/company.controller');
const protect = require('../middleware/auth');

// These specific routes MUST come before /:slug routes
router.get('/following', protect, c.getFollowing);
router.get('/feed',      protect, c.getCompanyFeed);

router.get('/',                   protect, c.getCompanies);
router.get('/:slug/jobs',         protect, c.getCompanyJobs);
router.post('/:id/follow',        protect, c.followCompany);
router.delete('/:id/follow',      protect, c.unfollowCompany);

module.exports = router;