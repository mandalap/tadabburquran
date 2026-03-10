'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">TQ</span>
              </div>
              <span className="text-xl md:text-2xl font-bold text-gold">TadabburQuran.id</span>
            </div>
            <p className="text-gray-600 text-sm md:text-base">
              Platform marketplace untuk kelas online, event, dan produk digital berkualitas
            </p>
          </div>

          <div>
            <h3 className="text-gold font-semibold mb-3 md:mb-4 text-sm md:text-base">Menu</h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li><Link href="/" className="text-gray-700 hover:text-gold transition text-sm">Beranda</Link></li>
              <li><Link href="/#populer" className="text-gray-700 hover:text-gold transition text-sm">Explore</Link></li>
              <li><Link href="/dashboard" className="text-gray-700 hover:text-gold transition text-sm">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gold font-semibold mb-3 md:mb-4 text-sm md:text-base">Kategori</h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li><Link href="/#populer" className="text-gray-700 hover:text-gold transition text-sm">Ecourse</Link></li>
              <li><Link href="/#populer" className="text-gray-700 hover:text-gold transition text-sm">Webinar</Link></li>
              <li><Link href="/#populer" className="text-gray-700 hover:text-gold transition text-sm">Produk Digital</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gold font-semibold mb-3 md:mb-4 text-sm md:text-base">Ikuti Kami</h3>
            <div className="flex space-x-3 md:space-x-4">
              <a href="#" className="text-gray-700 hover:text-gold transition">
                <Instagram className="w-5 h-5 md:w-6 md:h-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-gold transition">
                <Facebook className="w-5 h-5 md:w-6 md:h-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-gold transition">
                <Twitter className="w-5 h-5 md:w-6 md:h-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-gold transition">
                <Youtube className="w-5 h-5 md:w-6 md:h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-gray-600 text-xs md:text-sm">
            © 2024 TadabburQuran.id - Semua hak dilindungi
          </p>
        </div>
      </div>
    </footer>
  )
}
