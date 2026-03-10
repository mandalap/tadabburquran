import { queryOne } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const email = 'admin@tadabburquran.id'
    const password = 'Admin@123!'
    const fullName = 'Administrator'

    // Cek apakah admin sudah ada
    const existingAdmin = await queryOne(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (existingAdmin) {
      return Response.json({
        success: false,
        message: 'Admin user already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat admin user
    const admin = await queryOne(
      `INSERT INTO users (email, password_hash, full_name, role, email_verified)
       VALUES ($1, $2, $3, 'admin', true)
       RETURNING id, email, full_name, role, created_at`,
      [email, hashedPassword, fullName]
    )

    return Response.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        email: admin.email,
        password: password, // Hanya ditampilkan sekali ini
        fullName: admin.full_name
      }
    })
  } catch (error) {
    return Response.json({
      success: false,
      message: 'Error creating admin user',
      error: error.message
    }, { status: 500 })
  }
}
