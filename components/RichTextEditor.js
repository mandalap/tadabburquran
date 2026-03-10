'use client'

import { useEffect, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
  Trash2
} from 'lucide-react'

export default function RichTextEditor({ value, onChange, placeholder = 'Tulis deskripsi lengkap...', label = 'Deskripsi Lengkap' }) {
  const editorRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const isInitialized = useRef(false)

  // Hanya inisialisasi sekali saat pertama kali mount
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || ''
      isInitialized.current = true

      // Tambahkan event listener untuk membuat gambar resizable
      const images = editorRef.current.querySelectorAll('img')
      images.forEach(img => {
        img.style.maxWidth = '100%'
        img.style.maxHeight = '500px'
        img.style.cursor = 'pointer'
        img.title = 'Klik untuk mengatur ukuran'

        img.onclick = () => {
          const currentWidth = img.style.width || img.width + 'px'
          const newWidth = prompt('Masukkan lebar gambar (contoh: 300px, 50%, 100%):', currentWidth)
          if (newWidth) {
            img.style.width = newWidth
            img.style.maxWidth = newWidth.includes('%') ? '100%' : newWidth
            img.style.height = 'auto'
            handleChange()
          }
        }
      })
    }
  }, [])

  const execCommand = (command, val = null) => {
    document.execCommand(command, false, val)
    editorRef.current?.focus()
    handleChange()
  }

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleLink = () => {
    const url = prompt('Masukkan URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const handleImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          execCommand('insertImage', data.url)

          // Set ukuran default dan tambahkan event click untuk resize
          setTimeout(() => {
            const images = editorRef.current?.querySelectorAll('img')
            if (images) {
              images.forEach(img => {
                img.style.maxWidth = '100%'
                img.style.maxHeight = '500px'
                img.style.cursor = 'pointer'
                img.title = 'Klik untuk mengatur ukuran'

                img.onclick = () => {
                  const currentWidth = img.style.width || img.width + 'px'
                  const newWidth = prompt('Masukkan lebar gambar (contoh: 300px, 50%, 100%):', currentWidth)
                  if (newWidth) {
                    img.style.width = newWidth
                    img.style.maxWidth = newWidth.includes('%') ? '100%' : newWidth
                    img.style.height = 'auto'
                    handleChange()
                  }
                }
              })
            }
          }, 100)
        } else {
          const error = await response.json()
          alert(error.error || 'Gagal mengupload gambar')
        }
      } catch (err) {
        console.error('Error uploading image:', err)
        alert('Gagal mengupload gambar')
      } finally {
        setUploading(false)
      }
    }
    input.click()
  }

  const ToolbarButton = ({ icon: Icon, onClick, title, isActive = false, disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition ${
        isActive ? 'bg-gray-200' : ''
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  const ToolbarSeparator = () => (
    <div className="w-px h-6 bg-gray-300 mx-1" />
  )

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white relative">
      {label && <Label className="px-3 pt-3 pb-1 block">{label}</Label>}

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Undo/Redo */}
        <ToolbarButton icon={Undo} onClick={() => execCommand('undo')} title="Undo" />
        <ToolbarButton icon={Redo} onClick={() => execCommand('redo')} title="Redo" />
        <ToolbarSeparator />

        {/* Text Formatting */}
        <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold" />
        <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic" />
        <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Underline" />
        <ToolbarButton icon={Strikethrough} onClick={() => execCommand('strikeThrough')} title="Strikethrough" />
        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton icon={Heading1} onClick={() => execCommand('formatBlock', '<h1>')} title="Heading 1" />
        <ToolbarButton icon={Heading2} onClick={() => execCommand('formatBlock', '<h2>')} title="Heading 2" />
        <ToolbarButton icon={Heading3} onClick={() => execCommand('formatBlock', '<h3>')} title="Heading 3" />
        <ToolbarButton icon={Code} onClick={() => execCommand('formatBlock', '<pre>')} title="Code Block" />
        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
        <ToolbarButton icon={ListOrdered} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />
        <ToolbarSeparator />

        {/* Alignment */}
        <ToolbarButton icon={AlignLeft} onClick={() => execCommand('justifyLeft')} title="Align Left" />
        <ToolbarButton icon={AlignCenter} onClick={() => execCommand('justifyCenter')} title="Align Center" />
        <ToolbarButton icon={AlignRight} onClick={() => execCommand('justifyRight')} title="Align Right" />
        <ToolbarSeparator />

        {/* Quote */}
        <ToolbarButton icon={Quote} onClick={() => execCommand('formatBlock', '<blockquote>')} title="Quote" />
        <ToolbarSeparator />

        {/* Link & Image */}
        <ToolbarButton icon={LinkIcon} onClick={handleLink} title="Insert Link" />
        <ToolbarButton
          icon={Image}
          onClick={handleImage}
          title="Insert Image"
          disabled={uploading}
        />
        <ToolbarSeparator />

        {/* Clear Formatting */}
        <ToolbarButton icon={Trash2} onClick={() => execCommand('removeFormat')} title="Clear Formatting" />
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleChange}
          onBlur={handleChange}
          dir="ltr"
          className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto focus:outline-none prose prose-sm max-w-none text-left"
          style={{
            minHeight: '200px'
          }}
          suppressContentEditableWarning
        />

        {/* Placeholder */}
        {(!value || value === '<p></p>' || value === '<p><br></p>') && (
          <div className="absolute pointer-events-none text-gray-400 top-4 left-4">
            {placeholder}
          </div>
        )}
      </div>

      <style jsx>{`
        .prose p { margin-bottom: 0.5em; }
        .prose h1, .prose h2, .prose h3 { margin-top: 0.5em; margin-bottom: 0.5em; font-weight: bold; }
        .prose h1 { font-size: 1.5em; }
        .prose h2 { font-size: 1.3em; }
        .prose h3 { font-size: 1.1em; }
        .prose ul, .prose ol { margin-left: 1.5em; margin-bottom: 0.5em; }
        .prose li { margin-bottom: 0.25em; }
        .prose img { max-width: 100%; height: auto; max-height: 500px; width: auto; object-fit: contain; border-radius: 8px; margin: 1em 0; display: block; }
        .prose a { color: rgb(234 179 8); text-decoration: underline; }
        .prose blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; font-style: italic; color: #6b7280; }
        .prose pre { background: #f3f4f6; padding: 1em; border-radius: 4px; overflow-x: auto; }
        .prose blockquote p { margin-bottom: 0; }
      `}</style>
    </div>
  )
}
