'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingCart, Filter, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Batal' },
]

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const response = await fetch(`/api/admin/orders?status=${statusFilter}&limit=${limit}&offset=${offset}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900 mb-4">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
            <p className="text-gray-600">Lihat dan kelola semua pesanan</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setStatusFilter(option.value); setPage(1) }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === option.value
                          ? 'bg-gold text-black'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID Pesanan</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Metode</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tanggal</th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-4 px-6"><Skeleton className="h-4 w-16" /></td>
                          <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                          <td className="py-4 px-6"><Skeleton className="h-4 w-32" /></td>
                          <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                          <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                          <td className="py-4 px-6"><Skeleton className="h-5 w-20 rounded-full" /></td>
                          <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                          <td className="py-4 px-6 text-right"><Skeleton className="h-8 w-10 ml-auto" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : orders.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID Pesanan</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Metode</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tanggal</th>
                          <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">#{order.id}</td>
                            <td className="py-4 px-6 text-sm text-gray-700">{order.user_name || 'Guest'}</td>
                            <td className="py-4 px-6 text-sm text-gray-500">{order.user_email || '-'}</td>
                            <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600 capitalize">
                              {order.payment_method || 'Transfer'}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {getStatusLabel(order.status)}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                            <td className="py-4 px-6 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gold hover:text-gold-dark"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">
                        Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} pesanan
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada pesanan</h3>
                  <p className="text-gray-500">
                    {statusFilter !== 'all' ? `Tidak ada pesanan dengan status "${getStatusLabel(statusFilter)}"` : 'Belum ada pesanan masuk'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
