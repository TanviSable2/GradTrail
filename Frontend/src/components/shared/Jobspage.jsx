import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { jobsApi, applicationsApi } from '../../services/api'
import JobCard from '../ui/JobCard'
import { CardSkeleton } from '../ui/Skeleton'
import toast from 'react-hot-toast'

const DOMAINS = [
  'Backend', 'Frontend', 'Full Stack', 'AI/ML', 'Data Science',
  'DevOps/Cloud', 'Mobile', 'UI/UX Design', 'Embedded/IoT',
  'Mechanical', 'Electrical', 'Civil/Struct', 'Other',
]

const LOCATIONS = ['Pune', 'Mumbai', 'Bangalore', 'Hyderabad', 'Nagpur', 'Delhi NCR', 'Chennai', 'Remote']

function extractJobs(data) {
  if (Array.isArray(data)) return { jobs: data, total: data.length }
  if (data?.jobs && Array.isArray(data.jobs)) return { jobs: data.jobs, total: Number(data.count) || data.jobs.length }
  if (data?.results && Array.isArray(data.results)) return { jobs: data.results, total: Number(data.total) || data.results.length }
  return { jobs: [], total: 0 }
}

const LIMIT = 12

export default function JobsPage({ jobType = 'job', title = 'Jobs', hideAiMatch = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const companyFilter = searchParams.get('company') || ''

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tracked, setTracked] = useState(new Set())
  const [reminded, setReminded] = useState(new Set())
  const [appIdMap, setAppIdMap] = useState({})
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [domain, setDomain] = useState('')
  const [location, setLocation] = useState('')   // ← new
  const [isRemote, setIsRemote] = useState('')
  const fetchRef = useRef(0)

  const loadApplications = useCallback(() => {
    return applicationsApi.list()
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : []
        const trackedSet = new Set()
        const remindedSet = new Set()
        const idMap = {}
        list.forEach((a) => {
          if (a.job_id) {
            trackedSet.add(a.job_id)
            idMap[a.job_id] = a.id
            if (a.remind_me) remindedSet.add(a.job_id)
          }
        })
        setTracked(trackedSet)
        setReminded(remindedSet)
        setAppIdMap(idMap)
        return idMap
      })
      .catch(() => ({}))
  }, [])

  useEffect(() => { loadApplications() }, [loadApplications])

  const fetchJobs = useCallback(async () => {
    const callId = ++fetchRef.current
    setLoading(true)
    try {
      if (aiMode) {
        const res = await jobsApi.match()
        if (callId !== fetchRef.current) return
        let all = Array.isArray(res.data) ? res.data : []
        all = all.filter((j) => j.job_type === jobType && !j.is_expired)
        if (domain) all = all.filter((j) => j.domain === domain)
        if (location === 'Remote') all = all.filter((j) => j.is_remote)
        else if (location) all = all.filter((j) => j.location?.toLowerCase().includes(location.toLowerCase()))
        if (companyFilter) all = all.filter((j) => j.company?.toLowerCase().includes(companyFilter.toLowerCase()))
        setJobs(all.slice((page - 1) * LIMIT, page * LIMIT))
        setTotal(all.length)
      } else {
        const params = { job_type: jobType, page, limit: LIMIT }
        if (domain) params.domain = domain
        if (isRemote) params.is_remote = isRemote
        if (location && location !== 'Remote') params.location = location
        if (location === 'Remote') params.is_remote = 'true'
        if (companyFilter) params.company = companyFilter
        const res = await jobsApi.list(params)
        if (callId !== fetchRef.current) return
        const extracted = extractJobs(res.data)
        const active = extracted.jobs.filter((j) => !j.is_expired)
        setJobs(active)
        setTotal(extracted.total)
      }
    } catch (err) {
      console.error('fetchJobs error:', err)
      setJobs([])
      setTotal(0)
    } finally {
      if (callId === fetchRef.current) setLoading(false)
    }
  }, [jobType, aiMode, domain, isRemote, location, page, companyFilter])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleTrack = async (jobId) => {
    if (tracked.has(jobId)) { toast('Already saved', { icon: '📌' }); return }
    try {
      await applicationsApi.track(jobId)
      await loadApplications()
      toast.success('Job saved!')
    } catch (err) {
      if (err.response?.status === 409) toast('Already saved', { icon: '📌' })
      else toast.error('Could not save job')
    }
  }

  const handleRemind = async (jobId) => {
    if (!tracked.has(jobId)) {
      try { await applicationsApi.track(jobId) } catch (err) {
        if (err.response?.status !== 409) { toast.error('Could not save job'); return }
      }
    }
    const freshIdMap = await loadApplications()
    const appId = freshIdMap[jobId]
    if (!appId) { toast.error('Try again'); return }
    const isOn = reminded.has(jobId)
    try {
      await applicationsApi.remind(appId, { remind_me: !isOn, remind_days_before: 3 })
      if (isOn) {
        setReminded((p) => { const n = new Set(p); n.delete(jobId); return n })
        toast('Reminder removed', { icon: '🔕' })
      } else {
        setReminded((p) => new Set([...p, jobId]))
        toast.success('Reminder set — email 3 days before deadline')
      }
    } catch { toast.error('Could not set reminder') }
  }

  const clearFilters = () => {
    setDomain('')
    setIsRemote('')
    setLocation('')
    setPage(1)
    if (companyFilter) setSearchParams({})
  }

  const activeCount = [domain, isRemote, location, companyFilter].filter(Boolean).length
  const totalPages = Math.ceil(total / LIMIT)

  const pill = (active) => ({
    fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 500,
    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
    background: active ? '#3b82f6' : 'transparent',
    color: active ? 'white' : '#9ca3af',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{title}</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
            {loading ? 'Loading...' : `${total} ${title.toLowerCase()} found`}
            {companyFilter ? ` · ${companyFilter}` : domain ? ` · ${domain}` : ''}
            {location ? ` · ${location}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!hideAiMatch && (
            <button
              onClick={() => { setAiMode(!aiMode); setPage(1) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 9, border: 'none', background: aiMode ? '#3b82f6' : 'rgba(59,130,246,0.12)', color: aiMode ? 'white' : '#60a5fa', cursor: 'pointer' }}
            >
              <Zap size={14} /> {aiMode ? 'AI Matched' : 'AI Match'}
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 13, borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', cursor: 'pointer', position: 'relative' }}
          >
            <SlidersHorizontal size={14} /> Filters
            {activeCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {(companyFilter || (activeCount > 0 && !showFilters)) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {companyFilter && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(59,130,246,0.15)', borderRadius: 99, fontSize: 11, color: '#60a5fa' }}>
              Company: {companyFilter}
              <button onClick={() => { setSearchParams({}); setPage(1) }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>
            </span>
          )}
          {domain && !showFilters && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(59,130,246,0.15)', borderRadius: 99, fontSize: 11, color: '#60a5fa' }}>
              {domain}
              <button onClick={() => { setDomain(''); setPage(1) }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>
            </span>
          )}
          {location && !showFilters && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(16,185,129,0.15)', borderRadius: 99, fontSize: 11, color: '#34d399' }}>
              {location}
              <button onClick={() => { setLocation(''); setPage(1) }} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {showFilters && (
        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>Filters</span>
            {activeCount > 0 && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domain</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {DOMAINS.map((d) => (
              <button key={d} style={pill(domain === d)} onClick={() => { setDomain(domain === d ? '' : d); setPage(1) }}>{d}</button>
            ))}
          </div>

          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {LOCATIONS.map((loc) => (
              <button key={loc} style={pill(location === loc)} onClick={() => { setLocation(location === loc ? '' : loc); setPage(1) }}>{loc}</button>
            ))}
          </div>

          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Mode</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={pill(isRemote === 'true')} onClick={() => { setIsRemote(isRemote === 'true' ? '' : 'true'); setPage(1) }}>Remote</button>
            <button style={pill(isRemote === 'false')} onClick={() => { setIsRemote(isRemote === 'false' ? '' : 'false'); setPage(1) }}>On-site</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {loading
          ? Array(LIMIT).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onTrack={handleTrack}
              isTracked={tracked.has(job.id)}
              onRemind={handleRemind}
              isReminded={reminded.has(job.id)}
              showMatchScore={aiMode}
            />
          ))
        }
      </div>

      {!loading && jobs.length === 0 && (
        <div className="glass-card" style={{ padding: 50, textAlign: 'center' }}>
          <p style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            {companyFilter ? `No ${title.toLowerCase()} found for ${companyFilter}` :
             aiMode ? 'No matched jobs — update your profile with skills and branch' :
             `No ${title.toLowerCase()} available`}
          </p>
          <p style={{ color: '#6b7280', fontSize: 13 }}>
            {aiMode ? 'Go to Profile and add your branch and skills.' : 'Try different filters or check back later.'}
          </p>
          {activeCount > 0 && (
            <button onClick={clearFilters}
              style={{ marginTop: 14, padding: '9px 20px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, paddingTop: 8 }}>
          <button disabled={page === 1} onClick={() => { setPage(page - 1); window.scrollTo({ top: 0 }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page === 1 ? '#374151' : '#9ca3af', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}>
            <ChevronLeft size={14} /> Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0 }) }}
              style={{ width: 34, height: 34, borderRadius: 8, border: p === page ? 'none' : '1px solid rgba(255,255,255,0.1)', background: p === page ? '#3b82f6' : 'transparent', color: p === page ? 'white' : '#9ca3af', cursor: 'pointer', fontSize: 13 }}>
              {p}
            </button>
          ))}
          <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); window.scrollTo({ top: 0 }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page >= totalPages ? '#374151' : '#9ca3af', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 13 }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}