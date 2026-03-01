import { supabase } from './supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  department?: string,
  imageFile?: File | null
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  if (authData.user) {
    let imageUrl: string | null = null

    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop() || 'jpg'
        const filePath = `students/${authData.user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('student-photo')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: imageFile.type || 'image/jpeg',
          })

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('student-photo')
            .getPublicUrl(filePath)
          imageUrl = publicUrlData?.publicUrl || null
        }
      } catch {
        // Continue without photo so we still create the student row
      }
    }

    const { error: profileError } = await supabase
      .from('students')
      .insert({
        id: authData.user.id,
        email,
        name,
        department: department || null,
        image_url: imageUrl,
        role: 'student',
      })

    if (profileError) throw profileError
  }

  return authData
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}
