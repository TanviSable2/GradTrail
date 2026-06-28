import { useEffect, useState } from 'react'
import { User, Save, Plus, X, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { profileApi } from '../services/api'
import ProfileCompleteness from '../components/ui/ProfileCompleteness'
import toast from 'react-hot-toast'

const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'MBA / Management',
  'Other',
]

const YEARS = [
  { label: '1st Year',            value: 1 },
  { label: '2nd Year',            value: 2 },
  { label: '3rd Year',            value: 3 },
  { label: '4th Year',            value: 4 },
  { label: 'Graduated / Working', value: 5 },
]

const inp = {
  width: '100%',
  background: '#111',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  color: 'white',
  outline: 'none',
  fontFamily: 'Sora, sans-serif',
  boxSizing: 'border-box',
}

const lbl = {
  fontSize: 12,
  color: '#9ca3af',
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
}

function calcScore(p) {
  let s = 0
  if (p.first_name)     s += 15
  if (p.last_name)      s += 10
  if (p.branch)         s += 20
  if (p.year)           s += 10
  if (p.location)       s += 10
  if (p.skills?.length) s += 20
  if (p.resume_url)     s += 10
  if (p.about)          s += 5
  return s
}

// Detect if a Google Drive link is set to "Restricted" instead of "Anyone with the link"
// We can't fully verify this client-side, but we can at least catch obviously wrong formats
function looksLikeValidShareLink(url) {
  if (!url) return true // empty is fine, not an error
  const lower = url.toLowerCase()
  if (lower.includes('drive.google.com')) {
    // A proper shareable link contains /file/d/ or open?id=
    return lower.includes('/file/d/') || lower.includes('open?id=') || lower.includes('/folders/')
  }
  return true // any other URL (LinkedIn, personal site, etc.) — can't validate, allow it
}

export default function Profile() {
  const [form, setForm] = useState({
    first_name: '',
    last_name:  '',
    branch:     '',
    year:       '',
    location:   '',
    skills:     [],
    resume_url: '',
    about:      '',
  })
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [score,      setScore]      = useState(0)

  useEffect(() => {
    profileApi.get()
      .then((r) => {
        if (r.data) {
          const d = {
            first_name: r.data.first_name ?? '',
            last_name:  r.data.last_name  ?? '',
            branch:     r.data.branch     ?? '',
            year:       r.data.year       ?? '',
            location:   r.data.location   ?? '',
            about:      r.data.about      ?? '',
            resume_url: r.data.resume_url ?? '',
            skills:     r.data.skills     || [],
          }
          setForm(d)
          setScore(calcScore(d))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateForm = (updates) => {
    const f = { ...form, ...updates }
    setForm(f)
    setScore(calcScore(f))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!looksLikeValidShareLink(form.resume_url)) {
      toast.error('This looks like a Google Drive link, but it may not be set to "Anyone with the link." Please check sharing settings.')
      return
    }

    setSaving(true)
    try {
      await profileApi.update(form)
      toast.success('Profile saved!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = (s) => {
    const t = (s || skillInput).trim()
    if (t && !form.skills.includes(t)) {
      updateForm({ skills: [...form.skills, t] })
      setSkillInput('')
    }
  }

  const focusBorder = (e) => { e.target.style.borderColor = '#3b82f6' }
  const blurBorder  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 820 }}>
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="glass-card" style={{ height: 130 }} />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 820 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, background: 'rgba(59,130,246,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={21} color="#60a5fa" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>My Profile</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Complete your profile for AI-matched job recommendations</p>
        </div>
      </div>

      <ProfileCompleteness score={score} />

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Personal Info */}
        <div className="glass-card" style={{ padding: 22 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db', marginBottom: 18 }}>
            Personal Information
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>First Name</label>
              <input style={inp} placeholder="Tanvi" value={form.first_name}
                onChange={(e) => updateForm({ first_name: e.target.value })}
                onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={lbl}>Last Name</label>
              <input style={inp} placeholder="Sable" value={form.last_name}
                onChange={(e) => updateForm({ last_name: e.target.value })}
                onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <div>
              <label style={lbl}>Branch / Stream</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.branch}
                onChange={(e) => updateForm({ branch: e.target.value })}>
                <option value="">Select branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Year of Study</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.year ?? ''}
                onChange={(e) => updateForm({ year: e.target.value ? Number(e.target.value) : '' })}>
                <option value="">Select year</option>
                {YEARS.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Location</label>
            <input style={inp} placeholder="Nagpur, Maharashtra" value={form.location}
              onChange={(e) => updateForm({ location: e.target.value })}
              onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={lbl}>About</label>
            <textarea style={{ ...inp, resize: 'none' }} rows={3}
              placeholder="Brief bio — your interests, career goals..." value={form.about}
              onChange={(e) => updateForm({ about: e.target.value })}
              onFocus={focusBorder} onBlur={blurBorder} />
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>
              Skills <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>({form.skills.length} added)</span>
            </p>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Used for AI job matching</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input style={{ ...inp, flex: 1 }} placeholder="React, Python, SQL — press Enter to add"
              value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              onFocus={focusBorder} onBlur={blurBorder} />
            <button type="button" onClick={() => addSkill()}
              style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Plus size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {form.skills.map((s) => (
              <div key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 99, fontSize: 12, color: '#93c5fd' }}>
                {s}
                <button type="button" onClick={() => updateForm({ skills: form.skills.filter((k) => k !== s) })}
                  style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  <X size={11} />
                </button>
              </div>
            ))}
            {form.skills.length === 0 && (
              <p style={{ fontSize: 12, color: '#4b5563' }}>No skills added. Skills improve your AI job match score.</p>
            )}
          </div>
        </div>

        {/* Resume — paste link only, with strong guidance on how to make it work */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <LinkIcon size={16} color="#60a5fa" />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#d1d5db' }}>Resume Link</p>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
            Paste a public link to your resume. This is used as a reference in the Resume Tailor feature.
          </p>

          <label style={lbl}>Resume Link</label>
          <input
            style={inp}
            placeholder="https://drive.google.com/file/d/..."
            value={form.resume_url}
            onChange={(e) => updateForm({ resume_url: e.target.value })}
            onFocus={focusBorder} onBlur={blurBorder}
          />

          {form.resume_url && (
            <a href={form.resume_url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              Open link to verify it works <ExternalLink size={11} />
            </a>
          )}

          
        </div>

        <button type="submit" disabled={saving}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: '#3b82f6', border: 'none', color: 'white', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'Sora, sans-serif' }}>
          {saving ? (
            <>
              <div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Saving...
            </>
          ) : (
            <><Save size={15} /> Save Profile</>
          )}
        </button>
      </form>
    </div>
  )
}