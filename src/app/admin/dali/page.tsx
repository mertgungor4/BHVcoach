'use client'

import { useState, useEffect } from 'react'
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

export default function DaliAdminPage() {
  const [selectedMap, setSelectedMap] = useState('erangel')
  const [spots, setSpots] = useState<DaliSpot[]>([])
  const [selectedType, setSelectedType] = useState<'type1' | 'type2' | 'type3'>('type1')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingSpot, setIsAddingSpot] = useState(false)

  useEffect(() => {
    const savedSpots = localStorage.getItem(`dali_spots_${selectedMap}`)
    if (savedSpots) {
      setSpots(JSON.parse(savedSpots))
    } else {
      setSpots([])
    }
    setLoading(false)
  }, [selectedMap])

  const handleMapClick = (x: number, y: number) => {
    if (!isAddingSpot) return

    if (!title || !imageFile) {
      alert('Please fill in the title and select an image first')
      return
    }

    // Convert image to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const newSpot: DaliSpot = {
        id: Date.now().toString(),
        x,
        y,
        type: selectedType,
        imageUrl: reader.result as string,
        title,
        description
      }

      setSpots(prev => {
        const updated = [...prev, newSpot]
        localStorage.setItem(`dali_spots_${selectedMap}`, JSON.stringify(updated))
        return updated
      })

      // Reset form
      setTitle('')
      setDescription('')
      setImageFile(null)
      setIsAddingSpot(false)
    }
    reader.readAsDataURL(imageFile)
  }

  const handleSpotRemove = (spotId: string) => {
    setSpots(prev => {
      const updated = prev.filter(spot => spot.id !== spotId)
      localStorage.setItem(`dali_spots_${selectedMap}`, JSON.stringify(updated))
      return updated
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dali Admin</h1>
        
        <div className="mb-4 flex gap-4">
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

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'type1' | 'type2' | 'type3')}
            className="bg-gray-800 text-white p-3 rounded-lg text-lg font-semibold"
          >
            <option value="type1">Type 1 (Red)</option>
            <option value="type2">Type 2 (Green)</option>
            <option value="type3">Type 3 (Blue)</option>
          </select>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setIsAddingSpot(!isAddingSpot)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isAddingSpot ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isAddingSpot ? 'Cancel Adding Spot' : 'Add New Spot'}
          </button>
        </div>

        {isAddingSpot && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700"
                />
              </div>
              <div>
                <label className="block mb-2">Image</label>
                <input
                  type="file"
                  accept="image/webp"
                  onChange={handleImageChange}
                  className="w-full p-2 rounded bg-gray-700"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 h-24"
                />
              </div>
            </div>
          </div>
        )}

        <div className="relative w-full aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden">
          <MapDisplay
            mapImage={MAP_IMAGES[selectedMap as keyof typeof MAP_IMAGES]}
            teams={teams}
            spots={spots}
            onSpotAdd={handleMapClick}
            spotTypes={{
              type1: { color: '#FF0000', label: 'Type 1' },
              type2: { color: '#00FF00', label: 'Type 2' },
              type3: { color: '#0000FF', label: 'Type 3' }
            }}
            onSpotRemove={handleSpotRemove}
            allowSpotAdd={isAddingSpot}
          />
        </div>
      </div>
    </div>
  )
} 