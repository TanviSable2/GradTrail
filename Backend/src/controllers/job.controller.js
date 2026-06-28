const jobService = require('../services/job.service');
const { validateRequired } = require('../utils/validateFields');
const { getDistinctDomains, getJobsWithMatchScore } = require('../db/queries/job.queries');

const VALID_JOB_TYPES = ['internship', 'job', 'course'];

const getJobs = async (req, res, next) => {
  try {
    const filters = {
      job_type:           req.query.job_type,
      role:               req.query.role,
      location:           req.query.location,
      branch:             req.query.branch,
      deadline_before:    req.query.deadline_before,
      employment_type:    req.query.employment_type,
      is_remote:          req.query.is_remote,
      salary_min:         req.query.salary_min,
      salary_period:      req.query.salary_period,
      posted_within_days: req.query.posted_within_days,
      domain:             req.query.domain,
      company:            req.query.company,   // ← added
      page:               req.query.page  || 1,
      limit:              req.query.limit || 20,
    };

    const data = await jobService.listJobs(filters);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createJob = async (req, res, next) => {
  try {
    const missing = validateRequired(req.body, ['title', 'company', 'role', 'job_type', 'apply_url']);
    if (missing) return res.status(400).json({ error: missing });

    if (!VALID_JOB_TYPES.includes(req.body.job_type)) {
      return res.status(400).json({ error: 'job_type must be one of: ' + VALID_JOB_TYPES.join(', ') });
    }

    const job = await jobService.addJob(req.body);
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

const getDomains = async (req, res, next) => {
  try {
    const data = await jobService.listDomains();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getJobsWithScore = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { rows } = await getJobsWithMatchScore(userId, req.query);
    // Filter expired from match results too
    const active = rows.filter(r => !r.is_expired);
    res.json(active);
  } catch (err) {
    next(err);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

module.exports = { getJobs, createJob, getDomains, getJobsWithScore, getJobById };