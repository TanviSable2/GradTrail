const { getInsights } = require('../services/insight.service');

const getMyInsights = async (req, res, next) => {
  try {
    const data = await getInsights(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyInsights };