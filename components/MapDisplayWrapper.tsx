'use client'

import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const MapDisplay = dynamic(
  () => import('./MapDisplay'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center" style={{ height: '400px' }}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }
)

interface MapDisplayWrapperProps {
  latitude: number
  longitude: number
  address?: string
  height?: string
}

export default function MapDisplayWrapper({ latitude, longitude, address, height }: MapDisplayWrapperProps) {
  return (
    <MapDisplay
      latitude={latitude}
      longitude={longitude}
      address={address}
      height={height}
    />
  )
}




