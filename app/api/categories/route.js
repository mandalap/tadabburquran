import { queryAll } from '@/lib/db'

// GET - Fetch all active categories (public)
export async function GET() {
  try {
    // Coba ambil dengan kolom show_on_homepage
    let categories
    try {
      categories = await queryAll(
        `SELECT id, name, slug, description, icon, color, sort_order, is_active, show_on_homepage
         FROM categories
         WHERE is_active = true AND show_on_homepage = true
         ORDER BY sort_order ASC, name ASC`
      )
    } catch (e) {
      // Fallback jika kolom show_on_homepage belum ada
      categories = await queryAll(
        `SELECT id, name, slug, description, icon, color, sort_order, is_active
         FROM categories
         WHERE is_active = true
         ORDER BY sort_order ASC, name ASC`
      )
      // Tambahkan default value
      categories = categories.map(c => ({ ...c, show_on_homepage: true }))
    }

    return Response.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
