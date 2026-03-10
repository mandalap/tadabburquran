'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Search, Menu, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Helper untuk cek link aktif
const isActive = (pathname, href) => {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const loggedIn = status === 'authenticated'
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    router.push(query ? `/explore?query=${encodeURIComponent(query)}` : '/explore')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-black font-bold text-xl">TQ</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gold">TadabburQuran.id</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`transition ${isActive(pathname, '/') ? 'text-gold font-semibold' : 'text-gray-800 hover:text-gold'}`}>
              Beranda
            </Link>
            <Link href="/explore" className={`transition ${isActive(pathname, '/explore') ? 'text-gold font-semibold' : 'text-gray-800 hover:text-gold'}`}>
              Explore
            </Link>
            {loggedIn && session?.user?.role === 'admin' ? (
              <Link href="/admin" className={`transition ${isActive(pathname, '/admin') ? 'text-gold font-semibold' : 'text-gray-800 hover:text-gold'}`}>
                Admin
              </Link>
            ) : null}
            {!loggedIn ? (
              <Link href="/auth/login" className={`transition ${isActive(pathname, '/auth') ? 'text-gold font-semibold' : 'text-gray-800 hover:text-gold'}`}>
                Masuk
              </Link>
            ) : null}
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 border border-gray-200">
              <Search className="w-4 h-4 text-gold mr-2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kelas, event..."
                className="bg-transparent border-0 text-gray-800 placeholder:text-gray-500 focus-visible:ring-0 w-64"
              />
            </form>

            {loggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gold hover:bg-gold/10">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px]">
                  <DropdownMenuLabel className="text-gray-700">Akun</DropdownMenuLabel>
                  {session?.user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/promo">Pengaturan Promo</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Pengaturan</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/kelas-saya">Kelas Saya</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/riwayat-pembelian">Riwayat Pembelian</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon" className="text-gold hover:bg-gold/10">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gold">
                  <Menu className="w-5 h-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-xl">TQ</span>
                    </div>
                    <span className="text-2xl font-bold text-gold">TadabburQuran.id</span>
                  </DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-2">
                  <DrawerClose asChild>
                    <Link href="/" className={`block px-4 py-3 rounded-md border transition ${isActive(pathname, '/') ? 'border-gold bg-gold/5 text-gold' : 'border-gray-200 text-gray-800 hover:border-gold hover:text-gold'}`}>
                      Beranda
                    </Link>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Link href="/explore" className={`block px-4 py-3 rounded-md border transition ${isActive(pathname, '/explore') ? 'border-gold bg-gold/5 text-gold' : 'border-gray-200 text-gray-800 hover:border-gold hover:text-gold'}`}>
                      Explore
                    </Link>
                  </DrawerClose>
                  {loggedIn ? (
                    <>
                      {session?.user?.role === 'admin' ? (
                        <DrawerClose asChild>
                          <Link href="/admin" className={`block px-4 py-3 rounded-md border transition ${isActive(pathname, '/admin') ? 'border-gold bg-gold/5 text-gold' : 'border-gray-200 text-gray-800 hover:border-gold hover:text-gold'}`}>
                            Admin Panel
                          </Link>
                        </DrawerClose>
                      ) : null}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-md border border-gray-200 text-gray-800 hover:border-red-300 hover:text-red-600 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <DrawerClose asChild>
                      <Link href="/auth/login" className={`block px-4 py-3 rounded-md border transition ${isActive(pathname, '/auth') ? 'border-gold bg-gold/5 text-gold' : 'border-gray-200 text-gray-800 hover:border-gold hover:text-gold'}`}>
                        Masuk
                      </Link>
                    </DrawerClose>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </nav>
  )
}
