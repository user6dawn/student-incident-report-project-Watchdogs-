'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase, Report, Student } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ArrowLeft, Trash2, Calendar, MapPin, FileText, User, Mail, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import MapDisplayWrapper from '@/components/MapDisplayWrapper'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

type ReportWithStudent = Report & { students?: Student }

export default function AdminReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [report, setReport] = useState<ReportWithStudent | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchReport()
    }
  }, [params.id])

  const fetchReport = async () => {
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
        .eq('id', params.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        toast.error('Report not found')
        router.push('/admin/reports')
        return
      }

      // if the report was submitted anonymously, strip any student details for safety
      if (data.anonymous) {
        data.students = null
      }

      setReport(data)
    } catch (error: any) {
      toast.error('Failed to load report')
      router.push('/admin/reports')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: 'new' | 'resolved' | 'unresolved') => {
    if (!report) return

    setUpdating(true)

    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', report.id)

      if (error) throw error

      toast.success(`Report marked as ${newStatus}`)
      setReport({ ...report, status: newStatus })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!report) return

    setDeleting(true)

    try {
      if (report.image_url) {
        const fileName = report.image_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('report-photos')
            .remove([`${report.student_id}/${fileName}`])
        }
      }

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id)

      if (error) throw error

      toast.success('Report deleted successfully')
      router.push('/admin/reports')
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
      unresolved: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return styles[status as keyof typeof styles] || styles.new
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!report) return null

  const student = report.students && typeof report.students === 'object' && 'name' in report.students
    ? report.students
    : null

  // Display "anonymous" if the report is marked as anonymous
  const displayName = report.anonymous
    ? 'Anonymous'
    : student?.name || 'Unknown'

  const displayEmail = report.anonymous
    ? 'Anonymous'
    : student?.email || null

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/reports')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Details</h1>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className='border-0 border-t-4 border-blue-600'>
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
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-blue-700" />
                        <span className="font-medium text-blue-700">Date of Incident</span>
                      </div>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(report.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-blue-700" />
                        <span className="font-medium text-blue-700">Location</span>
                      </div>
                      <p className="text-gray-900 dark:text-white">{report.location}</p>
                    </div>
                  </div>

                  {report.latitude && report.longitude && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-blue-700">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-medium">Location on Map</span>
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
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="h-4 w-4 mr-2 text-blue-700" />
                      <span className="font-medium text-blue-700">Description</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {report.image_url && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attached Photo</p>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={report.image_url}
                          alt="Incident photo"
                          className="w-full max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Submitted on {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {(student || report.anonymous) && (
                <Card className='border-0 border-t-4 border-blue-600'>
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 ">
                    {/* student image - hide if report is anonymous */}
                    {!report.anonymous && student?.image_url && (
                      <div className="flex flex-col items-start gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="rounded-full border border-gray-300 dark:border-gray-600 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-shadow"
                              aria-label="View student photo"
                            >
                              <img
                                src={student.image_url}
                                alt={`${student?.name ?? 'Student'} photo`}
                                className="h-24 w-24 rounded-full object-cover"
                              />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl bg-transparent border-none shadow-none p-4 flex items-center justify-center">
                            <img
                              src={student.image_url}
                              alt={`${student?.name ?? 'Student'} photo enlarged`}
                              className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                        <p className="text-xs text-gray-500 dark:text-gray-400"></p>
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-blue-700 mt-0.5" />
                      <div>
                        <p className="text-xs text-blue-700 font-medium">Name</p>
                        <p className="text-gray-900 dark:text-white font-medium">{displayName}</p>
                      </div>
                    </div>
                    {displayEmail && (
                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-blue-700 mt-0.5" />
                        <div>
                          <p className="text-xs text-blue-700 font-medium">Email</p>
                          <p className="text-gray-900 dark:text-white">{displayEmail}</p>
                        </div>
                      </div>
                    )}
                    {student && student.department && !report.anonymous && (
                      <div className="flex items-start space-x-3">
                        <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Department</p>
                          <p className="text-gray-900 dark:text-white">{student.department}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className='border-0 border-t-4 border-blue-600'>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.status !== 'resolved' && (
                    <Button
                      onClick={() => updateStatus('resolved')}
                      disabled={updating}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                  {report.status !== 'unresolved' && report.status !== 'resolved' && (
                    <Button
                    className="w-full bg-grey-100 text-black hover:bg-blue-100 hover:text-black"
                      onClick={() => updateStatus('unresolved')}
                      disabled={updating}
                      variant="outline"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark as Unresolved
                    </Button>
                  )}
                  {report.status === 'resolved' && (
                    <Button
                    className="w-full bg-grey-100 text-black hover:bg-blue-100 hover:text-black"
                      onClick={() => updateStatus('unresolved')}
                      disabled={updating}
                      variant="outline"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark as Unresolved
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={deleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Report
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this report and any associated photos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-400">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}