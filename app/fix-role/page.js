'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function FixRolePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-gray-600">Silakan login terlebih dahulu</p>
          <Button onClick={() => router.push('/auth/login')} className="mt-4 w-full">
            Login
          </Button>
        </Card>
      </div>
    )
  }

  const fixRole = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user' })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
        // Redirect to clear session and re-login
        setTimeout(() => {
          router.push('/api/auth/signout?callbackUrl=/auth/login')
        }, 2000)
      } else {
        setResult({ success: false, message: data.error || 'Gagal mengupdate role' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Fix Role User
          </h1>

          {session?.user && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Email:</p>
              <p className="font-medium text-gray-900 mb-3">{session.user.email}</p>
              <p className="text-sm text-gray-600 mb-1">Role saat ini:</p>
              <p className="font-medium text-gold">{session.user.role || 'Tidak diketahui'}</p>
            </div>
          )}

          {result === null ? (
            <>
              <p className="text-gray-700 mb-6 text-center">
                Halaman ini untuk mengubah role Anda dari 'admin' ke 'user' agar diarahkan ke dashboard user yang benar.
              </p>
              <Button
                onClick={fixRole}
                disabled={loading}
                className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Ubah Role Saya Menjadi User'
                )}
              </Button>
            </>
          ) : result.success ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">Berhasil!</h3>
              <p className="text-gray-700">{result.message}</p>
              <p className="text-sm text-gray-500 mt-4">Anda akan diarahkan ke login...</p>
            </div>
          ) : (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">Gagal</h3>
              <p className="text-gray-700">{result.message}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="w-full text-gray-600"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
