import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InfoCard } from '@/components/ui/info-card'
import { firestoreHelpers, COLLECTIONS } from '@/lib/dataProvider'
import { useAuth } from '@/contexts/AuthContext'
import { toDateInputValue, toTimestamp } from '@/lib/dateHelpers'
import type { User, UserRole, UserStatus } from '@/types'

export const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState<UserRole>('farm_worker')
  const [status, setStatus] = useState<UserStatus>('active')
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0])

  // Profile fields
  const [address, setAddress] = useState('')
  const [dob, setDob] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

  useEffect(() => {
    if (!isNew && id) {
      loadEmployee(id)
    }
  }, [id, isNew])

  const loadEmployee = async (employeeId: string) => {
    try {
      const data = await firestoreHelpers.getDocument<User>(
        COLLECTIONS.USERS,
        employeeId
      )
      if (data) {
        setName(data.name)
        setEmail(data.email || '')
        setPhoneNumber(data.phoneNumber)
        setRole(data.role)
        setStatus(data.status || 'active')
        setHireDate(toDateInputValue(data.hireDate))

        if (data.profile) {
          setAddress(data.profile.address || '')
          setDob(toDateInputValue(data.profile.dob))
          setEmergencyContactName(data.profile.emergencyContactName || '')
          setEmergencyContactPhone(data.profile.emergencyContactPhone || '')
        }
      }
    } catch (error) {
      console.error('Failed to load employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const userData: any = {
        name,
        phoneNumber,
        email: email || undefined,
        role,
        status,
        hireDate: toTimestamp(hireDate),
        profile: {
          address: address || undefined,
          dob: toTimestamp(dob),
          emergencyContactName: emergencyContactName || undefined,
          emergencyContactPhone: emergencyContactPhone || undefined,
        },
        updatedAt: toTimestamp(new Date()),
      }

      if (isNew) {
        await firestoreHelpers.addDocument(COLLECTIONS.USERS, {
          ...userData,
          createdAt: toTimestamp(new Date()),
          createdBy: user?.id || 'system',
        })
      } else if (id) {
        await firestoreHelpers.updateDocument(COLLECTIONS.USERS, id, userData)
      }

      navigate('/team')
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save team member. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/team')}>
          ← Back to Team
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/team')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Team
        </Button>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          {isNew ? 'Add Team Member' : 'Edit Team Member'}
        </h1>
        <p className="text-green-100">
          {isNew ? 'Add a new member to your farm team' : 'Update team member information'}
        </p>
        {isNew && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-sm text-white/90">
              ℹ️ After adding a team member, they can log in using their phone number.
              Firebase will send them an OTP code for verification on their first login.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <InfoCard title="Basic Information">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="+15551234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date *</Label>
              <Input
                id="hireDate"
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                required
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="farm_worker">Farm Worker</option>
                <option value="logistics">Logistics</option>
                <option value="accounts">Accounts</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </InfoCard>

        {/* Personal Details */}
        <InfoCard title="Personal Details">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Farm Road, Rural Valley, CA"
              />
            </div>
          </div>
        </InfoCard>

        {/* Emergency Contact */}
        <InfoCard title="Emergency Contact">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+15559876543"
              />
            </div>
          </div>
        </InfoCard>

        {/* Action Buttons */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/team')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? 'Saving...' : isNew ? 'Add Team Member' : 'Update Team Member'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
