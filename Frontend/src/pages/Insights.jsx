import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Target, AlertCircle } from 'lucide-react'
import { insightsApi } from '../services/api'
import ProfileCompleteness from '../components/ui/ProfileCompleteness'
import Badge from '../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const statusColors = {
  not_applied: '#6b7280',
  applied: '#3b82f6',
  interview: '#f59e0b',
  offer: '#10b981',
  rejected: '#ef4444',
}
const statusLabels = {
  not_applied: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

function safeNum(v) {
  return typeof v === 'number' ? v : Number(v) || 0
}

export default function Insights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    insightsApi.get()
      .then((r) => setData(r.data || {}))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ height: 32, width: 200, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="glass-card" style={{ height: 200 }} />
      ))}
    </div>
  )

  if (error) return (
    <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
      <AlertCircle size={30} color="#ef4444" style={{ margin: '0 auto 12px' }} />
      <p style={{ color: '#6b7280' }}>Failed to load insights. Complete your profile first.</p>
    </div>
  )

  const appStats = data?.application_stats || {}
  const appData = Object.entries(appStats)
    .filter(([, v]) => safeNum(v) > 0)
    .map(([key, count]) => ({
      name: statusLabels[key] || key,
      count: safeNum(count),
      fill: statusColors[key] || '#6b7280',
    }))

  const topSkills = Array.isArray(data?.top_skills_in_market) ? data.top_skills_in_market : []
  const skillGap = Array.isArray(data?.skill_gap) ? data.skill_gap : []
  const topDomains = Array.isArray(data?.top_domains) ? data.top_domains : []
  const profileScore = safeNum(data?.profile_completeness)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>Insights</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Analytics for your career search</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>

        <ProfileCompleteness score={profileScore} />

        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <BarChart2 size={16} color="#60a5fa" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>Applications by Status</span>
          </div>
          {appData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={appData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {appData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 13 }}>No application data yet. Start applying!</p>
          )}
        </div>

        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <TrendingUp size={16} color="#10b981" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>Top Skills in Market</span>
          </div>
          {topSkills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topSkills.slice(0, 7).map(({ skill, count }) => {
                const max = topSkills[0]?.count || 1
                return (
                  <div key={String(skill)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#9ca3af', width: 64, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(skill)}
                    </span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', background: '#10b981', borderRadius: 99 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(safeNum(count) / safeNum(max)) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: '#6b7280', width: 28, textAlign: 'right', flexShrink: 0 }}>
                      {safeNum(count)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 13 }}>Complete your profile to see skill insights</p>
          )}
        </div>

        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <Target size={16} color="#f59e0b" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>Skill Gap Analysis</span>
          </div>
          {skillGap.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {skillGap.slice(0, 8).map(({ skill, demand_count, student_has_skill }) => (
                <div key={String(skill)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 12, color: '#d1d5db' }}>{String(skill)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{safeNum(demand_count)} jobs</span>
                    <Badge variant={student_has_skill ? 'green' : 'red'}>
                      {student_has_skill ? 'Have it' : 'Missing'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 13 }}>Add skills to your profile to see gap analysis</p>
          )}
        </div>

        <div className="glass-card" style={{ padding: 18 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db', display: 'block', marginBottom: 14 }}>
            Top Domains for Your Branch
          </span>
          {topDomains.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {topDomains.slice(0, 7).map(({ domain, count }, i) => (
                <div key={String(domain)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#6b7280', width: 18 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, color: '#d1d5db' }}>{String(domain)}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>{safeNum(count)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 13 }}>Set your branch in profile to see top domains</p>
          )}
        </div>

        <div className="glass-card" style={{ padding: 18 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db', display: 'block', marginBottom: 14 }}>
            Top Companies Hiring
          </span>
          {Array.isArray(data?.top_companies) && data.top_companies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {data.top_companies.slice(0, 6).map(({ company, count }, i) => (
                <div key={String(company)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, background: 'rgba(59,130,246,0.15)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
                      {String(company).slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, color: '#d1d5db' }}>{String(company)}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>{safeNum(count)} jobs</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 13 }}>No company data available yet</p>
          )}
        </div>

      </div>
    </div>
  )
}