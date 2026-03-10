'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Camera, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [user, setUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: '',
    created_at: '',
    updated_at: '',
    has_password: false
  })
  const [previewImage, setPreviewImage] = useState(null)

  // Password form states
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me')
      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
      } else {
        toast.error('Gagal memuat data', {
          description: data.error || 'Silakan coba lagi'
        })
      }
    } catch (error) {
      toast.error('Terjadi kesalahan', {
        description: 'Gagal memuat data profil'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File tidak valid', {
        description: 'Harap upload file gambar'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File terlalu besar', {
        description: 'Ukuran file maksimal 5MB'
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload image
    uploadImage(file)
  }

  const uploadImage = async (file) => {
    setUploadingImage(true)

    // Show loading toast
    const toastId = toast.loading('Mengupload foto...', {
      description: 'Mohon tunggu sebentar'
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setUser(prev => ({ ...prev, avatar_url: data.avatarUrl }))
        toast.success('Foto berhasil diupload', {
          id: toastId,
          description: 'Foto profil Anda telah diperbarui'
        })
        setPreviewImage(null)
      } else {
        toast.error('Gagal upload foto', {
          id: toastId,
          description: data.error || 'Silakan coba lagi'
        })
        setPreviewImage(null)
      }
    } catch (error) {
      toast.error('Terjadi kesalahan', {
        id: toastId,
        description: 'Gagal upload foto'
      })
      setPreviewImage(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName')
    const phone = formData.get('phone')
    const bio = formData.get('bio')

    setSaving(true)

    // Show loading toast
    const toastId = toast.loading('Menyimpan perubahan...', {
      description: 'Mohon tunggu sebentar'
    })

    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          bio
        })
      })

      const data = await res.json()

      if (res.ok) {
        setUser(prev => ({ ...prev, ...data.user }))
        toast.success('Profil berhasil diperbarui', {
          id: toastId,
          description: 'Perubahan profil Anda telah disimpan'
        })
      } else {
        toast.error('Gagal memperbarui profil', {
          id: toastId,
          description: data.error || 'Silakan coba lagi'
        })
      }
    } catch (error) {
      toast.error('Terjadi kesalahan', {
        id: toastId,
        description: 'Gagal memperbarui profil'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword')
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    // Check if user has password (OAuth user or not)
    const userHasPassword = user.has_password

    // Validation
    if (userHasPassword && !currentPassword) {
      setPasswordError('Password saat ini harus diisi')
      return
    }

    if (!newPassword || !confirmPassword) {
      setPasswordError('Password baru dan konfirmasi harus diisi')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru dan konfirmasi tidak cocok')
      return
    }

    setChangingPassword(true)

    // Show loading toast
    const toastId = toast.loading(userHasPassword ? 'Mengubah password...' : 'Membuat password...', {
      description: 'Mohon tunggu sebentar'
    })

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: userHasPassword ? currentPassword : null,
          newPassword,
          isSettingPassword: !userHasPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        // Update user state
        setUser(prev => ({ ...prev, has_password: true, updated_at: new Date().toISOString() }))

        toast.success(data.message || 'Password berhasil diperbarui', {
          id: toastId,
          description: userHasPassword
            ? 'Password Anda telah diubah'
            : 'Anda sekarang bisa login dengan email dan password'
        })
        setShowPasswordForm(false)
        // Reset form
        e.currentTarget.reset()
      } else {
        setPasswordError(data.error || 'Gagal memperbarui password')
        toast.error('Gagal memperbarui password', {
          id: toastId,
          description: data.error || 'Silakan coba lagi'
        })
      }
    } catch (error) {
      toast.error('Terjadi kesalahan', {
        id: toastId,
        description: 'Gagal memperbarui password'
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
  }

  // Skeleton Component
  const ProfileSkeleton = () => (
    <div className="animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>

      {/* Avatar Card Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-56"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Edit Profile Card Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Password Card Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-40"></div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <ProfileSkeleton />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <button
              className="text-amber-600 hover:text-amber-700 mb-6 inline-flex items-center transition-colors"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Kembali
            </button>

            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Profil</h1>
              <p className="text-gray-600 mt-1">Kelola informasi akun Anda</p>
            </div>

            {/* Profile Card with Avatar */}
            <Card className="bg-white border-gray-200 mb-6 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={previewImage || user.avatar_url}
                        alt={user.full_name || 'User'}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 text-2xl font-bold border-2 border-amber-200">
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Upload button overlay */}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  <div className="text-center sm:text-left flex-1">
                    <div className="text-xl font-semibold text-gray-900">{user.full_name || 'Pengguna'}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    {user.created_at && (
                      <div className="text-xs text-amber-600 mt-1">Bergabung {formatDate(user.created_at)}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-600">Edit Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-900">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      defaultValue={user.full_name || ''}
                      placeholder="Masukkan nama lengkap"
                      className="bg-white border-gray-300 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      className="bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-900">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={user.phone || ''}
                      placeholder="+62 812 3456 7890"
                      className="bg-white border-gray-300 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-900">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      defaultValue={user.bio || ''}
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                      rows={4}
                      className="bg-white border-gray-300 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 resize-none"
                      disabled={saving}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-lg shadow-amber-900/20 transition-all duration-300"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </span>
                    ) : 'Simpan Perubahan'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="bg-white border-gray-200 shadow-sm mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-600 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Keamanan Akun
                  </CardTitle>
                  {!showPasswordForm && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordForm(true)}
                      className="border-amber-600 text-amber-600 hover:bg-amber-50"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {user.has_password ? 'Ubah Password' : 'Buat Password'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showPasswordForm ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {passwordError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {passwordError}
                      </div>
                    )}

                    {!user.has_password && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                        <p className="font-medium mb-1">Buat Password untuk Akun Anda</p>
                        <p className="text-xs">Anda login dengan Google. Buat password agar bisa login dengan email dan password di lain waktu.</p>
                      </div>
                    )}

                    {user.has_password && (
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-gray-900">Password Saat Ini</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Masukkan password saat ini"
                            className="bg-white border-gray-300 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 pr-10"
                            disabled={changingPassword}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-900">
                        {user.has_password ? 'Password Baru' : 'Password'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Masukkan password baru (minimal 6 karakter)"
                          className="bg-white border-gray-300 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 pr-10"
                          disabled={changingPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-900">Konfirmasi Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Ulangi password"
                          className="bg-white border-gray-300 text-gray-900 focus:border-amber-400 focus:ring-amber-400/20 pr-10"
                          disabled={changingPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-lg shadow-amber-900/20 transition-all duration-300"
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {user.has_password ? 'Mengubah...' : 'Membuat...'}
                          </span>
                        ) : user.has_password ? 'Simpan Password' : 'Buat Password'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordError('')
                        }}
                        className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={changingPassword}
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.has_password ? 'bg-green-100' : 'bg-amber-100'}`}>
                        <Lock className={`w-5 h-5 ${user.has_password ? 'text-green-600' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Password</div>
                        {user.has_password ? (
                          <div className="text-sm text-gray-500">••••••••</div>
                        ) : (
                          <div className="text-sm text-amber-600">Belum diatur (login dengan Google)</div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {user.has_password
                        ? `Terakhir diubah: ${user.updated_at ? formatDate(user.updated_at) : 'Belum pernah'}`
                        : 'Login dengan Google'
                      }
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
