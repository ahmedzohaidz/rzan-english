'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'install-dismissed'

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
}
function isDesktop(): boolean {
  return window.innerWidth >= 1024
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner,     setShowBanner]     = useState(false)
  const [showIOS,        setShowIOS]        = useState(false)
  const [installing,     setInstalling]     = useState(false)

  useEffect(() => {
    // لا تُظهر إذا كان مثبّتاً أو desktop
    if (isInStandaloneMode() || isDesktop()) return
    if (localStorage.getItem(STORAGE_KEY)) return

    // iOS — تعليمات يدوية
    if (isIOS()) {
      const timer = setTimeout(() => setShowIOS(true), 10_000)
      return () => clearTimeout(timer)
    }

    // Android/Chrome — beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const timer = setTimeout(() => setShowBanner(true), 10_000)
      return () => clearTimeout(timer)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setShowBanner(false)
    setShowIOS(false)
  }

  async function install() {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') localStorage.setItem(STORAGE_KEY, '1')
    setDeferredPrompt(null)
    setShowBanner(false)
    setInstalling(false)
  }

  /* ── iOS Banner ───────────────────────────────────── */
  if (showIOS) return (
    <div style={{
      position:   'fixed', bottom: 80, left: 12, right: 12, zIndex: 9999,
      background: 'white', borderRadius: 20,
      boxShadow:  '0 8px 40px rgba(124,58,237,0.2)',
      border:     '1.5px solid rgba(124,58,237,0.15)',
      padding:    '16px 18px',
      animation:  'fadeUp 0.35s ease both',
      fontFamily: 'Tajawal, sans-serif',
      direction:  'rtl',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:28 }}>📱</span>
          <div>
            <p style={{ fontSize:14, fontWeight:900, color:'#3D2B1F', margin:0 }}>ثبّتي التطبيق على جوالك!</p>
            <p style={{ fontSize:12, color:'#7A5C48', margin:'2px 0 0' }}>افتحيه بضغطة واحدة في أي وقت</p>
          </div>
        </div>
        <button onClick={dismiss} style={{ background:'none', border:'none', fontSize:18, color:'#B09080', cursor:'pointer', padding:'0 4px' }}>✕</button>
      </div>
      <div style={{ background:'#F5F0FF', borderRadius:12, padding:'10px 14px', fontSize:13, color:'#5B21B6', lineHeight:1.7 }}>
        <p style={{ margin:0 }}>
          ١. اضغطي على <strong>زر المشاركة</strong> ⬆️ في أسفل المتصفح
        </p>
        <p style={{ margin:'4px 0 0' }}>
          ٢. اختاري <strong>"إضافة إلى الشاشة الرئيسية"</strong> 📲
        </p>
      </div>
      <button onClick={dismiss} style={{
        marginTop:10, width:'100%', padding:'10px 0', borderRadius:12,
        border:'1.5px solid #E8D5C0', background:'transparent',
        fontSize:13, fontWeight:700, color:'#B09080',
        fontFamily:'Tajawal, sans-serif', cursor:'pointer',
      }}>
        لاحقاً
      </button>
    </div>
  )

  /* ── Android Banner ───────────────────────────────── */
  if (!showBanner) return null

  return (
    <div style={{
      position:   'fixed', bottom: 80, left: 12, right: 12, zIndex: 9999,
      background: 'white', borderRadius: 20,
      boxShadow:  '0 8px 40px rgba(124,58,237,0.2)',
      border:     '1.5px solid rgba(124,58,237,0.15)',
      padding:    '16px 18px',
      animation:  'fadeUp 0.35s ease both',
      fontFamily: 'Tajawal, sans-serif',
      direction:  'rtl',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:28 }}>📱</span>
          <div>
            <p style={{ fontSize:14, fontWeight:900, color:'#3D2B1F', margin:0 }}>ثبّتي التطبيق على جوالك!</p>
            <p style={{ fontSize:12, color:'#7A5C48', margin:'2px 0 0' }}>افتحيه بضغطة واحدة في أي وقت</p>
          </div>
        </div>
        <button onClick={dismiss} style={{ background:'none', border:'none', fontSize:18, color:'#B09080', cursor:'pointer', padding:'0 4px' }}>✕</button>
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button
          onClick={install}
          disabled={installing}
          style={{
            flex:1, padding:'12px 0', borderRadius:14, border:'none',
            background: 'linear-gradient(135deg,#7C3AED,#9B72CF)',
            color:'white', fontSize:14, fontWeight:900,
            fontFamily:'Tajawal, sans-serif', cursor:'pointer',
            boxShadow:'0 4px 14px rgba(124,58,237,0.35)',
            opacity: installing ? 0.7 : 1,
          }}
        >
          {installing ? '⏳ جاري التثبيت...' : 'ثبّتي الآن 🚀'}
        </button>
        <button
          onClick={dismiss}
          style={{
            padding:'12px 18px', borderRadius:14,
            border:'1.5px solid #E8D5C0', background:'transparent',
            fontSize:13, fontWeight:700, color:'#B09080',
            fontFamily:'Tajawal, sans-serif', cursor:'pointer',
          }}
        >
          لاحقاً
        </button>
      </div>
    </div>
  )
}
