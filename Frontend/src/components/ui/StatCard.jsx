import { motion } from 'framer-motion'

const colors = {
  blue:   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  green:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
  amber:  { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  purple: { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa' },
  red:    { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
}

export default function StatCard({ label, value, icon: Icon, color = 'blue', delay = 0 }) {
  const c = colors[color] || colors.blue
  return (
    <motion.div
      className="glass-card"
      style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div>
        <p style={{ fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>{value}</p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{label}</p>
      </div>
    </motion.div>
  )
}