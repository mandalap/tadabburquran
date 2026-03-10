'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function CheckoutErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [orderId])

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
                    <div className="w-20 h-20 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Memeriksa status...</h1>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Pembayaran Gagal</h1>
                    <p className="text-gray-700 mb-2">
                      Maaf, pembayaran Anda tidak dapat diproses
                    </p>
                    {orderId && (
                      <p className="text-sm text-gray-500 mb-8">Order ID: {orderId}</p>
                    )}

                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                      <div className="text-left">
                        <p className="font-semibold text-red-800 mb-2">Kemungkinan penyebab:</p>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Pembayaran dibatalkan atau kedaluwarsa</li>
                          <li>• Saldo atau limit kartu kredit tidak mencukupi</li>
                          <li>• Ada kesalahan pada proses pembayaran</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => router.back()}
                        className="bg-gold hover:bg-gold-dark text-black font-semibold"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Coba Lagi
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

export default function CheckoutErrorPage() {
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
      <CheckoutErrorContent />
    </Suspense>
  )
}
