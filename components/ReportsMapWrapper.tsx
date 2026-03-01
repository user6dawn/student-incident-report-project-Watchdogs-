'use client'

import dynamic from 'next/dynamic'
import { Report } from '@/lib/supabase'

// Dynamically import the map component to avoid SSR issues
const ReportsMap = dynamic(
  () => import('@/components/ReportsMap'),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"
        style={{ height: '500px' }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
)

interface ReportsMapWrapperProps {
  reports: Report[]
  height?: string
  basePath?: string
}

export default function ReportsMapWrapper({ reports, height, basePath }: ReportsMapWrapperProps) {
  return (
    <ReportsMap reports={reports} height={height} basePath={basePath} />
  )
}

