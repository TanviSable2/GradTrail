import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Target, Users, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { insightsApi } from '../services/api'
import ProfileCompleteness from '../components/ui/ProfileCompleteness'
import Badge from '../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STATUS_COLORS = {
  not_applied: '#6b7280', applied: '#3b82f6',
  interview: '#f59e0b', offer: '#10b981', rejected: '#ef4444',
}
const STATUS_LABELS = {
  not_applied: 'Saved', applied: 'Applied',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
}

function safeNum(v) { return (typeof v === 'number' ? v : Number(v)) || 0 }

export default function Insights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = () => {
    setLoading(true); setError(false)
    insightsApi.get()
      .then((r) => setData(r.data || {}))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ height: 32, width: 220, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
        {Array(4).fill(0).map((_, i) => <div key={i} className="glass-card" style={{ height: 220 }} />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
      <AlertCircle size={32} color="#ef4444" style={{ margin: '0 auto 14px' }} />
      <p style={{ color: 'white', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Couldn't load insights</p>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Complete your profile to unlock personalized insights.</p>
      <button onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: '#3b82f6', border: 'none', color: 'white', cursor: 'pointer', fontSize: 13 }}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  )

  const appStats = data?.application_stats || {}
  const appData = Object.entries(appStats)
    .map(([k, v]) => ({ name: STATUS_LABELS[k] || k, count: safeNum(v), fill: STATUS_COLORS[k] || '#6b7280' }))
    .filter((d) => d.count > 0)

  const topSkills = (Array.isArray(data?.top_skills_in_market) ? data.top_skills_in_market : [])
    .filter((s) => safeNum(s.count) > 0).slice(0, 8)

  const skillGap = (Array.isArray(data?.skill_gap) ? data.skill_gap : [])
    .filter((s) => safeNum(s.demand_count) > 0)

  const missingSkills = skillGap.filter((s) => !s.student_has_skill).slice(0, 6)
  const ownedSkills = skillGap.filter((s) => s.student_has_skill).slice(0, 5)

  const topDomains = (Array.isArray(data?.top_domains) ? data.top_domains : [])
    .filter((d) => safeNum(d.count) > 0).slice(0, 7)

  const topCompanies = (Array.isArray(data?.top_companies) ? data.top_companies : [])
    .filter((c) => safeNum(c.count) > 0).slice(0, 6)

  const profileScore = safeNum(data?.profile_completeness)
  const totalApps = appData.reduce((a, b) => a + b.count, 0)
  const hasAnyData = topSkills.length > 0 || topDomains.length > 0 || topCompanies.length > 0 || skillGap.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>Insights</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Real-time analytics from your activity</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 12 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {!hasAnyData && profileScore < 40 && (
        <div className="glass-card" style={{ padding: 24, background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#93c5fd', marginBottom: 6 }}>Complete your profile to unlock insights</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
            Add your branch, skills, and location to see skill gap analysis, top domains for your field, and market demand data.
          </p>
          <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
            Update Profile <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>

        <ProfileCompleteness score={profileScore} />

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart2 size={16} color="#60a5fa" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>Applications</span>
            {totalApps > 0 && <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 700, color: 'white' }}>{totalApps}</span>}
          </div>
          {appData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={appData} barCategoryGap="25%">
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={22} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {appData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                {appData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{d.name}: <strong style={{ color: 'white' }}>{d.count}</strong></span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', fontSize: 13 }}>No applications tracked yet</p>
              <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#60a5fa', textDecoration: 'none', marginTop: 10 }}>
                Browse Jobs <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {topSkills.length > 0 && (
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <TrendingUp size={16} color="#10b981" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>Top Skills in Market</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topSkills.map(({ skill, count }) => {
                const max = topSkills[0]?.count || 1
                const pct = Math.round((safeNum(count) / safeNum(max)) * 100)
                return (
                  <div key={String(skill)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#9ca3af', width: 70, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(skill)}</span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', background: '#10b981', borderRadius: 99 }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, delay: 0.1 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#6b7280', width: 32, textAlign: 'right', flexShrink: 0 }}>{safeNum(count)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(missingSkills.length > 0 || ownedSkills.length > 0) && (
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Target size={16} color="#f59e0b" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>Your Skill Gap</span>
            </div>

            {missingSkills.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: '#ef4444', marginBottom: 10, fontWeight: 500, letterSpacing: '0.05em' }}>
                  SKILLS TO LEARN ({missingSkills.length} missing)
                </p>
                {missingSkills.map(({ skill, demand_count }) => (
                  <div key={String(skill)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#d1d5db' }}>{String(skill)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>{safeNum(demand_count)} jobs</span>
                      <Badge variant="red">Missing</Badge>
                    </div>
                  </div>
                ))}
              </>
            )}

            {ownedSkills.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: '#10b981', marginTop: missingSkills.length > 0 ? 14 : 0, marginBottom: 10, fontWeight: 500, letterSpacing: '0.05em' }}>
                  SKILLS YOU HAVE ✓
                </p>
                {ownedSkills.map(({ skill, demand_count }) => (
                  <div key={String(skill)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#d1d5db' }}>{String(skill)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>{safeNum(demand_count)} jobs</span>
                      <Badge variant="green">Have it</Badge>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {topDomains.length > 0 && (
          <div className="glass-card" style={{ padding: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db', display: 'block', marginBottom: 16 }}>
              Top Domains for Your Branch
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {topDomains.map(({ domain, count }, i) => {
                const max = topDomains[0]?.count || 1
                const pct = Math.round((safeNum(count) / safeNum(max)) * 100)
                return (
                  <div key={String(domain)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 11, color: '#4b5563', width: 20, flexShrink: 0 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, color: '#d1d5db', width: 110, flexShrink: 0 }}>{String(domain)}</span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', background: '#3b82f6', borderRadius: 99 }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600, width: 32, textAlign: 'right', flexShrink: 0 }}>{safeNum(count)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {topCompanies.length > 0 && (
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Users size={16} color="#a78bfa" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>Top Hiring Companies</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
           {topCompanies.map(({ company, count }) => (
  <Link 
    key={String(company)} 
    to={`/jobs?company=${encodeURIComponent(company)}`}
    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}
  >
    <div style={{ width: 30, height: 30, background: 'rgba(59,130,246,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
      {String(company).slice(0, 2).toUpperCase()}
    </div>
    <span style={{ fontSize: 13, color: '#d1d5db', flex: 1 }}>{String(company)}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>{safeNum(count)}</span>
      <span style={{ fontSize: 11, color: '#6b7280' }}>roles</span>
    </div>
  </Link>
))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}