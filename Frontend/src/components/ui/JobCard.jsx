import { motion } from 'framer-motion'
import { MapPin, Clock, Bookmark, ExternalLink, Zap, AlertTriangle } from 'lucide-react'
import Badge from './Badge'
import { formatDistanceToNow } from 'date-fns'

const domainColors = {
  Frontend: 'brand', Backend: 'purple', 'Full Stack': 'brand',
  'AI/ML': 'green', 'Data Science': 'green', 'DevOps/Cloud': 'amber',
  Mobile: 'purple', 'UI/UX Design': 'red',
}

export default function JobCard({ job, onTrack, isTracked, delay = 0 }) {
  const badgeVariant = domainColors[job.domain] || 'default'
  const posted = job.posted_at ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : 'Recently'

  return (
    <motion.div
      className="glass-card"
      style={{ padding: 18, transition: 'all 0.25s', cursor: 'default' }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(59,130,246,0.08)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
            {job.company?.slice(0, 2).toUpperCase() || 'JB'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
            <p style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</p>
          </div>
        </div>
        <button
          onClick={() => onTrack?.(job.id)}
          style={{ background: isTracked ? 'rgba(59,130,246,0.15)' : 'transparent', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: isTracked ? '#60a5fa' : '#6b7280', display: 'flex', flexShrink: 0 }}
        >
          <Bookmark size={15} fill={isTracked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {job.match_score !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(59,130,246,0.1)', borderRadius: 8, padding: '6px 10px', marginBottom: 12 }}>
          <Zap size={12} color="#60a5fa" />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>{job.match_score}% Match</span>
          {job.matched_skills?.length > 0 && (
            <span style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              · {job.matched_skills.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 11, color: '#6b7280' }}>
        {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{job.location}</span>}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{posted}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {job.domain && <Badge variant={badgeVariant}>{job.domain}</Badge>}
          {job.is_remote && <Badge variant="green">Remote</Badge>}
          {job.employment_type && job.employment_type !== 'any' && <Badge>{job.employment_type}</Badge>}
        </div>
        {job.apply_url && (
          <a href={job.apply_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: '#60a5fa', textDecoration: 'none', flexShrink: 0 }}>
            Apply <ExternalLink size={11} />
          </a>
        )}
      </div>

      {job.days_until_deadline !== undefined && job.days_until_deadline <= 7 && !job.is_expired && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: '#fbbf24' }}>
          <AlertTriangle size={12} />
          Deadline in {job.days_until_deadline} day{job.days_until_deadline !== 1 ? 's' : ''}
        </div>
      )}
    </motion.div>
  )
}