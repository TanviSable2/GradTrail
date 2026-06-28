const fetch = require('node-fetch');
const { upsertJobs } = require('../upsertJobs');
const stripHtml = require('../../../utils/stripHtml');
const { deriveBranches, deriveDomain, deriveSkills } = require('../../../utils/branchMapper');

// More search queries covering all engineering branches
const SEARCH_QUERIES = [
  // Software / IT
  { q: 'software engineer',         pages: 2 },
  { q: 'software developer intern', pages: 2 },
  { q: 'web developer',             pages: 1 },
  { q: 'backend developer',         pages: 1 },
  { q: 'frontend developer',        pages: 1 },
  { q: 'python developer',          pages: 1 },
  { q: 'java developer',            pages: 1 },
  { q: 'data analyst',              pages: 1 },
  { q: 'data scientist',            pages: 1 },
  { q: 'devops engineer',           pages: 1 },
  // Non-IT branches
  { q: 'mechanical engineer',       pages: 1 },
  { q: 'civil engineer',            pages: 1 },
  { q: 'electrical engineer',       pages: 1 },
  { q: 'electronics engineer',      pages: 1 },
  { q: 'embedded engineer',         pages: 1 },
  // Internships specifically
  { q: 'engineering intern',        pages: 1 },
  { q: 'mechanical intern',         pages: 1 },
  { q: 'data analyst intern',       pages: 1 },
];

const MAX_JOB_AGE_DAYS = 45; // skip jobs older than this — links are likely dead

const normalizeAdzunaJob = (job) => {
  const title = job.title || '';
  const description = stripHtml(job.description || '');
  const company = (job.company && job.company.display_name)
    ? job.company.display_name
    : 'Company Not Listed';
  const location = job.location ? job.location.display_name : 'India';

  const postedAt = job.created ? new Date(job.created) : new Date();
  const daysSincePosted = (Date.now() - postedAt.getTime()) / (1000 * 60 * 60 * 24);

  // Skip jobs that are too old — their apply links are very likely dead by now
  if (daysSincePosted > MAX_JOB_AGE_DAYS) return null;

  const isInternship =
    title.toLowerCase().includes('intern') ||
    title.toLowerCase().includes('trainee') ||
    title.toLowerCase().includes('graduate trainee');

  const contractMap = {
    full_time:  'full-time',
    part_time:  'part-time',
    contract:   'contract',
    temporary:  'temporary',
  };

  return {
    external_id: String(job.id),
    title:           title,
    company:         company,
    role:            title,
    job_type:        isInternship ? 'internship' : 'job',
    employment_type: contractMap[job.contract_time] || 'any',
    description:     description,
    branch_hint:     deriveBranches(title, description),
    skills_hint:     deriveSkills(title, description),
    domain:          deriveDomain(title, description),
    location:        location,
    is_remote:       location.toLowerCase().includes('remote'),
    country:         'India',
    salary_min:      job.salary_min  || null,
    salary_max:      job.salary_max  || null,
    salary_period:   'yearly',
    apply_url:       job.redirect_url || '',
    posted_at:       postedAt,
    deadline:        null,
  };
};

const syncAdzuna = async () => {
  const appId  = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.log('[sync:adzuna] Skipping — ADZUNA_APP_ID or ADZUNA_APP_KEY not set');
    return;
  }

  console.log('[sync:adzuna] Starting — ' + SEARCH_QUERIES.length + ' queries...');
  let totalFetched = 0;
  let totalSkippedOld = 0;

  for (const config of SEARCH_QUERIES) {
    for (let page = 1; page <= config.pages; page++) {
      try {
        const url =
          'https://api.adzuna.com/v1/api/jobs/in/search/' + page +
          '?app_id='           + appId +
          '&app_key='          + appKey +
          '&results_per_page=50' +
          '&what='             + encodeURIComponent(config.q) +
          '&where=india'       +
          '&max_days_old='     + MAX_JOB_AGE_DAYS +  // ask Adzuna to only return recent jobs
          '&content-type=application/json';

        const response = await fetch(url);

        if (!response.ok) {
          console.error('[sync:adzuna] HTTP ' + response.status + ' for "' + config.q + '" p' + page);
          break; // stop paging this query if we hit an error
        }

        const data    = await response.json();
        const rawJobs = data.results || [];

        if (rawJobs.length === 0) break; // no more results

        const validJobs  = rawJobs.filter((j) => j.redirect_url && j.id);
        const normalized = validJobs.map(normalizeAdzunaJob).filter(Boolean); // drop nulls (too old)

        totalSkippedOld += validJobs.length - normalized.length;

        if (normalized.length > 0) {
          await upsertJobs('adzuna', normalized);
          totalFetched += normalized.length;
        }

        console.log('[sync:adzuna] "' + config.q + '" p' + page + ' → ' + normalized.length + ' jobs (fresh)');

        // Respect rate limit: 0.5s between requests
        await new Promise((res) => setTimeout(res, 500));
      } catch (err) {
        console.error('[sync:adzuna] Failed "' + config.q + '" p' + page + ':', err.message);
      }
    }
  }

  console.log('[sync:adzuna] Done. Total fresh: ' + totalFetched + ', skipped (too old): ' + totalSkippedOld);
};

module.exports = { syncAdzuna };