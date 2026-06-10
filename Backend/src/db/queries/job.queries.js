const db = require('../../config/db');

const getJobs = (filters) => {
  const {
    job_type, role, location, branch, deadline_before,
    employment_type, is_remote, salary_min, salary_period,
    posted_within_days, domain, page = 1, limit = 20,
  } = filters;

  const conditions = [];
  const params = [];
  let i = 1;

  if (job_type) { conditions.push('job_type = $' + i++); params.push(job_type); }
  if (role) { conditions.push('role ILIKE $' + i++); params.push('%' + role + '%'); }
  if (location) { conditions.push('location ILIKE $' + i++); params.push('%' + location + '%'); }
  if (branch) { conditions.push('$' + i++ + ' = ANY(branch_hint)'); params.push(branch); }
  if (deadline_before) { conditions.push('deadline <= $' + i++); params.push(new Date(deadline_before)); }
  if (employment_type && employment_type !== 'any') { conditions.push('employment_type = $' + i++); params.push(employment_type); }
  if (is_remote !== undefined && is_remote !== '') {
    conditions.push('is_remote = $' + i++);
    params.push(is_remote === 'true' || is_remote === true);
  }
  if (salary_min) { conditions.push('salary_min >= $' + i++); params.push(Number(salary_min)); }
  if (salary_period) { conditions.push('salary_period = $' + i++); params.push(salary_period); }
  if (posted_within_days) {
    conditions.push("posted_at >= NOW() - INTERVAL '" + Number(posted_within_days) + " days'");
  }
  if (domain) { conditions.push('domain = $' + i++); params.push(domain); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (Number(page) - 1) * Number(limit);
  params.push(Number(limit));
  params.push(offset);

  return db.query(
  `SELECT *,
     COUNT(*) OVER() AS total_count,
     CASE
       WHEN deadline IS NOT NULL AND deadline > NOW()
       THEN CEIL(EXTRACT(EPOCH FROM (deadline - NOW())) / 86400)
       ELSE NULL
     END AS days_until_deadline,
     CASE
       WHEN deadline IS NOT NULL AND deadline <= NOW() THEN true
       ELSE false
     END AS is_expired
   FROM jobs
   ${where}
   ORDER BY posted_at DESC NULLS LAST
   LIMIT $${i++} OFFSET $${i++}`,
  params
);
};

const getJobById = (id) =>
  db.query(
    `SELECT *,
       CASE
         WHEN deadline IS NOT NULL AND deadline > NOW()
         THEN CEIL(EXTRACT(EPOCH FROM (deadline - NOW())) / 86400)
         WHEN deadline IS NOT NULL AND deadline <= NOW()
         THEN 0
         ELSE NULL
       END AS days_until_deadline,
       CASE
         WHEN deadline IS NOT NULL AND deadline <= NOW() THEN true
         ELSE false
       END AS is_expired
     FROM jobs WHERE id = $1`,
    [id]
  );

const createJob = (fields) => {
  const {
    source = 'manual', external_id = null, title, company, role, job_type,
    employment_type = 'any', description, branch_hint = [], skills_hint = [],
    domain = 'Other', location, is_remote = false, country = 'India',
    salary_min = null, salary_max = null, salary_period = 'yearly',
    apply_url, posted_at, deadline = null,
  } = fields;

  return db.query(
    `INSERT INTO jobs
       (source, external_id, title, company, role, job_type, employment_type,
        description, branch_hint, skills_hint, domain, location, is_remote, country,
        salary_min, salary_max, salary_period, apply_url, posted_at, deadline)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING *`,
    [
      source, external_id, title, company, role, job_type, employment_type,
      description, branch_hint, skills_hint, domain, location, is_remote, country,
      salary_min, salary_max, salary_period, apply_url,
      posted_at ? new Date(posted_at) : new Date(),
      deadline  ? new Date(deadline)  : null,
    ]
  );
};

const getDistinctDomains = () =>
  db.query(
    `SELECT domain, COUNT(*) as total
     FROM jobs
     WHERE domain IS NOT NULL
     GROUP BY domain
     ORDER BY total DESC`
  );

const getNewJobsForUser = (userId, hoursBack = 24) =>
  db.query(
    `SELECT j.*
     FROM jobs j
     JOIN profiles p ON p.user_id = $1
     WHERE
       j.posted_at >= NOW() - ($2 || ' hours')::INTERVAL
       AND (
         p.branch IS NULL
         OR p.branch = ANY(j.branch_hint)
         OR j.branch_hint = '{}'
         OR j.branch_hint IS NULL
       )
       AND (
         p.preferred_domain IS NULL
         OR j.domain = p.preferred_domain
         OR j.domain = 'Other'
       )
       AND (j.deadline IS NULL OR j.deadline > NOW())
       AND j.id NOT IN (
         SELECT job_id FROM applications WHERE user_id = $1
       )
     ORDER BY j.posted_at DESC
     LIMIT 10`,
    [userId, hoursBack]
  );

// no u.name — users table has no name column
const getJobsWithActiveReminders = () =>
  db.query(
    `SELECT
       a.id AS application_id,
       a.remind_days_before,
       a.remind_me,
       u.id AS user_id,
       u.email AS user_email,
       j.id AS job_id,
       j.title,
       j.company,
       j.deadline,
       j.apply_url,
       j.domain,
       j.job_type,
       CEIL(EXTRACT(EPOCH FROM (j.deadline - NOW())) / 86400) AS days_until_deadline
     FROM applications a
     JOIN users u ON u.id = a.user_id
     JOIN jobs j ON j.id = a.job_id
     WHERE
       a.remind_me = TRUE
       AND a.deadline_reminder_sent = FALSE
       AND j.deadline IS NOT NULL
       AND j.deadline > NOW()
       AND j.deadline <= NOW() + (a.remind_days_before || ' days')::INTERVAL
     ORDER BY j.deadline ASC`
  );

  // GET JOBS WITH MATCH SCORE — real-time from student profile
const getJobsWithMatchScore = (userId, filters) => {
  const {
    job_type, role, location, branch, deadline_before,
    employment_type, is_remote, salary_min, salary_period,
    posted_within_days, domain, page = 1, limit = 20,
  } = filters;

  const conditions = [];
  const params = [];
  let i = 1;

  // first param is always userId for the subquery
  params.push(userId); // $1

  if (job_type) { conditions.push('j.job_type = $' + (i + 1)); i++; params.push(job_type); }
  if (role) { conditions.push('j.role ILIKE $' + (i + 1)); i++; params.push('%' + role + '%'); }
  if (location) { conditions.push('j.location ILIKE $' + (i + 1)); i++; params.push('%' + location + '%'); }
  if (branch) { conditions.push('$' + (i + 1) + ' = ANY(j.branch_hint)'); i++; params.push(branch); }
  if (deadline_before) { conditions.push('j.deadline <= $' + (i + 1)); i++; params.push(new Date(deadline_before)); }
  if (employment_type && employment_type !== 'any') { conditions.push('j.employment_type = $' + (i + 1)); i++; params.push(employment_type); }
  if (is_remote !== undefined && is_remote !== '') {
    conditions.push('j.is_remote = $' + (i + 1)); i++;
    params.push(is_remote === 'true' || is_remote === true);
  }
  if (salary_min) { conditions.push('j.salary_min >= $' + (i + 1)); i++; params.push(Number(salary_min)); }
  if (salary_period) { conditions.push('j.salary_period = $' + (i + 1)); i++; params.push(salary_period); }
  if (posted_within_days) {
    conditions.push("j.posted_at >= NOW() - INTERVAL '" + Number(posted_within_days) + " days'");
  }
  if (domain) { conditions.push('j.domain = $' + (i + 1)); i++; params.push(domain); }

  const where = conditions.length ? 'AND ' + conditions.join(' AND ') : '';
  const offset = (Number(page) - 1) * Number(limit);
  params.push(Number(limit));   // $i+1
  params.push(offset);          // $i+2

  const limitIndex = i + 1;
  const offsetIndex = i + 2;

  return db.query(
    `WITH student_profile AS (
       SELECT
         p.branch,
         p.skills
       FROM profiles p
       WHERE p.user_id = $1
     )
     SELECT
       j.*,

       -- days until deadline (real, not estimated)
       CASE
         WHEN j.deadline IS NOT NULL AND j.deadline > NOW()
         THEN CEIL(EXTRACT(EPOCH FROM (j.deadline - NOW())) / 86400)
         WHEN j.deadline IS NOT NULL AND j.deadline <= NOW()
         THEN 0
         ELSE NULL
       END AS days_until_deadline,

       CASE
         WHEN j.deadline IS NOT NULL AND j.deadline <= NOW()
         THEN true ELSE false
       END AS is_expired,

       -- branch score: 40 points if student branch matches job branch_hint
       CASE
         WHEN (SELECT branch FROM student_profile) IS NULL THEN 20
         WHEN (SELECT branch FROM student_profile) = ANY(j.branch_hint) THEN 40
         WHEN j.branch_hint = '{}' OR j.branch_hint IS NULL THEN 20
         ELSE 0
       END AS branch_score,

       -- skills score: 60 points scaled by how many skills match
       CASE
         WHEN (SELECT skills FROM student_profile) IS NULL
           OR array_length((SELECT skills FROM student_profile), 1) IS NULL
           OR j.skills_hint = '{}' OR j.skills_hint IS NULL
         THEN 20
         ELSE ROUND(
           60.0 * (
             SELECT COUNT(*)
             FROM unnest((SELECT skills FROM student_profile)) AS s
             WHERE LOWER(s) = ANY(
               SELECT LOWER(sk) FROM unnest(j.skills_hint) AS sk
             )
           )::numeric
           /
           NULLIF(array_length(j.skills_hint, 1), 0)
         )
       END AS skills_score,

       -- total match score out of 100
       (
         CASE
           WHEN (SELECT branch FROM student_profile) IS NULL THEN 20
           WHEN (SELECT branch FROM student_profile) = ANY(j.branch_hint) THEN 40
           WHEN j.branch_hint = '{}' OR j.branch_hint IS NULL THEN 20
           ELSE 0
         END
         +
         CASE
           WHEN (SELECT skills FROM student_profile) IS NULL
             OR array_length((SELECT skills FROM student_profile), 1) IS NULL
             OR j.skills_hint = '{}' OR j.skills_hint IS NULL
           THEN 20
           ELSE ROUND(
             60.0 * (
               SELECT COUNT(*)
               FROM unnest((SELECT skills FROM student_profile)) AS s
               WHERE LOWER(s) = ANY(
                 SELECT LOWER(sk) FROM unnest(j.skills_hint) AS sk
               )
             )::numeric
             /
             NULLIF(array_length(j.skills_hint, 1), 0)
           )
         END
       ) AS match_score,

       -- which of student skills matched (for frontend to highlight)
       ARRAY(
         SELECT s
         FROM unnest((SELECT skills FROM student_profile)) AS s
         WHERE LOWER(s) = ANY(
           SELECT LOWER(sk) FROM unnest(j.skills_hint) AS sk
         )
       ) AS matched_skills,

       -- which skills student is missing for this job
       ARRAY(
         SELECT sk
         FROM unnest(j.skills_hint) AS sk
         WHERE LOWER(sk) != ALL(
           SELECT LOWER(s) FROM unnest(
             COALESCE((SELECT skills FROM student_profile), '{}')
           ) AS s
         )
       ) AS missing_skills

     FROM jobs j, student_profile
     WHERE true ${where}
     ORDER BY match_score DESC, j.posted_at DESC NULLS LAST
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params
  );
};
module.exports = {
  getJobs,
  getJobById,
  createJob,
  getDistinctDomains,
  getNewJobsForUser,
  getJobsWithActiveReminders,
  getJobsWithMatchScore
};