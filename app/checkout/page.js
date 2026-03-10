'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, CreditCard, Wallet, Building, ShoppingBag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const courseSlug = searchParams.get('courseSlug') || searchParams.get('slug')

  const [course, setCourse] = useState(null)
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId || courseSlug) {
      fetchCourse()
    } else {
      setLoading(false)
      setNotFound(true)
    }
  }, [courseId, courseSlug])

  const fetchCourse = async () => {
    setLoading(true)
    try {
      const url = courseId
        ? `/api/courses/${courseId}`
        : `/api/courses/by-slug/${courseSlug}`

      const response = await fetch(url)

      if (!response.ok) {
        setNotFound(true)
        return
      }

      const data = await response.json()
      setCourse(data.course)
    } catch (error) {
      console.error('Error fetching course:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setProcessing(true)

    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)

      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat informasi kelas...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelas Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-6">Maaf, kelas yang Anda cari tidak tersedia atau telah dihapus.</p>
              <Button onClick={() => router.push('/explore')} className="bg-gold hover:bg-gold-dark text-black">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Explore
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Pembayaran Berhasil!</h1>
                  <p className="text-gray-700 mb-2">Terima kasih atas pembelian Anda</p>
                  <p className="text-gold font-semibold mb-8">{course.title}</p>
                  <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
                    <span>Mengalihkan ke dashboard</span>
                    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gold animate-pulse" style={{ animation: 'shrink 3s linear forwards' }}></div>
                    </div>
                  </div>
                  <Progress value={100} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gold mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Kembali
          </Button>

          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
              <p className="text-gray-600">Selesaikan pendaftaran kelas Anda</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex gap-2 mb-4">
                <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-gold' : 'bg-gray-200'}`}></div>
                <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-gold' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`flex items-center gap-2 ${step >= 1 ? 'text-gold font-semibold' : 'text-gray-500'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-gold text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
                  Detail Pesanan
                </span>
                <span className={`flex items-center gap-2 ${step >= 2 ? 'text-gold font-semibold' : 'text-gray-500'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-gold text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
                  Pembayaran
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {step === 1 && (
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Detail Kelas</h3>

                      <div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                        <div className="w-24 h-20 bg-gradient-to-br from-gold/30 to-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl">📚</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{course.instructor || 'Instruktur'}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">{course.category || 'Kelas'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-700">
                          <span>Harga Kelas</span>
                          <span className="font-semibold">Rp {course.price?.toLocaleString('id-ID') || 'Gratis'}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Biaya Layanan</span>
                          <span className="font-semibold text-green-600">Gratis</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-gold">
                              Rp {course.price?.toLocaleString('id-ID') || 'Gratis'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gold hover:bg-gold-dark text-black font-semibold py-6"
                        onClick={() => setStep(2)}
                      >
                        Lanjut ke Pembayaran
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {step === 2 && (
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Pilih Metode Pembayaran</h3>

                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                          <RadioGroupItem value="credit-card" id="credit-card" className="text-gold" />
                          <Label htmlFor="credit-card" className="flex items-center cursor-pointer flex-1">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Kartu Kredit/Debit</div>
                              <div className="text-sm text-gray-500">Visa, Mastercard</div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                          <RadioGroupItem value="bank-transfer" id="bank-transfer" className="text-gold" />
                          <Label htmlFor="bank-transfer" className="flex items-center cursor-pointer flex-1">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                              <Building className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Transfer Bank</div>
                              <div className="text-sm text-gray-500">BCA, Mandiri, BNI</div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                          <RadioGroupItem value="e-wallet" id="e-wallet" className="text-gold" />
                          <Label htmlFor="e-wallet" className="flex items-center cursor-pointer flex-1">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                              <Wallet className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">E-Wallet</div>
                              <div className="text-sm text-gray-500">GoPay, OVO, Dana</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="mt-6 space-y-3">
                        <Button
                          className="w-full bg-gold hover:bg-gold-dark text-black font-semibold py-6"
                          onClick={handlePayment}
                          disabled={processing}
                        >
                          {processing ? 'Memproses Pembayaran...' : 'Bayar Sekarang'}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:text-gold"
                          onClick={() => setStep(1)}
                          disabled={processing}
                        >
                          Kembali
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Summary Card */}
              <div className="lg:col-span-1">
                <Card className="bg-white border-gray-200 shadow-sm sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>

                    <div className="p-4 bg-gray-50 rounded-xl mb-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-gold/30 to-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">📚</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{course.title}</h4>
                          <p className="text-xs text-gray-500">{course.instructor || 'Instruktur'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-gray-600 text-sm">
                        <span>Subtotal</span>
                        <span>Rp {course.price?.toLocaleString('id-ID') || '0'}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 text-sm">
                        <span>Biaya Admin</span>
                        <span className="text-green-600">Rp 0</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-gold">
                            Rp {course.price?.toLocaleString('id-ID') || '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          Transaksi Anda aman dan terenkripsi
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  )
}
