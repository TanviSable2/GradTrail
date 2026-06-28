const db = require('../../config/db');

const upsertJobs = async (source, jobs) => {
  if (!jobs || jobs.length === 0) {
    console.log('[sync:' + source + '] No jobs to upsert');
    return;
  }

  const client = await db.connect();  // ← fixed: was db.getClient()
  let inserted = 0;
  let updated = 0;

  try {
    await client.query('BEGIN');

    for (const job of jobs) {
      const result = await client.query(
        `INSERT INTO jobs
           (source, external_id, title, company, role, job_type, employment_type,
            description, branch_hint, skills_hint, domain, location, is_remote, country,
            salary_min, salary_max, salary_period, apply_url, posted_at, deadline, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, NOW())
         ON CONFLICT (source, external_id) DO UPDATE SET
           title           = EXCLUDED.title,
           description     = EXCLUDED.description,
           branch_hint     = EXCLUDED.branch_hint,
           skills_hint     = EXCLUDED.skills_hint,
           domain          = EXCLUDED.domain,
           salary_min      = EXCLUDED.salary_min,
           salary_max      = EXCLUDED.salary_max,
           employment_type = EXCLUDED.employment_type,
           is_remote       = EXCLUDED.is_remote,
           deadline        = EXCLUDED.deadline,
           updated_at      = NOW()
         RETURNING id, (xmax = 0) AS is_new`,
        [
          source,
          job.external_id,
          job.title,
          job.company,
          job.role,
          job.job_type || 'job',
          job.employment_type || 'any',
          job.description,
          job.branch_hint || [],
          job.skills_hint || [],
          job.domain || 'Other',
          job.location,
          job.is_remote || false,
          job.country || 'India',
          job.salary_min || null,
          job.salary_max || null,
          job.salary_period || 'yearly',
          job.apply_url,
          job.posted_at ? new Date(job.posted_at) : null,
          job.deadline ? new Date(job.deadline) : null,
        ]
      );

      if (result.rows[0].is_new) inserted++;
      else updated++;
    }

    await client.query('COMMIT');
    console.log('[sync:' + source + '] Done — inserted: ' + inserted + ', updated: ' + updated);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[sync:' + source + '] Transaction failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { upsertJobs };