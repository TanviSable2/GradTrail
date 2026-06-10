const { getApplicationsByUser, createApplication, updateApplication } = require('../db/queries/application.queries');
const { getJobById } = require('../db/queries/job.queries');

const listApplications = async (user_id) => {
  const result = await getApplicationsByUser(user_id);
  return { count: result.rowCount, applications: result.rows };
};

const applyToJob = async (user_id, fields) => {
  const job = await getJobById(fields.job_id);
  if (!job.rows[0]) {
    const err = new Error('Job not found.');
    err.status = 404;
    throw err;
  }
  const result = await createApplication(user_id, fields);
  return result.rows[0];
};

const editApplication = async (id, user_id, fields) => {
  const result = await updateApplication(id, user_id, fields);
  if (!result.rows[0]) {
    const err = new Error('Application not found or does not belong to you.');
    err.status = 404;
    throw err;
  }
  return result.rows[0];
};

module.exports = { listApplications, applyToJob, editApplication };