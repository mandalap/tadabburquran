'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Folder, Edit2, Trash2, Eye, EyeOff, Plus, X, Check } from 'lucide-react'
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
import {
  BookOpen, ScrollText, Scale, Heart, Languages, History,
  Star, GraduationCap, Lightbulb, Sparkles, Compass, Target,
  Trophy, Flag, Bookmark, Library, School
} from 'lucide-react'

const AVAILABLE_COLORS = [
  { name: 'Gray', value: 'text-gray-600', bg: 'from-gray-50 to-gray-100', border: 'border-gray-200', accent: 'bg-gray-500', hex: '#6b7280' },
  { name: 'Blue', value: 'text-blue-600', bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', accent: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Teal', value: 'text-teal-600', bg: 'from-teal-50 to-teal-100', border: 'border-teal-200', accent: 'bg-teal-500', hex: '#14b8a6' },
  { name: 'Orange', value: 'text-orange-600', bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', accent: 'bg-orange-500', hex: '#f97316' },
  { name: 'Violet', value: 'text-violet-600', bg: 'from-violet-50 to-violet-100', border: 'border-violet-200', accent: 'bg-violet-500', hex: '#8b5cf6' },
  { name: 'Rose', value: 'text-rose-600', bg: 'from-rose-50 to-rose-100', border: 'border-rose-200', accent: 'bg-rose-500', hex: '#f43f5e' },
  { name: 'Amber', value: 'text-amber-600', bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', accent: 'bg-amber-500', hex: '#f59e0b' },
  { name: 'Green', value: 'text-green-600', bg: 'from-green-50 to-green-100', border: 'border-green-200', accent: 'bg-green-500', hex: '#22c55e' },
  { name: 'Purple', value: 'text-purple-600', bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', accent: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Pink', value: 'text-pink-600', bg: 'from-pink-50 to-pink-100', border: 'border-pink-200', accent: 'bg-pink-500', hex: '#ec4899' },
  { name: 'Indigo', value: 'text-indigo-600', bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200', accent: 'bg-indigo-500', hex: '#6366f1' },
  { name: 'Cyan', value: 'text-cyan-600', bg: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200', accent: 'bg-cyan-500', hex: '#06b6d4' },
  { name: 'Red', value: 'text-red-600', bg: 'from-red-50 to-red-100', border: 'border-red-200', accent: 'bg-red-500', hex: '#ef4444' },
]

const AVAILABLE_ICONS = [
  { id: 'book-open', icon: BookOpen, label: 'Buku' },
  { id: 'scroll', icon: ScrollText, label: 'Scroll' },
  { id: 'scale', icon: Scale, label: 'Timbangan' },
  { id: 'heart', icon: Heart, label: 'Hati' },
  { id: 'languages', icon: Languages, label: 'Bahasa' },
  { id: 'history', icon: History, label: 'Sejarah' },
  { id: 'star', icon: Star, label: 'Bintang' },
  { id: 'graduation-cap', icon: GraduationCap, label: 'Wisuda' },
  { id: 'lightbulb', icon: Lightbulb, label: 'Ide' },
  { id: 'sparkles', icon: Sparkles, label: 'Kilau' },
  { id: 'compass', icon: Compass, label: 'Kompas' },
  { id: 'trophy', icon: Trophy, label: 'Piala' },
  { id: 'library', icon: Library, label: 'Perpustakaan' },
  { id: 'school', icon: School, label: 'Sekolah' },
]

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'ecourse',
    icon: 'book-open',
    color: AVAILABLE_COLORS[1].value,
    sort_order: 0,
    is_active: true,
    show_on_homepage: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData({ ...formData, name, slug: generateSlug(name) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Nama kategori harus diisi')
      return
    }

    setSaving(true)
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowForm(false)
        setEditingCategory(null)
        resetForm()
        fetchCategories()
        toast.success(editingCategory ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menyimpan kategori')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Terjadi kesalahan saat menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      type: category.type || 'ecourse',
      icon: category.icon || 'book-open',
      color: category.color || AVAILABLE_COLORS[1].value,
      sort_order: category.sort_order || 0,
      is_active: category.is_active !== undefined ? category.is_active : true,
      show_on_homepage: category.show_on_homepage !== undefined ? category.show_on_homepage : true
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchCategories()
        toast.success('Kategori berhasil dihapus!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus kategori')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Gagal menghapus kategori')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const category = categories.find(c => c.id === id)
      if (!category) return

      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, is_active: !currentStatus })
      })
      if (response.ok) {
        fetchCategories()
        toast.success(`Kategori berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'ecourse',
      icon: 'book-open',
      color: AVAILABLE_COLORS[1].value,
      sort_order: 0,
      is_active: true,
      show_on_homepage: true
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    resetForm()
  }

  const getIconComponent = (iconId) => {
    return AVAILABLE_ICONS.find(i => i.id === iconId)?.icon || Folder
  }

  const getColorScheme = (colorValue) => {
    return AVAILABLE_COLORS.find(c => c.value === colorValue) || AVAILABLE_COLORS[0]
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Kategori</h1>
              <p className="text-gray-600">{categories.length} kategori</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/admin')} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Kembali
              </Button>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" /> Tambah
                </Button>
              )}
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="mb-6 border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nama *</Label>
                      <Input id="name" value={formData.name} onChange={handleNameChange} required className="bg-white" placeholder="Contoh: Tahfidz" />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug (Auto)</Label>
                      <Input id="slug" value={formData.slug} disabled className="bg-gray-100" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} className="bg-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Icon</Label>
                      <div className="relative">
                        <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {React.createElement(getIconComponent(formData.icon), { className: "w-5 h-5 text-gray-600" })}
                            <span className="capitalize">{formData.icon}</span>
                          </div>
                          <span className="text-gray-400">▼</span>
                        </button>
                        {showIconPicker && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-4 gap-1">
                              {AVAILABLE_ICONS.map(iconObj => (
                                <button key={iconObj.id} type="button" onClick={() => { setFormData({...formData, icon: iconObj.id}); setShowIconPicker(false) }} className={`flex flex-col items-center p-2 rounded hover:bg-gray-100 ${formData.icon === iconObj.id ? 'ring-2 ring-blue-500' : ''}`}>
                                  <iconObj.icon className="w-5 h-5 text-gray-600" />
                                  <span className="text-xs text-gray-600">{iconObj.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Warna</Label>
                      <div className="relative">
                        <button type="button" onClick={() => setShowColorPicker(!showColorPicker)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: AVAILABLE_COLORS.find(c => c.value === formData.color)?.hex || '#9CA3AF' }} />
                            <span>{AVAILABLE_COLORS.find(c => c.value === formData.color)?.name || 'Pilih'}</span>
                          </div>
                          <span className="text-gray-400">▼</span>
                        </button>
                        {showColorPicker && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2 grid grid-cols-5 gap-1">
                            {AVAILABLE_COLORS.map(color => (
                              <button key={color.value} type="button" onClick={() => { setFormData({...formData, color: color.value}); setShowColorPicker(false) }} className={`p-2 rounded hover:bg-gray-100 ${formData.color === color.value ? 'ring-2 ring-blue-500' : ''}`}>
                                <span className="w-6 h-6 rounded border border-gray-300 block mx-auto mb-1" style={{ backgroundColor: color.hex }} />
                                <span className="text-xs text-gray-600">{color.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
                      {saving ? 'Menyimpan...' : (editingCategory ? 'Update' : 'Simpan')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>Batal</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-gray-200">
                  <CardContent className="p-4">
                    <Skeleton className="h-10 w-10 mb-2 rounded-lg" />
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="pt-6 text-center text-gray-500">Belum ada kategori.</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const colorScheme = getColorScheme(category.color)
                const IconComp = getIconComponent(category.icon)
                return (
                  <Card key={category.id} className={`group bg-gradient-to-br ${colorScheme.bg} ${colorScheme.border} hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${!category.is_active ? 'opacity-60' : ''}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 ${colorScheme.accent} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <IconComp className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(category)} className="p-1.5 rounded-lg bg-white/50 hover:bg-white text-gray-600 hover:text-gray-900">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleToggleActive(category.id, category.is_active)} className="p-1.5 rounded-lg bg-white/50 hover:bg-white text-gray-600 hover:text-gray-900">
                            {category.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <h3 className={`font-semibold text-gray-900 mb-1 ${category.color}`}>{category.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{category.description || 'Tidak ada deskripsi'}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {category.is_active ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktif</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Non-Aktif</span>
                        )}
                        {category.show_on_homepage && (
                          <span className="text-xs bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full">Beranda</span>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          setDeleteTarget(category)
                          setDeleteDialogOpen(true)
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-600 hover:bg-red-50"
                        disabled={deletingId === category.id}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori "{deleteTarget?.name}" akan dihapus permanen.
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
