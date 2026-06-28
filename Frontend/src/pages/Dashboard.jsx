import { useEffect, useState } from 'react'
import { Briefcase, Bell, Zap, ClipboardList, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { insightsApi, jobsApi, applicationsApi } from '../services/api'
import JobCard from '../components/ui/JobCard'
import ProfileCompleteness from '../components/ui/ProfileCompleteness'
import { CardSkeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue:  { bg: 'rgba(59,130,246,0.15)',  fg: '#60a5fa' },
    green: { bg: 'rgba(16,185,129,0.15)',  fg: '#34d399' },
    amber: { bg: 'rgba(245,158,11,0.15)',  fg: '#fbbf24' },
    red:   { bg: 'rgba(239,68,68,0.15)',   fg: '#f87171' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={19} />
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>{value}</p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [insights, setInsights] = useState(null)
  const [matchedJobs, setMatchedJobs] = useState([])
  const [tracked, setTracked] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([insightsApi.get(), jobsApi.match(), applicationsApi.list()])
      .then(([ins, jobs, apps]) => {
        setInsights(ins.data || {})
        const jobList = Array.isArray(jobs.data) ? jobs.data : (jobs.data?.results || jobs.data?.jobs || [])
        setMatchedJobs(jobList.slice(0, 6))
        const appList = Array.isArray(apps.data) ? apps.data : []
        setTracked(new Set(appList.map((a) => a.job_id)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleTrack = async (jobId) => {
    try {
      await applicationsApi.track(jobId)
      setTracked((p) => new Set([...p, jobId]))
      toast.success('Job saved!')
    } catch (err) {
      if (err.response?.status === 409) toast('Already saved', { icon: '📌' })
      else toast.error('Could not save job')
    }
  }

  // Count from array of apps
  const appStats = {}
  if (insights?.application_stats) {
    const raw = insights.application_stats
    if (Array.isArray(raw)) {
      raw.forEach((r) => { appStats[r.status] = Number(r.count) })
    } else {
      Object.entries(raw).forEach(([k, v]) => { appStats[k] = Number(v) })
    }
  }
  const totalApps = Object.values(appStats).reduce((a, b) => a + b, 0)
  const expiringSoon = Array.isArray(insights?.expiring_soon) ? insights.expiring_soon : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Your career search at a glance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <StatCard label="Applications" value={totalApps} icon={ClipboardList} color="blue" />
        <StatCard label="Interviews" value={appStats.interview || 0} icon={Briefcase} color="green" />
        <StatCard label="Offers" value={appStats.offer || 0} icon={Zap} color="amber" />
        <StatCard label="Expiring Soon" value={expiringSoon.length} icon={Bell} color="red" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Matched for You</span>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#60a5fa', textDecoration: 'none' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
            {loading
              ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
              : matchedJobs.map((job) => (
                <JobCard key={job.id} job={job} onTrack={handleTrack} isTracked={tracked.has(job.id)} />
              ))
            }
            {!loading && matchedJobs.length === 0 && (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center', gridColumn: '1/-1' }}>
                <p style={{ color: '#6b7280', fontSize: 14 }}>Complete your profile to see matched jobs</p>
                <Link to="/profile" style={{ display: 'inline-block', marginTop: 14, padding: '9px 20px', borderRadius: 10, background: '#3b82f6', color: 'white', textDecoration: 'none', fontSize: 13 }}>
                  Update Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!loading && insights && (
            <ProfileCompleteness score={Number(insights.profile_completeness) || 0} />
          )}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Bell size={14} color="#fbbf24" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>Expiring Soon</span>
            </div>
            {expiringSoon.length > 0 ? expiringSoon.slice(0, 5).map((job) => (
              <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
                  <p style={{ fontSize: 10, color: '#6b7280' }}>{job.company}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', marginLeft: 8, flexShrink: 0 }}>{job.days_left}d</span>
              </div>
            )) : (
              <p style={{ fontSize: 12, color: '#6b7280' }}>No jobs expiring soon</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}