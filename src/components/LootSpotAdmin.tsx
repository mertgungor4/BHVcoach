import { Team } from '@/types/team'

interface LootSpot {
  teamId: number
  type: 'main' | 'alt'
  x: number
  y: number
}

interface LootSpotAdminProps {
  teams: Team[]
  onSpotSelect: (teamId: number, type: 'main' | 'alt', x: number, y: number) => void
  onSpotSave: () => void
  selectedTeam: number | null
  setSelectedTeam: (teamId: number | null) => void
  spotType: 'main' | 'alt'
  setSpotType: (type: 'main' | 'alt') => void
}

export default function LootSpotAdmin({ 
  teams, 
  onSpotSelect, 
  onSpotSave,
  selectedTeam,
  setSelectedTeam,
  spotType,
  setSpotType
}: LootSpotAdminProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold mb-4">Takım Seçimi</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <select
          value={selectedTeam || ''}
          onChange={(e) => setSelectedTeam(e.target.value ? Number(e.target.value) : null)}
          className="bg-gray-700 text-white p-2 rounded-lg"
        >
          <option value="">Takım Seç</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <select
          value={spotType}
          onChange={(e) => setSpotType(e.target.value as 'main' | 'alt')}
          className="bg-gray-700 text-white p-2 rounded-lg"
        >
          <option value="main">Ana Loot Bölgesi</option>
          <option value="alt">Alternatif Loot Bölgesi</option>
        </select>
      </div>

      <div className="text-sm text-gray-400 mb-4">
        {selectedTeam ? (
          <p>
            {teams.find(t => t.id === selectedTeam)?.name} için {spotType === 'main' ? 'ana' : 'alternatif'} loot bölgesini 
            belirlemek için haritaya tıklayın
          </p>
        ) : (
          <p>Loot bölgesi belirlemek için bir takım seçin</p>
        )}
      </div>

      <button
        onClick={onSpotSave}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
      >
        Noktaları Kaydet
      </button>
    </div>
  )
} 