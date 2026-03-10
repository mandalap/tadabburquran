'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Tag, Plus, Edit2, Trash2, Power } from 'lucide-react'
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

export default function TypesPage() {
  const router = useRouter()
  const [types, setTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    sort_order: 0,
    is_active: true
  })

  useEffect(() => {
    fetchTypes()
    fetchCategories()
  }, [])

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData({ ...formData, name, slug: generateSlug(name) })
  }

  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/admin/course-types')
      if (response.ok) {
        const data = await response.json()
        setTypes(data || [])
      }
    } catch (error) {
      console.error('Error fetching types:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.filter(c => c.is_active))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.slug || !formData.category_id) {
      toast.error('Lengkapi nama, kategori, dan slug')
      return
    }

    setSaving(true)
    try {
      const url = editingType ? `/api/admin/course-types/${editingType.id}` : '/api/admin/course-types'
      const method = editingType ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id,
          sort_order: parseInt(formData.sort_order, 10) || 0
        })
      })

      if (response.ok) {
        setShowForm(false)
        setEditingType(null)
        resetForm()
        fetchTypes()
        toast.success(editingType ? 'Jenis berhasil diperbarui!' : 'Jenis berhasil ditambahkan!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menyimpan jenis')
      }
    } catch (error) {
      console.error('Error saving type:', error)
      toast.error('Terjadi kesalahan saat menyimpan jenis')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (type) => {
    setEditingType(type)
    setFormData({
      name: type.name || '',
      slug: type.slug || '',
      category_id: type.category_id?.toString() || '',
      sort_order: type.sort_order || 0,
      is_active: type.is_active !== undefined ? type.is_active : true
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/course-types/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchTypes()
        toast.success('Jenis berhasil dihapus!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus jenis')
      }
    } catch (error) {
      console.error('Error deleting type:', error)
      toast.error('Terjadi kesalahan saat menghapus jenis')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const type = types.find(t => t.id === id)
      if (!type) return

      const response = await fetch(`/api/admin/course-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...type, is_active: !currentStatus })
      })
      if (response.ok) {
        fetchTypes()
        toast.success(`Jenis berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      }
    } catch (error) {
      console.error('Error updating type:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      sort_order: 0,
      is_active: true
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingType(null)
    resetForm()
  }

  // Group types by category
  const groupedTypes = categories.reduce((acc, cat) => {
    const catTypes = types.filter(t => t.category_id === cat.id)
    if (catTypes.length > 0) {
      acc.push({ category: cat, types: catTypes })
    }
    return acc
  }, [])

  // Types without category
  const unassignedTypes = types.filter(t => !t.category_id)

  const getCategoryColor = (colorValue) => {
    const colorMap = {
      'text-gray-600': { bg: 'from-gray-50 to-gray-100', accent: 'bg-gray-500', border: 'border-gray-200' },
      'text-teal-600': { bg: 'from-teal-50 to-teal-100', accent: 'bg-teal-500', border: 'border-teal-200' },
      'text-orange-600': { bg: 'from-orange-50 to-orange-100', accent: 'bg-orange-500', border: 'border-orange-200' },
      'text-violet-600': { bg: 'from-violet-50 to-violet-100', accent: 'bg-violet-500', border: 'border-violet-200' },
      'text-rose-600': { bg: 'from-rose-50 to-rose-100', accent: 'bg-rose-500', border: 'border-rose-200' },
      'text-amber-600': { bg: 'from-amber-50 to-amber-100', accent: 'bg-amber-500', border: 'border-amber-200' },
      'text-blue-600': { bg: 'from-blue-50 to-blue-100', accent: 'bg-blue-500', border: 'border-blue-200' },
      'text-green-600': { bg: 'from-green-50 to-green-100', accent: 'bg-green-500', border: 'border-green-200' },
      'text-purple-600': { bg: 'from-purple-50 to-purple-100', accent: 'bg-purple-500', border: 'border-purple-200' },
      'text-pink-600': { bg: 'from-pink-50 to-pink-100', accent: 'bg-pink-500', border: 'border-pink-200' },
      'text-indigo-600': { bg: 'from-indigo-50 to-indigo-100', accent: 'bg-indigo-500', border: 'border-indigo-200' },
      'text-cyan-600': { bg: 'from-cyan-50 to-cyan-100', accent: 'bg-cyan-500', border: 'border-cyan-200' },
      'text-red-600': { bg: 'from-red-50 to-red-100', accent: 'bg-red-500', border: 'border-red-200' },
    }
    return colorMap[colorValue] || colorMap['text-gray-600']
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Jenis</h1>
              <p className="text-gray-600">{types.length} jenis kelas</p>
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
                <h3 className="text-lg font-semibold mb-4">{editingType ? 'Edit Jenis' : 'Tambah Jenis Baru'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category_id">Kategori *</Label>
                      <select
                        id="category_id"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                        required
                      >
                        <option value="">Pilih kategori</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="name">Nama Jenis *</Label>
                      <Input id="name" value={formData.name} onChange={handleNameChange} required className="bg-white" placeholder="Contoh: Keuangan" />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug (Auto)</Label>
                      <Input id="slug" value={formData.slug} disabled className="bg-gray-100" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sort_order">Urutan</Label>
                      <Input id="sort_order" type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} className="bg-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                      <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
                      {saving ? 'Menyimpan...' : (editingType ? 'Update' : 'Simpan')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>Batal</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-gray-200">
                  <CardContent className="p-4">
                    <Skeleton className="h-8 w-8 mb-2 rounded-lg" />
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : types.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="pt-6 text-center text-gray-500">
                Belum ada jenis. Klik "Tambah" untuk membuat baru.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Unassigned types */}
              {unassignedTypes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    Tanpa Kategori
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {unassignedTypes.map((type) => (
                      <Card key={type.id} className={`group bg-white border-gray-200 hover:shadow-md transition-all ${!type.is_active ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Tag className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{type.name}</h4>
                                <p className="text-xs text-gray-500">{type.slug}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEdit(type)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleToggleActive(type.id, type.is_active)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${type.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {type.is_active ? 'Aktif' : 'Non-Aktif'}
                            </span>
                            <Button
                              onClick={() => {
                                setDeleteTarget(type)
                                setDeleteDialogOpen(true)
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 p-1 h-7"
                              disabled={deletingId === type.id}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Grouped by category */}
              {groupedTypes.map(({ category, types: catTypes }) => {
                const catColor = getCategoryColor(category.color)
                return (
                  <div key={category.id}>
                    <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${category.color}`}>
                      <span className={`w-8 h-8 ${catColor.accent} rounded-lg flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">{category.name.charAt(0)}</span>
                      </span>
                      {category.name}
                      <span className="text-sm font-normal text-gray-500">({catTypes.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {catTypes.map((type) => (
                        <Card key={type.id} className={`group bg-gradient-to-br ${catColor.bg} ${catColor.border} hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${!type.is_active ? 'opacity-60' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 ${catColor.accent} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                  <Tag className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className={`font-semibold text-gray-900 text-sm ${category.color}`}>{type.name}</h4>
                                  <p className="text-xs text-gray-500">{type.slug}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => handleEdit(type)} className="p-1.5 rounded-lg bg-white/50 hover:bg-white text-gray-600 hover:text-gray-900">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleToggleActive(type.id, type.is_active)} className="p-1.5 rounded-lg bg-white/50 hover:bg-white text-gray-600 hover:text-gray-900">
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${type.is_active ? 'bg-white/80 text-gray-700' : 'bg-gray-200 text-gray-600'}`}>
                                {type.is_active ? 'Aktif' : 'Non-Aktif'}
                              </span>
                              <Button
                                onClick={() => {
                                  setDeleteTarget(type)
                                  setDeleteDialogOpen(true)
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 p-1 h-7"
                                disabled={deletingId === type.id}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus jenis?</AlertDialogTitle>
            <AlertDialogDescription>
              Jenis "{deleteTarget?.name}" akan dihapus permanen.
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
