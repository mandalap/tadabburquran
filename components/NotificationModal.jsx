'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Info, Trash2, Loader2 } from 'lucide-react'

export function NotificationModal({ isOpen, onClose, title, message, type = 'info' }) {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          iconBg: 'bg-green-100',
          titleColor: 'text-green-900'
        }
      case 'error':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          iconBg: 'bg-red-100',
          titleColor: 'text-red-900'
        }
      case 'warning':
        return {
          icon: <AlertCircle className="w-12 h-12 text-amber-500" />,
          iconBg: 'bg-amber-100',
          titleColor: 'text-amber-900'
        }
      default:
        return {
          icon: <Info className="w-12 h-12 text-blue-500" />,
          iconBg: 'bg-blue-100',
          titleColor: 'text-blue-900'
        }
    }
  }

  const config = getTypeConfig()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-xl font-semibold ${config.titleColor} text-center`}>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center text-center">
          <div className={`rounded-full p-3 mb-4 ${config.iconBg}`}>
            {config.icon}
          </div>
          <DialogDescription className="text-gray-600">
            {message}
          </DialogDescription>
        </div>
        <DialogFooter className="sm:justify-center mt-4">
          <Button
            onClick={onClose}
            className={type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya', cancelText = 'Batal', type = 'danger' }) {
  const isDanger = type === 'danger'

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-xl font-semibold ${isDanger ? 'text-red-900' : 'text-gray-900'} text-center`}>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center text-center">
          <div className={`rounded-full p-3 mb-4 ${isDanger ? 'bg-red-100' : 'bg-blue-100'}`}>
            {isDanger ? (
              <Trash2 className="w-12 h-12 text-red-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-blue-500" />
            )}
          </div>
          <DialogDescription className="text-gray-600">
            {message}
          </DialogDescription>
        </div>
        <DialogFooter className="sm:justify-center gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LoadingModal({ isOpen, message = 'Memproses...' }) {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-md"
        showClose={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Loading</DialogTitle>
        <div className="flex flex-col items-center text-center py-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
