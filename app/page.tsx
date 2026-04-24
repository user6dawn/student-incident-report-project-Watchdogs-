'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, FileText } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAVBAR */}
      <nav className="w-full bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-700" />
            <span className="font-bold text-xl text-blue-700">WatchDogs</span>
          </div>
          <div className="flex gap-3">
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => router.push('/student/login')}>
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-700/10 p-4 rounded-full">
            <Shield className="h-12 w-12 text-blue-700" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6">
          Secure Incident Reporting for Students
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Report issues, track progress, and stay informed. WatchDogs provides a secure and transparent system for students and administrators.
        </p>

        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-blue-700 hover:bg-blue-800" onClick={() => router.push('/student/login')}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/student/login')}>
            Login
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <Card className="shadow-sm hover:shadow-md transition">
            <CardHeader>
              <Users className="text-blue-700 h-8 w-8 mb-2" />
              <CardTitle>Easy Reporting</CardTitle>
              <CardDescription>Create reports in seconds</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Submit detailed incident reports with descriptions and images quickly and easily.
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition">
            <CardHeader>
              <FileText className="text-blue-700 h-8 w-8 mb-2" />
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>Real-time updates</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Monitor the status of your reports and get updates as actions are taken.
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition">
            <CardHeader>
              <Shield className="text-blue-700 h-8 w-8 mb-2" />
              <CardTitle>Secure System</CardTitle>
              <CardDescription>Privacy guaranteed</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Your data is protected with secure storage and role-based access control.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* STUDENT CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Start Reporting Today</h2>
        <p className="text-gray-600 mb-6">
          Join students already using WatchDogs to stay safe and heard.
        </p>
        <Button size="lg" className="bg-blue-700 hover:bg-blue-800" onClick={() => router.push('/student/login')}>
          Create Account
        </Button>
      </section>

      {/* ADMIN SECTION */}
      <section className="bg-blue-700 text-white py-20">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Are you an Admin?</h2>
          <p className="mb-6 text-white/80">
            Access the admin dashboard to manage reports, users, and system analytics.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-blue-700 hover:bg-gray-100"
            onClick={() => router.push('/admin/login')}
          >
            Admin Login
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} WatchDogs. All rights reserved.
      </footer>
    </div>
  )
}
