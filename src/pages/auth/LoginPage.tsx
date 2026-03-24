import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { initRecaptchaVerifier, sendOTP } from '@/lib/dataProvider'
import { USE_MOCK_DATA } from '@/lib/config'
import { useAuth } from '@/contexts/AuthContext'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const confirmationResultRef = useRef<any>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('👤 LoginPage: User already logged in, redirecting to dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const recaptchaVerifier = initRecaptchaVerifier('recaptcha-container')
      const confirmationResult = await sendOTP(phoneNumber, recaptchaVerifier as any)

      confirmationResultRef.current = confirmationResult
      setStep('otp')

      // Show helpful message in mock mode
      if (USE_MOCK_DATA) {
        console.log('📱 Mock Mode: Use OTP code "123456" to login')
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!confirmationResultRef.current) {
        throw new Error('No confirmation result found')
      }

      console.log('📱 Verifying OTP...')
      const result = await confirmationResultRef.current.confirm(otp)
      console.log('✅ Login successful:', result.user)

      // Don't navigate - let the useEffect handle it when user state updates
      console.log('⏳ Waiting for auth state to update...')
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.')
      console.error(err)
      setLoading(false)
    }
    // Keep loading true until redirect happens
  }

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-500/20">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Farm ERP</h1>
          <p className="text-gray-600">Modern farm management system</p>
        </div>

        <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              {step === 'phone'
                ? 'Enter your phone number to receive a verification code'
                : 'Enter the verification code sent to your phone'}
            </CardDescription>
            {USE_MOCK_DATA && (
              <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🧪</span>
                  <div>
                    <p className="font-semibold text-green-900 text-sm">Development Mode</p>
                    <p className="mt-1 text-sm text-green-700">
                      Use any phone number and code: <span className="font-mono font-bold">123456</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="pb-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg shadow-green-500/30 transition-all"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : 'Send Verification Code'}
              </Button>
              <div id="recaptcha-container"></div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="h-11 text-center text-2xl tracking-widest font-mono border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg shadow-green-500/30 transition-all"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Verify & Sign In'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-gray-300 hover:bg-gray-50"
                  onClick={() => setStep('phone')}
                  disabled={loading}
                >
                  Back to Phone Number
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
