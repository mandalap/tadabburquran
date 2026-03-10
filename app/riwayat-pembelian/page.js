'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PurchaseHistoryPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all') // all | paid | pending | failed

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetch('/api/user/me')
        if (!me.ok) return
        const data = await me.json()
        setUser(data.user)
        const res = await fetch(`/api/dashboard?user_id=${data.user.id}`)
        const dash = await res.json()
        setOrders(dash.purchaseHistory || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0)

  const filtered = orders.filter(o => {
    if (tab === 'all') return true
    if (tab === 'paid') return o.paymentStatus === 'paid' || o.status === 'Berhasil'
    if (tab === 'pending') return o.paymentStatus === 'pending' || o.status === 'Menunggu Pembayaran'
    return o.paymentStatus === 'failed' || o.paymentStatus === 'expired' || o.status === 'Gagal' || o.status === 'Kadaluarsa'
  })

  const badge = (status) => {
    if (status === 'paid' || status === 'Berhasil') return 'bg-green-100 text-green-700'
    if (status === 'pending' || status === 'Menunggu Pembayaran') return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Riwayat Pembelian</h1>
            <p className="text-gray-600">Lihat semua transaksi Anda</p>
          </div>

          <div className="mb-4 flex gap-2">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'paid', label: 'Berhasil' },
              { key: 'pending', label: 'Menunggu' },
              { key: 'failed', label: 'Gagal' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  tab === t.key ? 'bg-gold text-black' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-white border border-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="bg-white border-gray-200">
              <CardContent className="p-10 text-center text-gray-600">
                Belum ada transaksi pada filter ini
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((o) => (
                <Card key={o.id} className="bg-white border-gray-200">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {o.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.cover} alt={o.courseName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{o.courseName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${badge(o.paymentStatus)}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {o.date} • {o.paymentMethod || 'midtrans'}
                      </div>
                      <div className="text-sm text-gray-500">ID: {o.transactionId}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(o.price)}</div>
                      {o.slug && (
                        <Button
                          className="mt-2 bg-gold hover:bg-gold-dark text-black"
                          onClick={() => location.assign(`/kelas/course-playing/${o.slug}`)}
                        >
                          Buka Kelas
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
