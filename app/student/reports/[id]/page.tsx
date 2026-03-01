'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Report } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ArrowLeft, Trash2, Calendar, MapPin, FileText } from 'lucide-react'
import { toast } from 'sonner'
import MapDisplayWrapper from '@/components/MapDisplayWrapper'

export default function ReportDetailPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id && profile) {
      fetchReport()
    }
  }, [params.id, profile])

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', params.id)
        .eq('student_id', profile?.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        toast.error('Report not found')
        router.push('/student/reports')
        return
      }

      setReport(data)
    } catch (error: any) {
      toast.error('Failed to load report')
      router.push('/student/reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!report) return

    if (report.status === 'resolved') {
      toast.error('Cannot delete resolved reports')
      return
    }

    setDeleting(true)

    try {
      if (report.image_url) {
        const fileName = report.image_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('report-photos')
            .remove([`${profile?.id}/${fileName}`])
        }
      }

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id)

      if (error) throw error

      toast.success('Report deleted successfully')
      router.push('/student/reports')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete report')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      unresolved: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return styles[status as keyof typeof styles] || styles.new
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!report) return null

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/reports')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>

          <Card className="border-0 border-t-4 border-blue-600 mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{report.type}</CardTitle>
                  <CardDescription className="mt-2">
                    Report ID: {report.id} 
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(report.status)}`}>
                  {report.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-blue-600 dark:text-gray-400">
                    {/* <Calendar className="h-4 w-4 mr-2" /> */}
                    <span className="font-medium text-blue-600">Date of Incident</span>
                  </div>
                  <p className="text-lg">{new Date(report.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-blue-600 dark:text-gray-400">
                    {/* <MapPin className="h-4 w-4 mr-2" /> */}
                    <span className="font-medium text-blue-600">Location</span>
                  </div>
                  <p className="text-lg">{report.location}</p>
                </div>
              </div>

              {report.latitude && report.longitude && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-blue-600 dark:text-gray-400">
                    {/* <MapPin className="h-4 w-4 mr-2" /> */}
                    <span className="font-medium text-blue-600">Location on Map</span>
                  </div>
                  <MapDisplayWrapper
                    latitude={report.latitude}
                    longitude={report.longitude}
                    address={report.location}
                    height="400px"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center text-sm text-blue-600 dark:text-gray-400">
                  {/* <FileText className="h-4 w-4 mr-2" /> */}
                  <span className="font-medium text-blue-600">Description</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {report.description}
                </p>
              </div>

              {report.image_url && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600 dark:text-gray-400">Image</p>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={report.image_url}
                      alt="Incident photo"
                      className="w-full max-h-96 object-contain bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Submitted on {new Date(report.created_at).toLocaleString()}
                </p>
              </div>

              {(report.status === 'new' || report.status === 'unresolved') && (
                <div className="pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={deleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Report
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your report.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// The code above is the complete implementation of the ReportDetailPage component in a Next.js application.
// It includes functionality to fetch and display detailed information about a specific student incident report,
// as well as the ability to delete the report if it is not resolved. 
// The component uses various UI components for styling and layout, and it handles loading states and error cases appropriately.
// i made the heading blue, removed all the icons, increased the lenght og the report id shown to full length and added borders to the cards