const companyService = require('../services/company.service');

// GET /api/companies — list all tracked companies
const getCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.listCompanies();
    res.json({ count: companies.length, companies });
  } catch (err) { next(err); }
};

// GET /api/companies/:slug/jobs — jobs from a specific company
const getCompanyJobs = async (req, res, next) => {
  try {
    const data = await companyService.getCompanyJobs(req.params.slug, req.query);
    res.json(data);
  } catch (err) { next(err); }
};

// POST /api/companies/:id/follow — follow a company
const followCompany = async (req, res, next) => {
  try {
    const result = await companyService.follow(req.user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
};

// DELETE /api/companies/:id/follow — unfollow
const unfollowCompany = async (req, res, next) => {
  try {
    const result = await companyService.unfollow(req.user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
};

// GET /api/companies/following — companies I follow
const getFollowing = async (req, res, next) => {
  try {
    const companies = await companyService.getFollowing(req.user.id);
    res.json({ count: companies.length, companies });
  } catch (err) { next(err); }
};

// GET /api/companies/feed — jobs from companies I follow
const getCompanyFeed = async (req, res, next) => {
  try {
    const data = await companyService.getFeed(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
};

module.exports = {
  getCompanies, getCompanyJobs,
  followCompany, unfollowCompany,
  getFollowing, getCompanyFeed,
};