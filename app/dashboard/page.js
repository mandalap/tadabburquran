'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { User, ShoppingBag, BookOpen, Settings, LogOut, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user) {
      // Check if user is admin, redirect to admin dashboard
      if (session.user.role === 'admin') {
        router.push('/admin')
        return
      }
      fetchUserData()
    }
  }, [status, session, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(user.id)
    }
  }, [user?.id])

  const fetchDashboardData = async (userId) => {
    try {
      const response = await fetch(userId ? `/api/dashboard?user_id=${userId}` : '/api/dashboard')
      const data = await response.json()
      if (data.enrolledCourses) {
        setEnrolledCourses(data.enrolledCourses)
      }
      if (data.purchaseHistory) {
        setPurchaseHistory(data.purchaseHistory)
      }
      try {
        const resCourses = await fetch('/api/courses')
        const cData = await resCourses.json()
        if (cData.courses) {
          const enrolledIds = new Set((data.enrolledCourses || []).map(c => c.id))
          const categories = new Set((data.enrolledCourses || []).map(c => (c.category || '').toLowerCase()).filter(Boolean))
          const candidates = cData.courses.filter(c => !enrolledIds.has(c.id))
          const prioritized = [
            ...candidates.filter(c => categories.has((c.category || '').toLowerCase())),
            ...candidates.filter(c => !categories.has((c.category || '').toLowerCase()))
          ]
          setRecommended(prioritized.slice(0, 6))
        }
      } catch (e) {
        // ignore recommendations error
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  // Skeleton component
  const Skeleton = ({ className }) => (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Skeleton */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card Skeleton */}
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards Skeleton */}
                <div className="space-y-4">
                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="lg:col-span-3">
                {/* Tabs Skeleton */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                </div>

                {/* Courses Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <Skeleton className="aspect-[4/5] w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-2 w-full mt-2" />
                      </div>
                      <Skeleton className="h-10 mx-3 mb-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayName = user?.full_name || session?.user?.name || 'User'
  const displayEmail = user?.email || session?.user?.email || ''
  const displayAvatar = user?.avatar_url || session?.user?.image || ''

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-700">Kelola pembelajaran dan pembelian Anda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      {displayAvatar ? (
                        <AvatarImage src={displayAvatar} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="bg-gold text-black text-3xl font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h3>
                    <p className="text-sm text-gray-700">{displayEmail}</p>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full justify-start bg-gold/10 text-gold hover:bg-gold/20 font-semibold" onClick={() => router.push('/kelas-saya')}>
                      <BookOpen className="mr-3 w-5 h-5" />
                      Kelas Saya
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gold hover:bg-gold/10" onClick={() => router.push('/riwayat-pembelian')}>
                      <CreditCard className="mr-3 w-5 h-5" />
                      Riwayat Pembelian
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="mt-6 space-y-4">
                <Card className="bg-gradient-to-br from-gold/20 to-gold-dark/20 border-gold/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">Kelas Aktif</p>
                        <p className="text-2xl font-bold text-gold">{enrolledCourses.length}</p>
                      </div>
                      <BookOpen className="w-10 h-10 text-gold opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-gold/20 to-gold-dark/20 border-gold/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">Total Pembelian</p>
                        <p className="text-2xl font-bold text-gold">{purchaseHistory.length}</p>
                      </div>
                      <ShoppingBag className="w-10 h-10 text-gold opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/30 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Selamat datang</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{displayName}</h2>
                    <p className="text-gray-600 mt-1">Lanjutkan pembelajaran Anda</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => router.push('/kelas-saya')} className="bg-gold hover:bg-gold-dark text-black">Kelas Saya</Button>
                    <Button variant="outline" onClick={() => router.push('/riwayat-pembelian')} className="border-gold text-gold">Riwayat</Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Lanjutkan Belajar</h3>
                    <Button variant="link" onClick={() => router.push('/kelas-saya')} className="text-gold">Lihat semua</Button>
                  </div>
                  {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {enrolledCourses
                        .slice()
                        .sort((a, b) => (a.completed_at ? 1 : 0) - (b.completed_at ? 1 : 0) || (b.progress || 0) - (a.progress || 0))
                        .slice(0, 8)
                        .map((course) => (
                          <div key={course.id} className="group">
                            <div
                              onClick={() => router.push(`/kelas/course-playing/${course.slug || course.id}`)}
                              className="bg-white border border-gray-200 hover:border-gold/50 transition-all duration-300 cursor-pointer overflow-hidden rounded-xl"
                            >
                              <div className="relative aspect-[4/5] bg-gradient-to-br from-gold/10 to-gold-dark/10 overflow-hidden">
                                {course.cover ? (
                                  <img src={course.cover} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-6xl opacity-20">📚</span>
                                  </div>
                                )}
                                {course.category && (
                                  <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-gold text-black rounded-full">
                                    {course.category}
                                  </span>
                                )}
                                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${course.completed_at ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                                  {course.completed_at ? 'Selesai' : `${course.progress || 0}%`}
                                </span>
                              </div>
                              <div className="p-3 md:p-4">
                                <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 line-clamp-1 group-hover:text-gold transition">
                                  {course.title}
                                </h3>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                  <div className={`${course.completed_at ? 'bg-green-500' : 'bg-gold'} h-2 rounded-full transition-all`} style={{ width: `${course.completed_at ? 100 : (course.progress || 0)}%` }}></div>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => router.push(`/kelas/course-playing/${course.slug || course.id}`)}
                              className="w-full bg-gold hover:bg-gold-dark text-black font-semibold py-2 mt-2 rounded-lg text-sm"
                              size="sm"
                            >
                              {course.completed_at ? 'Tonton Ulang' : course.progress > 0 ? 'Lanjut Belajar' : 'Mulai Belajar'}
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <Card className="bg-white border-gray-200">
                      <CardContent className="p-8 text-center">
                        <BookOpen className="w-12 h-12 text-gold mx-auto mb-4 opacity-50" />
                        <div className="mb-4 font-semibold text-gray-900">Belum ada kelas</div>
                        <Button onClick={() => router.push('/explore')} className="bg-gold hover:bg-gold-dark text-black">Jelajahi Kelas</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Rekomendasi untuk Anda</h3>
                    <Button variant="link" onClick={() => router.push('/explore')} className="text-gold">Jelajahi</Button>
                  </div>
                  {recommended.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {recommended.map(course => {
                        const isFree = !course.price || course.price === 0
                        return (
                          <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow transition">
                            <div className="relative h-36 bg-gray-100">
                              {course.cover ? (
                                <img src={course.cover} alt={course.title} className="w-full h-full object-cover" />
                              ) : null}
                              <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-white/90 border border-gray-200">
                                {course.category || 'Kelas'}
                              </span>
                            </div>
                            <div className="p-4">
                              <div className="font-semibold text-gray-900 line-clamp-1 mb-1">{course.title}</div>
                              <div className="text-sm text-gray-600 line-clamp-2 mb-3">{course.short_description || '—'}</div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-gold">
                                  {isFree ? 'Gratis' : `Rp ${course.price.toLocaleString('id-ID')}`}
                                </div>
                                <Button
                                  onClick={() => router.push(`/checkout/course/${course.slug || course.id}`)}
                                  className="bg-gold hover:bg-gold-dark text-black"
                                  size="sm"
                                >
                                  {isFree ? 'Daftar' : 'Beli'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <Card className="bg-white border-gray-200">
                      <CardContent className="p-8 text-center text-gray-700">
                        Belum ada rekomendasi. Jelajahi kelas untuk mulai belajar.
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Terbaru</h3>
                    <Button variant="link" onClick={() => router.push('/riwayat-pembelian')} className="text-gold">Lihat semua</Button>
                  </div>
                  {purchaseHistory.length > 0 ? (
                    <div className="space-y-3">
                      {purchaseHistory.slice(0, 5).map((purchase) => (
                        <div key={purchase.id} className="border border-gray-200 rounded-xl p-4 bg-white flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{purchase.courseName}</div>
                            <div className="text-sm text-gray-600">{purchase.date} • {purchase.paymentMethod}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">Rp {purchase.price.toLocaleString('id-ID')}</div>
                            <div className={`text-xs font-medium ${purchase.paymentStatus === 'paid' ? 'text-green-600' : purchase.paymentStatus === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
                              {purchase.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-white border-gray-200">
                      <CardContent className="p-8 text-center">
                        <ShoppingBag className="w-12 h-12 text-gold mx-auto mb-4 opacity-50" />
                        <div className="mb-2 font-semibold text-gray-900">Belum ada pembelian</div>
                        <div className="text-gray-700">Riwayat pembelian Anda akan muncul di sini</div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
