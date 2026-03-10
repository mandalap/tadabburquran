'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('user')
  const [newPassword, setNewPassword] = useState('')
  const [roleSaving, setRoleSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, role) => {
    setRoleSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      if (response.ok) {
        fetchUsers()
        setShowRoleModal(false)
        setSelectedUser(null)
        toast.success('Role berhasil diubah')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengubah role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Gagal mengubah role')
    } finally {
      setRoleSaving(false)
    }
  }

  const handleToggleVerified = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_verified: !currentStatus })
      })
      if (response.ok) {
        fetchUsers()
        toast.success(!currentStatus ? 'User berhasil diverifikasi' : 'Verifikasi dibatalkan')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Gagal mengubah status')
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchUsers()
        toast.success('User berhasil dihapus')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Gagal menghapus user')
    } finally {
      setDeletingId(null)
    }
  }

  const openRoleModal = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setShowRoleModal(true)
  }

  const openPasswordModal = (user) => {
    setSelectedUser(user)
    setNewPassword('')
    setShowPasswordModal(true)
  }

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setPasswordSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      })
      if (response.ok) {
        setShowPasswordModal(false)
        setSelectedUser(null)
        setNewPassword('')
        toast.success('Password berhasil diubah')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengubah password')
      }
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Gagal mengubah password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'instructor': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Users</h1>
              <p className="text-gray-600">Atur role dan status user</p>
            </div>
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <p className="text-sm text-gray-500">Total Users</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <p className="text-sm text-gray-500">Admin</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.email_verified).length}
                </div>
                <p className="text-sm text-gray-500">Verified</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Cari user berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md bg-white"
            />
          </div>

          {/* Users List */}
          {loading ? (
            <Card className="border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terdaftar</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : filteredUsers.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="pt-6 text-center text-gray-500">
                {searchTerm ? 'Tidak ada user yang cocok dengan pencarian.' : 'Belum ada user.'}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terdaftar</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <span className="font-medium text-gray-900">{user.full_name || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user.email_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRoleModal(user)}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              Role
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPasswordModal(user)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              Password
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleVerified(user.id, user.email_verified)}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              {user.email_verified ? 'Unverify' : 'Verify'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDeleteTarget(user)
                                setDeleteDialogOpen(true)
                              }}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              disabled={deletingId === user.id}
                            >
                              {deletingId === user.id ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  <span>Menghapus...</span>
                                </span>
                              ) : (
                                'Hapus'
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ubah Role User</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Mengubah role untuk: <strong>{selectedUser.email}</strong>
              </p>
              <div className="space-y-3">
                <Label>Pilih Role:</Label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="user">User</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => handleRoleChange(selectedUser.id, newRole)}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    disabled={roleSaving}
                  >
                    <span className="flex items-center gap-2">
                      {roleSaving && <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />}
                      <span>{roleSaving ? 'Menyimpan...' : 'Simpan'}</span>
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRoleModal(false)
                      setSelectedUser(null)
                    }}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ubah Password User</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Mengubah password untuk: <strong>{selectedUser.email}</strong>
              </p>
              <div className="space-y-4">
                <div>
                  <Label>Password Baru</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handlePasswordChange}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    disabled={passwordSaving}
                  >
                    <span className="flex items-center gap-2">
                      {passwordSaving && <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />}
                      <span>{passwordSaving ? 'Menyimpan...' : 'Simpan'}</span>
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setSelectedUser(null)
                      setNewPassword('')
                    }}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
            <AlertDialogDescription>
              User "{deleteTarget?.email}" akan dihapus permanen.
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
