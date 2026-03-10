'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

export default function CourseReviews({ courseId, initialReviews = [], initialStats = null }) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState(initialReviews)
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(!initialReviews.length)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    if (!initialReviews.length) {
      fetchReviews()
    }
  }, [courseId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews?course_id=${courseId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error('Silakan login terlebih dahulu')
      return
    }

    if (rating < 1) {
      toast.error('Silakan berikan rating')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          user_id: session.user.id,
          rating,
          comment: comment.trim()
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Review berhasil dikirim!')
        setComment('')
        setRating(5)
        setShowForm(false)
        fetchReviews() // Refresh reviews
      } else {
        toast.error(data.error || 'Gagal mengirim review')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats & Form Trigger */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {stats?.average > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(stats.average)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.average}</p>
                    <p className="text-sm text-gray-600">{stats.total} review</p>
                  </div>
                </>
              )}
              {!stats?.average && (
                <div>
                  <p className="text-gray-600">Belum ada review</p>
                </div>
              )}
            </div>

            {session?.user && (
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-gold hover:bg-gold-dark text-black font-semibold"
              >
                {showForm ? 'Batal' : 'Tulis Review'}
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showForm && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Beri Rating Anda</h4>

              {/* Star Rating Input */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-gray-700">
                  {rating === 5 ? 'Sangat Baik' :
                   rating === 4 ? 'Baik' :
                   rating === 3 ? 'Biasa' :
                   rating === 2 ? 'Kurang' : 'Sangat Buruk'}
                </span>
              </div>

              {/* Comment Input */}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ceritakan pengalaman Anda mengikuti kelas ini..."
                rows={4}
                className="mb-4 bg-white border-gray-200"
              />

              {/* Submit Button */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-gold hover:bg-gold-dark text-black font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Review'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-48 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    {review.avatar_url ? (
                      <AvatarImage src={review.avatar_url} alt={review.full_name} />
                    ) : null}
                    <AvatarFallback className="bg-gold/20 text-gold font-semibold">
                      {review.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.full_name || 'Pengguna'}
                        </h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="p-12 text-center">
            <Star className="w-16 h-16 text-gold mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada review</h3>
            <p className="text-gray-600">Jadilah yang pertama memberikan review!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
