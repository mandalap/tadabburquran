'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function MyCoursesPage() {
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | premium | free | finished

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetch('/api/user/me')
        if (me.ok) {
          const data = await me.json()
          setUser(data.user)
          const res = await fetch(`/api/dashboard?user_id=${data.user.id}`)
          const dash = await res.json()
          setCourses(dash.enrolledCourses || [])
        }
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = courses
    .filter(c => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (c.title || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)
    })
    .filter(c => {
      if (filter === 'premium') return (c.price || 0) > 0
      if (filter === 'free') return !c.price || c.price === 0
      if (filter === 'finished') return (c.progress || 0) >= 100
      return true
    })

  const ProgressBar = ({ value = 0 }) => (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kelas Saya</h1>
            <p className="text-gray-600">Kelola pembelajaran Anda dengan mudah</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari kelas..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-gold"
            />
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'all' ? 'bg-gold text-black' : 'bg-white border border-gray-200 text-gray-700'}`}>Semua</button>
              <button onClick={() => setFilter('premium')} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'premium' ? 'bg-gold text-black' : 'bg-white border border-gray-200 text-gray-700'}`}>Premium</button>
              <button onClick={() => setFilter('free')} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'free' ? 'bg-gold text-black' : 'bg-white border border-gray-200 text-gray-700'}`}>Gratis</button>
              <button onClick={() => setFilter('finished')} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'finished' ? 'bg-gold text-black' : 'bg-white border border-gray-200 text-gray-700'}`}>Selesai</button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse h-72" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-600">
              Belum ada kelas yang cocok dengan filter
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(course => {
                const progress = Math.round(course.progress || 0)
                const isFree = !course.price || course.price === 0
                return (
                  <div key={course.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-40 bg-gradient-to-br from-gold/20 to-gold/10">
                      {course.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.cover} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : null}
                      <div className="absolute top-3 left-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-white/90 text-gray-800 border border-gray-200">
                          {isFree ? 'Gratis' : 'Premium'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-white/90 text-gray-800 border border-gray-200">
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.short_description || '—'}</p>
                      <div className="mb-3">
                        <ProgressBar value={progress} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">{course.category || 'E-Course'}</div>
                        <Button
                          onClick={() => location.assign(`/kelas/course-playing/${course.slug || course.id}`)}
                          className="bg-gold hover:bg-gold-dark text-black font-semibold"
                        >
                          {progress > 0 ? 'Lanjut Belajar' : 'Mulai Belajar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
