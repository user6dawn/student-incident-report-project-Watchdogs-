'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface MapDisplayProps {
  latitude: number
  longitude: number
  address?: string
  height?: string
}

export default function MapDisplay({ latitude, longitude, address, height = '400px' }: MapDisplayProps) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    setMapLoaded(true)
  }, [])

  if (!mapLoaded) {
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  if (!latitude || !longitude) {
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">Location data not available</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700" style={{ height }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          {address && (
            <Popup>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{address}</span>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  )
}




