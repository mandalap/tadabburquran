'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Upload, Image as ImageIcon, Calendar } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import SearchableSelect from '@/components/ui/searchable-select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
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

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [creators, setCreators] = useState([])
  const [categories, setCategories] = useState([])
  const [courseTypes, setCourseTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    instructor: '',
    instructors: [{ creator_id: '', name: '' }],
    course_type_id: '',
    category: '',
    price: '',
    original_price: '',
    duration: '',
    event_date: '',
    cover: '',
    modules: [],
    is_published: true
  })

  useEffect(() => {
    fetchCourses()
    fetchCreators()
    fetchCategories()
    fetchCourseTypes()
  }, [])

  const fetchCourses = async () => {
    setListLoading(true)
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
      setListLoading(false)
    }
  }

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/admin/creators')
      if (response.ok) {
        const data = await response.json()
        setCreators(data.filter(c => c.is_active))
      }
    } catch (error) {
      console.error('Error fetching creators:', error)
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

  const fetchCourseTypes = async () => {
    try {
      const response = await fetch('/api/admin/course-types')
      if (response.ok) {
        const data = await response.json()
        setCourseTypes(data.filter(t => t.is_active))
      }
    } catch (error) {
      console.error('Error fetching course types:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate instructors - at least one instructor must be selected
    const hasValidInstructor = (formData.instructors || []).some(i => i.creator_id && i.creator_id.trim() !== '')

    if (!hasValidInstructor) {
      toast.error('Pilih minimal 1 instruktur dari daftar Kreator')
      return
    }
    if (!formData.category) {
      toast.error('Pilih kategori terlebih dahulu')
      return
    }
    if (!formData.course_type_id) {
      toast.error('Pilih jenis terlebih dahulu')
      return
    }

    setLoading(true)
    setSaving(true)

    try {
      const url = editingCourse
        ? `/api/admin/courses/${editingCourse.id}`
        : '/api/admin/courses'

      const method = editingCourse ? 'PUT' : 'POST'

      const selectedType = courseTypes.find(t => t.id === formData.course_type_id)
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          course_type: selectedType?.name || '',
          course_type_id: formData.course_type_id || null,
          price: parseFloat(formData.price) || 0,
          original_price: parseFloat(formData.original_price) || 0,
          instructors: (formData.instructors || []).filter(i => i.creator_id && i.creator_id.trim() !== ''),
          modules: formData.modules || [],
        })
      })

      if (response.ok) {
        setShowForm(false)
        setEditingCourse(null)
        resetForm()
        fetchCourses()
        toast.success(editingCourse ? 'Kelas berhasil diupdate!' : 'Kelas berhasil ditambahkan!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menyimpan kelas')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error('Terjadi kesalahan saat menyimpan kelas')
    } finally {
      setLoading(false)
      setSaving(false)
    }
  }

  const handleEdit = (course) => {
    setEditingId(course.id)
    setEditingCourse(course)
    let processedInstructors = [{ creator_id: '', name: '' }]
    if (course.instructors && course.instructors.length > 0) {
      processedInstructors = course.instructors.map(i => {
        const name = i.name || course.instructor || ''
        const matched = creators.find(c => c.id === i.creator_id || c.name === name)
        return {
          creator_id: matched?.id || i.creator_id || '',
          name: matched?.name || name
        }
      })
    } else if (course.instructor) {
      const creator = creators.find(c => c.name === course.instructor)
      processedInstructors = [{
        creator_id: creator?.id || '',
        name: course.instructor
      }]
    }

    let normalizedModules = course.modules || []
    if (typeof normalizedModules === 'string') {
      try {
        normalizedModules = JSON.parse(normalizedModules)
      } catch {
        normalizedModules = []
      }
    }
    if (!Array.isArray(normalizedModules)) normalizedModules = []
    normalizedModules = normalizedModules.map((module) => ({
      ...module,
      id: module.id || `module-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lessons: Array.isArray(module.lessons)
        ? module.lessons.map((lesson) => ({
          ...lesson,
          id: lesson.id || `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        }))
        : []
    }))

    const toDateInput = (value) => {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return date.toISOString().slice(0, 10)
    }

    setFormData({
      title: course.title || '',
      short_description: course.short_description || '',
      description: course.description || '',
      instructor: course.instructor || '',
      instructors: processedInstructors,
      course_type_id: course.course_type_id ? course.course_type_id.toString() : '',
      category: course.category || '',
      price: course.price || '',
      original_price: course.original_price || '',
      duration: course.duration || '',
      event_date: toDateInput(course.event_date || course.start_date || course.date),
      cover: course.cover || '',
      modules: normalizedModules,
      is_published: course.is_published !== undefined ? course.is_published : true
    })
    setShowForm(true)
    setTimeout(() => setEditingId(null), 0)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchCourses()
        toast.success('Kelas berhasil dihapus!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus kelas')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Gagal menghapus kelas')
    } finally {
      setDeletingId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      short_description: '',
      description: '',
      instructor: '',
      instructors: [{ creator_id: '', name: '' }],
      course_type_id: '',
      category: '',
      price: '',
      original_price: '',
      duration: '',
      event_date: '',
      cover: '',
      modules: [],
      is_published: true
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCourse(null)
    resetForm()
  }

  const addInstructor = () => {
    setFormData({
      ...formData,
      instructors: [...(formData.instructors || []), { creator_id: '', name: '' }]
    })
  }

  const removeInstructor = (index) => {
    if ((formData.instructors || []).length > 1) {
      setFormData({
        ...formData,
        instructors: (formData.instructors || []).filter((_, i) => i !== index)
      })
    }
  }

  const selectedCategory = categories.find(c => c.name === formData.category)
  const filteredCourseTypes = selectedCategory
    ? courseTypes.filter(t => t.category_id === selectedCategory.id)
    : courseTypes

  const updateInstructor = (index, creatorId, creatorName) => {
    const newInstructors = [...(formData.instructors || [])]
    newInstructors[index] = {
      creator_id: creatorId,
      name: creatorName
    }
    setFormData({
      ...formData,
      instructors: newInstructors,
      instructor: index === 0 ? creatorName : formData.instructor
    })
  }

  const getInstructorNames = (course) => {
    if (course.instructors && course.instructors.length > 0) {
      const validInstructors = course.instructors.filter(i => i.name && i.name.trim() !== '')
      if (validInstructors.length > 0) {
        return validInstructors.map(i => i.name).join(', ')
      }
    }
    return course.instructor || '-'
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, cover: data.url }))
        toast.success('Cover berhasil diupload!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengupload gambar')
      }
    } catch (err) {
      console.error('Error uploading cover:', err)
      toast.error('Gagal mengupload gambar')
    } finally {
      setUploadingCover(false)
    }
  }

  const removeCover = () => {
    setFormData(prev => ({ ...prev, cover: '' }))
  }

  // Module management functions
  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: '',
      lessons: []
    }
    setFormData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), newModule]
    }))
  }

  const removeModule = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      modules: (prev.modules || []).filter(m => m.id !== moduleId)
    }))
  }

  const updateModuleTitle = (moduleId, title) => {
    setFormData(prev => ({
      ...prev,
      modules: (prev.modules || []).map(m =>
        m.id === moduleId ? { ...m, title } : m
      )
    }))
  }

  const addLesson = (moduleId) => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      duration: '10:00',
      videoUrl: '',
      fileUrl: '',
      downloadUrl: '',
      externalUrl: '',
      externalDescription: '',
      isFree: false
    }
    setFormData(prev => ({
      ...prev,
      modules: (prev.modules || []).map(m =>
        m.id === moduleId
          ? { ...m, lessons: [...(m.lessons || []), newLesson] }
          : m
      )
    }))
  }

  const removeLesson = (moduleId, lessonId) => {
    setFormData(prev => ({
      ...prev,
      modules: (prev.modules || []).map(m =>
        m.id === moduleId
          ? { ...m, lessons: (m.lessons || []).filter(l => l.id !== lessonId) }
          : m
      )
    }))
  }

  const updateLesson = (moduleId, lessonId, field, value) => {
    setFormData(prev => ({
      ...prev,
      modules: (prev.modules || []).map(m =>
        m.id === moduleId
          ? {
              ...m,
              lessons: (m.lessons || []).map(l =>
                l.id === lessonId ? { ...l, [field]: value } : l
              )
            }
          : m
      )
    }))
  }

  // Extract YouTube ID from URL
  const getYoutubeId = (url) => {
    if (!url) return ''
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : ''
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Kelas</h1>
              <p className="text-gray-600">Tambah, edit, dan hapus kelas</p>
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
                  + Tambah Kelas
                </Button>
              )}
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="mb-6 border-gray-200">
              <CardHeader>
                <CardTitle>{editingCourse ? 'Edit Kelas' : 'Tambah Kelas Baru'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="title">Judul Kelas *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label>Kategori</Label>
                      <SearchableSelect
                        options={categories}
                        value={formData.category}
                        onChange={(value) => setFormData(prev => ({ ...prev, category: value, course_type_id: '' }))}
                        placeholder="Pilih kategori"
                        searchPlaceholder="Cari kategori..."
                        displayKey="name"
                        valueKey="name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Jenis</Label>
                      <SearchableSelect
                        options={filteredCourseTypes}
                        value={formData.course_type_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, course_type_id: value }))}
                        placeholder={selectedCategory ? 'Pilih jenis' : 'Pilih kategori dulu'}
                        searchPlaceholder="Cari jenis..."
                        displayKey="name"
                        valueKey="id"
                        className="mt-2"
                        disabled={!selectedCategory}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="short_description">Deskripsi Singkat *</Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                      required
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData({...formData, description: value})}
                      placeholder="Tulis deskripsi lengkap kelas, materi, atau webinar..."
                      label="Deskripsi Lengkap"
                    />
                  </div>

                  {/* Instructors Section with Creator Combobox */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <Label className="text-base font-semibold">Instruktur / Pembicara *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addInstructor}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Pilih dari daftar Kreator. Untuk webinar dengan lebih dari satu pembicara, klik Tambah.
                    </p>
                    {(formData.instructors || []).map((instructor, index) => {
                      const selectedCreator = creators.find(c => c.id === instructor.creator_id)
                      return (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mb-2 items-center">
                          <Select
                            value={instructor.creator_id}
                            onValueChange={(value) => {
                              const creator = creators.find(c => c.id === value)
                              updateInstructor(index, value, creator?.name || '')
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Pilih Kreator">
                                {selectedCreator ? (
                                  <div className="flex items-center gap-2">
                                    {selectedCreator.avatar && (
                                      <img
                                        src={selectedCreator.avatar}
                                        alt={selectedCreator.name}
                                        className="w-5 h-5 rounded-full object-cover"
                                      />
                                    )}
                                    <span className="truncate">
                                      {selectedCreator.title ? `${selectedCreator.title} ` : ''}{selectedCreator.name}
                                    </span>
                                  </div>
                                ) : (
                                  "Pilih Kreator"
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {creators.map(creator => (
                                <SelectItem key={creator.id} value={creator.id}>
                                  <div className="flex items-center gap-2">
                                    {creator.avatar && (
                                      <img
                                        src={creator.avatar}
                                        alt={creator.name}
                                        className="w-5 h-5 rounded-full object-cover"
                                      />
                                    )}
                                    <span>
                                      {creator.title ? `${creator.title} ` : ''}{creator.name}
                                      {creator.specialty && ` (${creator.specialty})`}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeInstructor(index)}
                            disabled={(formData.instructors || []).length === 1}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Harga (Rp) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="original_price">Harga Asli (Rp)</Label>
                      <Input
                        id="original_price"
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Durasi</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="Contoh: 8 minggu"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_date">Tanggal Kegiatan</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <Label>Cover Image</Label>
                    <div className="mt-2">
                      <input
                        ref={(input) => {
                          if (input && !input.dataset.setup) {
                            input.dataset.setup = 'true'
                            input.onchange = (e) => {
                              const file = e.target.files?.[0]
                              if (file) handleCoverUpload(e)
                            }
                          }
                        }}
                        type="file"
                        accept="image/*"
                        disabled={uploadingCover}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label
                        htmlFor="cover-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition ${
                          formData.cover
                            ? 'border-gray-200 bg-white'
                            : 'border-gray-300 hover:border-yellow-500 hover:bg-gray-50'
                        } ${uploadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {formData.cover ? (
                          <div className="relative w-full h-full">
                            <img
                              src={formData.cover}
                              alt="Cover preview"
                              className="w-full h-full object-contain rounded-lg"
                            />
                            {!uploadingCover && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  removeCover()
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            {uploadingCover && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                <div className="text-white text-sm">Mengupload...</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              {uploadingCover ? 'Mengupload...' : 'Klik untuk upload cover image'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Modules & Lessons Section */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-base font-semibold">Preview Materi (Modules)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addModule}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Modul
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Tambah modul dan materi pembelajaran dengan link YouTube.
                    </p>

                    {(formData.modules || []).length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Belum ada modul. Klik "Tambah Modul" untuk memulai.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(formData.modules || []).map((module, moduleIndex) => (
                          <div key={module.id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex justify-between items-center mb-3">
                              <Label className="font-medium">Modul {moduleIndex + 1}</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeModule(module.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            <Input
                              placeholder="Judul Modul (mis: Modul 1: Pendahuluan)"
                              value={module.title}
                              onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                              className="bg-white mb-3"
                            />

                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-sm text-gray-600">Materi / Lessons</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addLesson(module.id)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Tambah Materi
                              </Button>
                            </div>

                            {(!module.lessons || module.lessons.length === 0) ? (
                              <div className="text-center py-4 bg-gray-50 rounded border border-dashed">
                                <p className="text-sm text-gray-500">Belum ada materi</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div key={lesson.id} className="bg-gray-50 rounded p-3 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-sm font-medium text-gray-700">Materi {lessonIndex + 1}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeLesson(module.id, lesson.id)}
                                        className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                      <Input
                                        placeholder="Judul materi"
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                                        className="bg-white text-sm"
                                      />
                                      <Input
                                        placeholder="Durasi (mis: 12:00)"
                                        value={lesson.duration}
                                        onChange={(e) => updateLesson(module.id, lesson.id, 'duration', e.target.value)}
                                        className="bg-white text-sm"
                                      />
                                    </div>

                                    <Input
                                      placeholder="YouTube URL (mis: https://youtube.com/watch?v=...)"
                                      value={lesson.videoUrl || ''}
                                      onChange={(e) => updateLesson(module.id, lesson.id, 'videoUrl', e.target.value)}
                                      className="bg-white text-sm mb-2"
                                    />

                                    {lesson.videoUrl && getYoutubeId(lesson.videoUrl) && (
                                      <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                        </svg>
                                        <span>YouTube terdeteksi</span>
                                      </div>
                                    )}

                                    {/* File URL untuk Ebook/PDF */}
                                    <Input
                                      placeholder="File URL (PDF/Doc dari Drive, dll)"
                                      value={lesson.fileUrl || ''}
                                      onChange={(e) => updateLesson(module.id, lesson.id, 'fileUrl', e.target.value)}
                                      className="bg-white text-sm mb-2"
                                    />
                                    {lesson.fileUrl?.endsWith('.pdf') && (
                                      <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                        </svg>
                                        <span>PDF terdeteksi</span>
                                      </div>
                                    )}

                                    {/* Download URL alternatif */}
                                    <Input
                                      placeholder="Download URL (opsional)"
                                      value={lesson.downloadUrl || ''}
                                      onChange={(e) => updateLesson(module.id, lesson.id, 'downloadUrl', e.target.value)}
                                      className="bg-white text-sm mb-2"
                                    />

                                    {/* External URL untuk Webinar/Zoom */}
                                    <Input
                                      placeholder="Link Eksternal (Zoom, Webinar, dll)"
                                      value={lesson.externalUrl || ''}
                                      onChange={(e) => updateLesson(module.id, lesson.id, 'externalUrl', e.target.value)}
                                      className="bg-white text-sm mb-2"
                                    />
                                    {lesson.externalUrl && (
                                      <Input
                                        placeholder="Deskripsi link (opsional)"
                                        value={lesson.externalDescription || ''}
                                        onChange={(e) => updateLesson(module.id, lesson.id, 'externalDescription', e.target.value)}
                                        className="bg-white text-sm mb-2"
                                      />
                                    )}

                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        id={`free-${module.id}-${lesson.id}`}
                                        checked={lesson.isFree || false}
                                        onChange={(e) => updateLesson(module.id, lesson.id, 'isFree', e.target.checked)}
                                        className="w-4 h-4"
                                      />
                                      <Label htmlFor={`free-${module.id}-${lesson.id}`} className="text-sm cursor-pointer">
                                        Gratis / Preview
                                      </Label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is_published" className="cursor-pointer">Publikasikan kelas</Label>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
                      <span className="flex items-center gap-2">
                        {saving && <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />}
                        <span>{saving ? 'Menyimpan...' : (editingCourse ? 'Update' : 'Simpan')}</span>
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
          {listLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Card key={idx} className="border-gray-200">
                  <div className="aspect-[4/5] bg-gray-100 rounded-t-lg overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-2/3 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-5/6 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="pt-6 text-center text-gray-500">
                Belum ada kelas. Klik "Tambah Kelas" untuk membuat kelas baru.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {courses.map((course) => {
                // Get first instructor/creator info
                const firstInstructor = course.instructors && course.instructors.length > 0
                  ? course.instructors[0]
                  : null
                const creatorInfo = firstInstructor && firstInstructor.creator_id
                  ? creators.find(c => c.id === firstInstructor.creator_id)
                  : creators.find(c => c.name === (firstInstructor?.name || course.instructor))

                const courseDate = course.event_date || course.start_date || course.date || course.created_at
                const formattedDate = courseDate ? new Date(courseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : null
                return (
                  <Card
                    key={course.id}
                    className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/kelas/${course.slug || course.id}`)}
                  >
                    <div className="aspect-[4/5] bg-gray-100 rounded-t-lg overflow-hidden">
                      {course.cover ? (
                        <img
                          src={course.cover}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📚</div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
                        {!course.is_published && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Draft</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{course.category}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                        {course.short_description || course.description || 'Deskripsi belum tersedia'}
                      </p>

                      {/* Creator/Instructor Section */}
                      {(creatorInfo || course.instructor) && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                          {creatorInfo?.avatar ? (
                            <img
                              src={creatorInfo.avatar}
                              alt={creatorInfo.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {(creatorInfo?.name || course.instructor || 'K').charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {creatorInfo
                                ? `${creatorInfo.title ? `${creatorInfo.title} ` : ''}${creatorInfo.name}`
                                : course.instructor}
                            </p>
                            {creatorInfo && (
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= Math.round(creatorInfo.rating || 0)
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
                                  {creatorInfo.rating || 0} ({creatorInfo.reviews || 0})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm mb-3">
                        <span className="font-semibold text-blue-600">
                          Rp {(course.price || 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-gray-500 text-xs">{course.duration || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate || 'Tanggal belum diatur'}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(course)
                          }}
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          disabled={editingId === course.id}
                        >
                          {editingId === course.id ? (
                            <span className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              <span>Memuat...</span>
                            </span>
                          ) : (
                            'Edit'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(course)
                            setDeleteDialogOpen(true)
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={deletingId === course.id}
                        >
                          {deletingId === course.id ? (
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
                )
              })}
            </div>
          )}
        </div>
      </section>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kelas?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kelas "{deleteTarget?.title}" akan dihapus permanen.
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
