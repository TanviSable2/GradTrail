const db = require('../../config/db');

function parseYear(year) {
  if (!year) return null;
  if (typeof year === 'number') return year;
  const map = {
    '1st year': 1, '1': 1,
    '2nd year': 2, '2': 2,
    '3rd year': 3, '3': 3,
    '4th year': 4, '4': 4,
    'graduated / working': 5,
    'graduated': 5,
  };
  return map[String(year).toLowerCase().trim()] || null;
}

const getProfileByUserId = (user_id) =>
  db.query('SELECT * FROM profiles WHERE user_id = $1', [user_id]);

const upsertProfile = (user_id, fields) => {
  const { first_name, last_name, branch, year, location, skills, resume_url, resume_filename, about } = fields;
  return db.query(
    `INSERT INTO profiles (user_id, first_name, last_name, branch, year, location, skills, resume_url, resume_filename, about)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (user_id) DO UPDATE SET
       first_name       = EXCLUDED.first_name,
       last_name        = EXCLUDED.last_name,
       branch           = EXCLUDED.branch,
       year             = EXCLUDED.year,
       location         = EXCLUDED.location,
       skills           = EXCLUDED.skills,
       resume_url       = EXCLUDED.resume_url,
       resume_filename  = EXCLUDED.resume_filename,
       about            = EXCLUDED.about,
       updated_at       = NOW()
     RETURNING *`,
    [user_id, first_name, last_name, branch, parseYear(year), location, skills, resume_url, resume_filename, about]
  );
};

module.exports = { getProfileByUserId, upsertProfile };