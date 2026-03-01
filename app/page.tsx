'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, FileText, AlertCircle } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-gray-900 dark:to-gray-800 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-blue-700" />
          </div>
          <h1 className="text-5xl font-bold text-blue-700 mb-4">
           WatchDogs
          </h1>
          {/* <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A secure platform for reporting and managing incidents with role-based access control providing students with the immediate support they need.
          </p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2 text-blue-700">
                <Users className="h-8 w-8 text-blue-700" />
                <CardTitle className="text-2xl">Student Portal</CardTitle>
              </div>
              <CardDescription>Report incidents and track their status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Create detailed incident reports with photos</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Track report status in real-time</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>View and manage your submissions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Secure and confidential reporting</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push('/student/login')}
                className="w-full bg-blue-700 hover:bg-blue-700"
                size="lg"
              >
                Student Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-blue-700 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-white" />
                <CardTitle className="text-2xl text-white">Admin Portal</CardTitle>
              </div>
              <CardDescription className='text-white'>Manage reports and student accounts</CardDescription>
            </CardHeader >
            <CardContent className="space-y-4 ">
              <ul className="space-y-2 text-sm text-white">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>View and manage all incident reports</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Update report status and resolution</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Manage student accounts and roles</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Comprehensive dashboard analytics</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push('/admin/login')}
                variant="outline"
                className="w-full text-blue-700 hover:bg-gray-100 hover:text-blue-700"
                size="lg"
              >
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-8 border border-blue-100 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-blue-700 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-medium mb-1">Role-Based Access</p>
                  <p className="text-gray-600 dark:text-gray-400">Separate portals for students and administrators with appropriate permissions</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Real-Time Updates</p>
                  <p className="text-gray-600 dark:text-gray-400">Track report status changes and receive instant notifications</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Secure Storage</p>
                  <p className="text-gray-600 dark:text-gray-400">All data encrypted and stored securely with strict access controls</p>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}
// Login and sign for student. login for admin