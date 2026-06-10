const { searchJobs } = require('../db/queries/search.queries');

const searchJobListings = async (q, page, limit) => {
  if (!q || q.trim().length < 2) {
    throw Object.assign(new Error('Search query must be at least 2 characters'), { status: 400 });
  }
  const { rows } = await searchJobs(q, page, limit);
  return {
    query: q,
    total: rows.length,
    page: Number(page),
    results: rows,
  };
};

module.exports = { searchJobListings };