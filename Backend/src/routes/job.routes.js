const router = require('express').Router();
const { getJobs, createJob, getDomains, getJobsWithScore, getJobById } = require('../controllers/job.controller');
const protect   = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { searchJobs } = require('../controllers/search.controller');

router.get('/', getJobs);
router.get('/domains', getDomains);
router.get('/match', protect, getJobsWithScore);
router.post('/', protect, adminOnly, createJob);

router.get('/search', protect, searchJobs);  


router.get('/:id', getJobById);

module.exports = router;





