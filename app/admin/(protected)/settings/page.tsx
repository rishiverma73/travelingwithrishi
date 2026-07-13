'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface Settings {
  id: string
  aboutTitle: string
  aboutText: string
  socialLinks: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [form, setForm] = useState({
    aboutTitle: '',
    aboutText: '',
    socialLinks: { instagram: '', twitter: '', youtube: '', email: '' },
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data)
        setForm({
          aboutTitle: data.aboutTitle || '',
          aboutText: data.aboutText || '',
          socialLinks: JSON.parse(data.socialLinks || '{}'),
        })
      })
  }, [])

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setMessage({ type: 'success', text: 'Settings saved!' })
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMessage({ type: '', text: '' })
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setPwSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setPwMessage({ type: 'success', text: 'Password updated! You\'ll need to sign in again.' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e: any) {
      setPwMessage({ type: 'error', text: e.message })
    } finally {
      setPwSaving(false)
    }
  }

  if (!settings) {
    return <div className="text-cream-muted">Loading…</div>
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-fraunces text-3xl text-cream mb-1">Settings</h1>
        <p className="text-cream-muted text-sm">Manage site content and your account.</p>
      </div>

      {/* About section */}
      <form onSubmit={handleSaveSettings} className="bg-forest-light border border-gold/10 rounded-xl p-6 space-y-5">
        <h2 className="font-fraunces text-lg text-cream">About This Journey</h2>

        {message.text && (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-sage/10 border border-sage/30 text-sage-light'
              : 'bg-rust/10 border border-rust/30 text-rust-light'
          }`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div>
          <label className="admin-label">Page Title</label>
          <input
            className="admin-input"
            value={form.aboutTitle}
            onChange={e => setForm(f => ({ ...f, aboutTitle: e.target.value }))}
          />
        </div>

        <div>
          <label className="admin-label">About Text</label>
          <textarea
            className="admin-input resize-y"
            rows={8}
            value={form.aboutText}
            onChange={e => setForm(f => ({ ...f, aboutText: e.target.value }))}
            placeholder="Write a personal note about your travel mission…"
          />
        </div>

        <div>
          <label className="admin-label">Social Links</label>
          <div className="space-y-3">
            {(['instagram', 'twitter', 'youtube', 'email'] as const).map(platform => (
              <div key={platform} className="flex items-center gap-3">
                <span className="text-cream-muted text-sm w-20 capitalize">{platform}</span>
                <input
                  className="admin-input flex-1"
                  type={platform === 'email' ? 'email' : 'url'}
                  value={form.socialLinks[platform] || ''}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      socialLinks: { ...f.socialLinks, [platform]: e.target.value },
                    }))
                  }
                  placeholder={platform === 'email' ? 'you@email.com' : `https://${platform}.com/yourhandle`}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>

      {/* Password section */}
      <form onSubmit={handleChangePassword} className="bg-forest-light border border-gold/10 rounded-xl p-6 space-y-5">
        <h2 className="font-fraunces text-lg text-cream">Change Password</h2>

        {pwMessage.text && (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            pwMessage.type === 'success'
              ? 'bg-sage/10 border border-sage/30 text-sage-light'
              : 'bg-rust/10 border border-rust/30 text-rust-light'
          }`}>
            {pwMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {pwMessage.text}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="admin-label">Current Password</label>
            <input
              type="password"
              className="admin-input"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="admin-label">New Password</label>
            <input
              type="password"
              className="admin-input"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="admin-label">Confirm New Password</label>
            <input
              type="password"
              className="admin-input"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={pwSaving} className="btn-primary">
          {pwSaving ? 'Updating…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
