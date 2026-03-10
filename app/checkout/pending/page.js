'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Clock, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function CheckoutPendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Pembayaran Pending</h1>
                <p className="text-gray-700 mb-2">
                  Pembayaran Anda sedang diproses
                </p>
                {orderId && (
                  <p className="text-sm text-gray-500 mb-8">Order ID: {orderId}</p>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                  <div className="text-left">
                    <p className="font-semibold text-yellow-800 mb-2">Informasi:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Beberapa metode pembayaran memerlukan waktu konfirmasi</li>
                      <li>• Cek email Anda untuk instruksi pembayaran lanjutan</li>
                      <li>• Halaman ini akan diperbarui setelah pembayaran dikonfirmasi</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Cek Status
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function CheckoutPendingPage() {
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
      <CheckoutPendingContent />
    </Suspense>
  )
}
