'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Star, Users, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

export default function CourseCard({ course, variant = 'default', isEnrolled = false }) {
  const router = useRouter()
  const [ownedOpen, setOwnedOpen] = useState(false)
  const goToPlayer = () => {
    router.push(`/kelas/course-playing/${course.slug || course.id}`)
  }
  // Get display name for instructor(s)
  const getInstructorDisplay = (course) => {
    if (course.instructors && course.instructors.length > 0) {
      const names = course.instructors.map(i => i.name).filter(n => n)
      if (names.length > 0) {
        return names.length > 2
          ? `${names.slice(0, 2).join(', ')} +${names.length - 2}`
          : names.join(', ')
      }
    }
    return course.instructor || 'TBD'
  }

  // Get first instructor with details for display
  const getFirstInstructor = (course) => {
    if (course.instructors && course.instructors.length > 0) {
      return course.instructors[0]
    }
    return null
  }

  // Get display price
  const getPriceDisplay = (course) => {
    const price = course.price || 0
    if (price === 0) return '0'
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  // Check if course is free
  const isFree = !course.price || course.price === 0

  const firstInstructor = getFirstInstructor(course)
  const getDateDisplay = (course) => {
    const rawDate = course.event_date || course.start_date || course.date || course.created_at
    if (!rawDate) return null
    const date = new Date(rawDate)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  const dateDisplay = getDateDisplay(course)

  if (variant === 'poster') {
    const instructorDisplay = getInstructorDisplay(course)
    // Border styling for enrolled courses
    const borderClass = isEnrolled
      ? 'border-green-500/50 shadow-green-500/20 shadow-md'
      : 'border-gray-200'
    const hoverBorder = isEnrolled ? 'hover:border-green-500' : 'hover:border-gold/50'

    return (
      <>
        <Card
          onClick={() => {
            if (isEnrolled) {
              setOwnedOpen(true)
            } else {
              router.push(`/kelas/${course.slug || course.id}`)
            }
          }}
          className={`bg-white ${borderClass} ${hoverBorder} transition-all duration-300 cursor-pointer overflow-hidden group relative`}>
          {/* Enrolled Badge - Top banner style */}
          {isEnrolled && (
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold py-1 px-3 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Sudah Dimiliki</span>
            </div>
          )}

          <div className={`relative aspect-[4/5] bg-gradient-to-br from-gold/10 to-gold-dark/10 overflow-hidden ${isEnrolled ? 'mt-7' : ''}`}>
            {course.cover ? (
              <img
                src={course.cover}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center" style={{ display: course.cover ? 'none' : 'flex' }}>
              <div className="text-6xl opacity-20">📚</div>
            </div>
            {!isEnrolled && course.category && (
              <Badge className="absolute top-2 right-2 bg-gold text-black">
                {course.category}
              </Badge>
            )}
            {!isEnrolled && isFree && (
              <Badge className="absolute top-2 left-2 bg-green-500 text-white font-semibold">
                GRATIS
              </Badge>
            )}
            {isEnrolled && (
              <div className="absolute bottom-2 left-2 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Milik Anda</span>
              </div>
            )}
          </div>
          <CardContent className="p-3 md:p-4">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 line-clamp-1 group-hover:text-gold transition">
              {course.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-3 mb-2">
              {course.short_description || course.description || 'Deskripsi belum tersedia'}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              {firstInstructor?.avatar ? (
                <img
                  src={firstInstructor.avatar}
                  alt={firstInstructor.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {(firstInstructor?.name || instructorDisplay || 'K').charAt(0)}
                </div>
              )}
              <span className="truncate">{instructorDisplay}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateDisplay || 'Tanggal belum diatur'}</span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div>
              <span className="text-base md:text-lg font-bold text-gold">{getPriceDisplay(course)}</span>
              {course.original_price && course.original_price > course.price && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  Rp {course.original_price.toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
        <AlertDialog open={ownedOpen} onOpenChange={setOwnedOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kelas sudah dimiliki</AlertDialogTitle>
              <AlertDialogDescription>
                Ingin lanjut belajar kelas {course.title}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOwnedOpen(false)}>Tutup</AlertDialogCancel>
              <AlertDialogAction onClick={goToPlayer} className="bg-gold text-black hover:bg-gold-dark">
                Lanjut Belajar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // Border styling for enrolled courses
  const borderClass = isEnrolled
    ? 'border-green-500/50 shadow-green-500/20 shadow-md'
    : 'border-gray-200'
  const hoverBorder = isEnrolled ? 'hover:border-green-500' : 'hover:border-gold/50'

  return (
    <>
      <Card
        onClick={() => {
          if (isEnrolled) {
            setOwnedOpen(true)
          } else {
            router.push(`/kelas/${course.slug || course.id}`)
          }
        }}
        className={`bg-white ${borderClass} ${hoverBorder} transition-all duration-300 cursor-pointer overflow-hidden group relative`}>
        {/* Enrolled Badge - Top banner style */}
        {isEnrolled && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold py-1 px-3 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Sudah Dimiliki</span>
          </div>
        )}

        <div className={`relative h-48 bg-gradient-to-br from-gold/10 to-gold-dark/10 overflow-hidden ${isEnrolled ? 'mt-7' : ''}`}>
          {course.cover ? (
            <img
              src={course.cover}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center" style={{ display: course.cover ? 'none' : 'flex' }}>
            <div className="text-6xl opacity-20">📚</div>
          </div>
          {!isEnrolled && course.category && (
            <Badge className="absolute top-2 right-2 bg-gold text-black">
              {course.category}
            </Badge>
          )}
          {!isEnrolled && isFree && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white font-semibold">
              GRATIS
            </Badge>
          )}
          {/* Diskon badge hanya untuk kelas berbayar */}
          {!isEnrolled && !isFree && course.original_price && course.original_price > course.price && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              Hemat {Math.round((1 - course.price / course.original_price) * 100)}%
            </Badge>
          )}
          {isEnrolled && (
            <div className="absolute bottom-2 left-2 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Milik Anda</span>
            </div>
          )}
        </div>
        <CardContent className="p-3 md:p-4">
          <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-2 line-clamp-1 group-hover:text-gold transition">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-2">
            {course.short_description || course.description || 'Deskripsi belum tersedia'}
          </p>

          {/* Creator/Instructor Section with photo */}
          {firstInstructor && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
              {firstInstructor.avatar ? (
                <img
                  src={firstInstructor.avatar}
                  alt={firstInstructor.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {firstInstructor.name?.charAt(0) || 'K'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {firstInstructor.title ? `${firstInstructor.title} ` : ''}{firstInstructor.name}
                </p>
                {/* Stars */}
                {firstInstructor.rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(firstInstructor.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {firstInstructor.rating} ({firstInstructor.reviews || 0})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs md:text-sm text-gray-600">
            {course.rating && course.rating > 0 && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-gold mr-1 fill-gold" />
                <span>{course.rating}</span>
              </div>
            )}
            {course.students && course.students > 0 && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{course.students.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div>
            <span className="text-xl md:text-2xl font-bold text-gold">{getPriceDisplay(course)}</span>
            {course.original_price && course.original_price > course.price && (
              <span className="text-sm text-gray-400 line-through ml-2">
                Rp {course.original_price.toLocaleString('id-ID')}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
      <AlertDialog open={ownedOpen} onOpenChange={setOwnedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kelas sudah dimiliki</AlertDialogTitle>
            <AlertDialogDescription>
              Ingin lanjut belajar kelas {course.title}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOwnedOpen(false)}>Tutup</AlertDialogCancel>
            <AlertDialogAction onClick={goToPlayer} className="bg-gold text-black hover:bg-gold-dark">
              Lanjut Belajar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
