import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, Plus, Trash2, Star, Clock, Users } from 'lucide-react'
import { jobsApi, certificationsApi } from '../services/api'
import { CardSkeleton } from '../components/ui/Skeleton'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

const PLATFORM_COURSES = [
  {
    id: 'c1', platform: 'Coursera', platform_color: '#0056D3',
    title: 'Google Data Analytics Professional Certificate',
    provider: 'Google', domain: 'Data Science', rating: 4.8, students: '1.2M',
    duration: '6 months', level: 'Beginner',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    skills: ['SQL', 'R', 'Tableau', 'Data Analysis'],
  },
  {
    id: 'c2', platform: 'Coursera', platform_color: '#0056D3',
    title: 'IBM Full Stack Software Developer',
    provider: 'IBM', domain: 'Full Stack', rating: 4.6, students: '300K',
    duration: '4 months', level: 'Beginner',
    url: 'https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer',
    skills: ['React', 'Node.js', 'Docker', 'Kubernetes'],
  },
  {
    id: 'c3', platform: 'Coursera', platform_color: '#0056D3',
    title: 'Machine Learning Specialization',
    provider: 'Stanford / DeepLearning.AI', domain: 'AI/ML', rating: 4.9, students: '800K',
    duration: '3 months', level: 'Intermediate',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    skills: ['Python', 'TensorFlow', 'ML Algorithms'],
  },
  {
    id: 'c4', platform: 'Coursera', platform_color: '#0056D3',
    title: 'AWS Cloud Solutions Architect',
    provider: 'Amazon Web Services', domain: 'DevOps/Cloud', rating: 4.7, students: '400K',
    duration: '4 months', level: 'Intermediate',
    url: 'https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect',
    skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3'],
  },
  {
    id: 'u1', platform: 'Udemy', platform_color: '#A435F0',
    title: 'The Complete Web Developer Bootcamp',
    provider: 'Dr. Angela Yu', domain: 'Full Stack', rating: 4.8, students: '800K',
    duration: '65 hours', level: 'Beginner',
    url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
  },
  {
    id: 'u2', platform: 'Udemy', platform_color: '#A435F0',
    title: 'Machine Learning A-Z: AI, Python & R',
    provider: 'Kirill Eremenko', domain: 'AI/ML', rating: 4.5, students: '900K',
    duration: '44 hours', level: 'Intermediate',
    url: 'https://www.udemy.com/course/machinelearning/',
    skills: ['Python', 'R', 'Machine Learning', 'Deep Learning'],
  },
  {
    id: 'u3', platform: 'Udemy', platform_color: '#A435F0',
    title: 'React - The Complete Guide',
    provider: 'Maximilian Schwarzmüller', domain: 'Frontend', rating: 4.7, students: '600K',
    duration: '48 hours', level: 'All Levels',
    url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
    skills: ['React', 'Redux', 'Next.js', 'TypeScript'],
  },
  {
    id: 'u4', platform: 'Udemy', platform_color: '#A435F0',
    title: 'Python Bootcamp: Zero to Hero',
    provider: 'Jose Portilla', domain: 'Backend', rating: 4.7, students: '1.5M',
    duration: '22 hours', level: 'Beginner',
    url: 'https://www.udemy.com/course/complete-python-bootcamp/',
    skills: ['Python', 'OOP', 'Data Structures'],
  },
  {
    id: 'f1', platform: 'Forage', platform_color: '#00B386',
    title: 'J.P. Morgan Software Engineering Virtual Experience',
    provider: 'J.P. Morgan', domain: 'Full Stack', rating: 4.6, students: '200K',
    duration: '5 hours', level: 'Beginner',
    url: 'https://www.theforage.com/simulations/jpmorgan/software-engineering-mngel',
    skills: ['Python', 'Financial Data', 'React'],
  },
  {
    id: 'f2', platform: 'Forage', platform_color: '#00B386',
    title: 'Goldman Sachs Software Engineering Program',
    provider: 'Goldman Sachs', domain: 'Backend', rating: 4.7, students: '150K',
    duration: '5 hours', level: 'Beginner',
    url: 'https://www.theforage.com/simulations/goldman-sachs/software-engineering-oloq',
    skills: ['Security', 'Password Hashing', 'OpenSSL'],
  },
  {
    id: 'f3', platform: 'Forage', platform_color: '#00B386',
    title: 'AWS Solutions Architecture Virtual Experience',
    provider: 'Amazon', domain: 'DevOps/Cloud', rating: 4.5, students: '120K',
    duration: '4 hours', level: 'Beginner',
    url: 'https://www.theforage.com/simulations/amazon/aws-solutions-architecture-k2g4',
    skills: ['AWS', 'Cloud Architecture', 'S3', 'Lambda'],
  },
  {
    id: 'fcc1', platform: 'freeCodeCamp', platform_color: '#0A0A23',
    title: 'Responsive Web Design Certification',
    provider: 'freeCodeCamp', domain: 'Frontend', rating: 4.8, students: '2M',
    duration: '300 hours', level: 'Beginner',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    skills: ['HTML', 'CSS', 'Flexbox', 'Grid'],
  },
  {
    id: 'fcc2', platform: 'freeCodeCamp', platform_color: '#0A0A23',
    title: 'JavaScript Algorithms & Data Structures',
    provider: 'freeCodeCamp', domain: 'Frontend', rating: 4.7, students: '1.5M',
    duration: '300 hours', level: 'Intermediate',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
    skills: ['JavaScript', 'Algorithms', 'Data Structures', 'OOP'],
  },
  {
    id: 'fcc3', platform: 'freeCodeCamp', platform_color: '#0A0A23',
    title: 'Data Analysis with Python',
    provider: 'freeCodeCamp', domain: 'Data Science', rating: 4.6, students: '500K',
    duration: '300 hours', level: 'Intermediate',
    url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/',
    skills: ['Python', 'NumPy', 'Pandas', 'Matplotlib'],
  },
  {
    id: 'np1', platform: 'NPTEL', platform_color: '#FF6B00',
    title: 'Data Structures and Algorithms Using Java',
    provider: 'IIT Kharagpur', domain: 'Backend', rating: 4.5, students: '300K',
    duration: '12 weeks', level: 'Intermediate',
    url: 'https://swayam.gov.in/nd1_noc20_cs47/preview',
    skills: ['Java', 'DSA', 'Problem Solving'],
  },
  {
    id: 'np2', platform: 'NPTEL', platform_color: '#FF6B00',
    title: 'Introduction to Machine Learning',
    provider: 'IIT Kharagpur', domain: 'AI/ML', rating: 4.6, students: '400K',
    duration: '8 weeks', level: 'Beginner',
    url: 'https://swayam.gov.in/nd1_noc20_cs69/preview',
    skills: ['Python', 'ML Basics', 'Regression', 'Classification'],
  },
]

const ALL_DOMAINS = ['All', 'Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Data Science', 'DevOps/Cloud']
const ALL_PLATFORMS = ['All', 'Coursera', 'Udemy', 'Forage', 'freeCodeCamp', 'NPTEL']

const inp = {
  width: '100%', background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  padding: '10px 14px', fontSize: 13, color: 'white',
  outline: 'none', fontFamily: 'Sora, sans-serif', marginTop: 6,
}
const lbl = { fontSize: 12, color: '#9ca3af', fontWeight: 500 }

function PlatformBadge({ platform, color }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: color + '22', color: color, border: `1px solid ${color}44` }}>
      {platform}
    </span>
  )
}

export default function Courses() {
  const [dbCourses, setDbCourses] = useState([])
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterDomain, setFilterDomain] = useState('All')
  const [filterPlatform, setFilterPlatform] = useState('All')
  const [form, setForm] = useState({ title: '', provider: '', completed_at: '', certificate_url: '', skills: '' })

  useEffect(() => {
    Promise.all([
      jobsApi.list({ job_type: 'course', limit: 50 }),
      certificationsApi.list(),
    ])
      .then(([c, cert]) => {
        const raw = c.data?.results || c.data || []
        setDbCourses(Array.isArray(raw) ? raw : [])
        const certRaw = cert.data || []
        setCerts(Array.isArray(certRaw) ? certRaw : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await certificationsApi.add({
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setCerts((p) => [res.data, ...p])
      setModalOpen(false)
      setForm({ title: '', provider: '', completed_at: '', certificate_url: '', skills: '' })
      toast.success('Certification added!')
    } catch { toast.error('Failed to add') }
  }

  const handleDelete = async (id) => {
    try {
      await certificationsApi.delete(id)
      setCerts((p) => p.filter((c) => c.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const filteredCurated = PLATFORM_COURSES.filter((c) => {
    if (filterDomain !== 'All' && c.domain !== filterDomain) return false
    if (filterPlatform !== 'All' && c.platform !== filterPlatform) return false
    return true
  })

  const filterPillStyle = (active) => ({
    padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s',
    background: active ? '#3b82f6' : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : '#9ca3af',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>Courses & Certifications</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Top courses from Coursera, Udemy, Forage, freeCodeCamp & NPTEL
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: '#3b82f6', border: 'none', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          <Plus size={15} /> Add My Certificate
        </button>
      </div>

      {certs.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', marginBottom: 12 }}>
            My Certifications ({certs.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {certs.map((cert, i) => (
              <motion.div
                key={cert.id} className="glass-card"
                style={{ padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div style={{ width: 38, height: 38, background: 'rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={17} color="#60a5fa" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.title}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{cert.provider}</p>
                  {cert.certificate_url && (
                    <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      View Certificate <ExternalLink size={10} />
                    </a>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(cert.skills || []).slice(0, 3).map((s) => <Badge key={s}>{String(s)}</Badge>)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cert.id)}
                  style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>
            Curated Courses ({filteredCurated.length})
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Platform</p>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {ALL_PLATFORMS.map((p) => (
              <button key={p} style={filterPillStyle(filterPlatform === p)} onClick={() => setFilterPlatform(p)}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Domain</p>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {ALL_DOMAINS.map((d) => (
              <button key={d} style={filterPillStyle(filterDomain === d)} onClick={() => setFilterDomain(d)}>{d}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {filteredCurated.map((course, i) => (
            <motion.div
              key={course.id} className="glass-card"
              style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <PlatformBadge platform={course.platform} color={course.platform_color} />
                <Badge variant="brand">{course.domain}</Badge>
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', lineHeight: 1.4, marginBottom: 4 }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: 12, color: '#6b7280' }}>{course.provider}</p>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={11} color="#fbbf24" fill="#fbbf24" /> {course.rating}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={11} /> {course.students}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {course.duration}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {course.skills.slice(0, 3).map((s) => <Badge key={s}>{s}</Badge>)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: '#6b7280', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6 }}>
                  {course.level}
                </span>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: '#60a5fa', textDecoration: 'none' }}
                >
                  Enroll Free <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCurated.length === 0 && (
          <div className="glass-card" style={{ padding: 50, textAlign: 'center' }}>
            <BookOpen size={28} color="#374151" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#6b7280' }}>No courses found for selected filters</p>
          </div>
        )}
      </div>

      {dbCourses.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', marginBottom: 12 }}>From Our Database</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {loading ? Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />) :
              dbCourses.map((course, i) => (
                <motion.div
                  key={course.id} className="glass-card"
                  style={{ padding: 18 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
                      {course.company?.slice(0, 2) || 'CO'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</p>
                      <p style={{ fontSize: 11, color: '#6b7280' }}>{course.company}</p>
                    </div>
                  </div>
                  {course.domain && <div style={{ marginBottom: 10 }}><Badge variant="brand">{course.domain}</Badge></div>}
                  {course.apply_url && (
                    <a href={course.apply_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: '#60a5fa', textDecoration: 'none' }}>
                      Start Course <ExternalLink size={12} />
                    </a>
                  )}
                </motion.div>
              ))
            }
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add My Certification">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Certificate Title *</label>
            <input style={inp} placeholder="AWS Cloud Practitioner" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div>
            <label style={lbl}>Platform / Provider *</label>
            <input style={inp} placeholder="Coursera, Udemy, LinkedIn..." value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} required
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div>
            <label style={lbl}>Completion Date</label>
            <input type="date" style={inp} value={form.completed_at} onChange={(e) => setForm({ ...form, completed_at: e.target.value })} />
          </div>
          <div>
            <label style={lbl}>Certificate URL (from Coursera / Udemy etc.)</label>
            <input style={inp} placeholder="https://coursera.org/verify/..." value={form.certificate_url} onChange={(e) => setForm({ ...form, certificate_url: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div>
            <label style={lbl}>Skills Learned (comma separated)</label>
            <input style={inp} placeholder="React, Node.js, AWS" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: 10, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
            💡 Tip: Add your official certificate URL from Coursera, Udemy or LinkedIn so employers can verify it.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 14 }}>
              Cancel
            </button>
            <button type="submit" style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 500, fontFamily: 'Sora, sans-serif', fontSize: 14 }}>
              Add Certificate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}