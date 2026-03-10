'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MailCheck, Clock, Mail, ArrowRight, Sparkles } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const startCountdown = () => {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Email tidak valid', {
        description: 'Masukkan alamat email yang valid'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()

      if (response.ok || data.success) {
        setIsSuccess(true)
        startCountdown()
        toast.success('Email reset password terkirim!', {
          description: `Link reset telah dikirim ke ${email}`,
          duration: 5000,
          icon: <MailCheck className="w-5 h-5 text-green-500" />
        })
      } else {
        toast.error('Gagal mengirim email', {
          description: data.error || 'Silakan coba lagi'
        })
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
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative inline-flex">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full blur-xl opacity-50 animate-pulse"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-50 rounded-full flex items-center justify-center border-4 border-amber-200">
                        <MailCheck className="w-12 h-12 text-amber-600" />
                      </div>
                    </div>
                    <CardTitle className="text-gray-900 text-3xl font-bold tracking-tight">Email Terkirim!</CardTitle>
                    <p className="text-gray-500 text-sm mt-2">
                      Link reset password telah dikirim ke
                    </p>
                    <p className="text-amber-700 font-semibold text-base">
                      {email}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-amber-200">
                      <Mail className="w-8 h-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-gray-900 text-3xl font-bold tracking-tight">Lupa Password</CardTitle>
                    <p className="text-gray-500 text-sm mt-3">
                      Masukkan email Anda untuk menerima tautan reset password
                    </p>
                  </>
                )}
              </CardHeader>
              <CardContent className="space-y-5 px-8 pb-8">
                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="email" className="text-gray-900 font-medium">Email Address</Label>
                      <div className="relative mt-2">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="bg-gray-50/50 border-gray-200 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 h-11 pl-11"
                          required
                          disabled={loading}
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-lg shadow-amber-900/20 transition-all duration-300 group"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Mengirim Email...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Kirim Link Reset
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Success Cards */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MailCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-green-800">Email Terkirim</p>
                          <p className="text-xs text-green-700">Cek inbox email Anda sekarang</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                        <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-amber-800">Link berlaku 1 jam</p>
                          <p className="text-xs text-amber-700">Segera reset password Anda</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-blue-800">Tidak menemukan?</p>
                          <p className="text-xs text-blue-700">Cek folder spam/promotions</p>
                        </div>
                      </div>
                    </div>

                    {/* Resend Button with Countdown */}
                    <div className="pt-2">
                      {countdown > 0 ? (
                        <Button
                          variant="outline"
                          className="w-full h-11 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                          disabled
                        >
                          Request Ulang ({countdown}s)
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300"
                          onClick={() => {
                            setIsSuccess(false)
                            setEmail('')
                          }}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Kirim Ulang Email
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Back to Login Button */}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 text-gray-600 hover:text-amber-700 hover:bg-amber-50/50 transition-all duration-300"
                  onClick={() => router.push('/auth/login')}
                >
                  Kembali ke Login
                </Button>
              </CardContent>
            </Card>

            {/* Help Text */}
            {!isSuccess && (
              <p className="text-center text-xs text-gray-500 mt-6">
                Butuh bantuan? Hubungi{' '}
                <a href="mailto:support@tadabburquran.id" className="text-amber-700 hover:underline font-medium">
                  support@tadabburquran.id
                </a>
              </p>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
