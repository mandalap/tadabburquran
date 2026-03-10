'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, CreditCard, Wallet, Building, ShoppingBag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { toast } from 'sonner'

function CheckoutContent() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug

  const [course, setCourse] = useState(null)
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [snapLoaded, setSnapLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState({ userId: null, userName: '', userEmail: '' })
  const [loginRequired, setLoginRequired] = useState(false)
  const snapScriptRef = useRef(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          const user = data.user
          if (user?.id) {
            setUserData({
              userId: user.id,
              userName: user.full_name || user.name || '',
              userEmail: user.email || ''
            })
            setLoginRequired(user.role !== 'user')
          } else {
            setLoginRequired(true)
          }
        }
      } catch (error) {
        setUserData({ userId: null, userName: '', userEmail: '' })
        setLoginRequired(true)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (slug) {
      fetchCourse()
    }
  }, [slug])

  // Load Midtrans Snap script
  useEffect(() => {
    if (step === 2 && !snapLoaded) {
      loadSnapScript()
    }
  }, [step, snapLoaded])

  const loadSnapScript = () => {
    if (document.getElementById('midtrans-snap-script')) {
      setSnapLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'midtrans-snap-script'
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-DEMO_CLIENT_KEY')
    script.onload = () => setSnapLoaded(true)
    script.onerror = () => console.error('Failed to load Midtrans Snap')
    document.body.appendChild(script)

    snapScriptRef.current = script
  }

  const fetchCourse = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/by-slug/${slug}`)

      if (!response.ok) {
        setNotFound(true)
        return
      }

      const data = await response.json()
      setCourse(data.course)

      // Check if course is free
      if (data.course.price === 0 || !data.course.price) {
        setPaymentMethod('free')
      } else {
        setPaymentMethod('qris') // Default to QRIS
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setError(null)

    if (!userData.userId) {
      setLoginRequired(true)
      router.push(`/auth/login?redirect=${encodeURIComponent(`/checkout/course/${slug}`)}`)
      return
    }

    if (course.price === 0 || !course.price) {
      // Free course - redirect directly to dashboard
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      return
    }

    setProcessing(true)

    try {
      // Create transaction and get Snap token
      const response = await fetch('/api/checkout/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: slug,
          courseId: course.id,
          userId: userData.userId,
          userName: userData.userName,
          userEmail: userData.userEmail,
        }),
      })

      let data = {}
      try {
        data = await response.json()
      } catch (parseError) {
        data = {}
      }

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          toast.warning('Silakan login terlebih dahulu untuk membeli kelas')
          setLoginRequired(true)
          router.push(`/auth/login?redirect=${encodeURIComponent(`/checkout/course/${slug}`)}`)
          return
        }
        if (response.status === 403) {
          toast.error('Akun Anda belum berstatus member')
          setError('Akun Anda belum berstatus member')
          setProcessing(false)
          return
        }
        if (response.status === 409 && data?.code === 'ALREADY_ENROLLED') {
          toast.info('Anda sudah terdaftar di kelas ini. Buka Dashboard untuk belajar.')
          setError('Anda sudah terdaftar di kelas ini. Silakan buka Dashboard.')
          setProcessing(false)
          return
        }
        if (response.status === 409 && data?.code === 'PENDING_EXISTS') {
          toast.warning('Masih ada transaksi menunggu pembayaran untuk kelas ini')
          setError('Masih ada transaksi yang menunggu pembayaran untuk kelas ini.')
          setProcessing(false)
          return
        }
        const errorMsg = data.details || data.error || data.message || 'Failed to create transaction'
        console.error('Transaction error:', errorMsg, data)
        toast.error(errorMsg)
        setError(errorMsg)
        setProcessing(false)
        return
      }

      if (typeof window !== 'undefined' && data.order_id) {
        const existing = JSON.parse(window.localStorage.getItem('orderCourseMap') || '{}')
        existing[data.order_id] = course.id
        window.localStorage.setItem('orderCourseMap', JSON.stringify(existing))
      }

      toast.success('Transaksi dibuat. Silakan selesaikan pembayaran.')
      // Open Midtrans Snap popup
      window.snap.pay(data.token, {
        onSuccess: function (result) {
          console.log('Payment success:', result)
          toast.success('Pembayaran berhasil. Menyimpan akses kelas...')
          router.push(`/checkout/finish?orderId=${data.order_id}`)
        },
        onPending: function (result) {
          console.log('Payment pending:', result)
          toast.info('Pembayaran menunggu. Anda dapat melanjutkan nanti.')
          router.push(`/checkout/pending?orderId=${data.order_id}`)
        },
        onError: function (result) {
          console.log('Payment error:', result)
          toast.error('Pembayaran gagal. Silakan coba lagi.')
          router.push(`/checkout/error?orderId=${data.order_id}`)
        },
        onClose: function () {
          setProcessing(false)
          toast.info('Anda menutup pembayaran sebelum selesai')
          console.log('Customer closed the popup without finishing the payment')
        },
      })
    } catch (error) {
      console.error('Payment error:', error)
      setProcessing(false)
      setError('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.')
    }
  }

  const formatPrice = (price) => {
    if (!price) return 'Gratis'
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  // Skeleton component
  const Skeleton = ({ className }) => (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            {/* Header Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-10 w-32 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>

            {/* Progress Steps Skeleton */}
            <div className="mb-8">
              <div className="flex gap-2 mb-4">
                <Skeleton className="flex-1 h-2 rounded-full" />
                <Skeleton className="flex-1 h-2 rounded-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-8 rounded-full" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-8 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-2">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-40 mb-6" />

                      {/* Course Item Skeleton */}
                      <div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                        <Skeleton className="w-24 h-20 rounded-lg flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                      </div>

                      {/* Price Details Skeleton */}
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-28" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-7 w-28" />
                          </div>
                        </div>
                      </div>

                      {/* Button Skeleton */}
                      <Skeleton className="h-14 w-full rounded-xl" />
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Card Skeleton */}
                <div className="lg:col-span-1">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <Skeleton className="h-5 w-36 mb-4" />

                      <div className="p-4 bg-gray-50 rounded-xl mb-4">
                        <div className="flex gap-3">
                          <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Pendaftaran Berhasil!</h1>
                  <p className="text-gray-700 mb-2">Selamat bergabung!</p>
                  <p className="text-gold font-semibold mb-8">{course.title}</p>
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

  const isFree = course.price === 0 || !course.price

  if (loginRequired) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Login diperlukan</h1>
              <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk membeli kelas.</p>
              <Button
                onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(`/checkout/course/${slug}`)}`)}
                className="bg-gold hover:bg-gold-dark text-black"
              >
                Login Sekarang
              </Button>
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
                          <span className="font-semibold">{formatPrice(course.price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Biaya Layanan</span>
                          <span className="font-semibold text-green-600">Gratis</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-gold">
                              {formatPrice(course.price)}
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {isFree ? 'Konfirmasi Pendaftaran' : 'Pilih Metode Pembayaran'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        {isFree
                          ? 'Kelas ini gratis. Silakan konfirmasi pendaftaran Anda.'
                          : 'Pilih metode pembayaran yang Anda inginkan.'}
                      </p>

                      {/* Error Alert */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                          <p className="text-sm text-red-800">
                            <strong>Error:</strong> {error}
                          </p>
                        </div>
                      )}

                      {!isFree && (
                        <>
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-800">
                              <strong>Info:</strong> Anda akan diarahkan ke halaman pembayaran Midtrans yang aman.
                              Berbagai metode pembayaran tersedia (QRIS, Virtual Account, Kartu Kredit, E-Wallet).
                            </p>
                          </div>

                          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                              <RadioGroupItem value="qris" id="qris" className="text-gold" />
                              <Label htmlFor="qris" className="flex items-center cursor-pointer flex-1">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                                  <Wallet className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">QRIS (Quick Scan)</div>
                                  <div className="text-sm text-gray-500">GoPay, OVO, Dana, LinkAja, dan lainnya</div>
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
                                  <div className="font-medium text-gray-900">Virtual Account</div>
                                  <div className="text-sm text-gray-500">BCA, Mandiri, BNI, BRI, Permata</div>
                                </div>
                              </Label>
                            </div>

                            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                              <RadioGroupItem value="credit-card" id="credit-card" className="text-gold" />
                              <Label htmlFor="credit-card" className="flex items-center cursor-pointer flex-1">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                                  <CreditCard className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Kartu Kredit/Debit</div>
                                  <div className="text-sm text-gray-500">Visa, Mastercard, JCB</div>
                                </div>
                              </Label>
                            </div>

                            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                              <RadioGroupItem value="shopee" id="shopee" className="text-gold" />
                              <Label htmlFor="shopee" className="flex items-center cursor-pointer flex-1">
                                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mr-3">
                                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">ShopeePay</div>
                                  <div className="text-sm text-gray-500">ShopeePay</div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </>
                      )}

                      <div className="mt-6 space-y-3">
                        <Button
                          className="w-full bg-gold hover:bg-gold-dark text-black font-semibold py-6"
                          onClick={handlePayment}
                          disabled={processing || !paymentMethod}
                        >
                          {processing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Memproses...
                            </>
                          ) : isFree ? (
                            'Daftar Sekarang (Gratis)'
                          ) : (
                            'Bayar Sekarang'
                          )}
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

                      {!isFree && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700">
                              Transaksi Anda aman dan terenkripsi. Pembayaran diproses oleh Midtrans.
                            </p>
                          </div>
                        </div>
                      )}
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
                        <span>{formatPrice(course.price)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 text-sm">
                        <span>Biaya Admin</span>
                        <span className="text-green-600">Rp 0</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-gold">
                            {formatPrice(course.price)}
                          </span>
                        </div>
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
