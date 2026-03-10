'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function AdminPromoPage() {
  const [form, setForm] = useState({
    enabled: false,
    title: '',
    description: '',
    imageUrl: '',
    ctaLabel: 'Lihat Detail',
    ctaUrl: '/',
    dismissHours: 24,
    startAt: '',
    endAt: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/promo')
        const data = await res.json()
        if (data) {
          setForm({
            enabled: !!data.enabled,
            title: data.title || '',
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            ctaLabel: data.ctaLabel || 'Lihat Detail',
            ctaUrl: data.ctaUrl || '/',
            dismissHours: data.dismissHours || 24,
            startAt: data.startAt ? new Date(data.startAt).toISOString().slice(0,16) : '',
            endAt: data.endAt ? new Date(data.endAt).toISOString().slice(0,16) : ''
          })
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const save = async () => {
    setSaving(true)
    const id = toast.loading('Menyimpan...')
    try {
      // Normalize CTA on client to reduce risk of kosong
      const normalizeCta = (v) => {
        let out = String(v || '').trim()
        if (!out) out = '/'
        if (!/^(https?:\/\/|\/)/i.test(out)) out = `/${out}`
        return out
      }
      const cta = normalizeCta(form.ctaUrl)

      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: form.enabled,
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl,
          ctaLabel: form.ctaLabel,
          ctaUrl: cta,
          dismissHours: Number(form.dismissHours || 24),
          startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
          endAt: form.endAt ? new Date(form.endAt).toISOString() : null
        })
      })
      if (res.ok) {
        toast.success('Promo tersimpan', { id })
        // Re-fetch saved data to ensure form shows normalized URL
        try {
          const r = await fetch('/api/admin/promo')
          const d = await r.json()
          setForm(prev => ({
            ...prev,
            enabled: !!d.enabled,
            title: d.title || '',
            description: d.description || '',
            imageUrl: d.imageUrl || '',
            ctaLabel: d.ctaLabel || 'Lihat Detail',
            ctaUrl: d.ctaUrl || '/',
            dismissHours: d.dismissHours || 24,
            startAt: d.startAt ? new Date(d.startAt).toISOString().slice(0,16) : '',
            endAt: d.endAt ? new Date(d.endAt).toISOString().slice(0,16) : ''
          }))
        } catch {}
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || 'Gagal menyimpan', { id })
      }
    } catch {
      toast.error('Gagal menyimpan', { id })
    } finally {
      setSaving(false)
    }
  }

  const preview = async () => {
    await save()
    window.open('/?previewPromo=1', '_blank')
  }

  const uploadImage = async (file) => {
    if (!file) return
    setUploading(true)
    const id = toast.loading('Mengunggah gambar...')
    try {
      const data = new FormData()
      data.append('file', file)
      if (form.imageUrl) data.append('oldImage', form.imageUrl)
      const res = await fetch('/api/admin/promo/upload', {
        method: 'POST',
        body: data
      })
      const json = await res.json()
      if (res.ok && json.url) {
        setForm(prev => ({ ...prev, imageUrl: json.url }))
        toast.success('Gambar diunggah', { id })
      } else {
        toast.error(json.error || 'Gagal upload', { id })
      }
    } catch {
      toast.error('Gagal upload', { id })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gold">Pengaturan Promo Popup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-gray-600">Memuat...</div>
                ) : (
                  <>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" name="enabled" checked={form.enabled} onChange={onChange} />
                      <span>Aktifkan popup</span>
                    </label>
                    <div>
                      <Label>Judul</Label>
                      <Input name="title" value={form.title} onChange={onChange} />
                    </div>
                    <div>
                      <Label>Deskripsi</Label>
                      <textarea name="description" value={form.description} onChange={onChange} className="w-full border rounded-md p-2 min-h-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Gambar</Label>
                      {form.imageUrl ? (
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={form.imageUrl} alt="Promo" className="w-40 h-24 object-cover rounded border" />
                          <Button variant="outline" onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}>
                            Hapus
                          </Button>
                        </div>
                      ) : null}
                      <input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} disabled={uploading} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Teks Tombol</Label>
                        <Input name="ctaLabel" value={form.ctaLabel} onChange={onChange} />
                      </div>
                      <div>
                        <Label>Link Tombol</Label>
                        <Input name="ctaUrl" value={form.ctaUrl} onChange={onChange} placeholder="/kelas/slug-anda" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Mulai Tayang</Label>
                        <Input type="datetime-local" name="startAt" value={form.startAt} onChange={onChange} />
                      </div>
                      <div>
                        <Label>Akhir Tayang</Label>
                        <Input type="datetime-local" name="endAt" value={form.endAt} onChange={onChange} />
                      </div>
                    </div>
                    <div>
                      <Label>Tunda Tampil Kembali (jam)</Label>
                      <Input type="number" name="dismissHours" value={form.dismissHours} onChange={onChange} min={1} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={preview} disabled={saving || uploading}>Lihat Preview Popup</Button>
                      <Button onClick={save} disabled={saving} className="bg-gold text-black hover:bg-gold-dark">Simpan</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
