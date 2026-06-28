import { useEffect, useState } from 'react'
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
        if (Array.isArray(data)) setApps(data)
        else if (Array.isArray(data?.data)) setApps(data.data)
        else if (Array.isArray(data?.applications)) setApps(data.applications)
        else setApps([])
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

  const counts = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  const filtered = activeTab === 'all' ? apps : apps.filter((a) => a.status === activeTab)

  const tabStyle = (active) => ({
    padding: '7px 14px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', background: active ? '#3b82f6' : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : '#9ca3af', flexShrink: 0,
  })

  const inp = {
    width: '100%', background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
    padding: '9px 12px', fontSize: 13, color: 'white',
    outline: 'none', resize: 'none', fontFamily: 'Sora, sans-serif',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>Applications</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Track your job application pipeline</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
        {Object.entries(statusConfig).map(([key, { label, color }]) => (
          <div key={key} className="glass-card" style={{ padding: '12px 14px', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => setActiveTab(key === activeTab ? 'all' : key)}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{counts[key] || 0}</p>
            <div style={{ marginTop: 5 }}><Badge variant={color}>{label}</Badge></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
        <button style={tabStyle(activeTab === 'all')} onClick={() => setActiveTab('all')}>All ({apps.length})</button>
        {Object.entries(statusConfig).map(([key, { label }]) => (
          <button key={key} style={tabStyle(activeTab === key)} onClick={() => setActiveTab(key)}>
            {label} ({counts[key] || 0})
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map((app) => {
            // Support both joined fields and nested job object
            const title = app.job_title || app.job?.title || 'Job'
            const company = app.job_company || app.job?.company || ''
            const applyUrl = app.job_apply_url || app.job?.apply_url
            return (
              <div key={app.id} className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                  <div style={{ width: 38, height: 38, background: 'rgba(59,130,246,0.12)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
                    {company.slice(0, 2).toUpperCase() || 'JB'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
                    <p style={{ fontSize: 11, color: '#6b7280' }}>{company}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge variant={statusConfig[app.status]?.color || 'default'}>{statusConfig[app.status]?.label || app.status}</Badge>
                    {app.remind_me && <Bell size={13} color="#fbbf24" />}
                    <ChevronDown size={14} color="#6b7280" style={{ transform: expandedId === app.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </div>

                {expandedId === app.id && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                      <div>
                        <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 5 }}>Status</label>
                        <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value)}
                          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '7px 10px', fontSize: 12, color: 'white', outline: 'none', cursor: 'pointer' }}>
                          {Object.entries(statusConfig).map(([v, { label }]) => (
                            <option key={v} value={v}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 5 }}>Email Reminder</label>
                        <button onClick={() => toggleRemind(app.id, app.remind_me)}
                          style={{ padding: '7px 12px', borderRadius: 7, border: 'none', background: app.remind_me ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)', color: app.remind_me ? '#60a5fa' : '#9ca3af', cursor: 'pointer', fontSize: 12 }}>
                          {app.remind_me ? '🔔 On' : 'Enable'}
                        </button>
                      </div>
                      {applyUrl && (
                        <div style={{ marginLeft: 'auto' }}>
                          <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 5 }}>Apply</label>
                          <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', textDecoration: 'none', fontSize: 12 }}>
                            Apply <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                    <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 5 }}>Notes</label>
                    <textarea rows={3} defaultValue={app.notes || ''} placeholder="Add notes..."
                      style={inp}
                      onBlur={(e) => applicationsApi.update(app.id, { notes: e.target.value }).catch(() => {})} />
                  </div>
                )}
              </div>
            )
          })
        }
      </div>

      {!loading && filtered.length === 0 && (
        <div className="glass-card" style={{ padding: 50, textAlign: 'center' }}>
          <ClipboardList size={28} color="#374151" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: '#6b7280' }}>
            {activeTab === 'all' ? 'No applications yet. Save jobs to start tracking!' : `No ${statusConfig[activeTab]?.label} applications.`}
          </p>
        </div>
      )}
    </div>
  )
}