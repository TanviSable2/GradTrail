const fetch = require('node-fetch');
const { upsertJobs } = require('../upsertJobs');
const stripHtml = require('../../../utils/stripHtml');
const { deriveBranches, deriveDomain, deriveSkills } = require('../../../utils/branchMapper');

const normalizeRemoteOKJob = (job) => {
  const title = job.position || '';
  const description = stripHtml(job.description || '');
  const company = job.company || 'Unknown Company';
  const tags = job.tags || [];

  return {
    external_id: String(job.id),
    title: title,
    company: company,
    role: title,
    job_type: 'job',
    employment_type: 'remote',
    description: description,
    branch_hint: deriveBranches(title, description),
    skills_hint: tags.length > 0 ? tags : deriveSkills(title, description),
    domain: deriveDomain(title, description),
    location: 'Remote',
    is_remote: true,
    country: 'India',
    salary_min: job.salary_min ? Number(job.salary_min) : null,
    salary_max: job.salary_max ? Number(job.salary_max) : null,
    salary_period: 'yearly',
    apply_url: job.url || ('https://remoteok.com/remote-jobs/' + job.id),
    posted_at: job.date ? new Date(job.date) : new Date(),
    deadline: null,
  };
};

const syncRemoteOK = async () => {
  console.log('[sync:remoteok] Starting...');

  try {
    const response = await fetch('https://remoteok.com/api', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GradTrail/1.0; student project job aggregator)',
    'Accept': 'application/json',
  },
});

    if (!response.ok) {
      console.error('[sync:remoteok] HTTP error:', response.status);
      return;
    }

    const data = await response.json();
    const rawJobs = data.slice(1);

    const relevantJobs = rawJobs.filter((job) => {
      if (!job.id || !job.position || !job.url) return false;
      const text = (job.position + ' ' + (job.tags || []).join(' ')).toLowerCase();
      const relevantKeywords = [
        'developer', 'engineer', 'designer', 'analyst', 'data',
        'python', 'javascript', 'java', 'react', 'node', 'backend',
        'frontend', 'fullstack', 'devops', 'cloud', 'mobile',
      ];
      return relevantKeywords.some((kw) => text.includes(kw));
    });

    const normalized = relevantJobs.map(normalizeRemoteOKJob);
    await upsertJobs('remoteok', normalized);

    console.log('[sync:remoteok] Done — processed ' + normalized.length + ' jobs');
  } catch (err) {
    console.error('[sync:remoteok] Failed:', err.message);
  }
};

module.exports = { syncRemoteOK };