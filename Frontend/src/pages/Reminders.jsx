import { useEffect, useState } from 'react'
import { Bell, Clock, ExternalLink } from 'lucide-react'
import { applicationsApi } from '../services/api'
import { CardSkeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function Reminders() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsApi.list()
      .then((r) => {
        const raw = r.data
        const list = Array.isArray(raw) ? raw
          : Array.isArray(raw?.data) ? raw.data
          : []
        // Only show entries with remind_me = true
        setApps(list.filter((a) => a.remind_me === true))
      })
      .catch(() => toast.error('Failed to load reminders'))
      .finally(() => setLoading(false))
  }, [])

  const toggleRemind = async (id, current) => {
    try {
      await applicationsApi.remind(id, { remind_me: !current, remind_days_before: 3 })
      setApps((p) => p.map((a) => a.id === id ? { ...a, remind_me: !current } : a).filter(a => a.remind_me))
      toast.success(!current ? 'Reminder enabled' : 'Reminder disabled')
    } catch { toast.error('Failed') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>Reminder Center</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
          Email reminders are sent when the reminder date arrives
        </p>
      </div>


      {/* Reminder list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <Clock size={14} color="#fbbf24" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>
            Active Reminders ({apps.length})
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array(2).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : apps.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {apps.map((app) => {
              // Support both flat and nested job data
              const title   = app.job_title   || app.job?.title   || 'Job'
              const company = app.job_company  || app.job?.company || ''
              const applyUrl = app.job_apply_url || app.job?.apply_url

              return (
                <div key={app.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, background: 'rgba(245,158,11,0.12)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={17} color="#fbbf24" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {title}
                    </p>
                    <p style={{ fontSize: 11, color: '#6b7280' }}>{company}</p>
                    {app.reminder_date && (
                      <p style={{ fontSize: 11, color: '#60a5fa', marginTop: 2 }}>
                        Email sends: {new Date(app.reminder_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {applyUrl && (
                      <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Apply <ExternalLink size={11} />
                      </a>
                    )}
                    <button onClick={() => toggleRemind(app.id, app.remind_me)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>
                      Disable
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 50, textAlign: 'center' }}>
            <Bell size={28} color="#374151" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#6b7280', fontSize: 14 }}>No active reminders.</p>
            <p style={{ color: '#4b5563', fontSize: 12, marginTop: 6 }}>
              Click the bell on any job card to set a reminder.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}