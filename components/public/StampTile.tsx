'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface StampTileProps {
  destination: {
    id: string
    name: string
    slug: string
    type: string
    region: string | null
    accentColor: string
    trips: Array<{ id: string; rating: number; photos: Array<{ url: string; isCoverPhoto: boolean }> }>
  }
  index: number
}

const regionAbbreviations: Record<string, string> = {
  'North India': 'N. INDIA',
  'South India': 'S. INDIA',
  'East India': 'E. INDIA',
  'West India': 'W. INDIA',
  'Northeast India': 'NE INDIA',
  'Central India': 'C. INDIA',
  'International': 'INTL',
}

export function StampTile({ destination, index }: StampTileProps) {
  const isVisited = destination.trips.length > 0
  const rotation = ((index * 7) % 7) - 3 // -3 to +3 degrees, deterministic

  const coverPhoto = destination.trips
    .flatMap(t => t.photos)
    .find(p => p.isCoverPhoto) || destination.trips.flatMap(t => t.photos)[0]

  return (
    <motion.div
      initial={{ scale: 0.3, rotate: rotation - 10, opacity: 0 }}
      animate={{ scale: 1, rotate: rotation, opacity: 1 }}
      transition={{
        delay: index * 0.018,
        duration: 0.4,
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      whileHover={{
        scale: 1.05,
        rotate: 0,
        zIndex: 10,
        transition: { duration: 0.15 },
      }}
    >
      <Link href={`/${destination.slug}`} className="block">
        <div
          className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-shadow ${
            isVisited ? 'stamp-tile-visited shadow-stamp' : 'stamp-tile-unvisited'
          }`}
          style={{
            '--stamp-rotation': `${rotation}deg`,
          } as React.CSSProperties}
        >
          {/* Background photo for visited */}
          {isVisited && coverPhoto && (
            <div className="absolute inset-0">
              <img
                src={coverPhoto.url}
                alt=""
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest/30 to-forest/80" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-2 text-center">
            {/* Stamp circle decoration */}
            {isVisited && (
              <div
                className="absolute inset-2 rounded-lg border-2 opacity-40"
                style={{ borderColor: destination.accentColor }}
              />
            )}

            {/* Region label */}
            {destination.region && (
              <div
                className="font-data text-center mb-1 leading-none"
                style={{
                  fontSize: '0.45rem',
                  letterSpacing: '0.12em',
                  color: isVisited ? destination.accentColor : '#5A6E68',
                  textTransform: 'uppercase',
                }}
              >
                {regionAbbreviations[destination.region] || destination.region}
              </div>
            )}

            {/* Destination name */}
            <div
              className={`font-fraunces font-bold leading-tight text-center ${
                isVisited ? 'text-cream' : 'text-cream-dim'
              }`}
              style={{ fontSize: 'clamp(0.5rem, 1.4vw, 0.75rem)' }}
            >
              {destination.name}
            </div>

            {/* Type badge */}
            <div
              className="font-data mt-1"
              style={{
                fontSize: '0.4rem',
                letterSpacing: '0.08em',
                color: isVisited ? destination.accentColor : '#3A4E48',
                textTransform: 'uppercase',
              }}
            >
              {destination.type === 'STATE'
                ? 'State'
                : destination.type === 'UNION_TERRITORY'
                ? 'Union Territory'
                : 'Country'}
            </div>

            {/* Visited stamp overlay */}
            {isVisited && (
              <div className="absolute bottom-2 right-2">
                <div
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-white"
                  style={{
                    background: `${destination.accentColor}30`,
                    borderColor: destination.accentColor,
                    fontSize: '0.45rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  <CheckCircle size={6} style={{ color: destination.accentColor }} />
                  <span
                    className="font-data uppercase"
                    style={{ color: destination.accentColor }}
                  >
                    VISITED
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
