import { useState } from 'react'
import { motion } from 'framer-motion'
import { Team } from '@/types/team'

interface TeamCardProps {
  team: Team
  onPlayerStatusChange: (teamId: number, playerIndex: number) => void
  onPositionChange: (teamId: number, newPosition: number) => void
  onPositionReset: (teamId: number) => void
}

export default function TeamCard({ 
  team, 
  onPlayerStatusChange,
  onPositionChange,
  onPositionReset
}: TeamCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPositionMenu, setShowPositionMenu] = useState(false)
  const allPlayersDead = team.players.every(player => !player)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPositionMenu(!showPositionMenu)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (team.customPosition !== undefined) {
      onPositionReset(team.id)
    }
  }

  const handlePositionSelect = (position: number) => {
    onPositionChange(team.id, position)
    setShowPositionMenu(false)
  }

  return (
    <motion.div
      className={`bg-gray-800 rounded-lg p-2 relative ${allPlayersDead ? 'opacity-50' : ''}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onContextMenu={handleContextMenu}
      onClick={() => setShowPositionMenu(false)}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {team.logo_url && (
          <img
            src={team.logo_url}
            alt={`${team.name} logo`}
            className={`w-6 h-6 object-contain ${allPlayersDead ? 'opacity-50' : ''}`}
          />
        )}
        <div className="flex items-center gap-1">
          <span 
            className={`text-sm font-semibold cursor-pointer ${
              team.customPosition !== undefined ? 'text-yellow-400' : 'text-gray-400'
            } ${allPlayersDead ? 'opacity-50' : ''}`}
            onClick={handleClick}
          >
            #{team.customPosition !== undefined ? team.customPosition : team.position}
          </span>
          <h3 className={`text-sm font-semibold ${allPlayersDead ? 'opacity-50' : ''}`}>{team.name}</h3>
        </div>
        {showPositionMenu && (
          <div 
            className="absolute left-0 mt-6 w-32 bg-gray-800 rounded-lg shadow-lg z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-4 gap-1 p-1">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((position) => (
                <button
                  key={position}
                  className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                    position === (team.customPosition || team.position)
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handlePositionSelect(position)}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1">
        {team.players.map((isAlive, index) => (
          <motion.button
            key={index}
            className={`p-1 rounded text-center transition-colors text-xs ${
              isAlive 
                ? 'bg-green-600 hover:bg-green-700' 
                : allPlayersDead 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={() => onPlayerStatusChange(team.id, index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {team.playerNames[index]}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
} 