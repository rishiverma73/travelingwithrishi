'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import {
  LayoutDashboard,
  MapPin,
  BookOpen,
  Image,
  Settings,
  Compass,
  LogOut,
  Globe,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/destinations', label: 'Destinations', icon: MapPin, exact: false },
  { href: '/admin/trips', label: 'Trips', icon: BookOpen, exact: false },
  { href: '/admin/media', label: 'Media', icon: Image, exact: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    try {
      // Clear the session cookie on the server
      await fetch('/api/auth/session', { method: 'DELETE' })
      // Sign out of Firebase client-side too
      await signOut(auth)
      router.push('/admin/login')
    } catch {
      router.push('/admin/login')
    }
  }

  return (
    <aside className="admin-sidebar fixed left-0 top-0 h-full w-60 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gold/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold/15 border border-gold/30 rounded-lg flex items-center justify-center">
            <Compass size={16} className="text-gold" />
          </div>
          <div>
            <div className="text-cream text-sm font-semibold leading-tight">Traveling</div>
            <div className="text-gold text-xs font-data tracking-wider">WITH RISHI</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-gold/15 text-gold border border-gold/25'
                  : 'text-cream-muted hover:text-cream hover:bg-white/5'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer links */}
      <div className="p-3 border-t border-gold/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream-muted hover:text-cream hover:bg-white/5 transition-all"
        >
          <Globe size={16} />
          View Public Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream-muted hover:text-rust-light hover:bg-rust/5 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
