'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TeamCard from '@/components/TeamCard'
import TeamStats from '@/components/TeamStats'
import { Team } from '@/types/team'

export default function KillfeedPage() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const loadTeams = () => {
      const savedTeams = localStorage.getItem('teams')
      if (savedTeams) {
        const parsedTeams = JSON.parse(savedTeams)
        setTeams(parsedTeams)
      }
    }

    // İlk yükleme
    loadTeams()

    // Local storage değişikliklerini dinle
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teams') {
        loadTeams()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handlePlayerStatusChange = (teamId: number, playerIndex: number) => {
    const newTeams = teams.map(team => {
      if (team.id === teamId) {
        const newPlayers = [...team.players]
        newPlayers[playerIndex] = !newPlayers[playerIndex]
        return { ...team, players: newPlayers }
      }
      return team
    })
    setTeams(newTeams)
    localStorage.setItem('teams', JSON.stringify(newTeams))
  }

  const handleTeamPositionChange = (teamId: number, newPosition: number) => {
    const teamToMove = teams.find(team => team.id === teamId)
    if (!teamToMove) return

    const teamInTargetPosition = teams.find(team => 
      team.customPosition === newPosition && team.id !== teamId
    )

    if (teamInTargetPosition) {
      return
    }

    const newTeams = teams.map(team => {
      if (team.id === teamId) {
        return { ...team, customPosition: newPosition }
      }
      if (team.customPosition === undefined && team.position === newPosition) {
        return { ...team, position: 0 }
      }
      return team
    })

    const teamsWithCustomPosition = newTeams
      .filter(team => team.customPosition !== undefined)
      .sort((a, b) => (a.customPosition || 0) - (b.customPosition || 0))

    const teamsWithoutCustomPosition = newTeams
      .filter(team => team.customPosition === undefined)
      .sort((a, b) => a.name.localeCompare(b.name))

    const usedPositions = new Set(teamsWithCustomPosition.map(team => team.customPosition))
    const emptyPositions = Array.from({ length: 16 }, (_, i) => i + 1)
      .filter(pos => !usedPositions.has(pos))

    const finalTeams = [
      ...teamsWithCustomPosition,
      ...teamsWithoutCustomPosition.map((team, index) => ({
        ...team,
        position: emptyPositions[index]
      }))
    ]

    setTeams(finalTeams)
    localStorage.setItem('teams', JSON.stringify(finalTeams))
  }

  const handleTeamPositionReset = (teamId: number) => {
    const newTeams = teams.map(team => {
      if (team.id === teamId) {
        return { ...team, customPosition: undefined }
      }
      return team
    })

    const teamsWithCustomPosition = newTeams
      .filter(team => team.customPosition !== undefined)
      .sort((a, b) => (a.customPosition || 0) - (b.customPosition || 0))

    const teamsWithoutCustomPosition = newTeams
      .filter(team => team.customPosition === undefined)
      .sort((a, b) => a.name.localeCompare(b.name))

    const usedPositions = new Set(teamsWithCustomPosition.map(team => team.customPosition))
    const emptyPositions = Array.from({ length: 16 }, (_, i) => i + 1)
      .filter(pos => !usedPositions.has(pos))

    const finalTeams = [
      ...teamsWithCustomPosition,
      ...teamsWithoutCustomPosition.map((team, index) => ({
        ...team,
        position: emptyPositions[index]
      }))
    ]

    setTeams(finalTeams)
    localStorage.setItem('teams', JSON.stringify(finalTeams))
  }

  const handleReviveAllTeams = () => {
    const newTeams = teams.map(team => ({
      ...team,
      players: team.players.map(() => true)
    }))
    setTeams(newTeams)
    localStorage.setItem('teams', JSON.stringify(newTeams))
  }

  const handleResetAllPositions = () => {
    const newTeams = teams.map(team => ({
      ...team,
      customPosition: undefined
    }))

    const sortedTeams = [...newTeams]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team, index) => ({
        ...team,
        position: index + 1
      }))

    setTeams(sortedTeams)
    localStorage.setItem('teams', JSON.stringify(sortedTeams))
  }

  const handleLoadTeamList = (newTeams: Team[]) => {
    setTeams(newTeams)
    localStorage.setItem('teams', JSON.stringify(newTeams))
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-2">
      <div className="max-w-[700px] mx-auto">
        <TeamStats 
          teams={teams.slice(0, 16)} 
          onReviveAllTeams={handleReviveAllTeams}
          onResetAllPositions={handleResetAllPositions}
          onLoadTeamList={handleLoadTeamList}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            {teams
              .slice(0, 16)
              .sort((a, b) => {
                if (a.customPosition !== undefined && b.customPosition !== undefined) {
                  return a.customPosition - b.customPosition
                }
                if (a.customPosition !== undefined) {
                  return a.customPosition - (b.customPosition || b.position)
                }
                if (b.customPosition !== undefined) {
                  return (a.customPosition || a.position) - b.customPosition
                }
                return a.position - b.position
              })
              .filter((_, index) => index % 2 === 0)
              .map((team, index) => (
                <motion.div
                  key={team.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TeamCard
                    team={team}
                    onPlayerStatusChange={handlePlayerStatusChange}
                    onPositionChange={handleTeamPositionChange}
                    onPositionReset={handleTeamPositionReset}
                  />
                </motion.div>
              ))}
          </div>
          <div className="space-y-1">
            {teams
              .slice(0, 16)
              .sort((a, b) => {
                if (a.customPosition !== undefined && b.customPosition !== undefined) {
                  return a.customPosition - b.customPosition
                }
                if (a.customPosition !== undefined) {
                  return a.customPosition - (b.customPosition || b.position)
                }
                if (b.customPosition !== undefined) {
                  return (a.customPosition || a.position) - b.customPosition
                }
                return a.position - b.position
              })
              .filter((_, index) => index % 2 === 1)
              .map((team, index) => (
                <motion.div
                  key={team.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TeamCard
                    team={team}
                    onPlayerStatusChange={handlePlayerStatusChange}
                    onPositionChange={handleTeamPositionChange}
                    onPositionReset={handleTeamPositionReset}
                  />
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </main>
  )
} 