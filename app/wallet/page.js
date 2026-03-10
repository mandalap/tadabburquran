'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wallet, Plus, History, ArrowUpRight, ArrowDownLeft, Gift, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })

export default function WalletPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpLoading, setTopUpLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchWalletData()
    }
  }, [session])

  const fetchWalletData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/wallet?user_id=${session.user.id}`)
      const data = await res.json()
      if (data.success) {
        setBalance(data.balance)
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount)

    if (!amount || amount < 10000) {
      toast.error('Minimal top-up Rp 10.000')
      return
    }

    if (amount > 10000000) {
      toast.error('Maksimal top-up Rp 10.000.000')
      return
    }

    setTopUpLoading(true)
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          amount,
          type: 'topup',
          description: 'Top-up saldo'
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Top-up Rp ${amount.toLocaleString('id-ID')} berhasil!`)
        setTopUpAmount('')
        fetchWalletData()
      } else {
        toast.error(data.error || 'Top-up gagal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setTopUpLoading(false)
    }
  }

  const quickTopUpAmounts = [10000, 25000, 50000, 100000, 250000, 500000]

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup': return <ArrowUpRight className="w-5 h-5 text-green-600" />
      case 'purchase': return <ArrowDownLeft className="w-5 h-5 text-red-600" />
      case 'refund': return <Gift className="w-5 h-5 text-blue-600" />
      case 'reward': return <Gift className="w-5 h-5 text-purple-600" />
      default: return <Wallet className="w-5 h-5 text-gray-600" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup': return 'text-green-600'
      case 'purchase': return 'text-red-600'
      case 'refund': return 'text-blue-600'
      case 'reward': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'topup': return 'Top Up'
      case 'purchase': return 'Pembelian'
      case 'refund': return 'Pengembalian'
      case 'reward': return 'Hadiah'
      case 'transfer_in': return 'Transfer Masuk'
      case 'transfer_out': return 'Transfer Keluar'
      default: return type
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-12 text-center">
              <Wallet className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Login Diperlukan</h2>
              <p className="text-gray-600 mb-6">Silakan login untuk mengakses dompet Anda</p>
              <Button onClick={() => router.push('/auth/login')} className="bg-gold">
                Login Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dompet Saya</h1>

            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-gold to-gold-dark border-0 shadow-xl mb-6">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Saldo Anda</p>
                    {loading ? (
                      <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
                    ) : (
                      <p className="text-3xl md:text-4xl font-bold text-white">
                        {formatCurrency(balance)}
                      </p>
                    )}
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Up Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-gold" />
                    Isi Saldo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Nominal Top Up</label>
                      <Input
                        type="number"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        placeholder="Masukkan nominal"
                        min="10000"
                        max="10000000"
                        className="text-lg"
                      />
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Pilih Cepat</p>
                      <div className="grid grid-cols-3 gap-2">
                        {quickTopUpAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setTopUpAmount(amount.toString())}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:border-gold hover:text-gold transition"
                          >
                            {amount >= 1000
                              ? `${(amount / 1000)}K`
                              : amount.toLocaleString('id-ID')
                            }
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleTopUp}
                      disabled={topUpLoading || !topUpAmount}
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                    >
                      {topUpLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Top Up Sekarang'
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      *Untuk demo, klik top up akan langsung menambah saldo
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-gold" />
                    Riwayat Transaksi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {tx.description || getTransactionLabel(tx.type)}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                          </div>
                          <p className={`font-semibold text-sm ${getTransactionColor(tx.type)}`}>
                            {tx.type === 'topup' || tx.type === 'refund' || tx.type === 'reward' || tx.type === 'transfer_in' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">Belum ada transaksi</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Card */}
            <Card className="mt-6 bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Gunakan Saldo untuk Pembelian</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Saldo dompet dapat digunakan untuk membeli kelas tanpa perlu melakukan pembayaran tambahan.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
