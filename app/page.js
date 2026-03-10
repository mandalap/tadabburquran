'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, TrendingUp, Award, CheckCircle, BookOpen, Users, Zap, Search, Play, Star, Shield, Clock, MessageCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CourseCard from '@/components/CourseCard'
import CreatorCard from '@/components/CreatorCard'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import PromoModal from '@/components/PromoModal'

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [creators, setCreators] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([]) // IDs of courses user enrolled in
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [stats, setStats] = useState({ users: 1900, products: 500 })

  useEffect(() => {
    fetchCourses()
    fetchCategories()
    fetchTestimonials()
    fetchCreators()

    // Scroll to top on page load
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Fetch enrolled courses when user is logged in
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (sessionStatus === 'authenticated') {
        try {
          const response = await fetch('/api/user/enrollments')
          if (response.ok) {
            const data = await response.json()
            setEnrolledIds(data.enrolledIds || [])
          }
        } catch (error) {
          console.error('Error fetching enrollments:', error)
        }
      } else {
        setEnrolledIds([])
      }
    }
    fetchEnrollments()
  }, [sessionStatus])

  const mapCoursesWithCreators = (courseList, creatorList) => {
    if (!Array.isArray(courseList) || courseList.length === 0) return courseList || []
    if (!Array.isArray(creatorList) || creatorList.length === 0) return courseList
    return courseList.map(course => {
      const instructorName = course.instructor || course.instructors?.[0]?.name || ''
      const creatorMatch = creatorList.find(c => c.name?.toLowerCase() === instructorName.toLowerCase())
      if (!creatorMatch) return course
      const instructors = course.instructors && course.instructors.length > 0
        ? course.instructors.map((i, idx) => idx === 0 ? {
          ...i,
          avatar: i.avatar || creatorMatch.avatar,
          title: i.title || creatorMatch.title,
          rating: i.rating || creatorMatch.rating,
          reviews: i.reviews || creatorMatch.reviews
        } : i)
        : [{ creator_id: creatorMatch.id, name: creatorMatch.name, avatar: creatorMatch.avatar, title: creatorMatch.title, rating: creatorMatch.rating, reviews: creatorMatch.reviews }]
      return { ...course, instructors }
    })
  }

  const fetchCourses = async () => {
    setLoadingCourses(true)
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      const merged = mapCoursesWithCreators(data.courses || [], creators)
      setCourses(merged)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([]) // Set empty array on error
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()

      // Handle both array and error response
      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data.error) {
        console.error('API Error:', data.error)
        // Use fallback categories on error
        setCategories([
          { id: '1', name: 'E-Course', slug: 'e-course', icon: 'book-open', color: 'text-gold', is_active: true, show_on_homepage: true },
          { id: '2', name: 'Webinar', slug: 'webinar', icon: '🎬', color: 'text-teal-600', is_active: true, show_on_homepage: true },
          { id: '3', name: 'Ebook', slug: 'ebook', icon: '📖', color: 'text-orange-600', is_active: true, show_on_homepage: true },
          { id: '4', name: 'Produk Digital', slug: 'produk-digital', icon: '⭐', color: 'text-violet-600', is_active: true, show_on_homepage: true }
        ])
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Use fallback categories on network error
      setCategories([
        { id: '1', name: 'E-Course', slug: 'e-course', icon: 'book-open', color: 'text-gold', is_active: true, show_on_homepage: true },
        { id: '2', name: 'Webinar', slug: 'webinar', icon: '🎬', color: 'text-teal-600', is_active: true, show_on_homepage: true },
        { id: '3', name: 'Ebook', slug: 'ebook', icon: '📖', color: 'text-orange-600', is_active: true, show_on_homepage: true },
        { id: '4', name: 'Produk Digital', slug: 'produk-digital', icon: '⭐', color: 'text-violet-600', is_active: true, show_on_homepage: true }
      ])
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchTestimonials = async () => {
    const tryFetch = async (attempt = 1) => {
      try {
        const response = await fetch('/api/testimonials', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        setTestimonials(data.testimonials || [])
      } catch (error) {
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 600))
          return tryFetch(attempt + 1)
        }
        console.error('Error fetching testimonials:', error)
        setTestimonials([])
      }
    }
    return tryFetch()
  }

  const fetchCreators = async () => {
    const tryFetch = async (attempt = 1) => {
      try {
        const response = await fetch('/api/creators', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        const creatorList = Array.isArray(data) ? data : []
        setCreators(creatorList)
        setCourses(prev => mapCoursesWithCreators(prev, creatorList))
      } catch (error) {
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 600))
          return tryFetch(attempt + 1)
        }
        console.error('Error fetching creators:', error)
        setCreators([]) // Fallback empty array
      }
    }
    return tryFetch()
  }

  // Fungsi shuffle array untuk random
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Helper untuk render icon dari nama - gunakan emoji untuk menghindari heap overflow
  const getCategoryIcon = (iconName) => {
    // Icon mapping sederhana dengan emoji untuk menghindari import semua icon lucide
    const iconEmojiMap = {
      'book-open': '📖',
      'scroll-text': '📜',
      'scale': '⚖️',
      'heart': '❤️',
      'languages': '🌐',
      'history': '🏛️',
      'star': '⭐',
      'graduation-cap': '🎓',
      'lightbulb': '💡',
      'sparkles': '✨',
      'compass': '🧭',
      'target': '🎯',
      'trophy': '🏆',
      'flag': '🚩',
      'bookmark': '🔖',
      'book-text': '📕',
      'library': '📚',
      'school': '🏫',
      'users': '👥',
    }
    return iconEmojiMap[iconName] || '📖'
  }

  // Mapping Tailwind color ke hex
  const getCategoryColor = (colorClass) => {
    const colorMap = {
      'text-gray-600': '#4b5563',
      'text-teal-600': '#0d9488',
      'text-orange-600': '#ea580c',
      'text-violet-600': '#7c3aed',
      'text-rose-600': '#e11d48',
      'text-yellow-600': '#ca8a04',
      'text-gold': '#d97706',
      'text-blue-600': '#2563eb',
      'text-green-600': '#16a34a',
      'text-purple-600': '#9333ea',
      'text-pink-600': '#db2777',
      'text-red-600': '#dc2626',
      'text-indigo-600': '#4f46e5',
    }
    return colorMap[colorClass] || '#f59e0b'
  }

  const valueProps = [
    { icon: <Shield className="w-8 h-8" />, title: 'Kreator Terverifikasi', description: 'Semua ustadz dan ustadzah telah melalui proses verifikasi ketat' },
    { icon: <Star className="w-8 h-8" />, title: 'Konten Berkualitas', description: 'Materi berdasarkan sumber yang autentik dan terpercaya' },
    { icon: <Clock className="w-8 h-8" />, title: 'Akses Selamanya', description: 'Belajar kapan saja, materi dapat diakses seumur hidup' },
    { icon: <MessageCircle className="w-8 h-8" />, title: 'Komunitas Aktif', description: 'Bergabung dengan ribuan siswa dan diskusi interaktif' },
  ]

  const howItWorks = [
    { step: '01', icon: <Search className="w-6 h-6" />, title: 'Pilih Kelas', description: 'Temukan kelas atau kreator sesuai kebutuhan Anda' },
    { step: '02', icon: <Play className="w-6 h-6" />, title: 'Mulai Belajar', description: 'Akses materi video dan modul pembelajaran' },
    { step: '03', icon: <Users className="w-6 h-6" />, title: 'Interaksi', description: 'Bergabung dengan komunitas dan tanya jawab' },
    { step: '04', icon: <Award className="w-6 h-6" />, title: 'Selesaikan', description: 'Dapatkan sertifikat setelah menyelesaikan kelas' },
  ]

  const problems = [
    'Terlalu banyak platform',
    'Tidak tahu mana yang terpercaya',
    'Ribet pindah-pindah sistem',
    'Pembayaran tidak jelas'
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <PromoModal />
      
      {/* Hero Section - ruank.id inspired */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 overflow-hidden bg-gradient-to-b from-gold/5 to-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white border border-gold/30 rounded-full px-4 py-2 mb-6 shadow-sm">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Platform Belajar Al-Quran Terpercaya</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Bangun Ruang Belajar</span>
              <br />
              <span className="text-gold">Al-Quranmu</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Platform untuk kreator Muslim membagikan ilmu, kelas, dan produk digital kepada ribuan siswa di seluruh Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-black font-semibold text-base sm:text-lg px-8 sm:px-10 py-6 shadow-lg shadow-gold/20">
                <Link href="/explore">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 text-gray-800 hover:bg-gray-50 text-base sm:text-lg px-8 sm:px-10 py-6">
                <Link href="/auth/register">Untuk Kreator</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12 text-sm text-gray-700">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                <span className="w-4 h-4 text-gold block"><CheckCircle className="w-4 h-4" /></span>
                <span>Materi bisa diulang</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                <span className="w-4 h-4 text-gold block"><Award className="w-4 h-4" /></span>
                <span>Sertifikat</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                <span className="w-4 h-4 text-gold block"><Clock className="w-4 h-4" /></span>
                <span>Akses Selamanya</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold mb-1">{stats.users.toLocaleString('id-ID')}+</div>
                <div className="text-gray-600 text-sm">Siswa Terdaftar</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold mb-1">{creators.length}+</div>
                <div className="text-gray-600 text-sm">Kreator Ahli</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold mb-1">{stats.products.toLocaleString('id-ID')}+</div>
                <div className="text-gray-600 text-sm">Kelas & Produk</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kreator Showcase Section */}
      {creators.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Belajar dari <span className="text-gold">Kreator Terbaik</span>
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Ustadz, ustadzah, dan pembicara berpengalaman siap membimbing perjalanan belajar Al-Quran Anda
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
              {creators.slice(0, 5).map(creator => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>

            <div className="text-center mt-8 md:mt-10">
              <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
                <Link href="/explore">
                  Lihat Semua Kreator
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Value Proposition Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kenapa Memilih <span className="text-gold">TadabburQuran.id</span>?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Platform pembelajaran Al-Quran terpercaya dengan kreator terbaik dan konten berkualitas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {valueProps.map((prop, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-colors">
                  <div className="text-gold">{prop.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{prop.title}</h3>
                <p className="text-gray-600 text-sm">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Jelajahi <span className="text-gold">Kategori</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Temukan kelas sesuai dengan minat dan kebutuhan Anda
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.filter(c => c.is_active).map((category) => (
              <Link key={category.id} href={`/explore?category=${category.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 group-hover:text-gold transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-xs hidden md:block">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gold/5 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cara <span className="text-gold">Memulai</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Empat langkah mudah untuk memulai perjalanan belajar Al-Quran Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-gold/20 text-5xl font-bold mb-2">{step.step}</div>
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-gold">{step.icon}</div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {/* Arrow for desktop */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gold/30">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              <span className="text-gold">Bingung Cari</span> Kelas & Event <span className="text-gold">yang Tepat?</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
            {problems.map((problem, index) => (
              <Card key={index} className="bg-white border-gray-200">
                <CardContent className="p-3 md:p-6 text-center">
                  <div className="text-2xl md:text-4xl mb-2 md:mb-3">❌</div>
                  <p className="text-sm md:text-base text-gray-700">{problem}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
              <span className="text-gold">TadabburQuran.id</span> <span className="text-gray-900">menyederhanakan semuanya.</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-gold/20 to-gold-dark/20 border-gold/30">
                <CardContent className="p-6 md:p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gold mx-auto mb-4" />
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gold mb-2">{stats.users}+</div>
                <div className="text-xl text-gray-900 font-semibold">Pengguna</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gold/20 to-gold-dark/20 border-gold/30">
              <CardContent className="p-6 md:p-8 text-center">
                <Award className="w-12 h-12 text-gold mx-auto mb-4" />
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gold mb-2">{stats.products}+</div>
                <div className="text-xl text-gray-900 font-semibold">Produk</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section id="populer" className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Sedang <span className="text-gold">Populer</span> di TadabburQuran.id
            </h2>
          </div>
          
          <div className="text-center mt-6 md:mt-8">
            <Button asChild size="lg" variant="outline" className="border-gold text-gold hover:bg-gold/10">
              <Link href="/explore">
                Lihat Semua Kategori
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Top per Kategori */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {(loadingCourses || loadingCategories) ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <Skeleton className="aspect-[4/5] w-full" />
                  <div className="p-3 md:p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {categories.filter(c => c.is_active).map((category) => {
                // Filter kelas per kategori, shuffle, dan ambil 5 (random jika lebih dari 5)
                const categoryCourses = shuffleArray(courses.filter(c => c.category === category.name)).slice(0, 5)
                if (categoryCourses.length === 0) return null

                // Gunakan warna dari kategori (convert Tailwind class ke hex)
                const categoryColor = getCategoryColor(category.color)

                return (
                  <div key={category.id} className="mb-8 md:mb-10 p-4 md:p-6 rounded-2xl" style={{ backgroundColor: `${categoryColor}15` }}>
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl">{getCategoryIcon(category.icon)}</span>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h3>
                      </div>
                      <p className="text-sm md:text-base text-gray-600">{category.description || `Kelas ${category.name} terbaik untuk Anda`}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {categoryCourses.map(c => (
                        <CourseCard
                          key={c.id}
                          course={c}
                          variant="poster"
                          isEnrolled={enrolledIds.includes(c.id)}
                        />
                      ))}
                    </div>
                    <div className="text-center mt-4">
                      <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold/10">
                        <Link href={`/explore?category=${category.slug}`}>
                          Lihat Semua {category.name}
                          <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
              {categories.filter(c => c.is_active).length === 0 && (
                <div className="text-center text-gray-600">Belum ada kategori</div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Lihat Apa <span className="text-gold">Kata Mereka</span>
            </h2>
          </div>
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white border-gray-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center mb-4">
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <Avatar className="w-12 h-12 mr-3">
                          <AvatarFallback className="bg-gold text-black font-bold">
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 italic text-sm md:text-base">"{testimonial.message}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Belum ada testimoni. Jadilah yang pertama memberikan testimoni!
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-gold/20 to-gold-dark/20 border-gold/30">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Siap Memulai Perjalanan Belajar Anda?
              </h2>
              <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan pengguna lainnya dan temukan kelas terbaik untuk Anda
              </p>
              <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-black font-semibold text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                <Link href="/explore">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Creator Join CTA Section */}
      <section className="py-16 md:py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Gabung Menjadi Kreator</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Jadilah <span className="text-gold">Kreator Al-Quran</span>
            </h2>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Bagikan ilmu Anda kepada ribuan siswa Muslim di seluruh Indonesia. Dapatkan penghasilan dari kelas dan produk digital Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="text-gold text-2xl font-bold mb-2">85%</div>
                <div className="text-gray-400 text-sm">Revenue share untuk kreator</div>
              </div>
              <div className="text-center">
                <div className="text-gold text-2xl font-bold mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Akses ke dashboard kreator</div>
              </div>
              <div className="text-center">
                <div className="text-gold text-2xl font-bold mb-2">Gratis</div>
                <div className="text-gray-400 text-sm">Biaya pendaftaran</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-black font-semibold text-base px-8 py-6">
                <Link href="/auth/register">
                  Daftar Jadi Kreator
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gold text-gold hover:bg-gold/10 font-semibold text-base px-8 py-6">
                <Link href="/explore">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
