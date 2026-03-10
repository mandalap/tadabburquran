'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

// Eye Icon Component
const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

// Eye Off Icon Component
const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!token) {
      toast.error('Token tidak valid', {
        description: 'Silakan request reset password baru dari halaman lupa password'
      })
      return
    }

    if (password.length < 6) {
      toast.error('Password terlalu pendek', {
        description: 'Password minimal harus 6 karakter'
      })
      return
    }

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok', {
        description: 'Pastikan password dan konfirmasi password sama'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error('Gagal reset password', {
          description: data.error || 'Token mungkin sudah kedaluwarsa. Silakan request ulang.'
        })
      } else {
        setIsSuccess(true)
        toast.success('Password berhasil diubah!', {
          description: 'Anda akan diarahkan ke halaman login...',
          duration: 3000,
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        })

        // Clear form
        setPassword('')
        setConfirmPassword('')

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (err) {
      toast.error('Terjadi kesalahan', {
        description: 'Silakan coba lagi atau hubungi support'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-white border-amber-100 shadow-xl shadow-amber-900/5 overflow-hidden">
              {/* Premium Header Bar */}
              <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600"></div>
              <CardHeader className="text-center pb-6 pt-8">
                {isSuccess ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <CardTitle className="text-gray-900 text-3xl font-bold tracking-tight">Password Berhasil Diubah!</CardTitle>
                    <p className="text-gray-500 text-sm mt-3">
                      Mengalihkan ke halaman login...
                    </p>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-gray-900 text-3xl font-bold tracking-tight">Reset Password</CardTitle>
                    <p className="text-gray-500 text-sm mt-3">
                      Buat password baru untuk akun Anda
                    </p>
                  </>
                )}
              </CardHeader>
              {!isSuccess && (
                <CardContent className="space-y-5 px-8 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="password" className="text-gray-900 font-medium">Password Baru</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="bg-gray-50/50 border-gray-200 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 mt-2 h-11 pr-10"
                          required
                          minLength={6}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">Konfirmasi Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password baru"
                          className="bg-gray-50/50 border-gray-200 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 mt-2 h-11 pr-10"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
                          disabled={loading}
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-lg shadow-amber-900/20 transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Memproses...
                        </span>
                      ) : 'Reset Password'}
                    </Button>
                  </form>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-2 border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/50 transition-all duration-300"
                    onClick={() => router.push('/auth/login')}
                    disabled={loading}
                  >
                    Kembali ke Login
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

// Default export with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="text-gray-500">Memuat...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
