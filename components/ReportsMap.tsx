    'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Report } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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

// Create custom icons for resolved (green) and unresolved (red) reports
const createCustomIcon = (color: 'green' | 'red') => {
  if (typeof window === 'undefined') return undefined
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

interface ReportsMapProps {
  reports: Report[]
  height?: string
  basePath?: string // 'admin' or 'student' for routing
}

export default function ReportsMap({ reports, height = '500px', basePath = 'admin' }: ReportsMapProps) {
  const router = useRouter()
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Ensure map only loads on client side
    if (typeof window !== 'undefined') {
      setMapLoaded(true)
    }
  }, [])

  // Filter reports that have latitude and longitude
  const reportsWithLocation = reports.filter(
    (report) => report.latitude && report.longitude && 
    typeof report.latitude === 'number' && typeof report.longitude === 'number' &&
    !isNaN(report.latitude) && !isNaN(report.longitude)
  )

  useEffect(() => {
    if (mapLoaded && typeof window !== 'undefined') {
      console.log('ReportsMap: Map loaded, reports with location:', reportsWithLocation.length)
      console.log('ReportsMap: Total reports:', reports.length)
    }
  }, [mapLoaded, reportsWithLocation.length, reports.length])

  if (!mapLoaded) {
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  // Show map even if no reports, but with a message
  if (reportsWithLocation.length === 0) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700" style={{ height, position: 'relative', minHeight: '500px' }}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={2}
          style={{ height: '100%', width: '100%', zIndex: 0, minHeight: '500px' }}
          className="z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">No reports with location data available</p>
        </div>
      </div>
    )
  }

  // Calculate center point from all reports
  const centerLat = reportsWithLocation.reduce((sum, r) => sum + (r.latitude || 0), 0) / reportsWithLocation.length
  const centerLng = reportsWithLocation.reduce((sum, r) => sum + (r.longitude || 0), 0) / reportsWithLocation.length

  // Create icons inside component to ensure they're created after window is available
  const greenIcon = createCustomIcon('green')
  const redIcon = createCustomIcon('red')

  const getMarkerIcon = (status: string) => {
    if (!greenIcon || !redIcon) {
      // Fallback to default icon if custom icons aren't ready
      return undefined
    }
    if (status === 'resolved') {
      return greenIcon
    }
    // For 'new' or 'unresolved' status, use red
    return redIcon
  }

  const getStatusColor = (status: string) => {
    if (status === 'resolved') {
      return 'text-green-600'
    }
    return 'text-red-600'
  }

  // Ensure valid center coordinates
  const validCenterLat = isNaN(centerLat) || !isFinite(centerLat) ? 51.505 : centerLat
  const validCenterLng = isNaN(centerLng) || !isFinite(centerLng) ? -0.09 : centerLng

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700" style={{ height, position: 'relative', minHeight: '500px' }}>
      <MapContainer
        key={`map-${reportsWithLocation.length}-${mapLoaded}`}
        center={[validCenterLat, validCenterLng]}
        zoom={reportsWithLocation.length === 1 ? 15 : 12}
        style={{ height: '100%', width: '100%', zIndex: 0, minHeight: '500px' }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reportsWithLocation.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude!, report.longitude!]}
            icon={getMarkerIcon(report.status)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className={`h-4 w-4 ${getStatusColor(report.status)}`} />
                  <h3 className="font-semibold text-sm">{report.type}</h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {report.location}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                  {new Date(report.date).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'resolved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : report.status === 'new'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/${basePath}/reports/${report.id}`)
                  }}
                  className="text-xs text-blue-700 hover:text-blue-800 underline cursor-pointer mt-2"
                >
                  View Details →
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

