'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  url: string
  caption: string | null
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (photos.length === 0) return null

  return (
    <>
      {/* Grid */}
      <div className={`grid gap-2 ${
        photos.length === 1 ? 'grid-cols-1' :
        photos.length === 2 ? 'grid-cols-2' :
        photos.length >= 3 ? 'grid-cols-3' : 'grid-cols-3'
      }`}>
        {photos.slice(0, 6).map((photo, i) => (
          <div
            key={photo.id}
            className={`relative overflow-hidden rounded-xl cursor-pointer group ${
              i === 0 && photos.length >= 3 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
            }`}
            onClick={() => setLightboxIdx(i)}
          >
            <img
              src={photo.url}
              alt={photo.caption || ''}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {i === 5 && photos.length > 6 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-fraunces text-xl">+{photos.length - 6}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxIdx(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2"
              onClick={() => setLightboxIdx(null)}
            >
              <X size={24} />
            </button>

            {lightboxIdx > 0 && (
              <button
                className="absolute left-4 text-white/60 hover:text-white p-2"
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! - 1) }}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <motion.img
              key={lightboxIdx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={photos[lightboxIdx].url}
              alt={photos[lightboxIdx].caption || ''}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={e => e.stopPropagation()}
            />

            {lightboxIdx < photos.length - 1 && (
              <button
                className="absolute right-4 text-white/60 hover:text-white p-2"
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! + 1) }}
              >
                <ChevronRight size={32} />
              </button>
            )}

            {photos[lightboxIdx].caption && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-caveat text-lg">
                {photos[lightboxIdx].caption}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
