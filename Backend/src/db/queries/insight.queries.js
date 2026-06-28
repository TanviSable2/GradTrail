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
    `SELECT domain, COUNT(*) as count
     FROM jobs
     WHERE domain IS NOT NULL AND (deadline IS NULL OR deadline > NOW())
     GROUP BY domain
     ORDER BY count DESC
     LIMIT 8`,
    []  // no userId needed
  );

const getTopSkillsInMarket = () =>
  db.query(
    `SELECT skill, COUNT(*) as count
     FROM jobs
     JOIN LATERAL unnest(skills_hint) AS skill ON true
     WHERE deadline IS NULL OR deadline > NOW()
     GROUP BY skill
     ORDER BY count DESC
     LIMIT 10`
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
     FROM jobs
     JOIN LATERAL unnest(skills_hint) AS skill ON true
     WHERE deadline IS NULL OR deadline > NOW()
     GROUP BY skill
     ORDER BY demand_count DESC
     LIMIT 15`,
    [userId]
  );

const getTopCompanies = () =>
  db.query(
    `SELECT company, COUNT(*) as count
     FROM jobs
     WHERE deadline IS NULL OR deadline > NOW()
     GROUP BY company
     ORDER BY count DESC
     LIMIT 10`
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
       AND j.id NOT IN (SELECT job_id FROM applications WHERE user_id = $1)
     ORDER BY j.deadline ASC
     LIMIT 5`,
    [userId]
  );

const getProfileCompleteness = (userId) =>
  db.query(
    `SELECT first_name, last_name, branch, year, location, skills, resume_url, about
     FROM profiles WHERE user_id = $1`,
    [userId]
  );

module.exports = {
  getApplicationStats, getTopDomains, getTopSkillsInMarket,
  getSkillGap, getTopCompanies, getExpiringSoon, getProfileCompleteness,
};