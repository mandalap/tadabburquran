import { query } from '@/lib/db'

export async function POST() {
  try {
    const sampleData = [
      {
        name: 'Rahmad',
        role: 'Pelanggan',
        message: 'Sangat puas dengan layanan yang diberikan!',
        rating: 5,
        avatar: null
      },
      {
        name: 'Aji',
        role: 'Kreator',
        message: 'Paling suka karena dashboardnya simpel. Nggak perlu baca manual panjang.',
        rating: 5,
        avatar: null
      },
      {
        name: 'Reni',
        role: 'Pelanggan',
        message: 'Fitur CHSnya keren banget! sangat mudah digunakan',
        rating: 4,
        avatar: null
      },
      {
        name: 'Daus',
        role: 'Kreator',
        message: 'Tim ruank.id sangat terbuka dan gercep jika ada kendala',
        rating: 5,
        avatar: null
      },
      {
        name: 'Melvy',
        role: 'Pelanggan',
        message: 'sayang banget belum banyak orang yang tau tentang platform ini',
        rating: 4,
        avatar: null
      }
    ]

    for (const item of sampleData) {
      await query(
        `INSERT INTO testimonials (name, role, message, rating, is_approved, is_visible)
         VALUES ($1, $2, $3, $4, true, true)
         ON CONFLICT DO NOTHING`,
        [item.name, item.role, item.message, item.rating]
      )
    }

    return Response.json({ success: true, message: 'Sample testimonials inserted' })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
