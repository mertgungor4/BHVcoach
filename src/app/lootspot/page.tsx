'use client'

import { useState, useEffect } from 'react'
import MapDisplay from '@/components/MapDisplay'
import { Team } from '@/types/team'
import Link from 'next/link'

interface LootSpot {
  teamId: number
  type: 'main' | 'alt'
  x: number
  y: number
  isSelected?: boolean
  isHidden?: boolean
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

export default function LootspotPage() {
  const [selectedMap, setSelectedMap] = useState<string>('erangel')
  const [selectedList, setSelectedList] = useState<string>('')
  const [teams, setTeams] = useState<Team[]>([])
  const [spots, setSpots] = useState<LootSpot[]>([])
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([])
  const [isDrawingFlightPath, setIsDrawingFlightPath] = useState(false)
  const [isSelectingSpots, setIsSelectingSpots] = useState(false)
  const [tempFlightPath, setTempFlightPath] = useState<{startX: number, startY: number} | null>(null)
  const [savedTeamLists, setSavedTeamLists] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load saved team lists from admin panel
    const fetchSavedTeamLists = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/teamlists')
        if (!response.ok) {
          throw new Error('Failed to load team lists')
        }
        const lists = await response.json()
        if (!Array.isArray(lists)) {
          throw new Error('Invalid team list data')
        }
        setSavedTeamLists(lists)
      } catch (error) {
        console.error('Error loading team lists:', error)
        setError(error instanceof Error ? error.message : 'Failed to load team lists')
      } finally {
        setLoading(false)
      }
    }

    fetchSavedTeamLists()
  }, [])

  useEffect(() => {
    if (selectedList) {
      // Load teams from selected list
      const fetchTeamList = async () => {
        try {
          setLoading(true)
          setError(null)
          const response = await fetch(`/api/teamlists/${selectedList}`)
          if (!response.ok) {
            throw new Error('Failed to load team list')
          }
          const listData = await response.json()
          if (!listData.teams || !Array.isArray(listData.teams)) {
            throw new Error('Invalid team data')
          }
          setTeams(listData.teams)
        } catch (error) {
          console.error('Error loading team list:', error)
          setError(error instanceof Error ? error.message : 'Failed to load team list')
          setTeams([])
        } finally {
          setLoading(false)
        }
      }

      fetchTeamList()
    } else {
      setTeams([])
    }
  }, [selectedList])

  useEffect(() => {
    // Load spots and flight paths for current map
    const savedSpots = localStorage.getItem(`lootspots_${selectedMap}`)
    const savedFlightPaths = localStorage.getItem(`flightpaths_${selectedMap}`)
    
    if (savedSpots) {
      try {
        setSpots(JSON.parse(savedSpots))
      } catch (error) {
        console.error('Error parsing spots:', error)
        setSpots([])
      }
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
      
      // Reset drawing mode
      setIsDrawingFlightPath(false)
    }
  }

  const handleSpotClick = (teamId: number, type: 'main' | 'alt') => {
    if (!isSelectingSpots) return; // Only allow spot selection when isSelectingSpots is true
    
    setSpots(currentSpots => {
      const updatedSpots = currentSpots.map(spot => {
        if (spot.teamId === teamId) {
          // If clicking the same spot type that's already selected, unselect it and show both spots
          if (spot.type === type && spot.isSelected) {
            return { ...spot, isSelected: false, isHidden: false };
          }
          
          // If clicking a spot type
          if (spot.type === type) {
            // Select this spot and hide the other one
            return { ...spot, isSelected: true, isHidden: false };
          } else {
            // Hide the other spot type
            return { ...spot, isSelected: false, isHidden: true };
          }
        }
        // For other teams' spots, keep them as is
        return spot;
      });

      // Save to localStorage
      localStorage.setItem(`lootspots_${selectedMap}`, JSON.stringify(updatedSpots));
      return updatedSpots;
    });
  };

  const handleReset = () => {
    // Reset flight paths
    setFlightPaths([])
    setTempFlightPath(null)
    localStorage.setItem(`flightpaths_${selectedMap}`, JSON.stringify([]))
    
    // Reset spots (make all visible and unselected)
    setSpots(currentSpots => {
      const resetSpots = currentSpots.map(spot => ({
        ...spot,
        isSelected: false,
        isHidden: false
      }))
      localStorage.setItem(`lootspots_${selectedMap}`, JSON.stringify(resetSpots))
      return resetSpots
    })
    
    // Reset drawing modes
    setIsDrawingFlightPath(false)
    setIsSelectingSpots(false)
  };

  if (error) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-center">
            <p className="text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold mb-4">Back to Home</Link>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Loot Spots</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            className="bg-gray-800 text-white p-3 rounded-lg text-lg font-semibold"
            disabled={loading}
          >
            <option value="">Select Team List</option>
            {savedTeamLists.map(list => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>

        {/* Flight Path and Spot Selection Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => {
              setIsDrawingFlightPath(!isDrawingFlightPath);
              setIsSelectingSpots(false);
            }}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              isDrawingFlightPath 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isDrawingFlightPath ? 'Cancel Flight Path' : 'Draw Flight Path'}
          </button>
          
          <button
            onClick={() => {
              setIsSelectingSpots(!isSelectingSpots);
              setIsDrawingFlightPath(false);
            }}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              isSelectingSpots
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSelectingSpots ? 'Cancel Spot Selection' : 'Select Spots'}
          </button>

          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            Loading...
          </div>
        ) : teams.length > 0 ? (
          <div className="bg-gray-800 rounded-lg p-4">
            <MapDisplay
              mapImage={MAP_IMAGES[selectedMap as keyof typeof MAP_IMAGES]}
              teams={teams}
              spots={spots.filter(spot => teams.some(team => team.id === spot.teamId))}
              flightPaths={flightPaths}
              isDrawingFlightPath={isDrawingFlightPath}
              isSelectingSpots={isSelectingSpots}
              onFlightPathStart={handleFlightPathStart}
              onFlightPathEnd={handleFlightPathEnd}
              onSpotClick={handleSpotClick}
            />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            {selectedList ? 'No teams found in this list.' : 'Please select a team list.'}
          </div>
        )}
      </div>
    </main>
  )
} 