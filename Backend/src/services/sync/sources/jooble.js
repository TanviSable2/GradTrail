const fetch = require('node-fetch');
const { upsertJobs } = require('../upsertJobs');
const stripHtml = require('../../../utils/stripHtml');
const { deriveBranches, deriveDomain, deriveSkills } = require('../../../utils/branchMapper');

const SEARCH_CONFIGS = [
  // Software roles
  { keywords: 'software developer',         location: 'India' },
  { keywords: 'software engineer intern',   location: 'India' },
  { keywords: 'data analyst',               location: 'India' },
  { keywords: 'backend developer',          location: 'India' },
  { keywords: 'frontend developer',         location: 'India' },
  { keywords: 'python developer',           location: 'India' },
  { keywords: 'java developer',             location: 'India' },
  { keywords: 'react developer',            location: 'India' },
  { keywords: 'devops engineer',            location: 'India' },
  { keywords: 'data scientist',             location: 'India' },
  // Non-IT
  { keywords: 'mechanical engineer',        location: 'India' },
  { keywords: 'civil engineer',             location: 'India' },
  { keywords: 'electrical engineer',        location: 'India' },
  { keywords: 'electronics engineer',       location: 'India' },
  { keywords: 'embedded systems engineer',  location: 'India' },
  // Internships
  { keywords: 'software intern',            location: 'India' },
  { keywords: 'web developer internship',   location: 'India' },
  { keywords: 'mechanical engineer intern', location: 'India' },
  { keywords: 'data analyst internship',    location: 'India' },
];

const normalizeJoobleJob = (job) => {
  const title       = job.title    || '';
  const description = stripHtml(job.snippet || '');
  const company     = job.company  || 'Unknown Company';

  const isInternship =
    title.toLowerCase().includes('intern') ||
    (job.type && job.type.toLowerCase().includes('intern'));

  const employmentTypeMap = {
    'Full-time':  'full-time',
    'Part-time':  'part-time',
    'Temporary':  'temporary',
    'Contract':   'contract',
  };

  return {
    external_id:     String(job.id),
    title:           title,
    company:         company,
    role:            title,
    job_type:        isInternship ? 'internship' : 'job',
    employment_type: employmentTypeMap[job.type] || 'any',
    description:     description,
    branch_hint:     deriveBranches(title, description),
    skills_hint:     deriveSkills(title, description),
    domain:          deriveDomain(title, description),
    location:        job.location  || 'India',
    is_remote:       (job.location || '').toLowerCase().includes('remote'),
    country:         'India',
    salary_min:      job.salary ? parseFloat(job.salary) : null,
    salary_max:      null,
    salary_period:   'yearly',
    apply_url:       job.link      || '',
    posted_at:       job.updated   ? new Date(job.updated) : new Date(),
    deadline:        null,
  };
};

const syncJooble = async () => {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) {
    console.log('[sync:jooble] Skipping — JOOBLE_API_KEY not set');
    return;
  }

  console.log('[sync:jooble] Starting — ' + SEARCH_CONFIGS.length + ' queries...');
  let totalFetched = 0;

  for (const config of SEARCH_CONFIGS) {
    try {
      const response = await fetch('https://jooble.org/api/' + apiKey, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          keywords:     config.keywords,
          location:     config.location,
          ResultOnPage: 20,  // Jooble max per request
          page:         1,
        }),
      });

      if (!response.ok) {
        console.error('[sync:jooble] HTTP ' + response.status + ' for: ' + config.keywords);
        continue;
      }

      const data    = await response.json();
      const rawJobs = (data.jobs || []).filter((j) => j.link && j.id);

      if (rawJobs.length === 0) {
        console.log('[sync:jooble] No results for: ' + config.keywords);
        continue;
      }

      const normalized = rawJobs.map(normalizeJoobleJob);
      await upsertJobs('jooble', normalized);
      totalFetched += normalized.length;

      console.log('[sync:jooble] "' + config.keywords + '" → ' + normalized.length + ' jobs');

      await new Promise((res) => setTimeout(res, 600));
    } catch (err) {
      console.error('[sync:jooble] Failed "' + config.keywords + '":', err.message);
    }
  }

  console.log('[sync:jooble] Done. Total: ' + totalFetched);
};

module.exports = { syncJooble };