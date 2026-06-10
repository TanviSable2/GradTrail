const db = require('../../config/db');

const getProfileByUserId = (user_id) =>
  db.query('SELECT * FROM profiles WHERE user_id = $1', [user_id]);

const upsertProfile = (user_id, fields) => {
  const { first_name, last_name, branch, year, location, skills, resume_url, about } = fields;
  return db.query(
    `INSERT INTO profiles (user_id, first_name, last_name, branch, year, location, skills, resume_url, about)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id) DO UPDATE SET
       first_name = EXCLUDED.first_name,
       last_name  = EXCLUDED.last_name,
       branch     = EXCLUDED.branch,
       year       = EXCLUDED.year,
       location   = EXCLUDED.location,
       skills     = EXCLUDED.skills,
       resume_url = EXCLUDED.resume_url,
       about      = EXCLUDED.about,
       updated_at = NOW()
     RETURNING *`,
    [user_id, first_name, last_name, branch, year, location, skills, resume_url, about]
  );
};

module.exports = { getProfileByUserId, upsertProfile };