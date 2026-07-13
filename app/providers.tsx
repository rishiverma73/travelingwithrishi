'use client'

// NextAuth SessionProvider removed — authentication is now handled
// via Firebase Auth + session cookies. This providers wrapper is kept
// for any future client-side providers.
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
