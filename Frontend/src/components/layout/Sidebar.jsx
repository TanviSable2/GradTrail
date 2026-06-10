import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, GraduationCap, BookOpen,
  ClipboardList, Bell, BarChart2, User, Building2,
  ChevronLeft, Zap, LogOut, X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs' },
  { path: '/internships', icon: GraduationCap, label: 'Internships' },
  { path: '/courses', icon: BookOpen, label: 'Courses' },
  { path: '/applications', icon: ClipboardList, label: 'Applications' },
  { path: '/reminders', icon: Bell, label: 'Reminders' },
  { path: '/insights', icon: BarChart2, label: 'Insights' },
  { path: '/companies', icon: Building2, label: 'Companies' },
  { path: '/profile', icon: User, label: 'Profile' },
]

const S = {
  aside: {
    height: '100vh',
    background: '#0f0f0f',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  logoIcon: {
    width: 36, height: 36,
    background: '#3b82f6',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: { fontSize: 17, fontWeight: 700, color: 'white', marginLeft: 10 },
  toggleBtn: {
    background: 'transparent', border: 'none',
    color: '#6b7280', cursor: 'pointer',
    padding: 6, borderRadius: 8,
    display: 'flex', alignItems: 'center',
  },
  nav: { flex: 1, overflowY: 'auto', padding: '0 10px' },
  link: (active, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : 10,
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: collapsed ? '10px 0' : '9px 12px',
    borderRadius: 12,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    color: active ? '#60a5fa' : '#6b7280',
    background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
    marginBottom: 2,
    transition: 'all 0.15s',
  }),
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '12px 10px 10px',
  },
  userRow: (collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    marginBottom: 4,
  }),
  avatar: {
    width: 32, height: 32,
    background: 'rgba(59,130,246,0.2)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600, color: '#60a5fa', flexShrink: 0,
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', background: 'transparent', border: 'none',
    color: '#ef4444', cursor: 'pointer',
    padding: '9px 12px', borderRadius: 12,
    fontSize: 13, fontWeight: 500,
    transition: 'background 0.15s',
  },
}

function SidebarContent({ collapsed, onToggle, onMobileClose, isMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={S.logoRow}>
        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <div style={S.logoIcon}><Zap size={16} color="white" /></div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                style={S.logoText}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                GradTrail
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {isMobile ? (
          <button style={S.toggleBtn} onClick={onMobileClose}><X size={18} /></button>
        ) : (
          <button style={S.toggleBtn} onClick={onToggle}>
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronLeft size={17} />
            </motion.div>
          </button>
        )}
      </div>

      <nav style={S.nav}>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onMobileClose}
            style={({ isActive }) => S.link(isActive, collapsed)}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div style={S.footer}>
        <div style={S.userRow(collapsed)}>
          <div style={S.avatar}>{user?.email?.[0]?.toUpperCase() || 'U'}</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ minWidth: 0 }}
              >
                <p style={{ fontSize: 11, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{user?.email}</p>
                <p style={{ fontSize: 10, color: '#6b7280', textTransform: 'capitalize' }}>{user?.role || 'student'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          style={{ ...S.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '10px 0' : '9px 12px' }}
          onClick={() => { logout(); navigate('/') }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop */}
      <motion.aside
        style={S.aside}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="hidden-mobile"
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} onMobileClose={() => {}} isMobile={false} />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              style={{ ...S.aside, position: 'fixed', left: 0, top: 0, width: 240, zIndex: 50 }}
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <SidebarContent collapsed={false} onToggle={() => {}} onMobileClose={onMobileClose} isMobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}