'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase, Report } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Eye, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { toast } from 'sonner'

export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // search / sort / filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<'created_at' | 'type' | 'status'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchReports()
  }, [page, statusFilter, sortField, sortOrder, searchTerm])

  const fetchReports = async () => {
    setLoading(true)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    try {
      let query = supabase
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
        `, { count: 'exact' })

      // apply filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // apply search if entered
      if (searchTerm) {
        // look in type, location, student name
        query = query.or(
          `type.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,students.name.ilike.%${searchTerm}%`
        )
      }

      // pagination bounds
      query = query.range(from, to)

      // apply sorting
      query = query.order(sortField, { ascending: sortOrder === 'asc' })

      const { data, error, count } = await query

      if (error) throw error
      setReports(data || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
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

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalCount)

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/dashboard')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Reports</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className='border-0 border-t-4 border-blue-600'>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and manage all incident reports</CardDescription>
            </CardHeader>
            <CardContent>
              {/* search / filter / sort controls */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* search input */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search reports by type, location, or student..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {/* status filter */}
                  <div className="w-full sm:w-48">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="unresolved">Unresolved</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* sort controls row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-48">
                    <Select value={sortField} onValueChange={(val) => { setSortField(val as any); setPage(1); }}>
                      <SelectTrigger>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-32">
                    <Select value={sortOrder} onValueChange={(val: 'asc' | 'desc') => { setSortOrder(val); setPage(1); }}>
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
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No reports submitted yet</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-gray-50">
                          <TableHead className="text-gray-700">Type</TableHead>
                          <TableHead className="text-gray-700">Student</TableHead>
                          <TableHead className="text-gray-700">Date</TableHead>
                          <TableHead className="text-gray-700">Location</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="text-right text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id} className="border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell className="font-medium text-gray-900 dark:text-white">{report.type}</TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              {report.anonymous
                                ? 'Anonymous'
                                : report.students && typeof report.students === 'object' && 'name' in report.students
                                ? report.students.name
                                : 'Unknown'}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                              {new Date(report.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300 max-w-xs truncate">{report.location}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                                {report.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/admin/reports/${report.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    {totalCount > 0 && (
                      <span>
                        Showing {startItem}–{endItem} of {totalCount} reports
                      </span>
                    )}
                  </div>
                  <Pagination className="mt-2">
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 pl-2.5"
                          disabled={page === 1 || loading}
                          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={p === page}
                            onClick={(e) => {
                              e.preventDefault()
                              setPage(p)
                            }}
                            href="#"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 pr-2.5"
                          disabled={page === totalPages || loading || totalPages === 0}
                          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
