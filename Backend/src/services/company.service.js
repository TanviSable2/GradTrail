const q = require('../db/queries/company.queries');

const listCompanies = async () => {
  const result = await q.getAllCompanies();
  return result.rows;
};

const getCompanyJobs = async (slug, filters) => {
  const company = await q.getCompanyBySlug(slug);
  if (!company.rows[0]) {
    const err = new Error('Company not found.');
    err.status = 404;
    throw err;
  }
  const jobs = await q.getJobsByCompany(slug, filters);
  return {
    company: company.rows[0],
    count: jobs.rowCount,
    jobs: jobs.rows,
  };
};

const follow = async (user_id, company_id) => {
  const result = await q.followCompany(user_id, company_id);
  return result.rows[0] || { message: 'Already following' };
};

const unfollow = async (user_id, company_id) => {
  const result = await q.unfollowCompany(user_id, company_id);
  if (!result.rows[0]) {
    const err = new Error('Not following this company.');
    err.status = 404;
    throw err;
  }
  return { unfollowed: true };
};

const getFollowing = async (user_id) => {
  const result = await q.getFollowedCompanies(user_id);
  return result.rows;
};

const getFeed = async (user_id) => {
  const result = await q.getJobsFromFollowedCompanies(user_id);
  return { count: result.rowCount, jobs: result.rows };
};

module.exports = { listCompanies, getCompanyJobs, follow, unfollow, getFollowing, getFeed };