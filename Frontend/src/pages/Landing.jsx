import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, Briefcase, BarChart2, Bell, BookOpen, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const features = [
  { icon: Briefcase, title: 'Smart Job Matching', desc: 'AI-powered matching based on your branch and skills profile.' },
  { icon: BarChart2, title: 'Career Insights', desc: 'Track skill gaps, market demand and application analytics.' },
  { icon: Bell, title: 'Reminder System', desc: 'Never miss deadlines, interviews or closing applications.' },
  { icon: BookOpen, title: 'Courses & Certifications', desc: 'Discover courses that fill your skill gaps and boost your profile.' },
]
const stats = [{ value: '283+', label: 'Live Listings' }, { value: '18', label: 'Companies' }, { value: '5', label: 'Job Sources' }, { value: '100%', label: 'Free Platform' }]

const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, backdropFilter: 'blur(12px)' }

export default function Landing() {
  const { dark, toggle } = useTheme()
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'Sora, sans-serif', overflowX: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.12), transparent 70%)', filter: 'blur(1px)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 500, height: 350, background: 'radial-gradient(ellipse, rgba(139,92,246,0.08), transparent 70%)' }} />
      </div>

      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#3b82f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={17} color="white" /></div>
          <span style={{ fontSize: 20, fontWeight: 700 }}>GradTrail</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggle} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex' }}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <Link to="/login" style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', color: '#d1d5db', textDecoration: 'none', fontSize: 14 }}>Login</Link>
          <Link to="/signup" style={{ padding: '8px 18px', borderRadius: 10, background: '#3b82f6', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Get Started</Link>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '60px 24px 40px', maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', fontSize: 12, fontWeight: 500, marginBottom: 22 }}>
            <Zap size={12} /> Built for engineering students
          </div>
          <h1 style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em' }}>
            Your Career,<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Accelerated</span>
          </h1>
          <p style={{ fontSize: 17, color: '#9ca3af', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Discover jobs, internships and courses personalized to your skills with AI-powered recommendations and reminders.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', borderRadius: 14, background: '#3b82f6', color: 'white', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>Start Free <ArrowRight size={16} /></Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 24px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', color: '#d1d5db', textDecoration: 'none', fontSize: 15 }}>Sign In</Link>
          </div>
        </motion.div>

        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 56 }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {stats.map(({ value, label }) => (
            <div key={label} style={{ ...card, padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 34, fontWeight: 800, color: '#60a5fa', marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>Everything You Need</h2>
          <p style={{ color: '#6b7280' }}>One platform for your complete career journey.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} style={card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={20} color="#60a5fa" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, maxWidth: 700, margin: '0 auto', padding: '20px 24px 60px' }}>
        <motion.div style={{ ...card, padding: 48, textAlign: 'center' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Ready to level up your career?</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Join GradTrail and discover opportunities tailored for you.</p>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', borderRadius: 14, background: '#3b82f6', color: 'white', textDecoration: 'none', fontWeight: 500 }}>Create Free Account <ArrowRight size={16} /></Link>
        </motion.div>
      </section>

      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px', textAlign: 'center', fontSize: 13, color: '#4b5563' }}>
        © {new Date().getFullYear()} GradTrail. All rights reserved.
      </footer>
    </div>
  )
}