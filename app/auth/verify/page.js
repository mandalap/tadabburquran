'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token || '')}`)
        const data = await res.json()
        if (res.ok && data.success) {
          setSuccess(true)
          setMessage('Email berhasil diverifikasi. Silakan login.')
        } else {
          setSuccess(false)
          setMessage(data.error || 'Token tidak valid atau kadaluarsa')
        }
      } catch (e) {
        setSuccess(false)
        setMessage('Terjadi kesalahan saat verifikasi')
      } finally {
        setLoading(false)
      }
    }
    if (token) verify()
    else {
      setSuccess(false)
      setMessage('Token tidak ditemukan')
      setLoading(false)
    }
  }, [token])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-8 text-center">
                {loading ? (
                  <div className="text-gray-600">Memverifikasi...</div>
                ) : success ? (
                  <>
                    <div className="text-4xl mb-3">✅</div>
                    <div className="font-semibold text-gray-900 mb-2">{message}</div>
                    <Button className="bg-gold hover:bg-gold-dark text-black mt-2" onClick={() => router.push('/auth/login')}>
                      Ke Halaman Login
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-3">⚠️</div>
                    <div className="font-semibold text-gray-900 mb-2">{message}</div>
                    <Button variant="outline" onClick={() => router.push('/auth/register')}>
                      Daftar Ulang
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
