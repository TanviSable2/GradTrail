const fetch = require('node-fetch');
const { upsertJobs } = require('../upsertJobs');
const stripHtml = require('../../../utils/stripHtml');
const { deriveBranches, deriveDomain, deriveSkills } = require('../../../utils/branchMapper');

const SEARCH_QUERIES = [
  'software engineer',
  'software developer intern',
  'data analyst',
  'mechanical engineer',
  'civil engineer',
  'electrical engineer',
  'web developer',
  'backend developer',
  'python developer',
  'java developer',
];

const normalizeAdzunaJob = (job) => {
  const title = job.title || '';
  const description = stripHtml(job.description || '');
  const company = (job.company && job.company.display_name)
    ? job.company.display_name
    : 'Company Not Listed';
  const location = job.location ? job.location.display_name : 'India';

  const isInternship =
    title.toLowerCase().includes('intern') ||
    title.toLowerCase().includes('trainee') ||
    title.toLowerCase().includes('graduate');

  const contractMap = {
    full_time: 'full-time',
    part_time: 'part-time',
    contract: 'contract',
  };

  return {
    external_id: String(job.id),
    title: title,
    company: company,
    role: title,
    job_type: isInternship ? 'internship' : 'job',
    employment_type: contractMap[job.contract_time] || 'any',
    description: description,
    branch_hint: deriveBranches(title, description),
    skills_hint: deriveSkills(title, description),
    domain: deriveDomain(title, description),
    location: location,
    is_remote: location.toLowerCase().includes('remote'),
    country: 'India',
    salary_min: job.salary_min || null,
    salary_max: job.salary_max || null,
    salary_period: 'yearly',
    apply_url: job.redirect_url || '',
    posted_at: job.created ? new Date(job.created) : new Date(),
    deadline: null,
  };
};

const syncAdzuna = async () => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.log('[sync:adzuna] Skipping — ADZUNA_APP_ID or ADZUNA_APP_KEY not set in .env');
    return;
  }

  console.log('[sync:adzuna] Starting sync across ' + SEARCH_QUERIES.length + ' queries...');
  let totalFetched = 0;

  for (const query of SEARCH_QUERIES) {
    try {
      const url =
        'https://api.adzuna.com/v1/api/jobs/in/search/1' +
        '?app_id=' + appId +
        '&app_key=' + appKey +
        '&results_per_page=20' +
        '&what=' + encodeURIComponent(query) +
        '&content-type=application/json';

      const response = await fetch(url);

      if (!response.ok) {
        console.error('[sync:adzuna] HTTP error for "' + query + '": ' + response.status);
        continue;
      }

      const data = await response.json();
      const rawJobs = data.results || [];

      if (rawJobs.length === 0) {
        console.log('[sync:adzuna] No results for: ' + query);
        continue;
      }

      const validJobs = rawJobs.filter((j) => j.redirect_url && j.id);
      const normalized = validJobs.map(normalizeAdzunaJob);
      await upsertJobs('adzuna', normalized);
      totalFetched += normalized.length;

      await new Promise((res) => setTimeout(res, 500));
    } catch (err) {
      console.error('[sync:adzuna] Failed for "' + query + '":', err.message);
    }
  }

  console.log('[sync:adzuna] Sync complete. Total jobs processed: ' + totalFetched);
};

module.exports = { syncAdzuna };