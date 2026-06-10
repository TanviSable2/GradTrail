const db = require('../../config/db');

const getCertsByUser = (user_id) =>
  db.query('SELECT * FROM certifications WHERE user_id = $1 ORDER BY completion_date DESC', [user_id]);

const createCert = (user_id, fields) => {
  const { title, issuing_org, url, skills = [], completion_date } = fields;
  return db.query(
    `INSERT INTO certifications (user_id, title, issuing_org, url, skills, completion_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_id, title, issuing_org, url, skills, completion_date ? new Date(completion_date) : null]
  );
};

const updateCert = (id, user_id, fields) => {
  const { title, issuing_org, url, skills, completion_date } = fields;
  return db.query(
    `UPDATE certifications SET
       title           = COALESCE($1, title),
       issuing_org     = COALESCE($2, issuing_org),
       url             = COALESCE($3, url),
       skills          = COALESCE($4, skills),
       completion_date = COALESCE($5, completion_date),
       updated_at      = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [title, issuing_org, url, skills,
     completion_date ? new Date(completion_date) : null, id, user_id]
  );
};

const deleteCert = (id, user_id) =>
  db.query('DELETE FROM certifications WHERE id = $1 AND user_id = $2 RETURNING id', [id, user_id]);

module.exports = { getCertsByUser, createCert, updateCert, deleteCert };