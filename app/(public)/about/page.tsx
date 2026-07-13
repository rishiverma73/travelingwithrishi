import type { Metadata } from 'next'
import { getSiteSettings, getTripAggregate, getDestinations } from '@/lib/firebase/firestore'
import Link from 'next/link'
import { Compass, Instagram, Twitter, Youtube, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind Traveling With Rishi — chasing every state and union territory of India.',
}

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const [settings, aggregate, destinations] = await Promise.all([
    getSiteSettings(),
    getTripAggregate(true),
    getDestinations({ withTripCounts: true }),
  ])

  const visitedCount = destinations.filter((d: any) => (d.trips?.length ?? 0) > 0).length

  const aboutText = settings.aboutText
  const socialLinks = settings.socialLinks

  const aboutParagraphs = aboutText.split('\n\n').filter(Boolean)

  return (
    <div>
      {/* Hero */}
      <section className="py-24 px-4 sm:px-6 grain-overlay relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold" />
            <span className="font-data text-gold text-xs tracking-widest uppercase">About</span>
          </div>
          <h1 className="font-fraunces text-5xl sm:text-6xl text-cream leading-tight mb-6">
            {settings.aboutTitle}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Stats in a strip */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center p-5 bg-forest-light border border-gold/10 rounded-xl">
              <div className="font-fraunces text-3xl text-gold mb-1">{visitedCount}</div>
              <div className="font-data text-xs text-cream-muted uppercase tracking-wider">Visited</div>
            </div>
            <div className="text-center p-5 bg-forest-light border border-gold/10 rounded-xl">
              <div className="font-fraunces text-3xl text-gold mb-1">{36 - visitedCount}</div>
              <div className="font-data text-xs text-cream-muted uppercase tracking-wider">To Go</div>
            </div>
            <div className="text-center p-5 bg-forest-light border border-gold/10 rounded-xl">
              <div className="font-fraunces text-3xl text-gold mb-1">{aggregate.count}</div>
              <div className="font-data text-xs text-cream-muted uppercase tracking-wider">Stories</div>
            </div>
          </div>

          {/* About text as parchment panel */}
          <div className="parchment-panel rounded-2xl p-8 sm:p-12 mb-8">
            <div className="w-10 h-10 bg-[#C9972C]/15 border border-[#C9972C]/30 rounded-full flex items-center justify-center mb-6">
              <Compass size={18} className="text-[#C9972C]" />
            </div>

            {aboutParagraphs.map((para, i) => (
              <p key={i} className="font-inter text-[#3A2E1E] leading-relaxed mb-5 text-base">
                {para}
              </p>
            ))}

            {/* Personal sign-off */}
            <div className="mt-8 pt-6 border-t border-[#C9972C]/20">
              <p className="font-caveat text-2xl text-[#7B4A1F] italic">
                — Rishi
              </p>
            </div>
          </div>

          {/* Social links */}
          {Object.values(socialLinks).some(Boolean) && (
            <div className="bg-forest-light border border-gold/10 rounded-2xl p-6">
              <h2 className="font-fraunces text-xl text-cream mb-4">Follow the Journey</h2>
              <div className="flex flex-wrap gap-3">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-cream-muted hover:text-cream text-sm">
                    <Instagram size={16} className="text-gold" /> Instagram
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-cream-muted hover:text-cream text-sm">
                    <Twitter size={16} className="text-gold" /> Twitter
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-cream-muted hover:text-cream text-sm">
                    <Youtube size={16} className="text-gold" /> YouTube
                  </a>
                )}
                {socialLinks.email && (
                  <a href={`mailto:${socialLinks.email}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-cream-muted hover:text-cream text-sm">
                    <Mail size={16} className="text-gold" /> Email
                  </a>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base">
              <Compass size={18} /> Explore the Passport Wall
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
