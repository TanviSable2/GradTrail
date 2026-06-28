import { useState } from 'react'
import { X, Sparkles, Loader, Copy, CheckCircle, Upload, AlertTriangle, Wand2 } from 'lucide-react'

async function extractTextFromFile(file) {
  return new Promise((resolve) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          if (!window.pdfjsLib) {
            await new Promise((res, rej) => {
              const script = document.createElement('script')
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
              script.onload = res; script.onerror = rej
              document.head.appendChild(script)
            })
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          }
          const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise
          let text = ''
          for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            text += content.items.map((item) => item.str).join(' ') + '\n'
          }
          resolve(text.trim())
        } catch { resolve('') }
      }
      reader.onerror = () => resolve('')
      reader.readAsArrayBuffer(file)
    } else {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result || '')
      reader.onerror = () => resolve('')
      reader.readAsText(file)
    }
  })
}

const ROLE_BULLETS = {
  electrical: [
    'Designed and simulated electrical circuits using AutoCAD Electrical / MATLAB, ensuring compliance with IEC standards',
    'Worked on PLC programming and SCADA systems for industrial automation projects',
    'Conducted load flow analysis and fault calculations for power distribution systems',
    'Performed testing and commissioning of switchgear, transformers, and protection relays',
  ],
  mechanical: [
    'Designed mechanical components using SolidWorks/AutoCAD and validated with FEA simulation in ANSYS',
    'Worked on CNC machining, GD&T, and manufacturing process optimization reducing cycle time by 20%',
    'Conducted thermal analysis and stress simulations for product design validation',
    'Applied lean manufacturing principles and 5S methodology in production environment',
  ],
  civil: [
    'Designed structural elements (beams, slabs, columns) using STAAD Pro and IS code standards',
    'Prepared detailed engineering drawings and BOQ for residential/commercial construction projects',
    'Supervised site execution and quality control ensuring adherence to IRC/IS specifications',
    'Used AutoCAD and Revit for 2D/3D drafting and BIM-based project coordination',
  ],
  frontend: [
    'Built responsive React.js web applications with reusable component architecture, improving load time by 30%',
    'Implemented state management using Redux/Context API and integrated REST APIs with Axios',
    'Ensured cross-browser compatibility and mobile responsiveness using CSS Flexbox/Grid and media queries',
    'Collaborated with UI/UX designers to implement pixel-perfect designs from Figma mockups',
  ],
  backend: [
    'Developed RESTful APIs using Node.js/Express with JWT authentication serving 1000+ daily requests',
    'Optimized PostgreSQL queries reducing average response time from 800ms to 120ms',
    'Implemented input validation, error handling middleware, and rate limiting for production APIs',
    'Containerized applications using Docker and deployed on AWS EC2 with CI/CD pipeline',
  ],
  'full stack': [
    'Built full-stack web application using MERN stack with JWT auth, deployed on AWS',
    'Designed normalized PostgreSQL schema and wrote complex queries for data aggregation',
    'Implemented real-time features using WebSockets and optimized API response caching with Redis',
    'Set up CI/CD pipeline using GitHub Actions for automated testing and deployment',
  ],
  'ai/ml': [
    'Built and trained machine learning models (classification/regression) achieving 92% accuracy on test data',
    'Implemented NLP pipeline for text classification using Python, scikit-learn, and HuggingFace transformers',
    'Developed data preprocessing pipeline using Pandas and NumPy for large dataset handling',
    'Deployed ML model as REST API using FastAPI and containerized with Docker',
  ],
  'data science': [
    'Performed exploratory data analysis on datasets with 500K+ records using Python, Pandas, and Matplotlib',
    'Built predictive models using scikit-learn; achieved 15% improvement in forecast accuracy',
    'Created interactive dashboards in Tableau/Power BI for business KPI monitoring',
    'Wrote complex SQL queries for data extraction and transformation from relational databases',
  ],
  management: [
    'Led cross-functional team of 5 members to deliver project 2 weeks ahead of schedule',
    'Managed project scope, timeline and budget using Agile/Scrum methodology with weekly sprints',
    'Prepared detailed project reports, risk assessments and status updates for senior stakeholders',
    'Coordinated between technical and business teams to ensure clear communication and alignment',
  ],
  default: [
    'Delivered project milestones on time while maintaining quality standards and documentation',
    'Collaborated effectively in team environment contributing to code reviews and knowledge sharing',
    'Proactively identified and resolved technical issues, reducing downtime and improving reliability',
  ],
}

function getDomainBullets(job) {
  const domain = (job.domain || '').toLowerCase()
  const title = (job.title || '').toLowerCase()
  if (domain.includes('electrical') || title.includes('electrical')) return ROLE_BULLETS.electrical
  if (domain.includes('mechanical') || title.includes('mechanical')) return ROLE_BULLETS.mechanical
  if (domain.includes('civil') || title.includes('civil') || title.includes('structural')) return ROLE_BULLETS.civil
  if (domain.includes('frontend') || title.includes('frontend') || title.includes('front-end')) return ROLE_BULLETS.frontend
  if (domain.includes('backend') || title.includes('backend') || title.includes('back-end')) return ROLE_BULLETS.backend
  if (domain.includes('full stack') || domain.includes('fullstack') || title.includes('full stack')) return ROLE_BULLETS['full stack']
  if (domain.includes('ai') || domain.includes('ml') || title.includes('machine learning')) return ROLE_BULLETS['ai/ml']
  if (domain.includes('data science') || title.includes('data scientist') || title.includes('data analyst')) return ROLE_BULLETS['data science']
  if (domain.includes('management') || title.includes('manager') || title.includes('consultant')) return ROLE_BULLETS.management
  return ROLE_BULLETS.default
}

const DOMAIN_SKILL_SETS = {
  electrical: ['plc', 'scada', 'autocad', 'matlab', 'power systems', 'switchgear', 'transformer', 'relay', 'vlsi', 'embedded', 'microcontroller', 'arduino', 'circuit', 'electrical', 'excel', 'instrumentation'],
  mechanical: ['solidworks', 'autocad', 'ansys', 'catia', 'creo', 'matlab', 'cad', 'cam', 'manufacturing', 'six sigma', 'lean', 'hvac', 'thermal', 'fluid', 'finite element'],
  civil: ['autocad', 'staad', 'revit', 'etabs', 'primavera', 'ms project', 'survey', 'concrete', 'steel', 'gis', 'bim'],
  frontend: ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'webpack', 'figma', 'next.js', 'tailwind', 'redux'],
  backend: ['node.js', 'python', 'java', 'spring', 'django', 'flask', 'express', 'postgresql', 'mysql', 'mongodb', 'redis', 'docker', 'aws', 'rest api', 'graphql'],
  'ai/ml': ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'nlp', 'computer vision', 'deep learning', 'ml', 'jupyter', 'keras'],
  'data science': ['python', 'r', 'sql', 'tableau', 'power bi', 'pandas', 'statistics', 'excel', 'spark', 'hadoop', 'matplotlib'],
}

function normalizeSkill(s) {
  return s.toLowerCase().replace(/[\.\s\-]/g, '')
}

const SKILL_ALIASES = {
  'nodejs':     ['node', 'node.js', 'nodejs', 'node js'],
  'reactjs':    ['react', 'react.js', 'reactjs', 'react native'],
  'expressjs':  ['express', 'express.js', 'expressjs'],
  'nextjs':     ['next', 'next.js', 'nextjs'],
  'vuejs':      ['vue', 'vue.js', 'vuejs'],
  'restapi':    ['rest', 'rest api', 'restful', 'restful api', 'api'],
  'postgresql': ['postgres', 'postgresql', 'psql'],
  'javascript': ['js', 'javascript', 'ecmascript'],
  'typescript': ['ts', 'typescript'],
  'cicd':       ['ci/cd', 'cicd', 'ci cd', 'continuous integration'],
}

function skillInResume(skill, resumeLower) {
  const skillNorm = normalizeSkill(skill)
  const resumeNorm = resumeLower.replace(/[\.\s\-]/g, '')
  if (resumeLower.includes(skill.toLowerCase()) || resumeNorm.includes(skillNorm)) return true
  for (const variants of Object.values(SKILL_ALIASES)) {
    const skillMatchesGroup = variants.some(v => normalizeSkill(v) === skillNorm || skill.toLowerCase() === v)
    if (skillMatchesGroup) {
      const found = variants.some(v => resumeLower.includes(v) || resumeNorm.includes(normalizeSkill(v)))
      if (found) return true
    }
  }
  return false
}

function analyzeResume(resumeText, job) {
  const lower = resumeText.toLowerCase()
  const jobTitle = (job.title || '').toLowerCase()
  const jobDomain = (job.domain || '').toLowerCase()

  let domainKey = 'default'
  if (jobDomain.includes('electrical') || jobTitle.includes('electrical')) domainKey = 'electrical'
  else if (jobDomain.includes('mechanical') || jobTitle.includes('mechanical')) domainKey = 'mechanical'
  else if (jobDomain.includes('civil') || jobTitle.includes('civil')) domainKey = 'civil'
  else if (jobDomain.includes('frontend') || jobTitle.includes('frontend')) domainKey = 'frontend'
  else if (
    jobDomain.includes('backend') || jobTitle.includes('backend') ||
    jobTitle.includes('java backend') || jobTitle.includes('drupal') ||
    jobTitle.includes('python developer') || jobTitle.includes('node')
  ) domainKey = 'backend'
  else if (jobDomain.includes('full stack') || jobTitle.includes('full stack') || jobTitle.includes('fullstack')) domainKey = 'full stack'
  else if (jobDomain.includes('ai') || jobDomain.includes('ml') || jobTitle.includes('machine learning')) domainKey = 'ai/ml'
  else if (jobDomain.includes('data science') || jobTitle.includes('data scientist') || jobTitle.includes('data analyst')) domainKey = 'data science'

  const jobSkills = (job.skills_hint || []).map(s => s.toLowerCase())
  const domainSkills = DOMAIN_SKILL_SETS[domainKey] || []
  const allRelevantSkills = [...new Set([...jobSkills, ...domainSkills])]

  const matchedSkills = allRelevantSkills.filter(s => skillInResume(s, lower))
  const missingFromJob = jobSkills.filter(s => !skillInResume(s, lower))
  const jobSkillsFound = jobSkills.filter(s => skillInResume(s, lower)).length
  const relevantFound = domainSkills.filter(s => skillInResume(s, lower)).length

  let score = 10
  if (jobSkills.length > 0) {
    score = Math.round((jobSkillsFound / jobSkills.length) * 60) + 10
  } else {
    score = Math.min(Math.round((relevantFound / Math.max(domainSkills.length, 1)) * 70) + 10, 75)
  }
  score = Math.min(Math.max(score, 5), 90)

  const isWrongDomain = (
    (domainKey === 'electrical' && !lower.match(/electrical|circuit|power|plc|scada|voltage|current|motor|relay|transformer|switchgear/)) ||
    (domainKey === 'mechanical' && !lower.match(/mechanical|cad|manufacturing|design|thermal|fluid|material|machine/)) ||
    (domainKey === 'civil'      && !lower.match(/civil|structure|concrete|construction|survey|bridge|road|building/))
  )
  if (isWrongDomain) score = Math.max(score - 20, 5)

  const missing = missingFromJob.length > 0
    ? missingFromJob.slice(0, 5).map(s => s.charAt(0).toUpperCase() + s.slice(1))
    : domainSkills.filter(s => !skillInResume(s, lower)).slice(0, 4).map(s => s.charAt(0).toUpperCase() + s.slice(1))

  const keywordsMap = {
    electrical:     ['Power Systems', 'PLC Programming', 'Electrical Design', 'Circuit Analysis', 'IEC Standards'],
    mechanical:     ['CAD/CAM', 'FEA Analysis', 'GD&T', 'Manufacturing Process', 'Quality Control'],
    civil:          ['Structural Analysis', 'IS Code', 'Site Management', 'BIM', 'AutoCAD Civil'],
    frontend:       ['Component Architecture', 'Responsive Design', 'REST API Integration', 'Performance Optimization', 'Cross-browser'],
    backend:        ['RESTful API', 'Database Optimization', 'Authentication', 'Microservices', 'CI/CD'],
    'full stack':   ['MERN/MEAN Stack', 'API Design', 'Database Schema', 'Deployment', 'Authentication'],
    'ai/ml':        ['Model Training', 'Feature Engineering', 'Model Deployment', 'Data Pipeline', 'ML Metrics'],
    'data science': ['Statistical Analysis', 'Data Visualization', 'SQL Queries', 'Business Intelligence', 'ETL'],
    default:        ['Problem Solving', 'Team Collaboration', 'Documentation', 'Testing', 'Version Control'],
  }

  const bullets = getDomainBullets(job).slice(0, 3)

  const summaryMap = {
    electrical:     `Electrical engineering graduate with hands-on experience in ${matchedSkills.slice(0,2).join(' and ') || 'power systems and circuit design'}, seeking ${job.title} role at ${job.company} to apply technical expertise in industrial applications.`,
    mechanical:     `Mechanical engineer with proficiency in ${matchedSkills.slice(0,2).join(' and ') || 'CAD design and manufacturing'}, targeting ${job.title} at ${job.company} to contribute to product development and engineering excellence.`,
    civil:          `Civil engineering graduate skilled in ${matchedSkills.slice(0,2).join(' and ') || 'structural design and project execution'}, seeking ${job.title} at ${job.company} to deliver quality infrastructure solutions.`,
    frontend:       `Frontend developer with experience in ${matchedSkills.slice(0,2).join(' and ') || 'React and JavaScript'}, applying for ${job.title} at ${job.company} to build high-performance, user-friendly web interfaces.`,
    backend:        `Backend developer proficient in ${matchedSkills.slice(0,2).join(' and ') || 'Node.js and databases'}, seeking ${job.title} at ${job.company} to build scalable and reliable server-side systems.`,
    'full stack':   `Full-stack developer experienced in ${matchedSkills.slice(0,2).join(' and ') || 'MERN stack'}, applying for ${job.title} at ${job.company} to build end-to-end web applications.`,
    'ai/ml':        `ML engineer with hands-on experience in ${matchedSkills.slice(0,2).join(' and ') || 'Python and ML frameworks'}, seeking ${job.title} at ${job.company} to build intelligent systems.`,
    'data science': `Data professional skilled in ${matchedSkills.slice(0,2).join(' and ') || 'Python and SQL'}, applying for ${job.title} at ${job.company} to drive data-informed decisions.`,
    default:        `Motivated engineering graduate with skills in ${matchedSkills.slice(0,2).join(' and ') || 'software development'}, applying for ${job.title} at ${job.company} to contribute to impactful technical projects.`,
  }

  const tipsMap = {
    electrical: [
      `This role requires ${jobTitle.includes('senior') ? 'senior-level' : ''} electrical engineering knowledge — highlight any coursework or lab projects involving ${missingFromJob[0] || 'power systems or circuit design'}`,
      missing.length > 0 ? `You are missing: ${missing.slice(0,3).join(', ')} — add relevant coursework, certifications, or personal projects` : `Good skill alignment — quantify your experience (e.g., "designed circuit handling 5kV load")`,
      `For ${job.company || 'this company'}, look up their domain (oil/gas, manufacturing, utilities) and mention relevant knowledge in your cover letter`,
    ],
    mechanical: [
      `Highlight specific software tools: ${missing.slice(0,2).join(', ') || 'SolidWorks, ANSYS'} — mention project where used`,
      `Quantify your design work: components designed, tolerance specs, weight reduction, or cost savings achieved`,
      `${job.company || 'This company'} likely values manufacturing knowledge — mention any internship or lab work with real equipment`,
    ],
    backend: [
      `Highlight specific backend technologies: ${missing.slice(0,2).join(', ') || 'databases, API design'} — show actual project links`,
      jobSkillsFound < 2 ? `Resume shows ${jobSkillsFound} of ${jobSkills.length} required skills. Add projects using: ${missing.slice(0,3).join(', ')}` : `Good skill match — ensure each skill appears in a project bullet with a concrete outcome, not just listed`,
      `For ${job.title} roles, interviewers test DSA + system design. Mention LeetCode/HackerRank profile and any system design projects`,
    ],
    'full stack': [
      `Your MERN/full-stack experience is relevant — ensure each project has a live demo link or GitHub repo`,
      missing.length > 0 ? `Add these to at least one project: ${missing.slice(0,3).join(', ')}` : `Strong match — quantify user count, API calls, or performance metrics in each project`,
      `For ${job.company}, research their tech stack and mirror that terminology in your resume`,
    ],
    default: [
      missing.length > 0 ? `Your resume is missing: ${missing.join(', ')} — these are specifically mentioned in the job description` : `Your skills align well — make sure each skill appears in a project description with measurable impact`,
      `Research ${job.company || 'this company'}'s recent projects or products and mention alignment in your cover letter`,
      `Quantify achievements: instead of "worked on project", say "built X that achieved Y result"`,
    ],
  }

  return {
    match_score:         score,
    matched_skills:      matchedSkills.slice(0, 6).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    missing_keywords:    missing,
    suggested_summary:   summaryMap[domainKey] || summaryMap.default,
    bullets_to_add:      bullets,
    keywords_to_include: (keywordsMap[domainKey] || keywordsMap.default).slice(0, 5),
    tips:                tipsMap[domainKey] || tipsMap.default,
    verdict: score >= 65
      ? `Your background is relevant for this ${domainKey} role — address the missing skills.`
      : isWrongDomain
      ? `Your resume appears to be from a different engineering domain. This role requires ${domainKey} experience.`
      : `You match ${jobSkillsFound} of ${jobSkills.length} required skills. Focus on building the missing ones.`,
  }
}

function ScoreRing({ score }) {
  const s = Number(score) || 0
  const color = s >= 65 ? '#10b981' : s >= 40 ? '#f59e0b' : '#ef4444'
  const r = 32; const circ = 2 * Math.PI * r
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{ position: 'relative', width: 76, height: 76 }}>
        <svg width="76" height="76" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - s / 100)} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color }}>{s}%</span>
        </div>
      </div>
      <span style={{ fontSize: 10, color: '#6b7280' }}>Match Score</span>
    </div>
  )
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setDone(true); setTimeout(() => setDone(false), 2000) }}
      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: done ? '#10b981' : '#9ca3af', cursor: 'pointer', fontSize: 11 }}>
      {done ? <CheckCircle size={11} /> : <Copy size={11} />} {done ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function ResumeTailorModal({ open, onClose, job }) {
  const [step, setStep] = useState('input')
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Max 5MB'); return }
    setFileName(file.name); setError(''); setLoading(true)
    const text = await extractTextFromFile(file)
    if (!text || text.length < 30) {
      setError('Could not read this file. Please paste your resume text directly.')
      setLoading(false); return
    }
    setResumeText(text.slice(0, 5000))
    setLoading(false)
  }

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 50) { setError('Please paste your resume text or upload a file.'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 250)) // small delay for UX feedback only
    const r = analyzeResume(resumeText, job)
    setResult(r)
    setStep('result')
    setLoading(false)
  }

  const reset = () => { setStep('input'); setResult(null); setResumeText(''); setFileName(''); setError('') }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 560, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 22px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Wand2 size={16} color="#a78bfa" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Resume Tailor</h2>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280' }}>{job.title} at {job.company}</p>
            <p style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>Domain: {job.domain || 'General'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8 }}><X size={17} /></button>
        </div>

        <div style={{ padding: '0 22px 22px' }}>
          {step === 'input' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {job.skills_hint?.length > 0 && (
                <div style={{ padding: 12, background: 'rgba(59,130,246,0.06)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.15)' }}>
                  <p style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600, marginBottom: 6 }}>THIS JOB REQUIRES</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {job.skills_hint.map((s) => (
                      <span key={s} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(59,130,246,0.15)', borderRadius: 99, color: '#93c5fd' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {!job.skills_hint?.length && job.domain && (
                <div style={{ padding: 12, background: 'rgba(59,130,246,0.06)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.15)' }}>
                  <p style={{ fontSize: 11, color: '#6b7280' }}>
                    This is a <strong style={{ color: '#93c5fd' }}>{job.domain}</strong> role. Analysis will check for relevant {job.domain} skills in your resume.
                  </p>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                    Your Resume {fileName && <span style={{ color: '#34d399', marginLeft: 8 }}>✓ {fileName}</span>}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#60a5fa', cursor: 'pointer', padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.07)' }}>
                    <Upload size={11} /> Upload
                    <input type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFile} />
                  </label>
                </div>
                <textarea rows={9} value={resumeText} onChange={(e) => { setResumeText(e.target.value); setFileName('') }}
                  placeholder={`Paste your complete resume here.\n\nInclude:\n- Education (branch, college, CGPA)\n- Skills section\n- Projects with tech used\n- Work experience / internships\n\nThe more detail, the more accurate the analysis.`}
                  style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6, boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <p style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>{resumeText.length} chars · {resumeText.split(/\s+/).filter(Boolean).length} words</p>
              </div>

              {error && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 9 }}>
                  <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#fca5a5' }}>{error}</p>
                </div>
              )}

              <button onClick={handleAnalyze} disabled={loading || resumeText.trim().length < 50}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 11, border: 'none', background: resumeText.trim().length >= 50 ? 'linear-gradient(135deg,#7c3aed,#3b82f6)' : 'rgba(255,255,255,0.06)', color: resumeText.trim().length >= 50 ? 'white' : '#4b5563', cursor: resumeText.trim().length >= 50 ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
                {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Sparkles size={15} /> Analyze for This Job</>}
              </button>
            </div>
          )}

          {step === 'result' && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
                <ScoreRing score={result.match_score} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 5 }}>
                    {result.match_score >= 65 ? '✅ Strong match' : result.match_score >= 40 ? '⚠️ Partial match' : '❌ Weak match for this job'}
                  </p>
                  {result.verdict && <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{result.verdict}</p>}
                  {result.matched_skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: '#6b7280', marginRight: 2 }}>Found in resume:</span>
                      {result.matched_skills.map((s) => (
                        <span key={s} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(16,185,129,0.15)', borderRadius: 99, color: '#34d399' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {result.missing_keywords?.length > 0 && (
                <div className="glass-card" style={{ padding: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', marginBottom: 8 }}>MISSING SKILLS — add these to your resume</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.missing_keywords.map((k) => (
                      <span key={k} style={{ fontSize: 12, padding: '4px 10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 99, color: '#fbbf24' }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.suggested_summary && (
                <div className="glass-card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#d1d5db' }}>SUGGESTED SUMMARY FOR THIS JOB</p>
                    <CopyBtn text={result.suggested_summary} />
                  </div>
                  <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.7, fontStyle: 'italic' }}>"{result.suggested_summary}"</p>
                </div>
              )}

              {result.bullets_to_add?.length > 0 && (
                <div className="glass-card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#d1d5db' }}>ROLE-SPECIFIC BULLET POINTS TO ADD</p>
                    <CopyBtn text={result.bullets_to_add.join('\n')} />
                  </div>
                  {result.bullets_to_add.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < result.bullets_to_add.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <span style={{ color: '#60a5fa', flexShrink: 0 }}>•</span>
                      <p style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.6 }}>{b}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.keywords_to_include?.length > 0 && (
                <div className="glass-card" style={{ padding: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#d1d5db', marginBottom: 8 }}>KEYWORDS TO ADD TO YOUR RESUME</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.keywords_to_include.map((k) => (
                      <span key={k} style={{ fontSize: 12, padding: '4px 10px', background: 'rgba(59,130,246,0.12)', borderRadius: 99, color: '#93c5fd' }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.tips?.length > 0 && (
                <div className="glass-card" style={{ padding: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#d1d5db', marginBottom: 10 }}>HOW TO IMPROVE FOR THIS APPLICATION</p>
                  {result.tips.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < result.tips.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{i + 1}.</span>
                      <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>{t}</p>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={reset}
                style={{ padding: '9px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}>
                ← Try with different resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}