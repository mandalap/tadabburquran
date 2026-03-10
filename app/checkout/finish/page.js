'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Home, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { toast } from 'sonner'

function CheckoutFinishContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const courseSlug = searchParams.get('slug') || searchParams.get('courseSlug')
  const courseId = searchParams.get('courseId')
  const [resolvedCourseId, setResolvedCourseId] = useState(courseId)
  const [loading, setLoading] = useState(true)
  const [enrollmentSaved, setEnrollmentSaved] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setUserInfo(data.user || null)
        }
      } catch (error) {
        setUserInfo(null)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (courseId) {
      setResolvedCourseId(courseId)
      return
    }
    if (typeof window !== 'undefined' && orderId) {
      try {
        const mapping = JSON.parse(window.localStorage.getItem('orderCourseMap') || '{}')
        if (mapping[orderId]) {
          setResolvedCourseId(mapping[orderId])
        }
      } catch (error) {
        setResolvedCourseId(null)
      }
    }
  }, [courseId, orderId])

  useEffect(() => {
    const saveEnrollment = async () => {
      try {
        // Save enrollment to database
        const response = await fetch('/api/checkout/save-enrollment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            slug: courseSlug,
            courseId: resolvedCourseId,
            userId: userInfo?.id,
            email: userInfo?.email,
          }),
        })

        const data = await response.json()
        if (data.success) {
          console.log('Enrollment saved:', data)
          setEnrollmentSaved(true)
          toast.success('Kelas berhasil ditambahkan ke Dashboard')
        } else {
          toast.error(data.error || 'Gagal menyimpan akses kelas')
        }
      } catch (error) {
        console.error('Error saving enrollment:', error)
        toast.error('Gagal menyimpan akses kelas')
      } finally {
        setLoading(false)
      }
    }

    if ((orderId || courseSlug || resolvedCourseId) && userInfo?.id) {
      saveEnrollment()
    } else {
      setLoading(false)
    }
  }, [orderId, courseSlug, resolvedCourseId, userInfo?.id, userInfo?.email])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-12 text-center">
                {loading ? (
                  <>
                    <div className="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Memproses Pembayaran...</h1>
                    <p className="text-gray-600">Mohon tunggu sebentar</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Pembayaran Berhasil!</h1>
                    <p className="text-gray-700 mb-2">Terima kasih atas pembelian Anda</p>
                    {orderId && (
                      <p className="text-sm text-gray-500 mb-8">Order ID: {orderId}</p>
                    )}

                    {enrollmentSaved && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                        <div className="flex items-start justify-center">
                          <div className="text-left">
                            <p className="font-semibold text-green-800 mb-2">Kelas telah ditambahkan!</p>
                            <p className="text-sm text-green-700">
                              Kelas telah ditambahkan ke dashboard Anda. Anda dapat langsung memulai pembelajaran.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => router.push('/dashboard')}
                        className="bg-gold hover:bg-gold-dark text-black font-semibold"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Ke Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/explore')}
                        className="border-gray-300 text-gray-700"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Ke Beranda
                      </Button>
                    </div>
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

export default function CheckoutFinishPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckoutFinishContent />
    </Suspense>
  )
}
