import { queryOne, queryAll } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    // Cek autentikasi dan role admin
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Ambil statistik dari database
    const [
      usersCount,
      coursesCount,
      testimonialsCount,
      ordersCount,
      creatorsCount,
      revenueData,
      recentOrders,
      pendingTestimonials,
      totalStudents,
      recentUsers,
      pendingTestimonialsList,
      popularCourses
    ] = await Promise.all([
      queryOne('SELECT COUNT(*) as count FROM users').then(r => parseInt(r.count) || 0),
      queryOne('SELECT COUNT(*) as count FROM courses WHERE is_published = true').then(r => parseInt(r.count) || 0),
      queryOne('SELECT COUNT(*) as count FROM testimonials WHERE is_visible = true').then(r => parseInt(r.count) || 0),
      queryOne('SELECT COUNT(*) as count FROM orders').then(r => parseInt(r.count) || 0),
      queryOne('SELECT COUNT(*) as count FROM creators WHERE is_active = true').then(r => parseInt(r.count) || 0),
      queryOne('SELECT COALESCE(SUM(price), 0) as total FROM orders WHERE payment_status = $1', ['paid']).then(r => parseInt(r.total) || 0),
      queryAll('SELECT id, course_name, price, payment_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5'),
      queryOne('SELECT COUNT(*) as count FROM testimonials WHERE is_visible = false').then(r => parseInt(r.count) || 0),
      queryOne('SELECT COALESCE(SUM(students), 0) as total FROM courses WHERE is_published = true').then(r => parseInt(r.total) || 0),
      queryAll('SELECT id, full_name as name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'),
      queryAll('SELECT id, name, message, created_at FROM testimonials WHERE is_visible = false ORDER BY created_at DESC LIMIT 5'),
      queryAll('SELECT id, title, students, instructor, price, category FROM courses WHERE is_published = true ORDER BY students DESC LIMIT 5'),
    ])

    return Response.json({
      users: usersCount,
      courses: coursesCount,
      testimonials: testimonialsCount,
      orders: ordersCount,
      creators: creatorsCount,
      revenue: revenueData,
      pendingTestimonials: pendingTestimonials,
      totalStudents: totalStudents,
      recentOrders: recentOrders,
      recentUsers: recentUsers,
      pendingTestimonialsList: pendingTestimonialsList,
      popularCourses: popularCourses
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return Response.json({
      error: 'Internal server error',
      users: 0,
      courses: 0,
      testimonials: 0,
      orders: 0,
      creators: 0,
      revenue: 0,
      pendingTestimonials: 0,
      totalStudents: 0,
      recentOrders: [],
      recentUsers: [],
      pendingTestimonialsList: [],
      popularCourses: []
    }, { status: 500 })
  }
}
