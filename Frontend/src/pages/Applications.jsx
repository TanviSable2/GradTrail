import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, ChevronDown, ExternalLink, Bell } from 'lucide-react'
import { applicationsApi } from '../services/api'
import Badge from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

const statusConfig = {
  not_applied: { label: 'Saved',     color: 'default' },
  applied:     { label: 'Applied',   color: 'brand'   },
  interview:   { label: 'Interview', color: 'amber'   },
  offer:       { label: 'Offer',     color: 'green'   },
  rejected:    { label: 'Rejected',  color: 'red'     },
}

export default function Applications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    applicationsApi.list()
      .then((r) => {
        const data = r.data
        if (Array.isArray(data)) {
          setApps(data)
        } else if (data && Array.isArray(data.data)) {
          setApps(data.data)
        } else if (data && Array.isArray(data.applications)) {
          setApps(data.applications)
        } else {
          setApps([])
        }
      })
      .catch(() => { toast.error('Failed to load'); setApps([]) })
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await applicationsApi.update(id, { status })
      setApps((p) => p.map((a) => a.id === id ? { ...a, status } : a))
      toast.success('Updated')
    } catch { toast.error('Failed') }
  }

  const toggleRemind = async (id, current) => {
    try {
      await applicationsApi.remind(id, { remind_me: !current, remind_days_before: 7 })
      setApps((p) => p.map((a) => a.id === id ? { ...a, remind_me: !current } : a))
      toast.success(!current ? 'Reminder on' : 'Reminder off')
    } catch { toast.error('Failed') }
  }

  const safeApps = Array.isArray(apps) ? apps : []

  const counts = safeApps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  const filtered = activeTab === 'all' ? safeApps : safeApps.filter((a) => a.status === activeTab)

  const tabStyle = (active) => ({
    padding: '7px 14px', borderRadius: 10, border: 'none',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    background: active ? '#3b82f6' : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : '#9ca3af', flexShrink: 0,
    transition: 'all 0.15s',
  })

  const inp = {
    width: '100%', background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
    padding: '10px 14px', fontSize: 13, color: 'white',
    outline: 'none', resize: 'none', fontFamily: 'Sora, sans-serif',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>Applications</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Track your job application pipeline</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>
        {Object.entries(statusConfig).map(([key, { label, color }]) => (
          <div
            key={key} className="glass-card"
            style={{ padding: '14px 16px', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => setActiveTab(key === activeTab ? 'all' : key)}
          >
            <p style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{counts[key] || 0}</p>
            <div style={{ marginTop: 6 }}><Badge variant={color}>{label}</Badge></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button style={tabStyle(activeTab === 'all')} onClick={() => setActiveTab('all')}>
          All ({safeApps.length})
        </button>
        {Object.entries(statusConfig).map(([key, { label }]) => (
          <button key={key} style={tabStyle(activeTab === key)} onClick={() => setActiveTab(key)}>
            {label} {counts[key] ? `(${counts[key]})` : '(0)'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map((app, i) => (
            <motion.div
              key={app.id} className="glass-card"
              style={{ overflow: 'hidden' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
                  {app.job?.company?.slice(0, 2)?.toUpperCase() || 'JB'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.job?.title || 'Job'}
                  </p>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>{app.job?.company}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <Badge variant={statusConfig[app.status]?.color || 'default'}>
                    {statusConfig[app.status]?.label || app.status}
                  </Badge>
                  {app.remind_me && <Bell size={14} color="#fbbf24" />}
                  <ChevronDown
                    size={15} color="#6b7280"
                    style={{ transform: expandedId === app.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </div>
              </div>

              {expandedId === app.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 18px' }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 6 }}>Status</label>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: 'white', outline: 'none', cursor: 'pointer' }}
                      >
                        {Object.entries(statusConfig).map(([v, { label }]) => (
                          <option key={v} value={v}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 6 }}>Reminder</label>
                      <button
                        onClick={() => toggleRemind(app.id, app.remind_me)}
                        style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: app.remind_me ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)', color: app.remind_me ? '#60a5fa' : '#9ca3af', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                      >
                        {app.remind_me ? '🔔 On' : 'Enable'}
                      </button>
                    </div>
                    {app.job?.apply_url && (
                      <div style={{ marginLeft: 'auto' }}>
                        <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 6 }}>Apply</label>
                        <a
                          href={app.job.apply_url}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', textDecoration: 'none', fontSize: 12 }}
                        >
                          Apply <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                  <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 6 }}>Notes</label>
                  <textarea
                    rows={3}
                    defaultValue={app.notes || ''}
                    placeholder="Add notes..."
                    style={inp}
                    onBlur={(e) => applicationsApi.update(app.id, { notes: e.target.value }).catch(() => {})}
                  />
                </motion.div>
              )}
            </motion.div>
          ))
        }
      </div>

      {!loading && filtered.length === 0 && (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <ClipboardList size={30} color="#374151" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280' }}>
            {activeTab === 'all' ? 'No applications yet. Start tracking jobs!' : `No ${statusConfig[activeTab]?.label} applications.`}
          </p>
        </div>
      )}
    </div>
  )
}