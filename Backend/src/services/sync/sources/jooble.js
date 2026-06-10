const fetch = require('node-fetch');
const { upsertJobs } = require('../upsertJobs');
const stripHtml = require('../../../utils/stripHtml');
const { deriveBranches, deriveDomain, deriveSkills } = require('../../../utils/branchMapper');

const SEARCH_CONFIGS = [
  { keywords: 'software developer', location: 'India' },
  { keywords: 'software engineer intern', location: 'India' },
  { keywords: 'data analyst', location: 'India' },
  { keywords: 'mechanical engineer', location: 'India' },
  { keywords: 'civil engineer', location: 'India' },
  { keywords: 'electronics engineer', location: 'India' },
  { keywords: 'web developer internship', location: 'India' },
  { keywords: 'backend developer', location: 'India' },
  { keywords: 'python developer', location: 'India' },
  { keywords: 'react developer', location: 'India' },
];

const normalizeJoobleJob = (job) => {
  const title = job.title || '';
  const description = stripHtml(job.snippet || '');
  const company = job.company || 'Unknown Company';

  const isInternship =
    title.toLowerCase().includes('intern') ||
    (job.type && job.type.toLowerCase().includes('intern'));

  const employmentTypeMap = {
    'Full-time': 'full-time',
    'Part-time': 'part-time',
    Temporary: 'temporary',
    Contract: 'contract',
  };

  return {
    external_id: String(job.id),
    title: title,
    company: company,
    role: title,
    job_type: isInternship ? 'internship' : 'job',
    employment_type: employmentTypeMap[job.type] || 'any',
    description: description,
    branch_hint: deriveBranches(title, description),
    skills_hint: deriveSkills(title, description),
    domain: deriveDomain(title, description),
    location: job.location || 'India',
    is_remote: (job.location || '').toLowerCase().includes('remote'),
    country: 'India',
    salary_min: job.salary ? parseFloat(job.salary) : null,
    salary_max: null,
    salary_period: 'yearly',
    apply_url: job.link || '',
    posted_at: job.updated ? new Date(job.updated) : new Date(),
    deadline: null,
  };
};

const syncJooble = async () => {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    console.log('[sync:jooble] Skipping — JOOBLE_API_KEY not set in .env');
    return;
  }

  console.log('[sync:jooble] Starting sync across ' + SEARCH_CONFIGS.length + ' search queries...');
  let totalFetched = 0;

  for (const config of SEARCH_CONFIGS) {
    try {
      const response = await fetch('https://jooble.org/api/' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: config.keywords,
          location: config.location,
          ResultOnPage: 20,
          page: 1,
        }),
      });

      if (!response.ok) {
        console.error('[sync:jooble] HTTP error for "' + config.keywords + '": ' + response.status);
        continue;
      }

      const data = await response.json();
      const rawJobs = data.jobs || [];

      if (rawJobs.length === 0) {
        console.log('[sync:jooble] No results for: ' + config.keywords);
        continue;
      }

      const validJobs = rawJobs.filter((j) => j.link && j.id);
      const normalized = validJobs.map(normalizeJoobleJob);
      await upsertJobs('jooble', normalized);
      totalFetched += normalized.length;

      await new Promise((res) => setTimeout(res, 500));
    } catch (err) {
      console.error('[sync:jooble] Failed for "' + config.keywords + '":', err.message);
    }
  }

  console.log('[sync:jooble] Sync complete. Total jobs processed: ' + totalFetched);
};

module.exports = { syncJooble };