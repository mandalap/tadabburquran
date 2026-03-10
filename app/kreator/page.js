'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CreatorCard from '@/components/CreatorCard'
import { ArrowRight, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

const CREATOR_TYPES = [
  { value: 'all', label: 'Semua' },
  { value: 'ustadz', label: 'Ustadz' },
  { value: 'ustadzah', label: 'Ustadzah' },
  { value: 'pembicara', label: 'Pembicara' },
  { value: 'organisasi', label: 'Organisasi' },
  { value: 'lembaga', label: 'Lembaga' },
]

export default function KreatorPage() {
  const [creators, setCreators] = useState([])
  const [filteredCreators, setFilteredCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    fetchCreators()
  }, [])

  useEffect(() => {
    filterCreators()
  }, [creators, searchQuery, selectedType])

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/admin/creators')
      if (response.ok) {
        const data = await response.json()
        setCreators(data.filter(c => c.is_active))
        setFilteredCreators(data.filter(c => c.is_active))
      }
    } catch (error) {
      console.error('Error fetching creators:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCreators = () => {
    let filtered = creators

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(c => c.creator_type === selectedType)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.specialty && c.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredCreators(filtered)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-gold/5 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Temukan <span className="text-gold">Kreator</span> Terbaik
            </h1>
            <p className="text-gray-600 text-lg">
              Belajar dari ustadz, ustadzah, dan pembicara berpengalaman di berbagai bidang ilmu Islam
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Cari kreator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-gray-300"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <Filter className="w-5 h-5 text-gray-400" />
                {CREATOR_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                      selectedType === type.value
                        ? 'bg-gold text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-gray-600 text-sm">
              Menampilkan {filteredCreators.length} kreator
            </div>
          </div>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Memuat kreator...</div>
          ) : filteredCreators.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredCreators.map(creator => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada kreator ditemukan</h3>
                <p className="text-gray-600 text-sm">Coba kata kunci atau filter lain</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA for Creators */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Anda Ustadz atau Ustadzah?
            </h2>
            <p className="text-gray-300 mb-8">
              Bergabunglah menjadi kreator dan bagikan ilmu Anda kepada ribuan siswa Muslim
            </p>
            <Button size="lg" className="bg-gold hover:bg-gold-dark text-black font-semibold px-8 py-6">
              Daftar Jadi Kreator
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
