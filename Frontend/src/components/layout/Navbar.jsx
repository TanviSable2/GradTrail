import { Sun, Moon, Menu, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import SearchBar from '../ui/SearchBar'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onMenuClick }) {
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  return (
    <header style={{
      height: 60,
      background: 'rgba(15,15,15,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      flexShrink: 0,
    }}>
      <button
        onClick={onMenuClick}
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }}
        className="show-mobile"
      >
        <Menu size={19} />
      </button>

      <div style={{ flex: 1, maxWidth: 320 }}>
        <SearchBar
          placeholder="Search jobs, companies..."
          onSearch={(q) => q.length > 2 && navigate(`/jobs?q=${q}`)}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 7, borderRadius: 8, display: 'flex', position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, background: '#3b82f6', borderRadius: '50%' }} />
        </button>
        <button onClick={toggle} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 7, borderRadius: 8, display: 'flex' }}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}