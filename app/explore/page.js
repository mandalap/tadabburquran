'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Users, SlidersHorizontal, ChevronDown, Clock, Star, TrendingUp, DollarSign, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CourseCard from '@/components/CourseCard'
import CreatorCard from '@/components/CreatorCard'
import { Skeleton } from '@/components/ui/skeleton'

// Debounce hook
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function ExplorePage() {
  const { data: session, status: sessionStatus } = useSession()
  const [courses, setCourses] = useState([])
  const [creators, setCreators] = useState([])
  const [categories, setCategories] = useState([])
  const [courseTypes, setCourseTypes] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([]) // IDs of courses user enrolled in
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeTab, setActiveTab] = useState('kelas')
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceFilter, setPriceFilter] = useState('all') // all, free, paid
  const [sortBy, setSortBy] = useState('newest') // newest, popular, cheapest, priciest, rating
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    fetchData()
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('query') || ''
    const cat = params.get('category') || ''
    if (q) setQuery(q)
    if (cat) setSelectedCategory(cat)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [coursesRes, creatorsRes, categoriesRes, typesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/creators?all=true'),
        fetch('/api/categories'),
        fetch('/api/course-types')
      ])
      const coursesData = await coursesRes.json()
      const creatorsData = await creatorsRes.json()
      const categoriesData = await categoriesRes.json()
      const typesData = await typesRes.json()
      setCourses(coursesData.courses || [])
      setCreators(Array.isArray(creatorsData) ? creatorsData : [])
      setCategories(categoriesData || [])
      setCourseTypes(typesData || [])
    } catch (e) {
      console.error('Error fetch data', e)
    } finally {
      setLoading(false)
    }
  }

  const sortCourses = (coursesList) => {
    const sorted = [...coursesList]
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      case 'popular':
        return sorted.sort((a, b) => (b.students || 0) - (a.students || 0))
      case 'cheapest':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
      case 'priciest':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      default:
        return sorted
    }
  }

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

  const derivedCategories = Array.from(
    new Map(
      courses.map(c => [c.category, { name: c.category, icon: c.category === 'Ecourse' ? '' : c.category === 'Webinar' ? '🎬' : '📦' }])
    ).values()
  )
  const categoryList = categories.length > 0 ? categories : derivedCategories
  const selectedCategoryObj = categoryList.find(c => c.name === selectedCategory)
  const typeOptions = Array.from(
    new Map(courseTypes.map(t => [t.id, t])).values()
  )
    .filter(t => (selectedCategoryObj ? t.category_id === selectedCategoryObj.id : true))
    .map(t => ({
      value: t.id,
      label: t.name
    }))
  const visibleCategories = categoryList

  const filteredCourses = () => {
    let result = courses
      .filter(c => (selectedType ? (c.course_type_id === selectedType) : true))
      .filter(c => (selectedCategory ? c.category === selectedCategory : true))
      .filter(c => (debouncedQuery ? (c.title + (c.instructor || '')).toLowerCase().includes(debouncedQuery.toLowerCase()) : true))

    // Price filter
    if (priceFilter === 'free') {
      result = result.filter(c => !c.price || c.price === 0)
    } else if (priceFilter === 'paid') {
      result = result.filter(c => c.price && c.price > 0)
    }

    // Apply sorting
    return sortCourses(result)
  }

  const filteredCreators = creators.filter(c =>
    debouncedQuery ? c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : true
  )

  const router = useRouter()
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Explore</h1>
            <p className="text-gray-700">Temukan kelas, kreator, dan produk digital terbaik</p>
          </div>
          <button
            className="md:hidden text-gold hover:text-gold-dark mb-6 inline-flex items-center"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Kembali
          </button>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('kelas')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeTab === 'kelas' ? 'bg-gold text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Kelas
            </button>
            <button
              onClick={() => setActiveTab('kreator')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeTab === 'kreator' ? 'bg-gold text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Kreator
            </button>
          </div>

          {activeTab === 'kelas' ? (
            <>
              {/* Search & Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-3 mb-4">
                <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 border border-gray-200">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari kelas, event..."
                    className="bg-transparent border-0 text-gray-800 placeholder:text-gray-500 focus-visible:ring-0"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setSelectedType('')
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700"
                >
                  <option value="">Semua Kategori</option>
                  {visibleCategories.map(category => (
                    <option key={category.id || category.name} value={category.name}>{category.name}</option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value)
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700"
                  disabled={!selectedCategory}
                >
                  <option value="">{selectedCategory ? 'Semua Jenis' : 'Pilih kategori dulu'}</option>
                  {typeOptions.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter & Sort Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                {/* Price Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPriceFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      priceFilter === 'all' ? 'bg-gold text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setPriceFilter('free')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      priceFilter === 'free' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Gratis
                  </button>
                  <button
                    onClick={() => setPriceFilter('paid')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      priceFilter === 'paid' ? 'bg-gold/20 text-gold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Premium
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden sm:inline">Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 text-sm"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="popular">Terpopuler</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="cheapest">Paling Murah</option>
                    <option value="priciest">Paling Mahal</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4 text-sm text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{filteredCourses().length}</span> kelas
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 border border-gray-200">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari kreator..."
                  className="bg-transparent border-0 text-gray-800 placeholder:text-gray-500 focus-visible:ring-0"
                />
              </div>
            </div>
          )}

          {/* Kelas Tab */}
          {activeTab === 'kelas' && (
            <>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filteredCourses().map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      variant="poster"
                      isEnrolled={enrolledIds.includes(course.id)}
                    />
                  ))}
                  {filteredCourses().length === 0 && (
                    <div className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 text-center text-gray-600 text-sm">
                      Belum ada kelas sesuai filter
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Kreator Tab */}
          {activeTab === 'kreator' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredCreators.length > 0 ? (
                filteredCreators.map(creator => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-600 py-12">
                  Belum ada kreator
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
