'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'

export default function StudentLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(loginForm.email, loginForm.password)
      toast.success('Login successful!')
      router.push('/student/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setPhotoFile(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photoFile) {
      toast.error('Please upload a student photo')
      return
    }
    setLoading(true)

    try {
      await signUp(
        signupForm.email,
        signupForm.password,
        signupForm.name,
        signupForm.department,
        photoFile
      )
      toast.success('Account created! Please login.')
      setSignupForm({ name: '', email: '', password: '', department: '' })
      setPhotoFile(null)
      setPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-white"><b>Welcome to WatchDogs</b></h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader>
                <CardTitle className='text-blue-600 text'>Welcome Back</CardTitle>
                <CardDescription>Login to access your incident reports</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="student@university.edu"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      className='mb-6'
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader>
                <CardTitle className='text-blue-600'>Create Account</CardTitle>
                <CardDescription>Register as a new student</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4" encType="multipart/form-data">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="student@university.edu"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-department">Department (Optional)</Label>
                    <Input
                      id="signup-department"
                      type="text"
                      placeholder="Computer Science"
                      value={signupForm.department}
                      onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-photo">Student Photo</Label>
                    <Input
                      id="signup-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      ref={fileInputRef}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Upload a clear headshot (PNG or JPG, max 5MB).
                    </p>
                    {photoPreview && (
                      <div className="flex items-center gap-4">
                        <img
                          src={photoPreview}
                          alt="Student preview"
                          className="h-20 w-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setPhotoFile(null)
                            setPhotoPreview((prev) => {
                              if (prev) URL.revokeObjectURL(prev)
                              return null
                            })
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => router.push('/admin/login')}>
            Admin Login
          </Button>
        </div>
      </div>
    </div>
  )
}
