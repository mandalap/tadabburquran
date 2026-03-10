'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Share2, Award, CheckCircle, Calendar } from 'lucide-react'
import { toast } from 'sonner'

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })

export default function CertificatePage() {
  const params = useParams()
  const certificateId = params.id

  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    fetchCertificate()
  }, [certificateId])

  const fetchCertificate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/certificates?certificate_number=${certificateId}`)
      const data = await res.json()

      if (data.certificate) {
        setCertificate(data.certificate)
        setVerified(true)
      } else {
        setVerified(false)
      }
    } catch (error) {
      console.error('Error fetching certificate:', error)
      setVerified(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    toast.info('Fitur download sertifikat akan segera tersedia')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sertifikat Kelas',
          text: `Lihat sertifikat saya untuk kelas ${certificate?.course_title || ''}`,
          url
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link sertifikat berhasil disalin!')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Memuat sertifikat...</div>
        </div>
      </div>
    )
  }

  if (!verified || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sertifikat Tidak Valid</h1>
              <p className="text-gray-600 mb-6">Sertifikat dengan ID ini tidak ditemukan atau mungkin telah dicabut.</p>
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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Sertifikat Terverifikasi</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Sertifikat Kelas</h1>
            </div>

            {/* Certificate Card */}
            <Card className="overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                {/* Certificate Design */}
                <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8 md:p-12 relative">
                  {/* Decorative border */}
                  <div className="absolute inset-4 border-2 border-gold/30 rounded-lg" />

                  {/* Certificate Content */}
                  <div className="relative z-10 text-center">
                    {/* Header */}
                    <div className="mb-8">
                      <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gold mb-2">Sertifikat Kelulusan</h2>
                      <p className="text-gray-600">Tadabbur Quran</p>
                    </div>

                    {/* Content */}
                    <div className="mb-8">
                      <p className="text-gray-700 mb-2">Sertifikat ini diberikan kepada</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                        {certificate.student_name || 'Peserta'}
                      </h3>
                      <p className="text-gray-700 mb-2">telah berhasil menyelesaikan kelas</p>
                      <h4 className="text-xl md:text-2xl font-semibold text-gold mb-6">
                        {certificate.course_title || 'Kelas'}
                      </h4>
                      <p className="text-gray-600">
                        Diberikan pada {formatDate(certificate.completed_at || certificate.issued_at)}
                      </p>
                    </div>

                    {/* Certificate Number */}
                    <div className="inline-block bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Nomor Sertifikat</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">{certificateId}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleDownload}
                    className="bg-gold hover:bg-gold-dark text-white font-semibold"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Unduh Sertifikat
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Bagikan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Verification Info */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Status Terverifikasi</h4>
                    <p className="text-sm text-gray-600">
                      Sertifikat ini valid dan terdaftar dalam sistem Tadabbur Quran.
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
