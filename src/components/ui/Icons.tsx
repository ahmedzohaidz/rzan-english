/**
 * Rzan English — Icon Library
 * Clean SVG icons matching the Magical Parchment palette.
 * All icons: 24×24 viewBox, strokeWidth 1.8, rounded caps/joins.
 */

interface IconProps {
  size?:   number
  color?:  string
  className?: string
  style?:  React.CSSProperties
}

const defaults = { size: 24, color: 'currentColor' }

/* ─── Navigation ─────────────────────────────────── */

export function HomeIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  )
}

export function ChatIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M8 10h.01M12 10h.01M16 10h.01"/>
    </svg>
  )
}

export function BookOpenIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

export function CameraIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

export function MicIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="9" y="2" width="6" height="12" rx="3"/>
      <path d="M5 10a7 7 0 0 0 14 0"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="9"  y1="22" x2="15" y2="22"/>
    </svg>
  )
}

/* ─── Dashboard actions ──────────────────────────── */

export function PenIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  )
}

export function StarIcon({ size = defaults.size, color = defaults.color, filled = false, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

export function TrophyIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 9a6 6 0 0 0 12 0"/>
      <line x1="12" y1="15" x2="12" y2="19"/>
      <rect x="7" y="19" width="10" height="3" rx="1"/>
      <path d="M6 2H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h0"/>
      <path d="M18 2h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h0"/>
    </svg>
  )
}

export function FlameIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M8.5 14.5A6 6 0 0 0 12 21a6 6 0 0 0 3.5-6.5C14 12 12 10 12 7c0 0-2.5 2-3.5 7.5z"/>
      <path d="M12 7c0 0 1-3 3-4 0 3 2 5 2 8a5 5 0 0 1-5 5"/>
    </svg>
  )
}

export function BookmarkIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

export function SparkleIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>
      <path d="M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  )
}

export function GiftIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5" rx="1"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  )
}

export function ChartIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  )
}

export function ShieldIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

export function CheckIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export function LockIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

export function SendIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

export function UserIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export function ArrowLeftIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}

export function RefreshIcon({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  )
}

/* ─── Filled nav icon wrappers (with gradient bg circle) ─── */
interface NavIconProps {
  icon:    React.ReactNode
  active:  boolean
  label:   string
  onClick: () => void
}

export function NavItem({ icon, active, label, onClick }: NavIconProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           3,
        padding:       '6px 10px',
        borderRadius:  16,
        border:        'none',
        cursor:        'pointer',
        background:    active ? 'rgba(232,120,154,0.12)' : 'transparent',
        transition:    'all 0.2s',
        minWidth:      54,
      }}
    >
      <span style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          32,
        height:         32,
        borderRadius:   10,
        background:     active
          ? 'linear-gradient(135deg,#E8789A,#9B72CF)'
          : 'transparent',
        transition:     'all 0.2s',
      }}>
        {icon}
      </span>
      <span style={{
        fontSize:   10,
        fontWeight: active ? 700 : 500,
        fontFamily: 'Tajawal, sans-serif',
        color:      active ? 'var(--rose-dark)' : 'var(--text-soft)',
        lineHeight: 1,
      }}>
        {label}
      </span>
    </button>
  )
}
