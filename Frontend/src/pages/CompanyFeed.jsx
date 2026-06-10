import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, ExternalLink, Plus, Check } from 'lucide-react'
import { companiesApi, applicationsApi } from '../services/api'
import JobCard from '../components/ui/JobCard'
import { CardSkeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

function safeArray(val) {
  if (Array.isArray(val)) return val
  if (val && Array.isArray(val.data)) return val.data
  if (val && Array.isArray(val.companies)) return val.companies
  if (val && Array.isArray(val.jobs)) return val.jobs
  return []
}

export default function CompanyFeed() {
  const [companies, setCompanies] = useState([])
  const [feed, setFeed] = useState([])
  const [following, setFollowing] = useState(new Set())
  const [tracked, setTracked] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('companies')

  useEffect(() => {
    Promise.all([
      companiesApi.list(),
      companiesApi.following(),
      companiesApi.feed(),
      applicationsApi.list(),
    ])
      .then(([all, fol, feedRes, apps]) => {
        setCompanies(safeArray(all.data))
        const folList = safeArray(fol.data)
        setFollowing(new Set(folList.map((c) => c.id || c.company_id)))
        setFeed(safeArray(feedRes.data))
        const appList = safeArray(apps.data)
        setTracked(new Set(appList.map((a) => a.job_id)))
      })
      .catch((err) => {
        console.error('CompanyFeed error:', err)
        setCompanies([])
        setFeed([])
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleFollow = async (id) => {
    try {
      if (following.has(id)) {
        await companiesApi.unfollow(id)
        setFollowing((p) => { const n = new Set(p); n.delete(id); return n })
        toast.success('Unfollowed')
      } else {
        await companiesApi.follow(id)
        setFollowing((p) => new Set([...p, id]))
        toast.success('Following!')
      }
    } catch { toast.error('Failed') }
  }

  const handleTrack = async (jobId) => {
    try {
      await applicationsApi.track(jobId)
      setTracked((p) => new Set([...p, jobId]))
      toast.success('Tracked!')
    } catch { toast.error('Already tracking') }
  }

  const tabStyle = (active) => ({
    padding: '8px 18px', borderRadius: 10, border: 'none',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    background: active ? '#3b82f6' : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : '#9ca3af', transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>Companies</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Follow companies and get their latest jobs</p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={tabStyle(tab === 'companies')} onClick={() => setTab('companies')}>
          All Companies ({companies.length})
        </button>
        <button style={tabStyle(tab === 'feed')} onClick={() => setTab('feed')}>
          My Feed ({feed.length})
        </button>
      </div>

      {tab === 'companies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          {loading
            ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : companies.map((co, i) => (
              <motion.div
                key={co.id} className="glass-card"
                style={{ padding: 18 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
                    {co.name?.slice(0, 2).toUpperCase() || 'CO'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {co.name}
                    </p>
                    {co.website && (
                      <a href={co.website} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                        Website <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
                {co.description && (
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {co.description}
                  </p>
                )}
                <button
                  onClick={() => toggleFollow(co.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 10, border: following.has(co.id) ? 'none' : '1px solid rgba(255,255,255,0.1)', background: following.has(co.id) ? 'rgba(16,185,129,0.15)' : 'transparent', color: following.has(co.id) ? '#34d399' : '#9ca3af', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                >
                  {following.has(co.id) ? <><Check size={13} /> Following</> : <><Plus size={13} /> Follow</>}
                </button>
              </motion.div>
            ))
          }
          {!loading && companies.length === 0 && (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center', gridColumn: '1/-1' }}>
              <Building2 size={30} color="#374151" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#6b7280' }}>No companies found</p>
            </div>
          )}
        </div>
      )}

      {tab === 'feed' && (
        <div>
          {!loading && feed.length === 0 ? (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
              <Building2 size={30} color="#374151" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#6b7280', fontSize: 14 }}>Follow companies to see their latest jobs here</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
              {loading
                ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
                : feed.map((job, i) => (
                  <JobCard key={job.id} job={job} onTrack={handleTrack} isTracked={tracked.has(job.id)} delay={i * 0.04} />
                ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}