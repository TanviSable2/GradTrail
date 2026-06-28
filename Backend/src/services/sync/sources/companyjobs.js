const fetch = require('node-fetch');
const { upsertJobs } = require('../upsertJobs');
const stripHtml = require('../../../utils/stripHtml');
const { deriveBranches, deriveDomain, deriveSkills } = require('../../../utils/branchMapper');

const COMPANY_SEARCHES = [
  // Big IT
  { name: 'TCS',                  query: 'TCS Tata Consultancy India'      },
  { name: 'Infosys',              query: 'Infosys India'                   },
  { name: 'Wipro',                query: 'Wipro India'                     },
  { name: 'Accenture',            query: 'Accenture India'                 },
  { name: 'HCL Technologies',     query: 'HCL Technologies India'          },
  { name: 'Tech Mahindra',        query: 'Tech Mahindra India'             },
  { name: 'Cognizant',            query: 'Cognizant India'                 },
  { name: 'Capgemini',            query: 'Capgemini India'                 },
  { name: 'IBM',                  query: 'IBM India'                       },
  { name: 'Samsung',              query: 'Samsung India R&D'               },
  // Global tech in India
  { name: 'Google',               query: 'Google India engineer'           },
  { name: 'Amazon',               query: 'Amazon India software engineer'  },
  { name: 'Microsoft',            query: 'Microsoft India engineer'        },
  { name: 'Red Hat',              query: 'Red Hat India'                   },
  // Indian startups / product companies  
  { name: 'Flipkart',             query: 'Flipkart engineer India'         },
  { name: 'Meesho',               query: 'Meesho engineer India'           },
  { name: 'Zomato',               query: 'Zomato engineer India'           },
  { name: 'Swiggy',               query: 'Swiggy engineer India'           },
  { name: 'Razorpay',             query: 'Razorpay engineer India'         },
  { name: 'Zepto',                query: 'Zepto India engineer'            },
  // Demo target companies
  { name: 'Pratiti Technologies', query: 'Pratiti Technologies Pune'       },
  { name: 'Yardi Systems',        query: 'Yardi Systems India'             },
  { name: 'Zoho',                 query: 'Zoho Corporation India'          },
  // Others good for freshers
  { name: 'Persistent Systems',   query: 'Persistent Systems India'        },
  { name: 'Mphasis',              query: 'Mphasis India'                   },
  { name: 'Hexaware',             query: 'Hexaware India fresher'          },
]

const normalizeCompanyJob = (job, companyName) => {
  const title       = job.title || '';
  const description = stripHtml(job.snippet || job.description || '');

  const isInternship =
    title.toLowerCase().includes('intern')   ||
    title.toLowerCase().includes('trainee')  ||
    title.toLowerCase().includes('fresher')  ||
    title.toLowerCase().includes('graduate');

  return {
    external_id:     'cj-' + String(job.id),
    title:           title,
    company:         companyName,
    role:            title,
    job_type:        isInternship ? 'internship' : 'job',
    employment_type: 'any',
    description:     description,
    branch_hint:     deriveBranches(title, description),
    skills_hint:     deriveSkills(title, description),
    domain:          deriveDomain(title, description),
    location:        job.location || 'India',
    is_remote:       (job.location || '').toLowerCase().includes('remote'),
    country:         'India',
    salary_min:      null,
    salary_max:      null,
    salary_period:   'yearly',
    apply_url:       job.link || '',
    posted_at:       job.updated ? new Date(job.updated) : new Date(),
    deadline:        null,
  };
};

const syncCompanyJobs = async () => {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) {
    console.log('[sync:companyjobs] Skipping — no JOOBLE_API_KEY');
    return;
  }

  console.log('[sync:companyjobs] Fetching for ' + COMPANY_SEARCHES.length + ' companies...');
  let total = 0;

  for (const company of COMPANY_SEARCHES) {
    try {
      const response = await fetch('https://jooble.org/api/' + apiKey, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          keywords:     company.query,
          location:     'India',
          ResultOnPage: 15,
          page:         1,
        }),
      });

      if (!response.ok) {
        console.error('[sync:companyjobs] HTTP ' + response.status + ' for ' + company.name);
        continue;
      }

      const data    = await response.json();
      const rawJobs = (data.jobs || []).filter((j) => j.id && j.link);

      if (rawJobs.length === 0) {
        console.log('[sync:companyjobs] No results for: ' + company.name);
        continue;
      }

      // Force the company name to match exactly so filter works correctly
      const normalized = rawJobs.map((j) => normalizeCompanyJob(j, company.name));
      await upsertJobs('jooble', normalized);
      total += normalized.length;

      console.log('[sync:companyjobs] ' + company.name + ' → ' + normalized.length + ' jobs');

      await new Promise((res) => setTimeout(res, 600));
    } catch (err) {
      console.error('[sync:companyjobs] Failed for ' + company.name + ':', err.message);
    }
  }

  console.log('[sync:companyjobs] Done. Total: ' + total);
};

module.exports = { syncCompanyJobs };