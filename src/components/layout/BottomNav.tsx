'use client'
import { usePathname, useRouter } from 'next/navigation'
import { NavItem, HomeIcon, ChatIcon, BookOpenIcon, CameraIcon, MicIcon } from '@/components/ui/Icons'

const NAV = [
  {
    href:  '/dashboard',
    label: 'الرئيسية',
    icon:  (active: boolean) => (
      <HomeIcon size={18} color={active ? 'white' : 'var(--text-soft)'} />
    ),
  },
  {
    href:  '/chat',
    label: 'المعلمة',
    icon:  (active: boolean) => (
      <ChatIcon size={18} color={active ? 'white' : 'var(--text-soft)'} />
    ),
  },
  {
    href:  '/story',
    label: 'قصتي',
    icon:  (active: boolean) => (
      <BookOpenIcon size={18} color={active ? 'white' : 'var(--text-soft)'} />
    ),
  },
  {
    href:  '/camera',
    label: 'الكاميرا',
    icon:  (active: boolean) => (
      <CameraIcon size={18} color={active ? 'white' : 'var(--text-soft)'} />
    ),
  },
  {
    href:  '/voice',
    label: 'تحدثي',
    icon:  (active: boolean) => (
      <MicIcon size={18} color={active ? 'white' : 'var(--text-soft)'} />
    ),
  },
]

export default function BottomNav() {
  const path   = usePathname()
  const router = useRouter()

  return (
    <nav
      style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        zIndex:        50,
        display:       'flex',
        justifyContent:'space-around',
        alignItems:    'center',
        paddingTop:    8,
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        paddingLeft:   4,
        paddingRight:  4,
        background:    'rgba(255,255,255,0.97)',
        backdropFilter:'blur(20px)',
        borderTop:     '1px solid rgba(232,213,192,0.6)',
        boxShadow:     '0 -4px 24px rgba(180,120,80,0.08)',
      }}
    >
      {NAV.map(item => {
        const active = path === item.href || path.startsWith(item.href + '/')
        return (
          <NavItem
            key={item.href}
            icon={item.icon(active)}
            active={active}
            label={item.label}
            onClick={() => router.push(item.href)}
          />
        )
      })}
    </nav>
  )
}
