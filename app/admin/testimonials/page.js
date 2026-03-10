'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon, ChevronDown, Edit2, Trash2, Eye, EyeOff, Check } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

export default function TestimonialsPage() {
  const router = useRouter()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    message: '',
    rating: '5',
    avatar: ''
  })

  const PAGE_SIZE = 9

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async (pageNum = 1, append = false) => {
    if (pageNum === 1 && !append) setLoading(true)
    else setLoadingMore(true)

    try {
      const response = await fetch(`/api/admin/testimonials?page=${pageNum}&limit=${PAGE_SIZE}`)
      if (response.ok) {
        const data = await response.json()
        const newItems = append ? [...testimonials, ...data] : data
        setTestimonials(newItems)
        setHasMore(data.length === PAGE_SIZE)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    fetchTestimonials(page + 1, true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format harus JPG, PNG, atau WebP')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('oldAvatar', formData.avatar || '')

      const response = await fetch('/api/admin/testimonials/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, avatar: data.url }))
        setPreviewImage(data.url)
        toast.success('Foto berhasil diupload')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal upload foto')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Terjadi kesalahan saat upload')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, avatar: '' }))
    setPreviewImage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : '/api/admin/testimonials'

      const method = editingTestimonial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rating: parseInt(formData.rating)
        })
      })

      if (response.ok) {
        setShowForm(false)
        setEditingTestimonial(null)
        resetForm()
        fetchTestimonials(1, false)
        toast.success(editingTestimonial ? 'Testimoni berhasil diupdate!' : 'Testimoni berhasil ditambahkan!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menyimpan testimoni')
      }
    } catch (error) {
      console.error('Error saving testimonial:', error)
      toast.error('Terjadi kesalahan saat menyimpan testimoni')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name || '',
      role: testimonial.role || '',
      message: testimonial.message || '',
      rating: testimonial.rating?.toString() || '5',
      avatar: testimonial.avatar || ''
    })
    setPreviewImage(testimonial.avatar || null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchTestimonials(1, false)
        toast.success('Testimoni berhasil dihapus!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus testimoni')
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast.error('Gagal menghapus testimoni')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleApprove = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: !currentStatus })
      })
      if (response.ok) {
        fetchTestimonials(page, false)
        toast.success(!currentStatus ? 'Testimoni disetujui' : 'Persetujuan dibatalkan')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Gagal mengubah status')
    }
  }

  const handleToggleVisible = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentStatus })
      })
      if (response.ok) {
        fetchTestimonials(page, false)
        toast.success(!currentStatus ? 'Testimoni ditampilkan' : 'Testimoni disembunyikan')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Gagal mengubah status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      message: '',
      rating: '5',
      avatar: ''
    })
    setPreviewImage(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTestimonial(null)
    resetForm()
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ))
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Testimoni</h1>
              <p className="text-gray-600">{testimonials.length} testimoni</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Kembali
              </Button>
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  + Tambah
                </Button>
              )}
            </div>
          </div>

          {/* Form Modal/Section */}
          {showForm && (
            <Card className="mb-6 border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{editingTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                  {/* Avatar Upload */}
                  <div>
                    <Label htmlFor="avatar">Foto Avatar</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {previewImage || formData.avatar ? (
                        <div className="relative">
                          <img
                            src={previewImage || formData.avatar}
                            alt="Preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gold hover:bg-gold/5 transition">
                          <input
                            type="file"
                            id="avatar"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </label>
                      )}
                      <div>
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition text-sm">
                          <Upload className="w-3 h-3" />
                          <span>{uploading ? 'Uploading...' : 'Pilih Foto'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Max 2MB. Auto-compress.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nama *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        placeholder="Contoh: Alumni, Mahasiswa"
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={3}
                      required
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <select
                      id="rating"
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ - 5</option>
                      <option value="4">⭐⭐⭐⭐ - 4</option>
                      <option value="3">⭐⭐⭐ - 3</option>
                      <option value="2">⭐⭐ - 2</option>
                      <option value="1">⭐ - 1</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving || uploading}>
                      {saving ? 'Menyimpan...' : (editingTestimonial ? 'Update' : 'Simpan')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Grid 3 kolom */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="pt-6 text-center text-gray-500">
                Belum ada testimoni. Klik "Tambah" untuk membuat baru.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className={`border-gray-200 ${!testimonial.is_approved ? 'bg-yellow-50' : ''}`}>
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {testimonial.avatar ? (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gold text-black text-sm font-bold">
                                {testimonial.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h3>
                            {testimonial.role && (
                              <p className="text-xs text-gray-500">{testimonial.role}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {renderStars(testimonial.rating || 5)}
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-gray-700 text-sm mb-3 line-clamp-3">{testimonial.message}</p>

                      {/* Status badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {testimonial.is_approved ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                        )}
                        {testimonial.is_visible ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Visible</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Hidden</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleToggleApprove(testimonial.id, testimonial.is_approved)}
                          className={`p-1.5 rounded text-xs ${testimonial.is_approved ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          title={testimonial.is_approved ? 'Unapprove' : 'Approve'}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleToggleVisible(testimonial.id, testimonial.is_visible)}
                          className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                          title={testimonial.is_visible ? 'Hide' : 'Show'}
                        >
                          {testimonial.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(testimonial)
                            setDeleteDialogOpen(true)
                          }}
                          className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                          title="Hapus"
                          disabled={deletingId === testimonial.id}
                        >
                          {deletingId === testimonial.id ? (
                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-6">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    disabled={loadingMore}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus testimoni?</AlertDialogTitle>
            <AlertDialogDescription>
              Testimoni dari "{deleteTarget?.name}" akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget?.id) {
                  handleDelete(deleteTarget.id)
                }
                setDeleteDialogOpen(false)
                setDeleteTarget(null)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Footer />
    </div>
  )
}
