import BottomNav from '@/components/layout/BottomNav'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#FDF6EC' }}>
      <main className="pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
