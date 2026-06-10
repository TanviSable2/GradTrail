import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Zap, X, Filter } from 'lucide-react'
import { jobsApi, applicationsApi } from '../../services/api'
import JobCard from '../ui/JobCard'
import SearchBar from '../ui/SearchBar'
import { CardSkeleton } from '../ui/Skeleton'
import toast from 'react-hot-toast'

const domains = [
  'Backend', 'Frontend', 'Full Stack', 'AI/ML', 'Data Science',
  'DevOps/Cloud', 'Mobile', 'UI/UX Design', 'Embedded/IoT',
  'Mechanical', 'Electrical', 'Civil/Struct', 'Other',
]

const postedWithinOptions = [
  { l: 'Today', v: 1 },
  { l: '3 days', v: 3 },
  { l: 'This week', v: 7 },
  { l: 'Month', v: 30 },
]

function safeArray(val) {
  if (Array.isArray(val)) return val
  if (val && Array.isArray(val.results)) return val.results
  if (val && Array.isArray(val.data)) return val.data
  return []
}

export default function JobsPage({ jobType = 'job', title = 'Jobs' }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tracked, setTracked] = useState(new Set())
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [matched, setMatched] = useState(false)
  const [q, setQ] = useState('')
  const [domain, setDomain] = useState('')
  const [isRemote, setIsRemote] = useState('')
  const [postedWithin, setPostedWithin] = useState('')
  const limit = 12
  const fetchRef = useRef(0)

  const fetchJobs = useCallback(async () => {
    const callId = ++fetchRef.current
    setLoading(true)
    try {
      let result = []
      let totalCount = 0

      if (matched) {
        const res = await jobsApi.match()
        if (callId !== fetchRef.current) return
        const all = safeArray(res.data)
        const filtered = all.filter((j) => {
          if (jobType === 'job') return !j.job_type || j.job_type === 'job'
          if (jobType === 'internship') return j.job_type === 'internship'
          return true
        })
        result = filtered
        totalCount = filtered.length
      } else if (q.length > 2) {
        const res = await jobsApi.search({ q, page, limit })
        if (callId !== fetchRef.current) return
        const raw = safeArray(res.data?.results || res.data)
        result = raw.filter((j) => {
          if (jobType === 'job') return !j.job_type || j.job_type === 'job'
          if (jobType === 'internship') return j.job_type === 'internship'
          return true
        })
        totalCount = res.data?.total || result.length
      } else {
        const params = {
          job_type: jobType,
          page,
          limit,
        }
        if (domain) params.domain = domain
        if (isRemote) params.is_remote = isRemote
        if (postedWithin) params.posted_within_days = postedWithin

        const res = await jobsApi.list(params)
        if (callId !== fetchRef.current) return
        result = safeArray(res.data?.results || res.data)
        totalCount = res.data?.total || result.length
      }

      setJobs(result)
      setTotal(totalCount)
    } catch (err) {
      console.error('Fetch jobs error:', err)
      toast.error('Failed to load')
      setJobs([])
    } finally {
      if (callId === fetchRef.current) setLoading(false)
    }
  }, [jobType, matched, q, domain, isRemote, postedWithin, page, limit])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    applicationsApi.list()
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.data || [])
        setTracked(new Set(list.map((a) => a.job_id)))
      })
      .catch(() => {})
  }, [])

  const handleTrack = async (id) => {
    try {
      await applicationsApi.track(id)
      setTracked((p) => new Set([...p, id]))
      toast.success('Tracked!')
    } catch { toast.error('Already tracking') }
  }

  const clearFilters = () => {
    setDomain('')
    setIsRemote('')
    setPostedWithin('')
    setPage(1)
  }

  const activeCount = [domain, isRemote, postedWithin].filter(Boolean).length

  const filterBtn = (active) => ({
    fontSize: 12, padding: '6px 13px', borderRadius: 8, cursor: 'pointer', fontWeight: 500,
    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
    background: active ? '#3b82f6' : 'transparent',
    color: active ? 'white' : '#9ca3af',
    transition: 'all 0.15s',
  })

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>{title}</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
            {total} {jobType === 'job' ? 'jobs' : jobType === 'internship' ? 'internships' : 'courses'} available
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setMatched(!matched); setPage(1) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, fontWeight: 500, borderRadius: 10, border: 'none', background: matched ? '#3b82f6' : 'rgba(59,130,246,0.15)', color: matched ? 'white' : '#60a5fa', cursor: 'pointer' }}
          >
            <Zap size={14} /> {matched ? 'AI Matched ✓' : 'AI Match'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: showFilters ? 'rgba(255,255,255,0.06)' : 'transparent', color: '#9ca3af', cursor: 'pointer', position: 'relative' }}
          >
            <SlidersHorizontal size={14} /> Filters
            {activeCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, background: '#3b82f6', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <SearchBar
        placeholder={`Search ${title.toLowerCase()}...`}
        onSearch={(v) => { setQ(v); setPage(1) }}
      />

      {showFilters && (
        <motion.div
          className="glass-card"
          style={{ padding: 20 }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>Filters</span>
            {activeCount > 0 && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Domain</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
            {domains.map((d) => (
              <button
                key={d}
                style={filterBtn(domain === d)}
                onClick={() => { setDomain(domain === d ? '' : d); setPage(1) }}
              >
                {d}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Posted Within</p>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {postedWithinOptions.map(({ l, v }) => (
                  <button
                    key={v}
                    style={filterBtn(postedWithin === v)}
                    onClick={() => { setPostedWithin(postedWithin === v ? '' : v); setPage(1) }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Work Mode</p>
              <div style={{ display: 'flex', gap: 7 }}>
                <button style={filterBtn(isRemote === 'true')} onClick={() => { setIsRemote(isRemote === 'true' ? '' : 'true'); setPage(1) }}>
                  Remote
                </button>
                <button style={filterBtn(isRemote === 'false')} onClick={() => { setIsRemote(isRemote === 'false' ? '' : 'false'); setPage(1) }}>
                  On-site
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {domain && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Filtered by:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(59,130,246,0.15)', borderRadius: 99, fontSize: 11, color: '#60a5fa' }}>
            {domain}
            <button onClick={() => { setDomain(''); setPage(1) }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={11} />
            </button>
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {loading
          ? Array(9).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : jobs.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              onTrack={handleTrack}
              isTracked={tracked.has(job.id)}
              delay={i * 0.03}
            />
          ))
        }
      </div>

      {!loading && jobs.length === 0 && (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <Filter size={30} color="#374151" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            {q.length > 2
              ? `No results for "${q}"`
              : domain
              ? `No ${title.toLowerCase()} found for domain "${domain}"`
              : `No ${title.toLowerCase()} found. Try adjusting filters.`}
          </p>
          {(activeCount > 0 || q) && (
            <button
              onClick={() => { clearFilters(); setQ('') }}
              style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', paddingTop: 8 }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13, opacity: page === 1 ? 0.4 : 1 }}
          >
            Previous
          </button>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13, opacity: page >= totalPages ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}