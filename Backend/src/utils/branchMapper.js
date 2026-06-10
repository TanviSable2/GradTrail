const BRANCH_KEYWORDS = {
  CSE: [
    'software', 'developer', 'engineer', 'programming', 'coding', 'backend',
    'frontend', 'fullstack', 'full stack', 'web', 'mobile', 'android', 'ios',
    'devops', 'cloud', 'data science', 'machine learning', 'ai ', 'artificial intelligence',
    'python', 'javascript', 'java ', 'node', 'react', 'angular', 'flutter',
    'database', 'sql', 'mongodb', 'cybersecurity', 'network security',
    'computer science', 'it ', 'information technology', 'sde', 'swe',
  ],
  ENTC: [
    'electronics', 'embedded', 'vlsi', 'circuit', 'iot', 'firmware',
    'hardware', 'semiconductor', 'pcb', 'microcontroller', 'arduino',
    'raspberry', 'signal processing', 'rf engineer', 'telecom',
    'communication engineer', 'entc', 'ece ',
  ],
  MECH: [
    'mechanical', 'automobile', 'automotive', 'manufacturing', 'production',
    'cad', 'cam', 'solidworks', 'autocad', 'ansys', 'simulation',
    'design engineer', 'product design', 'hvac', 'thermal', 'turbine',
    'robotics', 'mechatronics', 'quality control', 'six sigma',
  ],
  CIVIL: [
    'civil', 'structural', 'construction', 'architecture', 'architect',
    'site engineer', 'surveyor', 'autocad civil', 'staad', 'revit',
    'project management', 'infrastructure', 'highway', 'bridge',
    'geotechnical', 'environmental engineer',
  ],
  EE: [
    'electrical', 'power systems', 'switchgear', 'transformer', 'plc',
    'scada', 'instrumentation', 'control systems', 'automation engineer',
    'electrical design', 'relay', 'substation',
  ],
  DS: [
    'data analyst', 'data engineer', 'data scientist', 'analytics',
    'business intelligence', 'bi developer', 'tableau', 'power bi',
    'statistics', 'r programming', 'excel analyst', 'etl',
  ],
};

// Domain = specific role category (used for frontend filter buttons)
const DOMAIN_KEYWORDS = {
  'Frontend': [
    'frontend', 'front-end', 'front end', 'react', 'angular', 'vue',
    'ui developer', 'ux developer', 'html', 'css', 'javascript developer',
    'typescript', 'next.js', 'gatsby', 'web designer',
  ],
  'Backend': [
    'backend', 'back-end', 'back end', 'node.js', 'nodejs', 'django',
    'flask', 'spring boot', 'express', 'fastapi', 'laravel', 'php developer',
    'java developer', 'python developer', 'api developer', 'server side',
    'golang', 'ruby on rails', 'dotnet', '.net developer',
  ],
  'Full Stack': [
    'fullstack', 'full stack', 'full-stack', 'mern', 'mean', 'lamp',
    'end to end', 'end-to-end',
  ],
  'AI / ML': [
    'machine learning', 'deep learning', 'artificial intelligence', 'ai engineer',
    'ml engineer', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
    'data scientist', 'research engineer', 'llm', 'generative ai',
    'neural network', 'model training',
  ],
  'Data Science': [
    'data analyst', 'data science', 'data engineer', 'business analyst',
    'analytics engineer', 'bi developer', 'tableau', 'power bi',
    'sql analyst', 'etl developer', 'data warehouse',
  ],
  'DevOps / Cloud': [
    'devops', 'cloud engineer', 'site reliability', 'sre', 'platform engineer',
    'aws', 'azure engineer', 'gcp', 'kubernetes', 'docker', 'terraform',
    'ci/cd', 'infrastructure engineer', 'devsecops',
  ],
  'Mobile': [
    'android', 'ios developer', 'flutter', 'react native', 'mobile developer',
    'swift', 'kotlin', 'mobile app', 'cross platform',
  ],
  'Cybersecurity': [
    'cybersecurity', 'security engineer', 'penetration testing', 'ethical hacking',
    'soc analyst', 'threat analyst', 'vulnerability', 'network security',
    'information security', 'appsec',
  ],
  'Embedded / IoT': [
    'embedded', 'iot', 'firmware', 'rtos', 'microcontroller', 'arduino',
    'raspberry pi', 'embedded c', 'vlsi', 'fpga', 'pcb design',
  ],
  'Mechanical': [
    'mechanical engineer', 'design engineer', 'cad engineer', 'solidworks',
    'autocad', 'ansys', 'product design', 'manufacturing engineer',
    'automotive engineer', 'hvac engineer',
  ],
  'Civil / Structural': [
    'civil engineer', 'structural engineer', 'site engineer', 'construction',
    'revit', 'staad', 'bim', 'surveyor', 'geotechnical',
  ],
  'Electrical': [
    'electrical engineer', 'power engineer', 'plc programmer', 'scada',
    'instrumentation engineer', 'control systems', 'switchgear',
  ],
  'UI/UX Design': [
    'ui/ux', 'ux designer', 'ui designer', 'product designer', 'figma',
    'sketch', 'adobe xd', 'interaction design', 'user research',
    'visual designer', 'graphic designer',
  ],
  'Management': [
    'product manager', 'project manager', 'business development',
    'operations manager', 'program manager', 'scrum master', 'agile coach',
  ],
};

const deriveBranches = (title, description) => {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();
  const matched = [];

  for (const [branch, keywords] of Object.entries(BRANCH_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      if (!matched.includes(branch)) matched.push(branch);
    }
  }

  return matched.length > 0 ? matched : ['CSE'];
};

const deriveDomain = (title, description) => {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return domain;
    }
  }

  return 'Other';
};

const SKILL_KEYWORDS = [
  'python', 'javascript', 'java', 'c++', 'c#', 'typescript', 'go', 'rust',
  'node.js', 'nodejs', 'react', 'angular', 'vue', 'django', 'flask', 'spring',
  'express', 'fastapi', 'postgresql', 'mysql', 'mongodb', 'redis', 'kafka',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'jenkins',
  'git', 'linux', 'rest api', 'graphql', 'machine learning', 'deep learning',
  'tensorflow', 'pytorch', 'sql', 'excel', 'tableau', 'power bi',
  'solidworks', 'autocad', 'matlab', 'arduino', 'embedded c', 'flutter',
  'kotlin', 'swift', 'figma', 'sketch',
];

const deriveSkills = (title, description) => {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();
  return SKILL_KEYWORDS.filter((skill) => text.includes(skill.toLowerCase()));
};

module.exports = { deriveBranches, deriveDomain, deriveSkills };