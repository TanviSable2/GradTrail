const profileService = require('../services/profile.service');
const { validateRequired } = require('../utils/validateFields');

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

const upsertMyProfile = async (req, res, next) => {
  try {
    const missing = validateRequired(req.body, ['branch']);
    if (missing) return res.status(400).json({ error: missing });

    if (req.body.skills !== undefined && !Array.isArray(req.body.skills)) {
      return res.status(400).json({ error: 'skills must be an array.' });
    }

    const profile = await profileService.saveProfile(req.user.id, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyProfile, upsertMyProfile };