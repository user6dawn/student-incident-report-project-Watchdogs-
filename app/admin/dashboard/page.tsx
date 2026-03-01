'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Report } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, AlertCircle, CheckCircle2, LogOut, Users } from 'lucide-react'
import { toast } from 'sonner'
import ReportsMapWrapper from '@/components/ReportsMapWrapper'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          students:student_id (
            id,
            name,
            email,
            department,
            image_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error: any) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/admin/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const recentReports = reports.slice(0, 5)
  const unresolvedCount = reports.filter(r => r.status === 'new' || r.status === 'unresolved').length
  const resolvedCount = reports.filter(r => r.status === 'resolved').length

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      unresolved: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return styles[status as keyof typeof styles] || styles.new
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {profile?.name}</p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className='bg-blue-700 text-white'>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold ">{reports.length}</div>
                <p className="text-xs text-white">All time submissions</p>
              </CardContent>
            </Card>

            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unresolvedCount}</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>

            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-blue-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resolvedCount}</div>
                <p className="text-xs text-muted-foreground">Completed cases</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 border-0 border-t-4 border-blue-600">
            <CardHeader>
              <CardTitle>Reports Map</CardTitle>
              <CardDescription>
                View all reports on the map. Green markers indicate resolved reports, red markers indicate unresolved reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Loading map...</p>
                </div>
              ) : (
                <ReportsMapWrapper reports={reports} height="500px" basePath="admin" />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 border-t-4 border-blue-600">
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Latest incident submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500 py-4">Loading reports...</p>
              ) : recentReports.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No reports yet</p>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/reports/${report.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">{report.type}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.anonymous
                            ? 'Anonymous'
                            : report.students && typeof report.students === 'object' && 'name' in report.students
                            ? report.students.name
                            : 'Unknown Student'} • {new Date(report.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{report.location}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-gray-300">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
