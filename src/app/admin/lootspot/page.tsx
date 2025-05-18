'use client'

import { useState, useEffect } from 'react'
import MapDisplay from '@/components/MapDisplay'
import { Team } from '@/types/team'
import AdminLayout from '@/components/AdminLayout'
import LootSpotAdmin from '@/components/LootSpotAdmin'
import Link from 'next/link'

interface LootSpot {
  teamId: number
  type: 'main' | 'alt'
  x: number
  y: number
}

interface FlightPath {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
}

const MAP_IMAGES = {
  erangel: '/maps/Erangel.jpg',
  miramar: '/maps/Miramar.jpg',
  sanhok: '/maps/Sanhok.jpg',
  rondo: '/maps/Rondo.jpg',
  taego: '/maps/Taego.jpg',
}

export default function LootspotAdminPage() {
  const [selectedMap, setSelectedMap] = useState<string>('erangel')
  const [teams, setTeams] = useState<Team[]>([])
  const [spots, setSpots] = useState<LootSpot[]>([])
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([])
  const [isDrawingFlightPath, setIsDrawingFlightPath] = useState(false)
  const [tempFlightPath, setTempFlightPath] = useState<{startX: number, startY: number} | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [spotType, setSpotType] = useState<'main' | 'alt'>('main')

  useEffect(() => {
    // Load teams from localStorage
    const savedTeams = localStorage.getItem('teams')
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams))
    }

    // Load spots and flight paths from localStorage
    const savedSpots = localStorage.getItem(`lootspots_${selectedMap}`)
    const savedFlightPaths = localStorage.getItem(`flightpaths_${selectedMap}`)
    
    if (savedSpots) {
      setSpots(JSON.parse(savedSpots))
    } else {
      setSpots([])
    }

    if (savedFlightPaths) {
      try {
        setFlightPaths(JSON.parse(savedFlightPaths))
      } catch (error) {
        console.error('Error parsing flight paths:', error)
        setFlightPaths([])
      }
    } else {
      setFlightPaths([])
    }
  }, [selectedMap])

  const handleSpotSelect = (teamId: number, type: 'main' | 'alt', x: number, y: number) => {
    setSpots(prevSpots => {
      // Remove existing spot of the same type for this team
      const filteredSpots = prevSpots.filter(spot => 
        !(spot.teamId === teamId && spot.type === type)
      )
      
      // Add new spot
      return [...filteredSpots, { teamId, type, x, y }]
    })
  }

  const handleMapClick = (x: number, y: number) => {
    if (selectedTeam) {
      handleSpotSelect(selectedTeam, spotType, x, y)
    }
  }

  const handleSpotSave = () => {
    localStorage.setItem(`lootspots_${selectedMap}`, JSON.stringify(spots))
  }

  const handleFlightPathStart = (x: number, y: number) => {
    setTempFlightPath({ startX: x, startY: y })
  }

  const handleFlightPathEnd = (x: number, y: number) => {
    if (tempFlightPath) {
      const newFlightPath: FlightPath = {
        id: Date.now().toString(),
        startX: tempFlightPath.startX,
        startY: tempFlightPath.startY,
        endX: x,
        endY: y
      }
      
      // Only keep one flight path per map
      setFlightPaths([newFlightPath])
      setTempFlightPath(null)
      
      // Save to localStorage
      localStorage.setItem(`flightpaths_${selectedMap}`, JSON.stringify([newFlightPath]))
    }
  }

  const handleClearFlightPaths = () => {
    setFlightPaths([])
    localStorage.setItem(`flightpaths_${selectedMap}`, JSON.stringify([]))
  }

  const handleSpotRemove = (teamId: number, type: 'main' | 'alt') => {
    setSpots(prevSpots => {
      const updatedSpots = prevSpots.filter(spot => !(spot.teamId === teamId && spot.type === type));
      localStorage.setItem(`lootspots_${selectedMap}`, JSON.stringify(updatedSpots));
      return updatedSpots;
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold mb-4">Back to Home</Link>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Lootspot Yönetimi</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <select
            value={selectedMap}
            onChange={(e) => setSelectedMap(e.target.value)}
            className="bg-gray-800 text-white p-3 rounded-lg text-lg font-semibold"
          >
            <option value="erangel">Erangel</option>
            <option value="miramar">Miramar</option>
            <option value="sanhok">Sanhok</option>
            <option value="rondo">Rondo</option>
            <option value="taego">Taego</option>
          </select>
        </div>

        <LootSpotAdmin
          teams={teams}
          onSpotSelect={handleSpotSelect}
          onSpotSave={handleSpotSave}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          spotType={spotType}
          setSpotType={setSpotType}
        />

        <div className="bg-gray-800 rounded-lg p-4">
          <MapDisplay
            mapImage={MAP_IMAGES[selectedMap as keyof typeof MAP_IMAGES]}
            teams={teams}
            spots={spots}
            flightPaths={flightPaths}
            isDrawingFlightPath={isDrawingFlightPath}
            onSpotAdd={handleMapClick}
            onFlightPathStart={handleFlightPathStart}
            onFlightPathEnd={handleFlightPathEnd}
            allowSpotAdd={true}
            onSpotRemove={handleSpotRemove}
          />
        </div>
      </div>
    </AdminLayout>
  )
} 