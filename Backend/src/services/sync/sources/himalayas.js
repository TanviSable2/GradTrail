const fetch = require('node-fetch');
const { upsertJobs } = require('../upsertJobs');
const { deriveBranches, deriveDomain, deriveSkills } = require('../../../utils/branchMapper');

const SEARCH_TERMS = [
  'software-engineer',
  'backend-developer',
  'frontend-developer',
  'data-engineer',
  'devops-engineer',
  'python-developer',
  'javascript-developer',
];

const normalizeHimalayasJob = (job) => {
  const title = job.title || '';
  const description = job.description || '';
  const company = (job.company && job.company.name) ? job.company.name : 'Unknown Company';

  return {
    external_id: String(job.id || job.slug),
    title: title,
    company: company,
    role: title,
    job_type: 'job',
    employment_type: 'remote',
    description: description,
    branch_hint: deriveBranches(title, description),
    skills_hint: deriveSkills(title, description),
    domain: deriveDomain(title, description),
    location: 'Remote',
    is_remote: true,
    country: 'India',
    salary_min: job.salaryMin ? Number(job.salaryMin) : null,
    salary_max: job.salaryMax ? Number(job.salaryMax) : null,
    salary_period: 'yearly',
    apply_url: job.applicationLink || ('https://himalayas.app/jobs/' + job.slug),
    posted_at: job.createdAt ? new Date(job.createdAt) : new Date(),
    deadline: null,
  };
};

const syncHimalayas = async () => {
  console.log('[sync:himalayas] Starting...');
  let total = 0;

  for (const term of SEARCH_TERMS) {
    try {
      const response = await fetch(
        'https://himalayas.app/api/jobs?q=' + term + '&limit=20',
        { headers: { 'User-Agent': 'NextStep Job Aggregator (student project)' } }
      );

      if (!response.ok) {
        console.error('[sync:himalayas] HTTP ' + response.status + ' for: ' + term);
        continue;
      }

      const data = await response.json();
      const rawJobs = data.jobs || [];
      if (rawJobs.length === 0) continue;

      const validJobs = rawJobs.filter((j) => j.id && j.title);
      const normalized = validJobs.map(normalizeHimalayasJob);
      await upsertJobs('himalayas', normalized);
      total += normalized.length;

      await new Promise((res) => setTimeout(res, 300));
    } catch (err) {
      console.error('[sync:himalayas] Failed for ' + term + ':', err.message);
    }
  }

  console.log('[sync:himalayas] Done — total: ' + total);
};

module.exports = { syncHimalayas };