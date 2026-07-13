import Link from 'next/link'
import { Compass, Search, BookOpen, MapPin, Info } from 'lucide-react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-forest">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gold/10 backdrop-blur-md bg-forest/80">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gold/15 border border-gold/30 rounded-lg flex items-center justify-center group-hover:bg-gold/25 transition-colors">
              <Compass size={16} className="text-gold" />
            </div>
            <div>
              <span className="font-fraunces text-cream font-semibold text-lg leading-none">
                Traveling With Rishi
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/journeys"
              className="px-3 py-2 text-sm text-cream-muted hover:text-cream transition-colors hidden sm:flex items-center gap-1.5"
            >
              <BookOpen size={14} />
              <span>Journeys</span>
            </Link>
            <Link
              href="/map"
              className="px-3 py-2 text-sm text-cream-muted hover:text-cream transition-colors hidden sm:flex items-center gap-1.5"
            >
              <MapPin size={14} />
              <span>Map</span>
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 text-sm text-cream-muted hover:text-cream transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Info size={14} />
              <span>About</span>
            </Link>
            <Link
              href="/search"
              className="ml-1 p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-white/5 transition-colors"
            >
              <Search size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gold/10 mt-24 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Compass size={16} className="text-gold" />
                <span className="font-fraunces text-cream font-semibold">Traveling With Rishi</span>
              </div>
              <p className="text-cream-dim text-sm leading-relaxed">
                Chasing every state of India, one story at a time.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-data uppercase tracking-wider text-cream-muted mb-3">Explore</h3>
              <div className="space-y-2">
                <Link href="/" className="block text-sm text-cream-dim hover:text-cream transition-colors">Home</Link>
                <Link href="/journeys" className="block text-sm text-cream-dim hover:text-cream transition-colors">All Journeys</Link>
                <Link href="/map" className="block text-sm text-cream-dim hover:text-cream transition-colors">India Map</Link>
                <Link href="/about" className="block text-sm text-cream-dim hover:text-cream transition-colors">About</Link>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-data uppercase tracking-wider text-cream-muted mb-3">Regions</h3>
              <div className="space-y-2">
                {['North India', 'South India', 'East India', 'West India', 'Northeast India'].map(r => (
                  <Link
                    key={r}
                    href={`/journeys?region=${encodeURIComponent(r)}`}
                    className="block text-sm text-cream-dim hover:text-cream transition-colors"
                  >
                    {r}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gold/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-cream-dim text-xs font-data">
              © {new Date().getFullYear()} Traveling With Rishi. Every state, one story.
            </p>
            <Link href="/admin" className="text-cream-dim text-xs hover:text-gold transition-colors">
              Admin →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
