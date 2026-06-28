const {
  getApplicationStats,
  getTopDomains,
  getTopSkillsInMarket,
  getSkillGap,
  getTopCompanies,
  getExpiringSoon,
  getProfileCompleteness,
} = require('../db/queries/insight.queries');

const calculateProfileScore = (profile) => {
  if (!profile) return 0;
  let score = 0;
  if (profile.first_name) score += 15;
  if (profile.last_name)  score += 10;
  if (profile.branch)     score += 20;
  if (profile.year)       score += 10;
  if (profile.location)   score += 10;
  if (profile.skills && profile.skills.length > 0) score += 20;
  if (profile.resume_url) score += 10;
  if (profile.about)      score += 5;
  return score;
};

const getInsights = async (userId) => {
  const [
    { rows: applicationStats },
    { rows: topDomains },
    { rows: topSkills },
    { rows: skillGap },
    { rows: topCompanies },
    { rows: expiringSoon },
    { rows: profileRows },
  ] = await Promise.all([
    getApplicationStats(userId),
    getTopDomains(userId),
    getTopSkillsInMarket(),
    getSkillGap(userId),
    getTopCompanies(),
    getExpiringSoon(userId),
    getProfileCompleteness(userId),
  ]);

  return {
    profile_completeness: calculateProfileScore(profileRows[0]),
    application_stats: applicationStats,
    top_domains: topDomains,
    top_skills_in_market: topSkills,
    skill_gap: skillGap,
    top_companies: topCompanies,
    expiring_soon: expiringSoon,
  };
};

module.exports = { getInsights };