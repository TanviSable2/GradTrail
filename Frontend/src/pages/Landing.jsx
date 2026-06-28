import { Link } from 'react-router-dom'

// Custom SVG logo — graduation cap with a trail line
function GradTrailLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <polygon points="16,5 30,12 16,19 2,12" fill="#3b82f6" />
      <path d="M24 15.5 L24 22 Q16 26 8 22 L8 15.5" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="12" r="1.4" fill="#fbbf24" />
      <line x1="30" y1="13.4" x2="30" y2="19" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'Sora, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <GradTrailLogo size={28} />
          <span style={{ fontSize: 18, fontWeight: 700 }}>GradTrail</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', color: '#d1d5db', textDecoration: 'none', fontSize: 14 }}>
            Login
          </Link>
          <Link to="/signup" style={{ padding: '8px 20px', borderRadius: 8, background: '#3b82f6', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px' }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, maxWidth: 700 }}>
          Jobs, Internships & Courses —{' '}
          <span style={{ color: '#3b82f6' }}>all in one place</span>
        </h1>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, lineHeight: 1.7, marginBottom: 36 }}>
          GradTrail aggregates opportunities from across the web so engineering students never miss a deadline. Set reminders, tailor your resume, and track applications.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup" style={{ padding: '13px 30px', borderRadius: 10, background: '#3b82f6', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
            Get Started — Free
          </Link>
          <Link to="/login" style={{ padding: '13px 30px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', color: '#d1d5db', textDecoration: 'none', fontSize: 15 }}>
            Sign In
          </Link>
        </div>

        {/* Simple stats */}
        <div style={{ display: 'flex', gap: 40, marginTop: 60, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['Jobs & Internships', 'Aggregated daily'], ['Email Reminders', 'Before deadlines'], ['AI Resume Tailor', 'Per job description'], ['Free to Use', 'Always']].map(([title, sub]) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ padding: '20px 40px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <GradTrailLogo size={18} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>GradTrail</span>
        </div>
        <p style={{ fontSize: 12, color: '#374151' }}>© {new Date().getFullYear()} GradTrail · Built with React, Node.js, PostgreSQL</p>
      </footer>
    </div>
  )
}