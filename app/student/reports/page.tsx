'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Report } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Eye, Search, Filter, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

export default function ReportsPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (profile) {
      fetchReports()
    }
  }, [profile])

  useEffect(() => {
    filterAndSortReports()
  }, [reports, searchTerm, statusFilter, sortBy, sortOrder])

  const fetchReports = async () => {
    try {
      console.log('🔍 Student: Fetching reports for user:', profile?.id)
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('student_id', profile?.id)
        .order('created_at', { ascending: false })

      console.log('📊 Student reports fetch result:', { data, error })
      if (error) throw error
      setReports(data || [])
      console.log('✅ Student reports set:', data?.length || 0, 'reports')
    } catch (error: any) {
      console.error('❌ Student reports fetch error:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortReports = () => {
    let filtered = [...reports]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    // Sort reports
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'date':
          aValue = new Date(a.date)
          bValue = new Date(b.date)
          break
        case 'location':
          aValue = a.location
          bValue = b.location
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredReports(filtered)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      unresolved: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return styles[status as keyof typeof styles] || styles.new
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="border-0 border-t-4 border-blue-600 mb-8">
            <CardHeader>
              <CardTitle>My Reports</CardTitle>
              <CardDescription>View all reports</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter and Sort Controls */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search reports by type, location, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="w-full sm:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="unresolved">Unresolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-48">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date Submitted</SelectItem>
                        <SelectItem value="date">Incident Date</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-32">
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading reports...</div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  {reports.length === 0 ? (
                    <>
                      <p className="text-gray-500 mb-4">No reports found</p>
                      <Button onClick={() => router.push('/student/report/new')}>
                        Create Your First Report
                      </Button>
                    </>
                  ) : (
                    <p className="text-gray-500">No reports match your filters</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="font-medium">{report.type}</TableCell>
                          <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                          <TableCell className="max-w-xs truncate">{report.location}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                              {report.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-blue-600 border-blue-600">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/student/reports/${report.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// The code above is the complete implementation of the ReportsPage component in a Next.js application.
// It includes functionality to fetch, display, filter, and sort a list of student incident reports.
// I added borders to the cards and changed the color scheme to blue.