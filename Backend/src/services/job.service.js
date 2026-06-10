const { getJobs, getJobById: queryGetJobById, createJob, getDistinctDomains } = require('../db/queries/job.queries');

const listJobs = async (filters) => {
  const result = await getJobs(filters);
  return { count: result.rowCount, jobs: result.rows };
};

const getJobById = async (id) => {
  const result = await queryGetJobById(id);
  return result.rows[0] || null;
};

const addJob = async (fields) => {
  const result = await createJob(fields);
  return result.rows[0];
};

const listDomains = async () => {
  const result = await getDistinctDomains();
  return result.rows;
};

module.exports = { listJobs, getJobById, addJob, listDomains };