'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Skeleton Component
const SettingsSkeleton = () => (
  <div className="animate-pulse">
    {/* Title Skeleton */}
    <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>

    {/* Notification Card Skeleton */}
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Privacy Card Skeleton */}
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Button Skeleton */}
    <div className="h-12 bg-gray-200 rounded w-40 ml-auto"></div>
  </div>
)

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] = useState({
    emailNotifications: true,
    promoNotifications: false,
    publicProfile: true,
    hidePurchaseHistory: false
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/user/settings')
      const data = await res.json()

      if (res.ok) {
        setSettings(data.settings)
      } else {
        toast.error('Gagal memuat pengaturan', {
          description: data.error || 'Silakan coba lagi'
        })
      }
    } catch (error) {
      toast.error('Terjadi kesalahan', {
        description: 'Gagal memuat pengaturan'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const toastId = toast.loading('Menyimpan pengaturan...', {
      description: 'Mohon tunggu sebentar'
    })

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Pengaturan berhasil disimpan', {
          id: toastId,
          description: 'Preferensi akun Anda telah diperbarui'
        })
      } else {
        toast.error('Gagal menyimpan pengaturan', {
          id: toastId,
          description: data.error || 'Silakan coba lagi'
        })
      }
    } catch (error) {
      toast.error('Terjadi kesalahan', {
        id: toastId,
        description: 'Gagal menyimpan pengaturan'
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <SettingsSkeleton />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <button
              className="text-amber-600 hover:text-amber-700 mb-6 inline-flex items-center transition-colors"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Kembali
            </button>

            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pengaturan</h1>
              <p className="text-gray-600 mt-1">Sesuaikan preferensi akun Anda</p>
            </div>

            {/* Notification Settings */}
            <Card className="bg-white border-gray-200 mb-6 shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-sm text-gray-600">Kirim notifikasi ke email</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('emailNotifications')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-amber-600' : 'bg-gray-300'} disabled:opacity-50`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">Promosi</div>
                    <div className="text-sm text-gray-600">Terima info promo dan penawaran</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('promoNotifications')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.promoNotifications ? 'bg-amber-600' : 'bg-gray-300'} disabled:opacity-50`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.promoNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="bg-white border-gray-200 mb-6 shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">Tampilkan Profil Publik</div>
                    <div className="text-sm text-gray-600">Nama dan avatar terlihat untuk pengguna lain</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('publicProfile')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.publicProfile ? 'bg-amber-600' : 'bg-gray-300'} disabled:opacity-50`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.publicProfile ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">Sembunyikan Riwayat Pembelian</div>
                    <div className="text-sm text-gray-600">Riwayat hanya terlihat oleh Anda</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('hidePurchaseHistory')}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.hidePurchaseHistory ? 'bg-amber-600' : 'bg-gray-300'} disabled:opacity-50`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.hidePurchaseHistory ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </label>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-12 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-lg shadow-amber-900/20 transition-all duration-300 px-8"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : 'Simpan Pengaturan'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
