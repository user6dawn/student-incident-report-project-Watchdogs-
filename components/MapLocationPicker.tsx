'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'
import { toast } from 'sonner'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface MapLocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number } | null
  initialAddress?: string
}

function LocationMarker({ onLocationSelect, initialLocation }: { onLocationSelect: (location: { lat: number; lng: number; address: string }) => void; initialLocation?: { lat: number; lng: number } | null }) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialLocation || null)

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition({ lat, lng })
      fetchAddress(lat, lng)
    },
  })

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation)
      map.setView([initialLocation.lat, initialLocation.lng], 15)
    }
  }, [initialLocation, map])

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      )
      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onLocationSelect({ lat, lng, address })
      toast.success('Location selected!')
    } catch (error) {
      const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onLocationSelect({ lat, lng, address })
      toast.success('Location selected (coordinates only)')
    }
  }

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} />
  )
}

export default function MapLocationPicker({ onLocationSelect, initialLocation, initialAddress }: MapLocationPickerProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    initialLocation && initialAddress
      ? { lat: initialLocation.lat, lng: initialLocation.lng, address: initialAddress }
      : null
  )

  useEffect(() => {
    // Ensure map only loads on client side
    if (typeof window !== 'undefined') {
      setMapLoaded(true)
    }
  }, [])

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setCurrentLocation(location)
    onLocationSelect(location)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          )
          const data = await response.json()
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          const location = { lat: latitude, lng: longitude, address }
          setCurrentLocation(location)
          handleLocationSelect(location)
        } catch (error) {
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          const location = { lat: latitude, lng: longitude, address }
          setCurrentLocation(location)
          handleLocationSelect(location)
        }
      },
      (error) => {
        toast.error('Failed to get your location. Please click on the map to select a location.')
      }
    )
  }

  if (!mapLoaded) {
    return (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  const defaultCenter: [number, number] = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [0, 0] // Will be updated when user selects location

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          Use My Current Location
        </Button>
        {currentLocation && (
          <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 inline mr-1" />
              {currentLocation.address}
            </p>
          </div>
        )}
      </div>
      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
        <MapContainer
          key={currentLocation ? `${currentLocation.lat}-${currentLocation.lng}` : 'default'}
          center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [51.505, -0.09]}
          zoom={currentLocation ? 15 : 2}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          className="z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            onLocationSelect={handleLocationSelect}
            initialLocation={currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : null}
          />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Click on the map to select the exact location of the incident, or use your current location.
      </p>
    </div>
  )
}

