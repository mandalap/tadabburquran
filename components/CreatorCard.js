import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Users, BookOpen } from 'lucide-react'

export default function CreatorCard({ creator }) {
  const getCreatorTypeLabel = (type) => {
    const labels = {
      'ustadz': 'Ustadz',
      'ustadzah': 'Ustadzah',
      'pembicara': 'Pembicara',
      'organisasi': 'Organisasi',
      'lembaga': 'Lembaga'
    }
    return labels[type] || 'Kreator'
  }

  return (
    <Link href={`/kreator/${creator.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-gray-200 cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-3 border-gold/20 mb-3 group-hover:border-gold/40 transition-colors">
              <AvatarImage src={creator.avatar} alt={ [creator.gelar_depan, creator.name].filter(Boolean).join(" ") } />
              <AvatarFallback className="bg-gold/20 text-gold text-xl font-bold">
                {creator.name?.charAt(0) || 'K'}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <h3 className="font-semibold text-gray-900 text-base mb-1 group-hover:text-gold transition-colors">
              { [creator.gelar_depan, creator.name].filter(Boolean).join(" ") }
            </h3>

            {/* Type Badge */}
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-2 capitalize">
              {getCreatorTypeLabel(creator.creator_type)}
            </span>

            {/* Specialty */}
            {creator.specialty && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-1">{creator.specialty}</p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
              {creator.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{creator.rating}</span>
                </div>
              )}
              {creator.students_count > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{creator.students_count.toLocaleString('id-ID')}</span>
                </div>
              )}
              {creator.courses_count > 0 && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{creator.courses_count}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
