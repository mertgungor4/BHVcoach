'use client'

import { useState, useEffect } from 'react'
import { Team } from '../page'
import PasswordModal from '@/components/PasswordModal'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [selectedTeams, setSelectedTeams] = useState<number[]>([])
  const [newListName, setNewListName] = useState('')
  const [savedLists, setSavedLists] = useState<{name: string, teams: Team[]}[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<number | null>(null)

  useEffect(() => {
    // Varsayılan takımları yükle
    const defaultTeams: Team[] = [
      { id: 1, name: '4AM', players: [true, true, true, true], position: 1, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 2, name: '17GAMING', players: [true, true, true, true], position: 2, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 3, name: 'BBL', players: [true, true, true, true], position: 3, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 4, name: 'BIG', players: [true, true, true, true], position: 4, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 5, name: 'DWG', players: [true, true, true, true], position: 5, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 6, name: 'ENCE', players: [true, true, true, true], position: 6, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 7, name: 'FAZE', players: [true, true, true, true], position: 7, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 8, name: 'FUT', players: [true, true, true, true], position: 8, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 9, name: 'GEN.G', players: [true, true, true, true], position: 9, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 10, name: 'HEROIC', players: [true, true, true, true], position: 10, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 11, name: 'LIQUID', players: [true, true, true, true], position: 11, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 12, name: 'NAVI', players: [true, true, true, true], position: 12, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 13, name: 'S2G', players: [true, true, true, true], position: 13, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 14, name: 'SQ', players: [true, true, true, true], position: 14, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 15, name: 'TSM', players: [true, true, true, true], position: 15, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
      { id: 16, name: 'VP', players: [true, true, true, true], position: 16, playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] },
    ]

    // Local storage'dan takımları yükle
    const savedTeams = localStorage.getItem('teams')
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams))
    } else {
      setTeams(defaultTeams)
      localStorage.setItem('teams', JSON.stringify(defaultTeams))
    }

    // Kayıtlı listeleri API'den yükle
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

  const handleTeamUpdate = (updatedTeam: Team) => {
    const newTeams = teams.map(team => 
      team.id === updatedTeam.id ? updatedTeam : team
    )
    setTeams(newTeams)
    localStorage.setItem('teams', JSON.stringify(newTeams))
  }

  const handleLogoUpload = async (teamId: number, file: File) => {
    try {
      // Dosya adını oluştur (takım adı + timestamp)
      const team = teams.find(t => t.id === teamId)
      if (!team) return

      const timestamp = Date.now()
      const fileName = `${team.name.toLowerCase()}_${timestamp}.${file.name.split('.').pop()}`
      
      // FormData oluştur
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', fileName)

      // API'ye yükle
      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      // Başarılı yükleme sonrası takımı güncelle
      const newTeams = teams.map(team => 
        team.id === teamId 
          ? { ...team, logo_url: `/logos/${fileName}` } 
          : team
      )
      setTeams(newTeams)
      localStorage.setItem('teams', JSON.stringify(newTeams))
    } catch (error) {
      console.error('Logo upload failed:', error)
      alert('Logo yüklenirken bir hata oluştu')
    }
  }

  const handleSaveChanges = () => {
    setIsSaving(true)
    localStorage.setItem('teams', JSON.stringify(teams))
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return

    // Mevcut en yüksek ID'yi bul
    const maxId = teams.reduce((max, team) => Math.max(max, team.id), 0)

    const newTeam: Team = {
      id: maxId + 1, // Yeni ID'yi mevcut en yüksek ID'nin bir fazlası olarak ata
      name: newTeamName.trim(),
      players: [true, true, true, true],
      position: teams.length + 1,
      playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4']
    }

    const newTeams = [...teams, newTeam]
    setTeams(newTeams)
    setNewTeamName('')
  }

  const handleRemoveTeam = (teamId: number) => {
    setTeamToDelete(teamId)
    setShowDeleteModal(true)
  }

  const confirmDeleteTeam = () => {
    if (teamToDelete === null) return

    const newTeams = teams.filter(team => team.id !== teamToDelete)
    setTeams(newTeams)
    localStorage.setItem('teams', JSON.stringify(newTeams))
    setShowDeleteModal(false)
    setTeamToDelete(null)
  }

  const handleTeamSelect = (teamId: number) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId)
      } else if (prev.length < 16) {
        return [...prev, teamId]
      }
      return prev
    })
  }

  const handleCreateTeamList = async () => {
    if (selectedTeams.length !== 16 || !newListName.trim()) return

    const selectedTeamObjects = teams
      .filter(team => selectedTeams.includes(team.id))
      .map((team, index) => ({
        ...team,
        position: index + 1,
        customPosition: undefined
      }))

    const newList = {
      name: newListName.trim(),
      teams: selectedTeamObjects
    }

    try {
      // API'ye kaydet
      const response = await fetch('/api/save-team-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newList)
      })

      if (!response.ok) {
        throw new Error('Failed to save team list')
      }

      // Başarılı kayıt sonrası state'i güncelle
      const updatedLists = [...savedLists, newList]
      setSavedLists(updatedLists)

      // Ana uygulama için seçilen listeyi kaydet
      localStorage.setItem('teams', JSON.stringify(selectedTeamObjects))
      setTeams(selectedTeamObjects)
      setSelectedTeams([])
      setNewListName('')
    } catch (error) {
      console.error('Error saving team list:', error)
      alert('Takım listesi kaydedilirken bir hata oluştu')
    }
  }

  const handleDeleteList = async (listName: string) => {
    try {
      // API'den sil
      const response = await fetch('/api/delete-team-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: listName })
      })

      if (!response.ok) {
        throw new Error('Failed to delete team list')
      }

      // Başarılı silme sonrası state'i güncelle
      const updatedLists = savedLists.filter(list => list.name !== listName)
      setSavedLists(updatedLists)
    } catch (error) {
      console.error('Error deleting team list:', error)
      alert('Takım listesi silinirken bir hata oluştu')
    }
  }

  const handleLoadList = async (list: {name: string, teams: Team[]}) => {
    try {
      // Tüm takımları koru, sadece seçili takımları güncelle
      const updatedTeams = teams.map(team => {
        const loadedTeam = list.teams.find(t => t.id === team.id)
        if (loadedTeam) {
          return {
            ...team,
            position: loadedTeam.position,
            customPosition: loadedTeam.customPosition
          }
        }
        return team
      })

      // Yeni takımları ekle (eğer varsa)
      const newTeams = list.teams.filter(loadedTeam => 
        !teams.some(team => team.id === loadedTeam.id)
      )

      const finalTeams = [...updatedTeams, ...newTeams]
      setTeams(finalTeams)
      localStorage.setItem('teams', JSON.stringify(finalTeams))

      // Seçili takımları güncelle
      setSelectedTeams(list.teams.map(team => team.id))
    } catch (error) {
      console.error('Error loading team list:', error)
      alert('Takım listesi yüklenirken bir hata oluştu')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setTeams([])
    setSavedLists([])
    setSelectedTeams([])
    setNewTeamName('')
    setNewListName('')
    setShowPasswordModal(true)
  };

  const handlePasswordSubmit = (password: string) => {
    const isValid = password === 'admin123'
    setIsAuthenticated(isValid)
    setShowPasswordModal(!isValid)
    if (isValid) {
      localStorage.setItem('isAdminAuthenticated', 'true')
      router.push('/admin')
    }
  }

  return (
    <>
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
      />
      {isAuthenticated && (
        <AdminLayout>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold">Takım Yönetimi</h1>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="New team name"
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleAddTeam}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    Add Team
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="List name"
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleCreateTeamList}
                    disabled={selectedTeams.length !== 16 || !newListName.trim()}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                      selectedTeams.length !== 16 || !newListName.trim()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    Create Team List ({selectedTeams.length}/16)
                  </button>
                </div>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    isSaving 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Kayıtlı Listeler Tablosu */}
            {savedLists.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Saved Team Lists</h2>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="px-4 py-2 text-left text-white">List Name</th>
                        <th className="px-4 py-2 text-left text-white">Teams</th>
                        <th className="px-4 py-2 text-right text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedLists.map((list) => (
                        <tr key={list.name} className="border-t border-gray-700">
                          <td className="px-4 py-2 text-white">{list.name}</td>
                          <td className="px-4 py-2 text-white">
                            {list.teams.map(team => team.name).join(', ')}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleLoadList(list)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm mr-2"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDeleteList(list.name)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {/* Seçili takımlar */}
              {teams
                .filter(team => selectedTeams.includes(team.id))
                .map(team => (
                  <div 
                    key={team.id} 
                    className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors ring-2 ring-purple-500`}
                    onClick={() => handleTeamSelect(team.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center">
                        <img 
                          src={team.logo_url || `/logos/${team.name.toLowerCase()}.png`} 
                          alt={team.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="mb-2">
                          <label className="block text-sm text-gray-400 mb-1">Team Name</label>
                          <input
                            type="text"
                            value={team.name}
                            onChange={(e) => handleTeamUpdate({ ...team, name: e.target.value })}
                            className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {team.players.map((_, index) => (
                            <div key={index}>
                              <label className="block text-sm text-gray-400 mb-1">Player {index + 1}</label>
                              <input
                                type="text"
                                value={team.playerNames[index]}
                                onChange={(e) => {
                                  const newPlayerNames = [...team.playerNames]
                                  newPlayerNames[index] = e.target.value
                                  handleTeamUpdate({ ...team, playerNames: newPlayerNames })
                                }}
                                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Logo</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleLogoUpload(team.id, file)
                              }
                            }}
                            className="text-white text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveTeam(team.id)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Remove Team
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Seçili olmayan takımlar */}
              {teams
                .filter(team => !selectedTeams.includes(team.id))
                .map(team => (
                  <div 
                    key={team.id} 
                    className="bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors opacity-50 hover:opacity-100"
                    onClick={() => handleTeamSelect(team.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center">
                        <img 
                          src={team.logo_url || `/logos/${team.name.toLowerCase()}.png`} 
                          alt={team.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="mb-2">
                          <label className="block text-sm text-gray-400 mb-1">Team Name</label>
                          <input
                            type="text"
                            value={team.name}
                            onChange={(e) => handleTeamUpdate({ ...team, name: e.target.value })}
                            className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {team.players.map((_, index) => (
                            <div key={index}>
                              <label className="block text-sm text-gray-400 mb-1">Player {index + 1}</label>
                              <input
                                type="text"
                                value={team.playerNames[index]}
                                onChange={(e) => {
                                  const newPlayerNames = [...team.playerNames]
                                  newPlayerNames[index] = e.target.value
                                  handleTeamUpdate({ ...team, playerNames: newPlayerNames })
                                }}
                                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Logo</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleLogoUpload(team.id, file)
                              }
                            }}
                            className="text-white text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveTeam(team.id)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Remove Team
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Lootspot Management Button */}
            <div className="mt-8">
              <Link 
                href="/admin/lootspot"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Lootspot Yönetimi
              </Link>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-4">Delete Team</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this team? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setTeamToDelete(null)
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteTeam}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </AdminLayout>
      )}
    </>
  )
} 