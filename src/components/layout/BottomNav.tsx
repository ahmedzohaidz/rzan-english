'use client'
import { usePathname, useRouter } from 'next/navigation'
import { HomeIcon, ChatIcon, BookOpenIcon, CameraIcon, MicIcon } from '@/components/ui/Icons'

const LEFT_ITEMS = [
  { href:'/dashboard', label:'الرئيسية', icon:(a:boolean) => <HomeIcon    size={20} color={a ? '#7C3AED' : '#A89CC0'}/> },
  { href:'/story',     label:'قصتي',     icon:(a:boolean) => <BookOpenIcon size={20} color={a ? '#7C3AED' : '#A89CC0'}/> },
]
const RIGHT_ITEMS = [
  { href:'/chat',  label:'المعلمة', icon:(a:boolean) => <ChatIcon size={20} color={a ? '#7C3AED' : '#A89CC0'}/> },
  { href:'/voice', label:'تحدثي',   icon:(a:boolean) => <MicIcon  size={20} color={a ? '#7C3AED' : '#A89CC0'}/> },
]

export default function BottomNav() {
  const path   = usePathname()
  const router = useRouter()

  const isActive = (href:string) => path === href || path.startsWith(href+'/')
  const isCam    = isActive('/camera')

  return (
    <nav style={{
      position:'fixed',bottom:0,left:0,right:0,zIndex:50,
      display:'flex',alignItems:'center',justifyContent:'space-around',
      paddingTop:8,
      paddingBottom:'max(12px, env(safe-area-inset-bottom))',
      background:'rgba(255,255,255,0.97)',
      backdropFilter:'blur(24px)',
      borderTop:'1px solid rgba(124,58,237,0.12)',
      boxShadow:'0 -4px 24px rgba(100,60,180,0.10)',
    }}>
      {/* Left items */}
      {LEFT_ITEMS.map(item => {
        const active = isActive(item.href)
        return (
          <button key={item.href}
            onClick={() => router.push(item.href)}
            style={{
              flex:1,display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:3,padding:'6px 0',
              background:'none',border:'none',cursor:'pointer',
              color: active ? '#7C3AED' : '#A89CC0',
              transition:'color 0.2s',
            }}>
            <div style={{
              background: active ? '#EDE9FE' : 'transparent',
              borderRadius:12,padding:'5px 12px',
              transition:'background 0.2s',
            }}>
              {item.icon(active)}
            </div>
            <span style={{fontFamily:'Tajawal,sans-serif',fontSize:10,fontWeight: active ? 700 : 400}}>
              {item.label}
            </span>
          </button>
        )
      })}

      {/* Center — Camera button (large + prominent) */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,paddingBottom:2}}>
        <button
          onClick={() => router.push('/camera')}
          className={isCam ? '' : 'pulse-glow'}
          style={{
            width:56,height:56,borderRadius:'50%',border:'none',
            background: isCam
              ? 'linear-gradient(135deg,#5B21B6,#7C3AED)'
              : 'linear-gradient(135deg,#7C3AED,#A855F7)',
            display:'flex',alignItems:'center',justifyContent:'center',
            cursor:'pointer',
            boxShadow: isCam
              ? '0 4px 20px rgba(91,33,182,0.5)'
              : '0 6px 24px rgba(124,58,237,0.45)',
            transform: isCam ? 'scale(0.92)' : 'scale(1)',
            transition:'all 0.2s ease',
            marginTop:-20,
          }}>
          <CameraIcon size={24} color="white"/>
        </button>
        <span style={{
          fontFamily:'Tajawal,sans-serif',fontSize:10,
          color: isCam ? '#7C3AED' : '#A89CC0',
          fontWeight: isCam ? 700 : 400,
        }}>
          الكاميرا
        </span>
      </div>

      {/* Right items */}
      {RIGHT_ITEMS.map(item => {
        const active = isActive(item.href)
        return (
          <button key={item.href}
            onClick={() => router.push(item.href)}
            style={{
              flex:1,display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:3,padding:'6px 0',
              background:'none',border:'none',cursor:'pointer',
              color: active ? '#7C3AED' : '#A89CC0',
              transition:'color 0.2s',
            }}>
            <div style={{
              background: active ? '#EDE9FE' : 'transparent',
              borderRadius:12,padding:'5px 12px',
              transition:'background 0.2s',
            }}>
              {item.icon(active)}
            </div>
            <span style={{fontFamily:'Tajawal,sans-serif',fontSize:10,fontWeight: active ? 700 : 400}}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
