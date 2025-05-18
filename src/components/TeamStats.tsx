import { Team } from '@/types/team'
import { useState, useEffect } from 'react'

interface TeamStatsProps {
  teams: Team[]
  onReviveAllTeams: () => void
  onResetAllPositions: () => void
  onLoadTeamList?: (teams: Team[]) => void
}

interface SavedList {
  name: string
  teams: Team[]
}

export default function TeamStats({ teams, onReviveAllTeams, onResetAllPositions, onLoadTeamList }: TeamStatsProps) {
  const [savedLists, setSavedLists] = useState<SavedList[]>([])
  const [selectedList, setSelectedList] = useState<string>('')

  useEffect(() => {
    const loadSavedLists = async () => {
      try {
        const response = await fetch('/api/load-team-lists')
        if (response.ok) {
          const lists = await response.json()
          setSavedLists(lists)
        }
      } catch (error) {
        console.error('Error loading saved lists:', error)
      }
    }
    loadSavedLists()
  }, [])

  const handleListSelect = (listName: string) => {
    setSelectedList(listName)
    const selectedListData = savedLists.find(list => list.name === listName)
    if (selectedListData && onLoadTeamList) {
      onLoadTeamList(selectedListData.teams)
    }
  }

  const totalPlayers = teams.reduce((sum, team) => sum + team.players.filter(alive => alive).length, 0)
  const totalTeams = teams.length
  const squadCount = teams.filter(team => team.players.filter(alive => alive).length === 4).length
  const threeManCount = teams.filter(team => team.players.filter(alive => alive).length === 3).length
  const twoManCount = teams.filter(team => team.players.filter(alive => alive).length === 2).length
  const soloCount = teams.filter(team => team.players.filter(alive => alive).length === 1).length

  return (
    <div className="mb-4">
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={onReviveAllTeams}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          Revive All Teams
        </button>
        <select
          value={selectedList}
          onChange={(e) => handleListSelect(e.target.value)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg font-bold transition-colors text-sm"
        >
          <option value="">Select Team List</option>
          {savedLists.map(list => (
            <option key={list.name} value={list.name}>
              {list.name}
            </option>
          ))}
        </select>
        <button
          onClick={onResetAllPositions}
          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-lg font-bold transition-colors text-sm"
        >
          Reset All Positions
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2">
        <div className="bg-gray-800 rounded-lg p-1 text-center">
          <div className="text-xs text-gray-400">Total Players</div>
          <div className="text-lg font-bold text-green-500">{totalPlayers}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-1 text-center">
          <div className="text-xs text-gray-400">Total Teams</div>
          <div className="text-lg font-bold text-blue-500">{totalTeams}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-1 text-center">
          <div className="text-xs text-gray-400">Squad</div>
          <div className="text-lg font-bold text-purple-500">{squadCount}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-1 text-center">
          <div className="text-xs text-gray-400">3-Man Squad</div>
          <div className="text-lg font-bold text-green-500">{threeManCount}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-1 text-center">
          <div className="text-xs text-gray-400">2-Man Squad</div>
          <div className="text-lg font-bold text-yellow-500">{twoManCount}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-1 text-center">
          <div className="text-xs text-gray-400">Solo</div>
          <div className="text-lg font-bold text-red-500">{soloCount}</div>
        </div>
      </div>
    </div>
  )
} 