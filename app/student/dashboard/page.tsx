'use client'

import { useEffect, useState } from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Report } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, AlertCircle, CheckCircle2, LogOut, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import ReportsMapWrapper from '@/components/ReportsMapWrapper'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'

export default function StudentDashboard() {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchReports()
    }
  }, [profile])

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('student_id', profile?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error: any) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const totalReports = reports.length
  const unresolvedReports = reports.filter(r => r.status === 'new' || r.status === 'unresolved').length
  const resolvedReports = reports.filter(r => r.status === 'resolved').length

  const highlightedDays = useMemo(() => {
    const set = new Set<string>()
    reports.forEach((r) => {
      const src = r.date || r.created_at
      if (!src) return
      const d = typeof src === 'string' ? src.slice(0, 10) : new Date(src).toISOString().slice(0, 10)
      set.add(d)
    })
    return Array.from(set).map((s) => new Date(s))
  }, [reports])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/student/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="border==min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-black">Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome, {profile?.name}. Good to see you again.</p>
            </div>
          </div>
        </header>

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column (2/3) - contains stats, map, and recent reports */}
            <div className="md:col-span-2">
              <div className="max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-blue-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 b">
                      <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                      <FileText className="h-4 w-4 text-white" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalReports}</div>
                      <p className="text-xs text-muted-foreground text-white">All submitted reports</p>
                    </CardContent>
                  </Card>

                  <Card className='border-0 border-t-4 border-blue-600'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium ">Unresolved</CardTitle>
                      <AlertCircle className="h-4 w-4 text-blue-700" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{unresolvedReports}</div>
                      <p className="text-xs text-muted-foreground">Pending review</p>
                    </CardContent>
                  </Card>

                  <Card className='border-0 border-t-4 border-blue-600'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-blue-700" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{resolvedReports}</div>
                      <p className="text-xs text-muted-foreground">Completed cases</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="mb-0 border-0 border-t-4 border-blue-700">
                    <CardHeader>
                      <CardTitle>Reports Map</CardTitle>
                      <CardDescription>
                        View all your reports on the map. Green markers indicate resolved reports, red markers indicate unresolved reports.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500">Loading map...</p>
                        </div>
                      ) : (
                        <ReportsMapWrapper reports={reports} height="500px" basePath="student" />
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 border-t-4 border-blue-700">
                    <CardHeader>
                      <CardTitle>Recently Reported</CardTitle>
                      <CardDescription>Your latest reports appear here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <p className="text-center text-gray-500 py-4">Loading reports...</p>
                      ) : reports.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No reports yet. Create your first report to get started.</p>
                      ) : (
                        <div className="space-y-3">
                          {reports.slice(0, 5).map((report) => (
                            <div
                              key={report.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              onClick={() => router.push(`/student/reports/${report.id}`)}
                            >
                              <div className="flex-1">
                                <p className="font-medium">{report.type}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(report.date).toLocaleDateString()} • {report.location}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  report.status === 'resolved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : report.status === 'new'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                }`}>
                                  {report.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right column (1/3) - calendar only, stays alone on the right */}
            
            <aside className="md:col-span-1">
              <div className="sticky top-24">
                <Card className="w-fit border-0 border-t-4 border-blue-700">
                  <CardHeader>
                    <CardTitle>Reports Calendar</CardTitle>
                    <CardDescription className="text-gray-600">
                      See days with activity
                    </CardDescription>
                  </CardHeader>
                    <CardContent className="p-4">
                      <div className="w-full">
                        <Calendar
                          mode="single"
                          selected={undefined}
                          onSelect={() => {}}
                          month={new Date()}
                          className="w-full"
                          modifiers={{ hasReports: highlightedDays }}
                          modifiersClassNames={{
                            hasReports:
                              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>


              </div>
            </aside>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
//