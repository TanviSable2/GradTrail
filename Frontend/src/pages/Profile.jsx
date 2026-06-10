import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Save, Plus, X } from 'lucide-react'
import { profileApi } from '../services/api'
import ProfileCompleteness from '../components/ui/ProfileCompleteness'
import toast from 'react-hot-toast'

const branches = ['Computer Science','Information Technology','Electronics','Electrical','Mechanical','Civil','Chemical','Other']
const years = ['1st Year','2nd Year','3rd Year','4th Year','Graduated']

const inp = { width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'white', outline: 'none', fontFamily: 'Sora, sans-serif' }
const lbl = { fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6, fontWeight: 500 }

export default function Profile() {
  const [form, setForm] = useState({ first_name: '', last_name: '', branch: '', year: '', location: '', skills: [], resume_url: '', about: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [score, setScore] = useState(0)

  useEffect(() => {
    profileApi.get()
      .then((r) => { if (r.data) { setForm({ ...form, ...r.data, skills: r.data.skills || [] }); calculateScore(r.data) } })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const calculateScore = (p) => {
    let s = 0
    if (p.first_name) s += 15; if (p.last_name) s += 10; if (p.branch) s += 20
    if (p.year) s += 10; if (p.location) s += 10; if (p.skills?.length) s += 20
    if (p.resume_url) s += 10; if (p.about) s += 5
    setScore(s)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await profileApi.update(form); calculateScore(form); toast.success('Profile saved!') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) { const updated = [...form.skills, s]; setForm({ ...form, skills: updated }); setSkillInput('') }
  }

  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter((k) => k !== s) })

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{Array(4).fill(0).map((_, i) => <div key={i} className="glass-card" style={{ height: 120 }} />)}</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, background: 'rgba(59,130,246,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={24} color="#60a5fa" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Profile</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Complete your profile to get better job matches</p>
        </div>
      </div>

      <ProfileCompleteness score={score} />

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="glass-card" style={{ padding: 22 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db', marginBottom: 18 }}>Personal Info</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={lbl}>First Name</label><input style={inp} placeholder="Rajesh" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
            <div><label style={lbl}>Last Name</label><input style={inp} placeholder="Kumar" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
            <div>
              <label style={lbl}>Branch</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                <option value="">Select branch</option>
                {branches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Year</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                <option value="">Select year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Location</label>
            <input style={inp} placeholder="Mumbai, India" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>About</label>
            <textarea style={{ ...inp, resize: 'none' }} rows={3} placeholder="Brief bio..." value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: 22 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db', marginBottom: 14 }}>Skills</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input style={{ ...inp, flex: 1 }} placeholder="Add a skill (e.g. React)" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <button type="button" onClick={addSkill} style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.2)', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex' }}><Plus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.skills.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'rgba(59,130,246,0.15)', borderRadius: 99, fontSize: 12, color: '#93c5fd' }}>
                {s}
                <button type="button" onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', display: 'flex', padding: 0, marginLeft: 2 }}><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 22 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db', marginBottom: 14 }}>Resume</p>
          <label style={lbl}>Resume URL (Google Drive, LinkedIn, etc.)</label>
          <input style={inp} placeholder="https://drive.google.com/..." value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
        </div>

        <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 14, background: '#3b82f6', border: 'none', color: 'white', fontWeight: 500, fontSize: 15, cursor: 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'Sora, sans-serif' }}>
          {saving ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><Save size={16} /> Save Profile</>}
        </button>
      </form>
    </div>
  )
}