import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Bell, Zap, ClipboardList, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { insightsApi, jobsApi, applicationsApi } from '../services/api'
import StatCard from '../components/ui/StatCard'
import JobCard from '../components/ui/JobCard'
import ProfileCompleteness from '../components/ui/ProfileCompleteness'
import { CardSkeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [insights, setInsights] = useState(null)
  const [matchedJobs, setMatchedJobs] = useState([])
  const [tracked, setTracked] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([insightsApi.get(), jobsApi.match(), applicationsApi.list()])
      .then(([ins, jobs, apps]) => {
        const insData = ins.data || {}
        setInsights(insData)

        const jobList = jobs.data?.results || jobs.data || []
        setMatchedJobs(Array.isArray(jobList) ? jobList.slice(0, 6) : [])

        const appList = apps.data || []
        setTracked(new Set(Array.isArray(appList) ? appList.map((a) => a.job_id) : []))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleTrack = async (jobId) => {
    try {
      await applicationsApi.track(jobId)
      setTracked((p) => new Set([...p, jobId]))
      toast.success('Job tracked!')
    } catch {
      toast.error('Already tracking')
    }
  }

  const appStats = insights?.application_stats || {}
  const totalApps = typeof appStats === 'object' && !Array.isArray(appStats)
    ? Object.values(appStats).reduce((a, b) => a + (Number(b) || 0), 0)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>Good morning 👋</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Here's what's happening with your career search</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card" style={{ padding: 20, height: 90 }} />
          ))
        ) : (
          <>
            <StatCard label="Applications" value={totalApps} icon={ClipboardList} color="blue" delay={0} />
            <StatCard label="Interviews" value={Number(appStats.interview) || 0} icon={Briefcase} color="green" delay={0.07} />
            <StatCard label="Offers" value={Number(appStats.offer) || 0} icon={Zap} color="amber" delay={0.14} />
            <StatCard label="Expiring Soon" value={Array.isArray(insights?.expiring_soon) ? insights.expiring_soon.length : 0} icon={Bell} color="red" delay={0.21} />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={17} color="#60a5fa" />
              <span style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Matched for You</span>
            </div>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#60a5fa', textDecoration: 'none' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
            {loading
              ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
              : matchedJobs.map((job, i) => (
                <JobCard key={job.id} job={job} onTrack={handleTrack} isTracked={tracked.has(job.id)} delay={i * 0.05} />
              ))
            }
            {!loading && matchedJobs.length === 0 && (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center', gridColumn: '1/-1' }}>
                <Briefcase size={30} color="#374151" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#6b7280', fontSize: 14 }}>Complete your profile to see matched jobs</p>
                <Link to="/profile" style={{ display: 'inline-flex', marginTop: 16, padding: '9px 20px', borderRadius: 10, background: '#3b82f6', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                  Update Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!loading && insights && (
            <ProfileCompleteness score={Number(insights.profile_completeness) || 0} />
          )}

          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <Bell size={15} color="#fbbf24" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>Expiring Soon</span>
            </div>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ height: 36, background: 'rgba(255,255,255,0.04)', borderRadius: 8, marginBottom: 8 }} />
              ))
            ) : Array.isArray(insights?.expiring_soon) && insights.expiring_soon.length > 0 ? (
              insights.expiring_soon.slice(0, 5).map((job) => (
                <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
                    <p style={{ fontSize: 10, color: '#6b7280' }}>{job.company}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', flexShrink: 0, marginLeft: 8 }}>
                    {job.days_until_deadline}d
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: '#6b7280' }}>No jobs expiring soon</p>
            )}
          </div>

          <div className="glass-card" style={{ padding: 18 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db', display: 'block', marginBottom: 14 }}>Top Market Skills</span>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ height: 18, background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginBottom: 8 }} />
              ))
            ) : Array.isArray(insights?.top_skills_in_market) ? (
              insights.top_skills_in_market.slice(0, 6).map(({ skill, count }) => {
                const max = insights.top_skills_in_market[0]?.count || 1
                return (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af', width: 60, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', background: '#3b82f6', borderRadius: 99 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / max) * 100}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span style={{ fontSize: 10, color: '#6b7280', width: 24, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                  </div>
                )
              })
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}