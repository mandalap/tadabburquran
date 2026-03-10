'use client'

import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-gold mb-4">404</div>
        <h1 className="text-4xl font-bold text-white mb-4">Halaman Tidak Ditemukan</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="bg-gold hover:bg-gold-dark text-black font-semibold">
              <Home className="mr-2 w-5 h-5" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/#populer">
            <Button size="lg" variant="outline" className="border-gold text-gold hover:bg-gold/10">
              <Search className="mr-2 w-5 h-5" />
              Jelajahi Kelas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}