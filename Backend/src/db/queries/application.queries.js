const db = require('../../config/db');

const getApplicationsByUser = (user_id) =>
  db.query(
    `SELECT
       a.*,
       j.title     AS job_title,
       j.company   AS job_company,
       j.role      AS job_role,
       j.job_type  AS job_type,
       j.location  AS job_location,
       j.deadline  AS job_deadline,
       j.apply_url AS job_apply_url,
       j.domain    AS job_domain
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id = $1
     ORDER BY a.updated_at DESC`,
    [user_id]
  );

const createApplication = (user_id, fields) => {
  const { job_id, status = 'not_applied', referral_name, referral_link, reminder_date, notes } = fields;
  return db.query(
    `INSERT INTO applications (user_id, job_id, status, referral_name, referral_link, reminder_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [user_id, job_id, status, referral_name || null, referral_link || null,
     reminder_date ? new Date(reminder_date) : null, notes || null]
  );
};

const updateApplication = (id, user_id, fields) => {
  const { status, referral_name, referral_link, reminder_date, notes } = fields;
  return db.query(
    `UPDATE applications SET
       status        = COALESCE($1, status),
       referral_name = COALESCE($2, referral_name),
       referral_link = COALESCE($3, referral_link),
       reminder_date = COALESCE($4, reminder_date),
       notes         = COALESCE($5, notes),
       updated_at    = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [status || null, referral_name || null, referral_link || null,
     reminder_date ? new Date(reminder_date) : null,
     notes || null, id, user_id]
  );
};

module.exports = { getApplicationsByUser, createApplication, updateApplication };