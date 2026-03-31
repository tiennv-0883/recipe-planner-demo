import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <BottomNav />
      <div className="sm:pl-60">
        <main className="min-h-screen px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
