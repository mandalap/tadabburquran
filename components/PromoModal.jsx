'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function PromoModal() {
  const [promo, setPromo] = useState(null)
  const [open, setOpen] = useState(false)
  const IS_PREVIEW = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('previewPromo') === '1'

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(`/api/promo/active${IS_PREVIEW ? '?preview=1' : ''}`, { cache: 'no-store' })
        const data = await res.json()
        if (!mounted) return
        if (data && (data.enabled || IS_PREVIEW)) {
          const key = `promo:dismissed:${data.version}`
          if (IS_PREVIEW) {
            setPromo(data)
            setOpen(true)
          } else {
            const ts = localStorage.getItem(key)
            if (!ts) {
              setPromo(data)
              setOpen(true)
            } else {
              const hours = Number(data.dismissHours || 24)
              const until = new Date(Number(ts) + hours * 3600 * 1000)
              if (Date.now() > until.getTime()) {
                setPromo(data)
                setOpen(true)
              }
            }
          }
        }
      } catch {}
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  if (!promo) return null

  const markDismissed = () => {
    if (!IS_PREVIEW && promo?.version) {
      localStorage.setItem(`promo:dismissed:${promo.version}`, Date.now().toString())
    }
  }

  const handleOpenChange = (v) => {
    if (!v) {
      markDismissed()
    }
    setOpen(v)
  }

  const handleCta = () => {
    markDismissed()
    const target = (promo.ctaUrl || promo.ctaURL || promo.url || '/').trim()
    if (/^https?:\/\//i.test(target)) {
      location.assign(target)
    } else {
      const path = target.startsWith('/') ? target : `/${target}`
      location.assign(path)
    }
  }

  const dismiss = () => {
    markDismissed()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative bg-gray-100 md:h-full">
            {promo.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full min-h-[180px] flex items-center justify-center text-5xl">📣</div>
            )}
          </div>
          <div className="p-6 md:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900">{promo.title}</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">{promo.description}</DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex items-center gap-3">
              <Button className="bg-gold hover:bg-gold-dark text-black" onClick={handleCta}>
                {promo.ctaLabel || 'Lihat Detail'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
