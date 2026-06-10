const { getProfileByUserId, upsertProfile } = require('../db/queries/profile.queries');

const getProfile = async (user_id) => {
  const result = await getProfileByUserId(user_id);
  if (!result.rows[0]) {
    const err = new Error('Profile not found. Please create your profile first.');
    err.status = 404;
    throw err;
  }
  return result.rows[0];
};

const saveProfile = async (user_id, fields) => {
  const result = await upsertProfile(user_id, fields);
  return result.rows[0];
};

module.exports = { getProfile, saveProfile };