'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { Compass, Lock, Mail, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign in with Firebase Auth (client SDK)
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()

      // Exchange the ID token for a session cookie (server-side)
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Authentication failed')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      // Map Firebase auth errors to user-friendly messages
      const code = err?.code || ''
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-email'
      ) {
        setError('Wrong email or password. Try again.')
      } else if (err.message === 'Unauthorized: not an admin account') {
        setError('This account does not have admin access.')
      } else {
        setError('Wrong email or password. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-forest grain-overlay flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-rust/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 border border-gold/30 rounded-full mb-4">
            <Compass className="text-gold" size={28} />
          </div>
          <h1 className="font-fraunces text-3xl font-bold text-cream">
            Traveling With Rishi
          </h1>
          <p className="text-cream-muted text-sm mt-1 font-data tracking-widest uppercase">
            Admin Dashboard
          </p>
        </div>

        {/* Login card */}
        <div className="bg-forest-light border border-gold/15 rounded-2xl p-8 shadow-card">
          <h2 className="font-fraunces text-xl text-cream mb-6">
            Sign in to continue
          </h2>

          {error && (
            <div className="flex items-center gap-2 bg-rust/10 border border-rust/30 text-rust-light rounded-lg p-3 mb-5 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="admin-label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-dim" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="admin-input pl-9"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="admin-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-dim" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="admin-input pl-9"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-cream-dim text-xs text-center mt-6">
            This is a private admin area. If you're looking for the site,{' '}
            <a href="/" className="text-gold hover:underline">head this way →</a>
          </p>
        </div>
      </div>
    </div>
  )
}
