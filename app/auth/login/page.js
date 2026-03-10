'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

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
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.9 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect') || null
  const justRegistered = searchParams.get('registered') === 'true'

  // Redirect based on role or redirect URL when session is available
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (redirectUrl) {
        // Use the redirect URL from query params
        router.push(redirectUrl)
      } else if (session.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [status, session, router, redirectUrl])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('Email belum terverifikasi')) {
          setError('Email belum terverifikasi. Silakan cek inbox untuk verifikasi.')
        } else {
          setError('Email atau password salah')
        }
        setLoading(false)
      } else {
        // Wait for session to be updated, then useEffect will handle redirect
        setTimeout(() => {
          router.refresh()
        }, 500)
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      // Use callbackUrl for Google sign-in
      const callbackUrl = redirectUrl || '/dashboard'
      const result = await signIn('google', {
        callbackUrl,
        redirect: true,
      })

      if (result?.error) {
        setError('Login dengan Google gagal. Silakan coba lagi.')
        setGoogleLoading(false)
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login dengan Google')
      setGoogleLoading(false)
    }
  }

  // Build register URL with redirect param
  const registerUrl = redirectUrl
    ? `/auth/register?redirect=${encodeURIComponent(redirectUrl)}`
    : '/auth/register'

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
                <CardTitle className="text-gray-900 text-3xl font-bold tracking-tight">Masuk</CardTitle>
                <p className="text-gray-500 text-sm mt-3">
                  Masuk untuk mengakses kursus dan fitur lengkap
                </p>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8">
                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Image
                    src="/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                  <span className="text-gray-700 font-medium group-hover:text-gray-900">
                    {googleLoading ? 'Memproses...' : 'Lanjutkan dengan Google'}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400">atau</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-gray-900 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="bg-gray-50/50 border-gray-200 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 mt-2 h-11"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-gray-900 font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-gray-50/50 border-gray-200 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 mt-2 h-11 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => router.push('/auth/forgot')}
                      className="text-sm text-amber-700 hover:text-amber-600 font-medium transition-colors"
                    >
                      Lupa password?
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200">
                      {error}
                    </div>
                  )}

                  {justRegistered && !error && (
                    <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-200">
                      Berhasil mendaftar! Silakan login dengan email dan password Anda.
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-lg shadow-amber-900/20 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : 'Masuk'}
                  </Button>
                </form>

                {/* Register Link */}
                <p className="text-center text-sm text-gray-600">
                  Belum punya akun?{' '}
                  <a href={registerUrl} className="text-amber-700 hover:text-amber-600 font-semibold transition-colors">
                    Daftar sekarang
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
