'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Star, Tag, IndianRupee } from 'lucide-react'
import { formatCost, formatDateRange, safeJsonParse, truncate } from '@/lib/utils'

interface TripCardProps {
  trip: {
    id: string
    placeName: string
    slug: string
    cityRegion: string | null
    description: string
    bestPart: string | null
    totalCost: number
    currency: string
    dateFrom: string | null
    dateTo: string | null
    rating: number
    tags: string
    isPublished: boolean
    destination: {
      name: string
      slug: string
      accentColor: string
    }
    photos: Array<{ url: string; isCoverPhoto: boolean }>
  }
  index?: number
}

export function TripCard({ trip, index = 0 }: TripCardProps) {
  const cover = trip.photos.find(p => p.isCoverPhoto) || trip.photos[0]
  const tags = safeJsonParse<string[]>(trip.tags, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link href={`/${trip.destination.slug}/${trip.slug}`} className="group block">
        <article className="bg-parchment rounded-2xl overflow-hidden shadow-card hover:shadow-gold-glow transition-all duration-300 group-hover:translate-y-[-2px] parchment-panel">
          {/* Photo */}
          <div className="aspect-[16/9] overflow-hidden relative">
            {cover ? (
              <img
                src={cover.url}
                alt={trip.placeName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-parchment-dark">
                <div className="text-center">
                  <div className="font-fraunces text-4xl text-parchment-dark/50 mb-1">
                    {trip.destination.name[0]}
                  </div>
                  <div className="text-xs text-parchment-dark/40 font-data uppercase tracking-wider">No photo</div>
                </div>
              </div>
            )}

            {/* Destination badge */}
            <div className="absolute top-3 left-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                style={{ background: trip.destination.accentColor }}
              >
                <MapPin size={10} />
                {trip.destination.name}
              </span>
            </div>

            {/* Rating */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-gold text-xs">{'★'.repeat(trip.rating)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-fraunces text-xl font-bold text-[#2A1F0E] mb-1 group-hover:text-[#7B4A1F] transition-colors">
              {trip.placeName}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-3 text-xs text-[#6B5B40]">
              {trip.dateFrom && (
                <span className="flex items-center gap-1 font-data">
                  <Calendar size={11} />
                  {formatDateRange(trip.dateFrom, trip.dateTo)}
                </span>
              )}
              <span className="flex items-center gap-1 font-data font-semibold text-[#9B3A2A]">
                <IndianRupee size={10} />
                {formatCost(trip.totalCost, trip.currency).replace('₹', '')}
              </span>
            </div>

            {/* Description excerpt */}
            <p className="text-[#4A3828] text-sm leading-relaxed mb-4">
              {truncate(trip.description, 140)}
            </p>

            {/* Best part quote */}
            {trip.bestPart && (
              <blockquote className="border-l-2 border-[#C9972C] pl-3 mb-4">
                <p className="font-caveat text-lg text-[#7B4A1F] leading-snug italic">
                  "{trip.bestPart}"
                </p>
              </blockquote>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-[#2A1F0E]/8 text-[#6B5B40] border border-[#2A1F0E]/10"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="text-xs text-[#9B8A70]">+{tags.length - 4} more</span>
                )}
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
