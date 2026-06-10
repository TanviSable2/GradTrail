import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search...', onSearch, className }) {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }} className={className}>
      <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '9px 36px',
          fontSize: 13,
          color: 'white',
          outline: 'none',
        }}
        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      {value && (
        <button onClick={() => { setValue(''); onSearch?.('') }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex' }}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}