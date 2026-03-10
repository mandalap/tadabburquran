'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
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

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect') || null

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Terjadi kesalahan saat mendaftar')
      } else {
        setSuccess(true)
        // After successful registration, redirect to login with the redirect param
        setTimeout(() => {
          if (redirectUrl) {
            router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}&registered=true`)
          } else {
            router.push('/auth/login?registered=true')
          }
        }, 2000)
      }
      setLoading(false)
    } catch (err) {
      setError('Terjadi kesalahan saat mendaftar')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      // Use redirect URL for Google sign-in
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

  // Build login URL with redirect param
  const loginUrl = redirectUrl
    ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
    : '/auth/login'

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
                <CardTitle className="text-gray-900 text-3xl font-bold tracking-tight">Daftar</CardTitle>
                <p className="text-gray-500 text-sm mt-3">
                  Buat akun untuk mengakses kursus dan fitur lengkap
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
                    {googleLoading ? 'Memproses...' : 'Daftar dengan Google'}
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

                {/* Registration Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-900 font-medium">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-gray-50/50 border-gray-200 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 mt-2 h-11"
                      required
                    />
                  </div>
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
                        placeholder="Minimal 6 karakter"
                        className="bg-gray-50/50 border-gray-200 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 mt-2 h-11 pr-10"
                        required
                        minLength={6}
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
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">Konfirmasi Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className="bg-gray-50/50 border-gray-200 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 mt-2 h-11 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      Saya setuju dengan{' '}
                      <a href="#" className="text-amber-700 hover:text-amber-600 font-medium transition-colors">
                        Syarat & Ketentuan
                      </a>{' '}
                      dan{' '}
                      <a href="#" className="text-amber-700 hover:text-amber-600 font-medium transition-colors">
                        Kebijakan Privasi
                      </a>
                    </label>
                  </div>

                  {success && (
                    <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-200">
                      Berhasil daftar! Mengalihkan ke halaman login...
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-lg shadow-amber-900/20 transition-all duration-300"
                    disabled={loading || success}
                  >
                    {loading ? 'Memproses...' : success ? 'Berhasil!' : 'Daftar'}
                  </Button>
                </form>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-600">
                  Sudah punya akun?{' '}
                  <a href={loginUrl} className="text-amber-700 hover:text-amber-600 font-semibold transition-colors">
                    Masuk
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
