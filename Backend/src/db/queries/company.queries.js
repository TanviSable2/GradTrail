const db = require('../../config/db');

const getAllCompanies = () =>
  db.query('SELECT * FROM companies WHERE is_tracked = TRUE ORDER BY name');

const getCompanyBySlug = (slug) =>
  db.query('SELECT * FROM companies WHERE slug = $1', [slug]);

// Match jobs using multiple name variations
// TCS -> also match "Tata Consultancy", "tcs"
// Google India -> also match "Google"
const COMPANY_ALIASES = {
  'tcs':            ['tcs', 'tata consultancy'],
  'infosys':        ['infosys'],
  'wipro':          ['wipro'],
  'accenture':      ['accenture'],
  'hcl':            ['hcl'],
  'tech-mahindra':  ['tech mahindra', 'techmahindra'],
  'samsung-india':  ['samsung'],
  'google-india':   ['google'],
  'microsoft-india':['microsoft'],
  'amazon-india':   ['amazon'],
  'flipkart':       ['flipkart'],
  'zomato':         ['zomato'],
  'swiggy':         ['swiggy'],
  'razorpay':       ['razorpay'],
  'unstop':         ['unstop'],
  'ibm-india':      ['ibm'],
  'capgemini':      ['capgemini'],
  'cognizant':      ['cognizant'],
  'byjus':          ['byju'],
};

const getJobsByCompany = (slug, filters = {}) => {
  const { job_type, branch, page = 1, limit = 20 } = filters;

  const aliases = COMPANY_ALIASES[slug] || [slug];

  // Build OR conditions for each alias
  const aliasConditions = aliases.map((_, i) => `LOWER(company) LIKE $${i + 1}`);
  const params = aliases.map((a) => '%' + a + '%');
  let i = params.length + 1;

  const extraConditions = [];

  if (job_type) { extraConditions.push(`job_type = $${i++}`); params.push(job_type); }
  if (branch)   { extraConditions.push(`$${i++} = ANY(branch_hint)`); params.push(branch); }

  const offset = (Number(page) - 1) * Number(limit);
  params.push(Number(limit));
  params.push(offset);

  const whereClause = '(' + aliasConditions.join(' OR ') + ')' +
    (extraConditions.length ? ' AND ' + extraConditions.join(' AND ') : '');

  return db.query(
    `SELECT * FROM jobs WHERE ${whereClause}
     ORDER BY posted_at DESC NULLS LAST
     LIMIT $${i++} OFFSET $${i++}`,
    params
  );
};

const followCompany = (user_id, company_id) =>
  db.query(
    `INSERT INTO user_company_follows (user_id, company_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, company_id) DO NOTHING
     RETURNING *`,
    [user_id, company_id]
  );

const unfollowCompany = (user_id, company_id) =>
  db.query(
    'DELETE FROM user_company_follows WHERE user_id = $1 AND company_id = $2 RETURNING id',
    [user_id, company_id]
  );

const getFollowedCompanies = (user_id) =>
  db.query(
    `SELECT c.* FROM companies c
     JOIN user_company_follows f ON f.company_id = c.id
     WHERE f.user_id = $1
     ORDER BY c.name`,
    [user_id]
  );

// Feed: jobs from followed companies using alias matching
const getJobsFromFollowedCompanies = async (user_id) => {
  // Get followed company slugs
  const followed = await db.query(
    `SELECT c.slug FROM companies c
     JOIN user_company_follows f ON f.company_id = c.id
     WHERE f.user_id = $1`,
    [user_id]
  );

  if (followed.rows.length === 0) {
    return { rows: [], rowCount: 0 };
  }

  // Collect all aliases for followed companies
  const allAliases = [];
  for (const row of followed.rows) {
    const aliases = COMPANY_ALIASES[row.slug] || [row.slug];
    allAliases.push(...aliases);
  }

  // Build dynamic OR conditions
  const conditions = allAliases.map((_, i) => `LOWER(company) LIKE $${i + 1}`);
  const params = allAliases.map((a) => '%' + a + '%');

  return db.query(
    `SELECT * FROM jobs WHERE ${conditions.join(' OR ')}
     ORDER BY posted_at DESC NULLS LAST LIMIT 50`,
    params
  );
};

module.exports = {
  getAllCompanies,
  getCompanyBySlug,
  getJobsByCompany,
  followCompany,
  unfollowCompany,
  getFollowedCompanies,
  getJobsFromFollowedCompanies,
};