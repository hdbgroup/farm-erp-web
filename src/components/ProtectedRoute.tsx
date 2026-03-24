import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { user, loading } = useAuth()

  console.log('🛡️ ProtectedRoute: loading=', loading, 'user=', user)

  if (loading) {
    console.log('🛡️ ProtectedRoute: Still loading...')
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('🛡️ ProtectedRoute: No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('🛡️ ProtectedRoute: User authenticated:', user.name)

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    console.log('🛡️ ProtectedRoute: Access denied for role:', user.role)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  console.log('🛡️ ProtectedRoute: Access granted')
  return <>{children}</>
}
