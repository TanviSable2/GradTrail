const appService = require('../services/application.service');
const { validateRequired } = require('../utils/validateFields');

const VALID_STATUSES = ['not_applied', 'applied', 'interview', 'rejected', 'offer'];

const getApplications = async (req, res, next) => {
  try {
    const data = await appService.listApplications(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const missing = validateRequired(req.body, ['job_id']);
    if (missing) return res.status(400).json({ error: missing });

    const status = req.body.status || 'not_applied';
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'status must be one of: ' + VALID_STATUSES.join(', ') });
    }

    const application = await appService.applyToJob(req.user.id, req.body);
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'status must be one of: ' + VALID_STATUSES.join(', ') });
    }

    const application = await appService.editApplication(req.params.id, req.user.id, req.body);
    res.json(application);
  } catch (err) {
    next(err);
  }
};

module.exports = { getApplications, createApplication, updateApplication };