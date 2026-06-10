const variants = {
  default: { background: 'rgba(255,255,255,0.08)', color: '#9ca3af' },
  brand:   { background: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  green:   { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' },
  amber:   { background: 'rgba(245,158,11,0.15)', color: '#fcd34d' },
  red:     { background: 'rgba(239,68,68,0.15)', color: '#fca5a5' },
  purple:  { background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' },
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const s = variants[variant] || variants.default
  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 11, fontWeight: 500,
      ...s,
    }}>
      {children}
    </span>
  )
}