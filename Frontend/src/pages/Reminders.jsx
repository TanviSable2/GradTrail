import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Calendar, CheckCircle, Clock } from 'lucide-react'
import { applicationsApi } from '../services/api'
import { CardSkeleton } from '../components/ui/Skeleton'
import Badge from '../components/ui/Badge'
import { formatDistanceToNow, format, isValid } from 'date-fns'
import toast from 'react-hot-toast'

export default function Reminders() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsApi.list()
      .then((r) => {
        const raw = r.data
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
        setApps(list.filter((a) => a.remind_me || a.interview_date))
      })
      .catch(() => toast.error('Failed to load reminders'))
      .finally(() => setLoading(false))
  }, [])

  const toggleRemind = async (id, current) => {
    try {
      await applicationsApi.remind(id, { remind_me: !current, remind_days_before: 7 })
      setApps((p) => p.map((a) => a.id === id ? { ...a, remind_me: !current } : a))
      toast.success(!current ? 'Reminder on' : 'Reminder off')
    } catch { toast.error('Failed') }
  }

  const interviews = apps.filter((a) => a.interview_date && isValid(new Date(a.interview_date)))
  const deadlines = apps.filter((a) => a.remind_me && !a.interview_date)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>Reminder Center</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Never miss an important deadline or interview</p>
      </div>

      <div className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bell size={18} color="#60a5fa" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>Email Reminders Active</p>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
            Reminder emails are sent daily at 8 AM. Enable reminders on tracked jobs to get alerts before deadlines and interviews.
          </p>
        </div>
      </div>

      {interviews.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <Calendar size={15} color="#60a5fa" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>
              Upcoming Interviews ({interviews.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading
              ? Array(2).fill(0).map((_, i) => <CardSkeleton key={i} />)
              : interviews.map((app, i) => {
                const date = new Date(app.interview_date)
                return (
                  <motion.div
                    key={app.id} className="glass-card"
                    style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar size={17} color="#60a5fa" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{app.job?.title}</p>
                      <p style={{ fontSize: 11, color: '#6b7280' }}>{app.job?.company}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: '#d1d5db' }}>
                        {format(date, 'dd MMM yyyy')}
                      </p>
                      <p style={{ fontSize: 11, color: '#60a5fa' }}>
                        {formatDistanceToNow(date, { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                )
              })
            }
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <Clock size={15} color="#fbbf24" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>
            Deadline Reminders ({deadlines.length})
          </span>
        </div>
        {loading
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}</div>
          : deadlines.length > 0
          ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deadlines.map((app, i) => (
                <motion.div
                  key={app.id} className="glass-card"
                  style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div style={{ width: 40, height: 40, background: 'rgba(245,158,11,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={17} color="#fbbf24" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{app.job?.title}</p>
                    <p style={{ fontSize: 11, color: '#6b7280' }}>{app.job?.company}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <Badge variant="green">
                      <CheckCircle size={10} style={{ marginRight: 4 }} />Active
                    </Badge>
                    <button
                      onClick={() => toggleRemind(app.id, app.remind_me)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                    >
                      Disable
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
          : (
            <div className="glass-card" style={{ padding: 50, textAlign: 'center' }}>
              <Bell size={28} color="#374151" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#6b7280', fontSize: 14 }}>No deadline reminders set.</p>
              <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>Enable reminders on tracked jobs from the Applications page.</p>
            </div>
          )
        }
      </div>
    </div>
  )
}