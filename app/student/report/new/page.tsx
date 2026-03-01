'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Upload, MapPin } from 'lucide-react'
import { toast } from 'sonner'

const INCIDENT_TYPES = [
  'Bullying',
  'Theft',
  'Damage to Property',
  'Harassment',
  'Discrimination',
  'Violence',
  'Vandalism',
  'Other'
]

export default function NewReportPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [locationData, setLocationData] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)

  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: ''
  })

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          )
          const data = await response.json()
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          
          const location = {
            lat: latitude,
            lng: longitude,
            address: address
          }
          
          setLocationData(location)
          setFormData(prev => ({ ...prev, location: address }))
          toast.success('Location detected!')
          console.log('Location detected:', {
            latitude: location.lat,
            longitude: location.lng,
            address: location.address
          })
        } catch (error) {
          const { latitude, longitude } = position.coords
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          const location = {
            lat: latitude,
            lng: longitude,
            address: address
          }
          setLocationData(location)
          setFormData(prev => ({ ...prev, location: address }))
          toast.success('Location detected (coordinates only)')
        } finally {
          setDetectingLocation(false)
        }
      },
      (error) => {
        toast.error('Failed to detect location. Please enter manually.')
        setDetectingLocation(false)
      }
    )
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !profile) return null

    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${profile.id}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('report-photos')
      .upload(fileName, photoFile)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('report-photos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    // Location is required, but can be entered manually or detected
    if (!formData.location) {
      toast.error('Please enter or detect a location')
      return
    }

    // If location was detected, validate the coordinates
    if (locationData) {
      if (typeof locationData.lat !== 'number' || typeof locationData.lng !== 'number') {
        toast.error('Invalid location data. Please detect location again or enter manually.')
        return
      }

      if (isNaN(locationData.lat) || isNaN(locationData.lng)) {
        toast.error('Invalid location coordinates. Please detect location again or enter manually.')
        return
      }
    }

    setLoading(true)

    try {
      let photoUrl = null
      if (photoFile) {
        photoUrl = await uploadPhoto()
      }

      const reportData = {
        student_id: profile?.id,
        anonymous: isAnonymous,
        type: formData.type,
        date: formData.date,
        location: formData.location,
        latitude: locationData?.lat || null,
        longitude: locationData?.lng || null,
        description: formData.description,
        image_url: photoUrl,
        status: 'new' as const
      }

      console.log('Submitting report with location data:', {
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        address: reportData.location
      })

      const { data: insertedReport, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select('id')
        .single()

      if (error) throw error

      // Notify via Brevo email (await so request completes before redirect)
      try {
        const res = await fetch('/api/notify-new-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: insertedReport?.id,
            type: reportData.type,
            date: reportData.date,
            location: reportData.location,
            description: reportData.description,
            anonymous: reportData.anonymous,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error('Notify API failed:', res.status, err)
        }
      } catch (e) {
        console.error('Failed to send notification email:', e)
      }

      toast.success('Report submitted successfully!')
      router.push('/student/reports')
    } catch (error: any) {
      console.error('Error submitting report:', error)
      toast.error(error.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-3xl mx-auto py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="border-0 border-t-4 border-blue-700 mb-8 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-2xl">Create New Report</CardTitle>
                  <CardDescription className="text-gray-600">Submit a detailed report for best outcome</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type of Incident</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCIDENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date of Incident</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="location"
                      type="text"
                      placeholder="Enter location or detect automatically"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                    <Button
                      className="text-blue-700"
                      type="button"
                      variant="outline"
                      onClick={detectLocation}
                      disabled={detectingLocation}
                    >
                      <MapPin className="h-4 w-4 mr-2 text-blue-700" />
                      {detectingLocation ? 'Detecting...' : 'Detect'}
                    </Button>
                  </div>
                  {locationData && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Location detected: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the incident..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Upload Photo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                    />
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                  {photoPreview && (
                    <div className="mt-4">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="max-w-sm rounded-lg border"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  <Checkbox
                    id="anonymous"
                    className=""
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                  />
                  <Label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Submit anonymously
                  </Label>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white">
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="border-blue-700 text-blue-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// This page is protected and requires the user to be logged in as a student
// It allows students to create a new report with various fields including type, date, location, description, and photo upload
// The location can be detected automatically or entered manually
// The report can be submitted anonymously if desired
// The form includes validation for required fields and file size limits for photo uploads
// Upon successful submission, the user is redirected to the reports list page