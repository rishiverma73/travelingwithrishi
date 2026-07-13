import type { Metadata } from 'next'
import { getDestinations } from '@/lib/firebase/firestore'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'India Map',
  description: 'Visual map of all Indian states and union territories — visited and yet to visit.',
}

export const dynamic = 'force-dynamic'

// State abbreviations for the visual grid map
const STATE_GRID: Array<{ name: string; slug: string; abbr: string; gridCol: number; gridRow: number }> = [
  { name: 'Jammu & Kashmir', slug: 'jammu-kashmir', abbr: 'J&K', gridCol: 3, gridRow: 1 },
  { name: 'Ladakh', slug: 'ladakh', abbr: 'LA', gridCol: 4, gridRow: 1 },
  { name: 'Himachal Pradesh', slug: 'himachal-pradesh', abbr: 'HP', gridCol: 3, gridRow: 2 },
  { name: 'Punjab', slug: 'punjab', abbr: 'PB', gridCol: 2, gridRow: 2 },
  { name: 'Chandigarh', slug: 'chandigarh', abbr: 'CH', gridCol: 3, gridRow: 3 },
  { name: 'Haryana', slug: 'haryana', abbr: 'HR', gridCol: 3, gridRow: 4 },
  { name: 'Delhi', slug: 'delhi', abbr: 'DL', gridCol: 3, gridRow: 5 },
  { name: 'Uttarakhand', slug: 'uttarakhand', abbr: 'UK', gridCol: 4, gridRow: 3 },
  { name: 'Rajasthan', slug: 'rajasthan', abbr: 'RJ', gridCol: 2, gridRow: 5 },
  { name: 'Uttar Pradesh', slug: 'uttar-pradesh', abbr: 'UP', gridCol: 4, gridRow: 5 },
  { name: 'Bihar', slug: 'bihar', abbr: 'BR', gridCol: 5, gridRow: 5 },
  { name: 'Sikkim', slug: 'sikkim', abbr: 'SK', gridCol: 6, gridRow: 3 },
  { name: 'Arunachal Pradesh', slug: 'arunachal-pradesh', abbr: 'AR', gridCol: 8, gridRow: 3 },
  { name: 'Assam', slug: 'assam', abbr: 'AS', gridCol: 7, gridRow: 4 },
  { name: 'West Bengal', slug: 'west-bengal', abbr: 'WB', gridCol: 6, gridRow: 5 },
  { name: 'Meghalaya', slug: 'meghalaya', abbr: 'ML', gridCol: 7, gridRow: 5 },
  { name: 'Tripura', slug: 'tripura', abbr: 'TR', gridCol: 7, gridRow: 6 },
  { name: 'Mizoram', slug: 'mizoram', abbr: 'MZ', gridCol: 8, gridRow: 6 },
  { name: 'Manipur', slug: 'manipur', abbr: 'MN', gridCol: 8, gridRow: 5 },
  { name: 'Nagaland', slug: 'nagaland', abbr: 'NL', gridCol: 8, gridRow: 4 },
  { name: 'Madhya Pradesh', slug: 'madhya-pradesh', abbr: 'MP', gridCol: 3, gridRow: 6 },
  { name: 'Chhattisgarh', slug: 'chhattisgarh', abbr: 'CG', gridCol: 4, gridRow: 6 },
  { name: 'Jharkhand', slug: 'jharkhand', abbr: 'JH', gridCol: 5, gridRow: 6 },
  { name: 'Odisha', slug: 'odisha', abbr: 'OD', gridCol: 5, gridRow: 7 },
  { name: 'Gujarat', slug: 'gujarat', abbr: 'GJ', gridCol: 1, gridRow: 6 },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', slug: 'dadra-nagar-haveli-daman-diu', abbr: 'DD', gridCol: 1, gridRow: 7 },
  { name: 'Maharashtra', slug: 'maharashtra', abbr: 'MH', gridCol: 2, gridRow: 7 },
  { name: 'Telangana', slug: 'telangana', abbr: 'TS', gridCol: 3, gridRow: 8 },
  { name: 'Andhra Pradesh', slug: 'andhra-pradesh', abbr: 'AP', gridCol: 4, gridRow: 8 },
  { name: 'Goa', slug: 'goa', abbr: 'GA', gridCol: 2, gridRow: 8 },
  { name: 'Karnataka', slug: 'karnataka', abbr: 'KA', gridCol: 3, gridRow: 9 },
  { name: 'Tamil Nadu', slug: 'tamil-nadu', abbr: 'TN', gridCol: 4, gridRow: 9 },
  { name: 'Kerala', slug: 'kerala', abbr: 'KL', gridCol: 3, gridRow: 10 },
  { name: 'Puducherry', slug: 'puducherry', abbr: 'PY', gridCol: 4, gridRow: 10 },
  { name: 'Lakshadweep', slug: 'lakshadweep', abbr: 'LD', gridCol: 2, gridRow: 10 },
  { name: 'Andaman & Nicobar Islands', slug: 'andaman-nicobar', abbr: 'AN', gridCol: 6, gridRow: 9 },
]

export default async function MapPage() {
  const destinations = await getDestinations({ withTripCounts: true })

  const visitedSlugs = new Set(
    destinations.filter((d: any) => (d.trips?.length ?? 0) > 0).map((d: any) => d.slug)
  )

  const destMap = new Map(destinations.map((d: any) => [d.slug, d]))

  const visitedCount = visitedSlugs.size

  return (
    <div>
      <section className="py-20 px-4 sm:px-6 grain-overlay">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="font-data text-gold text-xs tracking-widest uppercase">Visual Map</span>
          </div>
          <h1 className="font-fraunces text-5xl sm:text-6xl text-cream mb-4 leading-tight">
            India — State by State
          </h1>
          <p className="text-cream-muted max-w-lg mb-4">
            A schematic grid showing all 36 Indian states and union territories.
            Highlighted in gold = visited with stories.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gold/40 border border-gold" />
              <span className="text-cream-muted">Visited ({visitedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-dashed border-cream-dim/30" />
              <span className="text-cream-muted">Yet to visit ({36 - visitedCount})</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Grid map */}
          <div
            className="grid gap-2 mb-12"
            style={{
              gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(10, 60px)',
            }}
          >
            {STATE_GRID.map(cell => {
              const dest = destMap.get(cell.slug)
              const isVisited = visitedSlugs.has(cell.slug)

              return (
                <Link
                  key={cell.slug}
                  href={`/${cell.slug}`}
                  className="group relative flex flex-col items-center justify-center rounded-xl transition-all border text-center overflow-hidden hover:scale-105 hover:z-10"
                  style={{
                    gridColumn: cell.gridCol,
                    gridRow: cell.gridRow,
                    background: isVisited
                      ? `${(dest as any)?.accentColor || '#C9972C'}25`
                      : 'rgba(13, 31, 26, 0.6)',
                    borderColor: isVisited
                      ? ((dest as any)?.accentColor || '#C9972C') + '70'
                      : 'rgba(138, 158, 150, 0.15)',
                    borderStyle: isVisited ? 'solid' : 'dashed',
                  }}
                  title={cell.name}
                >
                  <div
                    className="font-data text-center font-bold"
                    style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.05em',
                      color: isVisited ? ((dest as any)?.accentColor || '#C9972C') : '#3A4E48',
                    }}
                  >
                    {cell.abbr}
                  </div>
                  {isVisited && (
                    <div
                      className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: (dest as any)?.accentColor || '#C9972C' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* State list */}
          <div>
            <h2 className="font-fraunces text-2xl text-cream mb-6">All Destinations</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {destinations
                .sort((a: any, b: any) => a.name.localeCompare(b.name))
                .map((dest: any) => {
                  const isVisited = (dest.trips?.length ?? 0) > 0
                  return (
                    <Link
                      key={dest.id}
                      href={`/${dest.slug}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl border transition-all hover:border-gold/30 group"
                      style={{
                        borderColor: isVisited
                          ? `${dest.accentColor}40`
                          : 'rgba(90, 110, 104, 0.15)',
                        background: isVisited
                          ? `${dest.accentColor}08`
                          : 'rgba(13, 31, 26, 0.4)',
                      }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: isVisited ? dest.accentColor : '#3A4E48',
                        }}
                      />
                      <div>
                        <div className={`text-sm font-medium leading-tight ${isVisited ? 'text-cream' : 'text-cream-dim'}`}>
                          {dest.name}
                        </div>
                        <div className="text-xs text-cream-dim">
                          {isVisited
                           ? `${dest.trips?.length ?? 0} trip${(dest.trips?.length ?? 0) !== 1 ? 's' : ''}`
                            : 'Not visited'}
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
