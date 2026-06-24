import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '@/lib/pocketbase'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
