import { Team } from '@/types/team'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

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
  color?: string
}

interface SpotType {
  color: string
  label: string
}

interface MapDisplayProps {
  mapImage: string
  teams: Team[]
  spots: Array<{
    id?: string
    teamId?: number
    x: number
    y: number
    type?: 'main' | 'alt' | 'type1' | 'type2' | 'type3'
    isSelected?: boolean
    isHidden?: boolean
    imageUrl?: string
    title?: string
    description?: string
  }>
  flightPaths?: FlightPath[]
  isDrawingFlightPath?: boolean
  isSelectingSpots?: boolean
  onSpotClick?: ((teamId: number, type: 'main' | 'alt') => void) | ((spot: any) => void)
  onSpotAdd?: (x: number, y: number) => void
  onFlightPathStart?: (x: number, y: number) => void
  onFlightPathEnd?: (x: number, y: number) => void
  allowSpotAdd?: boolean
  onSpotRemove?: (spotId: string) => void
  spotTypes?: {
    type1: SpotType
    type2: SpotType
    type3: SpotType
  }
}

export default function MapDisplay({
  mapImage,
  teams,
  spots,
  flightPaths = [],
  isDrawingFlightPath = false,
  isSelectingSpots = false,
  onSpotClick,
  onSpotAdd,
  onFlightPathStart,
  onFlightPathEnd,
  allowSpotAdd = false,
  onSpotRemove,
  spotTypes
}: MapDisplayProps) {
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [tempFlightPath, setTempFlightPath] = useState<{startX: number, startY: number} | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null)
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null)
  const [pinchStartZoom, setPinchStartZoom] = useState<number | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
        setContainerHeight(containerRef.current.clientHeight)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    // Add touch event listeners with passive: false
    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart as any, { passive: false })
      container.addEventListener('touchmove', handleTouchMove as any, { passive: false })
      container.addEventListener('touchend', handleTouchEnd as any, { passive: false })
    }

    return () => {
      window.removeEventListener('resize', updateDimensions)
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart as any)
        container.removeEventListener('touchmove', handleTouchMove as any)
        container.removeEventListener('touchend', handleTouchEnd as any)
      }
    }
  }, [])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    // Get mouse position relative to container
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Calculate zoom factor based on wheel delta
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(1, Math.min(3, zoom * zoomFactor))
    
    // Calculate new offset to zoom towards mouse position
    const newOffsetX = offset.x - (mouseX - offset.x) * (zoomFactor - 1)
    const newOffsetY = offset.y - (mouseY - offset.y) * (zoomFactor - 1)
    
    setZoom(newZoom)
    setOffset({ x: newOffsetX, y: newOffsetY })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start dragging with left mouse button
    if (e.button === 0) {
      setDragging(true)
      setLastPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left - offset.x) / (rect.width * zoom)) * 100
    const y = ((e.clientY - rect.top - offset.y) / (rect.height * zoom)) * 100
    setMousePos({ x, y })

    if (dragging && lastPos) {
      const dx = e.clientX - lastPos.x
      const dy = e.clientY - lastPos.y
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setLastPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
    setLastPos(null)
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore clicks if right mouse button
    if (e.button === 2) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left - offset.x) / (rect.width * zoom)) * 100
    const y = ((e.clientY - rect.top - offset.y) / (rect.height * zoom)) * 100

    if (isDrawingFlightPath) {
      if (!tempFlightPath) {
        // First click - start point
        setTempFlightPath({ startX: x, startY: y })
        onFlightPathStart?.(x, y)
      } else {
        // Second click - end point
        onFlightPathEnd?.(x, y)
        setTempFlightPath(null)
      }
    } else if (allowSpotAdd && onSpotAdd) {
      // Add spot at clicked position
      onSpotAdd(x, y)
    } else if (onSpotClick) {
      // Handle spot click if not in drawing mode
      const clickedSpot = spots.find(spot => {
        const spotX = spot.x
        const spotY = spot.y
        const distance = Math.sqrt(
          Math.pow(x - spotX, 2) + Math.pow(y - spotY, 2)
        )
        return distance < 2 // 2% threshold for spot click detection
      })

      if (clickedSpot) {
        if (clickedSpot.teamId && clickedSpot.type) {
          // For lootspot page
          (onSpotClick as (teamId: number, type: 'main' | 'alt') => void)(clickedSpot.teamId, clickedSpot.type as 'main' | 'alt')
        } else {
          // For dali page
          (onSpotClick as (spot: any) => void)(clickedSpot)
        }
      }
    }
  }

  const handleSpotClick = (spot: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSpotClick) {
      if (spot.teamId && spot.type) {
        // For lootspot page
        (onSpotClick as (teamId: number, type: 'main' | 'alt') => void)(spot.teamId, spot.type as 'main' | 'alt')
      } else {
        // For dali page
        (onSpotClick as (spot: any) => void)(spot)
      }
    }
  }

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((touch.clientX - rect.left - offset.x) / (rect.width * zoom)) * 100
      const y = ((touch.clientY - rect.top - offset.y) / (rect.height * zoom)) * 100

      if (allowSpotAdd && onSpotAdd) {
        // Add spot at touched position
        onSpotAdd(x, y)
      } else {
        // Start panning
        setTouchStart({ x: touch.clientX, y: touch.clientY })
        setLastTouch({ x: touch.clientX, y: touch.clientY })
      }
    } else if (e.touches.length === 2) {
      // Two fingers - start pinch zoom
      setPinchStartDistance(getDistance(e.touches[0], e.touches[1]))
      setPinchStartZoom(zoom)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && touchStart && lastTouch) {
      // Single touch - panning
      const touch = e.touches[0]
      const dx = touch.clientX - lastTouch.x
      const dy = touch.clientY - lastTouch.y
      
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setLastTouch({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2 && pinchStartDistance && pinchStartZoom) {
      // Two fingers - pinch zoom
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const scale = currentDistance / pinchStartDistance
      const newZoom = Math.max(1, Math.min(3, pinchStartZoom * scale))
      setZoom(newZoom)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      setTouchStart(null)
      setLastTouch(null)
      setPinchStartDistance(null)
      setPinchStartZoom(null)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] overflow-hidden select-none bg-gray-800 rounded-lg touch-none"
      style={{ 
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onClick={handleMapClick}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        <div className="relative w-full h-full">
          <img
            src={mapImage}
            alt="Map"
            className="w-full h-full object-contain select-none"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              touchAction: 'none'
            }}
            draggable="false"
          />
        </div>

        {/* Flight Paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#ffffff"
              />
            </marker>
          </defs>
          {flightPaths.map((path, index) => {
            const startX = (path.startX / 100) * containerWidth
            const startY = (path.startY / 100) * containerHeight
            const endX = (path.endX / 100) * containerWidth
            const endY = (path.endY / 100) * containerHeight

            return (
              <path
                key={path.id || index}
                d={`M ${startX} ${startY} L ${endX} ${endY}`}
                stroke="#ffffff"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                markerEnd="url(#arrowhead)"
              />
            )
          })}
          {tempFlightPath && mousePos && (
            <path
              d={`M ${(tempFlightPath.startX / 100) * containerWidth} ${(tempFlightPath.startY / 100) * containerHeight} L ${(mousePos.x / 100) * containerWidth} ${(mousePos.y / 100) * containerHeight}`}
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)"
            />
          )}
        </svg>

        {/* Spots */}
        {spots.filter(spot => !spot.isHidden).map((spot, index) => {
          const team = teams.find(t => t.id === spot.teamId)
          const isDaliSpot = spot.type === 'type1' || spot.type === 'type2' || spot.type === 'type3'
          
          if (!isDaliSpot && !team) return null

          const spotType = isDaliSpot ? spotTypes?.[spot.type as 'type1' | 'type2' | 'type3'] : null
          const spotColor = spotType?.color || (spot.isSelected ? '#00ff00' : '#ff0000')
          const spotLabel = spotType?.label || (spot.type === 'main' ? 'MAIN' : 'ALT')
          const logoSize = spot.isSelected ? 48 : 32
          const opacity = spot.isSelected ? 1 : 0.7
          const scale = spot.isSelected ? 'scale-110' : 'scale-100'
          const cursor = allowSpotAdd ? 'cursor-crosshair' : 'cursor-pointer'

          return (
            <div
              key={isDaliSpot ? spot.id : `${spot.teamId}-${spot.type}`}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${scale} ${cursor} touch-none`}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: `${logoSize}px`,
                height: `${logoSize}px`,
                opacity,
                zIndex: 2,
                willChange: 'transform, opacity'
              }}
              onClick={(e) => handleSpotClick(spot, e)}
            >
              {isDaliSpot ? (
                <svg
                  width={logoSize}
                  height={logoSize}
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24 46C24 46 42 30.36 42 19C42 10.1634 34.8366 3 26 3C17.1634 3 10 10.1634 10 19C10 30.36 24 46 24 46Z"
                    fill={spotColor}
                  />
                  <circle
                    cx="24"
                    cy="19"
                    r="7"
                    fill="#fff"
                  />
                </svg>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={team?.logo_url || `/logos/${team?.name.toLowerCase()}.png`}
                    alt={`${team?.name} ${spot.type} spot`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/logos/default.png';
                    }}
                  />
                </div>
              )}

              {onSpotRemove && allowSpotAdd && (
                <button
                  onClick={e => { e.stopPropagation(); onSpotRemove(spot.id!); }}
                  className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow"
                  title="Remove Spot"
                  style={{ zIndex: 10 }}
                >
                  ×
                </button>
              )}

              {!isDaliSpot && (
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 text-xs font-medium px-1.5 py-0.5 rounded bg-black/75"
                  style={{ 
                    color: spotColor,
                    bottom: `-${logoSize * 0.2}px`,
                    fontSize: `${Math.max(logoSize * 0.25, 10)}px`
                  }}
                >
                  {spotLabel}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 