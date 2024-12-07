import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Ensure we're on the client side before redirecting
        if (typeof window !== 'undefined') {
          router.replace('/(tabs)/daily')
        }
      } else {
        router.replace('/') // Redirect to home/login if no session
      }
    })
  }, [])

  return null // Or a loading spinner
}