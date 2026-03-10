'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CourseCard from '@/components/CourseCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, Users, BookOpen, Youtube, Instagram, Send, ArrowLeft, CheckCircle, MapPin } from 'lucide-react'

export default function KreatorPage() {
  const params = useParams()
  const slug = params.slug
  const { data: session, status: sessionStatus } = useSession()

  const [creator, setCreator] = useState(null)
  const [courses, setCourses] = useState([])
  const [recommendedCreators, setRecommendedCreators] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([]) // IDs of courses user enrolled in
  const [loading, setLoading] = useState(true)
  const [isDynamicCreator, setIsDynamicCreator] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchCreator()
    }
  }, [slug])

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

  const fetchCreator = async () => {
    try {
      const response = await fetch(`/api/creators/${slug}`)
      const data = await response.json()

      if (response.ok) {
        setCreator(data.creator)
        setCourses(data.courses || [])
        setIsDynamicCreator(data.isDynamicCreator || false)
      } else {
        // Handle 404 with recommended creators
        setRecommendedCreators(data.recommendedCreators || [])
      }
    } catch (error) {
      console.error('Error fetching creator:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCreatorTypeLabel = (type) => {
    const labels = {
      'ustadz': 'Ustadz',
      'ustadzah': 'Ustadzah',
      'pembicara': 'Pembicara',
      'organisasi': 'Organisasi',
      'lembaga': 'Lembaga'
    }
    return labels[type] || 'Kreator'
  }

  // Skeleton component
  const CreatorSkeleton = () => (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="container mx-auto">
          <Skeleton className="w-24 h-10 mb-6" />
        </div>
      </div>

      {/* Profile Card Skeleton */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-gray-200 overflow-hidden">
              <CardContent className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-6">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-28 rounded-lg" />
                      <Skeleton className="h-10 w-28 rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section Skeleton */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-80 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <Skeleton className="aspect-[4/5] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  if (loading) {
    return <CreatorSkeleton />
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Kreator tidak ditemukan</h1>
              <p className="text-gray-600 mb-8">
                Kreator yang Anda cari tidak tersedia atau telah dihapus. Berikut adalah beberapa kreator yang mungkin Anda minati.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="outline" className="border-gray-300">
                  <Link href="/explore">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Jelajahi Kreator
                  </Link>
                </Button>
                <Button asChild className="bg-gold hover:bg-gold-dark text-white">
                  <Link href="/">
                    Beranda
                  </Link>
                </Button>
              </div>
            </div>

            {/* Recommended Creators */}
            {recommendedCreators.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">Kreator Rekomendasi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {recommendedCreators.map((rec) => (
                    <Link
                      key={rec.id}
                      href={`/kreator/${rec.slug || rec.id}`}
                      className="group"
                    >
                      <Card className="border-gray-200 hover:border-gold/50 transition-all hover:shadow-lg h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="w-16 h-16 border-2 border-gold/20">
                              <AvatarImage src={rec.avatar} alt={rec.name} />
                              <AvatarFallback className="bg-gold/20 text-gold text-xl font-bold">
                                {rec.name?.charAt(0) || 'K'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 group-hover:text-gold transition truncate">
                                {rec.name}
                              </h3>
                              {rec.title && (
                                <p className="text-sm text-gold truncate">{rec.title}</p>
                              )}
                            </div>
                          </div>

                          {rec.specialty && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{rec.specialty}</p>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium text-gray-900">{rec.rating || '0'}</span>
                              {rec.reviews > 0 && (
                                <span className="text-gray-500">({rec.reviews})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <BookOpen className="w-4 h-4" />
                              <span>{rec.courses_count || 0} kelas</span>
                            </div>
                          </div>

                          {rec.is_top_creator && (
                            <span className="inline-block mt-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Top Kreator
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Back Button */}
      <div className="pt-20 px-4">
        <div className="container mx-auto">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-gold">
            <Link href="/">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Kembali
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section - Creator Profile */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-gray-200 overflow-hidden">
              <CardContent className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-gold/20">
                      <AvatarImage src={creator.avatar} alt={creator.name} />
                      <AvatarFallback className="bg-gold text-black text-3xl font-bold">
                        {creator.name?.charAt(0) || 'K'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full font-medium capitalize">
                        {getCreatorTypeLabel(creator.creator_type)}
                      </span>
                      {creator.is_top_creator && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          Top Kreator
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                      {creator.name}
                    </h1>

                    {creator.title && (
                      <p className="text-gold font-medium text-lg mb-3">{creator.title}</p>
                    )}

                    {creator.specialty && (
                      <p className="text-gray-600 mb-4">{creator.specialty}</p>
                    )}

                    {creator.bio && (
                      <p className="text-gray-700 mb-6 leading-relaxed">{creator.bio}</p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 mb-6">
                      {creator.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-gray-900">{creator.rating}</span>
                          {creator.reviews > 0 && (
                            <span className="text-gray-500 text-sm">({creator.reviews} review)</span>
                          )}
                        </div>
                      )}
                      {creator.students_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-5 h-5 text-gold" />
                          <span className="font-semibold text-gray-900">{creator.students_count.toLocaleString('id-ID')}</span>
                          <span className="text-gray-500 text-sm">siswa</span>
                        </div>
                      )}
                      {creator.courses_count > 0 && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-5 h-5 text-gold" />
                          <span className="font-semibold text-gray-900">{creator.courses_count}</span>
                          <span className="text-gray-500 text-sm">kelas</span>
                        </div>
                      )}
                    </div>

                    {/* Social Links - Only show if not dynamic creator */}
                    {!isDynamicCreator && (creator.social_youtube || creator.social_instagram || creator.social_telegram) && (
                      <div className="flex items-center gap-3">
                        {creator.social_youtube && (
                          <a
                            href={creator.social_youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          >
                            <Youtube className="w-4 h-4" />
                            <span className="text-sm font-medium">YouTube</span>
                          </a>
                        )}
                        {creator.social_instagram && (
                          <a
                            href={creator.social_instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition"
                          >
                            <Instagram className="w-4 h-4" />
                            <span className="text-sm font-medium">Instagram</span>
                          </a>
                        )}
                        {creator.social_telegram && (
                          <a
                            href={creator.social_telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          >
                            <Send className="w-4 h-4" />
                            <span className="text-sm font-medium">Telegram</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
              Kelas & Produk oleh <span className="text-gold">{creator.name}</span>
            </h2>

            {courses.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {courses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="poster"
                    isEnrolled={enrolledIds.includes(course.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-white border-gray-200">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gold mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada kelas</h3>
                  <p className="text-gray-700">Kelas dari {creator.name} akan segera tersedia</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Section - Only show for non-dynamic creators */}
      {!isDynamicCreator && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
                Mengapa Belajar dari <span className="text-gold">{creator.name}</span>?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-gray-200 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Materi Terpercaya</h3>
                    <p className="text-gray-600 text-sm">Konten berdasarkan sumber yang autentik dan terpercaya</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Komunitas Aktif</h3>
                    <p className="text-gray-600 text-sm">Bergabung dengan ribuan siswa lainnya</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Akses Selamanya</h3>
                    <p className="text-gray-600 text-sm">Materi dapat diakses kapan saja selamanya</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
