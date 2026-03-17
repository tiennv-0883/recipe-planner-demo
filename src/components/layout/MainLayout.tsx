import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-60">
        <main className="min-h-screen px-6 py-8" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
