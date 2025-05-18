'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import MapDisplay from '@/components/MapDisplay'
import { teams } from '@/data/teams'

const MAP_IMAGES = {
  erangel: '/maps/erangel.jpg',
  miramar: '/maps/miramar.jpg',
  sanhok: '/maps/sanhok.jpg',
  rondo: '/maps/rondo.jpg',
  taego: '/maps/taego.jpg',
}

interface DaliSpot {
  id: string
  x: number
  y: number
  type: 'type1' | 'type2' | 'type3'
  imageUrl: string
  title: string
  description: string
}

export default function DaliPage() {
  const [selectedMap, setSelectedMap] = useState('erangel')
  const [spots, setSpots] = useState<DaliSpot[]>([])
  const [selectedSpot, setSelectedSpot] = useState<DaliSpot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedSpots = localStorage.getItem(`dali_spots_${selectedMap}`)
    if (savedSpots) {
      setSpots(JSON.parse(savedSpots))
    } else {
      setSpots([])
    }
    setLoading(false)
  }, [selectedMap])

  const handleSpotClick = (spot: DaliSpot) => {
    console.log('Spot clicked:', spot)
    setSelectedSpot(spot)
  }

  const handleCloseModal = () => {
    setSelectedSpot(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dali Locations</h1>
        
        <div className="mb-4">
          <select
            value={selectedMap}
            onChange={(e) => setSelectedMap(e.target.value)}
            className="bg-gray-800 text-white p-3 rounded-lg text-lg font-semibold"
            disabled={loading}
          >
            <option value="erangel">Erangel</option>
            <option value="miramar">Miramar</option>
            <option value="sanhok">Sanhok</option>
            <option value="rondo">Rondo</option>
            <option value="taego">Taego</option>
          </select>
        </div>

        <div className="relative w-full aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden">
          <MapDisplay
            mapImage={MAP_IMAGES[selectedMap as keyof typeof MAP_IMAGES]}
            teams={teams}
            spots={spots}
            onSpotClick={handleSpotClick}
            spotTypes={{
              type1: { color: '#FF0000', label: 'Type 1' },
              type2: { color: '#00FF00', label: 'Type 2' },
              type3: { color: '#0000FF', label: 'Type 3' }
            }}
          />
        </div>

        {selectedSpot && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative w-full h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedSpot.title}</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-gray-300 text-4xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="relative flex-1 w-full">
                <Image
                  src={selectedSpot.imageUrl}
                  alt={selectedSpot.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {selectedSpot.description && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-300">{selectedSpot.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 