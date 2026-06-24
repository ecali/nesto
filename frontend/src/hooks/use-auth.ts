import { useState, useEffect } from 'react'
import { pb, isAuthenticated, currentUser } from '@/lib/pocketbase'

export function useAuth() {
  const [user, setUser] = useState(currentUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(currentUser())
      setLoading(false)
    })
    setLoading(false)
    return unsubscribe
  }, [])

  async function login(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password)
    setUser(authData.record)
    return authData
  }

  async function register(email: string, password: string, name: string) {
    const record = await pb.collection('users').create({ email, password, passwordConfirm: password, name })
    await pb.collection('users').requestVerification(email)
    return record
  }

  function logout() {
    pb.authStore.clear()
    setUser(null)
  }

  return { user, loading, isAuthenticated: isAuthenticated(), login, register, logout }
}
