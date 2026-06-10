const { searchJobListings } = require('../services/search.service');

const searchJobs = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const data = await searchJobListings(q, page, limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { searchJobs };