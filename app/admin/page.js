'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users, BookOpen, MessageSquare, ShoppingCart, MicVocal, DollarSign,
  TrendingUp, CheckCircle, AlertCircle, LogOut,
  Star as StarIcon, UserPlus, Folder, Tag
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('orders')
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    courses: 0, orders: 0, testimonials: 0, users: 0,
    creators: 0, revenue: 0, pendingTestimonials: 0, totalStudents: 0,
    recentOrders: [], recentUsers: [], pendingTestimonialsList: [], popularCourses: []
  })

  useEffect(() => {
    // Check if user is admin
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/auth/login')
    }
  }, [session, status, router])

  useEffect(() => {
    // Load stats
    const loadStats = async () => {
      try {
        setStatsLoading(true)
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats({
            courses: data.courses || 0,
            orders: data.orders || 0,
            testimonials: data.testimonials || 0,
            users: data.users || 0,
            creators: data.creators || 0,
            revenue: data.revenue || 0,
            pendingTestimonials: data.pendingTestimonials || 0,
            totalStudents: data.totalStudents || 0,
            recentOrders: data.recentOrders || [],
            recentUsers: data.recentUsers || [],
            pendingTestimonialsList: data.pendingTestimonialsList || [],
            popularCourses: data.popularCourses || []
          })
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    loadStats()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/auth/login' })
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/auth/login')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'pending': return 'Menunggu'
      case 'cancelled': return 'Batal'
      default: return status
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Memuat...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Akses ditolak. Halaman ini khusus admin.</p>
            <Button onClick={() => router.push('/auth/login')} className="mt-4">
              Kembali ke Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Admin Header */}
      <section className="bg-white border-b border-gray-200 pt-20 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Selamat datang kembali, {session?.user?.name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {session?.user?.email}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">

          {/* Stats Cards */}
          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Card key={idx} className="bg-white border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Skeleton className="h-3 w-24 mb-2" />
                        <Skeleton className="h-7 w-28" />
                      </div>
                      <Skeleton className="w-12 h-12 rounded-xl" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {/* Users */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total User</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.users.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Siswa</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalStudents.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creators */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Kreator Aktif</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.creators}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <MicVocal className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Kelas Aktif</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.courses}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Pesanan</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.orders}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Pendapatan</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Testimoni</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.testimonials}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending */}
            {stats.pendingTestimonials > 0 && (
              <Card className="bg-white border-yellow-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Menunggu Review</p>
                      <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.pendingTestimonials}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          )}

          {/* Manage Menu - Modern Design */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Kelola Konten</h2>
            </div>
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Card key={idx} className="border-gray-200">
                    <CardContent className="p-5">
                      <Skeleton className="w-12 h-12 rounded-xl mb-3" />
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Kelas */}
              <button
                onClick={() => router.push('/admin/courses')}
                className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.courses}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Kelas</h3>
                <p className="text-sm text-gray-500">Kelola semua kelas</p>
              </button>

              {/* Kreator */}
              <button
                onClick={() => router.push('/admin/creators')}
                className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-purple-200/50 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <MicVocal className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{stats.creators}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Kreator</h3>
                <p className="text-sm text-gray-500">Manage kreator</p>
              </button>

              {/* Kategori */}
              <button
                onClick={() => router.push('/admin/categories')}
                className="group bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border border-amber-200 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-amber-200/50 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">Kategori</h3>
                <p className="text-sm text-gray-500">Manage kategori</p>
              </button>

              {/* Jenis */}
              <button
                onClick={() => router.push('/admin/types')}
                className="group bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border border-indigo-200 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200/50 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">Jenis</h3>
                <p className="text-sm text-gray-500">Tipe kelas</p>
              </button>

              {/* Testimoni */}
              <button
                onClick={() => router.push('/admin/testimonials')}
                className="group bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border border-pink-200 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-1 relative"
              >
                {stats.pendingTestimonials > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    {stats.pendingTestimonials}
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-pink-600">{stats.testimonials}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Testimoni</h3>
                <p className="text-sm text-gray-500">Review & approve</p>
              </button>

              {/* Users */}
              <button
                onClick={() => router.push('/admin/users')}
                className="group bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border border-cyan-200 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-cyan-200/50 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-cyan-600">{stats.users}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Users</h3>
                <p className="text-sm text-gray-500">Manage users</p>
              </button>

              {/* Promo Popup */}
              <button
                onClick={() => router.push('/admin/promo')}
                className="group bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 border border-rose-200 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-rose-200/50 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold">%</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">Promo</h3>
                <p className="text-sm text-gray-500">Kelola popup promo</p>
              </button>

              {/* Pesanan */}
              <button
                onClick={() => router.push('/admin/orders')}
                className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-green-200/50 hover:-translate-y-1 col-span-2 md:col-span-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats.orders}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Pesanan</h3>
                <p className="text-sm text-gray-500">Transaksi & payment</p>
              </button>
              </div>
            )}
          </div>

          {/* Data Tables with Tabs */}
          <div className="mb-8">
            <Card className="bg-white border-gray-200">
                <CardHeader className="pb-0">
                  {/* Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'orders'
                          ? 'border-gold text-gold'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 inline mr-2" />
                      Pesanan
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'users'
                          ? 'border-gold text-gold'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      User Baru
                    </button>
                    <button
                      onClick={() => setActiveTab('testimonials')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                        activeTab === 'testimonials'
                          ? 'border-gold text-gold'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Testimoni Pending
                      {stats.pendingTestimonials > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {stats.pendingTestimonials}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'courses'
                          ? 'border-gold text-gold'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Kelas Populer
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {statsLoading ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">...</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">...</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">...</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">...</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 6 }).map((_, idx) => (
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <>
                  {/* Orders Table */}
                  {activeTab === 'orders' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Pesanan Terbaru</h3>
                        <Button
                          onClick={() => router.push('/admin/orders')}
                          variant="ghost"
                          size="sm"
                          className="text-gold hover:text-gold-dark"
                        >
                          Lihat Semua
                        </Button>
                      </div>
                      {stats.recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tanggal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.recentOrders.map(order => (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4 text-sm text-gray-900">#{order.id}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{order.user_name || 'Guest'}</td>
                                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                    {formatCurrency(order.total)}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                      {getStatusLabel(order.status)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>Belum ada pesanan</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Users Table */}
                  {activeTab === 'users' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Pendaftaran Terbaru</h3>
                        <Button
                          onClick={() => router.push('/admin/users')}
                          variant="ghost"
                          size="sm"
                          className="text-gold hover:text-gold-dark"
                        >
                          Kelola Users
                        </Button>
                      </div>
                      {stats.recentUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nama</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tanggal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.recentUsers.map(user => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{user.name || '-'}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{user.email}</td>
                                  <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {user.role || 'user'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>Belum ada user terdaftar</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Pending Testimonials Table */}
                  {activeTab === 'testimonials' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Menunggu Approval</h3>
                        <Button
                          onClick={() => router.push('/admin/testimonials')}
                          variant="ghost"
                          size="sm"
                          className="text-gold hover:text-gold-dark"
                        >
                          Review Semua
                        </Button>
                      </div>
                      {stats.pendingTestimonialsList.length > 0 ? (
                        <div className="space-y-4">
                          {stats.pendingTestimonialsList.map(t => (
                            <div key={t.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{t.name}</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        className={`w-4 h-4 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(t.created_at)}</span>
                              </div>
                              <p className="text-sm text-gray-700 line-clamp-2">"{t.message}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>Tidak ada testimoni menunggu approval</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Popular Courses Table */}
                  {activeTab === 'courses' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Kelas Terpopuler</h3>
                        <Button
                          onClick={() => router.push('/admin/courses')}
                          variant="ghost"
                          size="sm"
                          className="text-gold hover:text-gold-dark"
                        >
                          Kelola Kelas
                        </Button>
                      </div>
                      {stats.popularCourses.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Kelas</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Instruktur</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Kategori</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Siswa</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Harga</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.popularCourses.map(course => (
                                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{course.title}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{course.instructor || '-'}</td>
                                  <td className="py-3 px-4">
                                    <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full capitalize">
                                      {course.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                    {course.students_count?.toLocaleString('id-ID') || 0}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-900">
                                    {formatCurrency(course.price || 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>Belum ada kelas</p>
                        </div>
                      )}
                    </>
                  )}
                    </>
                  )}

                </CardContent>
              </Card>
            </div>

          {/* Pending Approvals */}
          {stats.pendingTestimonials > 0 && (
            <Card className="bg-yellow-50 border-yellow-200 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{stats.pendingTestimonials} Testimoni Menunggu Approval</h3>
                      <p className="text-gray-600 text-sm">Review dan setujui testimoni dari pengguna</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/admin/testimonials')}
                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Review Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Info Card */}
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Informasi Admin</h3>
                  <p className="text-gray-400 text-sm">Gunakan kredensial ini dengan aman</p>
                </div>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="ml-2 font-mono bg-gray-700 px-2 py-1 rounded">admin@tadabburquran.id</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Password:</span>
                    <span className="ml-2 font-mono bg-gray-700 px-2 py-1 rounded">Admin@123!</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>
      <Footer />
    </div>
  )
}
