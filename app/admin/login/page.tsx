'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { user } = await signIn(form.email, form.password)

      const { data: profile } = await supabase
        .from('students')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        toast.error('Access denied. Admin credentials required.')
        setLoading(false)
        return
      }

      toast.success('Admin login successful!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Admin Dashboard</h1>
        </div>

        <Card className="p-6 bg-blue-600 rounded-lg shadow-lg">
          <CardHeader >
            <CardTitle className='text-white'>Administrator Login</CardTitle>
            <CardDescription className='text-white'>Access the administrative dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 text-white">
                <Label htmlFor="email ">Email</Label>
                <Input
                className='text-black'
                  id="email"
                  type="email"
                  placeholder="admin@university.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 text-white">
                <Label htmlFor="password">Password</Label>
                <Input
                className='text-black'
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-white hover:bg-gray-100 text-black" disabled={loading} >
                {loading ? 'Logging in...' : 'Login as Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center ">
          <Button variant="link" onClick={() => router.push('/student/login')} className="text-blue-600">
            Student Login
          </Button>
        </div>
      </div>
    </div>
  )
}


//