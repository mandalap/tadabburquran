'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
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

const STAR_ICONS = ['⭐', '🌟', '💫', '✨', '🏆']

export default function CreatorsPage() {
  const router = useRouter()
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCreator, setEditingCreator] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    specialty: '',
    title: '',
    bio: '',
    avatar: '',
    rating: 0,
    reviews: 0,
    courses_count: 0,
    students_count: 0,
    is_featured: false,
    is_top_creator: false,
    sort_order: 0,
    is_active: true,
    social_youtube: '',
    social_instagram: '',
    social_telegram: '',
    creator_type: 'ustadz'
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCreators()
  }, [])

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/admin/creators')
      if (response.ok) {
        const data = await response.json()
        setCreators(data)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memuat data kreator')
      }
    } catch (error) {
      console.error('Error fetching creators:', error)
      toast.error('Gagal memuat data kreator')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file JPG, PNG, dan WebP yang diperbolehkan')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/admin/creators/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, avatar: data.url }))
        toast.success(`Gambar berhasil diupload! Kompresi: ${data.compression}%`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal upload gambar')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Terjadi kesalahan saat upload gambar')
    } finally {
      setUploading(false)
    }
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: editingCreator ? formData.slug : generateSlug(name)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSaving(true)

    // Check featured count
    const featuredCount = creators.filter(c => c.is_featured).length
    if (formData.is_featured && !editingCreator && featuredCount >= 5) {
      toast.error('Maksimal 5 kreator featured!')
      setLoading(false)
      setSaving(false)
      return
    }
    if (formData.is_featured && editingCreator && !editingCreator.is_featured && featuredCount >= 5) {
      toast.error('Maksimal 5 kreator featured!')
      setLoading(false)
      setSaving(false)
      return
    }

    try {
      const url = editingCreator
        ? `/api/admin/creators/${editingCreator.id}`
        : '/api/admin/creators'

      const method = editingCreator ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowForm(false)
        setEditingCreator(null)
        resetForm()
        fetchCreators()
        toast.success(editingCreator ? 'Kreator berhasil diupdate!' : 'Kreator berhasil ditambahkan!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving creator:', error)
      toast.error('Gagal menyimpan kreator')
    } finally {
      setLoading(false)
      setSaving(false)
    }
  }

  const handleEdit = (creator) => {
    setEditingCreator(creator)
    setFormData({
      name: creator.name,
      slug: creator.slug,
      specialty: creator.specialty || '',
      title: creator.title || '',
      bio: creator.bio || '',
      avatar: creator.avatar || '',
      rating: creator.rating || 0,
      reviews: creator.reviews || 0,
      courses_count: creator.courses_count || 0,
      students_count: creator.students_count || 0,
      is_featured: creator.is_featured || false,
      is_top_creator: creator.is_top_creator || false,
      sort_order: creator.sort_order || 0,
      is_active: creator.is_active !== undefined ? creator.is_active : true,
      social_youtube: creator.social_youtube || '',
      social_instagram: creator.social_instagram || '',
      social_telegram: creator.social_telegram || '',
      creator_type: creator.creator_type || 'ustadz'
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/creators/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchCreators()
        toast.success('Kreator berhasil dihapus!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus kreator')
      }
    } catch (error) {
      console.error('Error deleting creator:', error)
      toast.error('Gagal menghapus kreator')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleFeatured = async (id, currentStatus) => {
    const featuredCount = creators.filter(c => c.is_featured).length
    if (!currentStatus && featuredCount >= 5) {
      toast.error('Maksimal 5 kreator featured!')
      return
    }

    try {
      const response = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !currentStatus })
      })
      if (response.ok) {
        fetchCreators()
        toast.success(!currentStatus ? 'Kreator ditambahkan ke Featured!' : 'Kreator dihapus dari Featured!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error updating creator:', error)
      toast.error('Gagal mengupdate status Featured')
    }
  }

  const handleToggleTopCreator = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_top_creator: !currentStatus })
      })
      if (response.ok) {
        fetchCreators()
        toast.success(!currentStatus ? 'Kreator ditambahkan ke Top Creator!' : 'Kreator dihapus dari Top Creator!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengupdate status Top Creator')
      }
    } catch (error) {
      console.error('Error updating creator:', error)
      toast.error('Gagal mengupdate status Top Creator')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      specialty: '',
      title: '',
      bio: '',
      avatar: '',
      rating: 0,
      reviews: 0,
      courses_count: 0,
      students_count: 0,
      is_featured: false,
      is_top_creator: false,
      sort_order: 0,
      is_active: true,
      social_youtube: '',
      social_instagram: '',
      social_telegram: '',
      creator_type: 'ustadz'
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCreator(null)
    resetForm()
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="text-yellow-400">★</span>)
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} className="text-yellow-400">½</span>)
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>)
      }
    }
    return stars
  }

  const featuredCount = creators.filter(c => c.is_featured).length

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Kreator</h1>
              <p className="text-gray-600">Tambah, edit, dan kelola kreator instruktur</p>
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
                  + Tambah Kreator
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-gray-900">{creators.length}</div>
                <p className="text-sm text-gray-500">Total Kreator</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-amber-600">{creators.filter(c => c.is_top_creator).length}</div>
                <p className="text-sm text-gray-500">🏆 Top Creator</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{featuredCount}/5</div>
                <p className="text-sm text-gray-500">Featured (Dashboard)</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">
                  {creators.reduce((sum, c) => sum + (c.students_count || 0), 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">Total Siswa</p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="mb-6 border-gray-200">
              <CardHeader>
                <CardTitle>{editingCreator ? 'Edit Kreator' : 'Tambah Kreator Baru'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        required
                        className="bg-white"
                        placeholder="Contoh: Ust. Abdullah Yusuf"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        required
                        className="bg-white"
                        placeholder="abdullah-yusuf"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="creator_type">Tipe Kreator *</Label>
                      <select
                        id="creator_type"
                        value={formData.creator_type}
                        onChange={(e) => setFormData({...formData, creator_type: e.target.value})}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                        required
                      >
                        <option value="ustadz">Ustadz</option>
                        <option value="ustadzah">Ustadzah</option>
                        <option value="pembicara">Pembicara</option>
                        <option value="organisasi">Organisasi</option>
                        <option value="lembaga">Lembaga</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="specialty">Keahlian/Specialty</Label>
                      <Input
                        id="specialty"
                        value={formData.specialty}
                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                        className="bg-white"
                        placeholder="Contoh: Tahfidz, Tajwid"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Gelar/Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="bg-white"
                        placeholder="Contoh: Lc., M.A., Ust."
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <Label>Upload Foto / Avatar</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {formData.avatar && (
                        <div className="relative w-20 h-20">
                          <img
                            src={formData.avatar}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          />
                          {uploading && (
                            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                              <span className="w-6 h-6 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {uploading ? 'Mengupload & kompres...' : 'JPG, PNG, WebP (max 5MB). Otomatis dikonversi ke WebP.'}
                        </p>
                        {uploading && (
                          <div className="flex items-center gap-2 text-xs text-blue-600 mt-2">
                            <span className="w-3.5 h-3.5 border-2 border-blue-600/70 border-t-transparent rounded-full animate-spin" />
                            <span>Sedang diproses</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Input
                      type="hidden"
                      value={formData.avatar}
                      onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio Singkat</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={2}
                      className="bg-white"
                      placeholder="Deskripsi singkat tentang kreator"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="rating">Rating (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviews">Jumlah Review</Label>
                      <Input
                        id="reviews"
                        type="number"
                        min="0"
                        value={formData.reviews}
                        onChange={(e) => setFormData({...formData, reviews: parseInt(e.target.value) || 0})}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="courses_count">Jumlah Kelas</Label>
                      <Input
                        id="courses_count"
                        type="number"
                        min="0"
                        value={formData.courses_count}
                        onChange={(e) => setFormData({...formData, courses_count: parseInt(e.target.value) || 0})}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="students_count">Jumlah Siswa</Label>
                      <Input
                        id="students_count"
                        type="number"
                        min="0"
                        value={formData.students_count}
                        onChange={(e) => setFormData({...formData, students_count: parseInt(e.target.value) || 0})}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sort_order">Urutan Tampil</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        min="0"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="social_youtube">YouTube URL</Label>
                      <Input
                        id="social_youtube"
                        value={formData.social_youtube}
                        onChange={(e) => setFormData({...formData, social_youtube: e.target.value})}
                        className="bg-white"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="social_instagram">Instagram URL</Label>
                      <Input
                        id="social_instagram"
                        value={formData.social_instagram}
                        onChange={(e) => setFormData({...formData, social_instagram: e.target.value})}
                        className="bg-white"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="is_featured" className="cursor-pointer">
                        ⭐ Featured (Tampil di Dashboard, max 5)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_top_creator"
                        checked={formData.is_top_creator}
                        onChange={(e) => setFormData({...formData, is_top_creator: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="is_top_creator" className="cursor-pointer">
                        🏆 Top Creator (Bintang Emas)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
                      <span className="flex items-center gap-2">
                        {saving && <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />}
                        <span>{saving ? 'Menyimpan...' : (editingCreator ? 'Update' : 'Simpan')}</span>
                      </span>
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : creators.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="pt-6 text-center text-gray-500">
                Belum ada kreator. Klik "Tambah Kreator" untuk membuat baru.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((creator) => (
                <Card key={creator.id} className={`border-gray-200 hover:shadow-md transition-shadow ${!creator.is_active ? 'opacity-60' : ''} ${creator.is_top_creator ? 'ring-2 ring-amber-400' : ''}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                          {creator.name?.charAt(0) || 'K'}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{creator.name}</h3>
                          {creator.is_top_creator && <span className="text-amber-500">🏆</span>}
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                            {creator.creator_type || 'ustadz'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{creator.title} {creator.specialty && `• ${creator.specialty}`}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(creator.rating || 0)}
                          <span className="text-xs text-gray-500 ml-1">({creator.reviews || 0})</span>
                        </div>
                      </div>
                    </div>

                    {creator.bio && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{creator.bio}</p>
                    )}

                    <div className="flex gap-2 mt-3 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {creator.courses_count || 0} Kelas
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {(creator.students_count || 0).toLocaleString()} Siswa
                      </span>
                      {creator.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          ⭐ Featured
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant={creator.is_featured ? "default" : "outline"}
                        onClick={() => handleToggleFeatured(creator.id, creator.is_featured)}
                        className={creator.is_featured ? "bg-yellow-500 text-white hover:bg-yellow-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
                      >
                        {creator.is_featured ? '⭐ Featured' : 'Featured'}
                      </Button>
                      <Button
                        size="sm"
                        variant={creator.is_top_creator ? "default" : "outline"}
                        onClick={() => handleToggleTopCreator(creator.id, creator.is_top_creator)}
                        className={creator.is_top_creator ? "bg-amber-500 text-white hover:bg-amber-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
                      >
                        {creator.is_top_creator ? '🏆 Top' : 'Top'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(creator)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDeleteTarget(creator)
                          setDeleteDialogOpen(true)
                        }}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        disabled={deletingId === creator.id}
                      >
                        {deletingId === creator.id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            <span>Menghapus...</span>
                          </span>
                        ) : (
                          'Hapus'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kreator?</AlertDialogTitle>
            <AlertDialogDescription>
              Kreator "{deleteTarget?.name}" akan dihapus permanen.
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
