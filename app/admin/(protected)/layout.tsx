import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/firebase/admin'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

const SESSION_COOKIE_NAME = '__session'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    redirect('/admin/login')
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    if (!decoded.admin) {
      redirect('/admin/login')
    }
  } catch {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-navy">
      <AdminSidebar />
      <div className="ml-60">
        <main className="p-8 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
