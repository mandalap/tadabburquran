'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import CourseReviews from '@/components/CourseReviews'

// Icons as SVG components
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
)

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
)

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
)

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
)

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)

const AwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
)

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
)

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
)

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z" /></svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.7" y1="10.7" x2="15.3" y2="7.3" /><line x1="8.7" y1="13.3" x2="15.3" y2="16.7" /></svg>
)

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l1.83-1.83a5 5 0 0 0-7.07-7.07L9.5 5.43" /><path d="M14 11a5 5 0 0 0-7.07 0L5.1 12.83a5 5 0 0 0 7.07 7.07L14.5 18.6" /></svg>
)

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" /></svg>
)

const WhatsappIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6A8.5 8.5 0 1 1 20.5 11.5z" /><path d="M8.5 9.5c.5 1.2 1.8 2.5 3 3 .3.1.7.1 1-.1l1.1-.7c.3-.2.7-.1.9.2l.8 1.2c.2.3.1.7-.2.9-1 .7-2.3 1-3.6.6-2.5-.7-4.6-2.8-5.3-5.3-.4-1.3-.1-2.6.6-3.6.2-.3.6-.4.9-.2l1.2.8c.3.2.4.6.2.9l-.7 1.1c-.2.3-.2.7-.1 1z" /></svg>
)

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3 2 11l6.5 2L19 6l-8 9.5L9 21l3-4.5L19 18l3-15z" /></svg>
)

const MoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
)

// Extract YouTube ID from various URL formats
const getYoutubeId = (url) => {
  if (!url) return ''
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : ''
}

// Helper function to clean HTML but keep formatting (bold, italic, etc)
const cleanHtml = (html) => {
  if (!html) return ''
  return html
    // Remove all attributes from any tag (keep tag name only)
    .replace(/<([a-z][a-z0-9]*)\s+[^>]*>/gi, '<$1>')
    // Remove unwanted tags but keep <strong>, <b>, <em>, <i>
    .replace(/<\/?p[^>]*>/gi, '\n\n') // Convert p to line breaks
    .replace(/<\/?h[1-6][^>]*>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '\n• ') // Convert li to bullet
    .replace(/<\/li>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, '\n')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace &nbsp; with space
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up multiple line breaks and spaces
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/^[ \t•]+/gm, '• ') // Ensure bullets at start of line
    .trim()
}

// Helper function to parse HTML with formatting into paragraphs
const parseHtmlWithFormatting = (html) => {
  if (!html) return []
  const cleaned = cleanHtml(html)

  // Split into paragraphs by double newlines
  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 0)

  return paragraphs.map(para => {
    const parts = []
    let lastIndex = 0
    // Match both <strong> and <b> tags
    const boldRegex = /<(strong|b)>(.*?)<\/\1>/gi
    let match

    while ((match = boldRegex.exec(para)) !== null) {
      // Add text before bold tag
      if (match.index > lastIndex) {
        const text = para.substring(lastIndex, match.index).trim()
        if (text) parts.push({ type: 'text', content: text + ' ' })
      }
      // Add bold text
      if (match[2]) {
        parts.push({ type: 'bold', content: match[2].trim() + ' ' })
      }
      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < para.length) {
      const text = para.substring(lastIndex).trim()
      if (text) parts.push({ type: 'text', content: text })
    }

    // If no bold tags found, return all as text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: para })
    }

    return { type: 'paragraph', parts }
  })
}

// Helper function to render HTML with bold formatting (kept for backward compatibility)
const renderHtmlWithBold = (html) => {
  const parsed = parseHtmlWithFormatting(html)
  return parsed.flatMap(p => p.parts)
}

// Helper function to convert HTML to plain text (for short_description fallback)
const stripHtml = (html) => {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentData, setEnrollmentData] = useState(null)
  const [user, setUser] = useState(null) // Track user login status
  const [expandedModules, setExpandedModules] = useState(new Set(['intro']))
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [lessonProgress, setLessonProgress] = useState({})
  const [lessonWatchedSeconds, setLessonWatchedSeconds] = useState(0)
  const progressTimerRef = useRef(null)

  useEffect(() => {
    if (params.id) {
      fetchCourseDetail()
      checkEnrollment()
      checkUser()
    }
  }, [params.id])

  const checkUser = async () => {
    try {
      const response = await fetch('/api/user/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [])

  const fetchCourseDetail = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setCourse(data.course)
        const firstModule = data.course.modules?.[0]
        if (firstModule?.lessons?.[0]) {
          setSelectedLesson(firstModule.lessons[0])
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}/enrollment`)
      const data = await response.json()
      if (data.success && data.isEnrolled) {
        setIsEnrolled(true)
        setEnrollmentData(data.enrollment)
        // Expand all modules for enrolled users
        if (data.enrollment?.modules) {
          const allModuleIds = data.enrollment.modules.map(m => m.id).filter(Boolean)
          setExpandedModules(new Set(allModuleIds))
        }
      }
    } catch (error) {
      console.error('Error checking enrollment:', error)
    }
  }

  const parseDurationToSeconds = (value) => {
    if (!value) return 0
    if (typeof value === 'number') return value
    const text = value.toString().trim()
    if (text.includes(':')) {
      const parts = text.split(':').map(Number)
      if (parts.length === 3) {
        return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
      }
      if (parts.length === 2) {
        return (parts[0] || 0) * 60 + (parts[1] || 0)
      }
    }
    const hourMatch = text.match(/(\d+)\s*jam/i)
    const minuteMatch = text.match(/(\d+)\s*menit/i)
    if (hourMatch || minuteMatch) {
      const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0
      const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0
      return hours * 3600 + minutes * 60
    }
    const num = Number(text)
    return Number.isFinite(num) ? num * 60 : 0
  }

  const fetchProgress = async () => {
    if (!user?.id || !course?.id || !isEnrolled) return
    try {
      const response = await fetch(`/api/progress?user_id=${user.id}&course_id=${course.id}`)
      if (!response.ok) return
      const data = await response.json()
      const progressMap = {}
      ;(data.lessonProgress || []).forEach((row) => {
        progressMap[row.lesson_id] = {
          watchedSeconds: row.watched_seconds || 0,
          completed: row.completed || false
        }
      })
      setLessonProgress(progressMap)
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  useEffect(() => {
    if (user?.id && course?.id && isEnrolled) {
      fetchProgress()
    }
  }, [user?.id, course?.id, isEnrolled])

  useEffect(() => {
    if (!showPreviewModal || !selectedLesson || !isEnrolled || !user?.id) return
    const durationSeconds = parseDurationToSeconds(selectedLesson.duration)
    setLessonWatchedSeconds(lessonProgress[selectedLesson.id]?.watchedSeconds || 0)
    progressTimerRef.current = setInterval(() => {
      setLessonWatchedSeconds((prev) => {
        const next = prev + 1
        return durationSeconds ? Math.min(next, durationSeconds) : next
      })
    }, 1000)
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [showPreviewModal, selectedLesson?.id, isEnrolled, user?.id])

  const syncProgress = async ({ lesson, markComplete = false } = {}) => {
    if (!user?.id || !course?.id || !lesson || !isEnrolled) return
    const durationSeconds = parseDurationToSeconds(lesson.duration)
    const watchedSeconds = markComplete ? durationSeconds : lessonWatchedSeconds
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          lessonId: lesson.id || lesson.title,
          lessonModuleId: lesson.moduleId || null,
          watchedSeconds,
          duration: durationSeconds,
          completed: markComplete
        })
      })
      if (response.ok) {
        setLessonProgress((prev) => ({
          ...prev,
          [lesson.id || lesson.title]: {
            watchedSeconds: watchedSeconds || 0,
            completed: markComplete || (durationSeconds > 0 && watchedSeconds >= durationSeconds)
          }
        }))
      }
    } catch (error) {
      console.error('Error syncing progress:', error)
    }
  }

  const handleCloseModal = async () => {
    if (selectedLesson) {
      await syncProgress({ lesson: selectedLesson })
    }
    setShowPreviewModal(false)
  }

  const handleCompleteLesson = async () => {
    if (selectedLesson) {
      await syncProgress({ lesson: selectedLesson, markComplete: true })
    }
    setShowPreviewModal(false)
  }

  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handlePlayVideo = (lesson) => {
    if (lesson.isFree || isEnrolled || !lesson.isLocked) {
      if (showPreviewModal && selectedLesson) {
        syncProgress({ lesson: selectedLesson })
      }
      const key = lesson.id || lesson.title
      setLessonWatchedSeconds(lessonProgress[key]?.watchedSeconds || 0)
      setSelectedLesson(lesson)
      setShowPreviewModal(true)
    } else {
      const enrollSection = document.getElementById('enroll-section')
      if (enrollSection) {
        enrollSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleEnroll = async () => {
    // Check if course is free
    const isFreeCourse = !course?.price || course.price === 0

    if (isFreeCourse) {
      // For free courses, check if user is logged in
      if (!user) {
        // Redirect to login with return URL
        router.push(`/auth/login?redirect=${encodeURIComponent(`/kelas/${params.id}`)}`)
        return
      }

      // Auto-enroll for free courses
      try {
        // userId is no longer sent - API gets it from session
        const response = await fetch(`/api/courses/${params.id}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })

        if (response.ok) {
          const data = await response.json()
          setIsEnrolled(true)
          setEnrollmentData(data.enrollment)

          // Expand all modules
          if (data.enrollment?.modules) {
            const allModuleIds = data.enrollment.modules.map(m => m.id).filter(Boolean)
            setExpandedModules(new Set(allModuleIds))
          }

          // Show first lesson
          const firstModule = course?.modules?.[0]
          const firstLesson = firstModule?.lessons?.[0]
          if (firstLesson) {
            handlePlayVideo(firstLesson)
          }
        } else {
          const error = await response.json()
          console.error('Enrollment failed:', error)
          // If 401 unauthorized, redirect to login
          if (error.error?.includes('Authentication')) {
            router.push(`/auth/login?redirect=${encodeURIComponent(`/kelas/${params.id}`)}`)
            return
          }
          // Fallback to login if enrollment fails
          router.push(`/auth/login?redirect=${encodeURIComponent(`/kelas/${params.id}`)}`)
        }
      } catch (error) {
        console.error('Error enrolling in free course:', error)
        router.push(`/auth/login?redirect=${encodeURIComponent(`/kelas/${params.id}`)}`)
      }
    } else {
      // For paid courses, go to checkout
      if (course?.slug) {
        router.push(`/checkout/course/${course.slug}`)
      } else {
        router.push(`/checkout?courseSlug=${course.slug || course.id}`)
      }
    }
  }

  const calculateTotalDuration = (modules) => {
    if (!modules) return '0 jam'
    let totalMinutes = 0
    modules.forEach(mod => {
      mod.lessons?.forEach(lesson => {
        const [mins] = lesson.duration.split(':').map(Number)
        totalMinutes += mins || 0
      })
    })
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`
  }

  const countTotalLessons = (modules) => {
    if (!modules) return 0
    return modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)
  }

  // Skeleton component
  const Skeleton = ({ className }) => (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  )

  // Show skeleton while loading (check FIRST before !course)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12">
              {/* Left Column */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6 lg:space-y-8">
                {/* Video Player Skeleton */}
                <Skeleton className="w-full aspect-[16/9] lg:aspect-[2/1] rounded-2xl lg:rounded-3xl" />

                {/* Title Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4" />
                  <Skeleton className="h-5 lg:h-6 w-full" />
                  <Skeleton className="h-5 lg:h-6 w-2/3" />
                </div>

                {/* Info Cards Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-gray-100">
                      <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl mb-3" />
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-6 lg:h-7 w-24" />
                    </div>
                  ))}
                </div>

                {/* Description Skeleton */}
                <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-100">
                  <Skeleton className="h-7 lg:h-8 w-48 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                  </div>
                </div>

                {/* Instructor Skeleton */}
                <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-100">
                  <Skeleton className="h-7 lg:h-8 w-48 mb-6" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 lg:h-7 w-48" />
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:space-y-6">
                {/* Price Card Skeleton */}
                <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
                  <Skeleton className="h-10 w-32 mb-4" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Materials Skeleton */}
                <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-7 lg:h-8 w-40" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show "not found" only after loading is complete AND course is still null
  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-xl mb-4">Kelas tidak ditemukan</p>
          <button
            onClick={() => router.push('/explore')}
            className="px-6 py-2 bg-gold hover:bg-gold-dark text-black rounded-lg font-medium"
          >
            Lihat Semua Kelas
          </button>
        </div>
      </div>
    )
  }

  const totalDuration = calculateTotalDuration(course.modules)
  const totalLessons = countTotalLessons(course.modules)
  const eventDateRaw = course.event_date || course.start_date || course.date || course.created_at
  const eventDateDisplay = eventDateRaw
    ? new Date(eventDateRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const discountPercent = course.original_price && course.original_price > course.price
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : null
  const encodedUrl = encodeURIComponent(shareUrl || '')
  const encodedText = encodeURIComponent(`Lihat kelas: ${course?.title || 'Kelas TadabburQuran'}`)
  const whatsappUrl = `https://wa.me/?text=${encodedText}%0A${encodedUrl}`
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  const emailUrl = `mailto:?subject=${encodedText}&body=${encodedText}%0A${encodedUrl}`
  const previewLesson = course.modules?.flatMap(m => m.lessons || []).find(l => l.videoUrl && (l.isFree || !l.isLocked)) || null
  const previewVideoUrl = course.video_preview || previewLesson?.videoUrl
  const selectedLessonKey = selectedLesson?.id || selectedLesson?.title
  const selectedLessonDurationSeconds = selectedLesson ? parseDurationToSeconds(selectedLesson.duration) : 0
  const selectedLessonPercent = selectedLessonDurationSeconds
    ? Math.min(100, Math.round((lessonWatchedSeconds / selectedLessonDurationSeconds) * 100))
    : 0
  const selectedLessonCompleted = selectedLessonKey ? lessonProgress[selectedLessonKey]?.completed : false

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      setCopied(false)
    }
  }

  const handleNativeShare = async () => {
    if (!shareUrl) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title || 'Kelas TadabburQuran',
          text: course?.short_description || course?.description || '',
          url: shareUrl
        })
      } catch (error) {
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-20">
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gold transition-colors group"
            >
              <span className="w-5 h-5 group-hover:-translate-x-1 transition-transform block"><ArrowLeftIcon /></span>
              <span>Kembali</span>
            </button>
            <Drawer open={shareOpen} onOpenChange={setShareOpen}>
              <DrawerTrigger asChild>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-gold/40 hover:text-gold transition bg-white shadow-sm">
                  <span className="w-4 h-4 block"><ShareIcon /></span>
                  <span className="text-sm font-medium">Bagikan</span>
                </button>
              </DrawerTrigger>
              <DrawerContent className="bg-white">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Bagikan Kelas</DrawerTitle>
                  <DrawerDescription>{course.title}</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <a href={emailUrl} className="flex flex-col items-center gap-2 border border-gray-200 rounded-xl py-3 text-gray-700 hover:border-gold/40 hover:text-gold transition">
                      <span className="w-5 h-5 block"><MailIcon /></span>
                      <span className="text-xs font-medium">Email</span>
                    </a>
                    <a href={telegramUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 border border-gray-200 rounded-xl py-3 text-gray-700 hover:border-gold/40 hover:text-gold transition">
                      <span className="w-5 h-5 block"><TelegramIcon /></span>
                      <span className="text-xs font-medium">Telegram</span>
                    </a>
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 border border-gray-200 rounded-xl py-3 text-gray-700 hover:border-gold/40 hover:text-gold transition">
                      <span className="w-5 h-5 block"><WhatsappIcon /></span>
                      <span className="text-xs font-medium">WhatsApp</span>
                    </a>
                    <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 border border-gray-200 rounded-xl py-3 text-gray-700 hover:border-gold/40 hover:text-gold transition">
                      <span className="w-5 h-5 block"><MoreIcon /></span>
                      <span className="text-xs font-medium">Lainnya</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50 truncate">
                      {shareUrl || '-'}
                    </div>
                    <button onClick={handleCopyLink} className="px-4 py-2 rounded-lg bg-gold text-black text-sm font-semibold hover:bg-gold-dark transition">
                      {copied ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                  <div className="mt-3">
                    <DrawerClose asChild>
                      <button className="w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Tutup</button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12">
            {/* Left Column */}
            <div className="lg:col-span-7 xl:col-span-8">
              {/* Video Player */}
              <div className="relative bg-white rounded-2xl lg:rounded-3xl overflow-hidden mb-6 lg:mb-8 shadow-xl ring-1 ring-black/5">
                {previewVideoUrl && getYoutubeId(previewVideoUrl) ? (
                  <div className="aspect-[16/9] lg:aspect-[2/1] bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${getYoutubeId(previewVideoUrl)}?rel=0&modestbranding=1&playsinline=1&showinfo=0`}
                      title={course.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] lg:aspect-[2/1] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {selectedLesson ? (
                        <div className="text-center text-white">
                          <div className="w-20 lg:w-24 h-20 lg:h-24 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-gold/30 transition-all hover:scale-105">
                            <span className="w-10 h-10 lg:w-12 lg:h-12 text-gold block"><PlayIcon /></span>
                          </div>
                          <p className="text-sm lg:text-base text-gray-300 mb-1">Preview Materi</p>
                          <p className="text-lg lg:text-xl font-medium">{selectedLesson.title}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-20 lg:w-24 h-20 lg:h-24 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                            <span className="w-10 h-10 lg:w-12 lg:h-12 text-gold block"><PlayIcon /></span>
                          </div>
                          <p className="text-white/60 text-sm lg:text-base">Tadabbur Quran</p>
                        </div>
                      )}
                    </div>

                    <div className="absolute top-4 left-4">
                      <span className="text-xs lg:text-sm text-white/60 font-medium tracking-wide">Tadabbur Quran</span>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {(!course.price || course.price === 0) ? (
                        <div className="flex items-center gap-1 bg-green-500 px-3 py-1.5 rounded-full">
                          <span className="text-xs font-bold text-white">GRATIS</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-gold px-3 py-1.5 rounded-full">
                          <span className="w-3 h-3 lg:w-4 lg:h-4 text-black block"><SparklesIcon /></span>
                          <span className="text-xs font-semibold text-black">PREMIUM</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div className="h-full bg-gold w-1/3 rounded-r-full" />
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="mb-6 lg:mb-8">
                <div className="mb-3 lg:mb-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                    {course.title}
                  </h1>
                </div>
                <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-3xl">
                  {course.short_description || course.description}
                </p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
                <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-gray-100 hover:border-gold/30 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="w-5 h-5 lg:w-6 lg:h-6 text-gold block"><CalendarIcon /></span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500 mb-1">TANGGAL</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">{eventDateDisplay || 'Belum ditentukan'}</p>
                </div>

                <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-gray-100 hover:border-gold/30 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="w-5 h-5 lg:w-6 lg:h-6 text-gold block"><ClockIcon /></span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500 mb-1">SESI BELAJAR</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">{totalLessons} Sesi</p>
                </div>

                <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-gray-100 hover:border-gold/30 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="w-5 h-5 lg:w-6 lg:h-6 text-gold block"><UserIcon /></span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500 mb-1">PENGAJAR</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">1 Ustadz</p>
                </div>

                <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-gray-100 hover:border-gold/30 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="w-5 h-5 lg:w-6 lg:h-6 text-gold block"><UsersIcon /></span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500 mb-1">PESERTA</p>
                  <p className="text-base lg:text-lg font-semibold text-gray-900">{course.students || 0}+</p>
                </div>
              </div>

              {/* Mobile CTA */}
              <div id="enroll-section" className="lg:hidden mb-8">
                {isEnrolled ? (
                  <button
                    onClick={() => {
                      if (course?.slug) {
                        router.push(`/kelas/course-playing/${course.slug}`)
                      } else if (params?.id) {
                        router.push(`/kelas/course-playing/${course.slug || course.id}`)
                      }
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <span className="w-5 h-5 block"><PlayIcon /></span>
                    <span>Mulai Belajar</span>
                  </button>
                ) : !course.price || course.price === 0 ? (
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <span>Daftar Gratis</span>
                    <span className="w-5 h-5 block"><ChevronRightIcon /></span>
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-gold/20 transition-all hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <span>Daftar Sekarang</span>
                    <span className="w-5 h-5 block"><ChevronRightIcon /></span>
                  </button>
                )}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 text-gold block"><AwardIcon /></span>
                    <span>Sertifikat</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 text-gold block"><BookIcon /></span>
                    <span>Akses Selamanya</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 mb-6 lg:mb-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Tentang Kelas Ini</h2>
                <div className="text-gray-600 leading-relaxed mb-6 space-y-4">
                  {parseHtmlWithFormatting(course.description || course.short_description).map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.parts.map((part, idx) => {
                        if (part.type === 'bold') {
                          return <strong key={idx} className="font-semibold text-gray-900">{part.content}</strong>
                        }
                        return <span key={idx}>{part.content}</span>
                      })}
                    </p>
                  ))}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yang akan Anda pelajari:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Memahami makna mendalam dari setiap ayat', 'Menerapkan hikmah dalam kehidupan sehari-hari', 'Analisis tafsir klasik dan kontemporer', 'Diskusi interaktif dengan pengajar'].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-3 h-3 text-gold block"><CheckIcon /></span>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor */}
              {course.instructors && course.instructors.length > 0 ? (
                <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Tentang Pengajar</h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {course.instructors[0].avatar ? (
                      <img
                        src={course.instructors[0].avatar}
                        alt={course.instructors[0].name}
                        className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-lg">
                        {course.instructors[0].name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
                        {course.instructors[0].title ? `${course.instructors[0].title} ` : ''}{course.instructors[0].name}
                      </h3>
                      {course.instructors[0].rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(course.instructors[0].rating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            {course.instructors[0].rating} ({course.instructors[0].reviews || 0} review)
                          </span>
                        </div>
                      )}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {course.instructors[0].bio || course.instructor_bio || 'Pengajar berpengalaman dalam bidang tafsir dan tadabbur Quran.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Tentang Pengajar</h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-lg">
                      {course.instructor?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
                        {course.instructor || 'Ustadz Pembimbing'}
                      </h3>
                      <p className="text-gold font-medium mb-2">
                        {course.instructor_title || 'Pengajar Tadabbur Quran'}
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {course.instructor_bio || 'Pengajar berpengalaman dalam bidang tafsir dan tadabbur Quran.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm mt-6 lg:mt-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Review & Penilaian</h2>
                <CourseReviews courseId={course.id} />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-4 lg:space-y-6">
                {/* Desktop CTA */}
                <div id="enroll-section" className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                  <div className="p-6 lg:p-8">
                    {isEnrolled ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="w-5 h-5 text-green-600 block"><CheckIcon /></span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Anda sudah terdaftar</p>
                            <p className="text-lg font-semibold text-gray-900">Akses penuh kelas ini</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (course?.slug) {
                              router.push(`/kelas/course-playing/${course.slug}`)
                            } else if (params?.id) {
                              router.push(`/kelas/course-playing/${params.id}`)
                            }
                          }}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <span className="w-5 h-5 block"><PlayIcon /></span>
                          <span>Mulai Belajar</span>
                        </button>
                      </>
                    ) : !course.price || course.price === 0 ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="w-5 h-5 text-green-600 block"><CheckIcon /></span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Kelas Gratis</p>
                            <p className="text-lg font-semibold text-green-600">Akses tanpa bayar</p>
                          </div>
                        </div>
                        <button
                          onClick={handleEnroll}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <span>{user ? 'Mulai Belajar' : 'Daftar Gratis'}</span>
                          <span className="w-5 h-5 block"><ChevronRightIcon /></span>
                        </button>
                        {!user && (
                          <p className="text-xs text-gray-500 text-center mt-2">Login terlebih dahulu untuk mengakses kelas gratis</p>
                        )}
                      </>
                    ) : (
                      <>
                        {course.original_price && course.original_price > course.price ? (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-3xl font-bold text-gold">
                              Rp {course.price?.toLocaleString('id-ID')}
                            </div>
                            <div className="text-gray-400 line-through">
                              Rp {course.original_price?.toLocaleString('id-ID')}
                            </div>
                            {discountPercent && (
                              <span className="text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded-full">
                                Hemat {discountPercent}%
                              </span>
                            )}
                          </div>
                        ) : course.price > 0 ? (
                          <div className="text-3xl font-bold text-gold mb-2">
                            Rp {course.price?.toLocaleString('id-ID')}
                          </div>
                        ) : (
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            Gratis
                          </div>
                        )}

                        <button
                          onClick={handleEnroll}
                          className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-gold/20 transition-all hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <span>Daftar Sekarang</span>
                          <span className="w-5 h-5 block"><ChevronRightIcon /></span>
                        </button>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-4 h-4 text-gold block"><AwardIcon /></span>
                        <span>Sertifikat</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-4 h-4 text-gold block"><BookIcon /></span>
                        <span>Akses Selamanya</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-4 h-4 text-gold block"><VideoIcon /></span>
                        <span>{totalDuration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-4 h-4 text-gold block"><UsersIcon /></span>
                        <span>{course.students || 0}+ Siswa</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Materi */}
                <div className="bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                  <div className="bg-white px-4 lg:px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg lg:text-xl font-bold text-gray-900">Preview Materi</h2>
                        {isEnrolled && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">✓ Akses Penuh</span>
                        )}
                      </div>
                      <div className="bg-gold/90 px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-black">{totalLessons} Sesi</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 lg:p-6 space-y-3 max-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
                    {course.modules?.map((module, moduleIndex) => (
                      <div key={module.id || moduleIndex} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                        <button
                          onClick={() => toggleModule(module.id || moduleIndex)}
                          className="w-full px-4 lg:px-5 py-3 lg:py-4 flex items-center justify-between hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                              <img src="/module.gif" alt="Module" className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{module.title}</h3>
                              <p className="text-xs text-gray-500">
                                {module.lessons?.length || 0} materi · {module.lessons?.reduce((acc, l) => {
                                  const [m] = l.duration.split(':').map(Number)
                                  return acc + (m || 0)
                                }, 0)} menit
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {expandedModules.has(module.id || moduleIndex) ? (
                              <span className="w-5 h-5 text-gray-400 block"><ChevronUpIcon /></span>
                            ) : (
                              <span className="w-5 h-5 text-gray-400 block"><ChevronDownIcon /></span>
                            )}
                          </div>
                        </button>

                        {expandedModules.has(module.id || moduleIndex) && (
                          <div className="border-t border-gray-100 divide-y divide-gray-50 bg-white">
                            {module.lessons?.map((lesson, lessonIndex) => {
                              const canPlay = lesson.isFree === true || lesson.isLocked === false || isEnrolled
                              const lessonKey = lesson.id || lesson.title
                              const lessonDurationSeconds = parseDurationToSeconds(lesson.duration)
                              const watchedSeconds = lessonProgress[lessonKey]?.watchedSeconds || 0
                              const lessonPercent = lessonDurationSeconds
                                ? Math.min(100, Math.round((watchedSeconds / lessonDurationSeconds) * 100))
                                : 0
                              const lessonCompleted = lessonProgress[lessonKey]?.completed
                              return (
                                <div
                                  key={lesson.id || lessonIndex}
                                  className={`px-4 lg:px-5 py-3 lg:py-4 flex items-center gap-3 transition-all ${canPlay ? 'cursor-pointer hover:bg-gold/5' : 'cursor-not-allowed bg-gray-50/60 pointer-events-none'}`}
                                  onClick={canPlay ? () => handlePlayVideo(lesson) : undefined}
                                >
                                <div className="relative w-16 h-10 lg:w-20 lg:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                                  {canPlay ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/95 ring-1 ring-red-100 shadow-sm flex items-center justify-center">
                                        <img src="/youtube.svg" alt="YouTube" className="w-4 h-4 lg:w-5 lg:h-5" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                      <span className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 block"><LockIcon /></span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 text-sm truncate">{lesson.title}</h4>
                                    {lesson.isFree && !isEnrolled && (
                                      <span className="flex-shrink-0 px-2 py-0.5 bg-yellow-400 rounded-full text-[10px] font-bold text-black">FREE</span>
                                    )}
                                    {isEnrolled && !lesson.isFree && (
                                      <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">UNLOCKED</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{lesson.instructor || course.instructor}</span>
                                    <span>•</span>
                                    <span>{lesson.duration}</span>
                                  </div>
                                </div>
                                {isEnrolled && (
                                  <div className="flex items-center gap-2">
                                    {lessonCompleted ? (
                                      <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                        Selesai
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                                        {lessonPercent}%
                                      </span>
                                    )}
                                    {!lessonCompleted && canPlay && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          syncProgress({ lesson, markComplete: true })
                                        }}
                                        className="text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-full"
                                      >
                                        Selesai
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <span className="w-12 h-12 mx-auto mb-3 text-gray-300 block"><BookIcon /></span>
                        <p>Materi akan segera tersedia</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Video Modal */}
      {showPreviewModal && selectedLesson && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl lg:rounded-3xl overflow-hidden w-full max-w-4xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{selectedLesson.title}</h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="w-4 h-4 text-gray-600 block"><XIcon /></span>
              </button>
            </div>

            <div className="aspect-video bg-gray-900 relative select-none" onContextMenu={(e) => e.preventDefault()}>
              {selectedLesson.videoUrl && getYoutubeId(selectedLesson.videoUrl) ? (
                // YouTube Video
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYoutubeId(selectedLesson.videoUrl)}?rel=0&modestbranding=1&playsinline=1&showinfo=0`}
                  title={selectedLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : selectedLesson.fileUrl || selectedLesson.downloadUrl ? (
                // PDF Ebook or File Download
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center p-8">
                    {selectedLesson.fileUrl?.endsWith('.pdf') || selectedLesson.downloadUrl?.endsWith('.pdf') ? (
                      <>
                        <svg className="w-24 h-24 text-red-500 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          <path d="M12,12A3,3 0 0,1 9,15A3,3 0 0,1 6,12A3,3 0 0,1 9,9A3,3 0 0,1 12,12M15.5,13A4.5,4.5 0 0,0 11,8.5A4.5,4.5 0 0,0 6.5,13H8A3,3 0 0,1 11,10A3,3 0 0,1 14,13H15.5Z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-white mb-3">Ebook / Materi PDF</h3>
                        <p className="text-gray-300 mb-6">{selectedLesson.title}</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-24 h-24 text-blue-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-white mb-3">Materi / File</h3>
                        <p className="text-gray-300 mb-6">{selectedLesson.title}</p>
                      </>
                    )}
                    <a
                      href={selectedLesson.fileUrl || selectedLesson.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-black font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {selectedLesson.fileUrl?.endsWith('.pdf') || selectedLesson.downloadUrl?.endsWith('.pdf') ? 'Baca / Download PDF' : 'Buka Materi'}
                    </a>
                    {selectedLesson.fileUrl?.includes('drive.google.com') || selectedLesson.downloadUrl?.includes('drive.google.com') ? (
                      <p className="text-gray-400 text-sm mt-4">💡 Jika link Google Drive tidak terbuka, login ke Google terlebih dahulu</p>
                    ) : null}
                  </div>
                </div>
              ) : selectedLesson.videoUrl ? (
                // Other Video (Vimeo, MP4, etc)
                selectedLesson.videoUrl.includes('vimeo.com') ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://player.vimeo.com/video/${selectedLesson.videoUrl.split('/').pop()}?h=0`}
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    preload="metadata"
                  >
                    <source src={selectedLesson.videoUrl} type="video/mp4" />
                    Browser Anda tidak mendukung video player.
                  </video>
                )
              ) : selectedLesson.externalUrl ? (
                // External Link (Webinar, Zoom, etc)
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                  <div className="text-center p-8">
                    <svg className="w-20 h-20 text-purple-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-white mb-3">Webinar / Live Session</h3>
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                      {selectedLesson.externalDescription || 'Klik tombol di bawah untuk mengakses sesi webinar'}
                    </p>
                    <a
                      href={selectedLesson.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Buka Link Webinar
                    </a>
                  </div>
                </div>
              ) : (
                // No Content
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-gold/30 transition-all hover:scale-105">
                      <span className="w-10 h-10 text-gold block"><PlayIcon /></span>
                    </div>
                    <p className="text-gray-300">Video Preview</p>
                    <p className="text-sm text-gray-500 mt-2">Video lengkap tersedia setelah mendaftar</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white font-bold">
                  {selectedLesson.instructor?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{selectedLesson.instructor || course.instructor}</p>
                  <p className="text-xs text-gray-500">Pengajar</p>
                </div>
              </div>
              {isEnrolled ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                    {selectedLessonCompleted ? 'Selesai' : `${selectedLessonPercent}%`}
                  </span>
                  {!selectedLessonCompleted && (
                    <button
                      onClick={handleCompleteLesson}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowPreviewModal(false)
                    handleEnroll()
                  }}
                  className="px-6 py-2 bg-gold hover:bg-gold-dark text-white font-medium rounded-lg transition-colors"
                >
                  Daftar Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B8941F; }
      `}</style>
    </div>
  )
}
