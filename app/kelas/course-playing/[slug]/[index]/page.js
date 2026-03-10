'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

const parseDuration = (str = '') => {
  if (!str) return 0
  const parts = str.split(':').map(p => parseInt(p, 10))
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return Number(str) || 0
}

export default function CoursePlayer() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug
  const index = Number(params.index || 0)

  const [user, setUser] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [course, setCourse] = useState(null)
  const [openModules, setOpenModules] = useState({})
  const [saving, setSaving] = useState(false)

  // Fetch user and enrollment
  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetch('/api/user/me')
        if (!me.ok) {
          toast.error('Silakan login untuk mengakses kelas')
          router.push(`/auth/login?redirect=${encodeURIComponent(`/kelas/course-playing/${slug}/${index}`)}`)
          return
        }
        const meData = await me.json()
        setUser(meData.user)

        const enr = await fetch(`/api/courses/${slug}/enrollment`)
        const enrData = await enr.json()
        if (!enr.ok || !enrData.success) {
          toast.error('Gagal memuat enrollment')
          router.push('/kelas-saya')
          return
        }
        if (!enrData.isEnrolled) {
          toast.error('Anda belum terdaftar di kelas ini')
          router.push('/explore')
          return
        }
        setEnrollment(enrData.enrollment)
        setCourse({ id: enrData.course.id, slug: enrData.course.slug, title: enrData.course.title, modules: enrData.course.modules || [] })
      } catch (e) {
        toast.error('Terjadi kesalahan memuat kelas')
        router.push('/kelas-saya')
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const lessonsFlat = useMemo(() => {
    if (!course?.modules) return []
    const arr = []
    course.modules.forEach((m, mi) => {
      (m.lessons || []).forEach((l, li) => {
        arr.push({ ...l, moduleId: m.id, moduleTitle: m.title, _mi: mi, _li: li })
      })
    })
    return arr
  }, [course?.modules])

  const currentLesson = lessonsFlat[index] || null

  const toggleModule = (id) => {
    setOpenModules(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const goTo = (i) => {
    if (i < 0 || i >= lessonsFlat.length) return
    router.push(`/kelas/course-playing/${slug}/${i}`)
  }

  const handleComplete = useCallback(async () => {
    if (!user || !course || !currentLesson) return
    setSaving(true)
    const toastId = toast.loading('Menyimpan progres...')
    try {
      const body = {
        userId: user.id,
        courseId: course.id,
        lessonId: currentLesson.id || `${currentLesson.moduleId}-${currentLesson._li}`,
        lessonModuleId: currentLesson.moduleId,
        watchedSeconds: parseDuration(currentLesson.duration || '0:00'),
        duration: parseDuration(currentLesson.duration || '0:00'),
        completed: true
      }
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal menyimpan progres', { id: toastId })
      } else {
        toast.success('Ditandai selesai', { id: toastId })
        const next = index + 1
        if (next < lessonsFlat.length) {
          goTo(next)
        }
      }
    } catch (e) {
      toast.error('Gagal menyimpan progres', { id: toastId })
    } finally {
      setSaving(false)
    }
  }, [user, course, currentLesson, index, lessonsFlat.length])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          {!course ? (
            <div className="text-center py-20 text-gray-600">Memuat kelas...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-4 xl:col-span-3">
                <Card className="bg-white border-gray-200 sticky top-20">
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-600">{lessonsFlat.length} video</div>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto divide-y">
                      {(course.modules || []).map((m, mi) => (
                        <div key={m.id || mi} className="p-3">
                          <button onClick={() => toggleModule(m.id || `m-${mi}`)} className="w-full flex items-center justify-between text-left font-semibold text-gray-900">
                            <span>{m.title || `Modul ${mi + 1}`}</span>
                            {openModules[m.id || `m-${mi}`] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <div className={`${openModules[m.id || `m-${mi}`] ? 'mt-2' : 'hidden'}`}>
                            {(m.lessons || []).map((l, li) => {
                              const flatIndex = lessonsFlat.findIndex(x => x.id === l.id)
                              const active = flatIndex === index
                              return (
                                <button
                                  key={l.id || li}
                                  onClick={() => goTo(flatIndex)}
                                  className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-1 ${active ? 'bg-gold/20 text-gray-900' : 'hover:bg-gray-100 text-gray-700'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Play className="w-3 h-3" />
                                    <span className="flex-1 truncate">{l.title || `Video ${li + 1}`}</span>
                                    {l.duration && <span className="text-xs text-gray-500">{l.duration}</span>}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Player */}
              <div className="lg:col-span-8 xl:col-span-9">
                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden mb-4">
                  {currentLesson?.videoUrl ? (
                    currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={currentLesson.videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={currentLesson.title || 'Video'}
                      />
                    ) : (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video controls className="w-full h-full">
                        <source src={currentLesson.videoUrl} />
                      </video>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">Video tidak tersedia</div>
                  )}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-gray-500">{currentLesson?.moduleTitle}</div>
                    <h1 className="text-xl font-bold text-gray-900">{currentLesson?.title || '—'}</h1>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => goTo(index - 1)} disabled={index <= 0}>Sebelumnya</Button>
                    <Button onClick={handleComplete} className="bg-gold hover:bg-gold-dark text-black" disabled={saving}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                    <Button variant="outline" onClick={() => goTo(index + 1)} disabled={index >= lessonsFlat.length - 1}>Berikutnya</Button>
                  </div>
                </div>
                {currentLesson?.externalUrl && (
                  <a href={currentLesson.externalUrl} target="_blank" rel="noreferrer" className="inline-block text-sm text-gold underline mb-4">
                    {currentLesson.externalDescription || 'Buka materi eksternal'}
                  </a>
                )}
                {currentLesson?.fileUrl && (
                  <a href={currentLesson.fileUrl} target="_blank" rel="noreferrer" className="ml-4 inline-block text-sm text-gold underline">
                    Unduh materi
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
