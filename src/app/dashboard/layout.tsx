import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/20 bg-mesh p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
