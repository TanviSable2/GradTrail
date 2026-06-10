import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

export default function ProfileCompleteness({ score = 0 }) {
  const color = score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : '#10b981'
  const msg = score < 40 ? 'Complete your profile to improve job matching.' : score < 70 ? 'Add skills and resume to increase visibility.' : 'Your profile is strong and recruiter-ready.'

  return (
    <div className="glass-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <ShieldCheck size={17} color={color} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#d1d5db' }}>Profile Strength</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
        <motion.div
          style={{ height: '100%', background: color, borderRadius: 99 }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{msg}</p>
    </div>
  )
}