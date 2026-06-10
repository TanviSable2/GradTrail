const db = require('../../config/db');

const searchJobs = (q, page = 1, limit = 20) => {
  const offset = (Number(page) - 1) * Number(limit);
  return db.query(
    `SELECT *,
       CASE
         WHEN deadline IS NOT NULL AND deadline > NOW()
         THEN CEIL(EXTRACT(EPOCH FROM (deadline - NOW())) / 86400)
         ELSE NULL
       END AS days_until_deadline,
       ts_rank(
         to_tsvector('english',
           COALESCE(title, '') || ' ' ||
           COALESCE(company, '') || ' ' ||
           COALESCE(description, '') || ' ' ||
           COALESCE(domain, '') || ' ' ||
           COALESCE(location, '') || ' ' ||
           COALESCE(array_to_string(skills_hint, ' '), '')
         ),
         plainto_tsquery('english', $1)
       ) AS relevance_score
     FROM jobs
     WHERE
       to_tsvector('english',
         COALESCE(title, '') || ' ' ||
         COALESCE(company, '') || ' ' ||
         COALESCE(description, '') || ' ' ||
         COALESCE(domain, '') || ' ' ||
         COALESCE(location, '') || ' ' ||
         COALESCE(array_to_string(skills_hint, ' '), '')
       ) @@ plainto_tsquery('english', $1)
       AND (deadline IS NULL OR deadline > NOW())
       AND source != 'manual'
     ORDER BY relevance_score DESC, posted_at DESC
     LIMIT $2 OFFSET $3`,
    [q.trim(), Number(limit), offset]
  );
};

module.exports = { searchJobs };