const shimmer = {
  background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 10,
}

export function Skeleton({ style = {} }) {
  return <div style={{ ...shimmer, ...style }} />
}

export function CardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Skeleton style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton style={{ height: 14, width: '70%' }} />
          <Skeleton style={{ height: 12, width: '45%' }} />
        </div>
      </div>
      <Skeleton style={{ height: 11, width: '100%', marginBottom: 8 }} />
      <Skeleton style={{ height: 11, width: '80%', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton style={{ height: 22, width: 64, borderRadius: 99 }} />
        <Skeleton style={{ height: 22, width: 72, borderRadius: 99 }} />
      </div>
    </div>
  )
}