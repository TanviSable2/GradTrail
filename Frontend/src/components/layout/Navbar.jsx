export default function Navbar({ onMenuClick }) {
  // Only needed for mobile hamburger
  return (
    <header style={{
      height: 48,
      background: '#0f0f0f',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      flexShrink: 0,
    }}>
      <button
        onClick={onMenuClick}
        className="show-mobile"
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4, borderRadius: 6, fontSize: 18, display: 'none' }}
      >
        ☰
      </button>
    </header>
  )
}