const db = require('../../config/db');

const getApplicationStats = (userId) =>
  db.query(
    `SELECT status, COUNT(*) as count
     FROM applications
     WHERE user_id = $1
     GROUP BY status
     ORDER BY count DESC`,
    [userId]
  );

const getTopDomains = (userId) =>
  db.query(
    `SELECT j.domain, COUNT(*) as job_count
     FROM jobs j
     JOIN profiles p ON p.user_id = $1
     WHERE
       (p.branch IS NULL OR p.branch = ANY(j.branch_hint) OR j.branch_hint = '{}')
       AND (j.deadline IS NULL OR j.deadline > NOW())
     GROUP BY j.domain
     ORDER BY job_count DESC
     LIMIT 8`,
    [userId]
  );

const getTopSkillsInMarket = (userId) =>
  db.query(
    `SELECT skill, COUNT(*) as demand_count
     FROM jobs j
     JOIN profiles p ON p.user_id = $1
     JOIN LATERAL unnest(j.skills_hint) AS skill ON true
     WHERE
       (p.branch IS NULL OR p.branch = ANY(j.branch_hint) OR j.branch_hint = '{}')
       AND (j.deadline IS NULL OR j.deadline > NOW())
     GROUP BY skill
     ORDER BY demand_count DESC
     LIMIT 10`,
    [userId]
  );

const getSkillGap = (userId) =>
  db.query(
    `SELECT
       skill,
       COUNT(*) as demand_count,
       CASE
         WHEN LOWER(skill) = ANY(
           SELECT LOWER(s) FROM unnest(
             COALESCE((SELECT skills FROM profiles WHERE user_id = $1), '{}')
           ) AS s
         ) THEN true
         ELSE false
       END AS student_has_skill
     FROM jobs j
     JOIN profiles p ON p.user_id = $1
     JOIN LATERAL unnest(j.skills_hint) AS skill ON true
     WHERE
       (p.branch IS NULL OR p.branch = ANY(j.branch_hint) OR j.branch_hint = '{}')
       AND (j.deadline IS NULL OR j.deadline > NOW())
     GROUP BY skill
     ORDER BY demand_count DESC
     LIMIT 15`,
    [userId]
  );

const getTopCompanies = (userId) =>
  db.query(
    `SELECT j.company, COUNT(*) as open_roles,
            MAX(j.posted_at) as latest_posting
     FROM jobs j
     JOIN profiles p ON p.user_id = $1
     WHERE
       (p.branch IS NULL OR p.branch = ANY(j.branch_hint) OR j.branch_hint = '{}')
       AND (j.deadline IS NULL OR j.deadline > NOW())
     GROUP BY j.company
     ORDER BY open_roles DESC
     LIMIT 10`,
    [userId]
  );

const getExpiringSoon = (userId) =>
  db.query(
    `SELECT j.id, j.title, j.company, j.domain, j.deadline,
            CEIL(EXTRACT(EPOCH FROM (j.deadline - NOW())) / 86400) AS days_left,
            j.apply_url
     FROM jobs j
     WHERE
       j.deadline IS NOT NULL
       AND j.deadline > NOW()
       AND j.deadline <= NOW() + INTERVAL '7 days'
       AND j.source != 'manual'
       AND j.id NOT IN (
         SELECT job_id FROM applications WHERE user_id = $1
       )
     ORDER BY j.deadline ASC
     LIMIT 5`,
    [userId]
  );

const getProfileCompleteness = (userId) =>
  db.query(
    `SELECT first_name, last_name, branch, year,
            location, skills, resume_url, about
     FROM profiles WHERE user_id = $1`,
    [userId]
  );

module.exports = {
  getApplicationStats,
  getTopDomains,
  getTopSkillsInMarket,
  getSkillGap,
  getTopCompanies,
  getExpiringSoon,
  getProfileCompleteness,
};