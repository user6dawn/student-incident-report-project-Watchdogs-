'use client'

import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const MapLocationPicker = dynamic(
  () => import('./MapLocationPicker'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }
)

interface MapLocationPickerWrapperProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number } | null
  initialAddress?: string
}

export default function MapLocationPickerWrapper({ onLocationSelect, initialLocation, initialAddress }: MapLocationPickerWrapperProps) {
  return (
    <MapLocationPicker
      onLocationSelect={onLocationSelect}
      initialLocation={initialLocation}
      initialAddress={initialAddress}
    />
  )
}

