import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { firestoreHelpers, COLLECTIONS } from '@/lib/dataProvider'
import { toLocaleDateString } from '@/lib/dateHelpers'
import type { User } from '@/types'

export const TeamListPage = () => {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await firestoreHelpers.getCollection<User>(COLLECTIONS.USERS)
        setEmployees(data)
      } catch (error) {
        console.error('Failed to load employees:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEmployees()
  }, [])

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      on_leave: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      terminated: 'bg-red-100 text-red-800 border-red-200',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Admin',
      manager: 'Manager',
      farm_worker: 'Farm Worker',
      logistics: 'Logistics',
      accounts: 'Accounts',
    }
    return roleMap[role] || role
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-green-100">Manage farm team members and roles</p>
          </div>
          <Button
            onClick={() => navigate('/team/new')}
            className="bg-white text-green-700 hover:bg-green-50"
          >
            + Add Team Member
          </Button>
        </div>
      </div>

      {/* Team List */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading team members...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">No team members yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Add team members to manage your farm staff
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate('/team/new')}
              >
                Add First Team Member
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => navigate(`/team/${employee.id}`)}
                  className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full text-white font-bold text-lg">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          {employee.name}
                        </h3>
                        {employee.status && (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(
                              employee.status
                            )}`}
                          >
                            {employee.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{getRoleLabel(employee.role)}</span>
                        {employee.email && (
                          <>
                            <span>•</span>
                            <span>{employee.email}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{employee.phoneNumber}</span>
                      </div>
                      {employee.hireDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Hired: {toLocaleDateString(employee.hireDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
