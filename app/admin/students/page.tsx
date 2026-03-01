'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase, Student } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Edit, Shield, User, Search, Filter, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination'
import page from '../stats/page'

export default function AdminStudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editForm, setEditForm] = useState({ name: '', department: '', role: 'student' as 'student' | 'admin' })
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const perPage = 10
  const totalPages = Math.ceil(filteredStudents.length / perPage)
  const paginatedStudents = filteredStudents.slice((page - 1) * perPage, page * perPage)
  useEffect(() => {
    setPage(1)
  }, [filteredStudents])

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterAndSortStudents()
  }, [students, searchTerm, roleFilter, sortBy, sortOrder])

  const fetchStudents = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (studentsError) throw studentsError

      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('student_id')

      if (reportsError) throw reportsError

      const counts: Record<string, number> = {}
      reportsData?.forEach(report => {
        counts[report.student_id] = (counts[report.student_id] || 0) + 1
      })

      setStudents(studentsData || [])
      setReportCounts(counts)
    } catch (error: any) {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setEditForm({
      name: student.name,
      department: student.department || '',
      role: student.role
    })
  }

  const filterAndSortStudents = () => {
    let filtered = [...students]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.department && student.department.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(student => student.role === roleFilter)
    }

    // Sort students
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'department':
          aValue = a.department || ''
          bValue = b.department || ''
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'reports':
          aValue = reportCounts[a.id] || 0
          bValue = reportCounts[b.id] || 0
          break
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredStudents(filtered)
  }

  const handleSave = async () => {
    if (!editingStudent) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: editForm.name,
          department: editForm.department || null,
          role: editForm.role
        })
        .eq('id', editingStudent.id)

      if (error) throw error

      toast.success('Student updated successfully')
      setEditingStudent(null)
      fetchStudents()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update student')
    } finally {
      setSaving(false)
    }
  }

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className='border-0 border-t-4 border-blue-600'>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>View and manage all registered students</CardDescription>
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
                        placeholder="Search students by name, email, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Role Filter */}
                  <div className="w-full sm:w-48">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
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
                        <SelectItem value="created_at">Date Created</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                        <SelectItem value="reports">Report Count</SelectItem>
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
                <div className="text-center py-8 text-gray-500">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {students.length === 0 ? 'No students registered yet' : 'No students match your filters'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                        <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Department</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Reports</TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => (
                        <TableRow key={student.id} className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                          <TableCell className="font-medium text-gray-900 dark:text-white">{student.name}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{student.email}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{student.department || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {student.role === 'admin' ? (
                                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              )}
                              <span className={`text-sm ${student.role === 'admin' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                {student.role}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{reportCounts[student.id] || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(student)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div>
                    <Pagination className="mt-2">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            aria-disabled={page === 1 || loading}
                            onClick={(e) => {
                              if (page === 1 || loading) { e.preventDefault(); return }
                              setPage((prev) => Math.max(1, prev - 1))
                            }}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={p === page}
                              onClick={(e) => {
                                e.preventDefault()
                                setPage(p)
                              }}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            aria-disabled={page === totalPages || loading || totalPages === 0}
                            onClick={(e) => {
                              if (page === totalPages || loading || totalPages === 0) { e.preventDefault(); return }
                              setPage((prev) => Math.min(totalPages, prev + 1))
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                 </div>
               )}
             </CardContent>
           </Card>
         </main>
       </div>

      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information and role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: 'student' | 'admin') => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Changing role to admin will grant full administrative access
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
