import { useState } from 'react'
import { MapPin, Clock, Bookmark, ExternalLink, AlertTriangle, BellRing, XCircle, Wand2, Zap } from 'lucide-react'
import Badge from './Badge'
import ResumeTailorModal from './ResumeTailorModal'
import { formatDistanceToNow } from 'date-fns'

const domainColors = {
  Frontend: 'brand', Backend: 'purple', 'Full Stack': 'brand',
  'AI/ML': 'green', 'Data Science': 'green', 'DevOps/Cloud': 'amber',
  Mobile: 'purple', 'UI/UX Design': 'red',
}

function DeadlineTag({ days, isExpired }) {
  if (isExpired) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#6b7280' }}>
      <XCircle size={12} /> Position closed
    </div>
  )
  if (days === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 700, color: '#ef4444' }}>
      <AlertTriangle size={12} /> Deadline TODAY
    </div>
  )
  if (days > 0 && days <= 3) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 600, color: '#ef4444' }}>
      <AlertTriangle size={12} /> {days} day{days !== 1 ? 's' : ''} left
    </div>
  )
  if (days > 3 && days <= 7) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#fbbf24' }}>
      <AlertTriangle size={12} /> {days} days left
    </div>
  )
  if (days > 7 && days <= 14) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#9ca3af' }}>
      <Clock size={11} /> Closes in {days} days
    </div>
  )
  return null
}

export default function JobCard({ job, onTrack, isTracked, onRemind, isReminded, showMatchScore = false }) {
  const [tailorOpen, setTailorOpen] = useState(false)
  const badgeVariant = domainColors[job.domain] || 'default'
  const posted = job.posted_at ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : 'Recently'
  const isExpired = job.is_expired === true || (typeof job.days_until_deadline === 'number' && job.days_until_deadline < 0)

  return (
    <>
      <div
        className="glass-card"
        style={{ padding: 16, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
      >
        {isExpired && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(107,114,128,0.3)' }} />
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: isExpired ? 'rgba(107,114,128,0.15)' : 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: isExpired ? '#6b7280' : '#60a5fa' }}>
              {job.company?.slice(0, 2).toUpperCase() || 'JB'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: isExpired ? '#6b7280' : 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {job.title}
              </p>
              <p style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {job.company}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {onRemind && (
              <button onClick={() => onRemind(job.id)} title={isReminded ? 'Reminder on' : 'Set reminder'}
                style={{ background: isReminded ? 'rgba(245,158,11,0.2)' : 'transparent', border: isReminded ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 6, cursor: 'pointer', color: isReminded ? '#fbbf24' : '#6b7280', display: 'flex' }}>
                <BellRing size={13} fill={isReminded ? 'currentColor' : 'none'} />
              </button>
            )}
            <button onClick={() => onTrack?.(job.id)} title={isTracked ? 'Saved' : 'Save job'}
              style={{ background: isTracked ? 'rgba(59,130,246,0.2)' : 'transparent', border: isTracked ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 6, cursor: 'pointer', color: isTracked ? '#60a5fa' : '#6b7280', display: 'flex' }}>
              <Bookmark size={13} fill={isTracked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Match score — only show in AI mode and only if realistic */}
        {showMatchScore && job.match_score !== undefined && job.matched_skills?.length > 0 && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.08)', borderRadius: 7, padding: '5px 9px', marginBottom: 10 }}>
    <Zap size={11} color="#60a5fa" />
    <span style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>{job.match_score}% Match</span>
    {job.matched_skills?.length > 0 && (
      <span style={{ fontSize: 11, color: '#6b7280' }}>
        · {job.matched_skills.slice(0, 2).join(', ')}
      </span>
    )}
  </div>
)}

        {/* Meta */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 11, color: '#6b7280', flexWrap: 'wrap' }}>
          {job.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} /> {job.location}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} /> {posted}
          </span>
          {job.salary_min && (
            <span style={{ color: '#34d399' }}>
              ₹{(job.salary_min / 100000).toFixed(1)}L{job.salary_max ? `–${(job.salary_max / 100000).toFixed(1)}L` : '+'}
            </span>
          )}
        </div>

        {/* Badges + apply */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: isExpired ? 0 : 8 }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {job.domain && <Badge variant={isExpired ? 'default' : badgeVariant}>{job.domain}</Badge>}
            {job.is_remote && <Badge variant="green">Remote</Badge>}
            {job.employment_type && job.employment_type !== 'any' && <Badge>{job.employment_type}</Badge>}
            {isExpired && <Badge variant="default">Closed</Badge>}
          </div>
          {!isExpired && job.apply_url && (
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#60a5fa', textDecoration: 'none', flexShrink: 0, padding: '5px 10px', background: 'rgba(59,130,246,0.1)', borderRadius: 6 }}>
              Apply <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* Tailor resume — only for active jobs */}
        {!isExpired && (
          <button onClick={() => setTailorOpen(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '7px', borderRadius: 8, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)', color: '#a78bfa', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
            <Wand2 size={12} /> Tailor Resume for this Job
          </button>
        )}

        <DeadlineTag days={job.days_until_deadline} isExpired={isExpired} />
      </div>

      {tailorOpen && (
        <ResumeTailorModal open={tailorOpen} onClose={() => setTailorOpen(false)} job={job} />
      )}
    </>
  )
}